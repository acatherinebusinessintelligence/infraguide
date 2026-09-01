const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  location: { hash: '' },
  dispatchEvent() {},
};

const { getState, selectWorkCase, hydrateFromStorage, applyPersistedPayload } = await import('../src/state/appState.js');
const { getConcept, insufficientConceptIds, glossaryTerms } = await import('../src/data/pedagogy/index.js');
const { expectedFromFacts, resolveCaseFacts, mergeMeasure, createMeasureState } = await import('../src/state/measureModel.js');
const { getSelectedCaseData } = await import('../src/state/appState.js');
const { assessInterpretation, composeInterpretation, storageThresholdMonths, traceStepsForMetric } = await import(
  '../src/state/pedagogyModel.js'
);
const { persistTrace, persistMetricFinding, validateInterpretation } = await import('../src/state/pedagogyActions.js');
const { generateConsultingReport } = await import('../src/report/index.js');
const { buildExportModel } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { createExportConfig } = await import('../src/data/methodology/export.js');
const { buildPersistablePayload } = await import('../src/state/persistence/payload.js');
const { getCaseById } = await import('../src/data/cases/index.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');

const caseData = getSelectedCaseData() || getCaseById('modelo-helados-boreal');
const facts = resolveCaseFacts(caseData);
const expected = expectedFromFacts(facts);

assert(Math.abs(expected.availabilityPercent - 99.51) < 0.02, `Disponibilidad esperada ≈ 99,51, obtuvo ${expected.availabilityPercent}`);
assert(Math.abs(expected.mttrHours - 2.13) < 0.03, `MTTR esperado ≈ 2,13 h, obtuvo ${expected.mttrHours}`);
assert(Math.abs(expected.storageUsedPercent - 80) < 0.2, `Uso esperado 80 %, obtuvo ${expected.storageUsedPercent}`);
const threshold = storageThresholdMonths(facts);
assert(threshold && Math.abs(threshold.months - 1.85) < 0.05, `Umbral 85 % ≈ 1,85 meses, obtuvo ${threshold?.months}`);

const availability = getConcept('availability');
assert(availability.what && availability.whatFor && availability.why, 'Disponibilidad explica qué, para qué y por qué');
assert(availability.formula.includes('Tiempo total'), 'Fórmula de disponibilidad presente');
assert(availability.workedExample?.length >= 3, 'Ejemplo resuelto de disponibilidad');

const mttr = getConcept('mttr');
assert(mttr.formula.includes('Número de incidentes'), 'Fórmula MTTR');
assert(/RTO|máximo/i.test(mttr.commonError), 'Error común de MTTR');

const storage = getConcept('storage');
assert(storage.formula.includes('usado'), 'Fórmula de utilización');

const mttd = getConcept('mttd');
assert(mttd.calculable === false && !mttd.formula, 'MTTD no muestra fórmula resoluble');
assert(insufficientConceptIds.includes('rto'), 'RTO está en indicadores insuficientes');
assert(insufficientConceptIds.includes('risk-score'), 'Puntuación de riesgo no se inventa');
assert(insufficientConceptIds.includes('alternatives') || getConcept('alternatives').insufficientReason, 'Alternativas ponderadas no se fingen con datos del PDF');

assert(glossaryTerms.length >= 30, `Glosario incompleto: ${glossaryTerms.length}`);
assert(glossaryTerms.some((item) => item.id === 'spof'), 'Glosario incluye SPOF');
assert(glossaryTerms.some((item) => item.id === 'criterio-aceptacion'), 'Glosario incluye criterio de aceptación');

const incomplete = assessInterpretation({ resultOf: 'disponibilidad', indicates: 'ok' });
assert(incomplete.status === 'PARCIALMENTE CORRECTO', `Interpretación incompleta: ${incomplete.status}`);

const confused = assessInterpretation({
  resultOf: 'disponibilidad',
  indicates: 'el SLA se cumple y es excelente',
  during: '90 días',
  affects: 'ERP',
  because: 'el porcentaje es alto',
  limitation: 'mezcla servicios',
  recommend: 'migrar a cloud',
  improvedWhen: 'compre ya',
});
assert(confused.status === 'NO CONFUNDIR', `Debió marcar NO CONFUNDIR, obtuvo ${confused.status}`);

const composed = composeInterpretation({
  resultOf: 'disponibilidad',
  indicates: 'el registro estuvo operativo la mayor parte del periodo',
  during: '90 días',
  affects: 'varios servicios',
  because: 'el denominador mezcla incidentes',
  limitation: 'no es un SLA por servicio',
  recommend: 'medir por servicio',
  improvedWhen: 'exista serie homogénea del siguiente periodo',
});
assert(composed.includes('limitación'), 'Texto compuesto incluye limitación');

const availSteps = traceStepsForMetric('availability', facts);
assert(availSteps.some((item) => item.includes('99.51') || item.includes('99,51') || item.includes('99.5')), `Pasos de disponibilidad: ${availSteps.join(' | ')}`);

persistTrace('availability');
persistTrace('mttr');
persistTrace('storage');
const traces = getState().analysis.measure.traces;
assert(traces.availability?.calculationId, 'CalculationTrace de disponibilidad');
assert(traces.availability.formula, 'Trace guarda fórmula');
assert(traces.availability.inputs?.length >= 2, 'Trace guarda variables');
assert(traces.mttr.result?.unit === 'h', 'Trace MTTR con unidad');
assert(traces.storage.limitations?.length, 'Trace de almacenamiento con limitaciones');

getState().analysis.measure.availability.interpretationParts = {
  resultOf: 'disponibilidad',
  indicates: 'el periodo observado no equivale a un SLA',
  during: '90 días',
  affects: 'varios servicios del registro',
  because: 'los incidentes no son un único servicio',
  limitation: 'la suma mezcla alcances',
  recommend: 'separar medición por servicio',
  improvedWhen: 'haya registro homogéneo',
};
const assessment = validateInterpretation('availability');
assert(assessment.status === 'CORRECTO', `Validación: ${assessment.status} ${assessment.message}`);

getState().analysis.measure.mttr.findingFromMetric = {
  condition: 'MTTR global ≈ 2,13 h',
  evidence: 'Suma de duraciones / 5 incidentes',
  criterion: 'No hay RTO formal',
  cause: 'Duraciones heterogéneas',
  impact: 'Servicios distintos según el incidente',
  risk: 'Usar el promedio como máximo de recuperación',
  recommendation: 'Medir por servicio',
  acceptance: 'MTTR por servicio en el siguiente periodo',
};
persistMetricFinding('mttr');

const payload = buildPersistablePayload(getState());
assert(payload.analysis.measure.traces.availability.calculationId, 'Trace persiste en payload');
const revived = mergeMeasure(payload.analysis.measure);
assert(revived.traces.availability.calculationId === traces.availability.calculationId, 'mergeMeasure conserva traces');
assert(revived.availability.interpretationParts.limitation, 'mergeMeasure conserva interpretación');

applyPersistedPayload(payload, { persist: false, keepView: true });
assert(getState().analysis.measure.traces.mttr.calculationId, 'Recarga conserva CalculationTrace');

const report = generateConsultingReport(getState());
const { html } = HtmlExporter(buildExportModel(getState(), createExportConfig()));
const forbidden = [
  'Constructor de interpretación',
  'Preguntas orientadoras',
  'Ver ejemplo resuelto',
  'Nivel 1 · Comprender',
  'Ejemplo guiado',
  'Trabajo del estudiante',
  'Calculadora guiada',
];
forbidden.forEach((needle) => {
  assert(!html.includes(needle), `El informe profesional no debe incluir «${needle}»`);
});
assert(report.executiveOpinion && Array.isArray(report.findings), 'Informe de consultoría generado');

console.log('simulate-pedagogy: OK');
console.log({
  availability: expected.availabilityPercent,
  mttrHours: expected.mttrHours,
  storageUsedPercent: expected.storageUsedPercent,
  thresholdMonths: threshold.months,
  traces: Object.keys(getState().analysis.measure.traces),
});

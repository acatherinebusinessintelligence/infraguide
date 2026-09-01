import { mkdir, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

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

const { getState, patchState, selectWorkCase, hydrateFromStorage } = await import('../src/state/appState.js');
const { FINDING_STATUS } = await import('../src/data/methodology/diagnose.js');
const { GOVERN_STATUS } = await import('../src/data/methodology/govern.js');
const { DECISION_STATUS } = await import('../src/data/methodology/decide.js');
const { METRIC_STATUS } = await import('../src/data/methodology/measure.js');
const { generateConsultingReport, validateConsultingReport, INSUFFICIENT, CONSULTING_SECTION_KEYS } = await import(
  '../src/report/index.js'
);
const { buildExportModel, modelHasTechnicalIds } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { packDocx, docxFileName } = await import('../src/export/docxExporter.js');
const { exportBaseName } = await import('../src/export/text.js');
const { createExportConfig } = await import('../src/data/methodology/export.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function govBase(findingId, extra) {
  return { findingId, sources: ['Diagnóstico'], sourceSections: ['findings'], status: GOVERN_STATUS.DOCUMENTED, ...extra };
}

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');

const findings = [
  {
    findingId: 'finding-01',
    title: 'ERP-APP01 degrada el cierre comercial (CPU 92 % y 4,8 s)',
    category: 'performance',
    evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'],
    impact: 'Facturación y despacho lentos durante el pico del 28 de agosto.',
    criticality: 'high',
    justification: 'Pico documentado de CPU, latencia y demanda concurrente.',
    description: 'ERP-APP01 alcanzó 92 % de CPU y 4,8 s de respuesta con 181 usuarios concurrentes.',
    status: FINDING_STATUS.DOCUMENTED,
  },
  {
    findingId: 'finding-02',
    title: 'NAS-01 al 80 % con crecimiento de 650 GB/mes',
    category: 'storage',
    evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin'],
    impact: 'Riesgo de saturación si el crecimiento se mantiene.',
    criticality: 'high',
    justification: 'Capacidad y uso de NAS-01 están en el caso; el margen es cálculo.',
    description: 'NAS-01: 19,2 TB de 24 TB. Crecimiento 650 GB/mes.',
    status: FINDING_STATUS.DOCUMENTED,
  },
  {
    findingId: 'finding-03',
    title: 'FW-01 es instancia única de perímetro',
    category: 'dependency',
    evidenceIds: ['ev-firewall-unique', 'ev-inc-b'],
    impact: 'La VPN de sedes queda incomunicada si FW-01 falla.',
    criticality: 'critical',
    justification: 'Un firewall principal y el incidente de 1 h 35 min.',
    description: 'Existe un único firewall principal (FW-01).',
    status: FINDING_STATUS.DOCUMENTED,
  },
  {
    findingId: 'finding-04',
    title: 'Baja tardía de cuentas de exempleados',
    category: 'security',
    evidenceIds: ['ev-stale-accounts'],
    impact: 'Cuentas privilegiadas o de usuario pueden permanecer activas tras el retiro.',
    criticality: 'high',
    justification: 'Revisión de agosto: cuatro cuentas deshabilitadas entre 12 y 27 días después.',
    description: 'Cuatro cuentas de exempleados se deshabilitaron tarde.',
    status: FINDING_STATUS.DOCUMENTED,
  },
  {
    findingId: 'finding-05',
    title: 'Cambio ERP sin plan de reversa',
    category: 'operation',
    evidenceIds: ['ev-inc-e'],
    impact: 'Un cambio incompatible afecta el servicio sin rollback documentado.',
    criticality: 'medium',
    justification: 'El incidente de actualización no incluía riesgo, pruebas ni reversa.',
    description: 'Actualización de conector ERP sin plan de reversa.',
    status: FINDING_STATUS.DOCUMENTED,
  },
].map((item) => ({ ...item, sources: ['Caso'], sourceSections: ['findings'] }));

const recs = [
  {
    decisionId: 'dec-01',
    findingIds: ['finding-03'],
    evidenceIds: ['ev-firewall-unique'],
    decision: 'Diseñar failover de perímetro compatible con la VPN actual, sin fijar marca.',
    title: 'Resiliencia de FW-01',
    impact: 'VPN de sedes.',
    benefitText: 'Eliminar el punto único de falla de perímetro.',
    riskText: 'Complejidad de recorte y compatibilidad.',
    costModel: 'capex',
    costJustification: 'Valor de referencia del segundo firewall en el caso.',
    metricIds: ['availability'],
    metricText: 'Disponibilidad de VPN de sedes.',
    metricTarget: 'Failover ensayado con evidencia de conmutación.',
    priority: 'immediate',
    justification: 'FW-01 es único y ya interrumpió la VPN.',
    alternatives: [{ title: 'Mantener FW-01 único' }, { title: 'Failover de perímetro' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-02',
    findingIds: ['finding-02'],
    evidenceIds: ['ev-storage-used'],
    decision: 'Retención/archivado y ampliación planificada de NAS-01.',
    title: 'Capacidad de almacenamiento',
    impact: 'Saturación de archivos e imágenes.',
    benefitText: 'Anticipar umbral de uso.',
    riskText: 'Pérdida si la retención se aplica mal.',
    costModel: 'mixed',
    costJustification: 'Expansión NAS del caso es estimación de referencia.',
    metricIds: ['storage-use'],
    metricText: '% uso NAS.',
    metricTarget: 'Uso bajo umbral aprobado y prueba de crecimiento.',
    priority: 'high',
    justification: '80 % y 650 GB/mes están en el caso.',
    alternatives: [{ title: 'Solo comprar disco' }, { title: 'Retención + ampliación' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-03',
    findingIds: ['finding-04'],
    evidenceIds: ['ev-stale-accounts'],
    decision: 'Formalizar baja de cuentas en el mismo día hábil del retiro y completar MFA privilegiado.',
    title: 'Ciclo de vida de identidades',
    impact: 'Acceso residual.',
    benefitText: 'Reducir cuentas huérfanas y privilegios sin MFA.',
    riskText: 'Fricción operativa.',
    costModel: 'opex',
    costJustification: 'Esfuerzo de identidad.',
    metricIds: [],
    metricText: 'Cuentas privilegiadas con MFA y tiempo de baja.',
    metricTarget: '0 cuentas de exempleados activas > 1 día hábil; MFA en 17/17 privilegiadas.',
    priority: 'immediate',
    justification: 'La revisión de agosto documenta bajas tardías y MFA parcial.',
    alternatives: [{ title: 'Revisión trimestral' }, { title: 'Baja el mismo día hábil' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
];

patchState((prev) => ({
  ...prev,
  analysis: {
    ...prev.analysis,
    diagnose: { ...prev.analysis.diagnose, findings },
    measure: {
      ...prev.analysis.measure,
      availability: {
        ...prev.analysis.measure.availability,
        result: 99.51,
        sourceKeys: ['periodHours', 'downtimeHours'],
        status: METRIC_STATUS.DOCUMENTED,
      },
      mttr: {
        ...prev.analysis.measure.mttr,
        result: 2.13,
        sourceKeys: ['totalRecoveryHours', 'incidentCount'],
        status: METRIC_STATUS.DOCUMENTED,
      },
      storage: {
        ...prev.analysis.measure.storage,
        result: { percent: 80, months: 7.4 },
        sourceKeys: ['storageUsed', 'storageCapacity', 'storageGrowth'],
        status: METRIC_STATUS.DOCUMENTED,
      },
    },
    represent: {
      ...prev.analysis.represent,
      asIs: {
        description: 'Cadena ERP: usuarios → red → FW-01 → ERP-APP01 → ERP-DB01.',
        chains: { erp: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'] },
      },
      spof: {
        records: {
          firewall: {
            componentId: 'firewall',
            name: 'FW-01',
            status: 'justified',
            impact: 'VPN de sedes interrumpida',
            justification: 'Instancia única',
          },
        },
      },
    },
    govern: {
      ...prev.analysis.govern,
      itil: [govBase('finding-05', { analysisId: 'itil-01', situation: 'Cambio sin reversa.', practice: 'change', action: 'Exigir rollback.', benefit: 'Menos interrupciones.', indicator: 'changes-rollback' })],
      cobit: [govBase('finding-03', { analysisId: 'cobit-01', problem: 'SPOF de perímetro.', decision: 'Dueño de resiliencia.', responsibleIds: ['infra-lead'], responsibleJustification: 'Opera el perímetro.', indicator: 'recovery-policy' })],
      iso27001: [govBase('finding-04', { analysisId: 'iso-01', assetId: 'credentials', threatId: 'unauthorized-access', vulnerabilityId: 'stale-account', impact: 'Acceso residual.', control: 'Baja el mismo día hábil y MFA privilegiado.' })],
    },
    decide: { ...prev.analysis.decide, recommendations: recs, decisions: recs },
    build: { ...prev.analysis.build, readyToExport: true },
  },
  documentSections: {
    ...prev.documentSections,
    spof: {
      status: 'DOCUMENTED',
      text: 'FW-01 sin redundancia documentada.',
      rows: [{ name: 'FW-01', impact: 'VPN de sedes', justification: 'Instancia única', evidence: 'Página de red e incidente B' }],
    },
    asis: { status: 'DOCUMENTED', text: 'Cadena ERP documentada. No se relista el inventario.', chains: [{ serviceId: 'erp', nodeIds: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'] }] },
    metrics: { status: 'DOCUMENTED', text: 'Métricas del periodo.', subsections: {} },
    strategy: { status: 'DOCUMENTED', text: 'Mantener el ERP; fortalecer perímetro, identidad y capacidad de NAS.' },
    conclusions: { status: 'DOCUMENTED', text: 'La infraestructura opera, pero concentra exposiciones en perímetro, identidad y almacenamiento.' },
  },
}));

const report = generateConsultingReport(getState());
assert(report.findings.length === 5, `Hallazgos: ${report.findings.length}`);
assert(report.findings[0].id === 'F-01', 'El primer hallazgo debe ser F-01');
assert(report.findings.every((item) => item.evidence.length), 'Cada hallazgo del caso completo debe tener evidencia');
assert(report.executiveOpinion.condition, 'Falta dictamen');
assert(!report.executiveOpinion.insufficient, 'El caso completo no debe marcar información insuficiente');
assert(report.evidenceRegister.length > 0, 'Falta registro de evidencias');
assert(report.evidenceRegister.every((item) => item.page == null || Number(item.page) <= 10), 'Hay páginas inventadas');
assert(report.targetArchitecture.disclaimer.includes('Arquitectura objetivo de referencia'), 'Falta descargo TO-BE');
assert(report.recommendedProgram.initiatives.every((item) => item.findingIds.length), 'Iniciativa sin hallazgo');
assert(report.alternatives.options.length >= 3, 'Faltan alternativas');
console.log('1. generación con caso documentado OK', {
  findings: report.findings.map((item) => item.id),
  evidence: report.evidenceRegister.length,
});

const pendingStateFindings = findings.map((item, index) =>
  index === 0 ? { ...item, evidenceIds: [], title: 'Hallazgo pendiente de verificación' } : item,
);
patchState((prev) => ({
  ...prev,
  analysis: { ...prev.analysis, diagnose: { ...prev.analysis.diagnose, findings: pendingStateFindings } },
}));
const pendingReport = generateConsultingReport(getState());
assert(pendingReport.findings[0].evidenceState === 'Pendiente', 'El hallazgo sin evidencia debe quedar Pendiente');
assert(pendingReport.findings[0].kind !== 'hecho confirmado', 'Un pendiente no puede figurar como confirmado');
assert(pendingReport.validation.warnings.some((item) => /sin evidenceId/.test(item)), 'Debe advertir hallazgo sin evidencia');
console.log('2-3. hallazgos pendientes / sin evidencia OK');

const calcReport = structuredClone(pendingReport);
calcReport.performanceAndCapacity.push({
  id: 'orphan-calc',
  kind: 'cálculo',
  sources: [],
  result: '1',
});
const calcValidation = validateConsultingReport(calcReport);
assert(calcValidation.warnings.some((item) => /sin datos fuente/.test(item)), 'Debe advertir cálculo sin datos fuente');
console.log('4. cálculo sin datos fuente OK');

patchState((prev) => ({
  ...prev,
  analysis: {
    ...prev.analysis,
    diagnose: { ...prev.analysis.diagnose, findings },
    decide: {
      ...prev.analysis.decide,
      recommendations: [
        ...recs,
        {
          decisionId: 'dec-orphan',
          findingIds: [],
          decision: 'Recomendación huérfana.',
          title: 'Huérfana',
          benefitText: 'Ninguno trazable.',
          costModel: 'opex',
          priority: 'low',
          alternatives: [],
          status: DECISION_STATUS.DOCUMENTED,
        },
      ],
    },
  },
}));
const orphanReport = generateConsultingReport(getState());
assert(
  orphanReport.validation.errors.some((item) => /no indica qué hallazgo/.test(item)) ||
    orphanReport.validation.warnings.some((item) => /sin hallazgo/.test(item)),
  'Debe señalar recomendación/iniciativa sin hallazgo',
);
console.log('5. recomendación sin hallazgo OK');

patchState((prev) => ({
  ...prev,
  analysis: { ...prev.analysis, decide: { ...prev.analysis.decide, recommendations: recs } },
}));
const specialFindings = findings.map((item, index) =>
  index === 0
    ? { ...item, title: 'Degradación ERP «pico» 92 % — áéíóú ñ' }
    : item,
);
patchState((prev) => ({
  ...prev,
  analysis: { ...prev.analysis, diagnose: { ...prev.analysis.diagnose, findings: specialFindings } },
}));

getState().analysis.build.readyToExport = true;
const model = buildExportModel(getState(), createExportConfig());
assert(model.kind === 'consulting', 'kind consulting');
assert(model.sections.map((item) => item.key).join(',') === CONSULTING_SECTION_KEYS.join(','), 'secciones incompletas');
assert(model.sections[0].key === 'dictamen', 'debe abrir con dictamen');
assert(!modelHasTechnicalIds(model), 'IDs internos visibles en el modelo');
const { html, fileName } = HtmlExporter(model);
assert(html.includes('Dictamen técnico'), 'HTML sin dictamen');
assert(html.includes('F-01'), 'HTML sin F-01');
assert(html.includes('áéíóú') || html.includes('áéíóú'.normalize()), 'HTML perdió caracteres especiales');
assert(html.includes('#page='), 'HTML sin vínculo a página del PDF');
assert(html.includes('<svg'), 'HTML sin diagrama');
assert(html.includes('@page') || html.includes('A4'), 'HTML sin formato A4');
assert(fileName === 'Informe_Tecnico_Consultoria_Helados_Boreal.html', fileName);
assert(!html.includes('Contexto de la organización') || html.indexOf('Dictamen técnico') < html.indexOf('Contexto de la organización'), 'No debe reabrir con capítulos académicos');
console.log('6-7 HTML OK', fileName);

const packed = await packDocx(model);
const buffer = packed instanceof Uint8Array ? packed : Buffer.from(await packed.arrayBuffer?.() || packed);
assert(buffer[0] === 0x50 && buffer[1] === 0x4b, 'DOCX no es ZIP');
assert(docxFileName(model) === 'Informe_Tecnico_Consultoria_Helados_Boreal.docx', docxFileName(model));
assert(buffer.length > 4000, 'DOCX pequeño');
console.log('8 DOCX OK', buffer.length);

const printHtml = html;
assert(printHtml.includes('ig-break') || printHtml.includes('page-break'), 'Faltan saltos de página');
assert(html.includes('Anexo A'), 'Falta registro de evidencias');
assert(html.includes('Información requerida para ingeniería de detalle'), 'Falta anexo B');
assert(exportBaseName('Helados Boreal S.A.S.') === 'Informe_Tecnico_Consultoria_Helados_Boreal');

const emptyFindingsState = structuredClone(getState());
emptyFindingsState.analysis.diagnose.findings = [];
emptyFindingsState.analysis.decide.recommendations = [];
const emptyReport = generateConsultingReport(emptyFindingsState);
assert(emptyReport.executiveOpinion.insufficient, 'Debe marcar insuficiente');
assert(emptyReport.executiveOpinion.condition.includes(INSUFFICIENT), 'Falta frase de información insuficiente');
console.log('9. información insuficiente OK');

const outDir = join(dirname(fileURLToPath(import.meta.url)), '..', 'tmp-report');
await mkdir(outDir, { recursive: true });
const htmlPath = join(outDir, fileName);
const docxPath = join(outDir, docxFileName(model));
await writeFile(htmlPath, html, 'utf8');
await writeFile(docxPath, buffer);
console.log('archivos generados', { htmlPath, docxPath });

console.log('SIMULACIÓN INFORME TÉCNICO OK', {
  findings: model.report.findings.map((item) => `${item.id} ${item.evidenceState}`),
  evidence: model.report.evidenceRegister.map((item) => `${item.evidenceId} p.${item.page}`),
  warnings: model.report.validation.warnings,
});

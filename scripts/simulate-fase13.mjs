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

const { getCaseById, registerCaseForTests } = await import('../src/data/cases/index.js');
const { createStudentWorkFixture } = await import('../src/data/testing/studentWorkFixture.js');
registerCaseForTests(createStudentWorkFixture());
const {
  buildEvidenceRegistry,
  caseMapSections,
  getSourceSection,
  getEvidenceForField,
  resolveEvidenceStatus,
  EVIDENCE_STATUS,
  EvidenceValidator,
} = await import('../src/data/evidence/index.js');
const { getState, selectWorkCase, addCollectedData, hydrateFromStorage } = await import('../src/state/appState.js');
const { openCasePdf } = await import('../src/state/evidenceActions.js');
const { createModelReportState } = await import('../src/data/testing/modelReportState.js');
const { generateConsultingReport, CONSULTING_SECTION_KEYS } = await import('../src/report/index.js');
const { buildExportModel, modelHasTechnicalIds } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { packDocx } = await import('../src/export/docxExporter.js');
const { createExportConfig } = await import('../src/data/methodology/export.js');
const { consultingDocumentSections } = await import('../src/data/document/consultingSections.js');
const { TraceabilityValidator, ReportValidator } = await import('../src/data/evidence/traceabilityValidator.js');
const { appCopy } = await import('../src/data/copy.js');
const { availabilityExample } = await import('../src/data/methodology/availabilityExample.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');
const caseData = getCaseById('modelo-helados-boreal');
const registry = buildEvidenceRegistry(caseData);
const map = caseMapSections(caseData);
const titles = map.map((item) => `${item.page}|${item.title}`);

assert(map.length === new Set(titles).size, 'El mapa tiene títulos/páginas duplicados.');
assert(map.length === new Set(map.map((item) => item.page)).size, 'El mapa tiene páginas duplicadas.');
assert(!/Las páginas se publicarán solo cuando se verifiquen/.test(JSON.stringify(map)), 'Texto de páginas pendientes residual.');
console.log('mapa único OK', map.map((item) => `${item.page} ${item.title}`));

const empresa = getEvidenceForField(caseData, 'organizationName');
const storage = getEvidenceForField(caseData, 'storageUsed');
const incidents = getEvidenceForField(caseData, 'incidentCount');
const constraints = getEvidenceForField(caseData, 'budgetLimit');
assert(empresa?.page === 2 && empresa.quote && resolveEvidenceStatus(empresa) === EVIDENCE_STATUS.VERIFIED, 'Empresa no es VERIFIED p.2');
assert(storage?.page === 6 && storage.quote, 'Almacenamiento no es p.6 con fragmento');
assert(incidents?.page === 8 && incidents.quote, 'Incidentes no es p.8 con fragmento');
assert(constraints?.page === 9 && constraints.quote, 'Restricciones no es p.9 con fragmento');
assert(getSourceSection(caseData, 'context')?.page === 2, 'Sección context no es página 2');

openCasePdf({ fieldKey: 'organizationName', asOverlay: true });
assert(getState().pdfViewer.page === 2, `Empresa abrió página ${getState().pdfViewer.page}`);
openCasePdf({ fieldKey: 'storageUsed', asOverlay: true });
assert(getState().pdfViewer.page === 6, `Almacenamiento abrió página ${getState().pdfViewer.page}`);
openCasePdf({ fieldKey: 'incidentCount', asOverlay: true });
assert(getState().pdfViewer.page === 8, `Incidentes abrió página ${getState().pdfViewer.page}`);
openCasePdf({ sourceSectionId: 'constraints', asOverlay: true });
assert(getState().pdfViewer.page === 9, `Restricciones abrió página ${getState().pdfViewer.page}`);
openCasePdf({ sourceSectionId: 'context', asOverlay: true });
assert(getState().pdfViewer.page === 2, `Abrir sección context abrió página ${getState().pdfViewer.page}`);

const verified = registry.filter((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.VERIFIED);
const pending = registry.filter((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.PENDING);
const notFound = registry.filter((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.NOT_FOUND);
assert(verified.every((item) => item.page && (item.quote || item.extract || item.text)), 'VERIFIED sin fragmento o página');
assert(!verified.some((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.PENDING), 'Contradicción VERIFIED/PENDING');

const ev = EvidenceValidator(caseData);
assert(ev.ok, `EvidenceValidator: ${ev.errors.join(' | ')}`);

const beforeMeasure = JSON.stringify(getState().analysis?.measure?.availability?.result ?? null);
assert(!/Este ejemplo valida el componente/.test(appCopy.dashboard.methodIntro), 'Mensaje de maqueta sigue en dashboard');
assert(/demostración te permite comprender/.test(availabilityExample.disclaimer), 'Disclaimer de demostración no actualizado');
assert(beforeMeasure !== 'null' && beforeMeasure !== 'undefined', 'El caso modelo debe traer MEDIR resuelto');

selectWorkCase('fixture-equipo-trabajo');
const studentMeasure = JSON.stringify(getState().analysis?.measure?.availability?.result ?? null);
assert(studentMeasure === 'null' || studentMeasure === 'undefined', 'El caso de trabajo no debe heredar MEDIR del modelo');

const studentBefore = structuredClone(getState());
const modelState = createModelReportState();
const report = generateConsultingReport(modelState);
assert(report.findings.length >= 5, 'Informe modelo sin hallazgos');
assert(CONSULTING_SECTION_KEYS.length === consultingDocumentSections.length, 'Tu documento no alinea 13 secciones de consultoría');
assert(getState().analysis?.diagnose?.findings?.length === studentBefore.analysis.diagnose.findings.length, 'El modelo no debe mezclarse con el progreso');
assert(JSON.stringify(getState().analysis?.measure?.availability?.result ?? null) === studentMeasure, 'La demo/modelo no debe guardar cálculo del estudiante');

const exportModel = buildExportModel(modelState, createExportConfig());
assert(exportModel.kind === 'consulting', 'Export no usa ConsultingReportModel');
assert(exportModel.sections.map((item) => item.key).join(',') === CONSULTING_SECTION_KEYS.join(','));
assert(!modelHasTechnicalIds(exportModel), 'IDs internos en el export');
const { html } = HtmlExporter(exportModel);
assert(html.includes('Dictamen técnico'), 'HTML sin dictamen');
const packed = await packDocx(exportModel);
const buffer = packed instanceof Uint8Array ? packed : Buffer.from(await packed.arrayBuffer?.() || packed);
assert(buffer[0] === 0x50 && buffer[1] === 0x4b, 'DOCX no es ZIP');

const trace = TraceabilityValidator(modelState);
const reportVal = ReportValidator(report);
console.log('validadores', { evidence: ev.verifiedCount, pending: ev.pendingCount, traceOk: trace.ok, reportErrors: reportVal.errors.length });

addCollectedData('organizationName');
const collected = getState().collectedData.find((item) => item.key === 'organizationName');
assert(!collected, 'El caso de trabajo fixture no debe recolectar campos de Helados');

selectWorkCase('modelo-helados-boreal');
const modelCollected = getState().collectedData.find((item) => item.key === 'organizationName');
assert(modelCollected?.evidenceId && modelCollected.page === 2 && modelCollected.quote, 'El dato recolectado perdió la referencia al PDF');

console.log('MATRIZ DE EVIDENCIAS');
registry
  .filter((item) => item.origin !== 'CALCULATED')
  .forEach((item) => {
    console.log(
      [item.evidenceId, item.label, item.value, item.page, item.section, item.quote ? 'sí' : 'no', resolveEvidenceStatus(item), (item.usedBy || []).join('/')].join(' | '),
    );
  });

console.log('FASE 13 OK', {
  map: map.length,
  verified: verified.length,
  pending: pending.length,
  notFound: notFound.length,
  htmlChars: html.length,
  docxBytes: buffer.length,
});

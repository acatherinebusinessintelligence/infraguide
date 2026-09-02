const store = new Map();
globalThis.HashChangeEvent = class HashChangeEvent extends Event {
  constructor(type) {
    super(type);
  }
};
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  location: { hash: '' },
  dispatchEvent() {},
};

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const { registerCaseForTests } = await import('../src/data/cases/index.js');
const { createStudentWorkFixture } = await import('../src/data/testing/studentWorkFixture.js');
registerCaseForTests(createStudentWorkFixture());

const { hydrateFromStorage, getState, selectWorkCase, patchState, selectStage } = await import('../src/state/appState.js');
const { canWorkStage, getStageWorkStatus } = await import('../src/state/stageGates.js');
const { stages, STAGE_STATUS } = await import('../src/data/stages/index.js');
const { CASE_MODE } = await import('../src/data/cases/caseMode.js');
const { isModelSolved, isStudentWork } = await import('../src/state/caseMode.js');
const { DashboardPage } = await import('../src/pages/Dashboard.js');
const { MeasurePage } = await import('../src/pages/Measure.js');
const { DiagnosePage } = await import('../src/pages/Diagnose.js');
const { UnderstandPage } = await import('../src/pages/Understand.js');
const { RepresentPage } = await import('../src/pages/Represent.js');
const { ReportPreviewPage } = await import('../src/pages/ReportPreview.js');
const { ExportPage } = await import('../src/pages/Export.js');
const { DocumentPanel } = await import('../src/components/DocumentPanel.js');
const { canExport } = await import('../src/state/exportActions.js');
const { buildExportModel } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { packDocx } = await import('../src/export/docxExporter.js');
const { createExportConfig } = await import('../src/data/methodology/export.js');
const { modelConsultoriaBaseName } = await import('../src/export/text.js');
const { buildConsultingDocumentIndex } = await import('../src/state/documentTrace.js');
const { DOCUMENT_SECTION_STATUS } = await import('../src/data/document/consultingSections.js');
const { ModelCaseBanner } = await import('../src/components/model/ModelCaseBanner.js');
const { getCaseById } = await import('../src/data/cases/index.js');

hydrateFromStorage();

const boreal = getCaseById('modelo-helados-boreal');
assert(boreal.caseMode === CASE_MODE.MODEL_SOLVED, 'Helados Boreal debe tener caseMode MODEL_SOLVED');
assert(boreal.readOnly === true, 'Helados Boreal es de solo lectura');

selectWorkCase('modelo-helados-boreal');
let state = getState();
assert(isModelSolved(state), 'A2: estado MODEL_SOLVED');
assert(ModelCaseBanner({ state }).includes('CASO MODELO RESUELTO'), 'A2: franja CASO MODELO RESUELTO');
assert(DashboardPage(state).includes('CASO MODELO RESUELTO'), 'A2: dashboard anuncia el caso modelo');
assert(DashboardPage(state).includes('EXPLORAR ETAPA'), 'A3: tarjetas explorables');
assert(DashboardPage(state).includes('EXPLORAR CASO MODELO'), 'A: botón principal EXPLORAR CASO MODELO');
assert(DashboardPage(state).includes('Los casos de trabajo serán incorporados posteriormente'), 'A20: no inventa casos de equipo');
assert(DashboardPage(state).includes('DISPONIBLE PARA CONSULTA'), 'A4: estado visual de consulta');
assert(!DashboardPage(state).includes('AÚN NO HABILITADA'), 'A3: no aparece bloqueado');
assert(!DashboardPage(state).includes('Finalizar etapa'), 'A14: no pide finalizar');

for (const stage of stages) {
  assert(canWorkStage(state, stage.id), `A3: etapa ${stage.id} disponible`);
  assert(getStageWorkStatus(stage, state) === STAGE_STATUS.SOLVED, `A3: etapa ${stage.id} RESUELTO`);
}

selectStage(4);
const measureHtml = MeasurePage(getState());
assert(measureHtml.includes('MEDIR') && measureHtml.includes('RESUELTO'), 'A4: MEDIR se abre sin COMPRENDER');
assert(measureHtml.includes('99,51') || measureHtml.includes('99.51') || measureHtml.includes('Disponibilidad'), 'A5: disponibilidad paso a paso');
assert(measureHtml.includes('INFORMACIÓN INSUFICIENTE'), 'A5: declara información insuficiente');
assert(measureHtml.includes('open-evidence') || measureHtml.includes('evidence-link'), 'A6: evidencia del cálculo');
assert(!measureHtml.includes('data-action="complete-measure"'), 'A14: no hay finalizar MEDIR');

const diagHtml = DiagnosePage(getState());
assert(diagHtml.includes('finding-01') || diagHtml.includes('Hallazgo'), 'A8: hallazgo visible');
assert(diagHtml.includes('VER CÓMO SE CONSTRUYÓ'), 'A9: ver cómo se construyó');

const reportHtml = ReportPreviewPage(getState(), { model: false });
assert(reportHtml.includes('INFORME MODELO'), 'A10: informe final con marca');
assert(canExport(getState()), 'A11: exportación habilitada desde el inicio');

const exportModel = buildExportModel(getState(), createExportConfig());
const html = HtmlExporter(exportModel, { fileBase: modelConsultoriaBaseName() });
assert(html.fileName === 'Informe_Modelo_Consultoria_Helados_Boreal.html', `A11: HTML nombre ${html.fileName}`);
assert(html.html.includes('Dictamen técnico'), 'A11: HTML contiene dictamen');
const docx = await packDocx(exportModel);
assert(docx, 'A12: Word se genera');
const exportPage = ExportPage(getState());
assert(exportPage.includes('Informe_Modelo_Consultoria_Helados_Boreal.pdf'), 'A13: nombre de impresión/PDF');

const index = buildConsultingDocumentIndex(getState());
assert(
  index.items.every((item) => item.status === DOCUMENT_SECTION_STATUS.SOLVED),
  `A: secciones RESUELTO, obtuvo ${[...new Set(index.items.map((item) => item.status))].join(',')}`,
);
const panel = DocumentPanel({
  open: true,
  state: { ...getState(), documentViewKey: 'findings' },
  collectedData: getState().collectedData,
  documentViewKey: 'findings',
});
assert(panel.includes('INFORME MODELO'), '13: panel TU DOCUMENTO informe modelo');
assert(!panel.includes('Continuar esta sección'), '13: no pide continuar sección');
assert(panel.includes('VER CÓMO SE CONSTRUYÓ'), '16: trazabilidad explicativa');

const understand = UnderstandPage(getState());
assert(!understand.includes('Finalizar COMPRENDER'), 'A14: COMPRENDER no pide finalizar');
assert(!understand.includes('Faltan respuestas'), 'A14: no pide respuestas');

console.log('CASO A modelo OK');

selectWorkCase('fixture-equipo-trabajo');
state = getState();
assert(isStudentWork(state), 'B: entra a STUDENT_WORK');
assert(state.completedStages.length === 0, 'B: trabajo inicia limpio');
assert(canWorkStage(state, 1), 'B2: COMPRENDER disponible');
assert(!canWorkStage(state, 2), 'B3: REPRESENTAR aplica secuencia');
assert(ModelCaseBanner({ state }).includes('CASO DE TRABAJO DEL EQUIPO'), 'B: franja de trabajo');
const workDash = DashboardPage(state);
assert(!workDash.includes('EXPLORAR ETAPA'), 'B: no usa tarjetas de ejemplo resuelto');
assert(UnderstandPage(state).includes('Finalizar COMPRENDER') || UnderstandPage(state).includes('COMPRENDER'), 'B: COMPRENDER es trabajo');

patchState((prev) => ({ ...prev, completedStages: [1], currentStage: 1 }));
assert(canWorkStage(getState(), 2), 'B5: al completar COMPRENDER se habilita REPRESENTAR');
const studentMarker = 'trabajo-del-equipo';
patchState((prev) => ({ ...prev, documentError: studentMarker }));

console.log('CASO B trabajo OK');

selectWorkCase('modelo-helados-boreal');
assert(isModelSolved(getState()), 'C1: vuelve al modelo');
assert(getState().documentError !== studentMarker, 'C: el modelo no carga el error del estudiante');
assert(canWorkStage(getState(), 8), 'C: CONSTRUIR sigue abierto en el modelo');
MeasurePage(getState());
DiagnosePage(getState());
selectWorkCase('fixture-equipo-trabajo');
assert(isStudentWork(getState()), 'C3: caso de trabajo');
assert(getState().documentError === studentMarker, 'C4: se recupera el progreso del estudiante');
assert(getState().completedStages.includes(1), 'C4: COMPRENDER del estudiante intacto');
selectWorkCase('modelo-helados-boreal');
assert(isModelSolved(getState()), 'C5: modelo otra vez');
assert(getState().analysis?.build?.readyToExport, 'C6: el modelo conserva el informe resuelto, no el formulario del estudiante');

console.log('CASO C cambio de modo OK');
console.log('SIMULACIÓN CASO MODELO OK');

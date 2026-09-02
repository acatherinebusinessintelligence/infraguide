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

const { STORAGE_STATE_KEY } = await import('../src/config.js');
const { getState, selectWorkCase, hydrateFromStorage, patchState, selectStage } = await import('../src/state/appState.js');
const { canWorkStage, getStageWorkStatus, understandRequirementItems, requirementProgress } = await import(
  '../src/state/stageGates.js'
);
const { stages, STAGE_STATUS } = await import('../src/data/stages/index.js');
const { StageCard } = await import('../src/components/StageCard.js');
const { StageLockedView, TeacherBanner } = await import('../src/components/StageLockedView.js');
const { DashboardPage } = await import('../src/pages/Dashboard.js');
const { RepresentPage } = await import('../src/pages/Represent.js');
const { UnderstandPage } = await import('../src/pages/Understand.js');
const { HelpPage } = await import('../src/pages/Help.js');
const { enterTeacherMode, exitTeacherMode } = await import('../src/state/teacherMode.js');
const { completeRepresentStage } = await import('../src/state/representActions.js');
const { buildConsultingDocumentIndex, documentChainFor, sectionStatusFor } = await import('../src/state/documentTrace.js');
const { DOCUMENT_SECTION_STATUS, consultingDocumentSections } = await import('../src/data/document/consultingSections.js');
const { createModelReportState } = await import('../src/data/testing/modelReportState.js');
const { generateConsultingReport } = await import('../src/report/index.js');
const { buildExportModel } = await import('../src/export/buildExportModel.js');
const { HtmlExporter } = await import('../src/export/htmlExporter.js');
const { packDocx } = await import('../src/export/docxExporter.js');
const { createExportConfig } = await import('../src/data/methodology/export.js');
const { PersistenceService } = await import('../src/state/persistence.js');
const { sanitizeExportHref } = await import('../src/utils/assetUrl.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

hydrateFromStorage();
const { registerCaseForTests } = await import('../src/data/cases/index.js');
const { createStudentWorkFixture } = await import('../src/data/testing/studentWorkFixture.js');
registerCaseForTests(createStudentWorkFixture());
selectWorkCase('fixture-equipo-trabajo');

const newUser = getState();
assert(newUser.completedStages.length === 0, 'A: el usuario nuevo no debe tener etapas cerradas');
assert(canWorkStage(newUser, 1), 'A: COMPRENDER debe poder trabajarse');
for (const id of [2, 3, 4, 5, 6, 7, 8]) {
  assert(!canWorkStage(newUser, id), `A: etapa ${id} debe permanecer bloqueada pedagógicamente`);
}

const cards = stages
  .map((stage) => StageCard({ stage, status: getStageWorkStatus(stage, newUser) }))
  .join('');
assert(!/<button[^>]*\sdisabled(?:\s|>)/.test(cards), 'A: las tarjetas no deben deshabilitarse');
assert(cards.includes('data-action="select-stage"'), 'A: las tarjetas deben ser seleccionables');
assert(getStageWorkStatus(stages[1], newUser) === STAGE_STATUS.BLOCKED, 'A: REPRESENTAR aparece aún no habilitada');

selectStage(4);
const lockedDash = DashboardPage(getState());
assert(lockedDash.includes('Vista pedagógica'), 'A: al seleccionar una etapa bloqueada se abre la vista pedagógica');
assert(lockedDash.includes('Objetivo'), 'A: la vista muestra el objetivo');
assert(lockedDash.includes('requisitos completados'), 'A: la vista muestra el progreso de requisitos');
assert(lockedDash.includes('Regresar a la actividad pendiente'), 'A: hay botón de retorno a la actividad pendiente');

const lockedRepresent = RepresentPage(getState());
assert(lockedRepresent.includes('Vista pedagógica'), 'A: REPRESENTAR muestra vista de solo lectura');
assert(!lockedRepresent.includes('data-action="complete-represent"'), 'A: no se puede finalizar REPRESENTAR bloqueada');

const lockedView = StageLockedView({ state: getState(), stageId: 5 });
const progress = requirementProgress(getState(), 5);
assert(lockedView.includes(`${progress.done} de ${progress.total} requisitos completados`), 'A: progreso exacto visible');

const understandHtml = UnderstandPage({
  ...getState(),
  analysis: {
    ...getState().analysis,
    understand: { ...getState().analysis.understand, currentSubstage: 6 },
  },
});
assert(understandHtml.includes('Contexto agregado al documento'), '5: checklist permanente de COMPRENDER');
assert(understandHtml.includes('Checkpoint final aprobado'), '5: el checklist incluye el checkpoint');
assert(!understandHtml.includes('Faltan secciones o justificaciones'), '6: no usar el mensaje genérico');
assert(understandHtml.includes('No puedes finalizar COMPRENDER. Falta:'), '6: el botón explica el requisito faltante');
const missing = understandRequirementItems(getState()).filter((item) => !item.done);
assert(missing.length === 6, '6: usuario nuevo tiene los 6 requisitos pendientes');
assert(understandHtml.includes('Contexto agregado al documento'), '6: lista el contexto faltante');

assert(!completeRepresentStage(), '4: no se puede finalizar REPRESENTAR sin prerrequisitos');
assert(String(getState().documentError || '').includes('Falta:'), '4: el error nombra el prerrequisito');

const help = HelpPage(getState());
assert(help.includes('enter-teacher-mode'), '9: producción muestra modo docente');
assert(help.includes('VER INFORME MODELO') || help.includes('informe/modelo'), '9: producción muestra el informe modelo');

const indexNew = buildConsultingDocumentIndex(getState());
const readyEarly = indexNew.items.filter((item) =>
  [DOCUMENT_SECTION_STATUS.READY, DOCUMENT_SECTION_STATUS.VALIDATED].includes(item.status),
);
assert(readyEarly.length === 0, `E: ninguna sección LISTO/VALIDADO al inicio: ${readyEarly.map((item) => item.key).join(',')}`);
const alternatives = indexNew.items.find((item) => item.key === 'alternatives');
assert(alternatives.status === DOCUMENT_SECTION_STATUS.BASE, '13: alternativas en BASE mientras DECIDIR está bloqueado');
const annexEvidence = indexNew.items.find((item) => item.key === 'annexEvidence');
assert(annexEvidence.status === DOCUMENT_SECTION_STATUS.BASE, '14: registro de evidencias en BASE sin uso del estudiante');
const annexEng = indexNew.items.find((item) => item.key === 'annexEngineering');
assert(annexEng.status === DOCUMENT_SECTION_STATUS.BASE, '15: ingeniería de detalle en BASE si CONSTRUIR no cerró');

for (const spec of consultingDocumentSections) {
  const chain = documentChainFor(spec, getState(), indexNew.report);
  assert(chain.empty, `F: cadena vacía para ${spec.key} en usuario nuevo`);
  assert(chain.steps.every((step) => step.text && step.label), 'F: no hay pasos vacíos');
  assert(chain.message.includes('trazabilidad se completará'), 'F: mensaje pedagógico de trazabilidad');
}

patchState((prev) => ({
  ...prev,
  completedStages: [1],
  currentStage: 1,
}));
assert(canWorkStage(getState(), 2), 'B: al completar COMPRENDER se habilita REPRESENTAR');
assert(canWorkStage(getState(), 3), 'B: IDENTIFICAR también queda consultable/trabajable con COMPRENDER');
assert(!canWorkStage(getState(), 4), 'B: MEDIR sigue bloqueada');

const afterUnderstand = buildConsultingDocumentIndex(getState());
assert(
  afterUnderstand.items.find((item) => item.key === 'alternatives').status !== DOCUMENT_SECTION_STATUS.READY,
  '13: alternativas no quedan LISTO PARA REVISAR si DECIDIR sigue bloqueado',
);

const studentMarker = `student-progress-${Date.now()}`;
patchState((prev) => ({
  ...prev,
  documentError: studentMarker,
  currentStage: 1,
}));
const storedBeforeTeacher = store.get(STORAGE_STATE_KEY) || '';
const studentStage = getState().currentStage;
const studentCompleted = [...getState().completedStages];

await enterTeacherMode();
const teacher = getState();
assert(teacher.teacherMode, 'C: entra al modo docente');
assert(teacher.completedStages.length === 8, 'C: carga el estado de demostración completo');
for (const id of [1, 2, 3, 4, 5, 6, 7, 8]) {
  assert(canWorkStage(teacher, id), `C: etapa ${id} abierta en modo docente`);
}
const banner = TeacherBanner({ state: teacher });
assert(banner.includes('MODO DEMOSTRACIÓN – LOS CAMBIOS NO SE GUARDAN'), '8: franja de demostración');
assert(banner.includes('SALIR DEL MODO DEMOSTRACIÓN'), '8: botón para salir');
assert(teacher.analysis?.build?.readyToExport, 'C: se puede revisar el documento final');
assert(RepresentPage(teacher).includes('REPRESENTAR'), 'C: REPRESENTAR se abre para revisar');
assert(!RepresentPage(teacher).includes('Vista pedagógica · etapa aún no habilitada'), 'C: no bloquea la edición en demo');

const exportModel = buildExportModel(teacher, createExportConfig());
const html = HtmlExporter(exportModel);
assert(!/localhost/i.test(html.html), 'G: HTML de demostración sin localhost');
assert(!/127\.0\.0\.1/.test(html.html), 'G: HTML de demostración sin 127.0.0.1');
const docx = await packDocx(exportModel);
assert(docx, 'C: Word se puede generar en modo docente');

const savedDuringTeacher = PersistenceService.saveState(getState(), { source: 'autosave' });
assert(savedDuringTeacher.skipped || savedDuringTeacher.code === 'TEACHER_MODE', '8: no hay autosave del estudiante en demo');
assert((store.get(STORAGE_STATE_KEY) || '') === storedBeforeTeacher, '8: no se sobrescribe el progreso real');

patchState((prev) => ({ ...prev, currentStage: 8, documentError: 'teacher-temp' }));
exitTeacherMode();
const restored = getState();
assert(!restored.teacherMode, 'D: al salir se apaga el modo docente');
assert(restored.currentStage === studentStage, 'D: se recupera la etapa del estudiante');
assert(JSON.stringify(restored.completedStages) === JSON.stringify(studentCompleted), 'D: se recupera el progreso anterior');
assert(restored.documentError === studentMarker, 'D: se recupera el estado temporal del estudiante');

const fakeHref = sanitizeExportHref('http://localhost:4173/docs/caso.pdf#page=2');
assert(!/localhost/i.test(fakeHref), 'G: sanitizeExportHref elimina localhost:4173');
assert(fakeHref.includes('docs/caso.pdf') || fakeHref.includes('github.io'), 'G: el vínculo queda relativo o público');

const emptyState = {
  selectedCase: getState().selectedCase,
  completedStages: [],
  analysis: getState().analysis,
  documentSections: {},
  collectedData: [
    { label: '', page: null, evidenceId: '', documentSectionId: 'context', autoLoaded: true },
  ],
};
const emptyChain = documentChainFor(consultingDocumentSections[1], emptyState, generateConsultingReport(emptyState));
assert(emptyChain.empty || emptyChain.steps.every((step) => step.text), 'F: no se enumeran pasos vacíos');
assert(
  !emptyChain.steps.some((step) => !String(step.text || '').trim()),
  'F: cada paso visible tiene contenido',
);

const modelState = createModelReportState();
const modelReport = generateConsultingReport(modelState);
const modelStatuses = consultingDocumentSections.map((spec) => sectionStatusFor(spec.key, modelState, modelReport));
assert(
  modelStatuses.every((status) => status !== DOCUMENT_SECTION_STATUS.READY || modelState.completedStages.includes(8)),
  '10: el informe modelo no marca LISTO por estructuras iniciales del estudiante',
);

console.log('A usuario nuevo / vista pedagógica OK');
console.log('B COMPRENDER habilita REPRESENTAR OK');
console.log('C modo docente y exportaciones OK');
console.log('D salida recupera progreso OK');
console.log('E estados BASE / no LISTO prematuro OK');
console.log('F trazabilidad sin vacíos OK');
console.log('G sin localhost en export OK');

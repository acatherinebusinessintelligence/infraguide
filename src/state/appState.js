import { getCaseById, getCaseField, formatFieldValue } from '../data/cases/index.js';
import {
  DATA_STATUS,
  dataMap,
  analysisCatalog,
  deriveMethodologyStatus,
} from '../data/methodology/data-map.js';
import { documentSections } from '../data/document/sections.js';
import { PersistenceService, createPersistenceUi } from './persistence.js';
import { SaveIndicator } from '../components/progress/SaveIndicator.js';
import { debugMode } from '../config.js';
import { createUnderstandState, createDocumentBundle, mergeUnderstand } from './understandModel.js';
import { createRepresentState, mergeRepresent } from './representModel.js';
import { createMeasureState, mergeMeasure } from './measureModel.js';
import { createDiagnoseState, mergeDiagnose, analyzeFindingText } from './diagnoseModel.js';
import {
  createGovernState,
  mergeGovern,
  analyzeItilDraft,
  analyzeCobitDraft,
  analyzeIsoDraft,
  documentedFindings,
} from './governModel.js';
import { createDecideState, mergeDecide, analyzeDecisionDraft } from './decideModel.js';
import { createBuildState, mergeBuild, analyzeConclusionsText } from './buildModel.js';
import { createExportState, mergeExport } from './exportModel.js';

const listeners = new Set();

const initialState = {
  selectedCase: null,
  currentStage: 0,
  completedStages: [],
  meta: null,
  analysis: {
    understand: createUnderstandState(),
    represent: createRepresentState(),
    measure: createMeasureState(),
    diagnose: createDiagnoseState(),
    govern: createGovernState(),
    decide: createDecideState(),
    build: createBuildState(),
    export: createExportState(),
  },
  metricEvidence: [],
  documentSections: createDocumentBundle(),
  progress: 0,
  currentView: 'home',
  documentPanelOpen: false,
  mobileNavOpen: false,
  collectedData: [],
  methodologyStatus: {},
  dataGroups: {},
  explorerSectionId: 'operational-data',
  methodInfoKey: null,
  lastCollectedKey: null,
  collectedPanelOpen: false,
  activityAnswers: {},
  documentViewKey: null,
  documentError: null,
  glossaryTerm: null,
  howObtainedMetric: null,
  pedagogyNotice: null,
  persistence: createPersistenceUi(),
  pdfViewer: {
    open: false,
    documentId: null,
    page: null,
    evidenceId: null,
    fieldKey: null,
    sourceSectionId: null,
    mode: 'read',
  },
  evidenceReturn: null,
  caseReading: {
    introCompleted: false,
    guidedStep: 1,
    openedPdf: false,
    pageCount: null,
    notes: {},
  },
};

let persistEnabled = false;
let state = structuredClone(initialState);

PersistenceService.configure({
  getState: () => state,
  onStatus: (partial) => {
    state = {
      ...state,
      persistence: { ...state.persistence, ...partial },
    };
    const mount = typeof document !== 'undefined' ? document.querySelector('.topbar__save') : null;
    if (mount && partial.toast == null && partial.recovery == null) {
      mount.innerHTML = SaveIndicator({ persistence: state.persistence });
      return;
    }
    listeners.forEach((listener) => listener(state));
  },
});

function notify(options = {}) {
  listeners.forEach((listener) => listener(state));
  if (persistEnabled && options.persist !== false) {
    PersistenceService.scheduleSave(state);
  }
}

function refreshDerived(next) {
  const methodologyStatus = deriveMethodologyStatus(next.collectedData ?? [], next.methodologyStatus ?? {});
  const progress = computeProgress(next.completedStages ?? []);
  return { ...next, methodologyStatus, progress };
}

export function getState() {
  return state;
}

export function getInitialState() {
  return structuredClone(initialState);
}

export function setState(partial) {
  state = refreshDerived({ ...state, ...partial });
  notify();
}

export function patchState(updater) {
  const next = typeof updater === 'function' ? updater(state) : { ...state, ...updater };
  state = refreshDerived(next);
  notify();
}

export function subscribe(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function resetState() {
  state = structuredClone(initialState);
  notify();
}

export function openDocumentPanel() {
  setState({ documentPanelOpen: true, mobileNavOpen: false });
}

export function closeDocumentPanel() {
  setState({ documentPanelOpen: false });
}

export function toggleDocumentPanel() {
  setState({
    documentPanelOpen: !state.documentPanelOpen,
    mobileNavOpen: false,
  });
}

export function toggleCollectedPanel() {
  setState({
    collectedPanelOpen: !state.collectedPanelOpen,
    mobileNavOpen: false,
  });
}

export function closeOverlays() {
  setState({
    documentPanelOpen: false,
    collectedPanelOpen: false,
    methodInfoKey: null,
    mobileNavOpen: false,
  });
}

export function setView(view) {
  setState({
    currentView: view,
    mobileNavOpen: false,
  });
}

export function startAnalysis() {
  setState({
    currentView: 'dashboard',
    currentStage: 0,
    mobileNavOpen: false,
    documentPanelOpen: false,
  });
}

export function selectStage(stageId) {
  const { completedStages } = state;
  const isFirst = stageId === 1;
  const previousCompleted = completedStages.includes(stageId - 1);
  const alreadyCompleted = completedStages.includes(stageId);
  const isCurrent = state.currentStage === stageId;

  if (!isFirst && !previousCompleted && !alreadyCompleted && !isCurrent) {
    return;
  }

  setState({
    currentStage: stageId,
    currentView:
      stageId === 1
        ? 'understand'
        : stageId === 2
          ? 'represent'
          : stageId === 4
            ? 'measure'
            : stageId === 5
              ? 'diagnose'
              : stageId === 6
                ? 'govern'
                : stageId === 7
                  ? 'decide'
                  : stageId === 8
                    ? 'build'
                    : 'dashboard',
  });
}

export function computeProgress(completedStages = state.completedStages, totalStages = 8) {
  if (totalStages === 0) {
    return 0;
  }
  return Math.round((completedStages.length / totalStages) * 100);
}

export function getSelectedCaseData() {
  if (!state.selectedCase?.id) {
    return null;
  }
  return getCaseById(state.selectedCase.id);
}

export function selectWorkCase(caseId) {
  const caseData = getCaseById(caseId);
  if (!caseData) {
    return;
  }

  const sameCase = state.selectedCase?.id === caseId;
  setState({
    selectedCase: {
      id: caseData.id,
      name: caseData.name,
      kind: caseData.kind,
      kindLabel: caseData.kindLabel,
    },
    collectedData: sameCase ? state.collectedData : [],
    methodologyStatus: sameCase ? state.methodologyStatus : {},
    lastCollectedKey: sameCase ? state.lastCollectedKey : null,
    explorerSectionId: sameCase ? state.explorerSectionId : 'context',
    analysis: sameCase
      ? state.analysis
      : {
          understand: createUnderstandState(),
          represent: createRepresentState(),
          measure: createMeasureState(),
          diagnose: createDiagnoseState(),
          govern: createGovernState(),
          decide: createDecideState(),
          build: createBuildState(),
          export: createExportState(),
        },
    metricEvidence: sameCase ? state.metricEvidence : [],
    documentSections: sameCase ? state.documentSections : createDocumentBundle(),
    completedStages: sameCase ? state.completedStages : [],
    progress: sameCase ? state.progress : 0,
    methodInfoKey: null,
    mobileNavOpen: false,
    documentError: null,
    documentViewKey: null,
    pdfViewer: sameCase
      ? state.pdfViewer
      : {
          open: false,
          documentId: null,
          page: null,
          evidenceId: null,
          fieldKey: null,
          sourceSectionId: null,
          mode: 'read',
        },
    evidenceReturn: sameCase ? state.evidenceReturn : null,
    caseReading: sameCase
      ? state.caseReading
      : {
          introCompleted: false,
          guidedStep: 1,
          openedPdf: false,
          pageCount: null,
          notes: {},
        },
  });
}

export function setExplorerSection(sectionId) {
  setState({ explorerSectionId: sectionId });
}

export function markDataFound(key) {
  const current = state.methodologyStatus[key];
  if (current === DATA_STATUS.COLLECTED) {
    setState({ methodInfoKey: key });
    return;
  }
  setState({
    methodologyStatus: {
      ...state.methodologyStatus,
      [key]: DATA_STATUS.FOUND,
    },
    methodInfoKey: key,
  });
}

export function closeMethodInfo() {
  setState({ methodInfoKey: null });
}

export function addCollectedData(key) {
  if (state.collectedData.some((item) => item.key === key)) {
    return;
  }

  const caseData = getSelectedCaseData();
  const located = getCaseField(caseData, key);
  if (!located) {
    return;
  }

  const meta = dataMap[key] ?? {};
  const item = {
    key,
    value: located.field.value,
    unit: located.field.unit ?? '',
    label: located.field.label,
    displayValue: formatFieldValue(located.field),
    sourceSectionId: located.section.sectionId,
    sourceLabel: located.section.sectionTitle,
    documentSectionId: meta.documentSectionId ?? null,
  };

  setState({
    collectedData: [...state.collectedData, item],
    lastCollectedKey: key,
    methodInfoKey: null,
  });
}

export function removeCollectedData(key) {
  const collectedData = state.collectedData.filter((item) => item.key !== key);
  const methodologyStatus = { ...state.methodologyStatus };
  methodologyStatus[key] = DATA_STATUS.FOUND;

  Object.values(analysisCatalog).forEach((analysis) => {
    if (analysis.requiredKeys.includes(key) && methodologyStatus[analysis.id] === DATA_STATUS.READY_TO_PROCESS) {
      methodologyStatus[analysis.id] = DATA_STATUS.NOT_FOUND;
    }
  });

  setState({
    collectedData,
    methodologyStatus,
    lastCollectedKey: state.lastCollectedKey === key ? collectedData[collectedData.length - 1]?.key ?? null : state.lastCollectedKey,
  });
}

export function answerActivity(activityId, optionId) {
  setState({
    activityAnswers: {
      ...state.activityAnswers,
      [activityId]: optionId,
    },
  });
}

export function applyPersistedPayload(persisted, options = {}) {
  if (!persisted) return false;
  const caseId = persisted.meta?.caseId ?? persisted.selectedCase?.id ?? persisted.selectedCaseId ?? null;
  const caseData = caseId ? getCaseById(caseId) : null;
  const currentStage = persisted.currentStage ?? 0;
  state = refreshDerived({
    ...state,
    selectedCase: caseData
      ? {
          id: caseData.id,
          name: caseData.name,
          kind: caseData.kind,
          kindLabel: caseData.kindLabel,
        }
      : persisted.selectedCase
        ? {
            id: persisted.selectedCase.id,
            name: persisted.selectedCase.name || persisted.selectedCase.id,
            kind: persisted.selectedCase.kind,
            kindLabel: persisted.selectedCase.kindLabel,
          }
        : null,
    collectedData: persisted.collectedData ?? [],
    methodologyStatus: persisted.methodologyStatus ?? {},
    explorerSectionId: persisted.explorerSectionId || 'operational-data',
    lastCollectedKey: Array.isArray(persisted.collectedData)
      ? persisted.collectedData[persisted.collectedData.length - 1]?.key ?? null
      : null,
    analysis: {
      understand: mergeUnderstand(persisted.analysis?.understand),
      represent: mergeRepresent(persisted.analysis?.represent),
      measure: mergeMeasure(persisted.analysis?.measure),
      diagnose: mergeDiagnose(persisted.analysis?.diagnose),
      govern: mergeGovern(persisted.analysis?.govern),
      decide: mergeDecide(persisted.analysis?.decide),
      build: mergeBuild(persisted.analysis?.build),
      export: mergeExport(persisted.analysis?.export),
    },
    metricEvidence: persisted.metricEvidence ?? [],
    documentSections: { ...createDocumentBundle(), ...(persisted.documentSections ?? {}) },
    completedStages: Array.isArray(persisted.completedStages) ? persisted.completedStages : [],
    currentStage,
    currentView: options.keepView ? state.currentView : viewFromStage(currentStage),
    activityAnswers: persisted.activityAnswers ?? {},
    documentError: null,
    meta: persisted.meta ?? state.meta,
    caseReading: persisted.caseReading
      ? {
          introCompleted: Boolean(persisted.caseReading.introCompleted),
          guidedStep: Number(persisted.caseReading.guidedStep) || 1,
          openedPdf: Boolean(persisted.caseReading.openedPdf),
          pageCount: persisted.caseReading.pageCount ?? null,
          notes: persisted.caseReading.notes && typeof persisted.caseReading.notes === 'object' ? persisted.caseReading.notes : {},
        }
      : state.caseReading,
    pdfViewer: {
      open: false,
      documentId: null,
      page: null,
      evidenceId: null,
      fieldKey: null,
      sourceSectionId: null,
      mode: 'read',
    },
    evidenceReturn: null,
  });
  notify({ persist: options.persist === true });
  return true;
}

export function hydrateFromStorage() {
  const result = PersistenceService.loadState();
  persistEnabled = false;
  if (result.recoveryScreen) {
    state = {
      ...state,
      currentView: 'recovery',
      persistence: {
        ...state.persistence,
        recovery: {
          blocking: true,
          hasBackup: result.hasBackup,
          futureVersion: Boolean(result.futureVersion),
          message: result.futureVersion
            ? 'Este progreso fue creado con una versión más reciente de InfraGuide.'
            : 'Encontramos un problema al recuperar tu progreso.',
        },
      },
    };
    persistEnabled = true;
    notify({ persist: false });
    return result;
  }
  if (result.payload) {
    applyPersistedPayload(result.payload, { persist: false, keepView: true });
  }
  const meta = PersistenceService.getMeta();
  state = {
    ...state,
    persistence: {
      ...state.persistence,
      lastSavedAt: meta.lastSavedAt,
      lastBackupAt: meta.lastBackupAt,
      isDirty: false,
      status: meta.lastSavedAt ? 'saved' : 'idle',
      recoveredFromBackup: Boolean(result.recoveredFromBackup),
      migrated: Boolean(result.migrated),
      toast: result.recoveredFromBackup
        ? { message: result.message, tone: 'warn' }
        : result.migrated
          ? { message: 'Tu progreso fue actualizado al formato actual.', tone: 'ok' }
          : null,
    },
  };
  persistEnabled = true;
  notify({ persist: false });
  return result;
}

export function importProgressState(payload) {
  PersistenceService.importState(payload);
  persistEnabled = true;
  const ok = applyPersistedPayload(payload, { persist: false });
  if (ok) {
    const meta = PersistenceService.getMeta();
    state = {
      ...state,
      persistence: {
        ...state.persistence,
        importPreview: null,
        importConfirm: false,
        recovery: null,
        lastSavedAt: meta.lastSavedAt,
        lastBackupAt: meta.lastBackupAt,
        isDirty: false,
        status: 'saved',
        toast: { message: 'Progreso cargado correctamente.', tone: 'ok' },
      },
    };
    notify({ persist: false });
  }
  return ok;
}

export function patchPersistenceUi(partial) {
  state = {
    ...state,
    persistence: { ...state.persistence, ...partial },
  };
  notify({ persist: false });
}

export function viewFromStage(stageId) {
  if (stageId === 1) return 'understand';
  if (stageId === 2 || stageId === 3) return 'represent';
  if (stageId === 4) return 'measure';
  if (stageId === 5) return 'diagnose';
  if (stageId === 6) return 'govern';
  if (stageId === 7) return 'decide';
  if (stageId === 8) return 'build';
  return 'dashboard';
}

export function pathFromStage(stageId) {
  if (stageId === 1) return '/comprender';
  if (stageId === 2 || stageId === 3) return '/representar';
  if (stageId === 4) return '/medir';
  if (stageId === 5) return '/diagnosticar';
  if (stageId === 6) return '/gobernar';
  if (stageId === 7) return '/decidir';
  if (stageId === 8) return '/construir';
  return '/ruta';
}

export function resetWork() {
  persistEnabled = false;
  PersistenceService.clearState(state.selectedCase?.id);
  state = structuredClone(initialState);
  persistEnabled = true;
  notify({ persist: false });
}

export function isDirty() {
  return PersistenceService.isDirty() || Boolean(state.persistence?.isDirty);
}

export async function loadDemoProgress() {
  if (!debugMode) return false;
  const mod = await import('../data/testing/completed-demo-state.json');
  return importProgressState(mod.default);
}

export function getPreparedDocumentSections(collectedData = state.collectedData) {
  const bySection = {};
  collectedData.forEach((item) => {
    const sectionId = item.documentSectionId;
    if (!sectionId) {
      return;
    }
    if (!bySection[sectionId]) {
      bySection[sectionId] = [];
    }
    bySection[sectionId].push(item);
  });
  return bySection;
}

export function writeUnderstandFieldSilent(path, value) {
  writeAnalysisFieldSilent('understand', path, value);
}

export function writeRepresentFieldSilent(path, value) {
  writeAnalysisFieldSilent('represent', path, value);
}

export function writeMeasureFieldSilent(path, value) {
  writeAnalysisFieldSilent('measure', path, value);
}

export function writeDiagnoseFieldSilent(path, value) {
  writeAnalysisFieldSilent('diagnose', path, value);
  if (path === 'draft.description' && state.analysis?.diagnose?.draft) {
    state.analysis.diagnose.draft.warnings = analyzeFindingText(value);
  }
}

export function writeGovernFieldSilent(path, value) {
  writeAnalysisFieldSilent('govern', path, value);
  const govern = state.analysis?.govern;
  if (!govern) {
    return;
  }
  if (path.startsWith('itilDraft.')) {
    const finding = documentedFindings(state).find((item) => item.findingId === govern.itilDraft.findingId);
    govern.itilDraft.warnings = analyzeItilDraft(govern.itilDraft, finding);
  }
  if (path.startsWith('cobitDraft.')) {
    govern.cobitDraft.warnings = analyzeCobitDraft(govern.cobitDraft);
  }
  if (path.startsWith('isoDraft.')) {
    govern.isoDraft.warnings = analyzeIsoDraft(govern.isoDraft);
  }
}

export function writeDecideFieldSilent(path, value) {
  writeAnalysisFieldSilent('decide', path, value);
  if (state.analysis?.decide?.draft) {
    state.analysis.decide.draft.warnings = analyzeDecisionDraft(state.analysis.decide.draft);
  }
}

export function writeBuildFieldSilent(path, value) {
  writeAnalysisFieldSilent('build', path, value);
  if (path === 'conclusions.draft' && state.analysis?.build?.conclusions) {
    state.analysis.build.conclusions.warnings = analyzeConclusionsText(value);
  }
}

function writeAnalysisFieldSilent(area, path, value) {
  const segments = String(path).split('.');
  let cursor = state.analysis?.[area];
  if (!cursor) {
    return;
  }
  for (let index = 0; index < segments.length - 1; index += 1) {
    const key = segments[index];
    if (!cursor[key] || typeof cursor[key] !== 'object') {
      cursor[key] = {};
    }
    cursor = cursor[key];
  }
  cursor[segments[segments.length - 1]] = value;
  if (persistEnabled) {
    PersistenceService.scheduleSave(state);
  }
}

export function openDocumentSection(key) {
  setState({ documentViewKey: key, documentPanelOpen: true, mobileNavOpen: false });
}

export function closeDocumentSectionView() {
  setState({ documentViewKey: null });
}

export function getDocumentSectionTitle(id) {
  return documentSections.find((section) => section.id === id)?.title ?? `Sección ${id}`;
}

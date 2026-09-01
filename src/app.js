import { HomePage, IntroPage } from './pages/Home.js';
import { DashboardPage } from './pages/Dashboard.js';
import { HelpPage } from './pages/Help.js';
import { CaseOverviewPage } from './pages/CaseOverview.js';
import { CaseExplorePage } from './pages/CaseExplore.js';
import { UnderstandPage } from './pages/Understand.js';
import { RepresentPage } from './pages/Represent.js';
import { MeasurePage } from './pages/Measure.js';
import { DiagnosePage } from './pages/Diagnose.js';
import { GovernPage } from './pages/Govern.js';
import { DecidePage } from './pages/Decide.js';
import { BuildPage } from './pages/Build.js';
import { ExportPage } from './pages/Export.js';
import {
  getState,
  setState,
  subscribe,
  selectStage,
  toggleDocumentPanel,
  closeDocumentPanel,
  toggleCollectedPanel,
  closeMethodInfo,
  selectWorkCase,
  addCollectedData,
  removeCollectedData,
  markDataFound,
  answerActivity,
  hydrateFromStorage,
  writeUnderstandFieldSilent,
  writeRepresentFieldSilent,
  writeMeasureFieldSilent,
  writeDiagnoseFieldSilent,
  writeGovernFieldSilent,
  writeDecideFieldSilent,
  writeBuildFieldSilent,
  openDocumentSection,
  importProgressState,
  loadDemoProgress,
} from './state/appState.js';
import {
  toggleContextEvidence,
  setContextField,
  setUnderstandDraft,
  classifyUser,
  classifyServiceItem,
  toggleReviewedService,
  setActiveCriticalService,
  updateCriticalityRecord,
  toggleCompareService,
  toggleTableService,
  classifyRestriction,
  toggleRestriction,
  setUnderstandAnswer,
  setCheckpointAnswer,
  addContextToDocument,
  addOperationsToDocument,
  addServicesToDocument,
  addCriticalServicesToDocument,
  addConstraintsToDocument,
  updateDocumentSectionText,
  completeUnderstandStage,
  setUnderstandSubstage,
} from './state/understandActions.js';
import {
  setRepresentSubstage,
  setRepresentActiveService,
  toggleServiceComponent,
  toggleInventoryComponent,
  setInventoryRelevance,
  setInventoryServiceLink,
  addAsIsNode,
  removeAsIsNode,
  moveAsIsNode,
  setAsIsNodePosition,
  setAsIsDescription,
  setActiveSpofComponent,
  updateSpofRecord,
  acknowledgeSpofReviews,
  linkIncident,
  setRepresentActivity,
  setRepresentCheckpoint,
  addInventoryToDocument,
  addAsIsToDocument,
  addSpofToDocument,
  completeRepresentStage,
} from './state/representActions.js';
import {
  setMeasureSubstage,
  toggleMeasureUsedKey,
  flagMetricsUsingKey,
  setMeasureActivity,
  setMeasureCheckpoint,
  submitAvailabilityStep,
  submitMttr,
  submitMtbfStep,
  submitStorageStep,
  submitPerformanceStep,
  addAvailabilityToDocument,
  addMttrToDocument,
  addMtbfToDocument,
  addCapacityToDocument,
  addStorageToDocument,
  addPerformanceToDocument,
  saveMetricEvidence,
  completeMeasureStage,
  insertMeasureTemplate,
} from './state/measureActions.js';
import {
  setDiagnoseSubstage,
  setDiagnoseFilter,
  setDiagnoseActivity,
  setDiagnoseCheckpoint,
  classifyDatoItem,
  setDraftField,
  applyFindingStarter,
  setDraftKind,
  toggleDraftEvidence,
  ensureDraftEvidence,
  toggleImpactCategory,
  setDraftStep,
  resetFindingDraft,
  loadFindingIntoDraft,
  addFindingToMatrix,
  expandFinding,
  setDiagnoseSort,
  markEvidenceChanged,
  invalidateFindingsUsingKeys,
  addFindingsToDocument,
  completeDiagnoseStage,
  insertSummaryTemplate,
} from './state/diagnoseActions.js';
import {
  setGovernSubstage,
  setGovernActivity,
  setGovernCheckpoint,
  classifyGovernItem,
  selectGovernFinding,
  togglePerspective,
  expandGovernFinding,
  setItilDraftField,
  setCobitDraftField,
  setIsoDraftField,
  toggleCobitResponsible,
  toggleIsoControlType,
  setItilStep,
  setCobitStep,
  setIsoStep,
  saveItilAnalysis,
  saveCobitAnalysis,
  saveIsoAnalysis,
  loadItilIntoDraft,
  loadCobitIntoDraft,
  loadIsoIntoDraft,
  addItilToDocument,
  addCobitToDocument,
  addIsoToDocument,
  completeGovernStage,
} from './state/governActions.js';
import {
  setDecideSubstage,
  setDecideActivity,
  setDecideCheckpoint,
  classifyDecideItem,
  selectDecideFinding,
  toggleDraftFinding,
  toggleDraftEvidence as toggleDecideEvidence,
  setDraftField as setDecideDraftField,
  setConstraintReview,
  addAlternative,
  removeAlternative,
  setTechRating,
  toggleChip,
  expandRecommendation,
  saveRecommendation,
  loadRecommendationIntoDraft,
  addStrategyToDocument,
  addCapexToDocument,
  addRecommendationsToDocument,
  completeDecideStage,
} from './state/decideActions.js';
import {
  setBuildSubstage,
  setBuildActivity,
  setBuildCheckpoint,
  setPreviewMode,
  setPreviewSection,
  toggleIndexOpen,
  expandPreviewRec,
  startSectionEdit,
  clearSectionEdit,
  toggleConclusionChip,
  markPreviewReviewed,
  addConclusionsToDocument,
  completeBuildStage,
} from './state/buildActions.js';
import {
  setExportMode,
  setExportFlag,
  setPreviewFormat,
  toggleExportPreview,
  exportHtml,
  exportDocx,
  startPrintExport,
  finishPrintExport,
} from './state/exportActions.js';
import { contextTemplate } from './data/methodology/understand.js';
import { asIsTemplate } from './data/methodology/represent.js';
import { getPathFromHash, parseRoute, navigate } from './utils/router.js';
import { stages, getStageStatus, isStageActionable } from './data/stages/index.js';
import { appCopy } from './data/copy.js';
import { debugMode, APP_VERSION } from './config.js';
import { downloadProgress, parseProgressFile, loadPersistedState } from './state/persistence.js';
import { installErrorBoundary } from './runtime/errorScreen.js';
import { runAppHealthCheck } from './runtime/healthCheck.js';

const root = document.querySelector('#app');

function render(state) {
  const views = {
    home: HomePage,
    intro: IntroPage,
    dashboard: DashboardPage,
    help: HelpPage,
    caseOverview: CaseOverviewPage,
    caseExplore: CaseExplorePage,
    understand: UnderstandPage,
    represent: RepresentPage,
    measure: MeasurePage,
    diagnose: DiagnosePage,
    govern: GovernPage,
    decide: DecidePage,
    build: BuildPage,
    export: ExportPage,
  };

  const route = parseRoute(getPathFromHash());
  const view = views[state.currentView] ?? HomePage;
  root.innerHTML = view(state, route);
  const previewKey = state.analysis?.build?.previewSection;
  if (state.currentView === 'build' && previewKey) {
    document.getElementById(`doc-sec-${previewKey}`)?.scrollIntoView({ block: 'start' });
  }
  maybeAutoPrint(state);
}

let printQueued = false;
function maybeAutoPrint(state) {
  if (typeof window === 'undefined' || !state.analysis?.export?.printAuto || printQueued) {
    return;
  }
  printQueued = true;
  const done = () => {
    window.removeEventListener('afterprint', done);
    printQueued = false;
    finishPrintExport();
  };
  window.addEventListener('afterprint', done);
  requestAnimationFrame(() => {
    window.print();
  });
}

function syncViewFromLocation() {
  const path = getPathFromHash();
  const route = parseRoute(path);
  const current = getState();

  setState({
    currentView: route.view,
    explorerSectionId: route.sectionId || current.explorerSectionId,
    mobileNavOpen: false,
  });
  if (route.view === 'understand' && route.substage) {
    setUnderstandSubstage(route.substage);
  }
  if (route.view === 'represent' && route.substage) {
    setRepresentSubstage(route.substage);
  }
  if (route.view === 'measure' && route.substage) {
    setMeasureSubstage(route.substage);
  }
  if (route.view === 'diagnose' && route.substage) {
    setDiagnoseSubstage(route.substage);
  }
  if (route.view === 'govern' && route.substage) {
    setGovernSubstage(route.substage);
  }
  if (route.view === 'decide' && route.substage) {
    setDecideSubstage(route.substage);
  }
  if (route.view === 'build' && route.substage) {
    setBuildSubstage(route.substage);
  }
}

function handleClick(event) {
  const navTarget = event.target.closest('[data-nav]');
  if (navTarget) {
    event.preventDefault();
    navigate(navTarget.getAttribute('data-nav'));
    return;
  }

  const actionTarget = event.target.closest('[data-action]');
  if (!actionTarget) {
    return;
  }

  const action = actionTarget.getAttribute('data-action');
  if (actionTarget.matches('input[type="checkbox"], input[type="radio"], select')) {
    return;
  }
  const state = getState();

  if (action === 'toggle-nav') {
    setState({ mobileNavOpen: !state.mobileNavOpen });
    return;
  }

  if (action === 'toggle-document') {
    toggleDocumentPanel();
    return;
  }

  if (action === 'close-document') {
    closeDocumentPanel();
    return;
  }

  if (action === 'toggle-collected') {
    toggleCollectedPanel();
    return;
  }

  if (action === 'close-method-info') {
    closeMethodInfo();
    return;
  }

  if (action === 'select-case') {
    const caseId = actionTarget.getAttribute('data-case-id');
    selectWorkCase(caseId);
    navigate('/caso');
    return;
  }

  if (action === 'why-data') {
    markDataFound(actionTarget.getAttribute('data-data-key'));
    return;
  }

  if (action === 'add-data') {
    addCollectedData(actionTarget.getAttribute('data-data-key'));
    return;
  }

  if (action === 'remove-data') {
    const key = actionTarget.getAttribute('data-data-key');
    removeCollectedData(key);
    flagMetricsUsingKey(key);
    invalidateFindingsUsingKeys([key]);
    return;
  }

  if (action === 'answer-activity') {
    const activityId = actionTarget.getAttribute('data-activity-id');
    const optionId = actionTarget.getAttribute('data-option-id');
    if (activityId === 'why-schedule') {
      setUnderstandAnswer('usersAndOperations', 'scheduleAnswer', optionId);
      return;
    }
    if (activityId === 'same-hours-criticality') {
      setUnderstandAnswer('criticality', 'hoursQuestion', optionId);
      return;
    }
    if (activityId?.startsWith('q')) {
      setCheckpointAnswer(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('rep-q')) {
      setRepresentCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('rep-')) {
      setRepresentActivity(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('m-q')) {
      setMeasureCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('m-')) {
      setMeasureActivity(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('d-q')) {
      setDiagnoseCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('d-')) {
      setDiagnoseActivity(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('g-q')) {
      setGovernCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('g-')) {
      setGovernActivity(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('dec-q')) {
      setDecideCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('dec-')) {
      setDecideActivity(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('b-q')) {
      setBuildCheckpoint(activityId, optionId);
      return;
    }
    if (activityId?.startsWith('b-')) {
      setBuildActivity(activityId, optionId);
      return;
    }
    answerActivity(activityId, optionId);
    return;
  }

  if (action === 'toggle-evidence') {
    toggleContextEvidence(actionTarget.getAttribute('data-evidence-id'));
    return;
  }

  if (action === 'insert-context-template') {
    setUnderstandDraft('context', contextTemplate);
    return;
  }

  if (action === 'add-context-doc') {
    addContextToDocument();
    return;
  }

  if (action === 'add-operations-doc') {
    addOperationsToDocument();
    return;
  }

  if (action === 'add-services-doc') {
    addServicesToDocument();
    return;
  }

  if (action === 'add-critical-doc') {
    addCriticalServicesToDocument();
    return;
  }

  if (action === 'add-constraints-doc') {
    addConstraintsToDocument();
    return;
  }

  if (action === 'classify-user') {
    classifyUser(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }

  if (action === 'classify-service-item') {
    classifyServiceItem(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }

  if (action === 'review-service') {
    toggleReviewedService(actionTarget.getAttribute('data-service-id'));
    return;
  }

  if (action === 'open-criticality') {
    setActiveCriticalService(actionTarget.getAttribute('data-service-id'));
    setUnderstandSubstage(4);
    navigate('/comprender/4');
    return;
  }

  if (action === 'save-criticality') {
    const serviceId = actionTarget.getAttribute('data-service-id');
    const record = getState().analysis?.understand?.criticality?.records?.[serviceId];
    if (!record?.justification?.trim() || !record?.impact) {
      setState({
        documentError:
          'Debes indicar impacto y justificación. No se acepta copiar la criticidad de la tabla sin argumentar.',
      });
      return;
    }
    updateCriticalityRecord(serviceId, { ...record, serviceId });
    setActiveCriticalService(serviceId);
    setState({ documentError: null });
    return;
  }

  if (action === 'toggle-compare') {
    toggleCompareService(actionTarget.getAttribute('data-service-id'));
    return;
  }

  if (action === 'toggle-table-service') {
    toggleTableService(actionTarget.getAttribute('data-service-id'));
    return;
  }

  if (action === 'classify-restriction') {
    classifyRestriction(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }

  if (action === 'toggle-restriction') {
    toggleRestriction(actionTarget.getAttribute('data-item-id'));
    return;
  }

  if (action === 'complete-understand') {
    completeUnderstandStage();
    return;
  }

  if (action === 'select-represent-service') {
    setRepresentActiveService(actionTarget.getAttribute('data-service-id'));
    return;
  }

  if (action === 'add-asis-node') {
    addAsIsNode(actionTarget.getAttribute('data-service-id'), actionTarget.getAttribute('data-component-id'));
    return;
  }

  if (action === 'remove-asis-node') {
    removeAsIsNode(actionTarget.getAttribute('data-service-id'), Number(actionTarget.getAttribute('data-index')));
    return;
  }

  if (action === 'move-asis-node') {
    moveAsIsNode(
      actionTarget.getAttribute('data-service-id'),
      Number(actionTarget.getAttribute('data-index')),
      Number(actionTarget.getAttribute('data-direction')),
    );
    return;
  }

  if (action === 'insert-asis-template') {
    setAsIsDescription(asIsTemplate);
    return;
  }

  if (action === 'add-inventory-doc') {
    addInventoryToDocument();
    return;
  }

  if (action === 'add-asis-doc') {
    addAsIsToDocument();
    return;
  }

  if (action === 'open-spof') {
    setActiveSpofComponent(actionTarget.getAttribute('data-component-id'));
    return;
  }

  if (action === 'save-spof') {
    const componentId = actionTarget.getAttribute('data-component-id');
    const record = getState().analysis?.represent?.spof?.records?.[componentId];
    if (!record?.justification?.trim() || !record?.status) {
      setState({
        documentError: 'Debes elegir un estado SPOF y justificarlo. Único no implica automáticamente SPOF.',
      });
      return;
    }
    updateSpofRecord(componentId, { ...record, componentId, reviewRequired: false });
    setState({ documentError: null });
    return;
  }

  if (action === 'add-spof-doc') {
    addSpofToDocument();
    return;
  }

  if (action === 'ack-spof-review') {
    acknowledgeSpofReviews();
    setState({ documentError: null });
    return;
  }

  if (action === 'complete-represent') {
    completeRepresentStage();
    return;
  }

  if (action === 'submit-availability') {
    submitAvailabilityStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'submit-mttr') {
    submitMttr();
    return;
  }
  if (action === 'submit-mtbf') {
    submitMtbfStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'submit-storage') {
    submitStorageStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'submit-performance') {
    submitPerformanceStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'insert-measure-template') {
    insertMeasureTemplate(actionTarget.getAttribute('data-metric-id'));
    return;
  }
  if (action === 'add-availability-doc') {
    addAvailabilityToDocument();
    return;
  }
  if (action === 'add-mttr-doc') {
    addMttrToDocument();
    return;
  }
  if (action === 'add-mtbf-doc') {
    addMtbfToDocument();
    return;
  }
  if (action === 'add-capacity-doc') {
    addCapacityToDocument();
    return;
  }
  if (action === 'add-storage-doc') {
    addStorageToDocument();
    return;
  }
  if (action === 'add-performance-doc') {
    addPerformanceToDocument();
    return;
  }
  if (action === 'save-capacity-evidence') {
    const existed = (getState().metricEvidence ?? []).some((item) => item.evidenceId === 'metric-capacity-01');
    saveMetricEvidence({
      evidenceId: 'metric-capacity-01',
      metricId: 'capacity',
      data: { cpuPeak: '96 %', latencyPeak: '900 ms', demandPeak: '31 000' },
      interpretation: 'Degradación bajo alta demanda.',
      sourceKeys: ['appCpuPeak', 'appLatencyPeak', 'appDemandPeak'],
    });
    if (existed) {
      markEvidenceChanged('ev-metric-capacity-01');
    }
    return;
  }
  if (action === 'complete-measure') {
    completeMeasureStage();
    return;
  }
  if (action === 'diagnose-filter') {
    setDiagnoseFilter(actionTarget.getAttribute('data-filter'));
    return;
  }
  if (action === 'toggle-finding-evidence') {
    toggleDraftEvidence(actionTarget.getAttribute('data-evidence-id'));
    return;
  }
  if (action === 'touch-evidence') {
    markEvidenceChanged(actionTarget.getAttribute('data-evidence-id'));
    return;
  }
  if (action === 'diagnose-builder-step') {
    setDraftStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'apply-starter') {
    applyFindingStarter(actionTarget.getAttribute('data-starter'));
    return;
  }
  if (action === 'add-finding') {
    addFindingToMatrix();
    return;
  }
  if (action === 'reset-finding-draft') {
    resetFindingDraft();
    return;
  }
  if (action === 'expand-finding') {
    expandFinding(actionTarget.getAttribute('data-finding-id'));
    return;
  }
  if (action === 'edit-finding') {
    loadFindingIntoDraft(actionTarget.getAttribute('data-finding-id'));
    navigate('/diagnosticar/3');
    return;
  }
  if (action === 'sort-findings') {
    setDiagnoseSort(actionTarget.getAttribute('data-sort'));
    return;
  }
  if (action === 'start-missing-finding') {
    setDraftKind('missing');
    setDraftField('category', 'missing');
    ensureDraftEvidence('ev-missing-history');
    setDraftStep(3);
    setDiagnoseSubstage(3);
    navigate('/diagnosticar/3');
    return;
  }
  if (action === 'insert-summary-template') {
    insertSummaryTemplate();
    return;
  }
  if (action === 'add-findings-doc') {
    addFindingsToDocument();
    return;
  }
  if (action === 'complete-diagnose') {
    completeDiagnoseStage();
    return;
  }
  if (action === 'select-govern-finding') {
    selectGovernFinding(actionTarget.getAttribute('data-finding-id'));
    return;
  }
  if (action === 'expand-govern-finding') {
    expandGovernFinding(actionTarget.getAttribute('data-finding-id'));
    return;
  }
  if (action === 'itil-step') {
    setItilStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'cobit-step') {
    setCobitStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'iso-step') {
    setIsoStep(actionTarget.getAttribute('data-step'));
    return;
  }
  if (action === 'save-itil') {
    saveItilAnalysis();
    return;
  }
  if (action === 'save-cobit') {
    saveCobitAnalysis();
    return;
  }
  if (action === 'save-iso') {
    saveIsoAnalysis();
    return;
  }
  if (action === 'edit-itil') {
    loadItilIntoDraft(actionTarget.getAttribute('data-analysis-id'));
    navigate('/gobernar/3');
    return;
  }
  if (action === 'edit-cobit') {
    loadCobitIntoDraft(actionTarget.getAttribute('data-analysis-id'));
    navigate('/gobernar/4');
    return;
  }
  if (action === 'edit-iso') {
    loadIsoIntoDraft(actionTarget.getAttribute('data-analysis-id'));
    navigate('/gobernar/5');
    return;
  }
  if (action === 'add-itil-doc') {
    addItilToDocument();
    return;
  }
  if (action === 'add-cobit-doc') {
    addCobitToDocument();
    return;
  }
  if (action === 'add-iso-doc') {
    addIsoToDocument();
    return;
  }
  if (action === 'complete-govern') {
    completeGovernStage();
    return;
  }
  if (action === 'select-decide-finding') {
    selectDecideFinding(actionTarget.getAttribute('data-finding-id'));
    return;
  }
  if (action === 'toggle-rec-finding') {
    toggleDraftFinding(actionTarget.getAttribute('data-finding-id'));
    return;
  }
  if (action === 'add-alternative') {
    const type = document.querySelector('#alt-type')?.value;
    const title = document.querySelector('#alt-title')?.value;
    const desc = document.querySelector('#alt-desc')?.value;
    addAlternative(type, title, desc);
    return;
  }
  if (action === 'remove-alternative') {
    removeAlternative(actionTarget.getAttribute('data-alt-id'));
    return;
  }
  if (action === 'select-alternative') {
    setDecideDraftField('selectedAlternativeId', actionTarget.getAttribute('data-alt-id'));
    return;
  }
  if (action === 'impact-effort') {
    setDecideDraftField('impactEffort', actionTarget.getAttribute('data-id'));
    return;
  }
  if (action === 'save-recommendation') {
    saveRecommendation();
    return;
  }
  if (action === 'expand-rec') {
    expandRecommendation(actionTarget.getAttribute('data-rec-id'));
    return;
  }
  if (action === 'edit-rec') {
    loadRecommendationIntoDraft(actionTarget.getAttribute('data-rec-id'));
    navigate('/decidir/2');
    return;
  }
  if (action === 'add-strategy-doc') {
    addStrategyToDocument();
    return;
  }
  if (action === 'add-capex-doc') {
    addCapexToDocument();
    return;
  }
  if (action === 'add-recs-doc') {
    addRecommendationsToDocument();
    return;
  }
  if (action === 'complete-decide') {
    completeDecideStage();
    return;
  }
  if (action === 'goto-preview-section' || action === 'scroll-doc-section') {
    setPreviewSection(actionTarget.getAttribute('data-section-key'));
    navigate('/construir/5');
    return;
  }
  if (action === 'preview-mode') {
    setPreviewMode(actionTarget.getAttribute('data-mode'));
    return;
  }
  if (action === 'toggle-doc-index') {
    toggleIndexOpen();
    return;
  }
  if (action === 'mark-preview-reviewed') {
    markPreviewReviewed();
    return;
  }
  if (action === 'expand-preview-rec') {
    expandPreviewRec(actionTarget.getAttribute('data-rec-id'));
    return;
  }
  if (action === 'edit-from-preview') {
    startSectionEdit(actionTarget.getAttribute('data-section-key'));
    navigate(actionTarget.getAttribute('data-path'));
    return;
  }
  if (action === 'return-to-preview') {
    clearSectionEdit();
    navigate('/construir/5');
    return;
  }
  if (action === 'review-issue') {
    startSectionEdit(actionTarget.getAttribute('data-section-key'));
    navigate(actionTarget.getAttribute('data-path'));
    return;
  }
  if (action === 'open-trace-node') {
    navigate(actionTarget.getAttribute('data-path'));
    return;
  }
  if (action === 'save-conclusions') {
    addConclusionsToDocument();
    return;
  }
  if (action === 'complete-build') {
    completeBuildStage();
    return;
  }
  if (action === 'goto-export') {
    navigate('/exportar');
    return;
  }
  if (action === 'export-preview') {
    toggleExportPreview(!state.analysis?.export?.previewOpen);
    return;
  }
  if (action === 'preview-format') {
    setPreviewFormat(actionTarget.getAttribute('data-format'));
    return;
  }
  if (action === 'export-html') {
    exportHtml();
    return;
  }
  if (action === 'export-docx') {
    exportDocx();
    return;
  }
  if (action === 'export-print') {
    if (startPrintExport({ auto: true })) {
      navigate('/exportar/imprimir');
    }
    return;
  }
  if (action === 'do-print') {
    window.print();
    finishPrintExport();
    return;
  }
  if (action === 'export-progress' || action === 'fatal-download') {
    try {
      const source = action === 'fatal-download' ? reconstructStoredState() : state;
      downloadProgress(source);
    } catch (error) {
      setState({ documentError: error.message || 'No hay progreso para descargar.' });
    }
    return;
  }
  if (action === 'load-demo') {
    loadDemoProgress().then((ok) => {
      if (!ok) {
        setState({ documentError: 'La demostración solo está disponible en modo de desarrollo.' });
        return;
      }
      setState({ documentError: null });
      navigate('/ruta');
    });
    return;
  }
  if (action === 'fatal-reload') {
    window.location.reload();
  }
  if (action === 'classify-decide') {
    classifyDecideItem(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }
  if (action === 'classify-gov') {
    classifyGovernItem(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }
  if (action === 'classify-dato') {
    classifyDatoItem(actionTarget.getAttribute('data-item-id'), actionTarget.getAttribute('data-value'));
    return;
  }

  if (action === 'view-document-section') {
    openDocumentSection(actionTarget.getAttribute('data-section-key'));
    return;
  }

  if (action === 'save-doc-edit') {
    const key = actionTarget.getAttribute('data-section-key');
    const textarea = document.querySelector(`[data-doc-edit="${key}"]`);
    updateDocumentSectionText(key, textarea?.value ?? '');
    return;
  }

  if (action === 'select-stage') {
    const stageId = Number(actionTarget.getAttribute('data-stage-id'));
    const stage = stages.find((item) => item.id === stageId);
    if (!stage) {
      return;
    }
    const status = getStageStatus(stage, state);
    if (!isStageActionable(status)) {
      return;
    }
    selectStage(stageId);
    if (stageId === 1) {
      navigate('/comprender');
    }
    if (stageId === 2) {
      navigate('/representar');
    }
    if (stageId === 4) {
      navigate('/medir');
    }
    if (stageId === 5) {
      navigate('/diagnosticar');
    }
    if (stageId === 6) {
      navigate('/gobernar');
    }
    if (stageId === 7) {
      navigate('/decidir');
    }
    if (stageId === 8) {
      navigate('/construir');
    }
  }
}

function handleChange(event) {
  const target = event.target;
  if (target.matches('[data-action="export-mode"]')) {
    setExportMode(target.getAttribute('data-mode'));
    return;
  }
  if (target.matches('[data-action="export-flag"]')) {
    setExportFlag(target.getAttribute('data-flag'), target.checked);
    return;
  }
  if (target.matches('[data-action="import-progress"], [data-action="fatal-import"]')) {
    const file = target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const payload = parseProgressFile(String(reader.result || ''));
        if (!importProgressState(payload)) {
          throw new Error('No se pudo aplicar el progreso.');
        }
        setState({ documentError: null });
        if (target.getAttribute('data-action') === 'fatal-import') {
          window.location.hash = '/ruta';
          window.location.reload();
          return;
        }
        navigate('/ruta');
      } catch (error) {
        setState({ documentError: error.message || 'No se pudo importar el progreso.' });
      }
    };
    reader.readAsText(file);
    return;
  }
  if (target.matches('[data-action="change-section"]')) {
    navigate(`/explorar/${target.value}`);
    return;
  }
  if (target.matches('[data-action="context-slot"]')) {
    setContextField(target.getAttribute('data-slot'), target.value);
    return;
  }
  if (target.matches('[data-action="crit-field"]')) {
    updateCriticalityRecord(target.getAttribute('data-service-id'), {
      [target.getAttribute('data-field')]: target.value,
    });
    return;
  }
  if (target.matches('[data-action="toggle-evidence"]')) {
    toggleContextEvidence(target.getAttribute('data-evidence-id'));
    return;
  }
  if (target.matches('[data-action="toggle-compare"]')) {
    toggleCompareService(target.getAttribute('data-service-id'));
    return;
  }
  if (target.matches('[data-action="toggle-table-service"]')) {
    toggleTableService(target.getAttribute('data-service-id'));
    return;
  }
  if (target.matches('[data-action="toggle-restriction"]')) {
    toggleRestriction(target.getAttribute('data-item-id'));
    return;
  }
  if (target.matches('[data-action="toggle-service-component"]')) {
    toggleServiceComponent(target.getAttribute('data-service-id'), target.getAttribute('data-component-id'));
    return;
  }
  if (target.matches('[data-action="toggle-inventory"]')) {
    toggleInventoryComponent(target.getAttribute('data-component-id'));
    return;
  }
  if (target.matches('[data-action="inventory-relevance"]')) {
    setInventoryRelevance(target.getAttribute('data-component-id'), target.value);
    return;
  }
  if (target.matches('[data-action="inventory-service"]')) {
    setInventoryServiceLink(target.getAttribute('data-component-id'), target.getAttribute('data-service-id'));
    return;
  }
  if (target.matches('[data-action="position-asis-node"]')) {
    setAsIsNodePosition(
      target.getAttribute('data-service-id'),
      Number(target.getAttribute('data-index')),
      Number(target.value),
    );
    return;
  }
  if (target.matches('[data-action="spof-field"]')) {
    updateSpofRecord(target.getAttribute('data-component-id'), {
      [target.getAttribute('data-field')]: target.value,
    });
    return;
  }
  if (target.matches('[data-action="link-incident"]')) {
    linkIncident(target.getAttribute('data-incident-id'), target.getAttribute('data-component-id'));
    return;
  }
  if (target.matches('[data-action="toggle-measure-key"]')) {
    toggleMeasureUsedKey(target.getAttribute('data-data-key'));
    return;
  }
  if (target.matches('[data-action="finding-category"]')) {
    setDraftField('category', target.value);
    return;
  }
  if (target.matches('[data-action="finding-criticality"]')) {
    setDraftField('criticality', target.value);
    return;
  }
  if (target.matches('[data-action="toggle-impact-cat"]')) {
    toggleImpactCategory(target.getAttribute('data-category'));
    return;
  }
  if (target.matches('[data-action="toggle-perspective"]')) {
    togglePerspective(target.getAttribute('data-framework'));
    return;
  }
  if (target.matches('[data-action="itil-practice"]')) {
    setItilDraftField('practice', target.value);
    return;
  }
  if (target.matches('[data-action="itil-indicator"]')) {
    setItilDraftField('indicator', target.value);
    return;
  }
  if (target.matches('[data-action="toggle-cobit-resp"]')) {
    toggleCobitResponsible(target.getAttribute('data-resp'));
    return;
  }
  if (target.matches('[data-action="cobit-indicator"]')) {
    setCobitDraftField('indicator', target.value);
    return;
  }
  if (target.matches('[data-action="iso-asset"]')) {
    setIsoDraftField('assetId', target.value);
    return;
  }
  if (target.matches('[data-action="iso-threat"]')) {
    setIsoDraftField('threatId', target.value);
    return;
  }
  if (target.matches('[data-action="iso-vuln"]')) {
    setIsoDraftField('vulnerabilityId', target.value);
    return;
  }
  if (target.matches('[data-action="toggle-iso-control-type"]')) {
    toggleIsoControlType(target.getAttribute('data-type'));
    return;
  }
  if (target.matches('[data-action="toggle-dec-evidence"]')) {
    toggleDecideEvidence(target.getAttribute('data-evidence-id'));
    return;
  }
  if (target.matches('[data-action="constraint-review"]')) {
    setConstraintReview(target.getAttribute('data-constraint-id'), target.value);
    return;
  }
  if (target.matches('[data-action="toggle-simple-op"]')) {
    setDecideDraftField('simpleOperational', target.checked);
    return;
  }
  if (target.matches('[data-action="tech-rating"]')) {
    setTechRating(target.getAttribute('data-model'), target.getAttribute('data-criterion'), target.value);
    return;
  }
  if (target.matches('[data-action="toggle-benefit"]')) {
    toggleChip('benefits', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-risk"]')) {
    toggleChip('risks', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-residual"]')) {
    setDecideDraftField('residualLow', target.checked);
    return;
  }
  if (target.matches('[data-action="cost-model"]')) {
    setDecideDraftField('costModel', target.value);
    return;
  }
  if (target.matches('[data-action="toggle-metric"]')) {
    toggleChip('metricIds', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-target-undef"]')) {
    setDecideDraftField('targetUndefined', target.checked);
    return;
  }
  if (target.matches('[data-action="priority-level"]')) {
    setDecideDraftField('priority', target.value);
    return;
  }
  if (target.matches('[data-action="toggle-conc-finding"]')) {
    toggleConclusionChip('selectedFindings', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-conc-strength"]')) {
    toggleConclusionChip('selectedStrengths', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-conc-constraint"]')) {
    toggleConclusionChip('constraintIds', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-conc-priority"]')) {
    toggleConclusionChip('priorities', target.getAttribute('data-id'));
    return;
  }
  if (target.matches('[data-action="toggle-conc-limit"]')) {
    toggleConclusionChip('limitations', target.getAttribute('data-id'));
  }
}

function handleInput(event) {
  const draft = event.target.getAttribute('data-draft');
  if (!draft) {
    return;
  }
  if (event.target.getAttribute('data-scope') === 'represent') {
    writeRepresentFieldSilent(draft, event.target.value);
    return;
  }
  if (event.target.getAttribute('data-scope') === 'measure') {
    writeMeasureFieldSilent(draft, event.target.value);
    return;
  }
  if (event.target.getAttribute('data-scope') === 'diagnose') {
    writeDiagnoseFieldSilent(draft, event.target.value);
    return;
  }
  if (event.target.getAttribute('data-scope') === 'govern') {
    writeGovernFieldSilent(draft, event.target.value);
    return;
  }
  if (event.target.getAttribute('data-scope') === 'decide') {
    writeDecideFieldSilent(draft, event.target.value);
    return;
  }
  if (event.target.getAttribute('data-scope') === 'build') {
    writeBuildFieldSilent(draft, event.target.value);
    return;
  }
  writeUnderstandFieldSilent(draft, event.target.value);
}

function handleKeydown(event) {
  if (event.key !== 'Escape') {
    return;
  }

  const state = getState();
  if (state.methodInfoKey) {
    closeMethodInfo();
    return;
  }
  if (state.collectedPanelOpen) {
    toggleCollectedPanel();
    return;
  }
  if (state.documentPanelOpen) {
    closeDocumentPanel();
    return;
  }
  if (state.mobileNavOpen) {
    setState({ mobileNavOpen: false });
  }
}

export function bootstrap() {
  const showFatal = installErrorBoundary(root, () => {});
  try {
    const health = runAppHealthCheck();
    if (!health.ok && debugMode) {
      console.warn('AppHealthCheck', health.issues);
    }
    hydrateFromStorage();
    subscribe(render);

    window.addEventListener('hashchange', syncViewFromLocation);
    document.addEventListener('click', handleClick);
    document.addEventListener('change', handleChange);
    document.addEventListener('input', handleInput);
    document.addEventListener('keydown', handleKeydown);

    if (!window.location.hash) {
      window.location.hash = '/';
    }

    syncViewFromLocation();
    document.title = `InfraGuide | Gestión de la Infraestructura · v${APP_VERSION}`;
  } catch (error) {
    showFatal(error);
  }
}

function reconstructStoredState() {
  const stored = loadPersistedState();
  if (!stored) {
    throw new Error('No hay progreso guardado en este navegador.');
  }
  return {
    selectedCase: stored.selectedCaseId ? { id: stored.selectedCaseId } : null,
    ...stored,
  };
}

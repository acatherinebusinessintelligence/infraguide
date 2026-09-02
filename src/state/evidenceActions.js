import { getPathFromHash, navigate } from '../utils/router.js';
import { getState, setState, getSelectedCaseData } from './appState.js';
import { PersistenceService } from './persistence.js';
import {
  getEvidenceById,
  getEvidenceForField,
  getPrimarySourceDocument,
  getSourceSection,
} from '../data/evidence/index.js';

let pendingScrollRestore = null;

function closedViewer() {
  return {
    open: false,
    documentId: null,
    page: null,
    evidenceId: null,
    fieldKey: null,
    sourceSectionId: null,
    mode: 'read',
  };
}

export function createPdfViewerState() {
  return closedViewer();
}

export function createCaseReadingState() {
  return {
    introCompleted: false,
    guidedStep: 1,
    openedPdf: false,
    pageCount: null,
    notes: {},
  };
}

export function captureReturnContext(extras = {}) {
  return {
    path: getPathFromHash(),
    scrollY: typeof window !== 'undefined' ? Math.round(window.scrollY) : 0,
    view: getState().currentView,
    field: extras.field || extras.fieldKey || null,
    evidenceId: extras.evidenceId || null,
    stage: extras.stage || getState().currentView,
    component: extras.component || null,
    activity: extras.activity || null,
  };
}

export function openCasePdf({
  evidenceId = null,
  fieldKey = null,
  sourceSectionId = null,
  page = null,
  component = '',
  activity = '',
  asOverlay = true,
} = {}) {
  const state = getState();
  const caseData = getSelectedCaseData();
  const evidence =
    (evidenceId ? getEvidenceById(caseData, evidenceId) : null) ||
    (fieldKey ? getEvidenceForField(caseData, fieldKey) : null);
  const doc = getPrimarySourceDocument(caseData);
  const section = sourceSectionId ? getSourceSection(caseData, sourceSectionId) : null;
  const requested = Number(page);
  const targetPage =
    Number.isFinite(requested) && requested >= 1
      ? requested
      : Number(evidence?.page) >= 1
        ? Number(evidence.page)
        : Number(section?.page) >= 1
          ? Number(section.page)
          : null;
  const returnTo = asOverlay ? captureReturnContext({ fieldKey, evidenceId, component, activity }) : state.evidenceReturn;

  setState({
    pdfViewer: {
      open: true,
      documentId: doc?.id || 'caso-helados-boreal',
      page: targetPage,
      evidenceId: evidence?.evidenceId || evidenceId,
      fieldKey: evidence?.fieldKey || fieldKey,
      sourceSectionId: sourceSectionId || evidence?.sourceSectionId || null,
      mode: evidence || fieldKey ? 'evidence' : 'read',
    },
    evidenceReturn: returnTo,
    caseReading: {
      ...createCaseReadingState(),
      ...(state.caseReading || {}),
      openedPdf: true,
    },
  });
}

export function closePdfViewer() {
  const returnTo = getState().evidenceReturn;
  pendingScrollRestore = returnTo;
  setState({
    pdfViewer: closedViewer(),
    evidenceReturn: null,
  });
  if (returnTo?.path && getPathFromHash() !== returnTo.path) {
    navigate(returnTo.path);
    return;
  }
  if (getPathFromHash().startsWith('/caso/documento')) {
    navigate('/caso');
    return;
  }
  applyScrollRestore();
}

export function applyScrollRestore() {
  if (!pendingScrollRestore || typeof window === 'undefined') {
    return;
  }
  const { scrollY, field } = pendingScrollRestore;
  pendingScrollRestore = null;
  requestAnimationFrame(() => {
    window.scrollTo(0, Number(scrollY) || 0);
    if (field) {
      const node = document.querySelector(`[data-evidence-field="${CSS.escape(field)}"]`) || document.querySelector(`[data-data-key="${CSS.escape(field)}"]`);
      node?.scrollIntoView({ block: 'center' });
      if (node instanceof HTMLElement) {
        node.focus({ preventScroll: true });
      }
    }
  });
}

export function completeCaseIntro() {
  const state = getState();
  setState({
    caseReading: {
      ...createCaseReadingState(),
      ...(state.caseReading || {}),
      introCompleted: true,
    },
  });
  navigate('/caso');
}

export function startGuidedReading() {
  const state = getState();
  setState({
    caseReading: {
      ...createCaseReadingState(),
      ...(state.caseReading || {}),
      introCompleted: true,
      guidedStep: state.caseReading?.guidedStep || 1,
    },
  });
  navigate('/caso/lectura');
}

export function setGuidedStep(step) {
  const state = getState();
  const next = Number(step) || 1;
  setState({
    caseReading: {
      ...createCaseReadingState(),
      ...(state.caseReading || {}),
      guidedStep: next,
    },
  });
}

export function writeGuidedNote(stepId, value) {
  const state = getState();
  if (!state.caseReading) {
    state.caseReading = createCaseReadingState();
  }
  if (!state.caseReading.notes || typeof state.caseReading.notes !== 'object') {
    state.caseReading.notes = {};
  }
  state.caseReading.notes[stepId] = value;
  PersistenceService.scheduleSave(state);
}

export function setReadingPageCount(count) {
  const state = getState();
  if (!state.caseReading) {
    state.caseReading = createCaseReadingState();
  }
  if (state.caseReading.pageCount === count) return;
  state.caseReading.pageCount = count;
}

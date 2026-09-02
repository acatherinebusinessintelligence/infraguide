import { STORAGE_PREFIX } from '../config.js';

const MODEL_NAV_KEY = `${STORAGE_PREFIX}:model-nav`;
const LAST_SESSION_KEY = `${STORAGE_PREFIX}:last-session`;

function readAll() {
  if (typeof window === 'undefined' || !window.localStorage) return {};
  try {
    const raw = window.localStorage.getItem(MODEL_NAV_KEY);
    const parsed = raw ? JSON.parse(raw) : {};
    return parsed && typeof parsed === 'object' ? parsed : {};
  } catch {
    return {};
  }
}

function writeAll(value) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    window.localStorage.setItem(MODEL_NAV_KEY, JSON.stringify(value));
  } catch {
    /* ignore quota */
  }
}

export function loadModelNavigation(caseId) {
  if (!caseId) return null;
  const entry = readAll()[caseId];
  return entry && typeof entry === 'object' ? entry : null;
}

export function saveModelNavigation(caseId, nav) {
  if (!caseId) return;
  const all = readAll();
  all[caseId] = {
    lastStage: nav.lastStage ?? 0,
    lastEvidence: nav.lastEvidence ?? null,
    pdfPage: nav.pdfPage ?? null,
    exploredSections: Array.isArray(nav.exploredSections) ? nav.exploredSections : [],
    currentView: nav.currentView ?? 'dashboard',
    lastPath: nav.lastPath ?? '/ruta',
  };
  writeAll(all);
}

export function saveLastSession(caseId, caseMode) {
  if (typeof window === 'undefined' || !window.localStorage) return;
  try {
    if (!caseId) {
      window.localStorage.removeItem(LAST_SESSION_KEY);
      return;
    }
    window.localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({ caseId, caseMode: caseMode || null }));
  } catch {
    /* ignore quota */
  }
}

export function loadLastSession() {
  if (typeof window === 'undefined' || !window.localStorage) return null;
  try {
    const raw = window.localStorage.getItem(LAST_SESSION_KEY);
    const parsed = raw ? JSON.parse(raw) : null;
    return parsed && parsed.caseId ? parsed : null;
  } catch {
    return null;
  }
}

export function clearLastSession() {
  saveLastSession(null, null);
}

export function navigationFromState(state) {
  return {
    lastStage: state.currentStage ?? 0,
    lastEvidence: state.pdfViewer?.evidenceId || state.lastCollectedKey || null,
    pdfPage: state.pdfViewer?.page ?? null,
    exploredSections: Array.isArray(state.modelExploredSections) ? state.modelExploredSections : [],
    currentView: state.currentView ?? 'dashboard',
    lastPath: typeof window !== 'undefined' ? window.location?.hash?.replace(/^#/, '') || '/ruta' : '/ruta',
  };
}

import { persistableExport } from '../exportModel.js';
import { APP_VERSION, STATE_VERSION } from '../../config.js';
import { checksum } from './checksum.js';
import { sanitizePersistedValue } from './sanitize.js';

const ANALYSIS_KEYS = ['understand', 'represent', 'measure', 'diagnose', 'govern', 'decide', 'build', 'export'];

export function buildPersistablePayload(state) {
  const caseId = state.selectedCase?.id ?? state.meta?.caseId ?? null;
  const documentVersion =
    Number(state.meta?.documentVersion) ||
    Number(state.analysis?.export?.nextVersion) ||
    1;
  const createdAt = state.meta?.createdAt || new Date().toISOString();
  const payload = {
    meta: {
      stateVersion: STATE_VERSION,
      infraGuideVersion: APP_VERSION,
      createdAt,
      updatedAt: new Date().toISOString(),
      caseId,
      documentVersion,
    },
    selectedCase: state.selectedCase
      ? {
          id: state.selectedCase.id,
          name: state.selectedCase.name,
          kind: state.selectedCase.kind,
          kindLabel: state.selectedCase.kindLabel,
        }
      : null,
    collectedData: Array.isArray(state.collectedData) ? state.collectedData : [],
    analysis: persistableAnalysis(state.analysis),
    documentSections: state.documentSections && typeof state.documentSections === 'object' ? state.documentSections : {},
    progress: Number.isFinite(state.progress) ? state.progress : 0,
    completedStages: Array.isArray(state.completedStages) ? state.completedStages : [],
    currentStage: state.currentStage ?? 0,
    methodologyStatus: state.methodologyStatus && typeof state.methodologyStatus === 'object' ? state.methodologyStatus : {},
    explorerSectionId: state.explorerSectionId ?? 'operational-data',
    activityAnswers: state.activityAnswers && typeof state.activityAnswers === 'object' ? state.activityAnswers : {},
    metricEvidence: Array.isArray(state.metricEvidence) ? state.metricEvidence : [],
    caseReading: state.caseReading && typeof state.caseReading === 'object'
      ? {
          introCompleted: Boolean(state.caseReading.introCompleted),
          guidedStep: Number(state.caseReading.guidedStep) || 1,
          openedPdf: Boolean(state.caseReading.openedPdf),
          pageCount: state.caseReading.pageCount ?? null,
          notes: state.caseReading.notes && typeof state.caseReading.notes === 'object' ? state.caseReading.notes : {},
        }
      : {
          introCompleted: false,
          guidedStep: 1,
          openedPdf: false,
          pageCount: null,
          notes: {},
        },
  };
  return payload;
}

export function persistableAnalysis(analysis = {}) {
  const next = {};
  ANALYSIS_KEYS.forEach((key) => {
    if (key === 'export') {
      next.export = persistableExport(analysis?.export);
      return;
    }
    next[key] = analysis?.[key] ?? {};
  });
  return next;
}

export function wrapEnvelope(payload, extras = {}) {
  const meta = payload.meta ?? {};
  const body = {
    stateVersion: Number(meta.stateVersion) || STATE_VERSION,
    infraGuideVersion: meta.infraGuideVersion || APP_VERSION,
    createdAt: meta.createdAt || extras.createdAt || new Date().toISOString(),
    updatedAt: meta.updatedAt || new Date().toISOString(),
    caseId: meta.caseId ?? payload.selectedCase?.id ?? extras.caseId ?? null,
    documentVersion: Number(meta.documentVersion) || 1,
    payload,
  };
  return {
    ...body,
    checksum: checksum(checksumTarget(body)),
  };
}

export function checksumTarget(envelope) {
  const { checksum: _ignored, ...rest } = envelope;
  return rest;
}

export function envelopeFingerprint(envelope) {
  return JSON.stringify(envelope?.payload ?? envelope);
}

export function normalizeLoadedPayload(input) {
  if (!input || typeof input !== 'object') return null;
  if (input.payload && typeof input.payload === 'object') {
    return sanitizePersistedValue({
      ...input.payload,
      meta: {
        stateVersion: input.stateVersion ?? input.payload.meta?.stateVersion,
        infraGuideVersion: input.infraGuideVersion ?? input.payload.meta?.infraGuideVersion,
        createdAt: input.createdAt ?? input.payload.meta?.createdAt,
        updatedAt: input.updatedAt ?? input.payload.meta?.updatedAt,
        caseId: input.caseId ?? input.payload.meta?.caseId ?? input.payload.selectedCaseId ?? null,
        documentVersion: input.documentVersion ?? input.payload.meta?.documentVersion ?? 1,
      },
    });
  }
  return sanitizePersistedValue(legacyToPayload(input));
}

export function legacyToPayload(parsed) {
  const selectedCaseId = parsed.selectedCaseId ?? parsed.selectedCase?.id ?? parsed.meta?.caseId ?? null;
  return {
    meta: {
      stateVersion: parsed.stateVersion ?? parsed.persistenceVersion ?? 1,
      infraGuideVersion: parsed.infraGuideVersion ?? parsed.appVersion ?? APP_VERSION,
      createdAt: parsed.createdAt ?? parsed.meta?.createdAt ?? null,
      updatedAt: parsed.updatedAt ?? parsed.meta?.updatedAt ?? null,
      caseId: selectedCaseId,
      documentVersion: parsed.documentVersion ?? parsed.meta?.documentVersion ?? 1,
    },
    selectedCase: parsed.selectedCase ?? (selectedCaseId ? { id: selectedCaseId } : null),
    collectedData: Array.isArray(parsed.collectedData) ? parsed.collectedData : [],
    analysis: parsed.analysis ?? {},
    documentSections: parsed.documentSections ?? {},
    progress: parsed.progress ?? 0,
    completedStages: Array.isArray(parsed.completedStages) ? parsed.completedStages : [],
    currentStage: parsed.currentStage ?? 0,
    methodologyStatus: parsed.methodologyStatus ?? {},
    explorerSectionId: parsed.explorerSectionId ?? 'operational-data',
    activityAnswers: parsed.activityAnswers ?? {},
    metricEvidence: Array.isArray(parsed.metricEvidence) ? parsed.metricEvidence : [],
  };
}

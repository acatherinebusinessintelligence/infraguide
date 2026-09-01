import { STATE_VERSION, APP_VERSION } from '../../config.js';
import { checksumMatches, checksum } from './checksum.js';
import { checksumTarget, legacyToPayload } from './payload.js';

const ANALYSIS_KEYS = ['understand', 'represent', 'measure', 'diagnose', 'govern', 'decide', 'build', 'export'];

export function validateState(input, options = {}) {
  const errors = [];
  const warnings = [];
  if (!input || typeof input !== 'object' || Array.isArray(input)) {
    return fail('El estado no es un objeto válido.');
  }

  const envelope = isEnvelope(input) ? input : wrapAsEnvelope(input);
  const version = Number(envelope.stateVersion ?? envelope.payload?.meta?.stateVersion ?? envelope.persistenceVersion);

  if (!Number.isFinite(version)) {
    errors.push('Falta stateVersion.');
  } else if (version > STATE_VERSION) {
    return {
      ok: false,
      code: 'FUTURE_VERSION',
      errors: ['Este progreso fue creado con una versión más reciente de InfraGuide.'],
      warnings,
      envelope,
      version,
    };
  } else if (version < 1) {
    warnings.push('Versión de estado ausente; se tratará como formato inicial.');
  }

  if (options.requireChecksum && envelope.checksum && !checksumMatches(checksumTarget(envelope), envelope.checksum)) {
    errors.push('El archivo parece incompleto o dañado.');
  } else if (envelope.checksum && !checksumMatches(checksumTarget(envelope), envelope.checksum)) {
    warnings.push('El checksum no coincide; el contenido se validará por estructura.');
  }

  const payload = envelope.payload ?? legacyToPayload(envelope);
  if (!payload || typeof payload !== 'object') {
    errors.push('Falta la estructura de progreso.');
    return { ok: false, code: 'INVALID', errors, warnings, envelope, version };
  }

  const caseId = envelope.caseId ?? payload.meta?.caseId ?? payload.selectedCase?.id ?? payload.selectedCaseId ?? null;
  if (caseId != null && typeof caseId !== 'string') {
    errors.push('caseId no es válido.');
  }

  if (payload.collectedData != null && !Array.isArray(payload.collectedData)) {
    errors.push('collectedData debe ser una lista.');
  }
  if (payload.completedStages != null && !Array.isArray(payload.completedStages)) {
    errors.push('completedStages debe ser una lista.');
  }
  if (payload.metricEvidence != null && !Array.isArray(payload.metricEvidence)) {
    errors.push('metricEvidence debe ser una lista.');
  }
  if (payload.documentSections != null && (typeof payload.documentSections !== 'object' || Array.isArray(payload.documentSections))) {
    errors.push('documentSections debe ser un objeto.');
  }
  if (payload.analysis != null && (typeof payload.analysis !== 'object' || Array.isArray(payload.analysis))) {
    errors.push('analysis debe ser un objeto.');
  } else if (payload.analysis) {
    ANALYSIS_KEYS.forEach((key) => {
      if (payload.analysis[key] != null && typeof payload.analysis[key] !== 'object') {
        errors.push(`analysis.${key} no tiene el tipo esperado.`);
      }
    });
  }

  if (payload.activityAnswers != null && typeof payload.activityAnswers !== 'object') {
    errors.push('activityAnswers debe ser un objeto.');
  }

  const code = errors.length ? 'INVALID' : 'OK';
  return {
    ok: errors.length === 0,
    code,
    errors,
    warnings,
    envelope: { ...envelope, payload, caseId, stateVersion: version || STATE_VERSION },
    version: version || STATE_VERSION,
    caseId,
    infraGuideVersion: envelope.infraGuideVersion || payload.meta?.infraGuideVersion || APP_VERSION,
  };
}

export function isEnvelope(value) {
  return Boolean(value && typeof value === 'object' && (value.payload || (value.stateVersion && value.selectedCaseId == null && value.checksum)));
}

function wrapAsEnvelope(input) {
  const payload = input.payload ?? legacyToPayload(input);
  const body = {
    stateVersion: Number(input.stateVersion ?? input.persistenceVersion ?? payload.meta?.stateVersion) || 1,
    infraGuideVersion: input.infraGuideVersion || input.appVersion || payload.meta?.infraGuideVersion || APP_VERSION,
    createdAt: input.createdAt || payload.meta?.createdAt || null,
    updatedAt: input.updatedAt || payload.meta?.updatedAt || null,
    caseId: input.caseId || payload.meta?.caseId || payload.selectedCaseId || payload.selectedCase?.id || null,
    documentVersion: input.documentVersion || payload.meta?.documentVersion || 1,
    payload,
  };
  return {
    ...body,
    checksum: input.checksum || checksum(checksumTarget(body)),
  };
}

function fail(message) {
  return { ok: false, code: 'INVALID', errors: [message], warnings: [], envelope: null, version: null };
}

export const StateValidator = {
  validateState,
};

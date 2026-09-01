import { APP_VERSION, STATE_VERSION, PROGRESS_FORMAT, MAX_IMPORT_BYTES } from '../../config.js';
import { checksum } from './checksum.js';
import { checksumTarget, wrapEnvelope, normalizeLoadedPayload } from './payload.js';
import { validateState } from './StateValidator.js';
import { migrateState } from './StateMigrationService.js';
import { sanitizePersistedValue } from './sanitize.js';
import { isDocumented } from '../understandModel.js';
import { documentSections } from '../../data/document/sections.js';
import { stages } from '../../data/stages/index.js';
import { getCaseById } from '../../data/cases/index.js';
import { safeFileName } from '../../export/text.js';

export function buildProgressFile(stateOrPayload) {
  const payload = stateOrPayload.meta ? stateOrPayload : null;
  const envelope = payload
    ? wrapEnvelope(payload)
    : wrapEnvelope(stateOrPayload.payload ? stateOrPayload.payload : stateOrPayload);
  const inner = envelope.payload;
  const caseId = envelope.caseId ?? inner?.meta?.caseId ?? inner?.selectedCase?.id ?? null;
  const file = {
    format: PROGRESS_FORMAT,
    stateVersion: STATE_VERSION,
    infraGuideVersion: APP_VERSION,
    exportedAt: new Date().toISOString(),
    caseId,
    checksum: envelope.checksum,
    state: inner,
  };
  file.checksum = checksum(checksumTarget({ ...file, checksum: undefined }));
  return file;
}

export function progressFileName(caseName = 'Helados Boreal') {
  const stem = String(caseName)
    .replace(/S\.A\.S\.?/gi, '')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .replace(/_+/g, '_') || 'Helados_Boreal';
  return `InfraGuide_${stem}_Progreso.json`;
}

export function downloadFileName(state) {
  const name = state.selectedCase?.name || getCaseById(state.meta?.caseId || state.selectedCase?.id)?.name || 'Helados Boreal';
  return progressFileName(name);
}

export function parseProgressFile(text, options = {}) {
  const size = options.byteLength ?? (typeof Blob !== 'undefined' && text instanceof Blob ? text.size : String(text ?? '').length);
  if (size > MAX_IMPORT_BYTES) {
    return {
      ok: false,
      code: 'TOO_LARGE',
      errors: ['El archivo supera el tamaño máximo de 5 MB.'],
    };
  }
  if (options.fileName && !String(options.fileName).toLowerCase().endsWith('.json')) {
    return invalidFile();
  }
  if (options.mimeType && options.mimeType !== '' && !isJsonMime(options.mimeType)) {
    return invalidFile();
  }

  let parsed;
  try {
    parsed = JSON.parse(String(text ?? ''));
  } catch {
    return invalidFile();
  }
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    return invalidFile();
  }
  if (parsed.format && parsed.format !== PROGRESS_FORMAT && parsed.kind && parsed.kind !== 'infraguide-progress') {
    return invalidFile();
  }
  if (parsed.format && parsed.format !== PROGRESS_FORMAT && parsed.kind !== 'infraguide-progress') {
    return invalidFile();
  }

  const candidate = parsed.format === PROGRESS_FORMAT || parsed.state
    ? {
        stateVersion: parsed.stateVersion ?? parsed.state?.meta?.stateVersion,
        infraGuideVersion: parsed.infraGuideVersion ?? parsed.state?.meta?.infraGuideVersion,
        createdAt: parsed.state?.meta?.createdAt,
        updatedAt: parsed.state?.meta?.updatedAt,
        caseId: parsed.caseId ?? parsed.state?.meta?.caseId,
        documentVersion: parsed.state?.meta?.documentVersion,
        payload: parsed.state ?? parsed,
        checksum: parsed.checksum,
        exportedAt: parsed.exportedAt,
      }
    : parsed;

  const migrated = migrateState(candidate);
  if (!migrated.ok) {
    return {
      ok: false,
      code: migrated.code,
      errors: migrated.errors,
      migrated,
    };
  }

  const validation = validateState(migrated.envelope, { requireChecksum: false });
  if (!validation.ok) {
    return {
      ok: false,
      code: validation.code,
      errors: validation.errors.length ? validation.errors : ['No reconocemos este archivo como un progreso válido de InfraGuide.'],
      validation,
    };
  }

  const payload = sanitizePersistedValue(normalizeLoadedPayload(migrated.envelope));
  return {
    ok: true,
    envelope: { ...migrated.envelope, payload },
    payload,
    preview: buildImportPreview(payload, {
      exportedAt: parsed.exportedAt,
      infraGuideVersion: validation.infraGuideVersion,
      migrated: migrated.migrated,
    }),
    migrated: migrated.migrated,
    warnings: validation.warnings,
  };
}

export function buildImportPreview(payload, extras = {}) {
  const caseId = payload.meta?.caseId ?? payload.selectedCase?.id ?? null;
  const caseData = caseId ? getCaseById(caseId) : null;
  const documentedCount = documentSections.filter((section) => isDocumented(payload.documentSections?.[section.key])).length;
  const completed = Array.isArray(payload.completedStages) ? payload.completedStages.length : 0;
  return {
    caseId,
    caseName: caseData?.name || payload.selectedCase?.name || caseId || 'Caso desconocido',
    caseKnown: Boolean(caseData),
    exportedAt: extras.exportedAt || payload.meta?.updatedAt || null,
    infraGuideVersion: extras.infraGuideVersion || payload.meta?.infraGuideVersion || APP_VERSION,
    stateVersion: payload.meta?.stateVersion || STATE_VERSION,
    completedStages: completed,
    totalStages: stages.length,
    documentedSections: documentedCount,
    totalSections: documentSections.length,
    currentStage: payload.currentStage ?? 0,
    documentVersion: payload.meta?.documentVersion || 1,
    migrated: Boolean(extras.migrated),
  };
}

function isJsonMime(type) {
  return type === 'application/json' || type === 'text/json' || type.endsWith('+json');
}

function invalidFile() {
  return {
    ok: false,
    code: 'INVALID_FILE',
    errors: ['No reconocemos este archivo como un progreso válido de InfraGuide.'],
  };
}

export { safeFileName };

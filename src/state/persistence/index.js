import {
  APP_VERSION,
  AUTOSAVE_DEBOUNCE_MS,
  MAX_SNAPSHOTS,
  STATE_VERSION,
} from '../../config.js';
import { downloadBlob } from '../../export/text.js';
import {
  readStateRaw,
  writeStateRaw,
  readBackupRaw,
  writeBackupRaw,
  readSnapshotsRaw,
  writeSnapshotsRaw,
  clearAllProgressKeys,
  STORAGE_ERRORS,
} from './storageAdapter.js';
import {
  buildPersistablePayload,
  wrapEnvelope,
  normalizeLoadedPayload,
  envelopeFingerprint,
  checksumTarget,
} from './payload.js';
import { checksum } from './checksum.js';
import { validateState } from './StateValidator.js';
import { migrateState } from './StateMigrationService.js';
import { emitPersistenceEvent, PERSISTENCE_EVENTS } from './events.js';
import { buildProgressFile, parseProgressFile, downloadFileName } from './progressFile.js';

let debounceTimer = null;
let lastFingerprint = null;
let lastEnvelopeRaw = null;
let createdAt = null;
let isDirty = false;
let lastSavedAt = null;
let lastBackupAt = null;
let getLiveState = () => null;
let onStatus = () => {};

function setStatus(partial) {
  onStatus(partial);
}

function parseRaw(raw) {
  if (!raw) return { ok: false, code: 'EMPTY' };
  try {
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== 'object') {
      return { ok: false, code: 'INVALID' };
    }
    return { ok: true, parsed };
  } catch {
    return { ok: false, code: 'INVALID_JSON' };
  }
}

function loadEnvelopeFromRaw(raw) {
  const parsed = parseRaw(raw);
  if (!parsed.ok) return parsed;
  const migrated = migrateState(parsed.parsed);
  if (!migrated.ok) return migrated;
  const validation = validateState(migrated.envelope);
  if (!validation.ok) {
    return { ok: false, code: validation.code, errors: validation.errors, validation };
  }
  const payload = normalizeLoadedPayload(validation.envelope);
  return {
    ok: true,
    envelope: { ...validation.envelope, payload },
    payload,
    migrated: migrated.migrated,
    warnings: validation.warnings,
  };
}

function serializeEnvelope(envelope) {
  return JSON.stringify(envelope);
}

export const PersistenceService = {
  configure(options = {}) {
    if (typeof options.getState === 'function') getLiveState = options.getState;
    if (typeof options.onStatus === 'function') onStatus = options.onStatus;
  },

  isDirty() {
    return isDirty;
  },

  getMeta() {
    return {
      lastSavedAt,
      lastBackupAt,
      isDirty,
      createdAt,
      stateVersion: STATE_VERSION,
      infraGuideVersion: APP_VERSION,
    };
  },

  saveState(state = getLiveState(), options = {}) {
    if (!state) return { ok: false, code: 'NO_STATE' };
    const payload = buildPersistablePayload(state);
    if (!createdAt) createdAt = payload.meta.createdAt;
    payload.meta.createdAt = createdAt;
    const envelope = wrapEnvelope(payload);
    const raw = serializeEnvelope(envelope);
    const fingerprint = envelopeFingerprint(envelope);

    if (!options.force && fingerprint === lastFingerprint) {
      isDirty = false;
      setStatus({ isDirty: false, status: lastSavedAt ? 'saved' : 'idle' });
      return { ok: true, skipped: true };
    }

    if (lastEnvelopeRaw && fingerprint !== lastFingerprint) {
      const backupResult = writeBackupRaw(lastEnvelopeRaw);
      if (backupResult.ok) {
        lastBackupAt = new Date().toISOString();
      }
    }

    const written = writeStateRaw(raw);
    if (!written.ok) {
      isDirty = true;
      const quota = written.code === STORAGE_ERRORS.QUOTA;
      setStatus({
        isDirty: true,
        status: quota ? 'quota' : 'error',
        saveError: quota
          ? 'No fue posible guardar automáticamente. Descarga una copia de tu progreso.'
          : 'No fue posible guardar automáticamente. Descarga una copia de tu progreso.',
      });
      return { ok: false, code: written.code };
    }

    lastEnvelopeRaw = raw;
    lastFingerprint = fingerprint;
    lastSavedAt = envelope.updatedAt;
    isDirty = false;
    setStatus({
      isDirty: false,
      status: 'saved',
      lastSavedAt,
      lastBackupAt,
      saveError: null,
    });
    emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_SAVED, { source: options.source || 'autosave' });
    return { ok: true, envelope };
  },

  scheduleSave(state, delay = AUTOSAVE_DEBOUNCE_MS) {
    const live = state || getLiveState();
    if (!live) return;
    const payload = buildPersistablePayload(live);
    const fingerprint = envelopeFingerprint({ payload });
    if (fingerprint === lastFingerprint) {
      return;
    }
    isDirty = true;
    setStatus({ isDirty: true, status: 'saving' });
    if (debounceTimer) clearTimeout(debounceTimer);
    debounceTimer = setTimeout(() => {
      debounceTimer = null;
      PersistenceService.saveState(getLiveState() || live, { source: 'autosave' });
    }, delay);
  },

  flush() {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    if (!isDirty) return { ok: true, skipped: true };
    return PersistenceService.saveState(getLiveState(), { source: 'flush' });
  },

  loadState() {
    const current = readStateRaw();
    if (current.raw) {
      const loaded = loadEnvelopeFromRaw(current.raw);
      if (loaded.ok) {
        lastEnvelopeRaw = current.raw;
        lastFingerprint = envelopeFingerprint(loaded.envelope);
        createdAt = loaded.payload.meta?.createdAt || loaded.envelope.createdAt;
        lastSavedAt = loaded.envelope.updatedAt || loaded.payload.meta?.updatedAt;
        isDirty = false;
        return {
          ok: true,
          payload: loaded.payload,
          recoveredFromBackup: false,
          migrated: loaded.migrated,
        };
      }

      const backupRaw = readBackupRaw();
      if (backupRaw) {
        const backup = loadEnvelopeFromRaw(backupRaw);
        if (backup.ok) {
          writeStateRaw(backupRaw);
          lastEnvelopeRaw = backupRaw;
          lastFingerprint = envelopeFingerprint(backup.envelope);
          createdAt = backup.payload.meta?.createdAt || backup.envelope.createdAt;
          lastSavedAt = backup.envelope.updatedAt;
          lastBackupAt = backup.envelope.updatedAt;
          emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_RESTORED, { source: 'backup-auto' });
          return {
            ok: true,
            payload: backup.payload,
            recoveredFromBackup: true,
            migrated: backup.migrated,
            message: 'Encontramos un problema al recuperar tu progreso. Se restauró la última copia válida.',
          };
        }
      }

      return {
        ok: false,
        recoveryScreen: true,
        code: loaded.code,
        hasBackup: Boolean(readBackupRaw()),
        futureVersion: loaded.code === 'FUTURE_VERSION',
        errors: loaded.errors || ['El progreso guardado no se pudo leer.'],
      };
    }

    return { ok: true, payload: null, empty: true };
  },

  clearState(caseId) {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
      debounceTimer = null;
    }
    clearAllProgressKeys(caseId);
    lastFingerprint = null;
    lastEnvelopeRaw = null;
    createdAt = null;
    isDirty = false;
    lastSavedAt = null;
    lastBackupAt = null;
    emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_RESET);
    return { ok: true };
  },

  exportState(state = getLiveState()) {
    PersistenceService.flush();
    const payload = buildPersistablePayload(state);
    const file = buildProgressFile(payload);
    emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_EXPORTED);
    return file;
  },

  downloadExport(state = getLiveState()) {
    const file = PersistenceService.exportState(state);
    const name = downloadFileName(state);
    const blob = new Blob([JSON.stringify(file, null, 2)], { type: 'application/json' });
    downloadBlob(blob, name);
    return { ok: true, fileName: name, file };
  },

  validateState(input) {
    return validateState(input);
  },

  migrateState(input) {
    return migrateState(input);
  },

  parseImport(text, options = {}) {
    return parseProgressFile(text, options);
  },

  importState(payload, options = {}) {
    if (!options.skipBackup) {
      PersistenceService.createBackup(getLiveState());
    }
    const envelope = wrapEnvelope(payload);
    const raw = serializeEnvelope(envelope);
    const written = writeStateRaw(raw);
    if (!written.ok) {
      return { ok: false, code: written.code };
    }
    lastEnvelopeRaw = raw;
    lastFingerprint = envelopeFingerprint(envelope);
    createdAt = payload.meta?.createdAt || envelope.createdAt;
    lastSavedAt = envelope.updatedAt;
    isDirty = false;
    emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_IMPORTED);
    return { ok: true, payload };
  },

  createBackup(state = getLiveState()) {
    const live = state || getLiveState();
    const source = lastEnvelopeRaw || (live ? serializeEnvelope(wrapEnvelope(buildPersistablePayload(live))) : null);
    if (!source) return { ok: false, code: 'EMPTY' };
    const result = writeBackupRaw(source);
    if (result.ok) {
      lastBackupAt = new Date().toISOString();
      setStatus({ lastBackupAt });
    }
    return result;
  },

  readBackupPreview() {
    const raw = readBackupRaw();
    if (!raw) return { ok: false, code: 'EMPTY', errors: ['No hay una copia anterior para restaurar.'] };
    const loaded = loadEnvelopeFromRaw(raw);
    if (!loaded.ok) {
      return { ok: false, code: loaded.code, errors: loaded.errors || ['La copia anterior no se pudo leer.'] };
    }
    return { ok: true, payload: loaded.payload, envelope: loaded.envelope };
  },

  restoreBackup() {
    const preview = PersistenceService.readBackupPreview();
    if (!preview.ok) return preview;
    const previousCurrent = lastEnvelopeRaw;
    const restoredRaw = serializeEnvelope(preview.envelope);
    if (previousCurrent) {
      writeBackupRaw(previousCurrent);
      lastBackupAt = new Date().toISOString();
    }
    writeStateRaw(restoredRaw);
    lastEnvelopeRaw = restoredRaw;
    lastFingerprint = envelopeFingerprint(preview.envelope);
    isDirty = false;
    lastSavedAt = preview.envelope.updatedAt;
    emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_RESTORED, { source: 'backup' });
    return { ok: true, payload: preview.payload };
  },

  listSnapshots() {
    const raw = readSnapshotsRaw();
    if (!raw) return [];
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  },

  createSnapshot(state = getLiveState(), label = '') {
    PersistenceService.flush();
    const payload = buildPersistablePayload(state);
    const snapshots = PersistenceService.listSnapshots();
    const snapshot = {
      id: `snap-${Date.now().toString(36)}`,
      createdAt: new Date().toISOString(),
      label: String(label || '').trim().slice(0, 80),
      currentStage: payload.currentStage ?? 0,
      documentVersion: payload.meta?.documentVersion || 1,
      state: payload,
    };
    snapshots.push(snapshot);
    while (snapshots.length > MAX_SNAPSHOTS) snapshots.shift();
    const written = writeSnapshotsRaw(JSON.stringify(snapshots));
    if (!written.ok) {
      return { ok: false, code: written.code };
    }
    emitPersistenceEvent(PERSISTENCE_EVENTS.SNAPSHOT_CREATED);
    return { ok: true, snapshot, snapshots };
  },

  restoreSnapshot(id) {
    const snapshots = PersistenceService.listSnapshots();
    const snapshot = snapshots.find((item) => item.id === id);
    if (!snapshot) return { ok: false, code: 'MISSING', errors: ['No encontramos ese punto de recuperación.'] };
    PersistenceService.createBackup(getLiveState());
    const result = PersistenceService.importState(snapshot.state, { skipBackup: true });
    if (result.ok) {
      emitPersistenceEvent(PERSISTENCE_EVENTS.STATE_RESTORED, { source: 'snapshot' });
    }
    return result.ok ? { ok: true, payload: snapshot.state, snapshot } : result;
  },
};

export function createPersistenceUi() {
  return {
    status: 'idle',
    isDirty: false,
    lastSavedAt: null,
    lastBackupAt: null,
    saveError: null,
    toast: null,
    recovery: null,
    recoveredFromBackup: false,
    migrated: false,
    importPreview: null,
    importConfirm: false,
    backupPreview: null,
    snapshotPreview: null,
    resetStep: 0,
    progressMenuOpen: false,
  };
}

export { checksum, checksumTarget, AUTOSAVE_DEBOUNCE_MS };

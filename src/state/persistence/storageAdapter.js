import {
  STORAGE_STATE_KEY,
  STORAGE_BACKUP_KEY,
  STORAGE_SNAPSHOTS_KEY,
  LEGACY_STORAGE_KEYS,
  caseStorageKey,
} from '../../config.js';

export const STORAGE_ERRORS = {
  QUOTA: 'QUOTA',
  UNAVAILABLE: 'UNAVAILABLE',
  UNKNOWN: 'UNKNOWN',
};

function storage() {
  try {
    return window.localStorage;
  } catch {
    return null;
  }
}

export function readRaw(key) {
  try {
    return storage()?.getItem(key) ?? null;
  } catch {
    return null;
  }
}

export function writeRaw(key, value) {
  try {
    const api = storage();
    if (!api) return { ok: false, code: STORAGE_ERRORS.UNAVAILABLE };
    api.setItem(key, value);
    return { ok: true };
  } catch (error) {
    const name = error?.name || '';
    const quota =
      name === 'QuotaExceededError' ||
      name === 'NS_ERROR_DOM_QUOTA_REACHED' ||
      error?.code === 22 ||
      error?.code === 1014;
    return { ok: false, code: quota ? STORAGE_ERRORS.QUOTA : STORAGE_ERRORS.UNKNOWN };
  }
}

export function removeRaw(key) {
  try {
    storage()?.removeItem(key);
    return true;
  } catch {
    return false;
  }
}

export function readStateRaw() {
  const current = readRaw(STORAGE_STATE_KEY);
  if (current) return { raw: current, key: STORAGE_STATE_KEY };
  for (const key of LEGACY_STORAGE_KEYS) {
    const raw = readRaw(key);
    if (raw) return { raw, key, legacy: true };
  }
  return { raw: null, key: STORAGE_STATE_KEY };
}

export function writeStateRaw(value) {
  return writeRaw(STORAGE_STATE_KEY, value);
}

export function writeBackupRaw(value) {
  return writeRaw(STORAGE_BACKUP_KEY, value);
}

export function readBackupRaw() {
  return readRaw(STORAGE_BACKUP_KEY);
}

export function writeSnapshotsRaw(value) {
  return writeRaw(STORAGE_SNAPSHOTS_KEY, value);
}

export function readSnapshotsRaw() {
  return readRaw(STORAGE_SNAPSHOTS_KEY);
}

export function clearAllProgressKeys(caseId) {
  removeRaw(STORAGE_STATE_KEY);
  removeRaw(STORAGE_BACKUP_KEY);
  removeRaw(STORAGE_SNAPSHOTS_KEY);
  LEGACY_STORAGE_KEYS.forEach(removeRaw);
  if (caseId) removeRaw(caseStorageKey(caseId));
}

export { STORAGE_STATE_KEY, STORAGE_BACKUP_KEY, STORAGE_SNAPSHOTS_KEY };

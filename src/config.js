export const APP_NAME = 'InfraGuide';
export const APP_VERSION = '1.0.0';
export const STATE_VERSION = 1;
export const PERSISTENCE_VERSION = STATE_VERSION;
export const STORAGE_PREFIX = 'infraguide:v1';
export const STORAGE_STATE_KEY = 'infraguide_state';
export const STORAGE_BACKUP_KEY = 'infraguide_state_backup';
export const STORAGE_SNAPSHOTS_KEY = 'infraguide_snapshots';
export const LEGACY_STORAGE_KEY = 'infraguide:v1';
export const LEGACY_STORAGE_KEYS = ['infraguide:v1:state', 'infraguide:v1'];
export const PROGRESS_FORMAT = 'InfraGuideProgress';
export const AUTOSAVE_DEBOUNCE_MS = 800;
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const MAX_SNAPSHOTS = 3;

const env = typeof import.meta !== 'undefined' ? import.meta.env ?? {} : {};

export const debugMode = env.VITE_DEBUG_MODE === 'true';
export const pagesBase = env.BASE_URL || '/';

export function caseStorageKey(caseId) {
  return `${STORAGE_PREFIX}:${caseId}`;
}

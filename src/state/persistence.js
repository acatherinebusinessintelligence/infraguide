export { PersistenceService, createPersistenceUi } from './persistence/index.js';
export { buildPersistablePayload } from './persistence/payload.js';
export { validateState, StateValidator } from './persistence/StateValidator.js';
export { migrateState, StateMigrationService } from './persistence/StateMigrationService.js';
export { parseProgressFile, buildProgressFile, progressFileName, downloadFileName } from './persistence/progressFile.js';
export { emitPersistenceEvent, PERSISTENCE_EVENTS } from './persistence/events.js';

import { PersistenceService } from './persistence/index.js';

export function loadPersistedState() {
  const result = PersistenceService.loadState();
  return result.ok ? result.payload : null;
}

export function savePersistedState(state) {
  return PersistenceService.saveState(state, { source: 'direct' });
}

export function clearPersistedState() {
  return PersistenceService.clearState();
}

export function exportProgressPayload(state) {
  return PersistenceService.exportState(state);
}

export function downloadProgress(state) {
  const result = PersistenceService.downloadExport(state);
  return result.fileName;
}

export function readProgressFromStorage() {
  return loadPersistedState();
}

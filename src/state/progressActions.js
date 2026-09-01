import { PersistenceService } from './persistence.js';
import { buildImportPreview } from './persistence/progressFile.js';
import {
  getState,
  importProgressState,
  patchPersistenceUi,
  resetWork,
  applyPersistedPayload,
  pathFromStage,
} from './appState.js';
import { getCaseById } from '../data/cases/index.js';
import { navigate } from '../utils/router.js';

let pendingImport = null;
let toastTimer = null;

function showToast(message, tone = 'ok') {
  if (toastTimer) clearTimeout(toastTimer);
  patchPersistenceUi({ toast: { message, tone } });
  toastTimer = setTimeout(() => {
    patchPersistenceUi({ toast: null });
  }, 4500);
}

export function closeProgressDialogs() {
  pendingImport = null;
  patchPersistenceUi({
    importPreview: null,
    importConfirm: false,
    backupPreview: null,
    snapshotPreview: null,
    resetStep: 0,
    progressMenuOpen: false,
  });
}

export function toggleProgressMenu() {
  const open = !getState().persistence?.progressMenuOpen;
  patchPersistenceUi({ progressMenuOpen: open });
}

export function saveProgressCopy() {
  PersistenceService.flush();
  const result = PersistenceService.downloadExport(getState());
  if (result.ok) showToast('Copia de progreso descargada.', 'ok');
  return result;
}

export async function beginImportFromFile(file) {
  if (!file) return;
  const parsed = PersistenceService.parseImport(await file.text(), {
    fileName: file.name,
    mimeType: file.type,
    byteLength: file.size,
  });
  if (!parsed.ok) {
    showToast(parsed.errors?.[0] || 'No reconocemos este archivo como un progreso válido de InfraGuide.', 'error');
    return parsed;
  }
  pendingImport = parsed;
  patchPersistenceUi({
    importPreview: parsed.preview,
    importConfirm: false,
    progressMenuOpen: false,
  });
  return parsed;
}

export function cancelImport() {
  pendingImport = null;
  patchPersistenceUi({ importPreview: null, importConfirm: false });
}

export function requestImportConfirm() {
  const current = getState();
  const hasWork = Boolean(current.selectedCase || (current.collectedData ?? []).length || (current.completedStages ?? []).length);
  if (!hasWork) {
    return confirmImport();
  }
  patchPersistenceUi({ importConfirm: true });
}

export function confirmImport() {
  if (!pendingImport?.payload) {
    showToast('No hay un archivo de progreso listo para cargar.', 'error');
    return false;
  }
  const payload = pendingImport.payload;
  const preview = pendingImport.preview;
  pendingImport = null;
  const ok = importProgressState(payload);
  if (!ok) {
    showToast('No se pudo aplicar el progreso.', 'error');
    return false;
  }
  patchPersistenceUi({
    importPreview: null,
    importConfirm: false,
    toast: { message: 'Progreso cargado correctamente.', tone: 'ok' },
  });
  navigate(pathFromStage(payload.currentStage));
  if (preview?.migrated) {
    showToast('Tu progreso fue actualizado al formato actual.', 'ok');
  }
  return true;
}

export function previewBackup() {
  const result = PersistenceService.readBackupPreview();
  if (!result.ok) {
    showToast(result.errors?.[0] || 'No hay una copia anterior para restaurar.', 'error');
    return;
  }
  patchPersistenceUi({
    backupPreview: buildImportPreview(result.payload),
    progressMenuOpen: false,
  });
}

export function cancelBackupPreview() {
  patchPersistenceUi({ backupPreview: null });
}

export function confirmRestoreBackup() {
  const result = PersistenceService.restoreBackup();
  if (!result.ok) {
    showToast(result.errors?.[0] || 'No se pudo restaurar la copia anterior.', 'error');
    return;
  }
  applyPersistedPayload(result.payload, { persist: false });
  patchPersistenceUi({
    backupPreview: null,
    toast: { message: 'Se restauró la última copia válida.', tone: 'ok' },
  });
  navigate(pathFromStage(result.payload.currentStage));
}

export function createRecoveryPoint(label) {
  const result = PersistenceService.createSnapshot(getState(), label);
  if (!result.ok) {
    if (result.code === 'QUOTA') {
      showToast('No fue posible guardar automáticamente. Descarga una copia de tu progreso.', 'error');
      return result;
    }
    showToast('No se pudo crear el punto de recuperación.', 'error');
    return result;
  }
  showToast('Punto de recuperación creado.', 'ok');
  return result;
}

export function previewSnapshot(id) {
  const snapshot = PersistenceService.listSnapshots().find((item) => item.id === id);
  if (!snapshot) {
    showToast('No encontramos ese punto de recuperación.', 'error');
    return;
  }
  patchPersistenceUi({
    snapshotPreview: {
      id: snapshot.id,
      label: snapshot.label,
      createdAt: snapshot.createdAt,
      preview: buildImportPreview(snapshot.state),
    },
  });
}

export function cancelSnapshotPreview() {
  patchPersistenceUi({ snapshotPreview: null });
}

export function confirmRestoreSnapshot() {
  const id = getState().persistence?.snapshotPreview?.id;
  if (!id) return;
  const result = PersistenceService.restoreSnapshot(id);
  if (!result.ok) {
    showToast(result.errors?.[0] || 'No se pudo restaurar el punto de recuperación.', 'error');
    return;
  }
  applyPersistedPayload(result.payload, { persist: false });
  patchPersistenceUi({
    snapshotPreview: null,
    toast: { message: 'Punto de recuperación restaurado.', tone: 'ok' },
  });
  navigate(pathFromStage(result.payload.currentStage));
}

export function beginReset() {
  patchPersistenceUi({ resetStep: 1, progressMenuOpen: false });
}

export function continueReset() {
  patchPersistenceUi({ resetStep: 2 });
}

export function cancelReset() {
  patchPersistenceUi({ resetStep: 0 });
}

export function confirmReset() {
  resetWork();
  showToast('El progreso local se reinició. Los archivos ya descargados no se modifican.', 'ok');
  navigate('/');
}

export function recoverFromBackup() {
  const result = PersistenceService.restoreBackup();
  if (!result.ok) {
    showToast(result.errors?.[0] || 'No hay una copia anterior para restaurar.', 'error');
    return;
  }
  applyPersistedPayload(result.payload, { persist: false });
  patchPersistenceUi({
    recovery: null,
    toast: { message: 'Se restauró la última copia válida.', tone: 'ok' },
  });
  navigate(pathFromStage(result.payload.currentStage));
}

export function startFreshFromRecovery() {
  resetWork();
  navigate('/');
}

export function caseMismatch(preview) {
  const currentId = getState().selectedCase?.id;
  if (!preview?.caseId || !currentId) return false;
  return preview.caseId !== currentId;
}

export function caseLabel(caseId) {
  return getCaseById(caseId)?.name || caseId || 'este caso';
}

export { showToast };

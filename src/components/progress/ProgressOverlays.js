import { escapeHtml } from '../../utils/escape.js';
import {
  ImportPreviewDialog,
  ImportConfirmDialog,
  BackupPreviewDialog,
  SnapshotPreviewDialog,
  ResetDialog,
} from './ProgressDialogs.js';
import { ProgressToast } from './SaveIndicator.js';
import { getCaseById } from '../../data/cases/index.js';

export function ProgressOverlays({ state }) {
  const persistence = state.persistence ?? {};
  const dialog =
    persistence.resetStep
      ? ResetDialog({ step: persistence.resetStep })
      : persistence.importConfirm
        ? ImportConfirmDialog()
        : persistence.snapshotPreview
          ? SnapshotPreviewDialog({ snapshot: persistence.snapshotPreview })
          : persistence.backupPreview
            ? BackupPreviewDialog({ preview: persistence.backupPreview })
            : persistence.importPreview
              ? ImportPreviewDialog({
                  preview: persistence.importPreview,
                  caseWarning: caseWarning(state, persistence.importPreview),
                })
              : '';
  const backdrop = dialog
    ? '<button class="backdrop backdrop--overlay progress-backdrop" type="button" data-action="close-progress-dialog" aria-label="Cerrar"></button>'
    : '';
  return `${ProgressToast({ toast: persistence.toast })}${backdrop}${dialog}`;
}

function caseWarning(state, preview) {
  if (!preview?.caseId) return '';
  const known = getCaseById(preview.caseId);
  const currentId = state.selectedCase?.id;
  if (!known) {
    return `Este archivo corresponde al caso ${preview.caseName}. El caso no está en esta copia de InfraGuide. Puedes cargarlo de todas formas.`;
  }
  if (currentId && currentId !== preview.caseId) {
    return `Este archivo corresponde al caso ${preview.caseName}. ¿Deseas cambiar al caso asociado?`;
  }
  return '';
}

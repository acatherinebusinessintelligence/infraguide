import { escapeHtml } from '../../utils/escape.js';
import { stages } from '../../data/stages/index.js';

export function formatWhen(iso) {
  if (!iso) return 'No registrada';
  try {
    return new Intl.DateTimeFormat('es-CO', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function stageName(id) {
  return stages.find((item) => item.id === id)?.name || (id ? `Etapa ${id}` : 'Inicio');
}

export function PreviewCard({ title, preview, extra = '' }) {
  if (!preview) return '';
  return `
    <section class="progress-preview" aria-labelledby="progress-preview-title">
      <h2 id="progress-preview-title">${escapeHtml(title)}</h2>
      <dl class="progress-preview__dl">
        <div><dt>Caso</dt><dd>${escapeHtml(preview.caseName)}</dd></div>
        <div><dt>Fecha</dt><dd>${escapeHtml(formatWhen(preview.exportedAt || preview.createdAt))}</dd></div>
        <div><dt>InfraGuide</dt><dd>v${escapeHtml(preview.infraGuideVersion)}</dd></div>
        <div><dt>Etapas completadas</dt><dd>${preview.completedStages} / ${preview.totalStages}</dd></div>
        <div><dt>Documento</dt><dd>${preview.documentedSections} / ${preview.totalSections} secciones</dd></div>
        <div><dt>Etapa actual</dt><dd>${escapeHtml(stageName(preview.currentStage))}</dd></div>
      </dl>
      ${extra}
    </section>
  `;
}

export function ImportPreviewDialog({ preview, caseWarning = '' }) {
  if (!preview) return '';
  return `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="import-preview-title">
      ${PreviewCard({
        title: 'Archivo de progreso',
        preview,
        extra: caseWarning
          ? `<p class="progress-note" role="status">${escapeHtml(caseWarning)}</p>`
          : '',
      })}
      <div class="progress-dialog__actions">
        <button class="btn btn--ghost-dark" type="button" data-action="cancel-import">Cancelar</button>
        <button class="btn btn--primary" type="button" data-action="accept-import-preview" data-autofocus>Cargar progreso</button>
      </div>
    </div>
  `;
}

export function ImportConfirmDialog() {
  return `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="import-confirm-title">
      <h2 id="import-confirm-title">Reemplazar el trabajo actual</h2>
      <p>Al cargar este progreso se reemplazará el trabajo actualmente abierto.</p>
      <div class="progress-dialog__actions">
        <button class="btn btn--ghost-dark" type="button" data-action="export-progress">Descargar copia del actual</button>
        <button class="btn btn--ghost-dark" type="button" data-action="cancel-import">Cancelar</button>
        <button class="btn btn--primary" type="button" data-action="confirm-import" data-autofocus>Continuar</button>
      </div>
    </div>
  `;
}

export function BackupPreviewDialog({ preview }) {
  if (!preview) return '';
  return `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="backup-preview-title">
      ${PreviewCard({ title: 'Copia anterior', preview })}
      <p>Se restaurará esta copia y el trabajo actual pasará a ser la copia anterior.</p>
      <div class="progress-dialog__actions">
        <button class="btn btn--ghost-dark" type="button" data-action="cancel-backup-preview">Cancelar</button>
        <button class="btn btn--primary" type="button" data-action="confirm-restore-backup" data-autofocus>Restaurar copia anterior</button>
      </div>
    </div>
  `;
}

export function SnapshotPreviewDialog({ snapshot }) {
  if (!snapshot) return '';
  return `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="snapshot-preview-title">
      ${PreviewCard({
        title: snapshot.label || 'Punto de recuperación',
        preview: { ...snapshot.preview, createdAt: snapshot.createdAt, exportedAt: snapshot.createdAt },
      })}
      <div class="progress-dialog__actions">
        <button class="btn btn--ghost-dark" type="button" data-action="cancel-snapshot-preview">Cancelar</button>
        <button class="btn btn--primary" type="button" data-action="confirm-restore-snapshot" data-autofocus>Restaurar</button>
      </div>
    </div>
  `;
}

export function ResetDialog({ step }) {
  if (!step) return '';
  if (step === 1) {
    return `
      <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-title">
        <h2 id="reset-title">Reiniciar trabajo</h2>
        <p>Esta acción eliminará el progreso local actual.</p>
        <p class="progress-note">Reiniciar InfraGuide no afecta archivos HTML, DOCX o JSON que ya se hayan descargado.</p>
        <div class="progress-dialog__actions">
          <button class="btn btn--primary" type="button" data-action="export-progress">Descargar copia</button>
          <button class="btn btn--ghost-dark" type="button" data-action="cancel-reset">Cancelar</button>
          <button class="btn btn--danger" type="button" data-action="continue-reset" data-autofocus>Continuar</button>
        </div>
      </div>
    `;
  }
  return `
    <div class="progress-dialog" role="dialog" aria-modal="true" aria-labelledby="reset-confirm-title">
      <h2 id="reset-confirm-title">Confirmar reinicio</h2>
      <p>Se borrará el progreso guardado en este navegador. Esta acción no se puede deshacer.</p>
      <div class="progress-dialog__actions">
        <button class="btn btn--ghost-dark" type="button" data-action="cancel-reset" data-autofocus>Cancelar</button>
        <button class="btn btn--danger" type="button" data-action="confirm-reset">Reiniciar trabajo</button>
      </div>
    </div>
  `;
}

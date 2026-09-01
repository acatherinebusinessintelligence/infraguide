import { escapeHtml } from '../../utils/escape.js';
import { APP_VERSION, STATE_VERSION } from '../../config.js';
import { PersistenceService } from '../../state/persistence.js';
import { isDocumented } from '../../state/understandModel.js';
import { documentSections } from '../../data/document/sections.js';
import { stages } from '../../data/stages/index.js';
import { formatWhen, stageName } from './ProgressDialogs.js';
import { formatSavedAgo } from './SaveIndicator.js';

export function ProgressManagementPanel({ state }) {
  const persistence = state.persistence ?? {};
  const snapshots = PersistenceService.listSnapshots();
  const documentedCount = documentSections.filter((section) => isDocumented(state.documentSections?.[section.key])).length;
  const completed = (state.completedStages ?? []).length;
  const lastSaved = formatSavedAgo(persistence.lastSavedAt, persistence.status) || 'Todavía no hay un guardado en este navegador.';

  return `
    <section class="progress-panel" aria-labelledby="progress-panel-title">
      <header class="section-heading">
        <h1 id="progress-panel-title">Progreso</h1>
        <p>Tu progreso pertenece a tu trabajo, no al navegador.</p>
      </header>

      <div class="progress-explain">
        <article>
          <h2>Autoguardado</h2>
          <p>Tu progreso se guarda en este navegador.</p>
        </article>
        <article>
          <h2>Guardar mi progreso</h2>
          <p>Descarga una copia para continuar en otro computador.</p>
        </article>
      </div>

      <dl class="progress-stats">
        <div><dt>Caso activo</dt><dd>${escapeHtml(state.selectedCase?.name || 'Todavía ninguno')}</dd></div>
        <div><dt>Etapa actual</dt><dd>${escapeHtml(stageName(state.currentStage))}</dd></div>
        <div><dt>Etapas completadas</dt><dd>${completed} / ${stages.length}</dd></div>
        <div><dt>Secciones documento</dt><dd>${documentedCount} / ${documentSections.length}</dd></div>
        <div><dt>Último guardado</dt><dd>${escapeHtml(lastSaved)}</dd></div>
        <div><dt>Último backup</dt><dd>${escapeHtml(persistence.lastBackupAt ? formatWhen(persistence.lastBackupAt) : 'Aún no hay copia anterior')}</dd></div>
        <div><dt>Versión</dt><dd>InfraGuide v${escapeHtml(APP_VERSION)} · formato ${STATE_VERSION}</dd></div>
      </dl>

      ${persistence.saveError ? `<p class="form-error" role="status">${escapeHtml(persistence.saveError)}</p>` : ''}

      <div class="progress-actions">
        <button class="btn btn--primary" type="button" data-action="export-progress">Guardar mi progreso</button>
        <label class="btn btn--ghost-dark" for="progress-file-input">
          Cargar progreso
          <input id="progress-file-input" class="visually-hidden" type="file" accept="application/json,.json" data-action="import-progress" />
        </label>
        <button class="btn btn--ghost-dark" type="button" data-action="preview-backup">Restaurar copia anterior</button>
        <button class="btn btn--danger" type="button" data-action="begin-reset">Reiniciar trabajo</button>
      </div>

      <section class="progress-snapshots" aria-labelledby="snapshots-title">
        <h2 id="snapshots-title">Puntos de recuperación</h2>
        <p>Puedes guardar hasta 3 puntos locales. Si creas un cuarto, se elimina el más antiguo.</p>
        <div class="progress-snapshot-form">
          <label for="snapshot-label">Nombre breve (opcional)</label>
          <input id="snapshot-label" type="text" maxlength="80" placeholder="Antes de cambiar AS-IS" data-snapshot-label />
          <button class="btn btn--primary" type="button" data-action="create-snapshot">Crear punto de recuperación</button>
        </div>
        ${renderSnapshots(snapshots)}
      </section>
    </section>
  `;
}

function renderSnapshots(snapshots) {
  if (!snapshots.length) {
    return `<p>Todavía no hay puntos de recuperación.</p>`;
  }
  const cards = [...snapshots]
    .reverse()
    .map((item) => {
      const when = formatWhen(item.createdAt);
      const time = formatClock(item.createdAt);
      return `
        <article class="snapshot-card">
          <h3>${escapeHtml(item.label || 'Punto de recuperación')}</h3>
          <p>${escapeHtml(time)} · ${escapeHtml(when)}</p>
          <p>${escapeHtml(stageName(item.currentStage))} · documento v${escapeHtml(String(item.documentVersion || 1))}</p>
          <button class="btn btn--small btn--ghost-dark" type="button" data-action="preview-snapshot" data-snapshot-id="${escapeHtml(item.id)}">Restaurar</button>
        </article>
      `;
    })
    .join('');
  return `<div class="snapshot-grid">${cards}</div>`;
}

function formatClock(iso) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat('es-CO', { hour: '2-digit', minute: '2-digit' }).format(new Date(iso));
  } catch {
    return '';
  }
}

import { escapeHtml } from '../../utils/escape.js';

export function formatSavedAgo(iso, status = 'idle') {
  if (status === 'saving') return 'GUARDANDO...';
  if (status === 'quota' || status === 'error') return '';
  if (!iso) return '';
  const then = new Date(iso).getTime();
  if (!Number.isFinite(then)) return '';
  const delta = Date.now() - then;
  if (status === 'saved' && delta < 4000) return 'GUARDADO';
  if (delta < 60000) return 'Guardado hace unos segundos';
  const minutes = Math.round(delta / 60000);
  if (minutes < 60) return `Guardado hace ${minutes} min`;
  try {
    return `Guardado ${new Intl.DateTimeFormat('es-CO', { dateStyle: 'short', timeStyle: 'short' }).format(new Date(iso))}`;
  } catch {
    return 'Guardado';
  }
}

export function SaveIndicator({ persistence = {} }) {
  const text = persistence.saveError
    ? persistence.saveError
    : formatSavedAgo(persistence.lastSavedAt, persistence.status);
  if (!text) return '';
  const tone = persistence.status === 'quota' || persistence.status === 'error' ? 'is-error' : persistence.status === 'saving' ? 'is-saving' : 'is-saved';
  return `
    <p class="save-indicator ${tone}" role="status" aria-live="polite">
      ${escapeHtml(text)}
    </p>
  `;
}

export function ProgressToast({ toast }) {
  if (!toast?.message) return '';
  return `
    <div class="progress-toast progress-toast--${escapeHtml(toast.tone || 'ok')}" role="status" aria-live="polite">
      ${escapeHtml(toast.message)}
    </div>
  `;
}

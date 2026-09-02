import { escapeHtml } from '../../utils/escape.js';

export function HowBuilt({ steps = [], title = 'VER CÓMO SE CONSTRUYÓ' }) {
  const visible = (steps || []).filter((step) => String(step.label || '').trim() && String(step.text || '').trim());
  if (!visible.length) {
    return `<p>Esta trazabilidad se completará cuando desarrolles la actividad.</p>`;
  }
  return `
    <details class="how-built">
      <summary>${escapeHtml(title)}</summary>
      <ol class="document-chain">
        ${visible.map((step) => `<li><strong>${escapeHtml(step.label)}</strong> — ${escapeHtml(step.text)}</li>`).join('')}
      </ol>
    </details>
  `;
}

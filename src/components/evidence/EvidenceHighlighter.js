import { escapeHtml } from '../../utils/escape.js';

export function EvidenceHighlighter({ evidence, scanned = false, matched = false }) {
  if (matched) {
    return `<p class="highlight-note" role="status">El fragmento se señaló sobre la página.</p>`;
  }
  if (scanned || !evidence?.quote) {
    return `
      <div class="evidence-marker" role="note">
        <p><strong>Marcador de evidencia</strong></p>
        <p>La ubicación corresponde a esta página o sección cuando esté verificada. El PDF actual no tiene un fragmento contrastado, o no hay capa de texto para resaltar.</p>
      </div>
    `;
  }
  return `
    <div class="evidence-marker" role="note">
      <p><strong>Fragmento transcrito</strong></p>
      <blockquote>“${escapeHtml(evidence.quote)}”</blockquote>
    </div>
  `;
}

export function highlightTextLayer(layer, quote) {
  if (!layer || !quote) return false;
  const needle = quote.trim().toLowerCase();
  if (!needle) return false;
  const spans = [...layer.querySelectorAll('span')];
  let found = false;
  spans.forEach((span) => {
    if (span.textContent && span.textContent.toLowerCase().includes(needle)) {
      span.classList.add('pdf-text-hit');
      found = true;
    }
  });
  if (found) return true;

  const blob = spans.map((span) => span.textContent || '').join('');
  if (blob.toLowerCase().includes(needle)) {
    layer.classList.add('pdf-text-hit-page');
    return true;
  }
  return false;
}

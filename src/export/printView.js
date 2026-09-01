import { escapeHtml } from '../utils/escape.js';
import { renderDocumentBody } from './documentHtml.js';

export function PrintableDocument({ model, suggestedName = '' }) {
  if (!model) return '';
  return `
    <article class="print-root ig-doc-body" aria-label="Documento imprimible">
      <p class="print-hint">Usa Imprimir del navegador y elige Guardar como PDF. Nombre sugerido: <strong>${escapeHtml(suggestedName)}</strong></p>
      <div class="ig-page">${renderDocumentBody(model, 'print')}</div>
    </article>
  `;
}

export function suggestedPdfName(baseName) {
  return `${baseName}.pdf`;
}

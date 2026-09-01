import { escapeHtml } from '../utils/escape.js';
import { asisSvgMarkup, asisFlowText } from './asisSvg.js';

const PAGE_BREAK_KEYS = new Set(['asis', 'metrics', 'findings', 'itil', 'cobit', 'iso27001', 'recommendations', 'conclusions']);

export const EMBEDDED_DOCUMENT_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body.ig-doc-body {
  margin: 0;
  background: #f4f8fc;
  color: #152033;
  font-family: Calibri, Arial, "Segoe UI", sans-serif;
  font-size: 11pt;
  line-height: 1.45;
}
.ig-page {
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  padding: 18mm 16mm;
}
.ig-cover {
  text-align: center;
  min-height: 70vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.6rem;
  border-bottom: 2px solid #0B3A6A;
  margin-bottom: 1.5rem;
  padding-bottom: 2rem;
}
.ig-kicker {
  letter-spacing: 0.12em;
  font-weight: 700;
  color: #0B3A6A;
  font-size: 0.95rem;
}
.ig-cover h1 { color: #0B3A6A; font-size: 1.8rem; margin: 0.4rem 0; }
.ig-meta { color: #3d4d63; font-size: 0.95rem; }
.ig-index { margin: 1.5rem 0 2rem; }
.ig-index h2, .ig-section h2 { color: #0B3A6A; }
.ig-section h3 { color: #1F6AA5; font-size: 1.05rem; }
.ig-prose { white-space: pre-wrap; margin: 0.6rem 0 1rem; }
.ig-table-wrap { overflow-x: auto; margin: 0.8rem 0 1.2rem; }
.ig-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 10pt;
}
.ig-table th, .ig-table td {
  border: 1px solid #c5d4e3;
  padding: 0.4rem 0.5rem;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}
.ig-table th { background: #D6E6F5; color: #0B3A6A; }
.ig-metric {
  border: 1px solid #c5d4e3;
  padding: 0.8rem 1rem;
  margin: 0.8rem 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
.ig-metric p { margin: 0.25rem 0; }
.ig-trace, .ig-rec-trace {
  background: #f4f8fc;
  border-left: 3px solid #1F6AA5;
  padding: 0.7rem 0.9rem;
  margin: 0.8rem 0;
  break-inside: avoid;
  page-break-inside: avoid;
}
.ig-asis { background: #fff; margin: 1rem 0; page-break-inside: avoid; break-inside: avoid; }
.ig-asis-svg { width: 100%; height: auto; display: block; background: #fff; }
.ig-asis-flow { font-size: 0.95rem; color: #0B3A6A; }
.ig-footer { margin-top: 2rem; font-size: 0.85rem; color: #3d4d63; border-top: 1px solid #c5d4e3; padding-top: 0.8rem; }
@media print {
  @page { size: A4; margin: 16mm; }
  body.ig-doc-body { background: #fff; }
  .ig-page { max-width: none; padding: 0; }
  .ig-cover { min-height: auto; page-break-after: always; break-after: page; }
  .ig-break { page-break-before: always; break-before: page; }
  .ig-table, .ig-metric, .ig-asis, tr { page-break-inside: avoid; break-inside: avoid; }
  a[href^="#"] { text-decoration: none; color: inherit; }
}
@media (max-width: 720px) {
  .ig-page { padding: 1rem; }
  .ig-table { font-size: 9pt; }
}
`;

export function renderDocumentBody(model, variant = 'html') {
  const cover = renderCover(model.cover);
  const index = model.config.includeIndex ? renderIndex(model.index) : '';
  const sections = model.sections.map((section, index) => renderSection(section, index, variant)).join('');
  const footer = `<p class="ig-footer">${escapeHtml(model.cover.app)} ${escapeHtml(model.cover.appVersion)} · ${escapeHtml(model.cover.documentVersion)} · ${escapeHtml(model.cover.generatedLabel)} · ${escapeHtml(model.cover.modeLabel)}</p>`;
  return `${cover}${index}${sections}${footer}`;
}

function renderCover(cover) {
  return `
    <header class="ig-cover">
      <p class="ig-kicker">${escapeHtml(cover.kicker)}</p>
      <h1>${escapeHtml(cover.title)}</h1>
      <p><strong>Caso:</strong> ${escapeHtml(cover.caseName)}</p>
      <p><strong>Sector:</strong> ${escapeHtml(cover.sector)}</p>
      <p class="ig-meta">Generado desde ${escapeHtml(cover.app)}</p>
      <p class="ig-meta">Fecha: ${escapeHtml(cover.generatedLabel)} · ${escapeHtml(cover.documentVersion)}</p>
    </header>
  `;
}

function renderIndex(index) {
  const items = index.map((item) => `<li><a href="#sec-${escapeHtml(item.key)}">${escapeHtml(item.title)}</a></li>`).join('');
  return `<nav class="ig-index" aria-label="Índice"><h2>Índice</h2><ol>${items}</ol></nav>`;
}

function renderSection(section, index, variant) {
  const pageBreak = PAGE_BREAK_KEYS.has(section.key) && index > 0 ? ' ig-break' : '';
  const body = section.blocks.map((block) => renderBlock(block, variant)).join('');
  return `
    <section class="ig-section ig-section--${escapeHtml(section.key)}${pageBreak}" id="sec-${escapeHtml(section.key)}">
      <h2>${escapeHtml(section.title)}</h2>
      ${body}
    </section>
  `;
}

function renderBlock(block, variant) {
  if (block.type === 'paragraph') {
    return `<p class="ig-prose">${escapeHtml(block.text)}</p>`;
  }
  if (block.type === 'heading') {
    return `<h3>${escapeHtml(block.text)}</h3>`;
  }
  if (block.type === 'list') {
    return `<ul>${block.items.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
  if (block.type === 'table') {
    const head = block.headers.map((item) => `<th scope="col">${escapeHtml(item)}</th>`).join('');
    const rows = block.rows
      .map((row) => `<tr>${row.map((cell, i) => `<t${i === 0 ? 'd' : 'd'}>${escapeHtml(cell)}</t${i === 0 ? 'd' : 'd'}>`).join('')}</tr>`)
      .join('');
    return `<div class="ig-table-wrap"><table class="ig-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (block.type === 'asis') {
    const svg = asisSvgMarkup(block.chains);
    const flows = block.chains
      .map((chain) => `<p class="ig-asis-flow">${escapeHtml(asisFlowText(chain) || 'Sin cadena documentada.')}</p>`)
      .join('');
    return `<div class="ig-asis">${svg}${flows}</div>`;
  }
  if (block.type === 'metric') {
    return `
      <article class="ig-metric">
        <h3>${escapeHtml(block.number)} ${escapeHtml(block.title)}</h3>
        ${block.data ? `<p><strong>Datos:</strong> ${escapeHtml(block.data)}</p>` : ''}
        ${block.formula ? `<p><strong>Fórmula:</strong> ${escapeHtml(block.formula)}</p>` : ''}
        ${block.calculation ? `<p><strong>Cálculo:</strong> ${escapeHtml(block.calculation)}</p>` : ''}
        <p><strong>Resultado:</strong> ${escapeHtml(block.result || '—')}</p>
        ${block.interpretation ? `<p><strong>Interpretación:</strong> ${escapeHtml(block.interpretation)}</p>` : ''}
        ${block.limitation ? `<p><strong>Limitación:</strong> ${escapeHtml(block.limitation)}</p>` : ''}
        ${block.source ? `<p><strong>Fuente:</strong> ${escapeHtml(block.source)}</p>` : ''}
      </article>
    `;
  }
  if (block.type === 'trace') {
    return `
      <aside class="ig-trace">
        ${block.source ? `<p><strong>Fuente:</strong> ${escapeHtml(block.source)}</p>` : ''}
        ${block.evidence ? `<p><strong>Evidencia:</strong> ${escapeHtml(block.evidence)}</p>` : ''}
        ${block.process ? `<p><strong>Procesamiento:</strong> ${escapeHtml(block.process)}</p>` : ''}
        ${block.result ? `<p><strong>Resultado:</strong> ${escapeHtml(block.result)}</p>` : ''}
        ${block.interpretation ? `<p><strong>Interpretación:</strong> ${escapeHtml(block.interpretation)}</p>` : ''}
      </aside>
    `;
  }
  if (block.type === 'recTrace') {
    return `
      <aside class="ig-rec-trace">
        <p><strong>Recomendación:</strong> ${escapeHtml(block.recommendation)}</p>
        ${block.finding ? `<p><strong>Hallazgo origen:</strong> ${escapeHtml(block.finding)}</p>` : ''}
        ${block.evidence ? `<p><strong>Evidencia:</strong> ${escapeHtml(block.evidence)}</p>` : ''}
        ${block.impact ? `<p><strong>Impacto:</strong> ${escapeHtml(block.impact)}</p>` : ''}
        ${block.decision ? `<p><strong>Decisión:</strong> ${escapeHtml(block.decision)}</p>` : ''}
        ${block.metric ? `<p><strong>Métrica:</strong> ${escapeHtml(block.metric)}</p>` : ''}
      </aside>
    `;
  }
  return '';
}

export function wrapStandaloneHtml(model, inner) {
  const title = `${model.cover.caseName} — Análisis de infraestructura`;
  return `<!DOCTYPE html>
<html lang="es">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <meta name="generator" content="InfraGuide ${escapeHtml(model.cover.appVersion)}">
  <title>${escapeHtml(title)}</title>
  <style>${EMBEDDED_DOCUMENT_CSS}</style>
</head>
<body class="ig-doc-body">
  <article class="ig-page">${inner}</article>
</body>
</html>`;
}

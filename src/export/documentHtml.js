import { escapeHtml } from '../utils/escape.js';
import { asisSvgMarkup, asisFlowText } from './asisSvg.js';

const CONSULTING_BREAK_AFTER = new Set(['dictamen']);
const CONSULTING_BREAK_BEFORE = new Set(['findings', 'program', 'annexEvidence']);

export const EMBEDDED_DOCUMENT_CSS = `
:root { color-scheme: light; }
* { box-sizing: border-box; }
body.ig-doc-body {
  margin: 0;
  background: #eef2f6;
  color: #152033;
  font-family: Calibri, Arial, "Segoe UI", sans-serif;
  font-size: 11pt;
  line-height: 1.42;
}
.ig-page {
  max-width: 210mm;
  margin: 0 auto;
  background: #fff;
  padding: 16mm 16mm 18mm;
  box-shadow: 0 0 0 1px #d5dee8;
}
.ig-doc-banner {
  display: flex;
  justify-content: space-between;
  gap: 1rem;
  font-size: 8.5pt;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: #5b6b7c;
  border-bottom: 1px solid #c5d4e3;
  padding-bottom: 0.45rem;
  margin-bottom: 1.2rem;
}
.ig-cover {
  min-height: 62vh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  gap: 0.45rem;
  border-bottom: 2px solid #0B3A6A;
  margin-bottom: 1.4rem;
  padding: 1.5rem 0 2rem;
}
.ig-kicker {
  letter-spacing: 0.14em;
  font-weight: 700;
  color: #0B3A6A;
  font-size: 0.82rem;
}
.ig-cover h1 {
  color: #0B3A6A;
  font-size: 1.55rem;
  margin: 0.35rem 0 0.8rem;
  line-height: 1.25;
  max-width: 28ch;
}
.ig-cover-grid {
  display: grid;
  gap: 0.35rem 1.2rem;
  margin-top: 0.8rem;
  text-align: left;
}
.ig-cover-grid div { border-top: 1px solid #e3ebf2; padding-top: 0.4rem; }
.ig-cover-grid dt {
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: #5b6b7c;
  font-weight: 700;
}
.ig-cover-grid dd { margin: 0.15rem 0 0; color: #152033; }
.ig-badge {
  display: inline-block;
  margin-top: 0.8rem;
  border: 1px solid #1F6AA5;
  color: #0B3A6A;
  font-size: 0.78rem;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  padding: 0.25rem 0.6rem;
  align-self: flex-start;
}
.ig-meta { color: #5b6b7c; font-size: 0.88rem; }
.ig-index { margin: 0 0 1.4rem; }
.ig-index h2, .ig-section h2 {
  color: #0B3A6A;
  font-size: 1.18rem;
  margin: 0 0 0.7rem;
  break-after: avoid;
  page-break-after: avoid;
}
.ig-section { margin: 0 0 1.6rem; }
.ig-section h3 {
  color: #1F6AA5;
  font-size: 1rem;
  margin: 0.9rem 0 0.4rem;
  break-after: avoid;
  page-break-after: avoid;
}
.ig-prose { white-space: pre-wrap; margin: 0.45rem 0 0.8rem; }
.ig-table-wrap { overflow-x: auto; margin: 0.6rem 0 1rem; }
.ig-table {
  width: 100%;
  border-collapse: collapse;
  font-size: 9.5pt;
}
.ig-table th, .ig-table td {
  border: 1px solid #c5d4e3;
  padding: 0.35rem 0.45rem;
  text-align: left;
  vertical-align: top;
  word-break: break-word;
}
.ig-table th { background: #D6E6F5; color: #0B3A6A; }
.ig-table tr { break-inside: avoid; page-break-inside: avoid; }
.ig-metric, .ig-finding, .ig-callout, .ig-asis {
  break-inside: avoid;
  page-break-inside: avoid;
}
.ig-metric {
  border: 1px solid #c5d4e3;
  border-left: 3px solid #1F6AA5;
  padding: 0.7rem 0.85rem;
  margin: 0.7rem 0;
}
.ig-metric p { margin: 0.22rem 0; }
.ig-finding {
  border: 1px solid #c5d4e3;
  margin: 0.85rem 0 1.1rem;
  background: #fff;
}
.ig-finding__head {
  background: #0B3A6A;
  color: #fff;
  padding: 0.55rem 0.8rem;
  display: flex;
  justify-content: space-between;
  gap: 0.8rem;
  flex-wrap: wrap;
}
.ig-finding__head strong { font-size: 1rem; }
.ig-finding__meta { font-size: 0.82rem; opacity: 0.92; }
.ig-finding dl {
  display: grid;
  grid-template-columns: 11rem 1fr;
  gap: 0;
  margin: 0;
}
.ig-finding dt, .ig-finding dd {
  padding: 0.4rem 0.75rem;
  border-top: 1px solid #e3ebf2;
  margin: 0;
}
.ig-finding dt {
  background: #f4f8fc;
  color: #0B3A6A;
  font-weight: 700;
  font-size: 0.78rem;
  text-transform: uppercase;
  letter-spacing: 0.04em;
}
.ig-callout {
  border: 1px solid #c5d4e3;
  background: #f4f8fc;
  padding: 0.7rem 0.9rem;
  margin: 0.7rem 0;
}
.ig-callout--warning { border-left: 3px solid #8a4b12; background: #fbf6ef; }
.ig-callout--note { border-left: 3px solid #1F6AA5; }
.ig-asis { background: #fff; margin: 0.8rem 0; }
.ig-asis-svg { width: 100%; height: auto; display: block; background: #fff; }
.ig-asis-flow { font-size: 0.92rem; color: #0B3A6A; }
.ig-source-link { color: #1F6AA5; }
.ig-kind {
  display: inline-block;
  font-size: 0.72rem;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  color: #1F6AA5;
  border: 1px solid #c5d4e3;
  padding: 0.05rem 0.35rem;
}
.ig-footer {
  margin-top: 1.6rem;
  font-size: 0.78rem;
  color: #5b6b7c;
  border-top: 1px solid #c5d4e3;
  padding-top: 0.6rem;
  display: flex;
  justify-content: space-between;
  gap: 1rem;
}
.ig-pages::after { content: none; }
@media print {
  @page {
    size: A4;
    margin: 16mm 14mm 18mm;
    @top-left {
      content: "InfraGuide · Informe técnico de consultoría";
      font-size: 8pt;
      color: #5b6b7c;
    }
    @bottom-right {
      content: "Página " counter(page);
      font-size: 8pt;
      color: #5b6b7c;
    }
  }
  body.ig-doc-body { background: #fff; }
  .ig-page { max-width: none; padding: 0; box-shadow: none; }
  .ig-doc-banner { display: none; }
  .ig-cover { min-height: auto; page-break-after: always; break-after: page; }
  .ig-break-after { page-break-after: always; break-after: page; }
  .ig-break { page-break-before: always; break-before: page; }
  .ig-table, .ig-metric, .ig-finding, .ig-asis, tr { page-break-inside: avoid; break-inside: avoid; }
  h2, h3 { page-break-after: avoid; break-after: avoid; }
  a[href] { color: inherit; text-decoration: none; }
}
@media (max-width: 720px) {
  .ig-page { padding: 1rem; }
  .ig-table { font-size: 9pt; }
  .ig-finding dl { grid-template-columns: 1fr; }
  .ig-finding dt { border-bottom: 0; }
  .ig-cover h1 { font-size: 1.25rem; max-width: none; }
}
`;

export function renderDocumentBody(model, variant = 'html') {
  const kind = model.kind || 'consulting';
  const cover = renderCover(model.cover);
  const index = model.config?.includeIndex ? renderIndex(model.index) : '';
  const sections = (model.sections ?? []).map((section, index) => renderSection(section, index, variant, kind)).join('');
  const footer = `<p class="ig-footer"><span>${escapeHtml(model.cover.app)} ${escapeHtml(model.cover.appVersion)} · ${escapeHtml(model.cover.documentVersion)} · ${escapeHtml(model.cover.generatedLabel)}</span><span>${escapeHtml(model.cover.modeLabel || '')}</span></p>`;
  const banner = `<p class="ig-doc-banner"><span>InfraGuide · Informe técnico de consultoría</span><span>${escapeHtml(model.cover.caseName || '')}</span></p>`;
  return `${banner}${cover}${index}${sections}${footer}`;
}

function renderCover(cover) {
  const rows = [
    ['Caso', cover.caseName],
    ['Destinatario', cover.recipient],
    ['Objeto de la evaluación', cover.object],
    ['Fecha de corte', cover.cutoffDate],
    ['Horizonte de análisis', cover.horizon],
    ['Clasificación', cover.classification],
  ].filter(([, value]) => value);
  const grid = rows
    .map(([label, value]) => `<div><dt>${escapeHtml(label)}</dt><dd>${escapeHtml(value)}</dd></div>`)
    .join('');
  return `
    <header class="ig-cover">
      <p class="ig-kicker">${escapeHtml(cover.kicker || 'INFRAESTRUCTURA TI')}</p>
      <h1>${escapeHtml(cover.title)}</h1>
      <dl class="ig-cover-grid">${grid}</dl>
      ${cover.classification ? `<p class="ig-badge">${escapeHtml(cover.classification)}</p>` : ''}
      <p class="ig-meta">Generado desde ${escapeHtml(cover.app)} · ${escapeHtml(cover.generatedLabel)} · ${escapeHtml(cover.documentVersion)}</p>
    </header>
  `;
}

function renderIndex(index) {
  const items = (index ?? []).map((item) => `<li><a href="#sec-${escapeHtml(item.key)}">${escapeHtml(item.title)}</a></li>`).join('');
  return `<nav class="ig-index" aria-label="Índice"><h2>Índice</h2><ol>${items}</ol></nav>`;
}

function renderSection(section, _index, variant, kind) {
  const consulting = kind === 'consulting';
  const pageBreak = consulting
    ? CONSULTING_BREAK_BEFORE.has(section.key)
      ? ' ig-break'
      : ''
    : '';
  const after = consulting && CONSULTING_BREAK_AFTER.has(section.key) ? ' ig-break-after' : '';
  const body = (section.blocks ?? []).map((block) => renderBlock(block, variant)).join('');
  return `
    <section class="ig-section ig-section--${escapeHtml(section.key)}${pageBreak}${after}" id="sec-${escapeHtml(section.key)}">
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
    return `<ul>${(block.items ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`;
  }
  if (block.type === 'table') {
    const head = (block.headers ?? []).map((item) => `<th scope="col">${escapeHtml(item)}</th>`).join('');
    const rows = (block.rows ?? [])
      .map((row) => `<tr>${row.map((cell) => `<td>${escapeHtml(cell)}</td>`).join('')}</tr>`)
      .join('');
    return `<div class="ig-table-wrap"><table class="ig-table"><thead><tr>${head}</tr></thead><tbody>${rows}</tbody></table></div>`;
  }
  if (block.type === 'asis') {
    const svg = asisSvgMarkup(block.chains);
    const flows = (block.chains ?? [])
      .map((chain) => `<p class="ig-asis-flow">${escapeHtml(asisFlowText(chain) || 'Sin cadena documentada.')}</p>`)
      .join('');
    return `<div class="ig-asis">${svg}${flows}</div>`;
  }
  if (block.type === 'metric') {
    return `
      <article class="ig-metric">
        <h3>${escapeHtml(block.title)}</h3>
        ${block.kind ? `<p><span class="ig-kind">${escapeHtml(block.kind)}</span></p>` : ''}
        ${block.data ? `<p><strong>Datos fuente:</strong> ${escapeHtml(block.data)}</p>` : ''}
        ${block.formula ? `<p><strong>Fórmula:</strong> ${escapeHtml(block.formula)}</p>` : ''}
        ${block.calculation ? `<p><strong>Cálculo:</strong> ${escapeHtml(block.calculation)}</p>` : ''}
        <p><strong>Resultado:</strong> ${escapeHtml(block.result || '—')}</p>
        ${block.interpretation ? `<p><strong>Interpretación:</strong> ${escapeHtml(block.interpretation)}</p>` : ''}
        ${block.limitation ? `<p><strong>Limitación:</strong> ${escapeHtml(block.limitation)}</p>` : ''}
        ${block.decision ? `<p><strong>Decisión derivada:</strong> ${escapeHtml(block.decision)}</p>` : ''}
        ${block.source ? renderPdfSource(block, variant) : ''}
        ${block.calculatedNote ? `<p><em>${escapeHtml(block.calculatedNote)}</em></p>` : ''}
      </article>
    `;
  }
  if (block.type === 'finding') {
    return renderFinding(block.finding, variant);
  }
  if (block.type === 'callout') {
    const tone = block.tone === 'warning' ? 'ig-callout--warning' : 'ig-callout--note';
    return `<aside class="ig-callout ${tone}">${escapeHtml(block.text)}</aside>`;
  }
  if (block.type === 'trace') {
    return `
      <aside class="ig-callout ig-callout--note">
        ${block.source ? `<p><strong>Fuente:</strong> ${escapeHtml(block.source)}</p>` : ''}
        ${block.evidence ? `<p><strong>Evidencia:</strong> ${escapeHtml(block.evidence)}</p>` : ''}
      </aside>
    `;
  }
  if (block.type === 'recTrace') {
    return `
      <aside class="ig-callout ig-callout--note">
        <p><strong>Recomendación:</strong> ${escapeHtml(block.recommendation)}</p>
        ${block.finding ? `<p><strong>Hallazgo:</strong> ${escapeHtml(block.finding)}</p>` : ''}
      </aside>
    `;
  }
  return '';
}

function renderFinding(finding = {}, variant) {
  const evidence = (finding.evidence ?? [])
    .map((item) => {
      const fact = [item.label, item.value].filter(Boolean).join(': ');
      const citation = item.citation || '';
      const text = [fact, citation].filter(Boolean).join('. ');
      return renderCitation(text, item.href, variant);
    })
    .join('<br>');
  const rows = [
    ['Severidad', finding.severity],
    ['Estado de evidencia', finding.evidenceState],
    ['Tipo de afirmación', finding.kind],
    ['Condición técnica', finding.condition],
    ['Evidencia', evidence || 'Sin evidencia asociada. PENDIENTE DE VERIFICACIÓN.'],
    ['Página del documento fuente', (finding.pages ?? []).join(', ') || '—'],
    ['Implicación técnica', finding.implication],
    ['Impacto para el negocio', finding.businessImpact],
    ['Causa o deficiencia de control', finding.cause],
    ['Riesgo asociado', finding.riskId],
    ['Tratamiento recomendado', finding.treatment || 'Tratamiento pendiente de documentar'],
    ['Prioridad', finding.priority],
    ['Responsable sugerido', finding.owner],
    ['Plazo', finding.deadline],
    ['Criterio de aceptación', finding.acceptance],
    ['Estado de cierre', finding.closure],
  ];
  const body = rows
    .map(([label, value]) => `<dt>${escapeHtml(label)}</dt><dd>${value && String(value).includes('<a ') ? value : escapeHtml(value || '—')}</dd>`)
    .join('');
  return `
    <article class="ig-finding">
      <header class="ig-finding__head">
        <strong>${escapeHtml(finding.id)} | ${escapeHtml(finding.title)}</strong>
        <span class="ig-finding__meta">${escapeHtml(finding.severity)} · ${escapeHtml(finding.evidenceState)}</span>
      </header>
      <dl>${body}</dl>
    </article>
  `;
}

function renderCitation(citation, href, variant) {
  if (!citation) return '';
  if (href && variant === 'html') {
    return `<a class="ig-source-link" href="${escapeHtml(href)}" target="_blank" rel="noopener">${escapeHtml(citation)}</a>`;
  }
  return escapeHtml(citation);
}

function renderPdfSource(block, variant) {
  const citation = block.source;
  if (block.sourceHref && variant === 'html') {
    return `<p><strong>Fuente:</strong> <a class="ig-source-link" href="${escapeHtml(block.sourceHref)}" target="_blank" rel="noopener">${escapeHtml(citation)}</a></p>`;
  }
  return `<p><strong>Fuente:</strong> ${escapeHtml(citation)}</p>`;
}

export function wrapStandaloneHtml(model, inner) {
  const title = `${model.cover.caseName} — Informe técnico de consultoría`;
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

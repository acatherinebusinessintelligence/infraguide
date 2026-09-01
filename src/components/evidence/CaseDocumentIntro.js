import { escapeHtml } from '../../utils/escape.js';
import { getPrimarySourceDocument, caseMapSections } from '../../data/evidence/index.js';
import { CaseMap } from './CasePdfViewer.js';

export function CaseDocumentIntro({ caseData, state }) {
  const doc = getPrimarySourceDocument(caseData);
  const reading = state.caseReading || {};
  const pages = Number.isFinite(Number(reading.pageCount))
    ? reading.pageCount
    : Number.isFinite(Number(doc?.pages))
      ? doc.pages
      : null;
  const status = reading.openedPdf
    ? 'Has abierto el documento fuente en esta sesión.'
    : 'Todavía no has abierto el documento fuente.';

  return `
    <section class="case-intro" aria-labelledby="case-intro-title">
      <p class="guided-kicker">Antes de analizar, conoce el caso</p>
      <h1 id="case-intro-title">${escapeHtml(caseData.name)}</h1>
      <p>${escapeHtml(caseData.summary || '')}</p>
      <p class="readonly-note">${escapeHtml(caseData.pedagogicalNote || '')}</p>
      <aside class="panel">
        <h2>Instrucciones de lectura</h2>
        <ol>
          <li>Abre el PDF original. Ese documento es la fuente académica.</li>
          <li>El JSON de InfraGuide es solo la representación estructurada que acompaña el análisis.</li>
          <li>Cada dato utilizado debe poder rastrearse hasta su evidencia.</li>
          <li>No copies conclusiones: localiza, selecciona y justifica.</li>
        </ol>
        <p class="consultant-tip">Los datos presentados en InfraGuide fueron estructurados a partir del caso original. Usa los enlaces de evidencia para comprobar su ubicación en el documento.</p>
      </aside>
      <dl class="intro-meta">
        <div><dt>Estado de lectura</dt><dd>${escapeHtml(status)}</dd></div>
        <div><dt>Páginas</dt><dd>${pages != null ? escapeHtml(String(pages)) : 'Se mostrarán cuando el visor cargue el PDF original.'}</dd></div>
        <div><dt>Documento</dt><dd>${escapeHtml(doc?.file || 'Pendiente de vincular')}</dd></div>
      </dl>
      ${
        doc?.linked === false
          ? `<p class="form-error" role="status">Falta el PDF original. Colócalo en <code>public/cases/helados-boreal/caso-helados-boreal.pdf</code>. El visor puede abrir un marcador de posición, pero ninguna evidencia debe presentarse como verificada.</p>`
          : ''
      }
      <div class="intro-actions">
        <button class="btn btn--primary" type="button" data-action="open-case-pdf">Abrir caso</button>
        <button class="btn btn--ghost-dark" type="button" data-action="start-guided-reading">Comenzar lectura guiada</button>
        <button class="btn" type="button" data-action="complete-case-intro">Continuar al índice del caso</button>
      </div>
      ${CaseMap({ sections: caseMapSections(caseData) })}
    </section>
  `;
}

export function CaseSourceBar({ caseData }) {
  if (!caseData) return '';
  return `
    <aside class="source-bar" aria-label="Documento fuente">
      <p>El PDF es la fuente académica. El JSON solo estructura los datos para el análisis.</p>
      <p class="source-bar__note">Los datos presentados en InfraGuide fueron estructurados a partir del caso original. Usa los enlaces de evidencia para comprobar su ubicación en el documento.</p>
      <div class="source-bar__actions">
        <button class="btn btn--small btn--primary" type="button" data-action="open-case-pdf">Abrir caso en PDF</button>
        <a class="btn btn--small" href="#/caso/lectura" data-nav="/caso/lectura">Lectura guiada</a>
        <a class="btn btn--small" href="#/caso/conocer" data-nav="/caso/conocer">Conocer el caso</a>
      </div>
    </aside>
  `;
}

export function TraceabilityChain({ items = [] }) {
  const nodes = items
    .map(
      (item, index) => `
        <li>
          <span class="trace-chain__label">${escapeHtml(item.label)}</span>
          <span class="trace-chain__value">${escapeHtml(item.value || '')}</span>
        </li>
        ${index < items.length - 1 ? '<li class="trace-chain__arrow" aria-hidden="true">→</li>' : ''}
      `,
    )
    .join('');
  return `
    <ol class="trace-chain-inline" aria-label="Cadena de trazabilidad">
      ${nodes}
    </ol>
  `;
}

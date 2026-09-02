import { escapeHtml } from '../../utils/escape.js';
import {
  getPrimarySourceDocument,
  getEvidenceById,
  getEvidenceForField,
  getEvidenceForSection,
  caseMapSections,
  formatAcademicCitation,
  resolveEvidenceStatus,
  EVIDENCE_STATUS_LABEL,
  EVIDENCE_ORIGIN,
} from '../../data/evidence/index.js';
import { pdfPageHref } from '../../utils/assetUrl.js';
import { EvidenceHighlighter } from './EvidenceHighlighter.js';

export function CasePdfViewer({ state, caseData }) {
  const viewer = state.pdfViewer || {};
  const doc = getPrimarySourceDocument(caseData);
  const evidence =
    (viewer.evidenceId ? getEvidenceById(caseData, viewer.evidenceId) : null) ||
    (viewer.fieldKey ? getEvidenceForField(caseData, viewer.fieldKey) : null) ||
    (viewer.sourceSectionId
      ? getEvidenceForSection(caseData, viewer.sourceSectionId).find((item) => item.quote)
      : null);
  const pageHint = Number(viewer.page) >= 1 ? Number(viewer.page) : evidence?.page || 1;
  const fallbackHref = doc?.file ? pdfPageHref(doc.file, evidence?.page || viewer.page) : '';
  const map = caseMapSections(caseData);

  return `
    <div class="pdf-viewer" data-pdf-root="true" role="dialog" aria-modal="true" aria-labelledby="pdf-viewer-title">
      <header class="pdf-viewer__toolbar">
        <div>
          <p class="pdf-viewer__kicker">Documento fuente</p>
          <h2 id="pdf-viewer-title">${escapeHtml(doc?.title || caseData?.name || 'Caso')}</h2>
        </div>
        <div class="pdf-viewer__nav">
          <button class="btn btn--small" type="button" data-pdf-action="prev" aria-label="Página anterior">Página anterior</button>
          <label class="pdf-page-input">
            <span class="visually-hidden">Número de página</span>
            <input type="number" min="1" inputmode="numeric" data-pdf-page-input value="${escapeHtml(String(pageHint))}" aria-label="Ir a la página" />
            <span data-pdf-page-total></span>
          </label>
          <button class="btn btn--small" type="button" data-pdf-action="next" aria-label="Página siguiente">Página siguiente</button>
        </div>
        <div class="pdf-viewer__zoom">
          <button class="btn btn--small" type="button" data-pdf-action="zoom-out" aria-label="Alejar">Alejar</button>
          <button class="btn btn--small" type="button" data-pdf-action="zoom-in" aria-label="Acercar">Acercar</button>
          <button class="btn btn--small" type="button" data-pdf-action="fit-width">Ajustar al ancho</button>
        </div>
        <div class="pdf-viewer__extra">
          ${
            fallbackHref
              ? `<a class="btn btn--small" href="${escapeHtml(fallbackHref)}" target="_blank" rel="noopener noreferrer">Abrir en otra pestaña</a>
                 <a class="btn btn--small" href="${escapeHtml(fallbackHref)}" download>Descargar PDF</a>`
              : ''
          }
          <button class="btn btn--small btn--primary" type="button" data-action="close-pdf-viewer">Volver a la actividad</button>
        </div>
      </header>
      ${
        doc?.linked === false
          ? `<p class="pdf-banner pdf-banner--warn" role="status">El PDF original del caso aún no está vinculado. El archivo actual es un marcador de posición. Coloque el documento fuente en <code>public/cases/helados-boreal/caso-helados-boreal.pdf</code>.</p>`
          : ''
      }
      <div class="pdf-viewer__body">
        <div class="pdf-stage">
          <div class="pdf-stage__canvas-wrap" data-pdf-stage>
            <canvas data-pdf-canvas></canvas>
            <div class="pdf-text-layer" data-pdf-text-layer></div>
            <div class="pdf-highlight-layer" data-pdf-highlight-layer></div>
          </div>
          <p class="pdf-fallback is-hidden" data-pdf-fallback role="alert">
            No fue posible abrir el documento dentro de InfraGuide.
            ${
              fallbackHref
                ? `<span class="pdf-fallback__actions">
                    <a class="btn btn--primary" href="${escapeHtml(fallbackHref)}" target="_blank" rel="noopener noreferrer">Abrir PDF en otra pestaña</a>
                    <a class="btn" href="${escapeHtml(fallbackHref)}" download>Descargar PDF</a>
                  </span>`
                : '<span>Falta el archivo del caso en la ruta de publicación.</span>'
            }
          </p>
        </div>
        <aside class="evidence-panel" aria-labelledby="evidence-panel-title">
          <h3 id="evidence-panel-title">Evidencia consultada</h3>
          ${renderEvidenceCard(caseData, evidence, viewer, map)}
          ${CaseMap({ sections: map, compact: true })}
          <button class="btn btn--primary pdf-return" type="button" data-action="close-pdf-viewer">Volver a la actividad</button>
        </aside>
      </div>
    </div>
  `;
}

function renderEvidenceCard(caseData, evidence, viewer, map) {
  if (!evidence && !viewer.sourceSectionId) {
    return `
      <p>Estás leyendo el documento fuente. Los datos de InfraGuide son una representación estructurada; usa el mapa del caso para localizar secciones.</p>
      <p class="consultant-tip">Los datos presentados en InfraGuide fueron estructurados a partir del caso original. Usa los enlaces de evidencia para comprobar su ubicación en el documento.</p>
    `;
  }

  const mapped = map.find((item) => item.sourceSectionId === viewer.sourceSectionId);
  const section = evidence?.section || mapped?.title || '';
  const shownPage = Number(viewer.page) >= 1 ? Number(viewer.page) : evidence?.page || mapped?.page;
  const status = evidence ? resolveEvidenceStatus(evidence) : mapped?.verified ? 'VERIFICADA' : 'PENDIENTE_DE_VERIFICAR';
  const pageText = shownPage
    ? `Página ${shownPage}${section ? ` – ${section}` : ''}`
    : 'Página pendiente de verificar';
  const used = (evidence?.usedBy ?? []).map((item) => `<li>${escapeHtml(String(item))}</li>`).join('');

  return `
    ${EvidenceHighlighter({ evidence, scanned: true })}
    <dl class="evidence-dl">
      <div><dt>Dato</dt><dd>${escapeHtml(evidence?.label || 'Sección del caso')}</dd></div>
      <div><dt>Valor</dt><dd>${escapeHtml(evidence?.value || '—')}</dd></div>
      <div><dt>Ubicación</dt><dd>${escapeHtml(pageText)}</dd></div>
      <div><dt>Estado</dt><dd>${escapeHtml(EVIDENCE_STATUS_LABEL[status] || status)}</dd></div>
    </dl>
    <p><strong>Fragmento:</strong> ${
      evidence?.quote
        ? `“${escapeHtml(evidence.quote)}”`
        : shownPage
          ? 'Esta apertura muestra la sección del documento. Abre un dato subrayado para ver su fragmento verificado.'
          : 'No se transcribe un fragmento porque aún no ha sido localizado en el PDF original.'
    }</p>
    ${
      evidence?.fieldKey
        ? `<button class="btn btn--small btn--primary" type="button" data-action="collect-evidence" data-field-key="${escapeHtml(evidence.fieldKey)}">Agregar a mis datos</button>`
        : ''
    }
    ${
      evidence?.origin === EVIDENCE_ORIGIN.CALCULATED
        ? '<p class="consultant-tip">Este valor es un resultado calculado. No aparece literalmente en el PDF.</p>'
        : ''
    }
    <p><strong>Utilizado en:</strong></p>
    <ul>${used || '<li>comprensión del caso</li>'}</ul>
    <p class="academic-note">${escapeHtml(formatAcademicCitation(caseData, evidence))}</p>
  `;
}

export function CaseMap({ sections = [], compact = false }) {
  const items = sections
    .map((item) => {
      const page = item.page
        ? item.verified
          ? ` — página ${item.page}`
          : ` — página ${item.page} (pendiente de verificar)`
        : ' — página pendiente de verificar';
      return `
        <li>
          <button
            class="case-map__link"
            type="button"
            data-action="open-case-section"
            data-section-id="${escapeHtml(item.sourceSectionId)}"
            ${item.page ? `data-page="${item.page}"` : ''}
          >
            ${escapeHtml(item.title)}${escapeHtml(page)}
          </button>
        </li>
      `;
    })
    .join('');

  return `
    <nav class="case-map${compact ? ' case-map--compact' : ''}" aria-label="Mapa del caso">
      <h3>Mapa del caso</h3>
      <p>${sections.some((item) => item.page) ? 'Las páginas indicadas corresponden al documento fuente verificado.' : 'Las páginas se publicarán solo cuando se verifiquen en el PDF original.'}</p>
      <ol>${items}</ol>
    </nav>
  `;
}

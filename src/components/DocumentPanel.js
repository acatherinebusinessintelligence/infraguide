import { appCopy } from '../data/copy.js';
import { documentSections } from '../data/document/sections.js';
import { DATA_STATUS, analysisCatalog } from '../data/methodology/data-map.js';
import { getPreparedDocumentSections } from '../state/appState.js';
import { isDocumented, formatTimestamp } from '../state/understandModel.js';
import { escapeHtml } from '../utils/escape.js';

export function DocumentPanel({
  open,
  collectedData = [],
  methodologyStatus = {},
  documentEntries = {},
  documentViewKey = null,
  variant = 'drawer',
  readyToExport = false,
}) {
  const prepared = getPreparedDocumentSections(collectedData);

  const items = documentSections
    .map((section) => {
      const authored = documentEntries[section.key];
      const data = prepared[section.id] ?? [];
      const readyAnalyses = Object.values(analysisCatalog).filter(
        (analysis) =>
          analysis.documentSectionId === section.id &&
          methodologyStatus[analysis.id] === DATA_STATUS.READY_TO_PROCESS,
      );

      let status = 'PENDIENTE';
      if (authored?.reviewRequired) {
        status = 'REVISIÓN REQUERIDA';
      } else if (isDocumented(authored)) {
        status = 'COMPLETADO';
      } else if (authored?.status === 'IN_PROGRESS' || (authored?.rows ?? []).length) {
        status = 'EN PROGRESO';
      } else if (data.length) {
        status = readyAnalyses.length ? appCopy.document.readyToProcess : appCopy.document.waitingData;
      }

      const extra = renderAuthored(authored, data, readyAnalyses, section);

      return `
        <li class="document-index__item${isDocumented(authored) || data.length ? ' has-data' : ''}">
          <button
            class="document-index__open"
            type="button"
            data-action="view-document-section"
            data-section-key="${escapeHtml(section.key)}"
          >
            <span>${escapeHtml(section.number)}. ${escapeHtml(section.title)}</span>
            <span class="document-index__status${isDocumented(authored) || data.length || authored?.status === 'IN_PROGRESS' ? ' is-filled' : ''}">${escapeHtml(status)}</span>
          </button>
          ${documentViewKey === section.key ? extra : ''}
        </li>
      `;
    })
    .join('');

  const hiddenDesktop = !open && variant === 'sidebar' ? ' is-hidden-desktop' : '';
  const openClass = open ? ' is-open' : '';

  return `
    <aside
      id="document-panel"
      class="document-panel document-panel--${variant}${hiddenDesktop}${openClass}"
      aria-labelledby="document-panel-title"
      aria-hidden="${open ? 'false' : 'true'}"
      ${open ? '' : 'inert'}
    >
      <div class="document-panel__head">
        <div>
          <h2 class="document-panel__title" id="document-panel-title">${escapeHtml(appCopy.document.title)}</h2>
          <p class="document-panel__intro">${escapeHtml(appCopy.document.intro)}</p>
        </div>
        <button
          class="btn--icon document-panel__close"
          type="button"
          data-action="close-document"
          aria-label="${escapeHtml(appCopy.document.close)}"
        >
          ×
        </button>
      </div>
      <ol class="document-index">
        ${items}
      </ol>
      ${
        readyToExport
          ? `
            <div class="document-panel__export">
              <p><strong>${escapeHtml(appCopy.document.readyBanner)}</strong></p>
              <a class="btn btn--primary" href="#/exportar" data-nav="/exportar">${escapeHtml(appCopy.document.export)}</a>
            </div>
          `
          : ''
      }
    </aside>
  `;
}

function renderAuthored(authored, data, readyAnalyses, section) {
  if (!isDocumented(authored) && !data.length) {
    return `<p class="document-prepared">Todavía no hay contenido en esta sección.</p>`;
  }

  const sources = (authored?.sources ?? []).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join('');
  const evidences = (authored?.evidences ?? []).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join('');
  const nodes = (authored?.nodes ?? [])
    .map((node) => `<li>Nodo: ${escapeHtml(node.name)}. Fuente: ${escapeHtml(node.sourceLabel)}.</li>`)
    .join('');
  const rows = (authored?.rows ?? [])
    .map((row) => {
      const extra = [row.practice, row.decision, row.responsible, row.control, row.justification]
        .filter(Boolean)
        .join(' — ');
      return `<li>${escapeHtml(row.name || row.label || '')}${extra ? ` — ${escapeHtml(extra)}` : ''}${row.reviewRequired ? ' (revisión requerida)' : ''}</li>`;
    })
    .join('');
  const subsections = Object.values(authored?.subsections ?? {})
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.title || '')}</strong>
          ${item.formula ? `<br>Fórmula: ${escapeHtml(item.formula)}` : ''}
          ${item.result ? `<br>Resultado: ${escapeHtml(item.result)}` : ''}
          ${item.limitation ? `<br>Límite: ${escapeHtml(item.limitation)}` : ''}
          ${item.reviewRequired ? '<br>REVISIÓN REQUERIDA' : ''}
        </li>
      `,
    )
    .join('');

  return `
    <div class="document-prepared">
      ${
        authored?.text
          ? `
            <p><strong>Texto</strong></p>
            <textarea rows="5" data-doc-edit="${escapeHtml(section.key)}">${escapeHtml(authored.text)}</textarea>
            <button class="btn btn--small btn--primary" type="button" data-action="save-doc-edit" data-section-key="${escapeHtml(section.key)}">Guardar edición</button>
          `
          : ''
      }
      ${evidences ? `<p><strong>Evidencias utilizadas</strong></p><ul>${evidences}</ul>` : ''}
      ${nodes ? `<p><strong>Nodos y fuentes</strong></p><ul>${nodes}</ul>` : ''}
      ${sources ? `<p><strong>Fuentes utilizadas</strong></p><ul>${sources}</ul>` : ''}
      ${rows ? `<p><strong>Trazabilidad</strong></p><ul>${rows}</ul>` : ''}
      ${subsections ? `<p><strong>Subsecciones de métricas</strong></p><ul>${subsections}</ul>` : ''}
      ${authored?.reviewRequired ? '<p class="form-error">REVISIÓN REQUERIDA</p>' : ''}
      ${
        authored?.lastUpdated
          ? `<p>Última actualización: ${escapeHtml(formatTimestamp(authored.lastUpdated))}</p>`
          : ''
      }
      ${
        data.length
          ? `<p>${escapeHtml(appCopy.document.preparedHeading)}</p>
             <ul>${data.map((item) => `<li>✓ ${escapeHtml(item.label)}: ${escapeHtml(item.displayValue || '')}</li>`).join('')}</ul>`
          : ''
      }
      ${readyAnalyses.map((analysis) => `<p class="document-ready">${escapeHtml(analysis.label)} - ${escapeHtml(appCopy.caseWork.analysisReady)}</p>`).join('')}
    </div>
  `;
}

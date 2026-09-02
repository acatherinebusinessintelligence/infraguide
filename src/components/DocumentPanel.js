import { appCopy } from '../data/copy.js';
import { consultingDocumentSections, DOCUMENT_SECTION_STATUS } from '../data/document/consultingSections.js';
import { buildConsultingDocumentIndex, documentChainFor } from '../state/documentTrace.js';
import { formatTimestamp } from '../state/understandModel.js';
import { HowObtainedButton } from './pedagogy/GuidedCalculator.js';
import { escapeHtml } from '../utils/escape.js';

export function DocumentPanel({
  open,
  state = null,
  collectedData = [],
  methodologyStatus = {},
  documentEntries = {},
  documentViewKey = null,
  variant = 'drawer',
  readyToExport = false,
}) {
  void methodologyStatus;
  void documentEntries;
  const snapshot = state?.selectedCase
    ? buildConsultingDocumentIndex(state)
    : {
        items: consultingDocumentSections.map((spec) => ({
          ...spec,
          status: DOCUMENT_SECTION_STATUS.EMPTY,
          content: '',
          evidenceIds: [],
          calculationIds: [],
          findingIds: [],
          decisionIds: [],
          lastUpdated: null,
          missing: ['Selecciona el caso para construir esta sección.'],
          trace: { stage: spec.feeds[0] || '', activityId: spec.activityId, findingIds: [], evidenceIds: [], calculationIds: [], decisionIds: [], updatedAt: null },
        })),
        readiness: 0,
        validation: { errors: [], warnings: [] },
      };
  const measure = state?.analysis?.measure ?? {};

  const items = snapshot.items
    .map((section) => {
      const extra = documentViewKey === section.key ? renderSectionDetail(section, measure, collectedData) : '';
      const filled = section.status !== DOCUMENT_SECTION_STATUS.EMPTY;
      return `
        <li class="document-index__item${filled ? ' has-data' : ''}">
          <button
            class="document-index__open"
            type="button"
            data-action="view-document-section"
            data-section-key="${escapeHtml(section.key)}"
          >
            <span>${escapeHtml(section.number)}. ${escapeHtml(section.title)}</span>
            <span class="document-index__status${filled ? ' is-filled' : ''}">${escapeHtml(section.status)}</span>
          </button>
          ${extra}
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
          <p class="document-panel__readiness">Preparación del informe: ${snapshot.readiness} %.</p>
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
      <div class="document-panel__actions">
        <a class="btn btn--small btn--primary" href="#/informe" data-nav="/informe">Vista previa del informe</a>
        <a class="btn btn--small" href="#/informe/modelo" data-nav="/informe/modelo">Ver informe modelo</a>
      </div>
      <ol class="document-index">
        ${items}
      </ol>
      ${
        readyToExport
          ? `
            <div class="document-panel__export">
              <p><strong>EXPORTAR INFORME</strong> genera HTML, Word o PDF. <strong>GUARDAR PROGRESO</strong> conserva tu trabajo para continuar después.</p>
              <a class="btn btn--primary" href="#/exportar" data-nav="/exportar">${escapeHtml(appCopy.document.export)}</a>
              <a class="btn" href="#/progreso" data-nav="/progreso">Guardar progreso</a>
            </div>
          `
          : `
            <div class="document-panel__export">
              <p>La exportación definitiva se habilita al validar CONSTRUIR. Puedes revisar la vista previa en cualquier momento.</p>
              <a class="btn" href="#/informe" data-nav="/informe">Abrir vista previa</a>
            </div>
          `
      }
    </aside>
  `;
}

function renderSectionDetail(section, measure, collectedData) {
  const evidences = (section.evidenceIds ?? []).map((id) => `<li>${escapeHtml(id)}</li>`).join('');
  const calcs = (section.calculationIds ?? [])
    .map((id) => `<li>${escapeHtml(id)} ${HowObtainedButton({ metricId: id, open: false })}</li>`)
    .join('');
  const collected = collectedData
    .filter((item) => section.evidenceIds?.includes(item.evidenceId) || section.academicKeys?.includes(item.documentSectionId))
    .map((item) => `<li>${escapeHtml(item.label)}: ${escapeHtml(item.displayValue || '')} (p. ${item.page ?? '—'})</li>`)
    .join('');
  const missing = (section.missing ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const chain = documentChainFor(section)
    .map((step) => `<li>${escapeHtml(step)}</li>`)
    .join('');

  return `
    <div class="document-prepared">
      <p><strong>Estado:</strong> ${escapeHtml(section.status)}</p>
      <p><strong>Actividad que la alimenta:</strong> ${escapeHtml(section.activityLabel)}</p>
      ${section.note ? `<p>${escapeHtml(section.note)}</p>` : ''}
      <p><strong>Contenido incorporado:</strong> ${escapeHtml(section.content || 'Todavía no hay texto en esta sección.')}</p>
      ${collected ? `<p><strong>Datos recolectados relacionados</strong></p><ul>${collected}</ul>` : ''}
      ${evidences ? `<p><strong>Evidencia utilizada</strong></p><ul>${evidences}</ul>` : '<p><strong>Evidencia utilizada:</strong> ninguna registrada todavía.</p>'}
      ${calcs ? `<p><strong>Cálculos relacionados</strong></p><ul>${calcs}</ul>` : ''}
      ${
        section.lastUpdated
          ? `<p>Última actualización: ${escapeHtml(formatTimestamp(section.lastUpdated))}</p>`
          : '<p>Última actualización: sin registrar.</p>'
      }
      ${missing ? `<p><strong>Información faltante</strong></p><ul>${missing}</ul>` : ''}
      <p>
        <a class="btn btn--small btn--primary" href="#${escapeHtml(section.activityPath)}" data-nav="${escapeHtml(section.activityPath)}">Continuar esta sección</a>
        <a class="btn btn--small" href="#/informe" data-nav="/informe">Ver en la vista previa</a>
      </p>
      <details class="contextual-help">
        <summary>Ver de dónde salió esta sección</summary>
        <ol class="document-chain">${chain}</ol>
        <p>Etapa: ${escapeHtml(section.trace.stage)} · Actividad: ${escapeHtml(section.trace.activityId)}</p>
        <p>Hallazgos: ${escapeHtml((section.findingIds || []).join(', ') || '—')}</p>
        <p>Evidencias: ${escapeHtml((section.evidenceIds || []).join(', ') || '—')}</p>
        <p>Cálculos: ${escapeHtml((section.calculationIds || []).join(', ') || '—')}</p>
        <p>Decisiones: ${escapeHtml((section.decisionIds || []).join(', ') || '—')}</p>
      </details>
    </div>
  `;
}

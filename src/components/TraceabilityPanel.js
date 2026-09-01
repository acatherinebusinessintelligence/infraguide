import { appCopy } from '../data/copy.js';
import { dataMap, getAnalysisLabel, DATA_STATUS, DATA_STATUS_LABEL } from '../data/methodology/data-map.js';
import { documentSections } from '../data/document/sections.js';
import { escapeHtml } from '../utils/escape.js';

export function TraceabilityPanel({
  fields = [],
  values = {},
  items = null,
  title = appCopy.traceability.title,
  kicker = 'Cadena de evidencia',
}) {
  const resolved =
    items ??
    fields.map((field) => ({
      label: field.label,
      caption: field.caption,
      value: values[field.id] ?? '',
    }));

  const nodes = resolved
    .map(
      (item) => `
        <li class="trace-item">
          <span class="trace-item__label">${escapeHtml(item.label)}</span>
          ${item.caption ? `<span class="trace-item__caption">${escapeHtml(item.caption)}</span>` : ''}
          <span class="trace-item__value">${escapeHtml(item.value ?? '')}</span>
        </li>
      `,
    )
    .join('');

  return `
    <section class="trace-panel" aria-labelledby="trace-panel-title">
      <header class="trace-panel__header">
        <p class="trace-panel__kicker">${escapeHtml(kicker)}</p>
        <h3 class="trace-panel__title" id="trace-panel-title">${escapeHtml(title)}</h3>
      </header>
      <ol class="trace-chain" aria-label="${escapeHtml(appCopy.traceability.chainLabel)}">
        ${nodes}
      </ol>
    </section>
  `;
}

export function buildIdentificationTraceItems(entry, methodologyStatus = {}) {
  if (!entry) {
    return null;
  }

  const meta = dataMap[entry.key] ?? {};
  const uses = (meta.usedIn ?? []).map(getAnalysisLabel).join(', ');
  const doc = documentSections.find((section) => section.id === meta.documentSectionId);
  const status = methodologyStatus[entry.key] ?? DATA_STATUS.FOUND;

  return [
    { id: 'source', label: 'FUENTE', caption: 'Dato de origen.', value: entry.sourceLabel },
    { id: 'datum', label: 'DATO', caption: 'Dato utilizado.', value: `${entry.displayValue || entry.value} — ${entry.label}` },
    { id: 'usedIn', label: 'SE UTILIZA EN', caption: 'Análisis donde se usará.', value: uses },
    {
      id: 'destination',
      label: 'DESTINO',
      caption: 'Sección del documento.',
      value: doc ? `Sección ${doc.id} - ${doc.title}` : 'Métricas del informe',
    },
    { id: 'status', label: 'ESTADO', caption: 'Estado metodológico.', value: DATA_STATUS_LABEL[status] ?? status },
  ];
}

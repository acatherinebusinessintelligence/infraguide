import { appCopy } from '../data/copy.js';
import {
  DATA_STATUS,
  DATA_STATUS_LABEL,
  analysisCatalog,
  getGroupProgress,
} from '../data/methodology/data-map.js';
import { escapeHtml } from '../utils/escape.js';

export function CollectedDataPanel({ collectedData, methodologyStatus, open = true, variant = 'inline' }) {
  const progress = getGroupProgress(collectedData);
  const items = collectedData
    .map(
      (item) => `
        <li class="collected-item">
          <div>
            <strong>${escapeHtml(item.label)}</strong>
            <span>${escapeHtml(item.displayValue || `${item.value} ${item.unit || ''}`.trim())}</span>
            <small>${escapeHtml(appCopy.caseWork.sourceHeading)}: ${escapeHtml(item.sourceLabel)}</small>
          </div>
          <button class="btn btn--small" type="button" data-action="remove-data" data-data-key="${escapeHtml(item.key)}">
            ${escapeHtml(appCopy.caseWork.removeButton)}
          </button>
        </li>
      `,
    )
    .join('');

  const analyses = ['availability', 'mttr', 'capacity']
    .map((id) => analysisCatalog[id])
    .filter(Boolean)
    .map((analysis) => {
      const ready = methodologyStatus[analysis.id] === DATA_STATUS.READY_TO_PROCESS;
      return `
        <li class="analysis-status${ready ? ' is-ready' : ''}">
          <span>${escapeHtml(analysis.label)}${ready ? ` - ${appCopy.caseWork.analysisReady}` : ''}</span>
          ${ready ? '' : `<span>${escapeHtml(DATA_STATUS_LABEL.NOT_FOUND)}</span>`}
        </li>
      `;
    })
    .join('');

  const hidden = variant === 'drawer' && !open ? ' is-hidden-desktop' : '';
  const openClass = open ? ' is-open' : '';

  return `
    <section
      id="${variant === 'drawer' ? 'collected-panel' : 'collected-inline'}"
      class="collected-panel collected-panel--${variant}${hidden}${openClass}"
      aria-labelledby="collected-title"
      ${variant === 'drawer' ? `aria-hidden="${open ? 'false' : 'true'}"` : ''}
    >
      <header class="collected-panel__head">
        <div>
          <h2 id="collected-title">${escapeHtml(appCopy.caseWork.collectedTitle)}</h2>
          <p>${escapeHtml(appCopy.dashboard.prepLabel)}: ${progress.identified} de ${progress.total} grupos de datos identificados.</p>
        </div>
        ${
          variant === 'drawer'
            ? `<button class="btn--icon" type="button" data-action="toggle-collected" aria-label="${escapeHtml(appCopy.caseWork.closeCollected)}">×</button>`
            : ''
        }
      </header>
      ${
        collectedData.length
          ? `<ul class="collected-list">${items}</ul>`
          : `<p class="collected-empty">${escapeHtml(appCopy.caseWork.collectedEmpty)}</p>`
      }
      <ul class="analysis-status-list">
        ${analyses}
      </ul>
    </section>
  `;
}

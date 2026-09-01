import { appCopy } from '../data/copy.js';
import { dataMap, getAnalysisLabel } from '../data/methodology/data-map.js';
import { formatFieldValue } from '../data/cases/index.js';
import { getSelectedCaseData } from '../state/appState.js';
import { EvidenceLink } from './evidence/EvidenceLink.js';
import { escapeHtml } from '../utils/escape.js';

export function DataTag({ field, section, collected = false, compact = false }) {
  const meta = dataMap[field.key] ?? { usedIn: [], laterUses: [] };
  const uses = (meta.usedIn ?? []).map(getAnalysisLabel).join(', ');
  const value = formatFieldValue(field);
  const source = section?.sectionTitle ?? field.sourceLabel ?? '';
  const caseData = getSelectedCaseData();

  return `
    <article class="data-tag${compact ? ' data-tag--compact' : ''}${collected ? ' is-collected' : ''}" data-data-key="${escapeHtml(field.key)}">
      <header class="data-tag__head">
        <p class="data-tag__label">${escapeHtml(field.label)}</p>
        ${
          field.usable
            ? `<button class="data-tag__flag" type="button" data-action="why-data" data-data-key="${escapeHtml(field.key)}">${escapeHtml(appCopy.caseWork.usefulData)}</button>`
            : ''
        }
      </header>
      <p class="data-tag__value">${escapeHtml(value)}</p>
      ${
        source
          ? `<p class="data-tag__source"><span>${escapeHtml(appCopy.caseWork.sourceHeading)}:</span> ${escapeHtml(source)}</p>`
          : ''
      }
      <p class="data-tag__evidence" data-evidence-field="${escapeHtml(field.key)}">${EvidenceLink({ caseData, fieldKey: field.key, component: 'data-tag' })}</p>
      ${
        uses
          ? `<p class="data-tag__uses"><span>${escapeHtml(appCopy.caseWork.usesHeading)}</span> ${escapeHtml(uses)}</p>`
          : ''
      }
      ${
        field.usable
          ? `
            <div class="data-tag__actions">
              <button class="data-tag__flag" type="button" data-action="why-data" data-data-key="${escapeHtml(field.key)}">
                ${escapeHtml(appCopy.caseWork.whyButton)}
              </button>
              ${
                collected
                  ? `<button class="btn btn--small" type="button" data-action="remove-data" data-data-key="${escapeHtml(field.key)}">${escapeHtml(appCopy.caseWork.removeButton)}</button>`
                  : `<button class="btn btn--small btn--primary" type="button" data-action="add-data" data-data-key="${escapeHtml(field.key)}">${escapeHtml(appCopy.caseWork.addButton)}</button>`
              }
            </div>
          `
          : ''
      }
    </article>
  `;
}

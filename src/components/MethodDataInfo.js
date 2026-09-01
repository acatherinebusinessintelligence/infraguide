import { appCopy } from '../data/copy.js';
import { dataMap, getAnalysisLabel } from '../data/methodology/data-map.js';
import { getCaseField, formatFieldValue } from '../data/cases/index.js';
import { escapeHtml } from '../utils/escape.js';

export function MethodDataInfo({ caseData, dataKey }) {
  if (!dataKey || !caseData) {
    return '';
  }

  const located = getCaseField(caseData, dataKey);
  const meta = dataMap[dataKey];
  if (!located || !meta) {
    return '';
  }

  const uses = (meta.usedIn ?? []).map((id) => `<li>${escapeHtml(getAnalysisLabel(id))}</li>`).join('');
  const later = (meta.laterUses ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `
    <div class="method-info-layer">
      <button class="backdrop backdrop--overlay" type="button" data-action="close-method-info" aria-label="${escapeHtml(appCopy.caseWork.closeInfo)}"></button>
      <div class="method-info" role="dialog" aria-modal="true" aria-labelledby="method-info-title">
        <header class="method-info__head">
          <h2 id="method-info-title">${escapeHtml(appCopy.caseWork.methodInfoTitle)}</h2>
          <button class="btn--icon" type="button" data-action="close-method-info" aria-label="${escapeHtml(appCopy.caseWork.closeInfo)}">×</button>
        </header>
        <p class="method-info__datum">${escapeHtml(located.field.label)}</p>
        <p class="method-info__value">${escapeHtml(formatFieldValue(located.field))}</p>
        <p class="method-info__source">
          <strong>${escapeHtml(appCopy.caseWork.sourceHeading)}:</strong>
          ${escapeHtml(located.section.sectionTitle)}
        </p>
        <h3>${escapeHtml(appCopy.caseWork.usesHeading)}</h3>
        <ul>${uses}</ul>
        ${
          later
            ? `<h3>${escapeHtml(appCopy.caseWork.laterHeading)}</h3><ul>${later}</ul>`
            : ''
        }
      </div>
    </div>
  `;
}

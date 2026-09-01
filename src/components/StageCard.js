import { STAGE_STATUS_LABEL } from '../data/stages/index.js';
import { appCopy } from '../data/copy.js';
import { escapeHtml } from '../utils/escape.js';

export function StageCard({ stage, status, selected = false }) {
  const label = STAGE_STATUS_LABEL[status];
  const disabled = status === 'blocked';
  const title = disabled ? appCopy.dashboard.blockedHint : stage.name;

  return `
    <button
      class="stage-card${selected ? ' is-selected' : ''}"
      type="button"
      data-action="select-stage"
      data-stage-id="${stage.id}"
      ${disabled ? 'disabled' : ''}
      aria-disabled="${disabled ? 'true' : 'false'}"
      aria-current="${selected ? 'true' : 'false'}"
      title="${escapeHtml(title)}"
    >
      <span class="stage-card__number">${escapeHtml(stage.number)}</span>
      <span class="stage-card__name">${escapeHtml(stage.name)}</span>
      <span class="stage-card__desc">${escapeHtml(stage.description)}</span>
      <span class="badge badge--${escapeHtml(status)}">${escapeHtml(label)}</span>
    </button>
  `;
}

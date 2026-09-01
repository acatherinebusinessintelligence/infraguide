import { escapeHtml } from '../utils/escape.js';

export function CaseSelector({ cases, selectedCaseId }) {
  const cards = cases
    .map((item) => {
      const selected = item.id === selectedCaseId;
      const buttonLabel = item.useButtonLabel || 'USAR ESTE CASO';
      return `
        <article class="case-card${selected ? ' is-selected' : ''}">
          <p class="case-card__kind">${escapeHtml(item.kindLabel || 'Caso')}</p>
          <h3 class="case-card__name">${escapeHtml(item.name)}</h3>
          <p class="case-card__sector">${escapeHtml(item.sector || '')}</p>
          <p class="case-card__summary">${escapeHtml(item.summary || '')}</p>
          <button
            class="btn ${selected ? 'btn--ghost-dark' : 'btn--primary'}"
            type="button"
            data-action="select-case"
            data-case-id="${escapeHtml(item.id)}"
            ${selected ? 'aria-current="true"' : ''}
          >
            ${escapeHtml(selected ? 'CASO ACTIVO' : buttonLabel)}
          </button>
        </article>
      `;
    })
    .join('');

  return `
    <div class="case-selector">
      ${cards}
    </div>
  `;
}

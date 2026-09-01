import { appCopy } from '../data/copy.js';
import { escapeHtml } from '../utils/escape.js';

export function MethodCard({ steps, values = {}, topic = '', disclaimer = '' }) {
  const flow = steps
    .map((step, index) => {
      const arrow =
        index < steps.length - 1 ? '<span class="flow__arrow" aria-hidden="true">→</span>' : '';
      return `
        <li class="flow__item">${escapeHtml(step.verb)}</li>
        ${arrow}
      `;
    })
    .join('');

  const items = steps
    .map((step, index) => {
      const content = values[step.id] ?? '';
      return `
        <li class="method-step">
          <p class="method-step__index">${index + 1}.</p>
          <h4 class="method-step__title">${escapeHtml(step.title)}</h4>
          <p class="method-step__desc">${escapeHtml(step.description)}</p>
          ${
            content
              ? `<div class="method-step__content">${escapeHtml(content)}</div>`
              : ''
          }
        </li>
      `;
    })
    .join('');

  return `
    <article class="method-card" aria-labelledby="method-card-title">
      <header class="method-card__header">
        <p class="method-card__kicker">${escapeHtml(appCopy.methodCard.titlePrefix)}</p>
        <h3 class="method-card__title" id="method-card-title">${escapeHtml(topic)}</h3>
        ${disclaimer ? `<p class="method-card__note">${escapeHtml(disclaimer)}</p>` : ''}
      </header>
      <ol class="flow method-flow flow--row" aria-label="${escapeHtml(appCopy.methodCard.flowLabel)}">
        ${flow}
      </ol>
      <ol class="method-steps" aria-label="${escapeHtml(appCopy.methodCard.stepsLabel)}">
        ${items}
      </ol>
    </article>
  `;
}

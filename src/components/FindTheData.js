import { escapeHtml } from '../utils/escape.js';

export function FindTheData({ activities, answers = {} }) {
  const cards = activities
    .map((activity) => {
      const selected = answers[activity.id];
      const revealed = Boolean(selected);
      const correct = selected === activity.correctId;
      const options = activity.options
        .map((option) => {
          const isSelected = selected === option.id;
          const isCorrect = option.id === activity.correctId;
          let extra = '';
          if (revealed && isSelected && isCorrect) extra = ' is-correct';
          if (revealed && isSelected && !isCorrect) extra = ' is-wrong';
          if (revealed && !isSelected && isCorrect) extra = ' is-solution';
          return `
            <li>
              <button
                class="activity-option${extra}"
                type="button"
                data-action="answer-activity"
                data-activity-id="${escapeHtml(activity.id)}"
                data-option-id="${escapeHtml(option.id)}"
                ${revealed ? 'disabled' : ''}
              >
                <span>${escapeHtml(option.id.toUpperCase())}.</span>
                ${escapeHtml(option.label)}
              </button>
            </li>
          `;
        })
        .join('');

      return `
        <article class="activity-card">
          <p class="activity-card__prompt">${escapeHtml(activity.prompt)}</p>
          <ul class="activity-options">${options}</ul>
          ${
            revealed
              ? `<p class="activity-feedback${correct ? ' is-correct' : ' is-wrong'}">${escapeHtml(correct ? activity.feedbackCorrect : activity.feedbackIncorrect)}</p>`
              : ''
          }
        </article>
      `;
    })
    .join('');

  return `<div class="activity-stack">${cards}</div>`;
}

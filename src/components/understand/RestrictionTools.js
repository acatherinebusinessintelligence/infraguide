import { escapeHtml } from '../../utils/escape.js';
import { restrictionTypes } from '../../data/methodology/understand.js';

export function RestrictionClassifier({ items, answers = {} }) {
  const cards = items
    .map((item) => {
      const current = answers[item.id];
      const revealed = Boolean(current);
      const correct = current === item.correctType;
      const buttons = restrictionTypes
        .map((type) => {
          const selected = current === type.id;
          let extra = '';
          if (revealed && selected && correct) extra = ' is-correct';
          if (revealed && selected && !correct) extra = ' is-wrong';
          if (revealed && !selected && type.id === item.correctType) extra = ' is-solution';
          return `
            <button class="chip${extra}" type="button" data-action="classify-restriction" data-item-id="${escapeHtml(item.id)}" data-value="${escapeHtml(type.id)}">
              ${escapeHtml(type.label)}
            </button>
          `;
        })
        .join('');
      return `
        <article class="classify-card">
          <h4>${escapeHtml(item.label)}</h4>
          <div class="chip-row">${buttons}</div>
        </article>
      `;
    })
    .join('');

  return `<section class="classify-board">${cards}</section>`;
}

export function RestrictionBuilder({ items, selectedIds = [], classifications = {}, impacts = {}, draft = '', error }) {
  const picks = items
    .map((item) => {
      const checked = selectedIds.includes(item.id);
      const type = restrictionTypes.find((entry) => entry.id === classifications[item.id]);
      return `
        <article class="restriction-row">
          <label>
            <input type="checkbox" data-action="toggle-restriction" data-item-id="${escapeHtml(item.id)}" ${checked ? 'checked' : ''} />
            <strong>${escapeHtml(item.label)}</strong>
          </label>
          <p>Tipo: ${escapeHtml(type?.label ?? 'Sin clasificar')}</p>
          ${
            checked
              ? `<label>¿Qué decisión podría afectar?
                   <input type="text" data-draft="constraints.impacts.${item.id}" value="${escapeHtml(impacts[item.id] || '')}" placeholder="Ej. estrategia tecnológica" />
                 </label>`
              : ''
          }
        </article>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>RestrictionBuilder</h3>
      <p>Selecciona las restricciones más relevantes. No tomes todavía la decisión de solución.</p>
      ${picks}
      <label for="rest-draft">Texto para la sección de restricciones</label>
      <textarea id="rest-draft" rows="5" data-draft="constraints.draft">${escapeHtml(draft)}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-constraints-doc">Agregar al documento</button>
    </section>
  `;
}

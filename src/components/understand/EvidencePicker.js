import { escapeHtml } from '../../utils/escape.js';

export function EvidencePicker({ items, selectedIds = [] }) {
  const list = items
    .map((item) => {
      const checked = selectedIds.includes(item.id);
      const wrong = !item.relevant && checked;
      return `
        <li class="evidence-item${wrong ? ' is-wrong-moment' : ''}${checked && item.relevant ? ' is-selected' : ''}">
          <label>
            <input
              type="checkbox"
              data-action="toggle-evidence"
              data-evidence-id="${escapeHtml(item.id)}"
              ${checked ? 'checked' : ''}
            />
            <span>${escapeHtml(item.label)}</span>
          </label>
          ${
            wrong
              ? `<p class="evidence-feedback">${escapeHtml(item.feedback)}</p>
                 <p class="evidence-timing">Dato correcto, pero en el momento equivocado. Se usará en ${escapeHtml(item.laterStage)}.</p>`
              : ''
          }
        </li>
      `;
    })
    .join('');

  return `<ul class="evidence-picker">${list}</ul>`;
}

export function ContextBuilder({ slots, fields, selectedEvidence, template, example, draft, error }) {
  const slotBlocks = slots
    .map((slot) => {
      const options = selectedEvidence
        .filter((item) => item.slot === slot.id)
        .map(
          (item) =>
            `<option value="${escapeHtml(item.label)}" ${fields[slot.id] === item.label ? 'selected' : ''}>${escapeHtml(item.label)}</option>`,
        )
        .join('');
      return `
        <div class="builder-field">
          <label for="context-slot-${slot.id}">${escapeHtml(slot.label)}</label>
          <select id="context-slot-${slot.id}" data-action="context-slot" data-slot="${slot.id}">
            <option value="">Selecciona una evidencia o escribe abajo</option>
            ${options}
          </select>
          <input
            type="text"
            data-draft="context.fields.${slot.id}"
            value="${escapeHtml(fields[slot.id] || '')}"
            aria-label="${escapeHtml(slot.label)}"
          />
        </div>
      `;
    })
    .join('');

  return `
    <section class="builder-card" aria-labelledby="context-builder-title">
      <h3 id="context-builder-title">Quién es la organización</h3>
      <div class="builder-grid">${slotBlocks}</div>
      <p class="builder-lead">Ahora conviértelo en un párrafo.</p>
      <p class="template-label">Plantilla orientadora (no se completa sola):</p>
      <pre class="template-block">${escapeHtml(template)}</pre>
      <div class="builder-actions">
        <button class="btn btn--small btn--ghost-dark" type="button" data-action="insert-context-template">Insertar plantilla vacía</button>
      </div>
      <label for="context-draft">Tu párrafo</label>
      <textarea id="context-draft" rows="6" data-draft="context.draft">${escapeHtml(draft || '')}</textarea>
      <div class="preview-block">
        <h4>Vista previa del documento</h4>
        <p class="preview-example"><strong>Ejemplo posible:</strong> ${escapeHtml(example)}</p>
        <div class="preview-text">${escapeHtml(draft || 'El texto aparecerá aquí cuando lo escribas.')}</div>
      </div>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-context-doc">Agregar al documento</button>
    </section>
  `;
}

export function ClassifyBoard({ items, categories, answers = {}, action, groupLabel }) {
  const cards = items
    .map((item) => {
      const current = answers[item.id];
      const revealed = Boolean(current);
      const correct = current === item.correct;
      const buttons = categories
        .map((category) => {
          const selected = current === category.id;
          let extra = '';
          if (revealed && selected && correct) extra = ' is-correct';
          if (revealed && selected && !correct) extra = ' is-wrong';
          if (revealed && !selected && category.id === item.correct) extra = ' is-solution';
          return `
            <button
              class="chip${extra}"
              type="button"
              data-action="${action}"
              data-item-id="${escapeHtml(item.id)}"
              data-value="${escapeHtml(category.id)}"
            >${escapeHtml(category.label)}</button>
          `;
        })
        .join('');
      return `
        <article class="classify-card">
          <h4>${escapeHtml(item.label)}</h4>
          ${item.note ? `<p class="classify-note">${escapeHtml(item.note)}</p>` : ''}
          <div class="chip-row">${buttons}</div>
        </article>
      `;
    })
    .join('');

  return `
    <section class="classify-board" aria-label="${escapeHtml(groupLabel)}">
      ${cards}
    </section>
  `;
}

export function OperationalContextBuilder({ draft, example, error }) {
  return `
    <section class="builder-card">
      <h3>Usuarios y operación</h3>
      <p>Redacta con tus clasificaciones. El ejemplo es una guía, no un texto impuesto.</p>
      <p class="preview-example"><strong>Ejemplo posible:</strong> ${escapeHtml(example)}</p>
      <label for="ops-draft">Tu párrafo</label>
      <textarea id="ops-draft" rows="5" data-draft="usersAndOperations.draft">${escapeHtml(draft || '')}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-operations-doc">Agregar al documento</button>
    </section>
  `;
}

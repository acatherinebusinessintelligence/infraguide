import { escapeHtml } from '../../utils/escape.js';
import { unrelatedComponentFeedback } from '../../data/methodology/represent.js';
import { getNodeById, relationFor } from '../../state/representModel.js';
import { getServiceById } from '../../state/understandModel.js';

export function ComponentPicker({ service, items, selectedIds = [] }) {
  if (!service) {
    return '<p>Selecciona un servicio crítico para asociar componentes.</p>';
  }

  const list = items
    .map((item) => {
      const checked = selectedIds.includes(item.id);
      const relation = relationFor(service.id, item.id);
      const unrelated = checked && (relation === 'unrelated' || item.trap);
      return `
        <li class="evidence-item${checked && !unrelated ? ' is-selected' : ''}${unrelated ? ' is-wrong-moment' : ''}">
          <label>
            <input
              type="checkbox"
              data-action="toggle-service-component"
              data-service-id="${escapeHtml(service.id)}"
              data-component-id="${escapeHtml(item.id)}"
              ${checked ? 'checked' : ''}
            />
            <span><strong>${escapeHtml(item.name)}</strong> — ${escapeHtml(item.type)}</span>
          </label>
          <p class="classify-note">${escapeHtml(item.characteristics)}</p>
          <p class="classify-note">Fuente: ${escapeHtml(item.sourceLabel)}</p>
          ${
            unrelated
              ? `<p class="evidence-feedback">${escapeHtml(item.feedback || unrelatedComponentFeedback)}</p>`
              : ''
          }
        </li>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>ComponentPicker — ${escapeHtml(service.name)}</h3>
      <p>¿Qué componentes participan en la prestación de este servicio? No todas las opciones son obligatorias. El objetivo es razonar dependencias.</p>
      <ul class="evidence-picker">${list}</ul>
    </section>
  `;
}

export function RelevantInventoryBuilder({
  nodes,
  selectedIds = [],
  relevance = {},
  serviceLinks = {},
  services = [],
  draft = '',
  error = '',
}) {
  const rows = nodes
    .filter((node) => !node.trap)
    .map((node) => {
      const checked = selectedIds.includes(node.id);
      const linked = serviceLinks[node.id] ?? [];
      const relatedNames = (node.relatedServiceIds ?? [])
        .map((id) => getServiceById(id)?.name ?? id)
        .join(' / ');
      return `
        <tr>
          <td>
            <label class="compare-pick">
              <input type="checkbox" data-action="toggle-inventory" data-component-id="${escapeHtml(node.id)}" ${checked ? 'checked' : ''} />
              ${escapeHtml(node.name)}
            </label>
          </td>
          <td>${escapeHtml(node.type)}</td>
          <td>${escapeHtml(node.characteristics)}</td>
          <td>
            ${escapeHtml(relatedNames || 'Sin asociación previa')}
            <div class="chip-row">
              ${services
                .map(
                  (service) => `
                    <label class="compare-pick">
                      <input
                        type="checkbox"
                        data-action="inventory-service"
                        data-component-id="${escapeHtml(node.id)}"
                        data-service-id="${escapeHtml(service.id)}"
                        ${linked.includes(service.id) ? 'checked' : ''}
                      />
                      ${escapeHtml(service.name)}
                    </label>
                  `,
                )
                .join('')}
            </div>
          </td>
          <td>${escapeHtml(node.sourceLabel)}</td>
          <td>
            ${
              checked
                ? `
                  <fieldset class="relevance-set">
                    <legend>¿Ayuda a entender el servicio o un riesgo?</legend>
                    <label><input type="radio" name="rel-${escapeHtml(node.id)}" data-action="inventory-relevance" data-component-id="${escapeHtml(node.id)}" value="yes" ${relevance[node.id] === 'yes' ? 'checked' : ''} /> Sí: incluir</label>
                    <label><input type="radio" name="rel-${escapeHtml(node.id)}" data-action="inventory-relevance" data-component-id="${escapeHtml(node.id)}" value="no" ${relevance[node.id] === 'no' ? 'checked' : ''} /> No: puede quedar fuera</label>
                  </fieldset>
                `
                : '—'
            }
          </td>
        </tr>
      `;
    })
    .join('');

  const included = selectedIds.filter((id) => relevance[id] === 'yes').map(getNodeById).filter(Boolean);

  return `
    <section class="builder-card">
      <h3>RelevantInventoryBuilder</h3>
      <p>Un inventario relevante no es una lista indiscriminada de todos los activos. Incluye solo lo que ayuda a entender un servicio o un riesgo.</p>
      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Componente</th>
              <th>Tipo</th>
              <th>Características</th>
              <th>Servicio relacionado</th>
              <th>Fuente</th>
              <th>¿Incluir?</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      <p><strong>Incluidos en el análisis:</strong> ${included.length ? included.map((item) => item.name).join(', ') : 'ninguno todavía'}</p>
      <label for="inventory-draft">Texto de apoyo al inventario</label>
      <textarea id="inventory-draft" rows="4" data-scope="represent" data-draft="inventory.draft">${escapeHtml(draft)}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-inventory-doc">Agregar inventario al documento</button>
    </section>
  `;
}

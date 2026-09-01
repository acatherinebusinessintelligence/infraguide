import { escapeHtml } from '../../utils/escape.js';
import { impactLevels, alternativeOptions } from '../../data/methodology/understand.js';

export function ServiceSelector({ services, selectedIds = [], reviewedIds = [], activeId }) {
  const cards = services
    .map((service) => {
      const selected = selectedIds.includes(service.id);
      const reviewed = reviewedIds.includes(service.id);
      const active = activeId === service.id;
      return `
        <article class="service-card${selected ? ' is-selected' : ''}${active ? ' is-active' : ''}">
          <header>
            <h4>${escapeHtml(service.name)}</h4>
            <p class="service-card__crit">Criticidad declarada: ${escapeHtml(service.declaredCriticality)}</p>
          </header>
          <p>${escapeHtml(service.description)}</p>
          <dl class="service-meta">
            <div><dt>Qué hace</dt><dd>${escapeHtml(service.description)}</dd></div>
            <div><dt>Quién lo usa</dt><dd>${escapeHtml(service.users)}</dd></div>
            <div><dt>Horario</dt><dd>${escapeHtml(service.operation)}</dd></div>
            <div><dt>Fuente</dt><dd>${escapeHtml(service.sourceLabel)}</dd></div>
          </dl>
          <p class="service-warning">La criticidad del caso es un dato inicial, pero debes comprender por qué. No basta con copiar la tabla.</p>
          <div class="builder-actions">
            <button class="btn btn--small btn--ghost-dark" type="button" data-action="review-service" data-service-id="${escapeHtml(service.id)}">
              ${selected ? 'Quitar de importantes' : 'Marcar como importante'}
            </button>
            <button class="btn btn--small btn--primary" type="button" data-action="open-criticality" data-service-id="${escapeHtml(service.id)}">
              Justificar criticidad
            </button>
          </div>
          ${reviewed ? '<p class="reviewed-flag">Revisado</p>' : ''}
        </article>
      `;
    })
    .join('');

  return `<div class="service-grid">${cards}</div>`;
}

export function CriticalityBuilder({ service, record = {}, error }) {
  if (!service) {
    return '<p>Selecciona un servicio para justificar su criticidad.</p>';
  }

  const alts = alternativeOptions
    .map(
      (item) =>
        `<option value="${item.id}" ${record.alternative === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`,
    )
    .join('');
  const impacts = impactLevels
    .map(
      (item) =>
        `<option value="${item.id}" ${record.impact === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`,
    )
    .join('');

  return `
    <section class="builder-card" aria-labelledby="crit-builder-title">
      <h3 id="crit-builder-title">CriticalityBuilder — ${escapeHtml(service.name)}</h3>
      <p>No uses solo la etiqueta del caso. Justifica con función, dependencia e impacto.</p>
      <div class="builder-grid">
        <div class="builder-field">
          <label for="crit-users">¿Quién lo utiliza?</label>
          <input id="crit-users" type="text" data-draft="criticality.records.${service.id}.users" value="${escapeHtml(record.users || service.users)}" />
        </div>
        <div class="builder-field">
          <label for="crit-fail">¿Qué ocurre si falla?</label>
          <input id="crit-fail" type="text" data-draft="criticality.records.${service.id}.failure" value="${escapeHtml(record.failure || service.failureImpact)}" />
        </div>
        <div class="builder-field">
          <label for="crit-alt">¿Existe alternativa?</label>
          <select id="crit-alt" data-action="crit-field" data-service-id="${escapeHtml(service.id)}" data-field="alternative">
            <option value="">Selecciona</option>
            ${alts}
          </select>
        </div>
        <div class="builder-field">
          <label for="crit-when">¿Cuándo se necesita?</label>
          <input id="crit-when" type="text" data-draft="criticality.records.${service.id}.when" value="${escapeHtml(record.when || service.operation)}" />
        </div>
        <div class="builder-field">
          <label for="crit-impact">Impacto</label>
          <select id="crit-impact" data-action="crit-field" data-service-id="${escapeHtml(service.id)}" data-field="impact">
            <option value="">Selecciona</option>
            ${impacts}
          </select>
        </div>
      </div>
      <label for="crit-just">Justificación</label>
      <textarea id="crit-just" rows="4" data-draft="criticality.records.${service.id}.justification">${escapeHtml(record.justification || '')}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="save-criticality" data-service-id="${escapeHtml(service.id)}">Guardar justificación</button>
    </section>
  `;
}

export function CriticalServiceCompare({ services, records = {}, compareIds = [] }) {
  const chosen = compareIds.map((id) => services.find((item) => item.id === id)).filter(Boolean);
  const selectors = services
    .map((service) => {
      const checked = compareIds.includes(service.id);
      const disabled = !checked && compareIds.length >= 3;
      return `
        <label class="compare-pick">
          <input type="checkbox" data-action="toggle-compare" data-service-id="${escapeHtml(service.id)}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''} />
          ${escapeHtml(service.name)}
        </label>
      `;
    })
    .join('');

  const rows = chosen
    .map((service) => {
      const record = records[service.id] ?? {};
      const impact = impactLevels.find((item) => item.id === record.impact)?.label ?? 'Sin asignar';
      return `
        <tr>
          <th>${escapeHtml(service.name)}</th>
          <td>${escapeHtml(record.users || service.users)}</td>
          <td>${escapeHtml(record.when || service.operation)}</td>
          <td>${escapeHtml(record.failure || service.failureImpact)}</td>
          <td>${escapeHtml(service.alternativeHint)}</td>
          <td>${escapeHtml(impact)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>Comparador de servicios</h3>
      <p>Selecciona hasta tres. El sistema no declara un ganador: tú argumentas.</p>
      <div class="chip-row">${selectors}</div>
      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Usuarios</th>
              <th>Horario</th>
              <th>Impacto si falla</th>
              <th>Dependencia / alternativa</th>
              <th>Criticidad propuesta</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="6">Selecciona servicios para comparar.</td></tr>'}
          </tbody>
        </table>
      </div>
    </section>
  `;
}

export function CriticalServicesTableBuilder({ services, records = {}, tableIds = [], error }) {
  const justified = services.filter((service) => records[service.id]?.justification?.trim() && records[service.id]?.impact);
  const picks = justified
    .map((service) => {
      const checked = tableIds.includes(service.id);
      return `
        <label class="compare-pick">
          <input type="checkbox" data-action="toggle-table-service" data-service-id="${escapeHtml(service.id)}" ${checked ? 'checked' : ''} />
          ${escapeHtml(service.name)}
        </label>
      `;
    })
    .join('');

  const rows = tableIds
    .map((id) => {
      const service = services.find((item) => item.id === id);
      const record = records[id];
      if (!service || !record) return '';
      const impact = impactLevels.find((item) => item.id === record.impact)?.label ?? record.impact;
      return `
        <tr>
          <td>${escapeHtml(service.name)}</td>
          <td>${escapeHtml(record.users || service.users)}</td>
          <td>${escapeHtml(record.when || service.operation)}</td>
          <td>${escapeHtml(record.failure || service.failureImpact)}</td>
          <td>${escapeHtml(impact)}</td>
        </tr>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>Tabla de servicios críticos</h3>
      <p>Incluye al menos tres servicios con criticidad justificada. Puedes agregar más.</p>
      <div class="chip-row">${picks || '<p>Primero justifica al menos tres servicios.</p>'}</div>
      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Usuarios</th>
              <th>Operación</th>
              <th>Impacto si falla</th>
              <th>Criticidad</th>
            </tr>
          </thead>
          <tbody>${rows || '<tr><td colspan="5">Sin filas todavía.</td></tr>'}</tbody>
        </table>
      </div>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-critical-doc">Agregar al documento</button>
    </section>
  `;
}

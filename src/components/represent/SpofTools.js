import { escapeHtml } from '../../utils/escape.js';
import {
  spofStatuses,
  ternaryOptions,
  caseIncidents,
  nasSpofHint,
  appSrvHint,
} from '../../data/methodology/represent.js';

function ternarySelect(componentId, field, value) {
  const options = ternaryOptions
    .map((item) => `<option value="${item.id}" ${value === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
    .join('');
  return `
    <select data-action="spof-field" data-component-id="${escapeHtml(componentId)}" data-field="${escapeHtml(field)}">
      <option value="">Selecciona</option>
      ${options}
    </select>
  `;
}

export function IncidentEvidenceLink({ incidents = caseIncidents, links = {}, components = [] }) {
  const cards = incidents
    .map((incident) => {
      const selected = links[incident.id] ?? [];
      const chips = components
        .map(
          (node) => `
            <label class="compare-pick">
              <input
                type="checkbox"
                data-action="link-incident"
                data-incident-id="${escapeHtml(incident.id)}"
                data-component-id="${escapeHtml(node.id)}"
                ${selected.includes(node.id) ? 'checked' : ''}
              />
              ${escapeHtml(node.name)}
            </label>
          `,
        )
        .join('');
      return `
        <article class="classify-card">
          <h4>Incidente ${escapeHtml(incident.letter)} — ${escapeHtml(incident.title)}</h4>
          <p>Duración: ${escapeHtml(incident.duration)}</p>
          <p>Impacto: ${escapeHtml(incident.impact)}</p>
          <p>Asocia el incidente a uno o más componentes del AS-IS:</p>
          <div class="chip-row">${chips}</div>
        </article>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>IncidentEvidenceLink</h3>
      <p>Conectar un incidente con un componente fortalece la trazabilidad. Ejemplo: incidente B → Firewall.</p>
      ${cards}
    </section>
  `;
}

export function ArchitecturalEvidence({ node, incidents = [], record = {} }) {
  if (!node) {
    return '';
  }
  const incidentText = incidents.length
    ? incidents.map((item) => `${item.title} (${item.duration}). ${item.impact}`).join(' ')
    : 'Sin incidente asociado todavía.';
  const status = spofStatuses.find((item) => item.id === record.status)?.label ?? 'Sin clasificar';
  return `
    <section class="panel pedagogy" aria-label="Evidencia arquitectónica">
      <h3>Evidencia arquitectónica</h3>
      <p><strong>Arquitectura:</strong> ${escapeHtml(node.architectureFact || node.characteristics)}</p>
      <p><strong>Incidente:</strong> ${escapeHtml(incidentText)}</p>
      <p><strong>Impacto:</strong> ${escapeHtml(record.failureImpact || incidents[0]?.impact || 'Pendiente de interpretar')}</p>
      <p><strong>Conclusión:</strong> ${escapeHtml(status)}</p>
    </section>
  `;
}

export function SpofAnalyzer({ node, record = {}, services = [], error = '' }) {
  if (!node) {
    return '<p>Selecciona un componente del AS-IS para analizarlo.</p>';
  }

  const statuses = spofStatuses
    .map((item) => `<option value="${item.id}" ${record.status === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
    .join('');
  const serviceOptions = services
    .map((item) => `<option value="${item.id}" ${record.affectedService === item.id ? 'selected' : ''}>${escapeHtml(item.name)}</option>`)
    .join('');

  return `
    <section class="builder-card">
      <h3>SpofAnalyzer — ${escapeHtml(node.name)}</h3>
      <p>SPOF = Single Point of Failure. Componente cuya falla puede interrumpir un servicio porque no existe una alternativa funcional.</p>
      <p><strong>Único ≠ SPOF automáticamente.</strong> Analiza dependencia, redundancia, failover, impacto y alternativa.</p>
      ${node.id === 'nas' ? `<p class="consultant-tip">${escapeHtml(nasSpofHint)}</p>` : ''}
      ${node.id === 'app-srv01' ? `<p class="consultant-tip">${escapeHtml(appSrvHint)}</p>` : ''}
      ${record.reviewRequired ? '<p class="form-error">REVISIÓN REQUERIDA. El AS-IS cambió después de este análisis.</p>' : ''}
      <div class="builder-grid">
        <div class="builder-field">
          <label>1. ¿El servicio depende de este componente?</label>
          ${ternarySelect(node.id, 'depends', record.depends)}
        </div>
        <div class="builder-field">
          <label>2. ¿Existe otro que pueda asumir su función?</label>
          ${ternarySelect(node.id, 'alternative', record.alternative)}
        </div>
        <div class="builder-field">
          <label>3. ¿Existe redundancia?</label>
          ${ternarySelect(node.id, 'redundancy', record.redundancy)}
        </div>
        <div class="builder-field">
          <label>4. ¿Existe failover?</label>
          ${ternarySelect(node.id, 'failover', record.failover)}
        </div>
        <div class="builder-field">
          <label for="spof-impact-${escapeHtml(node.id)}">5. ¿Qué pasa si falla?</label>
          <input id="spof-impact-${escapeHtml(node.id)}" type="text" data-scope="represent" data-draft="spof.records.${node.id}.failureImpact" value="${escapeHtml(record.failureImpact || '')}" />
        </div>
        <div class="builder-field">
          <label>6. ¿Qué servicio se afecta?</label>
          <select data-action="spof-field" data-component-id="${escapeHtml(node.id)}" data-field="affectedService">
            <option value="">Selecciona</option>
            ${serviceOptions}
          </select>
        </div>
        <div class="builder-field">
          <label>Estado SPOF</label>
          <select data-action="spof-field" data-component-id="${escapeHtml(node.id)}" data-field="status">
            <option value="">Selecciona — no es un sí/no forzado</option>
            ${statuses}
          </select>
        </div>
      </div>
      <label for="spof-just-${escapeHtml(node.id)}">Justificación</label>
      <textarea id="spof-just-${escapeHtml(node.id)}" rows="4" data-scope="represent" data-draft="spof.records.${node.id}.justification">${escapeHtml(record.justification || '')}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="save-spof" data-component-id="${escapeHtml(node.id)}">Guardar análisis SPOF</button>
    </section>
  `;
}

export function SpofMatrix({ nodes = [], records = {}, error = '' }) {
  const statusLabel = (id) => spofStatuses.find((item) => item.id === id)?.label ?? 'Sin clasificar';
  const ternaryLabel = (id) => ternaryOptions.find((item) => item.id === id)?.label ?? '—';

  const tableRows = nodes
    .map((node) => {
      const record = records[node.id] ?? {};
      return `
        <tr class="${record.reviewRequired ? 'needs-review' : ''}">
          <td>
            <button class="btn btn--small btn--ghost-dark" type="button" data-action="open-spof" data-component-id="${escapeHtml(node.id)}">${escapeHtml(node.name)}</button>
            ${record.reviewRequired ? '<span class="review-flag">Revisión requerida</span>' : ''}
          </td>
          <td>${escapeHtml(ternaryLabel(record.depends))}</td>
          <td>${escapeHtml(ternaryLabel(record.redundancy))}</td>
          <td>${escapeHtml(record.failureImpact || '—')}</td>
          <td>${escapeHtml(statusLabel(record.status))}</td>
          <td>${escapeHtml(record.justification || '—')}</td>
        </tr>
      `;
    })
    .join('');

  const cards = nodes
    .map((node) => {
      const record = records[node.id] ?? {};
      return `
        <article class="spof-card${record.reviewRequired ? ' needs-review' : ''}">
          <h4>${escapeHtml(node.name)}</h4>
          ${record.reviewRequired ? '<p class="review-flag">Revisión requerida</p>' : ''}
          <p><strong>Dependencia:</strong> ${escapeHtml(ternaryLabel(record.depends))}</p>
          <p><strong>Redundancia:</strong> ${escapeHtml(ternaryLabel(record.redundancy))}</p>
          <p><strong>Impacto si falla:</strong> ${escapeHtml(record.failureImpact || '—')}</p>
          <p><strong>Estado SPOF:</strong> ${escapeHtml(statusLabel(record.status))}</p>
          <p><strong>Justificación:</strong> ${escapeHtml(record.justification || '—')}</p>
          <button class="btn btn--small btn--primary" type="button" data-action="open-spof" data-component-id="${escapeHtml(node.id)}">Analizar</button>
        </article>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>Matriz SPOF</h3>
      <div class="table-wrap spof-table-wrap">
        <table class="compare-table spof-table">
          <thead>
            <tr>
              <th>Componente</th>
              <th>Dependencia</th>
              <th>Redundancia</th>
              <th>Impacto si falla</th>
              <th>Estado SPOF</th>
              <th>Justificación</th>
            </tr>
          </thead>
          <tbody>${tableRows || '<tr><td colspan="6">Todavía no hay componentes del AS-IS.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="spof-card-grid">${cards}</div>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-spof-doc">Agregar matriz SPOF al documento</button>
    </section>
  `;
}

export function firewallPedagogy() {
  return `
    <section class="panel pedagogy">
      <h3>Ejemplo firewall</h3>
      <p><strong>Dato:</strong> existe 1 firewall principal.</p>
      <p><strong>Incidente:</strong> falla del firewall durante 4 h.</p>
      <p><strong>Impacto:</strong> tiendas pierden conectividad.</p>
      <p><strong>Evidencia:</strong> instancia única + incidente real + impacto transversal.</p>
      <p><strong>Conclusión posible:</strong> SPOF justificado. Tú debes argumentarla; el sistema no la marca solo.</p>
    </section>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import { nodeCategories, asIsTemplate, externalDependencyNote } from '../../data/methodology/represent.js';
import { getDiagramNode, getNodeById } from '../../state/representModel.js';
import { getServiceById } from '../../state/understandModel.js';

export function DependencyBuilder({ nodes, chain = [], service, error = '' }) {
  const grouped = nodeCategories
    .map((category) => {
      const items = nodes.filter((node) => node.category === category.id && node.inDiagram);
      if (!items.length) {
        return '';
      }
      return `
        <div class="node-group">
          <h4>${escapeHtml(category.label)}</h4>
          <div class="chip-row">
            ${items
              .map((node) => {
                const used = chain.includes(node.id);
                return `
                  <button
                    class="chip${used ? ' is-correct' : ''}"
                    type="button"
                    data-action="add-asis-node"
                    data-service-id="${escapeHtml(service?.id ?? '')}"
                    data-component-id="${escapeHtml(node.id)}"
                    ${used ? 'disabled' : ''}
                  >${escapeHtml(node.name)}</button>
                `;
              })
              .join('')}
          </div>
        </div>
      `;
    })
    .join('');

  const steps = chain
    .map((id, index) => {
      const node = getDiagramNode(id);
      if (!node) {
        return '';
      }
      const options = chain
        .map(
          (_, position) =>
            `<option value="${position}" ${position === index ? 'selected' : ''}>Posición ${position + 1}</option>`,
        )
        .join('');
      return `
        <li class="chain-step">
          <div>
            <strong>${index + 1}. ${escapeHtml(node.name)}</strong>
            <p class="classify-note">${escapeHtml(node.type)} · Fuente: ${escapeHtml(node.sourceLabel)}</p>
          </div>
          <div class="chain-controls">
            <button class="btn btn--small btn--ghost-dark" type="button" data-action="move-asis-node" data-service-id="${escapeHtml(service?.id ?? '')}" data-index="${index}" data-direction="-1" ${index === 0 ? 'disabled' : ''}>Mover arriba</button>
            <button class="btn btn--small btn--ghost-dark" type="button" data-action="move-asis-node" data-service-id="${escapeHtml(service?.id ?? '')}" data-index="${index}" data-direction="1" ${index === chain.length - 1 ? 'disabled' : ''}>Mover abajo</button>
            <label>
              <span class="sr-only">Seleccionar posición de ${escapeHtml(node.name)}</span>
              <select data-action="position-asis-node" data-service-id="${escapeHtml(service?.id ?? '')}" data-index="${index}">
                ${options}
              </select>
            </label>
            <button class="btn btn--small" type="button" data-action="remove-asis-node" data-service-id="${escapeHtml(service?.id ?? '')}" data-index="${index}">Quitar</button>
          </div>
        </li>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>DependencyBuilder${service ? ` — ${escapeHtml(service.name)}` : ''}</h3>
      <p>¿Cómo llega un usuario al servicio? Construye la cadena con nodos del caso. No puedes crear componentes arbitrarios.</p>
      <ol class="layer-guide" aria-label="Guía de capas">
        <li>Usuario</li>
        <li>Conectividad</li>
        <li>Seguridad</li>
        <li>Aplicación</li>
        <li>Datos</li>
        <li>Almacenamiento</li>
        <li>Backup</li>
      </ol>
      <p class="classify-note">No todos los servicios tendrán exactamente esta cadena.</p>
      ${grouped}
      <p class="consultant-tip">${escapeHtml(externalDependencyNote)}</p>
      <ol class="chain-list">${steps || '<li>Todavía no hay nodos en la cadena.</li>'}</ol>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
    </section>
  `;
}

export function AsIsDiagram({ chain = [], service }) {
  if (!chain.length) {
    return '<p>El diagrama aparecerá cuando armes la cadena.</p>';
  }

  const items = chain
    .map((id, index) => {
      const node = getDiagramNode(id) ?? getNodeById(id);
      if (!node) {
        return '';
      }
      const related = (node.relatedServiceIds ?? [])
        .map((serviceId) => getServiceById(serviceId)?.name ?? serviceId)
        .join(', ');
      const arrow =
        index < chain.length - 1
          ? '<li class="asis-arrow" aria-hidden="true"><span class="asis-arrow__desktop">→</span><span class="asis-arrow__mobile">↓</span></li>'
          : '';
      return `
        <li class="asis-node">
          <p class="asis-node__type">${escapeHtml(node.type)}</p>
          <h4>${escapeHtml(node.name)}</h4>
          <p>${escapeHtml(service?.name || related || 'Servicio relacionado')}</p>
        </li>
        ${arrow}
      `;
    })
    .join('');

  return `
    <section class="asis-diagram" aria-label="Arquitectura AS-IS">
      <h3>AsIsDiagram</h3>
      <ol class="asis-flow">${items}</ol>
    </section>
  `;
}

export function AsIsWriter({ draft = '', error = '' }) {
  return `
    <section class="builder-card">
      <h3>Describe la arquitectura en 3-5 frases</h3>
      <p class="template-label">Plantilla orientadora (no se completa sola):</p>
      <pre class="template-block">${escapeHtml(asIsTemplate)}</pre>
      <button class="btn btn--small btn--ghost-dark" type="button" data-action="insert-asis-template">Insertar plantilla vacía</button>
      <label for="asis-draft">Tu descripción AS-IS</label>
      <textarea id="asis-draft" rows="5" data-scope="represent" data-draft="asIs.description">${escapeHtml(draft)}</textarea>
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-asis-doc">Agregar AS-IS al documento</button>
    </section>
  `;
}

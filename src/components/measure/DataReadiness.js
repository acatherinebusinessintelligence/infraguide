import { escapeHtml } from '../../utils/escape.js';
import { METRIC_STATUS, METRIC_STATUS_LABEL, metricDefinitions } from '../../data/methodology/measure.js';
import { metricReadiness, effectiveMetricStatus, getFact } from '../../state/measureModel.js';

export function CaseFactsBoard({ facts, usedKeys = [] }) {
  const items = facts
    .map((fact) => {
      const used = usedKeys.includes(fact.key);
      return `
        <li class="fact-chip${used ? ' is-used' : ' is-excluded'}">
          <span>
            <strong>${escapeHtml(fact.label)}</strong>
            <span>${escapeHtml(fact.displayValue)}</span>
            <span class="classify-note">Fuente: ${escapeHtml(fact.sourceLabel)}</span>
          </span>
          <label>
            <input type="checkbox" data-action="toggle-measure-key" data-data-key="${escapeHtml(fact.key)}" ${used ? 'checked' : ''} />
            En uso
          </label>
        </li>
      `;
    })
    .join('');

  return `
    <section class="builder-card">
      <h3>Datos disponibles del caso</h3>
      <p>Valores del JSON. No se editan. Si retiras un dato ya usado en un cálculo, la métrica pasa a revisión requerida.</p>
      <ul class="fact-board">${items}</ul>
    </section>
  `;
}

export function DataReadiness({ facts, usedKeys, measure }) {
  const cards = metricDefinitions
    .map((definition) => {
      const readiness = metricReadiness(definition, facts, usedKeys);
      const status = effectiveMetricStatus(measure[definition.id], readiness);
      const needs = readiness.items
        .map((item) => {
          const fact = item.fact ?? getFact(facts, item.key);
          return `<li>${item.ok ? '✓' : '○'} ${escapeHtml(fact?.label ?? item.key)}${fact ? `: ${escapeHtml(fact.displayValue)}` : ''}</li>`;
        })
        .join('');
      return `
        <article class="readiness-card">
          <h4>${escapeHtml(definition.label)}</h4>
          <p class="readiness-status status-${escapeHtml(status)}">${escapeHtml(METRIC_STATUS_LABEL[status] || readiness.label)}</p>
          <p>Necesita:</p>
          <ul>${needs}</ul>
          ${definition.limited ? '<p class="classify-note">Estimable con limitaciones.</p>' : ''}
          ${measure[definition.id]?.reviewRequired ? '<p class="form-error">REVISIÓN REQUERIDA</p>' : ''}
        </article>
      `;
    })
    .join('');

  return `
    <section class="builder-card" aria-labelledby="readiness-title">
      <h3 id="readiness-title">DataReadiness</h3>
      <div class="readiness-grid">${cards}</div>
    </section>
  `;
}

export function MetricNarrativeBuilder({ metricId, draft = '', template, error = '', action }) {
  return `
    <section class="builder-card">
      <h3>MetricNarrativeBuilder</h3>
      <p class="template-label">Plantilla orientadora (no se completa sola):</p>
      <pre class="template-block">${escapeHtml(template)}</pre>
      <button class="btn btn--small btn--ghost-dark" type="button" data-action="insert-measure-template" data-metric-id="${escapeHtml(metricId)}">Insertar plantilla vacía</button>
      <label for="narrative-${escapeHtml(metricId)}">Tu texto</label>
      <textarea id="narrative-${escapeHtml(metricId)}" rows="5" data-scope="measure" data-draft="${escapeHtml(metricId)}.draft">${escapeHtml(draft)}</textarea>
      ${error ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="${escapeHtml(action)}">Agregar al documento</button>
    </section>
  `;
}

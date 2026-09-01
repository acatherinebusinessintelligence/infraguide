import { escapeHtml } from '../../utils/escape.js';
import {
  alternativeTypes,
  compareCriteria,
  qualitativeRatings,
  costModels,
  successMetrics,
  benefitOptions,
  introducedRiskOptions,
  priorityLevels,
  impactEffortCells,
  pedagogicalExamples,
} from '../../data/methodology/decide.js';
import { alternativeTypeLabel, metricLabel, costLabel } from '../../state/decideModel.js';
import { DecisionChain } from './DecisionFindingBank.js';

function live(warnings = []) {
  if (!warnings.length) return '';
  return `<div aria-live="polite">${warnings.map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`).join('')}</div>`;
}

export function AlternativeBuilder({ draft, error }) {
  const types = alternativeTypes
    .map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.label)}</option>`)
    .join('');
  const list = (draft.alternatives ?? [])
    .map(
      (item) => `
        <article class="alt-card${draft.selectedAlternativeId === item.id ? ' is-selected' : ''}">
          <p><strong>${escapeHtml(item.title)}</strong> · ${escapeHtml(alternativeTypeLabel(item.type))}</p>
          <p>${escapeHtml(item.description)}</p>
          <button class="btn btn--small" type="button" data-action="select-alternative" data-alt-id="${escapeHtml(item.id)}">Elegir esta</button>
          <button class="btn btn--small btn--ghost-dark" type="button" data-action="remove-alternative" data-alt-id="${escapeHtml(item.id)}">Quitar</button>
        </article>
      `,
    )
    .join('');
  return `
    <section class="finding-builder">
      <h3>AlternativeBuilder</h3>
      <p>No obligues siempre una alternativa tecnológica. Mínimo 2, salvo acción operativa concreta y sencilla.</p>
      <p>No existe ganador automático.</p>
      <div class="alt-form">
        <label>Tipo <select id="alt-type">${types}</select></label>
        <label>Título <input type="text" id="alt-title" /></label>
        <label>Descripción <input type="text" id="alt-desc" /></label>
        <button class="btn btn--primary" type="button" data-action="add-alternative">Agregar alternativa</button>
      </div>
      <label class="chip-option">
        <input type="checkbox" data-action="toggle-simple-op" ${draft.simpleOperational ? 'checked' : ''} />
        Acción operativa concreta y sencilla (excepción al mínimo de 2)
      </label>
      ${
        draft.simpleOperational
          ? `<label>Justificación de la excepción<textarea rows="2" data-draft="draft.simpleJustification" data-scope="decide">${escapeHtml(draft.simpleJustification)}</textarea></label>`
          : ''
      }
      <div class="alt-grid">${list || '<p>Aún no hay alternativas.</p>'}</div>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
    </section>
  `;
}

export function TechnologyOptionCompare({ draft }) {
  return `
    <section>
      <h3>On-premise / cloud / híbrido / edge</h3>
      <p>No hay prejuicio. Cloud no asume ahorro. Híbrido no es 50 % y 50 %. Edge no se sugiere solo por tener sedes.</p>
      ${OnPremCard({ data: draft.tech.onprem })}
      ${CloudCard({ data: draft.tech.cloud })}
      ${HybridCard({ data: draft.tech.hybrid })}
      ${EdgeCard({ data: draft.tech.edge })}
      ${RatingsTable({ tech: draft.tech })}
    </section>
  `;
}

function OnPremCard({ data }) {
  return `
    <article class="framework-intro">
      <h4>ON-PREMISE</h4>
      ${techField('onprem', 'helps', '¿En qué ayuda?', data.helps)}
      ${techField('onprem', 'notHelps', '¿En qué no ayuda?', data.notHelps)}
      ${techField('onprem', 'cost', '¿Qué costo introduce?', data.cost)}
      ${techField('onprem', 'dependency', '¿Qué dependencia mantiene?', data.dependency)}
      ${techField('onprem', 'skills', '¿Qué habilidades requiere?', data.skills)}
      ${techField('onprem', 'respects', '¿Qué restricciones respeta?', data.respects)}
    </article>
  `;
}

function CloudCard({ data }) {
  return `
    <article class="framework-intro">
      <h4>CLOUD</h4>
      ${techField('cloud', 'elasticity', 'Elasticidad', data.elasticity)}
      ${techField('cloud', 'provision', 'Aprovisionamiento', data.provision)}
      ${techField('cloud', 'variableCost', 'Costo variable (no asumas ahorro)', data.variableCost)}
      ${techField('cloud', 'connectivity', 'Dependencia de conectividad', data.connectivity)}
      ${techField('cloud', 'vendor', 'Dependencia de proveedor', data.vendor)}
      ${techField('cloud', 'security', 'Seguridad', data.security)}
      ${techField('cloud', 'operations', 'Operación', data.operations)}
      ${techField('cloud', 'skills', 'Habilidades', data.skills)}
    </article>
  `;
}

function HybridCard({ data }) {
  return `
    <article class="framework-intro">
      <h4>HÍBRIDO</h4>
      <p>No significa 50 % local y 50 % cloud.</p>
      ${techField('hybrid', 'local', '¿Qué componente permanece local?', data.local)}
      ${techField('hybrid', 'remote', '¿Qué componente podría escalar o alojarse fuera?', data.remote)}
      ${techField('hybrid', 'why', '¿Por qué?', data.why)}
    </article>
  `;
}

function EdgeCard({ data }) {
  return `
    <article class="framework-intro">
      <h4>EDGE</h4>
      ${techField('edge', 'localNeed', '¿Existe necesidad de operación local?', data.localNeed)}
      ${techField('edge', 'connectivity', '¿Existe dependencia de conectividad?', data.connectivity)}
      ${techField('edge', 'latency', '¿Se requiere baja latencia?', data.latency)}
      ${techField('edge', 'distributed', '¿Existe procesamiento distribuido?', data.distributed)}
    </article>
  `;
}

function techField(model, field, label, value) {
  return `
    <label>
      ${escapeHtml(label)}
      <textarea rows="2" data-action="tech-field" data-model="${model}" data-field="${field}" data-draft="draft.tech.${model}.${field}" data-scope="decide">${escapeHtml(value || '')}</textarea>
    </label>
  `;
}

function RatingsTable({ tech }) {
  const models = [
    { id: 'onprem', label: 'On-premise' },
    { id: 'cloud', label: 'Cloud' },
    { id: 'hybrid', label: 'Híbrido' },
    { id: 'edge', label: 'Edge' },
  ];
  const rows = compareCriteria
    .map((criterion) => {
      const cells = models
        .map((model) => {
          const current = tech[model.id]?.ratings?.[criterion.id] || '';
          return `
            <td>
              <label class="sr-only">${escapeHtml(model.label)} ${escapeHtml(criterion.label)}</label>
              <select data-action="tech-rating" data-model="${model.id}" data-criterion="${escapeHtml(criterion.id)}" aria-label="${escapeHtml(model.label)} — ${escapeHtml(criterion.label)}">
                <option value="">—</option>
                ${qualitativeRatings
                  .map((item) => `<option value="${escapeHtml(item.id)}" ${current === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
                  .join('')}
              </select>
            </td>
          `;
        })
        .join('');
      return `<tr><th>${escapeHtml(criterion.label)}</th>${cells}</tr>`;
    })
    .join('');
  const cards = models
    .map(
      (model) => `
        <article class="matrix-card">
          <h5>${escapeHtml(model.label)}</h5>
          ${compareCriteria
            .map((criterion) => {
              const current = tech[model.id]?.ratings?.[criterion.id] || '';
              return `<p>${escapeHtml(criterion.label)}: ${escapeHtml(qualitativeRatings.find((item) => item.id === current)?.label || '—')}</p>`;
            })
            .join('')}
        </article>
      `,
    )
    .join('');
  return `
    <h4>TechnologyOptionCompare (cualitativo, sin puntaje rígido)</h4>
    <div class="matrix-table-wrap">
      <table class="matrix-table">
        <thead><tr><th>Criterio</th>${models.map((item) => `<th>${escapeHtml(item.label)}</th>`).join('')}</tr></thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
    <div class="matrix-cards">${cards}</div>
  `;
}

export function DecisionBuilder({ decide, finding, warnings, error }) {
  const draft = decide.draft;
  const pipeline = [
    ['PROBLEMA', finding?.title || 'Sin hallazgo'],
    ['EVIDENCIA', (draft.evidenceIds ?? []).map((id) => id).join(', ') || '—'],
    ['IMPACTO', draft.impact || finding?.impact || '—'],
    ['ALTERNATIVAS', (draft.alternatives ?? []).map((item) => item.title).join(' / ') || '—'],
    ['DECISIÓN', draft.decision || '—'],
    ['JUSTIFICACIÓN', draft.justification || '—'],
    ['BENEFICIO', draft.benefitText || '—'],
    ['RIESGO INTRODUCIDO', draft.riskText || (draft.residualLow ? 'Residual bajo (justificar)' : '—')],
    ['CAPEX/OPEX', draft.costModel || '—'],
    ['MÉTRICA', draft.metricText || (draft.metricIds ?? []).join(', ') || '—'],
    ['PRIORIDAD', draft.priority || '—'],
  ]
    .map(([label, value]) => `<li><span>${escapeHtml(label)}</span> ${escapeHtml(value)}</li>`)
    .join('');
  return `
    <section class="finding-builder">
      <h3>DecisionBuilder</h3>
      <p>Una recomendación debe poder defenderse incluso si cambias el nombre de la tecnología.</p>
      ${!draft.findingIds.length ? '<p class="form-error" role="status">Esta recomendación no está asociada a un hallazgo del diagnóstico.</p>' : ''}
      <div class="finding-layout">
        <div class="finding-main">
          <ol class="decision-pipeline" aria-label="Cadena de decisión">${pipeline}</ol>
          <label>Decisión<textarea rows="3" data-draft="draft.decision" data-scope="decide">${escapeHtml(draft.decision)}</textarea></label>
          <label>¿Por qué esta alternativa es más pertinente que las otras?<textarea rows="3" data-draft="draft.justification" data-scope="decide">${escapeHtml(draft.justification)}</textarea></label>
          ${BenefitBuilder({ draft })}
          ${live(warnings)}
          ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
        </div>
        <aside class="finding-side">
          ${DecisionChain({ finding, decision: draft.decision, metric: draft.metricText, alternatives: draft.alternatives })}
        </aside>
      </div>
    </section>
  `;
}

export function BenefitBuilder({ draft }) {
  const chips = benefitOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-benefit" data-id="${escapeHtml(item.id)}" ${draft.benefits.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <fieldset>
      <legend>Beneficio</legend>
      <div class="chip-grid">${chips}</div>
      <label>Detalle<textarea rows="2" data-draft="draft.benefitText" data-scope="decide">${escapeHtml(draft.benefitText)}</textarea></label>
    </fieldset>
  `;
}

export function IntroducedRiskBuilder({ draft }) {
  const chips = introducedRiskOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-risk" data-id="${escapeHtml(item.id)}" ${draft.risks.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <section>
      <h3>Riesgo introducido</h3>
      <p>Cada decisión debe tener al menos una revisión de riesgo. No se asume que toda decisión es crítica.</p>
      <div class="chip-grid">${chips}</div>
      <label>Descripción<textarea rows="2" data-draft="draft.riskText" data-scope="decide">${escapeHtml(draft.riskText)}</textarea></label>
      <label class="chip-option">
        <input type="checkbox" data-action="toggle-residual" ${draft.residualLow ? 'checked' : ''} />
        Riesgo residual bajo / no significativo
      </label>
      ${
        draft.residualLow
          ? `<label>Justificación<textarea rows="2" data-draft="draft.residualJustification" data-scope="decide">${escapeHtml(draft.residualJustification)}</textarea></label>`
          : ''
      }
    </section>
  `;
}

export function CapexOpexAnalyzer({ draft }) {
  const radios = costModels
    .map(
      (item) => `
        <label class="chip-option">
          <input type="radio" name="cost-model" data-action="cost-model" value="${escapeHtml(item.id)}" ${draft.costModel === item.id ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <section>
      <h3>CAPEX / OPEX</h3>
      <p>CAPEX: servidor, almacenamiento, switch, firewall físico, sitio. OPEX: cloud, SaaS, soporte, servicio administrado, suscripciones. Mixto: local + cloud.</p>
      <p class="consultant-tip">CAPEX y OPEX ayudan a analizar el modelo de costo, pero no determinan por sí solos cuál alternativa es mejor.</p>
      <fieldset><legend>Clasificación</legend><div class="chip-grid">${radios}</div></fieldset>
      <label>Justificación<textarea rows="2" data-draft="draft.costJustification" data-scope="decide">${escapeHtml(draft.costJustification)}</textarea></label>
    </section>
  `;
}

export function SuccessMetricSelector({ draft }) {
  const chips = successMetrics
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-metric" data-id="${escapeHtml(item.id)}" ${draft.metricIds.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <section>
      <h3>Métrica de éxito</h3>
      <p>Reutiliza métricas ya estudiadas. Sin métrica no se completa la recomendación.</p>
      <div class="chip-grid">${chips}</div>
      <label>Cómo se comprobará<textarea rows="2" data-draft="draft.metricText" data-scope="decide">${escapeHtml(draft.metricText)}</textarea></label>
      <label>Objetivo opcional<textarea rows="2" data-draft="draft.metricTarget" data-scope="decide" placeholder="Ej. MTTR de 3,1 h a ≤ 2 h">${escapeHtml(draft.metricTarget)}</textarea></label>
      <label class="chip-option">
        <input type="checkbox" data-action="toggle-target-undef" ${draft.targetUndefined ? 'checked' : ''} />
        Objetivo por definir con negocio/SLA
      </label>
    </section>
  `;
}

export function PriorityBuilder({ draft }) {
  const cells = impactEffortCells
    .map(
      (item) => `
        <button class="priority-cell${draft.impactEffort === item.id ? ' is-active' : ''}" type="button" data-action="impact-effort" data-id="${escapeHtml(item.id)}">
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.hint)}</span>
        </button>
      `,
    )
    .join('');
  const levels = priorityLevels
    .map(
      (item) => `
        <label class="chip-option">
          <input type="radio" name="priority" data-action="priority-level" value="${escapeHtml(item.id)}" ${draft.priority === item.id ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <section>
      <h3>Priorización</h3>
      <p>Criterios: criticidad, impacto, urgencia, riesgo, esfuerzo, costo, dependencia, factibilidad, beneficio. La matriz orienta; no es regla absoluta.</p>
      <div class="priority-matrix">${cells}</div>
      <fieldset><legend>Prioridad final</legend><div class="chip-grid">${levels}</div></fieldset>
      <label>Justificación<textarea rows="2" data-draft="draft.priorityJustification" data-scope="decide">${escapeHtml(draft.priorityJustification)}</textarea></label>
    </section>
  `;
}

export function RecommendationCard({ item, expanded = false }) {
  return `
    <article class="rec-card quality-${escapeHtml(item.quality || '')}">
      <button class="gov-finding-card__head" type="button" data-action="expand-rec" data-rec-id="${escapeHtml(item.decisionId)}">
        <p class="evidence-card__kicker">${escapeHtml(item.priority)} · ${escapeHtml(item.quality)} · ${escapeHtml(item.status)}</p>
        <h4>${escapeHtml(item.title)}</h4>
      </button>
      <p><strong>Problema:</strong> ${escapeHtml(item.problem)}</p>
      <p><strong>Evidencia:</strong> ${escapeHtml((item.evidenceIds ?? []).join(', '))}</p>
      <p><strong>Impacto:</strong> ${escapeHtml(item.impact)}</p>
      <p><strong>Decisión:</strong> ${escapeHtml(item.decision)}</p>
      <p><strong>Justificación:</strong> ${escapeHtml(item.justification)}</p>
      <p><strong>Beneficio:</strong> ${escapeHtml(item.benefitText)}</p>
      <p><strong>Riesgo:</strong> ${escapeHtml(item.riskText || item.residualJustification || '—')}</p>
      <p><strong>CAPEX/OPEX:</strong> ${escapeHtml(costLabel(item.costModel))} · <strong>Métrica:</strong> ${escapeHtml(item.metricText || item.metricIds.map(metricLabel).join(', '))}</p>
      <p><strong>Prioridad:</strong> ${escapeHtml(item.priority)}</p>
      ${
        expanded
          ? `
            <p><strong>Fuentes:</strong> ${escapeHtml((item.sources ?? []).join(', '))}</p>
            ${item.status === 'REVIEW_REQUIRED' ? '<p class="form-error">REVISIÓN REQUERIDA</p>' : ''}
            <button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-rec" data-rec-id="${escapeHtml(item.decisionId)}">Editar</button>
          `
          : ''
      }
    </article>
  `;
}

export function TechnologyStrategyBuilder({ strategy }) {
  const fields = [
    ['keep', '¿Qué debe mantenerse?'],
    ['improve', '¿Qué debe mejorarse?'],
    ['scale', '¿Qué puede escalar?'],
    ['redundant', '¿Qué debe ser redundante?'],
    ['cloud', '¿Qué puede usar cloud?'],
    ['edge', '¿Qué podría requerir edge?'],
    ['measure', '¿Qué debe medirse mejor?'],
  ]
    .map(
      ([id, label]) => `
        <label>
          ${escapeHtml(label)}
          <textarea rows="2" data-draft="strategy.${id}" data-scope="decide">${escapeHtml(strategy[id] || '')}</textarea>
        </label>
      `,
    )
    .join('');
  return `
    <section>
      <h3>Estrategia tecnológica preliminar</h3>
      <p>InfraGuide organiza decisiones. No dibuja automáticamente el TO-BE completo. Puede listar elementos propuestos a partir de lo documentado.</p>
      <p class="consultant-tip">Orientación del caso (no se rellena sola): mantener ERP; resiliencia; capacidad del canal digital; monitoreo; almacenamiento; híbrido si se justifica.</p>
      ${fields}
      <label>Texto editable<textarea rows="5" data-draft="strategy.draft" data-scope="decide">${escapeHtml(strategy.draft || '')}</textarea></label>
    </section>
  `;
}

export function DecideTables({ decide }) {
  const recs = decide.recommendations ?? [];
  const capexRows = recs
    .map(
      (item) => `<tr><td>${escapeHtml(item.title)}</td><td>${escapeHtml(costLabel(item.costModel))}</td><td>${escapeHtml(item.costJustification)}</td></tr>`,
    )
    .join('');
  const recRows = recs
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.priority)}</td>
          <td>${escapeHtml(item.problem)}</td>
          <td>${escapeHtml(item.decision)}</td>
          <td>${escapeHtml(item.benefitText)}</td>
          <td>${escapeHtml(item.riskText || '')}</td>
          <td>${escapeHtml(item.metricText || item.metricIds.join(', '))}</td>
        </tr>
      `,
    )
    .join('');
  return `
    <section class="gov-tables">
      <h3>15. CAPEX y OPEX</h3>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Recomendación</th><th>Clasificación</th><th>Justificación</th></tr></thead>
          <tbody>${capexRows || '<tr><td colspan="3">Sin filas.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="matrix-cards">${recs.map((item) => `<article class="matrix-card"><p>${escapeHtml(item.title)}</p><p>${escapeHtml(costLabel(item.costModel))}</p></article>`).join('')}</div>
      <h3>16. Recomendaciones priorizadas</h3>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Prioridad</th><th>Problema</th><th>Decisión</th><th>Beneficio</th><th>Riesgo</th><th>Métrica</th></tr></thead>
          <tbody>${recRows || '<tr><td colspan="6">Sin filas.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="matrix-cards">${recs.map((item) => RecommendationCard({ item, expanded: decide.expandedRecId === item.decisionId })).join('')}</div>
    </section>
  `;
}

export function PedagogicalNotes() {
  return `
    <details class="example-box">
      <summary>Ejemplos metodológicos (no se insertan solos)</summary>
      ${pedagogicalExamples
        .map(
          (item) => `
            <article class="example-card">
              <p><strong>${escapeHtml(item.finding)}</strong></p>
              <p>${escapeHtml(item.alternatives || item.decision || '')}</p>
              <p class="consultant-tip">${escapeHtml(item.note || item.metric || '')}</p>
            </article>
          `,
        )
        .join('')}
    </details>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import { FEEDBACK_STATUS } from '../../data/pedagogy/index.js';
import { composeInterpretation } from '../../state/pedagogyModel.js';

const FIELDS = [
  { id: 'resultOf', label: 'El resultado de' },
  { id: 'indicates', label: 'indica que' },
  { id: 'during', label: 'durante' },
  { id: 'affects', label: 'Este valor afecta a' },
  { id: 'because', label: 'porque' },
  { id: 'limitation', label: 'La principal limitación es' },
  { id: 'recommend', label: 'Se recomienda analizar/implementar' },
  { id: 'improvedWhen', label: 'Se considerará mejorado cuando' },
];

export function PedagogyFeedback({ feedback }) {
  if (!feedback?.status) return '';
  const tone = toneOf(feedback.status);
  return `
    <p class="pedagogy-feedback pedagogy-feedback--${tone}" role="status" aria-live="polite">
      <strong>${escapeHtml(feedback.status)}.</strong> ${escapeHtml(feedback.message)}
    </p>
  `;
}

function toneOf(status) {
  if (status === FEEDBACK_STATUS.CORRECT) return 'ok';
  if (status === FEEDBACK_STATUS.PARTIAL) return 'partial';
  if (status === FEEDBACK_STATUS.INSUFFICIENT) return 'info';
  if (status === FEEDBACK_STATUS.DONT_CONFUSE) return 'warn';
  return 'review';
}

export function InterpretationBuilder({ metricId, slot = {}, error = '' }) {
  const parts = slot.interpretationParts || {};
  const preview = composeInterpretation(parts);
  const fields = FIELDS.map(
    (field) => `
      <label>
        ${escapeHtml(field.label)}
        <input
          type="text"
          data-scope="measure"
          data-draft="${escapeHtml(metricId)}.interpretationParts.${field.id}"
          value="${escapeHtml(parts[field.id] || '')}"
          autocomplete="off"
        />
      </label>
    `,
  ).join('');
  return `
    <section class="builder-card interpretation-builder" aria-labelledby="interp-${escapeHtml(metricId)}">
      <h3 id="interp-${escapeHtml(metricId)}">Constructor de interpretación</h3>
      <p>Completa la estructura. InfraGuide no genera la conclusión por ti.</p>
      <div class="interp-grid">${fields}</div>
      <p class="interp-preview"><strong>Texto compuesto:</strong> ${escapeHtml(preview || 'Todavía incompleto.')}</p>
      ${PedagogyFeedback({ feedback: slot.feedback })}
      ${error ? `<p class="form-error" role="alert">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="validate-interpretation" data-metric-id="${escapeHtml(metricId)}">Revisar interpretación</button>
      <button class="btn" type="button" data-action="pedagogy-level" data-metric-id="${escapeHtml(metricId)}" data-level="3">Continuar al hallazgo</button>
    </section>
  `;
}

const FINDING_FIELDS = [
  { id: 'condition', label: 'Condición — ¿Qué está ocurriendo?' },
  { id: 'evidence', label: 'Evidencia — ¿Qué dato lo demuestra?' },
  { id: 'criterion', label: 'Criterio — ¿Contra qué meta o práctica se compara?' },
  { id: 'cause', label: 'Causa — ¿Por qué puede estar ocurriendo?' },
  { id: 'impact', label: 'Impacto — ¿Qué servicio o resultado de negocio se afecta?' },
  { id: 'risk', label: 'Riesgo — ¿Qué podría suceder si no se trata?' },
  { id: 'recommendation', label: 'Recomendación — ¿Qué debe hacerse?' },
  { id: 'acceptance', label: 'Criterio de aceptación — ¿Cómo se comprobará el cierre?' },
];

export function FindingFromMetricBuilder({ metricId, slot = {}, example = {} }) {
  const draft = slot.findingFromMetric || {};
  const exampleRows = FINDING_FIELDS.map(
    (field) => `<tr><th scope="row">${escapeHtml(field.label.split('—')[0].trim())}</th><td>${escapeHtml(example[field.id] || '—')}</td></tr>`,
  ).join('');
  const work = FINDING_FIELDS.map(
    (field) => `
      <label>
        ${escapeHtml(field.label)}
        <textarea rows="2" data-scope="measure" data-draft="${escapeHtml(metricId)}.findingFromMetric.${field.id}">${escapeHtml(draft[field.id] || '')}</textarea>
      </label>
    `,
  ).join('');
  return `
    <section class="finding-split">
      <article class="example-pane">
        <h3>Ejemplo guiado</h3>
        <p>No lo copies como si fuera tu análisis. Úsalo para ver la estructura.</p>
        <table class="ig-mini-table"><tbody>${exampleRows}</tbody></table>
      </article>
      <article class="student-pane">
        <h3>Trabajo del estudiante</h3>
        ${work}
        <button class="btn btn--primary" type="button" data-action="persist-metric-finding" data-metric-id="${escapeHtml(metricId)}">Guardar hallazgo de trabajo (no exporta la pedagogía)</button>
      </article>
    </section>
  `;
}

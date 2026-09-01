import { escapeHtml } from '../../utils/escape.js';
import {
  conclusionTemplate,
  conclusionHints,
  strengthOptions,
  limitationOptions,
  PREVIEW_MODES,
} from '../../data/methodology/build.js';
import { restrictionItems } from '../../data/methodology/understand.js';
import { priorityLabel } from '../../state/decideModel.js';
import { createExportConfig } from '../../data/methodology/export.js';
import { generateConsultingReport, consultingReportToExportModel } from '../../report/index.js';
import { renderDocumentBody, EMBEDDED_DOCUMENT_CSS } from '../../export/documentHtml.js';
import { HowObtainedButton, HowObtainedPanel } from '../pedagogy/GuidedCalculator.js';

const PREVIEW_EDIT_LINKS = [
  { key: 'findings', path: '/diagnosticar', label: 'Editar hallazgos' },
  { key: 'architecture', path: '/representar/5', label: 'Editar AS-IS / SPOF' },
  { key: 'performance', path: '/medir', label: 'Editar métricas' },
  { key: 'risks', path: '/gobernar', label: 'Editar gobierno' },
  { key: 'target', path: '/decidir/12', label: 'Editar estrategia' },
  { key: 'program', path: '/decidir/11', label: 'Editar recomendaciones' },
  { key: 'closing', path: '/construir/4', label: 'Editar conclusiones' },
];

export function ConclusionsBuilder({ draft, findings = [], recommendations = [], constraints = [], warnings = [], error = '' }) {
  const findingChips = findings
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-finding" data-id="${escapeHtml(item.findingId)}" ${draft.selectedFindings.includes(item.findingId) ? 'checked' : ''} />
          ${escapeHtml(item.title)}
        </label>
      `,
    )
    .join('');
  const strengthChips = strengthOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-strength" data-id="${escapeHtml(item.id)}" ${draft.selectedStrengths.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  const constraintChips = (constraints.length ? constraints : restrictionItems)
    .map((item) => {
      const id = item.id;
      const label = item.label;
      return `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-constraint" data-id="${escapeHtml(id)}" ${draft.constraintIds.includes(id) ? 'checked' : ''} />
          ${escapeHtml(label)}
        </label>
      `;
    })
    .join('');
  const priorityChips = recommendations
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-priority" data-id="${escapeHtml(item.decisionId)}" ${draft.priorities.includes(item.decisionId) ? 'checked' : ''} />
          ${escapeHtml(priorityLabel(item.priority))} · ${escapeHtml(item.decision)}
        </label>
      `,
    )
    .join('');
  const limitChips = limitationOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-limit" data-id="${escapeHtml(item.id)}" ${draft.limitations.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  const template = conclusionTemplate.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  return `
    <section class="finding-builder">
      <h2>ConclusionsBuilder</h2>
      <p>Las conclusiones sintetizan estado, riesgos, patrones, madurez, prioridades y relación con el negocio. No son un resumen de tablas ni una lista de compras.</p>
      <p class="consultant-tip">${escapeHtml(conclusionHints.strengths)}</p>
      <fieldset><legend>Paso 1 · 3 a 5 hallazgos principales</legend><div class="chip-grid">${findingChips}</div></fieldset>
      <fieldset><legend>Paso 2 · 2 a 3 fortalezas (no se agregan solas)</legend><div class="chip-grid">${strengthChips}</div></fieldset>
      <fieldset><legend>Paso 3 · Restricciones</legend><div class="chip-grid">${constraintChips}</div></fieldset>
      <fieldset><legend>Paso 4 · Prioridades estratégicas</legend><div class="chip-grid">${priorityChips || '<p>Guarda recomendaciones en DECIDIR primero.</p>'}</div></fieldset>
      <fieldset>
        <legend>Paso 5 · Limitaciones del análisis</legend>
        <p class="consultant-tip">${escapeHtml(conclusionHints.limits)}</p>
        <div class="chip-grid">${limitChips}</div>
        <label>Detalle opcional<textarea rows="2" data-draft="conclusions.limitationText" data-scope="build">${escapeHtml(draft.limitationText)}</textarea></label>
      </fieldset>
      <details class="example-box">
        <summary>Estructura orientadora (no se llena sola)</summary>
        <ol>${template}</ol>
        <p>${escapeHtml(conclusionHints.length)}</p>
      </details>
      <label>Paso 6 · Conclusión<textarea rows="10" data-draft="conclusions.draft" data-scope="build">${escapeHtml(draft.draft)}</textarea></label>
      ${warnings.map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`).join('')}
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="save-conclusions">Agregar 14. Conclusiones al documento</button>
    </section>
  `;
}

export function DocumentPreview({ state, assembled, build }) {
  void assembled;
  const mode = build.previewMode || PREVIEW_MODES.academic;
  const indexOpen = build.indexOpen !== false;
  const config = createExportConfig();
  config.mode = mode === PREVIEW_MODES.document ? 'clean' : 'academic';
  config.includeIndex = indexOpen;
  const report = generateConsultingReport(state);
  const model = consultingReportToExportModel(report, config);
  const body = renderDocumentBody(model, 'html');
  const edits = PREVIEW_EDIT_LINKS.map(
    (item) =>
      `<button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-from-preview" data-section-key="${escapeHtml(item.key)}" data-path="${escapeHtml(item.path)}">${escapeHtml(item.label)}</button>`,
  ).join('');
  const warnings = (report.validation?.warnings ?? []).slice(0, 6);
  return `
    <article class="report consulting-preview" aria-label="Vista previa del informe técnico de consultoría">
      <div class="preview-toolbar">
        <div class="chip-grid" role="group" aria-label="Modo de vista previa">
          <button class="btn btn--small${mode === PREVIEW_MODES.academic ? ' btn--primary' : ''}" type="button" data-action="preview-mode" data-mode="academic">Informe completo</button>
          <button class="btn btn--small${mode === PREVIEW_MODES.document ? ' btn--primary' : ''}" type="button" data-action="preview-mode" data-mode="document">Informe compacto</button>
        </div>
        <button class="btn btn--small" type="button" data-action="toggle-doc-index" aria-expanded="${indexOpen ? 'true' : 'false'}" aria-controls="report-index">Índice</button>
        <button class="btn btn--small" type="button" data-action="mark-preview-reviewed">He revisado la vista previa</button>
      </div>
      <p>Esta vista previa es el informe técnico de consultoría. No vuelve a narrar el caso. La unidad es el hallazgo de ingeniería.</p>
      <div class="preview-edit-row">${edits}</div>
      ${
        warnings.length
          ? `<ul class="form-error">${warnings.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
          : ''
      }
      <style>${EMBEDDED_DOCUMENT_CSS}</style>
      <div class="ig-doc-body consulting-preview__page">
        <div class="ig-page">${body}</div>
      </div>
      ${PreviewHowObtained({ state })}
    </article>
  `;
}

function PreviewHowObtained({ state }) {
  const traces = state.analysis?.measure?.traces || {};
  const ids = Object.keys(traces);
  if (!ids.length) {
    return `
      <section class="preview-how-obtained">
        <h2>Aprendizaje · ¿Cómo se obtuvo?</h2>
        <p>Cuando calcules métricas en MEDIR, aquí podrás abrir la trazabilidad. Esta sección no se exporta al HTML ni al DOCX profesionales.</p>
      </section>
    `;
  }
  return `
    <section class="preview-how-obtained">
      <h2>Aprendizaje · ¿Cómo se obtuvo?</h2>
      <p>Explicación pedagógica de los cálculos. No forma parte del informe exportado.</p>
      ${ids
        .map(
          (id) => `
            ${HowObtainedButton({ metricId: id, open: state.howObtainedMetric === id })}
            ${HowObtainedPanel({ metricId: id, trace: traces[id], open: state.howObtainedMetric === id })}
          `,
        )
        .join('')}
    </section>
  `;
}

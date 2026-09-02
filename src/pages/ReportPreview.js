import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { escapeHtml } from '../utils/escape.js';
import { generateConsultingReport, consultingReportToExportModel } from '../report/index.js';
import { renderDocumentBody, EMBEDDED_DOCUMENT_CSS } from '../export/documentHtml.js';
import { createExportConfig } from '../data/methodology/export.js';
import { createModelReportState, MODEL_REPORT_BANNER, MODEL_REPORT_NOTICE } from '../data/testing/modelReportState.js';
import { buildConsultingDocumentIndex } from '../state/documentTrace.js';
import { HowObtainedButton, HowObtainedPanel } from '../components/pedagogy/GuidedCalculator.js';
import { DOCUMENT_SECTION_STATUS } from '../data/document/consultingSections.js';

export function ReportPreviewPage(state, route = {}) {
  const modelMode = Boolean(route.model);
  const source = modelMode ? createModelReportState() : state;
  const report = generateConsultingReport(source);
  const exportModel = consultingReportToExportModel(report, createExportConfig());
  const index = buildConsultingDocumentIndex(source);
  const body = renderDocumentBody(exportModel);
  const ready = Boolean(source.analysis?.build?.readyToExport) && !report.executiveOpinion?.insufficient;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page report-preview-page">
        <header class="section-heading">
          <p class="understand-kicker">${modelMode ? 'Informe modelo' : 'Vista previa progresiva'}</p>
          <h1>${modelMode ? 'Ver informe modelo' : 'Vista previa del informe'}</h1>
          ${
            modelMode
              ? `<p class="model-banner" role="status"><strong>${escapeHtml(MODEL_REPORT_BANNER)}</strong></p>
                 <p>${escapeHtml(MODEL_REPORT_NOTICE)}</p>
                 <p>Solo lectura. No modifica tu progreso ni se mezcla con tu documento.</p>`
              : `<p>Muestra lo ya construido y lo que falta. La exportación definitiva se habilita cuando el documento cumple los criterios.</p>`
          }
          <p>Preparación: <strong>${index.readiness} %</strong>. Errores críticos: ${index.validation.errors.length}. Advertencias: ${index.validation.warnings.length}.</p>
        </header>

        ${ReadinessBoard({ index, validation: index.validation })}

        <div class="report-preview-actions">
          ${
            modelMode
              ? `
                <button class="btn btn--primary" type="button" data-action="export-model-html">Probar HTML</button>
                <button class="btn" type="button" data-action="export-model-docx">Probar Word</button>
                <button class="btn" type="button" data-action="export-model-print">Probar vista imprimible</button>
              `
              : ready
                ? `<a class="btn btn--primary" href="#/exportar" data-nav="/exportar">EXPORTAR INFORME</a>
                   <a class="btn" href="#/progreso" data-nav="/progreso">GUARDAR PROGRESO</a>`
                : `<p class="pedagogy-feedback pedagogy-feedback--info">Aún no puedes exportar el informe definitivo. Usa esta vista para revisar el avance.</p>
                   <a class="btn" href="#/informe/modelo" data-nav="/informe/modelo">Ver informe modelo</a>
                   <a class="btn" href="#/progreso" data-nav="/progreso">GUARDAR PROGRESO</a>`
          }
        </div>

        ${HowFromDocument({ state: source, how: state.howObtainedMetric })}

        <article class="report-preview-paper${modelMode ? ' is-model' : ''}" aria-label="${modelMode ? 'Informe modelo de solo lectura' : 'Vista previa del informe del estudiante'}">
          ${modelMode ? `<p class="model-watermark">${escapeHtml(MODEL_REPORT_BANNER)}</p>` : ''}
          <style>${EMBEDDED_DOCUMENT_CSS}</style>
          ${body}
        </article>
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function ReadinessBoard({ index, validation }) {
  const rows = index.items
    .map((item) => {
      const mark =
        item.status === DOCUMENT_SECTION_STATUS.EMPTY
          ? 'Sección todavía no construida'
          : item.missing[0] || item.status;
      return `
        <tr>
          <th scope="row">${escapeHtml(item.number)}. ${escapeHtml(item.title)}</th>
          <td>${escapeHtml(item.status)}</td>
          <td>${escapeHtml(mark)}</td>
        </tr>
      `;
    })
    .join('');
  const errors = (validation.errors ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const warnings = (validation.warnings ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  return `
    <section class="builder-card">
      <h2>Estado de las secciones</h2>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Sección</th><th>Estado</th><th>Observación</th></tr></thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
      ${errors ? `<p><strong>Errores críticos</strong></p><ul>${errors}</ul>` : ''}
      ${warnings ? `<p><strong>Advertencias</strong></p><ul>${warnings}</ul>` : ''}
    </section>
  `;
}

function HowFromDocument({ state, how }) {
  const measure = state.analysis?.measure ?? {};
  const ids = ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'].filter((id) => measure[id]?.trace || measure[id]?.result != null);
  if (!ids.length) return '';
  return `
    <section class="preview-how-obtained">
      <h2>¿Cómo se obtuvo?</h2>
      <p>Explicación de aprendizaje. No se exporta completa al informe profesional.</p>
      ${ids
        .map(
          (id) => `
            ${HowObtainedButton({ metricId: id, open: how === id })}
            ${HowObtainedPanel({ metricId: id, trace: measure[id]?.trace, open: how === id })}
          `,
        )
        .join('')}
    </section>
  `;
}

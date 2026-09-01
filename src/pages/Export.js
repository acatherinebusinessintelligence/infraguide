import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { escapeHtml } from '../utils/escape.js';
import { appCopy } from '../data/copy.js';
import { EXPORT_STATUS, exportCopy, EXPORT_MODES } from '../data/methodology/export.js';
import { documentSummary } from '../state/buildModel.js';
import { createExportState } from '../state/exportModel.js';
import { getExportModel, canExport } from '../state/exportActions.js';
import { HtmlExporter } from '../export/htmlExporter.js';
import { renderDocumentBody } from '../export/documentHtml.js';
import { PrintableDocument, suggestedPdfName } from '../export/printView.js';
import { exportBaseName } from '../export/text.js';

export function ExportPage(state, route = {}) {
  if (typeof window !== 'undefined') {
    import('../export/docxExporter.js').catch(() => {});
  }
  if (!state.selectedCase) {
    return shell(
      state,
      `<h1>Centro de exportación</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`,
    );
  }
  if (!canExport(state)) {
    return shell(
      state,
      `
        <h1>Centro de exportación</h1>
        <p class="form-error" role="status">${escapeHtml(exportCopy.notReady)}</p>
        <a class="btn btn--primary" href="#/construir" data-nav="/construir">${escapeHtml(exportCopy.review)}</a>
      `,
    );
  }

  if (route.print) {
    return printLayout(state);
  }

  const exp = state.analysis?.export ?? createExportState();
  const summary = documentSummary(state);
  const config = exp.config;
  const academic = config.mode === EXPORT_MODES.academic;
  const live = liveMessage(exp);
  const cards = renderCards();
  const history = renderHistory(exp.history);
  const preview = exp.previewOpen ? ExportPreview({ state, format: exp.previewFormat }) : '';

  return `
    <div class="app-shell export-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page export-page">
        <header class="section-heading">
          <h1>Centro de exportación</h1>
          <p>Exporta el documento ya construido. No se reconstruye el análisis.</p>
        </header>
        ${ExportCenter({ state, summary, exp, academic, live, cards, history })}
        ${preview}
      </main>
      ${DocumentOverlay({ state })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function ExportCenter({ state, summary, exp, academic, live, cards, history }) {
  const wordFailed = exp.status === EXPORT_STATUS.ERROR && exp.lastError === exportCopy.wordFail;
  return `
    <section class="export-center" aria-labelledby="export-center-title">
      <h2 id="export-center-title" class="visually-hidden">Resumen de exportación</h2>
      <dl class="export-stats">
        <div><dt>Documento</dt><dd>${escapeHtml(state.selectedCase?.name || 'Helados Boreal S.A.S.')}</dd></div>
        <div><dt>Estado</dt><dd>LISTO PARA EXPORTAR</dd></div>
        <div><dt>Secciones</dt><dd>${escapeHtml(summary.sections)}</dd></div>
        <div><dt>Hallazgos</dt><dd>${summary.findings}+</dd></div>
        <div><dt>Recomendaciones</dt><dd>${summary.recommendations}+</dd></div>
        <div><dt>Errores</dt><dd>${summary.errors}</dd></div>
      </dl>
      <p class="export-live" role="status" aria-live="polite">${escapeHtml(live)}</p>
      ${exp.lastError ? `<p class="form-error" role="alert">${escapeHtml(exp.lastError)}</p>` : ''}
      ${
        wordFailed
          ? `<p>${escapeHtml(exportCopy.fallback)}</p>
             <div class="export-actions">
               <button class="btn btn--primary" type="button" data-action="export-html">Descargar HTML</button>
               <a class="btn" href="#/exportar/imprimir" data-nav="/exportar/imprimir">Abrir vista imprimible</a>
             </div>`
          : ''
      }
      <fieldset class="export-mode">
        <legend>Modo de documento</legend>
        <label><input type="radio" name="export-mode" data-action="export-mode" data-mode="clean" ${academic ? '' : 'checked'} /> Documento limpio</label>
        <label><input type="radio" name="export-mode" data-action="export-mode" data-mode="academic" ${academic ? 'checked' : ''} /> Documento académico</label>
      </fieldset>
      ${
        academic
          ? `
            <fieldset class="export-flags">
              <legend>Opciones avanzadas</legend>
              <label><input type="checkbox" data-action="export-flag" data-flag="includeTraceability" ${configChecked(exp, 'includeTraceability')} /> Incluir trazabilidad</label>
              <label><input type="checkbox" data-action="export-flag" data-flag="includeFormulas" ${configChecked(exp, 'includeFormulas')} /> Incluir fórmulas</label>
              <label><input type="checkbox" data-action="export-flag" data-flag="includeLimitations" ${configChecked(exp, 'includeLimitations')} /> Incluir limitaciones</label>
              <label><input type="checkbox" data-action="export-flag" data-flag="includeEvidence" ${configChecked(exp, 'includeEvidence')} /> Incluir evidencia detallada</label>
            </fieldset>
          `
          : ''
      }
      ${cards}
      <div class="export-actions">
        <button class="btn btn--primary" type="button" data-action="export-preview" aria-expanded="${exp.previewOpen ? 'true' : 'false'}">Vista previa</button>
        <button class="btn" type="button" data-action="export-html">Descargar HTML</button>
        <button class="btn" type="button" data-action="export-docx">Descargar Word</button>
        <button class="btn" type="button" data-action="export-print">Imprimir / Guardar PDF</button>
      </div>
      ${history}
    </section>
  `;
}

function configChecked(exp, flag) {
  return exp.config?.[flag] !== false ? 'checked' : '';
}

function renderCards() {
  return `
    <div class="export-cards">
      <article class="export-card">
        <h3>HTML</h3>
        <p>${escapeHtml(exportCopy.htmlCard)}</p>
      </article>
      <article class="export-card">
        <h3>Word</h3>
        <p>${escapeHtml(exportCopy.wordCard)}</p>
      </article>
      <article class="export-card">
        <h3>PDF / Impresión</h3>
        <p>${escapeHtml(exportCopy.printCard)}</p>
      </article>
    </div>
  `;
}

function renderHistory(history = []) {
  if (!history.length) {
    return `<section class="panel"><h3>Últimas exportaciones</h3><p>Todavía no hay exportaciones en este dispositivo.</p></section>`;
  }
  const latest = [...history].reverse().slice(0, 8);
  const items = latest
    .map((item) => {
      const when = item.generatedAt ? new Date(item.generatedAt).toLocaleString('es-CO') : '';
      return `<li><strong>${escapeHtml(item.format)}</strong> ${escapeHtml(item.label || `v${item.version}`)} · ${escapeHtml(when)}</li>`;
    })
    .join('');
  return `<section class="panel" aria-labelledby="export-history-title"><h3 id="export-history-title">Últimas exportaciones</h3><ul class="export-history">${items}</ul></section>`;
}

export function ExportPreview({ state, format = 'html' }) {
  const model = getExportModel(state);
  const note =
    format === 'word'
      ? 'El archivo Word usa Calibri, títulos azul oscuro y tablas con encabezado azul claro. Esta vista muestra la misma estructura.'
      : format === 'print'
        ? 'La vista imprimible oculta menús y botones. En el navegador usa Guardar como PDF.'
        : 'Esta vista coincide con el archivo HTML independiente.';
  const body = format === 'html' ? HtmlExporter(model).html : `<article class="ig-page">${renderDocumentBody(model, format)}</article>`;
  return `
    <section class="export-preview panel" aria-labelledby="export-preview-title">
      <h2 id="export-preview-title">Vista previa de exportación</h2>
      <p>${escapeHtml(note)}</p>
      <div class="chip-grid" role="tablist" aria-label="Formato de vista previa">
        <button class="btn btn--small${format === 'html' ? ' btn--primary' : ''}" type="button" data-action="preview-format" data-format="html">HTML</button>
        <button class="btn btn--small${format === 'word' ? ' btn--primary' : ''}" type="button" data-action="preview-format" data-format="word">Word</button>
        <button class="btn btn--small${format === 'print' ? ' btn--primary' : ''}" type="button" data-action="preview-format" data-format="print">Print</button>
      </div>
      <div class="export-preview__frame export-preview--${escapeHtml(format)}">${format === 'html' ? `<iframe class="export-preview__iframe" title="Vista previa HTML" srcdoc="${escapeHtml(body)}"></iframe>` : body}</div>
    </section>
  `;
}

function liveMessage(exp) {
  if (exp.status === EXPORT_STATUS.GENERATING) return exportCopy.generating;
  if (exp.status === EXPORT_STATUS.SUCCESS) return exportCopy.success;
  if (exp.status === EXPORT_STATUS.ERROR) return exp.lastError || 'Error de exportación.';
  return 'LISTO PARA EXPORTAR';
}

function printLayout(state) {
  const model = getExportModel(state);
  const pdfName = suggestedPdfName(exportBaseName(state.selectedCase?.name));
  return `
    <div class="print-shell">
      <div class="print-toolbar">
        <a class="btn" href="#/exportar" data-nav="/exportar">Volver al centro de exportación</a>
        <button class="btn btn--primary" type="button" data-action="do-print">Imprimir / Guardar PDF</button>
      </div>
      ${PrintableDocument({ model, suggestedName: pdfName })}
    </div>
  `;
}

function shell(state, inner) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page export-page">${inner}</main>
      ${DocumentOverlay({ state })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

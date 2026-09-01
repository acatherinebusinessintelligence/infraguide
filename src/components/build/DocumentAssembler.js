import { escapeHtml } from '../../utils/escape.js';
import { ISSUE_SEVERITY, SECTION_STATUS, DOCUMENT_STATUS } from '../../data/methodology/build.js';
import { finalReportSections } from '../../data/methodology/build.js';

export function DocumentStatusPanel({ assembled = [] }) {
  const items = assembled
    .map((section) => {
      const done = section.status === SECTION_STATUS.COMPLETE;
      const review = section.status === SECTION_STATUS.REVIEW_REQUIRED;
      const mark = done ? '✓ Completo' : review ? 'Revisión requerida' : 'Pendiente';
      return `
        <li class="${done ? 'is-done' : review ? 'is-review' : ''}">
          <span>${section.id}. ${escapeHtml(section.title)}</span>
          <strong>${escapeHtml(mark)}</strong>
        </li>
      `;
    })
    .join('');
  return `
    <aside class="coverage-panel" aria-labelledby="doc-status-title">
      <h3 id="doc-status-title">Estado del documento</h3>
      <ul class="review-list">${items}</ul>
    </aside>
  `;
}

export function DocumentAssembler({ assembled = [] }) {
  const cards = assembled
    .map((section) => {
      const tone =
        section.status === SECTION_STATUS.COMPLETE ? 'is-correct' : section.status === SECTION_STATUS.REVIEW_REQUIRED ? 'is-wrong' : '';
      return `
        <article class="classify-card ${tone}">
          <p class="evidence-card__kicker">${escapeHtml(section.status)}</p>
          <h4>${section.id}. ${escapeHtml(section.title)}</h4>
          <p>${section.text ? `${escapeHtml(section.text.slice(0, 180))}${section.text.length > 180 ? '…' : ''}` : 'Sin contenido ensamblado. No se inventa análisis.'}</p>
          <button class="btn btn--small" type="button" data-action="goto-preview-section" data-section-key="${escapeHtml(section.key)}">Ver en el informe</button>
        </article>
      `;
    })
    .join('');
  return `
    <section>
      <h2>DocumentAssembler</h2>
      <p>Reúne las secciones ya construidas. No duplica contenido ni genera análisis nuevo.</p>
      <div class="classify-grid">${cards}</div>
    </section>
  `;
}

export function DocumentSummary({ summary }) {
  const ready = summary.readyToExport;
  return `
    <section class="panel">
      <h3>Resumen del documento</h3>
      <ul class="doc-summary">
        <li>Secciones: ${escapeHtml(summary.sections)}</li>
        <li>Hallazgos: ${summary.findings}</li>
        <li>ITIL: ${summary.itil}</li>
        <li>COBIT: ${summary.cobit}</li>
        <li>ISO: ${summary.iso}</li>
        <li>Recomendaciones: ${summary.recommendations}</li>
        <li>Errores: ${summary.errors}</li>
        <li>Revisiones: ${summary.reviews}</li>
      </ul>
      <p><strong>Estado:</strong> ${ready ? 'LISTO PARA EXPORTAR' : escapeHtml(summary.status)}</p>
      <p class="consultant-tip">Los contadores son requisitos estructurales, no un puntaje de calidad. No se muestra “100 % calidad”.</p>
    </section>
  `;
}

export function DocumentIssuesPanel({ issues = [] }) {
  const groups = [ISSUE_SEVERITY.ERROR, ISSUE_SEVERITY.REVIEW, ISSUE_SEVERITY.WARNING];
  const blocks = groups
    .map((severity) => {
      const items = issues.filter((item) => item.severity === severity);
      const cards = items
        .map(
          (item) => `
            <article class="issue-card severity-${escapeHtml(severity)}">
              <p class="evidence-card__kicker">${escapeHtml(severity)}</p>
              <p>${escapeHtml(item.message)}</p>
              <button class="btn btn--small" type="button" data-action="review-issue" data-path="${escapeHtml(item.reviewPath)}" data-section-key="${escapeHtml(item.sectionKey)}" aria-label="Revisar: ${escapeHtml(item.message)}">Revisar</button>
            </article>
          `,
        )
        .join('');
      return `
        <div>
          <h4>${escapeHtml(severity)} (${items.length})</h4>
          <div class="issue-grid">${cards || '<p>Ninguno.</p>'}</div>
        </div>
      `;
    })
    .join('');
  return `
    <section aria-labelledby="issues-title">
      <h3 id="issues-title">Problemas del documento</h3>
      <div aria-live="polite">${issues.length ? `${issues.length} hallazgos de validación.` : 'Sin problemas detectados en esta pasada.'}</div>
      ${blocks}
    </section>
  `;
}

export function DocumentValidator({ issues = [] }) {
  return `
    <section>
      <h2>DocumentValidator</h2>
      <p>Revisa secciones vacías, hallazgos sin evidencia, recomendaciones sin hallazgo o métrica, REVIEW_REQUIRED, criticidades, ITIL/COBIT/ISO incompletos y referencias rotas.</p>
      ${DocumentIssuesPanel({ issues })}
    </section>
  `;
}

export function TraceabilityAudit({ audit = [], chain = [] }) {
  const steps = chain
    .map(
      (node) => `
        <li>
          <button class="trace-node" type="button" data-action="open-trace-node" data-path="${escapeHtml(node.path)}" aria-label="Abrir origen de ${escapeHtml(node.label)}">
            <span>${escapeHtml(node.label)}</span>
            <strong>${escapeHtml(node.detail)}</strong>
          </button>
        </li>
      `,
    )
    .join('');
  const incomplete = audit.filter((item) => item.severity === ISSUE_SEVERITY.ERROR);
  return `
    <section>
      <h2>TraceabilityAudit</h2>
      <p>Métricas con fuente; hallazgos con evidencia; ITIL/COBIT/ISO con origen; recomendaciones con hallazgo + evidencia + métrica.</p>
      <aside class="evidence-chain" aria-label="Cadena extremo a extremo">
        <p class="evidence-chain__kicker">CASO → DATO → HALLAZGO → DECISIÓN → RECOMENDACIÓN → MÉTRICA</p>
        <ol class="trace-nodes">${steps}</ol>
      </aside>
      ${incomplete.length ? '<p class="form-error" role="status">TRAZABILIDAD INCOMPLETA.</p>' : '<p role="status">Trazabilidad auditada: los eslabones críticos están presentes.</p>'}
    </section>
  `;
}

export function ConsistencyChecker({ consistency = [] }) {
  return `
    <section>
      <h2>ConsistencyChecker</h2>
      <p>Detecta recomendaciones que no parecen corresponder con el hallazgo seleccionado (p. ej. almacenamiento vs firewall).</p>
      ${
        consistency.length
          ? consistency.map((item) => `<p class="form-error">${escapeHtml(item.message)}</p>`).join('')
          : '<p>No se detectaron desajustes evidentes hallazgo ↔ recomendación.</p>'
      }
    </section>
  `;
}

export function DocumentQualityCheck({ quality = [] }) {
  const items = quality
    .map(
      (item) => `
        <li class="${item.passed ? 'is-done' : ''}">
          <span>${item.passed ? '✓' : '☐'}</span>
          ${escapeHtml(item.label)}
        </li>
      `,
    )
    .join('');
  return `
    <section>
      <h3>DocumentQualityCheck</h3>
      <p>Checklist estructural. Cumplir mínimos no equivale a “100 % de calidad”.</p>
      <ul class="review-list quality-list">${items}</ul>
    </section>
  `;
}

export function statusLabel(status) {
  return status === DOCUMENT_STATUS.READY_TO_EXPORT ? 'LISTO PARA EXPORTAR' : status;
}

void finalReportSections;

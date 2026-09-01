import { escapeHtml } from '../../utils/escape.js';
import { findingCategories } from '../../data/methodology/diagnose.js';
import {
  FINDING_STATUS_LABEL,
  categoryLabel,
  criticalityLabel,
  criticalityRank,
  MIN_FINDINGS,
  coverageWarning,
  allCriticalWarning,
} from '../../state/diagnoseModel.js';
import { findingUsage } from '../../state/governModel.js';

export function DiagnosticMatrix({ diagnose, govern = null }) {
  const findings = [...(diagnose.findings ?? [])];
  if (diagnose.sortBy === 'criticality') {
    findings.sort((a, b) => criticalityRank(a.criticality) - criticalityRank(b.criticality));
  }
  const rows = findings
    .map((item) => {
      const open = diagnose.expandedFindingId === item.findingId;
      const usage = govern ? findingUsage(govern, item.findingId) : null;
      return `
        <article class="matrix-card crit-${escapeHtml(item.criticality || 'none')}">
          <button
            class="matrix-card__head"
            type="button"
            data-action="expand-finding"
            data-finding-id="${escapeHtml(item.findingId)}"
            aria-expanded="${open ? 'true' : 'false'}"
          >
            <span><strong>${escapeHtml(item.title)}</strong></span>
            <span>${escapeHtml(categoryLabel(item.category))}</span>
            <span class="crit-label crit-${escapeHtml(item.criticality || 'none')}">${escapeHtml(criticalityLabel(item.criticality))}</span>
            <span>${escapeHtml(FINDING_STATUS_LABEL[item.status] || item.status)}</span>
          </button>
          <div class="matrix-card__meta">
            <p><strong>Evidencia:</strong> ${(item.evidenceIds ?? []).length} · <strong>Fuente:</strong> ${escapeHtml((item.sources ?? []).join(', ') || '—')}</p>
            <p><strong>Impacto:</strong> ${escapeHtml(item.impact)}</p>
            <p><strong>Recomendación:</strong> Pendiente - se construirá en DECIDIR.</p>
            ${
              usage
                ? `<p class="usage-line">USADO EN GOBIERNO: ITIL ${usage.itil ? '✓' : '—'} · COBIT ${usage.cobit ? '✓' : '—'} · ISO ${usage.iso ? '✓' : '—'}</p>`
                : ''
            }
          </div>
          ${
            open
              ? `
                <div class="matrix-card__body">
                  <p><strong>HALLAZGO</strong><br>${escapeHtml(item.description)}</p>
                  <p><strong>EVIDENCIAS</strong><br>${escapeHtml((item.evidenceIds ?? []).join(', '))}</p>
                  <p><strong>FUENTES</strong><br>${escapeHtml((item.sources ?? []).join(' · '))}</p>
                  <p><strong>IMPACTO</strong><br>${escapeHtml(item.impact)} (${escapeHtml((item.impactCategories ?? []).join(', '))})</p>
                  <p><strong>CRITICIDAD</strong><br><span class="crit-label crit-${escapeHtml(item.criticality)}">${escapeHtml(criticalityLabel(item.criticality))}</span></p>
                  <p><strong>JUSTIFICACIÓN</strong><br>${escapeHtml(item.justification)}</p>
                  ${
                    item.status === 'REVIEW_REQUIRED'
                      ? `<p class="form-error">REVISIÓN REQUERIDA. Evidencia cambiada: ${escapeHtml((item.changedEvidenceIds ?? []).join(', '))}</p>`
                      : ''
                  }
                  <button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-finding" data-finding-id="${escapeHtml(item.findingId)}">Revisar / editar</button>
                </div>
              `
              : ''
          }
        </article>
      `;
    })
    .join('');

  const tableRows = findings
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(categoryLabel(item.category))}</td>
          <td>${(item.evidenceIds ?? []).length}</td>
          <td>${escapeHtml(item.impact)}</td>
          <td><span class="crit-label crit-${escapeHtml(item.criticality || 'none')}">${escapeHtml(criticalityLabel(item.criticality))}</span></td>
          <td>${escapeHtml((item.sources ?? []).join(', '))}</td>
          <td>${escapeHtml(FINDING_STATUS_LABEL[item.status] || item.status)}</td>
          <td>Pendiente - se construirá en DECIDIR.</td>
        </tr>
      `,
    )
    .join('');

  return `
    <section class="diagnostic-matrix">
      <div class="section-heading">
        <h3>Matriz de diagnóstico</h3>
        <p>Hallazgos construidos: ${findings.length} / mínimo ${MIN_FINDINGS}.</p>
      </div>
      <div class="matrix-toolbar">
        <button class="btn btn--small${diagnose.sortBy === 'criticality' ? ' btn--primary' : ' btn--ghost-dark'}" type="button" data-action="sort-findings" data-sort="criticality">Ordenar por criticidad</button>
        <button class="btn btn--small${diagnose.sortBy !== 'criticality' ? ' btn--primary' : ' btn--ghost-dark'}" type="button" data-action="sort-findings" data-sort="created">Orden de creación</button>
      </div>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <caption class="sr-only">Matriz de hallazgos</caption>
          <thead>
            <tr>
              <th>Hallazgo</th>
              <th>Categoría</th>
              <th>Evidencia</th>
              <th>Impacto</th>
              <th>Criticidad</th>
              <th>Fuente</th>
              <th>Estado</th>
              <th>Recomendación</th>
            </tr>
          </thead>
          <tbody>
            ${tableRows || '<tr><td colspan="8">Aún no hay hallazgos en la matriz.</td></tr>'}
          </tbody>
        </table>
      </div>
      <div class="matrix-cards">${rows || '<p>Aún no hay hallazgos.</p>'}</div>
    </section>
  `;
}

export function CoveragePanel({ findings = [] }) {
  const items = findingCategories
    .filter((item) => item.id !== 'missing')
    .map((item) => {
      const ok = findings.some((finding) => finding.category === item.id);
      return `<li class="${ok ? 'is-done' : ''}"><span>${escapeHtml(item.label)}</span> <strong>${ok ? '✓' : '—'}</strong></li>`;
    })
    .join('');
  const warn = coverageWarning(findings);
  const crit = allCriticalWarning(findings);
  return `
    <aside class="coverage-panel" aria-labelledby="coverage-title">
      <h3 id="coverage-title">Cobertura del diagnóstico</h3>
      <p>No se exige un hallazgo de cada categoría, pero se advierte si todos son del mismo tipo.</p>
      <ul class="review-list">${items}</ul>
      ${warn ? `<p class="form-error" role="status">${escapeHtml(warn)}</p>` : ''}
      ${crit ? `<p class="form-error" role="status">${escapeHtml(crit)}</p>` : ''}
    </aside>
  `;
}

export function DiagnoseSummary({ diagnose, error }) {
  return `
    <section class="panel">
      <h3>Resumen de diagnóstico</h3>
      <p>Redacta 1-2 párrafos. La plantilla no se completa sola.</p>
      <button class="btn btn--small btn--ghost-dark" type="button" data-action="insert-summary-template">Mostrar plantilla</button>
      <label>
        Resumen
        <textarea rows="5" data-draft="summary.draft" data-scope="diagnose">${escapeHtml(diagnose.summary.draft)}</textarea>
      </label>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-findings-doc">Guardar matriz y resumen en el documento</button>
    </section>
  `;
}

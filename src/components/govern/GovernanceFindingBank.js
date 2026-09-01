import { escapeHtml } from '../../utils/escape.js';
import { categoryLabel, criticalityLabel } from '../../state/diagnoseModel.js';
import { findingUsage, GOVERN_STATUS_LABEL } from '../../state/governModel.js';
import { frameworkCards } from '../../data/methodology/govern.js';

export function GovernanceFindingBank({ findings = [], govern, showSelect = true }) {
  const cards = findings
    .map((item) => {
      const usage = findingUsage(govern, item.findingId);
      const selected = govern.selectedFindingId === item.findingId;
      const open = govern.expandedFindingId === item.findingId;
      return `
        <article class="gov-finding-card${selected ? ' is-selected' : ''}">
          <button
            class="gov-finding-card__head"
            type="button"
            data-action="select-govern-finding"
            data-finding-id="${escapeHtml(item.findingId)}"
            ${selected ? 'aria-current="true"' : ''}
          >
            <p class="evidence-card__kicker">HALLAZGO</p>
            <h4>${escapeHtml(item.title)}</h4>
            <p>Categoría: ${escapeHtml(categoryLabel(item.category))} · Criticidad: ${escapeHtml(criticalityLabel(item.criticality))}</p>
          </button>
          <p><strong>Impacto:</strong> ${escapeHtml(item.impact)}</p>
          <p><strong>Evidencia:</strong> ${(item.evidenceIds ?? []).length} · <strong>Fuente:</strong> ${escapeHtml((item.sources ?? []).join(', ') || '—')}</p>
          <p class="usage-line">USADO EN GOBIERNO: ITIL ${usage.itil ? '✓' : '—'} · COBIT ${usage.cobit ? '✓' : '—'} · ISO ${usage.iso ? '✓' : '—'}</p>
          ${
            open
              ? `<p>${escapeHtml(item.description)}</p>`
              : ''
          }
          ${
            showSelect
              ? `<button class="btn btn--small btn--ghost-dark" type="button" data-action="expand-govern-finding" data-finding-id="${escapeHtml(item.findingId)}">${open ? 'Ocultar detalle' : 'Ver hallazgo'}</button>`
              : ''
          }
        </article>
      `;
    })
    .join('');

  return `
    <section class="gov-finding-bank" aria-labelledby="gov-bank-title">
      <div class="section-heading">
        <h3 id="gov-bank-title">Banco de hallazgos</h3>
        <p>Reutiliza lo documentado en DIAGNOSTICAR. No se inventan hallazgos aquí.</p>
      </div>
      <div class="gov-finding-grid">${cards || '<p>Aún no hay hallazgos documentados. Cierra DIAGNOSTICAR primero.</p>'}</div>
    </section>
  `;
}

export function FrameworkPerspectiveSelector({ govern, finding }) {
  if (!finding) {
    return `<p>Selecciona un hallazgo para preguntar qué quieres analizar.</p>`;
  }
  const options = frameworkCards
    .map((item) => {
      const checked = Boolean(govern.perspectives[item.id]);
      return `
        <label class="framework-option framework-${escapeHtml(item.id)}${checked ? ' is-active' : ''}">
          <input
            type="checkbox"
            data-action="toggle-perspective"
            data-framework="${escapeHtml(item.id)}"
            ${checked ? 'checked' : ''}
          />
          <span>
            <strong>${escapeHtml(item.name)}</strong>
            <span class="framework-option__q">${escapeHtml(item.question)}</span>
            <span>${escapeHtml(item.summary)}</span>
          </span>
        </label>
      `;
    })
    .join('');
  return `
    <section class="perspective-selector" aria-labelledby="perspective-title">
      <h3 id="perspective-title">¿Qué quieres analizar?</h3>
      <p>Hallazgo: <strong>${escapeHtml(finding.title)}</strong></p>
      <p>Puedes marcar más de una perspectiva cuando tenga sentido.</p>
      <fieldset>
        <legend class="sr-only">Perspectivas</legend>
        <div class="framework-grid">${options}</div>
      </fieldset>
    </section>
  `;
}

export function FrameworkIntroCards() {
  const cards = frameworkCards
    .map(
      (item) => `
        <article class="framework-intro framework-${escapeHtml(item.id)}">
          <p class="evidence-card__kicker">${escapeHtml(item.name)}</p>
          <h3>${escapeHtml(item.summary)}</h3>
          <p>${escapeHtml(item.question)}</p>
        </article>
      `,
    )
    .join('');
  return `<div class="framework-intro-grid">${cards}</div>`;
}

export function GovernanceCoverage({ findings = [], coverage, completion }) {
  return `
    <aside class="coverage-panel" aria-labelledby="gov-coverage-title">
      <h3 id="gov-coverage-title">Cobertura de gobierno</h3>
      <ul class="review-list">
        <li><span>Hallazgos totales</span> <strong>${findings.length}</strong></li>
        <li class="${coverage.itilCount >= 4 ? 'is-done' : ''}"><span>Analizados con ITIL</span> <strong>${coverage.itilFindings} hallazgos · ${coverage.itilCount} / mínimo 4</strong></li>
        <li class="${coverage.cobitCount >= 3 ? 'is-done' : ''}"><span>Analizados con COBIT</span> <strong>${coverage.cobitFindings} hallazgos · ${coverage.cobitCount} / mínimo 3</strong></li>
        <li class="${coverage.isoCount >= 5 ? 'is-done' : ''}"><span>Analizados con ISO</span> <strong>${coverage.isoFindings} hallazgos · ${coverage.isoCount} / mínimo 5</strong></li>
      </ul>
      <p class="consultant-tip">El recuento no interpreta calidad automáticamente.</p>
      <p><strong>ITIL</strong> ${completion.itilMin ? 'COMPLETO' : 'PENDIENTE'} · <strong>COBIT</strong> ${completion.cobitMin ? 'COMPLETO' : 'PENDIENTE'} · <strong>ISO</strong> ${completion.isoMin ? 'COMPLETO' : 'PENDIENTE'}</p>
    </aside>
  `;
}

export function TraceabilityChain({ finding, framework = '', analysis = '', documentTarget = '' }) {
  return `
    <aside class="evidence-chain" aria-label="Cadena de trazabilidad de gobierno">
      <p class="evidence-chain__kicker">TRACEABILITYCHAIN</p>
      <ol>
        <li><span>CASO</span> Helados Boreal — evidencia del hallazgo</li>
        <li><span>EVIDENCIA</span> ${escapeHtml((finding?.evidenceIds ?? []).join(' + ') || 'Selecciona un hallazgo')}</li>
        <li><span>HALLAZGO</span> ${escapeHtml(finding?.title || 'Pendiente')}</li>
        <li><span>MARCO</span> ${escapeHtml(framework || 'Pendiente')}</li>
        <li><span>ANÁLISIS</span> ${escapeHtml(analysis || 'Pendiente')}</li>
        <li><span>DOCUMENTO</span> ${escapeHtml(documentTarget || 'Sección correspondiente')}</li>
      </ol>
    </aside>
  `;
}

export function MultiFrameworkView({ finding, govern }) {
  if (!finding) {
    return `<p>Selecciona un hallazgo para verlo desde ITIL, COBIT e ISO 27001.</p>`;
  }
  const usage = findingUsage(govern, finding.findingId);
  const itil = (govern.itil ?? []).filter((item) => item.findingId === finding.findingId);
  const cobit = (govern.cobit ?? []).filter((item) => item.findingId === finding.findingId);
  const iso = (govern.iso27001 ?? []).filter((item) => item.findingId === finding.findingId);
  return `
    <section class="multi-framework">
      <h3>Un mismo hallazgo, varias perspectivas</h3>
      <p>No se exigen siempre los tres. Construye los que sean pertinentes.</p>
      <article class="panel">
        <p class="evidence-card__kicker">HALLAZGO</p>
        <h4>${escapeHtml(finding.title)}</h4>
        <p>${escapeHtml(finding.description)}</p>
      </article>
      <div class="multi-grid">
        <article class="framework-intro framework-itil">
          <h4>ITIL ${usage.itil ? '✓' : ''}</h4>
          <p>¿Cómo gestionar mejor el cambio / el servicio / el evento?</p>
          ${itil.map((item) => `<p>${escapeHtml(item.practiceLabel)}: ${escapeHtml(item.action)}</p>`).join('') || '<p>Pendiente</p>'}
          <a class="btn btn--small btn--ghost-dark" href="#/gobernar/3" data-nav="/gobernar/3">Construir ITIL</a>
        </article>
        <article class="framework-intro framework-cobit">
          <h4>COBIT ${usage.cobit ? '✓' : ''}</h4>
          <p>¿Quién debe definir y controlar el proceso de aprobación?</p>
          ${cobit.map((item) => `<p>${escapeHtml(item.decision)}</p>`).join('') || '<p>Pendiente</p>'}
          <a class="btn btn--small btn--ghost-dark" href="#/gobernar/4" data-nav="/gobernar/4">Construir COBIT</a>
        </article>
        <article class="framework-intro framework-iso">
          <h4>ISO 27001 ${usage.iso ? '✓' : ''}</h4>
          <p>¿Qué riesgo introduce un cambio no controlado sobre información y disponibilidad?</p>
          ${iso.map((item) => `<p>${escapeHtml(item.asset)} → ${escapeHtml(item.control)}</p>`).join('') || '<p>Pendiente cuando sea pertinente</p>'}
          <a class="btn btn--small btn--ghost-dark" href="#/gobernar/5" data-nav="/gobernar/5">Construir ISO</a>
        </article>
      </div>
    </section>
  `;
}

export function AnalysisStatus({ item }) {
  return `<span class="status-pill status-${escapeHtml(item.status)}">${escapeHtml(GOVERN_STATUS_LABEL[item.status] || item.status)}</span>`;
}

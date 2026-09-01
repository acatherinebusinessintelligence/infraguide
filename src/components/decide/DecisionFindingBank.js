import { escapeHtml } from '../../utils/escape.js';
import { categoryLabel, criticalityLabel } from '../../state/diagnoseModel.js';
import { frameworksFor, relatedConstraintsForFinding } from '../../state/decideModel.js';
import { MIN_RECOMMENDATIONS } from '../../data/methodology/decide.js';
import { baseEvidenceCatalog } from '../../data/methodology/diagnose.js';

function evidenceLabel(id) {
  return baseEvidenceCatalog.find((item) => item.id === id)?.datum ?? id;
}

export function DecisionFindingBank({ findings = [], decide, state, showSelect = true }) {
  const cards = findings
    .map((item) => {
      const selected = decide.selectedFindingId === item.findingId || decide.draft.findingIds.includes(item.findingId);
      const usage = frameworksFor(state, item.findingId);
      const covered = decide.coverage?.byFinding?.[item.findingId];
      const related = relatedConstraintsForFinding(state, item.findingId);
      return `
        <article class="gov-finding-card${selected ? ' is-selected' : ''}">
          <button class="gov-finding-card__head" type="button" data-action="select-decide-finding" data-finding-id="${escapeHtml(item.findingId)}">
            <p class="evidence-card__kicker">HALLAZGO</p>
            <h4>${escapeHtml(item.title)}</h4>
          </button>
          <p>Categoría: ${escapeHtml(categoryLabel(item.category))} · Criticidad: ${escapeHtml(criticalityLabel(item.criticality))}</p>
          <p><strong>Evidencia:</strong> ${escapeHtml((item.evidenceIds ?? []).map(evidenceLabel).join(' · ') || '—')}</p>
          <p><strong>Impacto:</strong> ${escapeHtml(item.impact)}</p>
          <p class="usage-line">Marcos: ITIL ${usage.itil ? '✓' : '—'} · COBIT ${usage.cobit ? '✓' : '—'} · ISO ${usage.iso ? '✓' : '—'}</p>
          <p class="usage-line">Restricciones relacionadas: ${related.length ? escapeHtml(related.map((entry) => entry.label).join('; ')) : 'Se revisan al decidir.'}</p>
          <p class="usage-line">Recomendación: ${covered ? '✓' : '—'}</p>
          ${
            showSelect
              ? `<button class="btn btn--small btn--ghost-dark" type="button" data-action="toggle-rec-finding" data-finding-id="${escapeHtml(item.findingId)}">${decide.draft.findingIds.includes(item.findingId) ? 'Quitar de esta decisión' : 'Asociar a esta decisión'}</button>`
              : ''
          }
        </article>
      `;
    })
    .join('');
  return `
    <section class="gov-finding-bank" aria-labelledby="dec-bank-title">
      <h3 id="dec-bank-title">Banco de hallazgos para decidir</h3>
      <p>No empieces por la tecnología. Parte del problema sustentado.</p>
      <div class="gov-finding-grid">${cards || '<p>Cierra DIAGNOSTICAR primero.</p>'}</div>
    </section>
  `;
}

export function SelectedProblem({ finding, decide }) {
  if (!finding) return `<p>Selecciona un hallazgo. Sin findingId la recomendación queda NO SUSTENTADA.</p>`;
  const evidences = (finding.evidenceIds ?? [])
    .map((id) => {
      const checked = decide.draft.evidenceIds.includes(id);
      return `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-dec-evidence" data-evidence-id="${escapeHtml(id)}" ${checked ? 'checked' : ''} />
          ${escapeHtml(evidenceLabel(id))}
        </label>
      `;
    })
    .join('');
  return `
    <section class="panel">
      <p class="evidence-card__kicker">PROBLEMA</p>
      <h3>${escapeHtml(finding.title)}</h3>
      <p>${escapeHtml(finding.description)}</p>
      <p><strong>EVIDENCIAS</strong> (elige las que sustentan esta decisión)</p>
      <div class="chip-grid">${evidences}</div>
      <p><strong>IMPACTO original:</strong> ${escapeHtml(finding.impact)}</p>
      <p>Criticidad: ${escapeHtml(criticalityLabel(finding.criticality))}</p>
      <label>
        Impacto para esta decisión (se conserva el original)
        <textarea rows="2" data-draft="draft.impact" data-scope="decide">${escapeHtml(decide.draft.impact)}</textarea>
      </label>
    </section>
  `;
}

export function ConstraintReview({ constraints = [], draft }) {
  const items = constraints
    .map((item) => {
      const value = draft.constraintReviews?.[item.id] || '';
      return `
        <article class="constraint-card">
          <h4>${escapeHtml(item.label)}</h4>
          ${item.impact ? `<p>${escapeHtml(item.impact)}</p>` : ''}
          ${item.documented ? '' : '<p class="consultant-tip">Disponible en el caso; documentada en COMPRENDER si ya la agregaste.</p>'}
          <fieldset>
            <legend class="sr-only">¿Afecta ${escapeHtml(item.label)}?</legend>
            <label class="chip-option">
              <input type="radio" name="cr-${escapeHtml(item.id)}" data-action="constraint-review" data-constraint-id="${escapeHtml(item.id)}" value="affects" ${value === 'affects' ? 'checked' : ''} />
              Afecta esta decisión
            </label>
            <label class="chip-option">
              <input type="radio" name="cr-${escapeHtml(item.id)}" data-action="constraint-review" data-constraint-id="${escapeHtml(item.id)}" value="not-direct" ${value === 'not-direct' ? 'checked' : ''} />
              Esta restricción no afecta directamente esta decisión
            </label>
          </fieldset>
        </article>
      `;
    })
    .join('');
  const pending = constraints.filter((item) => !draft.constraintReviews?.[item.id]).length;
  return `
    <section class="constraint-review">
      <h3>Revisar restricciones</h3>
      <p>Debes revisarlas todas antes de decidir. Puedes declarar que no afectan, pero no omitirlas.</p>
      ${items}
      <p role="status" aria-live="polite">${pending ? `Pendientes de revisar: ${pending}` : 'Restricciones revisadas.'}</p>
    </section>
  `;
}

export function RecommendationCoverage({ findings = [], coverage, completion }) {
  const list = findings
    .map((item) => `<li class="${coverage.byFinding?.[item.findingId] ? 'is-done' : ''}"><span>${escapeHtml(item.title)}</span> <strong>${coverage.byFinding?.[item.findingId] ? '✓' : '—'}</strong></li>`)
    .join('');
  return `
    <aside class="coverage-panel">
      <h3>Cobertura de recomendaciones</h3>
      <p>Recomendaciones: ${coverage.recommendations} / mínimo ${MIN_RECOMMENDATIONS}. Una decisión puede cubrir varios hallazgos.</p>
      <ul class="review-list">${list}</ul>
      <p>Estrategia ${completion.strategyOk ? 'COMPLETO' : 'PENDIENTE'} · CAPEX/OPEX ${completion.capexOk ? 'COMPLETO' : 'PENDIENTE'} · Recomendaciones ${completion.recsDoc ? 'COMPLETO' : 'PENDIENTE'}</p>
    </aside>
  `;
}

export function DecisionChain({ finding, decision = '', metric = '', alternatives = [] }) {
  return `
    <aside class="evidence-chain" aria-label="Cadena extremo a extremo">
      <p class="evidence-chain__kicker">CASO → DATO → HALLAZGO → DECISIÓN → MÉTRICA</p>
      <ol>
        <li><span>CASO</span> Helados Boreal</li>
        <li><span>DATO / MÉTRICA / INCIDENTE</span> ${escapeHtml((finding?.evidenceIds ?? []).map(evidenceLabel).join(' + ') || '—')}</li>
        <li><span>HALLAZGO</span> ${escapeHtml(finding?.title || 'Pendiente')}</li>
        <li><span>ALTERNATIVAS</span> ${escapeHtml(alternatives.map((item) => item.title).join(' / ') || 'Pendiente')}</li>
        <li><span>DECISIÓN</span> ${escapeHtml(decision || 'Pendiente')}</li>
        <li><span>RECOMENDACIÓN</span> ${escapeHtml(decision || 'Pendiente')}</li>
        <li><span>MÉTRICA DE ÉXITO</span> ${escapeHtml(metric || 'Pendiente')}</li>
      </ol>
    </aside>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import { getConcept } from '../../data/pedagogy/concepts.js';
import { TermLink } from '../../data/pedagogy/glossary.js';
import { getEvidenceForField } from '../../data/evidence/index.js';
import { getSelectedCaseData } from '../../state/appState.js';

export function ConceptExplanationCard({ conceptId, open = true }) {
  const concept = getConcept(conceptId);
  if (!concept) return '';
  const bodyId = `concept-${escapeHtml(conceptId)}`;
  const caseData = getSelectedCaseData();
  const dataRows = (concept.variables ?? [])
    .map((variable) => {
      const evidence = variable.key ? getEvidenceForField(caseData, variable.key) : null;
      const where = evidence
        ? `${evidence.section || 'Documento fuente'}${evidence.page != null ? `, página ${evidence.page}` : ''}`
        : 'No hay vínculo de evidencia para esta variable.';
      return `<li><strong>${escapeHtml(variable.name)}</strong> (${escapeHtml(variable.symbol || '')}${variable.unit ? `, ${escapeHtml(variable.unit)}` : ''}) — ${escapeHtml(where)}${variable.calculated ? ' · calculado, no literal del PDF' : ''}</li>`;
    })
    .join('');
  const example = (concept.workedExample ?? [])
    .map((item) => `<p><strong>${escapeHtml(item.heading)}</strong> ${escapeHtml(item.body)}</p>`)
    .join('');
  return `
    <section class="concept-card" aria-labelledby="${bodyId}-title">
      <div class="concept-card__head">
        <h3 id="${bodyId}-title">¿Qué es ${escapeHtml(concept.name)}?</h3>
        <button
          class="btn btn--small"
          type="button"
          data-action="toggle-concept"
          data-metric-id="${escapeHtml(conceptId)}"
          aria-expanded="${open ? 'true' : 'false'}"
          aria-controls="${bodyId}"
        >${open ? 'Ocultar explicación' : '¿Qué es?'}</button>
      </div>
      <div id="${bodyId}" ${open ? '' : 'hidden'}>
        <dl class="concept-dl">
          <div><dt>¿Qué es?</dt><dd>${escapeHtml(concept.what)}</dd></div>
          <div><dt>¿Para qué sirve?</dt><dd>${escapeHtml(concept.whatFor)}</dd></div>
          <div><dt>¿Por qué se analiza?</dt><dd>${escapeHtml(concept.why)}</dd></div>
          <div><dt>Pregunta que responde</dt><dd>${escapeHtml(concept.question || '')}</dd></div>
          <div><dt>Unidad</dt><dd>${escapeHtml(concept.unit || 'No aplica una única unidad')}</dd></div>
          <div><dt>¿Qué datos necesita y dónde están?</dt><dd>${dataRows ? `<ul>${dataRows}</ul>` : 'No hay variables calculables con los datos disponibles.'}</dd></div>
          ${
            concept.formula && concept.calculable !== false
              ? `<div><dt>¿Cómo se calcula?</dt><dd><p class="formula-body" aria-label="${escapeHtml(concept.formulaPlain || concept.formula)}">${escapeHtml(concept.formula)}</p><p>${escapeHtml(concept.formulaPlain || '')}</p></dd></div>`
              : `<div><dt>¿Cómo se calcula?</dt><dd>${escapeHtml(concept.insufficientReason || 'No hay fórmula aplicable con los datos disponibles. No se inventa un resultado.')}</dd></div>`
          }
          <div><dt>¿Cómo se interpreta?</dt><dd>${escapeHtml(concept.interpretation)}</dd></div>
          <div><dt>¿Qué decisión puede generar?</dt><dd>${escapeHtml(concept.possibleDecision)} InfraGuide no decide por ti.</dd></div>
          <div><dt>Error común</dt><dd class="concept-warn">${escapeHtml(concept.commonError)}</dd></div>
          <div><dt>Limitación</dt><dd>${escapeHtml(concept.limitation || concept.insufficientReason || 'Declarar el alcance del cálculo.')}</dd></div>
        </dl>
        ${
          example
            ? `<details class="worked-example"><summary>Ver ejemplo resuelto (no lo copies como tu análisis)</summary>${example}</details>`
            : ''
        }
        ${
          concept.guidingQuestions?.length
            ? `<section class="guide-questions"><h4>Preguntas orientadoras</h4><ul>${concept.guidingQuestions.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul></section>`
            : ''
        }
        <p class="concept-terms">Relacionado: ${TermLink({ termId: relatedTerm(conceptId) })}</p>
      </div>
    </section>
  `;
}

function relatedTerm(conceptId) {
  const map = {
    availability: 'disponibilidad',
    mttr: 'mttr',
    mtbf: 'mtbf',
    mttd: 'mttd',
    storage: 'capacidad',
    'storage-threshold': 'capacidad',
    capacity: 'capacidad',
    performance: 'rendimiento',
    rto: 'rto',
    rpo: 'rpo',
    capex: 'capex',
    opex: 'opex',
    alternatives: 'tobe',
    'risk-score': 'riesgo',
    mfa: 'control',
  };
  return map[conceptId] || 'kpi';
}

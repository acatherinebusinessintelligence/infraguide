import { escapeHtml } from '../../utils/escape.js';
import { TermLink } from '../../data/pedagogy/glossary.js';
import { ConceptExplanationCard } from './ConceptExplanationCard.js';

export function ContextualHelp({
  termId = 'kpi',
  why = '',
  where = '',
  usedFor = '',
  documentTarget = '',
} = {}) {
  return `
    <details class="contextual-help">
      <summary>¿Qué significa y para qué lo necesito?</summary>
      <dl class="concept-dl">
        <div><dt>¿Qué significa?</dt><dd>${TermLink({ termId })}</dd></div>
        <div><dt>¿Para qué sirve?</dt><dd>${escapeHtml(usedFor || 'Sustentar el análisis con evidencia del caso.')}</dd></div>
        <div><dt>¿Por qué lo necesito?</dt><dd>${escapeHtml(why || 'Sin este dato la afirmación queda sin origen.')}</dd></div>
        <div><dt>¿Dónde está en el PDF?</dt><dd>${escapeHtml(where || 'Usa el enlace de evidencia de este dato.')}</dd></div>
        <div><dt>¿Cómo se utilizará?</dt><dd>${escapeHtml(usedFor || 'En el cálculo, el hallazgo o la decisión correspondiente.')}</dd></div>
        <div><dt>¿En qué parte del documento aparecerá?</dt><dd>${escapeHtml(documentTarget || 'En la sección de consultoría que alimente esta evidencia.')}</dd></div>
      </dl>
    </details>
  `;
}

export function CalculationDemo({ conceptId = 'availability' }) {
  return `
    <details class="contextual-help calculation-demo">
      <summary>Ver demostración del cálculo · ${escapeHtml(conceptId)}</summary>
      <p class="pedagogy-feedback pedagogy-feedback--info" role="status">Esta es una demostración pedagógica. Para calcular con los datos recolectados debes completar REPRESENTAR. No se guarda como trabajo del estudiante.</p>
      ${ConceptExplanationCard({ conceptId, open: true })}
    </details>
  `;
}

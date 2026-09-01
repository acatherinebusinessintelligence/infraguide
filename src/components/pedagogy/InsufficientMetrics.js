import { escapeHtml } from '../../utils/escape.js';
import { pedagogyConcepts } from '../../data/pedagogy/concepts.js';
import { FEEDBACK_STATUS } from '../../data/pedagogy/index.js';
import { ConceptExplanationCard } from './ConceptExplanationCard.js';

const EXTRA_IDS = [
  'downtime',
  'incident-count',
  'storage-threshold',
  'mfa',
  'mttd',
  'rto',
  'rpo',
  'backup-success',
  'patching',
  'risk-score',
  'alternatives',
  'capex',
  'opex',
  'tco',
];

export function InsufficientMetricsPanel({ notice, measure = {} }) {
  const cards = pedagogyConcepts
    .filter((item) => EXTRA_IDS.includes(item.id))
    .map((item) => {
      const blocked = item.calculable === false;
      const open = measure[item.id]?.conceptOpen === true;
      return `
        <article class="insufficient-card">
          <h4>${escapeHtml(item.name)}</h4>
          ${
            blocked
              ? `<p class="pedagogy-feedback pedagogy-feedback--info" role="status"><strong>${FEEDBACK_STATUS.INSUFFICIENT}.</strong> ${escapeHtml(item.insufficientReason || 'No hay fórmula aplicable.')}</p>
                 <button class="btn btn--small" type="button" data-action="mark-insufficient" data-concept-id="${escapeHtml(item.id)}">Registrar que no se puede calcular</button>`
              : '<p>Se calcula con datos del caso. Ábrelo en su calculadora o en el umbral de ejercicio de almacenamiento.</p>'
          }
          ${ConceptExplanationCard({ conceptId: item.id, open })}
        </article>
      `;
    })
    .join('');
  return `
    <section class="stack">
      <h2>Indicadores que se explican aunque no siempre se calculen</h2>
      <p>Si faltan datos, no se muestra una fórmula resuelta ni se inventa el resultado.</p>
      ${
        notice?.message
          ? `<p class="pedagogy-feedback pedagogy-feedback--info" role="status"><strong>${escapeHtml(notice.status)}.</strong> ${escapeHtml(notice.message)}</p>`
          : ''
      }
      <div class="insufficient-grid">${cards}</div>
    </section>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import { EvidenceLink } from './EvidenceLink.js';
import { formatEsNumber } from '../../utils/numbers.js';
import { getCalculatedMetric } from '../../data/evidence/calculated.js';
import { getEvidenceForField } from '../../data/evidence/registry.js';

export function CalculatedSources({ caseData, metricId, resultLabel, resultValue, open = false }) {
  const metric = getCalculatedMetric(metricId);
  if (!metric) return '';
  const sources = metric.sourceKeys
    .map((key) => getEvidenceForField(caseData, key))
    .filter(Boolean)
    .map(
      (item, index) => `
        <li>
          <p><strong>Dato ${index + 1}:</strong> ${escapeHtml(item.label)}</p>
          <p>Valor: ${escapeHtml(item.value)}</p>
          <p>Página: ${item.page != null ? escapeHtml(String(item.page)) : 'pendiente de verificar en el PDF original'}</p>
          ${EvidenceLink({ caseData, fieldKey: item.fieldKey, component: 'calculator', activity: metricId })}
        </li>
      `,
    )
    .join('');

  return `
    <section class="calculated-box">
      <p class="calculated-kicker">Resultado calculado</p>
      <p class="calculated-result">${escapeHtml(resultLabel || metric.label)} = ${escapeHtml(resultValue || '—')}</p>
      <p class="consultant-tip">Este resultado no aparece literalmente en el PDF. Se obtiene al procesar datos fuente.</p>
      <details class="calculated-details"${open ? ' open' : ''}>
        <summary class="evidence-link">Ver datos utilizados en el cálculo</summary>
        <ul class="calculated-sources">${sources}</ul>
        <p><strong>Fórmula aplicada:</strong> ${escapeHtml(metric.formula)}</p>
      </details>
    </section>
  `;
}

export function formatMetricResult(value, suffix = '') {
  if (value == null || Number.isNaN(Number(value))) return '—';
  return `${formatEsNumber(Number(value), 2)}${suffix}`;
}

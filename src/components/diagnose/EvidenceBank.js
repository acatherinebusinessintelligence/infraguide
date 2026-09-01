import { escapeHtml } from '../../utils/escape.js';
import { evidenceFilters } from '../../data/methodology/diagnose.js';
import { EvidenceLink } from '../evidence/EvidenceLink.js';
import { CalculatedSources } from '../evidence/CalculatedSources.js';
import { getSelectedCaseData } from '../../state/appState.js';
import { diagnoseFieldKeys, diagnoseCalculatedMap } from '../../data/evidence/calculated.js';

export function EvidenceBank({ bank = [], filter = 'all', selectedIds = [], showSelect = false }) {
  const filtered = filter === 'all' ? bank : bank.filter((item) => item.filters.includes(filter));
  const chips = evidenceFilters
    .map(
      (item) => `
        <button
          class="filter-chip${filter === item.id ? ' is-active' : ''}"
          type="button"
          data-action="diagnose-filter"
          data-filter="${escapeHtml(item.id)}"
          aria-pressed="${filter === item.id ? 'true' : 'false'}"
        >
          ${escapeHtml(item.label)}
        </button>
      `,
    )
    .join('');

  const cards = filtered.map((item) => EvidenceCard({ item, selected: selectedIds.includes(item.id), showSelect })).join('');

  return `
    <section class="evidence-bank" aria-labelledby="evidence-bank-title">
      <div class="section-heading">
        <h3 id="evidence-bank-title">Banco de evidencias</h3>
        <p>Dato ≠ hallazgo. Aquí solo hay evidencias rastreadas al caso o a etapas anteriores.</p>
      </div>
      <div class="filter-row" role="toolbar" aria-label="Filtrar evidencias">${chips}</div>
      <div class="evidence-grid" role="list">${cards || '<p>No hay evidencias en este filtro.</p>'}</div>
    </section>
  `;
}

export function EvidenceCard({ item, selected = false, showSelect = false }) {
  const caseData = getSelectedCaseData();
  const fieldKey = diagnoseFieldKeys[item.id];
  const calcId = diagnoseCalculatedMap[item.id];
  return `
    <article class="evidence-card${selected ? ' is-selected' : ''}" role="listitem">
      <p class="evidence-card__kicker">EVIDENCIA</p>
      <p class="evidence-card__datum"><strong>Dato:</strong> ${escapeHtml(item.datum)}</p>
      <p><strong>Interpretación previa:</strong> ${escapeHtml(item.interpretation)}</p>
      <p><strong>Fuente:</strong> ${escapeHtml(item.source)}</p>
      <p><strong>Sección del caso:</strong> ${escapeHtml(item.sourceSectionId)}</p>
      ${
        calcId
          ? CalculatedSources({ caseData, metricId: calcId, resultLabel: item.datum.split('—')[0], resultValue: '' })
          : fieldKey
            ? EvidenceLink({ caseData, fieldKey, sourceSectionId: item.sourceSectionId, component: 'diagnose-bank' })
            : EvidenceLink({ caseData, sourceSectionId: item.sourceSectionId, extraLabel: item.datum, component: 'diagnose-bank' })
      }
      <p><strong>Generada en:</strong> ${escapeHtml(item.stage)}</p>
      <p><strong>Se puede utilizar en:</strong> ${escapeHtml(item.usableIn)}</p>
      ${item.missing ? '<p class="consultant-tip">Ausencia de información — también es evidencia utilizable.</p>' : ''}
      <div class="evidence-card__actions">
        ${
          showSelect
            ? `
              <button
                class="btn btn--small${selected ? ' btn--primary' : ' btn--ghost-dark'}"
                type="button"
                data-action="toggle-finding-evidence"
                data-evidence-id="${escapeHtml(item.id)}"
                aria-pressed="${selected ? 'true' : 'false'}"
              >
                ${selected ? 'Quitar' : 'Usar en hallazgo'}
              </button>
            `
            : ''
        }
        <button
          class="btn btn--small btn--ghost-dark"
          type="button"
          data-action="touch-evidence"
          data-evidence-id="${escapeHtml(item.id)}"
        >
          Marcar evidencia como actualizada
        </button>
      </div>
    </article>
  `;
}

export function EvidenceChain({ evidences = [], finding = '', impact = '' }) {
  const data = evidences.length
    ? evidences.map((item) => escapeHtml(item.datum)).join(' + ')
    : 'Selecciona evidencias';
  const source = evidences[0]?.source || 'Caso';
  return `
    <aside class="evidence-chain" aria-label="Cadena de evidencia">
      <p class="evidence-chain__kicker">EVIDENCECHAIN</p>
      <ol>
        <li><span>CASO</span> ${escapeHtml(source)}</li>
        <li><span>DATO</span> ${data}</li>
        <li><span>MÉTRICA / INCIDENTE</span> ${evidences.map((item) => escapeHtml(item.stage)).filter(Boolean).join(' · ') || '—'}</li>
        <li><span>HALLAZGO</span> ${escapeHtml(finding || 'Pendiente de redactar')}</li>
        <li><span>IMPACTO</span> ${escapeHtml(impact || 'Pendiente')}</li>
      </ol>
    </aside>
  `;
}

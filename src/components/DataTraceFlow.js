import { appCopy } from '../data/copy.js';
import { dataMap, getAnalysisLabel, DATA_STATUS, DATA_STATUS_LABEL } from '../data/methodology/data-map.js';
import { documentSections } from '../data/document/sections.js';
import { getCaseField, getCaseSection, formatFieldValue } from '../data/cases/index.js';
import { EvidenceLink } from './evidence/EvidenceLink.js';
import { TraceabilityChain } from './evidence/CaseDocumentIntro.js';
import { escapeHtml } from '../utils/escape.js';

export function DataTraceFlow({ caseData, dataKey, methodologyStatus = {} }) {
  if (!caseData || !dataKey) {
    return '';
  }

  const located = getCaseField(caseData, dataKey);
  const meta = dataMap[dataKey];
  if (!located || !meta) {
    return '';
  }

  const section = getCaseSection(caseData, located.section.sectionId);
  const uses = (meta.usedIn ?? []).map(getAnalysisLabel).join(', ');
  const doc = documentSections.find((item) => item.id === meta.documentSectionId);
  const status = methodologyStatus[dataKey] ?? DATA_STATUS.FOUND;

  return `
    <aside class="trace-flow" aria-label="${escapeHtml(appCopy.caseWork.traceTitle)}">
      ${TraceabilityChain({
        items: [
          { label: 'PDF', value: 'Documento fuente' },
          { label: 'Evidencia', value: section?.sectionTitle || '' },
          { label: 'Dato extraído', value: `${located.field.label} = ${formatFieldValue(located.field)}` },
          { label: 'Uso', value: uses || 'Identificación' },
          { label: 'Documento', value: doc ? `Sección ${meta.documentSectionId} - ${doc.title}` : 'Informe' },
        ],
      })}
      <div class="trace-flow__step">
        <p class="trace-flow__label">${escapeHtml(appCopy.caseWork.caseLabel)}</p>
        <p class="trace-flow__value">${escapeHtml(section?.sectionTitle ?? '')}</p>
      </div>
      <p class="trace-flow__arrow" aria-hidden="true">↓</p>
      <div class="trace-flow__step">
        <p class="trace-flow__label">${escapeHtml(appCopy.caseWork.datumLabel)}</p>
        <p class="trace-flow__value">${escapeHtml(located.field.label)} = ${escapeHtml(formatFieldValue(located.field))}</p>
        ${EvidenceLink({ caseData, fieldKey: dataKey, component: 'trace-flow' })}
      </div>
      <p class="trace-flow__arrow" aria-hidden="true">↓</p>
      <div class="trace-flow__step">
        <p class="trace-flow__label">${escapeHtml(appCopy.caseWork.futureUseLabel)}</p>
        <p class="trace-flow__value">${escapeHtml(uses)}</p>
      </div>
      <p class="trace-flow__arrow" aria-hidden="true">↓</p>
      <div class="trace-flow__step">
        <p class="trace-flow__label">${escapeHtml(appCopy.caseWork.documentLabel)}</p>
        <p class="trace-flow__value">Sección ${meta.documentSectionId} - ${escapeHtml(doc?.title ?? '')}</p>
      </div>
      <p class="trace-flow__status">${escapeHtml(DATA_STATUS_LABEL[status] ?? status)}</p>
    </aside>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import {
  getEvidenceForField,
  getEvidenceById,
  getPrimarySourceDocument,
  resolveEvidenceStatus,
  EVIDENCE_STATUS,
  EVIDENCE_STATUS_LABEL,
  EVIDENCE_ORIGIN,
} from '../../data/evidence/index.js';

function pageLabel(evidence) {
  if (evidence?.origin === EVIDENCE_ORIGIN.CALCULATED) {
    return evidence.page
      ? `resultado calculado (datos fuente en página ${evidence.page})`
      : 'resultado calculado';
  }
  const status = resolveEvidenceStatus(evidence);
  if (status === EVIDENCE_STATUS.VERIFIED && evidence.page) {
    return `página ${evidence.page}`;
  }
  if (evidence?.page) {
    return `página ${evidence.page} (pendiente de verificar)`;
  }
  return 'página pendiente de verificar';
}

export function EvidenceLink({
  caseData,
  fieldKey = null,
  evidenceId = null,
  sourceSectionId = null,
  component = '',
  activity = '',
  extraLabel = '',
}) {
  const evidence =
    (evidenceId ? getEvidenceById(caseData, evidenceId) : null) ||
    (fieldKey ? getEvidenceForField(caseData, fieldKey) : null);
  const doc = getPrimarySourceDocument(caseData);
  const caseName = caseData?.name || 'el caso';
  const label = extraLabel || evidence?.label || 'este dato';
  const pageText = pageLabel(evidence);
  const status = resolveEvidenceStatus(evidence);
  const text = `Ver evidencia en el caso — ${pageText}`;
  const aria = `Abrir evidencia de ${label} en el caso ${caseName}. ${pageText}. El vínculo abre el documento fuente.`;

  return `
    <a
      class="evidence-link"
      href="#/caso/documento"
      data-action="open-evidence"
      data-field-key="${escapeHtml(fieldKey || evidence?.fieldKey || '')}"
      data-evidence-id="${escapeHtml(evidenceId || evidence?.evidenceId || '')}"
      data-section-id="${escapeHtml(sourceSectionId || evidence?.sourceSectionId || '')}"
      data-component="${escapeHtml(component)}"
      data-activity="${escapeHtml(activity)}"
      aria-label="${escapeHtml(aria)}"
    >${escapeHtml(text)}</a>
    <span class="evidence-status evidence-status--${escapeHtml(status)}">${escapeHtml(EVIDENCE_STATUS_LABEL[status] || status)}</span>
    ${
      doc?.linked === false
        ? '<span class="visually-hidden">El PDF original aún no ha sido contrastado.</span>'
        : ''
    }
  `;
}

export function EvidenceStatusChip({ status }) {
  return `<span class="evidence-status evidence-status--${escapeHtml(status)}">${escapeHtml(EVIDENCE_STATUS_LABEL[status] || status)}</span>`;
}

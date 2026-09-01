import { assetUrl, pdfPageHref } from '../../utils/assetUrl.js';
import { getPrimarySourceDocument } from './registry.js';
import { resolveEvidenceStatus, EVIDENCE_STATUS, EVIDENCE_ORIGIN } from './status.js';

export function formatAcademicCitation(caseData, evidence) {
  const doc = getPrimarySourceDocument(caseData);
  const caseName = caseData?.name || 'el caso';
  const section = evidence?.section || evidence?.sourceSectionId || '';
  const status = resolveEvidenceStatus(evidence);

  if (evidence?.origin === EVIDENCE_ORIGIN.CALCULATED) {
    return `Resultado calculado en InfraGuide a partir de datos del caso ${caseName}. No aparece literalmente en el PDF.`;
  }

  if (status === EVIDENCE_STATUS.VERIFIED && evidence?.page) {
    const part = section ? `, sección “${section}”` : '';
    return `Fuente: Caso ${caseName}, página ${evidence.page}${part}.`;
  }

  if (section) {
    return `Fuente: Caso ${caseName}, sección “${section}” del JSON estructurado. Página en el PDF original pendiente de verificar.`;
  }

  return `Fuente: Caso ${caseName}. Ubicación en el PDF original pendiente de verificar.`;
}

export function academicPdfHref(caseData, evidence) {
  const doc = getPrimarySourceDocument(caseData);
  if (!doc?.file) return '';
  const page = resolveEvidenceStatus(evidence) === EVIDENCE_STATUS.VERIFIED ? evidence.page : null;
  return pdfPageHref(doc.file, page);
}

export function sourcePdfUrl(caseData) {
  const doc = getPrimarySourceDocument(caseData);
  return doc?.file ? assetUrl(doc.file) : '';
}

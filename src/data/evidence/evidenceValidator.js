import { listCaseFields } from '../cases/index.js';
import { assetUrl } from '../../utils/assetUrl.js';
import {
  buildEvidenceRegistry,
  getPrimarySourceDocument,
  getSourceDocuments,
  getSourceDocumentById,
} from './registry.js';
import { calculatedMetrics } from './calculated.js';
import { EVIDENCE_ORIGIN, resolveEvidenceStatus, EVIDENCE_STATUS } from './status.js';

export function EvidenceValidator(caseData) {
  const errors = [];
  const warnings = [];
  const docs = getSourceDocuments(caseData);

  if (!docs.length) {
    errors.push('Falta sourceDocuments.');
  }

  docs.forEach((doc) => {
    if (!doc?.id) errors.push('Un sourceDocument no tiene id.');
    if (!doc?.file) errors.push(`sourceDocument ${doc?.id || '(sin id)'} no tiene file.`);
    if (doc?.pages != null && (!Number.isFinite(Number(doc.pages)) || Number(doc.pages) < 1)) {
      errors.push(`pages inválido en ${doc.id}.`);
    }
  });

  const registry = buildEvidenceRegistry(caseData);
  const ids = registry.map((item) => item.evidenceId);
  const dupes = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (dupes.length) {
    errors.push(`evidenceId duplicado: ${[...new Set(dupes)].join(', ')}.`);
  }

  const sectionIds = new Set((caseData?.sections ?? []).map((item) => item.sectionId));
  const pageCount = getPrimarySourceDocument(caseData)?.pages;

  registry.forEach((item) => {
    const doc = getSourceDocumentById(caseData, item.documentId);
    if (!doc) {
      errors.push(`${item.evidenceId}: documentId inválido (${item.documentId}).`);
    }
    if (item.sourceSectionId && !sectionIds.has(item.sourceSectionId)) {
      errors.push(`${item.evidenceId}: sourceSectionId inexistente (${item.sourceSectionId}).`);
    }
    if (item.page != null) {
      const page = Number(item.page);
      if (!Number.isFinite(page) || page < 1) {
        errors.push(`${item.evidenceId}: página inválida.`);
      } else if (pageCount != null && page > Number(pageCount)) {
        errors.push(`${item.evidenceId}: la página ${page} no existe (el documento declara ${pageCount}).`);
      }
    }
    if (item.verified === true && !item.page) {
      errors.push(`${item.evidenceId}: no puede marcarse verificada sin página.`);
    }
    if (item.verified === true && !item.quote && !item.text && !item.extract) {
      warnings.push(`${item.evidenceId}: verificada sin fragmento textual.`);
    }
    if (resolveEvidenceStatus(item) === EVIDENCE_STATUS.VERIFIED && doc?.linked === false) {
      errors.push(`${item.evidenceId}: no marcar verificada mientras el PDF original no esté vinculado.`);
    }
  });

  calculatedMetrics.forEach((metric) => {
    metric.sourceKeys.forEach((key) => {
      const found = listCaseFields(caseData).some((entry) => entry.field.key === key);
      if (!found) {
        errors.push(`${metric.id}: falta el dato fuente “${key}”.`);
      }
    });
  });

  const unverified = registry.filter((item) => item.origin !== EVIDENCE_ORIGIN.CALCULATED && resolveEvidenceStatus(item) !== EVIDENCE_STATUS.VERIFIED);

  return {
    ok: errors.length === 0,
    errors,
    warnings,
    evidenceCount: registry.length,
    verifiedCount: registry.filter((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.VERIFIED).length,
    pendingCount: unverified.length,
    documentLinked: getPrimarySourceDocument(caseData)?.linked === true,
  };
}

export async function probeSourcePdf(caseData) {
  const doc = getPrimarySourceDocument(caseData);
  if (!doc?.file || typeof fetch === 'undefined') {
    return { exists: false, url: '', status: 0 };
  }
  const url = assetUrl(doc.file);
  try {
    const response = await fetch(url, { method: 'HEAD' });
    if (response.ok) {
      return { exists: true, url, status: response.status, placeholder: doc.linked === false };
    }
    const fallback = await fetch(url, { method: 'GET' });
    return {
      exists: fallback.ok,
      url,
      status: fallback.status,
      placeholder: doc.linked === false,
    };
  } catch {
    return { exists: false, url, status: 0, placeholder: doc.linked === false };
  }
}

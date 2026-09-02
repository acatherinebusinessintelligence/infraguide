import { listCaseFields, formatFieldValue, getCaseField } from '../cases/index.js';
import { dataMap } from '../methodology/data-map.js';
import { documentSections } from '../document/sections.js';
import { EVIDENCE_ORIGIN, EVIDENCE_STATUS, resolveEvidenceStatus } from './status.js';
import { calculatedMetrics } from './calculated.js';

export const DEFAULT_DOCUMENT_ID = 'caso-helados-boreal';

export function getSourceDocuments(caseData) {
  const fromCase = Array.isArray(caseData?.sourceDocuments) ? caseData.sourceDocuments : [];
  if (fromCase.length) {
    return fromCase;
  }
  return [];
}

export function getPrimarySourceDocument(caseData) {
  const docs = getSourceDocuments(caseData);
  return docs[0] ?? null;
}

export function getSourceDocumentById(caseData, documentId) {
  return getSourceDocuments(caseData).find((item) => item.id === documentId) ?? getPrimarySourceDocument(caseData);
}

export function evidenceIdForField(sectionId, fieldKey) {
  return `HB-${sectionId}-${fieldKey}`;
}

function usedByForKey(key) {
  const meta = dataMap[key];
  if (!meta) return ['comprensión del caso'];
  const uses = [...(meta.usedIn ?? [])];
  if (meta.documentSectionId) {
    const doc = documentSections.find((item) => item.id === meta.documentSectionId);
    uses.push(doc ? `documento: ${doc.title}` : 'documento final');
  }
  return uses.length ? uses : ['comprensión del caso'];
}

function entryFromField(caseData, located) {
  const { field, section, recordTitle } = located;
  const source = field.source && typeof field.source === 'object' ? field.source : {};
  const documentId = source.documentId || getPrimarySourceDocument(caseData)?.id || DEFAULT_DOCUMENT_ID;
  const page = Number.isFinite(Number(source.page)) ? Number(source.page) : null;
  const quote = typeof source.quote === 'string' ? source.quote : typeof source.extract === 'string' ? source.extract : '';
  const verified = source.verified === true && page != null && quote.length > 0;

  return {
    evidenceId: source.evidenceId || evidenceIdForField(section.sectionId, field.key),
    caseId: caseData.id,
    documentId,
    fieldKey: field.key,
    label: field.label,
    value: formatFieldValue(field),
    rawValue: field.value,
    unit: field.unit || '',
    page,
    section: source.section || section.sectionTitle,
    sourceSectionId: source.sourceSectionId || field.sourceSectionId || section.sectionId,
    text: quote,
    extract: quote,
    quote,
    context: source.context || recordTitle || section.summary || '',
    anchorId: source.anchorId || null,
    coordinates: source.coordinates || null,
    usedBy: source.usedBy || usedByForKey(field.key),
    verified,
    verificationStatus: verified ? EVIDENCE_STATUS.VERIFIED : EVIDENCE_STATUS.PENDING,
    origin: field.origin === EVIDENCE_ORIGIN.CALCULATED || source.origin === EVIDENCE_ORIGIN.CALCULATED
      ? EVIDENCE_ORIGIN.CALCULATED
      : EVIDENCE_ORIGIN.SOURCE,
  };
}

export function buildEvidenceRegistry(caseData) {
  if (!caseData) return [];
  const fromCase = Array.isArray(caseData.evidenceRegistry) ? caseData.evidenceRegistry : [];
  const byId = new Map();

  listCaseFields(caseData).forEach((located) => {
    const entry = entryFromField(caseData, located);
    byId.set(entry.evidenceId, entry);
    byId.set(entry.fieldKey, entry);
  });

  fromCase.forEach((item) => {
    if (!item?.evidenceId) return;
    const current = byId.get(item.evidenceId) || {};
    const merged = { ...current, ...item };
    merged.verificationStatus = resolveEvidenceStatus(merged);
    byId.set(item.evidenceId, merged);
    if (merged.fieldKey) byId.set(merged.fieldKey, merged);
  });

  const seen = new Set();
  const list = [];
  byId.forEach((entry, key) => {
    if (key !== entry.evidenceId) return;
    if (seen.has(entry.evidenceId)) return;
    seen.add(entry.evidenceId);
    list.push({ ...entry, verificationStatus: resolveEvidenceStatus(entry) });
  });
  return list;
}

export function getEvidenceById(caseData, evidenceId) {
  if (!evidenceId) return null;
  return buildEvidenceRegistry(caseData).find((item) => item.evidenceId === evidenceId) ?? null;
}

export function getEvidenceForField(caseData, fieldKey) {
  if (!caseData || !fieldKey) return null;
  const fromRegistry = buildEvidenceRegistry(caseData).find((item) => item.fieldKey === fieldKey);
  if (fromRegistry) return fromRegistry;
  const located = getCaseField(caseData, fieldKey);
  if (!located) return null;
  return entryFromField(caseData, located);
}

export function getEvidenceForSection(caseData, sourceSectionId) {
  return buildEvidenceRegistry(caseData).filter((item) => item.sourceSectionId === sourceSectionId);
}

export function canonicalSourceSections(caseData) {
  const doc = getPrimarySourceDocument(caseData);
  const declared = Array.isArray(doc?.sections) ? doc.sections : [];
  const seen = new Set();
  const unique = [];
  declared.forEach((item) => {
    const page = Number.isFinite(Number(item.page)) ? Number(item.page) : null;
    const title = String(item.title || '').trim();
    const key = page != null ? `p:${page}` : `t:${title.toLowerCase()}`;
    if (!title || seen.has(key)) return;
    seen.add(key);
    unique.push({
      id: item.sourceSectionId || item.id,
      sourceSectionId: item.sourceSectionId || item.id,
      title,
      summary: item.summary || '',
      page,
      verified: item.verified === true && page != null,
    });
  });
  return unique;
}

export function getSourceSection(caseData, sourceSectionId) {
  if (!sourceSectionId) return null;
  const doc = getPrimarySourceDocument(caseData);
  const match = (doc?.sections ?? []).find((item) => (item.sourceSectionId || item.id) === sourceSectionId);
  if (!match) {
    return canonicalSourceSections(caseData).find((item) => item.sourceSectionId === sourceSectionId) ?? null;
  }
  const page = Number.isFinite(Number(match.page)) ? Number(match.page) : null;
  return {
    id: match.sourceSectionId || match.id,
    sourceSectionId: match.sourceSectionId || match.id,
    title: match.title,
    page,
    verified: match.verified === true && page != null,
  };
}

export function caseMapSections(caseData) {
  return canonicalSourceSections(caseData);
}

export function getCalculatedSourceBundle(caseData, metricId) {
  const metric = calculatedMetrics.find((item) => item.id === metricId);
  if (!metric) return null;
  return {
    ...metric,
    origin: EVIDENCE_ORIGIN.CALCULATED,
    sources: metric.sourceKeys.map((key) => getEvidenceForField(caseData, key)).filter(Boolean),
  };
}

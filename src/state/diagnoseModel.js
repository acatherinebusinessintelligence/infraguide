import {
  FINDING_STATUS,
  baseEvidenceCatalog,
  findingCategories,
  criticalityLevels,
  avoidPhrases,
  solutionStarts,
  weakPatterns,
} from '../data/methodology/diagnose.js';
import { isDocumented } from './understandModel.js';

export const MIN_FINDINGS = 8;

export function createFindingDraft() {
  return {
    step: 1,
    findingId: null,
    evidenceIds: [],
    observation: null,
    title: '',
    description: '',
    starter: '',
    category: '',
    impact: '',
    impactCategories: [],
    criticality: '',
    justification: '',
    kind: 'standard',
    warnings: [],
  };
}

export function createDiagnoseState() {
  return {
    currentSubstage: 1,
    currentFilter: 'all',
    expandedFindingId: null,
    sortBy: 'created',
    findings: [],
    evidenceRevisions: {},
    evidenceCoverage: {},
    draft: createFindingDraft(),
    summary: { draft: '', documented: false },
    datoClassifications: {},
    activities: {},
    checkpoint: {},
    completed: false,
  };
}

export function mergeDiagnose(saved) {
  const base = createDiagnoseState();
  if (!saved || typeof saved !== 'object') {
    return base;
  }
  return {
    ...base,
    ...saved,
    findings: Array.isArray(saved.findings) ? saved.findings : [],
    evidenceRevisions: saved.evidenceRevisions && typeof saved.evidenceRevisions === 'object' ? saved.evidenceRevisions : {},
    evidenceCoverage: saved.evidenceCoverage && typeof saved.evidenceCoverage === 'object' ? saved.evidenceCoverage : {},
    draft: { ...base.draft, ...saved.draft, evidenceIds: saved.draft?.evidenceIds ?? [], impactCategories: saved.draft?.impactCategories ?? [] },
    summary: { ...base.summary, ...saved.summary },
    datoClassifications: saved.datoClassifications ?? {},
    activities: saved.activities ?? {},
    checkpoint: saved.checkpoint ?? {},
  };
}

export function evidenceFingerprint(item) {
  return `${item.id}::${item.datum}::${item.interpretation}::${item.revision ?? 1}`;
}

export function buildEvidenceBank(state) {
  const revisions = state.analysis?.diagnose?.evidenceRevisions ?? {};
  const metricEvidence = state.metricEvidence ?? [];
  const metricsDoc = state.documentSections?.metrics?.subsections ?? {};
  const criticalRows = state.documentSections?.criticalServices?.rows ?? [];
  const spofRecords = state.analysis?.represent?.spof?.records ?? {};

  const items = baseEvidenceCatalog
    .filter((item) => {
      if (item.fromMetricEvidence) {
        return metricEvidence.some((entry) => entry.evidenceId === 'metric-capacity-01');
      }
      return true;
    })
    .map((item) => {
      const revision = revisions[item.id]?.revision ?? 1;
      const overlay = overlayFromPriorWork(item, { metricsDoc, criticalRows, spofRecords, metricEvidence });
      const next = { ...item, ...overlay, revision };
      return {
        ...next,
        fingerprint: revisions[item.id]?.fingerprint ?? evidenceFingerprint(next),
      };
    });

  metricEvidence.forEach((entry) => {
    const id = `ev-${entry.evidenceId}`;
    if (items.some((item) => item.id === id || item.id === 'ev-metric-capacity-01')) {
      return;
    }
    const datum = Object.entries(entry.data ?? {})
      .map(([key, value]) => `${key}: ${value}`)
      .join(' · ');
    const card = {
      id,
      filters: ['capacity'],
      datum: datum || entry.evidenceId,
      interpretation: entry.interpretation || 'Evidencia métrica documentada en MEDIR.',
      source: 'Información operacional disponible',
      sourceSectionId: 'operational-data',
      stage: 'MEDIR',
      usableIn: 'Hallazgo de capacidad / rendimiento.',
      revision: revisions[id]?.revision ?? 1,
    };
    items.push({
      ...card,
      fingerprint: revisions[id]?.fingerprint ?? evidenceFingerprint(card),
    });
  });

  return items;
}

function overlayFromPriorWork(item, { metricsDoc, criticalRows, spofRecords, metricEvidence }) {
  if (item.id === 'ev-avail' && metricsDoc.availability?.result) {
    return { datum: `Disponibilidad observada ${metricsDoc.availability.result}.`, interpretation: metricsDoc.availability.interpretation || item.interpretation };
  }
  if (item.id === 'ev-mttr' && metricsDoc.mttr?.result) {
    return { datum: `MTTR ${metricsDoc.mttr.result}.`, interpretation: metricsDoc.mttr.interpretation || item.interpretation };
  }
  if (item.id === 'ev-mtbf' && metricsDoc.mtbf?.result) {
    return { datum: `MTBF estimado ${metricsDoc.mtbf.result}.`, interpretation: metricsDoc.mtbf.interpretation || item.interpretation };
  }
  if (item.id === 'ev-storage-used' && metricsDoc.storage?.result) {
    return { interpretation: metricsDoc.storage.interpretation || item.interpretation };
  }
  if (['ev-wms', 'ev-mes', 'ev-ecom'].includes(item.id) && criticalRows.length) {
    const name = item.id === 'ev-wms' ? 'WMS' : item.id === 'ev-mes' ? 'MES' : 'E-commerce';
    const row = criticalRows.find((entry) => (entry.name || '').toLowerCase().includes(name.toLowerCase()));
    if (row?.justification) {
      return { interpretation: `Servicio crítico documentado: ${row.justification}` };
    }
  }
  if (item.id === 'ev-spof-firewall') {
    const record = Object.values(spofRecords).find((entry) => entry?.componentId === 'firewall' || entry?.status === 'justified');
    if (record?.justification) {
      return { interpretation: `SPOF justificado: ${record.justification}` };
    }
  }
  if (item.id === 'ev-metric-capacity-01') {
    const saved = metricEvidence.find((entry) => entry.evidenceId === 'metric-capacity-01');
    if (saved?.interpretation) {
      return { interpretation: saved.interpretation };
    }
  }
  return {};
}

export function getEvidenceById(state, id) {
  return buildEvidenceBank(state).find((item) => item.id === id) ?? null;
}

export function deriveDraftStatus(draft) {
  if (draft.criticality && draft.justification?.trim() && draft.impact?.trim() && draft.description?.trim() && draft.evidenceIds?.length) {
    return FINDING_STATUS.VALIDATED;
  }
  if (draft.impact?.trim() && draft.impactCategories?.length) {
    return FINDING_STATUS.IMPACT_DEFINED;
  }
  if (draft.description?.trim() && draft.observation) {
    return FINDING_STATUS.INTERPRETED;
  }
  if (draft.evidenceIds?.length) {
    return FINDING_STATUS.EVIDENCE_SELECTED;
  }
  return FINDING_STATUS.DRAFT;
}

export function analyzeFindingText(text = '') {
  const trimmed = text.trim();
  const warnings = [];
  if (!trimmed) {
    return warnings;
  }
  const firstWord = trimmed.split(/\s+/)[0]?.toLowerCase().replace(/[.:]/g, '') ?? '';
  if (solutionStarts.includes(firstWord)) {
    warnings.push({
      type: 'solution',
      message: 'Estás redactando una solución, no un hallazgo.',
    });
  }
  weakPatterns.forEach((rule) => {
    if (rule.test.test(trimmed)) {
      warnings.push({ type: 'weak', message: rule.message });
    }
  });
  if (trimmed.length > 0 && trimmed.length < 28 && !warnings.some((item) => item.type === 'weak')) {
    warnings.push({
      type: 'weak',
      message: 'Este hallazgo es demasiado general. Añade qué ocurre y qué evidencia lo demuestra.',
    });
  }
  avoidPhrases.forEach((phrase) => {
    if (trimmed.toLowerCase().includes(phrase)) {
      warnings.push({
        type: 'certainty',
        message: `Evita “${phrase}…”. Un hallazgo se sustenta; no cierra causa única ni solución.`,
      });
    }
  });
  return warnings;
}

export function findSimilarFinding(findings, draft, ignoreId = null) {
  const selected = new Set(draft.evidenceIds ?? []);
  if (!selected.size || !draft.category) {
    return null;
  }
  return (
    findings.find((finding) => {
      if (finding.findingId === ignoreId) {
        return false;
      }
      if (finding.category !== draft.category) {
        return false;
      }
      const other = new Set(finding.evidenceIds ?? []);
      const overlap = [...selected].filter((id) => other.has(id)).length;
      const similarSet = overlap === selected.size && overlap === other.size;
      const highOverlap = overlap >= 2 && overlap / Math.max(selected.size, other.size) >= 0.7;
      return similarSet || highOverlap;
    }) ?? null
  );
}

export function findingSources(state, evidenceIds = []) {
  const bank = buildEvidenceBank(state);
  return evidenceIds
    .map((id) => bank.find((item) => item.id === id))
    .filter(Boolean)
    .map((item) => ({
      evidenceId: item.id,
      source: item.source,
      sourceSectionId: item.sourceSectionId,
      stage: item.stage,
      datum: item.datum,
    }));
}

export function computeCoverage(findings = []) {
  const coverage = {};
  findingCategories.forEach((category) => {
    coverage[category.id] = findings.some((item) => item.category === category.id);
  });
  return coverage;
}

export function coverageWarning(findings = []) {
  const documented = findings.filter((item) => item.status === FINDING_STATUS.DOCUMENTED || item.status === FINDING_STATUS.VALIDATED || item.status === FINDING_STATUS.REVIEW_REQUIRED);
  if (documented.length < 2) {
    return null;
  }
  const types = new Set(documented.map((item) => item.category).filter(Boolean));
  if (types.size === 1) {
    return 'Todos tus hallazgos provienen del mismo tipo. El diagnóstico gana si cubres más de una dimensión.';
  }
  return null;
}

export function allCriticalWarning(findings = []) {
  const ranked = findings.filter((item) => item.criticality);
  if (ranked.length < 3) {
    return null;
  }
  if (ranked.every((item) => item.criticality === 'critical')) {
    return 'Si todos tus hallazgos son críticos, probablemente no estás priorizando.';
  }
  return null;
}

export function isFindingComplete(finding) {
  const hasEvidence = (finding.evidenceIds ?? []).length > 0;
  const hasSource = (finding.sourceSections ?? []).length > 0 || (finding.sources ?? []).length > 0;
  return Boolean(
    hasEvidence &&
      hasSource &&
      finding.description?.trim() &&
      finding.impact?.trim() &&
      finding.criticality &&
      finding.justification?.trim() &&
      finding.category &&
      finding.status !== FINDING_STATUS.REVIEW_REQUIRED &&
      finding.status !== FINDING_STATUS.DRAFT,
  );
}

export function getDiagnoseCompletion(diagnose, documentSections) {
  const findings = diagnose.findings ?? [];
  const complete = findings.filter(isFindingComplete);
  const documented = isDocumented(documentSections.findings) && !documentSections.findings?.reviewRequired;
  const summaryOk = Boolean(diagnose.summary?.documented && diagnose.summary?.draft?.trim());
  const reviewPending = findings.some((item) => item.status === FINDING_STATUS.REVIEW_REQUIRED);
  const missingSource = findings.some((item) => !(item.sources ?? []).length && !(item.sourceSections ?? []).length);

  return {
    count: findings.length,
    completeCount: complete.length,
    minMet: complete.length >= MIN_FINDINGS,
    documented,
    summaryOk,
    reviewPending,
    missingSource,
    coverage: computeCoverage(complete),
    ready: complete.length >= MIN_FINDINGS && documented && summaryOk && !reviewPending && !missingSource,
  };
}

export function criticalityRank(id) {
  const order = { critical: 0, high: 1, medium: 2, low: 3 };
  return order[id] ?? 9;
}

export function categoryLabel(id) {
  return findingCategories.find((item) => item.id === id)?.label ?? id;
}

export function criticalityLabel(id) {
  return criticalityLevels.find((item) => item.id === id)?.label ?? id;
}

export const FINDING_STATUS_LABEL = {
  DRAFT: 'Borrador',
  EVIDENCE_SELECTED: 'Evidencia seleccionada',
  INTERPRETED: 'Interpretado',
  IMPACT_DEFINED: 'Impacto definido',
  VALIDATED: 'Validado',
  DOCUMENTED: 'Documentado',
  REVIEW_REQUIRED: 'Revisión requerida',
};

export { FINDING_STATUS };

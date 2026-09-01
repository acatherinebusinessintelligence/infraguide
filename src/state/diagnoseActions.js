import { DATA_STATUS } from '../data/methodology/data-map.js';
import { FINDING_STATUS, missingEvidenceMessage, reviewRequiredMessage, summaryTemplate } from '../data/methodology/diagnose.js';
import { nowIso } from './understandModel.js';
import {
  createDiagnoseState,
  createFindingDraft,
  buildEvidenceBank,
  deriveDraftStatus,
  analyzeFindingText,
  findSimilarFinding,
  findingSources,
  computeCoverage,
  getDiagnoseCompletion,
  evidenceFingerprint,
  MIN_FINDINGS,
} from './diagnoseModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';
import { invalidateAnalysesUsingFinding } from './governActions.js';
import { invalidateDecisionsUsingFinding } from './decideActions.js';

function diagnoseFrom(state = getState()) {
  return state.analysis?.diagnose ?? createDiagnoseState();
}

function documentsFrom(state = getState()) {
  return state.documentSections ?? {};
}

export function patchDiagnose(updater) {
  const current = diagnoseFrom();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  const coverage = computeCoverage(next.findings ?? []);
  patchState((prev) => ({
    ...prev,
    analysis: { ...prev.analysis, diagnose: { ...next, evidenceCoverage: coverage } },
  }));
}

export function setDiagnoseSubstage(id) {
  patchDiagnose((current) => ({ ...current, currentSubstage: Number(id) }));
}

export function setDiagnoseFilter(filterId) {
  patchDiagnose((current) => ({ ...current, currentFilter: filterId }));
}

export function setDiagnoseActivity(activityId, optionId) {
  patchDiagnose((current) => ({
    ...current,
    activities: { ...current.activities, [activityId]: optionId },
  }));
}

export function setDiagnoseCheckpoint(activityId, optionId) {
  patchDiagnose((current) => ({
    ...current,
    checkpoint: { ...current.checkpoint, [activityId]: optionId },
  }));
}

export function classifyDatoItem(itemId, value) {
  patchDiagnose((current) => ({
    ...current,
    datoClassifications: { ...current.datoClassifications, [itemId]: value },
  }));
}

export function setDraftField(field, value) {
  patchDiagnose((current) => {
    const draft = { ...current.draft, [field]: value };
    if (field === 'description') {
      draft.warnings = analyzeFindingText(value);
    }
    return { ...current, draft };
  });
}

export function applyFindingStarter(starter) {
  patchDiagnose((current) => {
    const currentText = current.draft.description ?? '';
    const next = currentText.trim() ? currentText : `${starter} `;
    return {
      ...current,
      draft: {
        ...current.draft,
        starter,
        description: next,
        warnings: analyzeFindingText(next),
      },
    };
  });
}

export function setDraftKind(kind) {
  patchDiagnose((current) => ({
    ...current,
    draft: { ...current.draft, kind, category: kind === 'missing' ? 'missing' : current.draft.category },
  }));
}

export function toggleDraftEvidence(evidenceId) {
  patchDiagnose((current) => {
    const selected = current.draft.evidenceIds.includes(evidenceId)
      ? current.draft.evidenceIds.filter((id) => id !== evidenceId)
      : [...current.draft.evidenceIds, evidenceId];
    return { ...current, draft: { ...current.draft, evidenceIds: selected } };
  });
}

export function ensureDraftEvidence(evidenceId) {
  patchDiagnose((current) => {
    if (current.draft.evidenceIds.includes(evidenceId)) {
      return current;
    }
    return { ...current, draft: { ...current.draft, evidenceIds: [...current.draft.evidenceIds, evidenceId] } };
  });
}

export function toggleImpactCategory(categoryId) {
  patchDiagnose((current) => {
    const selected = current.draft.impactCategories.includes(categoryId)
      ? current.draft.impactCategories.filter((id) => id !== categoryId)
      : [...current.draft.impactCategories, categoryId];
    return { ...current, draft: { ...current.draft, impactCategories: selected } };
  });
}

export function setDraftStep(step) {
  patchDiagnose((current) => ({ ...current, draft: { ...current.draft, step: Number(step) } }));
}

export function resetFindingDraft() {
  patchDiagnose((current) => ({ ...current, draft: createFindingDraft() }));
  setState({ documentError: null });
}

export function loadFindingIntoDraft(findingId) {
  const finding = diagnoseFrom().findings.find((item) => item.findingId === findingId);
  if (!finding) {
    return;
  }
  patchDiagnose((current) => ({
    ...current,
    currentSubstage: 3,
    draft: {
      ...createFindingDraft(),
      findingId: finding.findingId,
      evidenceIds: [...(finding.evidenceIds ?? [])],
      observation: finding.observation ?? null,
      title: finding.title ?? '',
      description: finding.description ?? '',
      category: finding.category ?? '',
      impact: finding.impact ?? '',
      impactCategories: [...(finding.impactCategories ?? [])],
      criticality: finding.criticality ?? '',
      justification: finding.justification ?? '',
      kind: finding.kind ?? 'standard',
      warnings: analyzeFindingText(finding.description ?? ''),
      step: 1,
    },
  }));
}

function nextFindingId(findings) {
  return `finding-${String(findings.length + 1).padStart(2, '0')}-${Date.now().toString(36)}`;
}

export function addFindingToMatrix() {
  const state = getState();
  const diagnose = diagnoseFrom(state);
  const draft = diagnose.draft;
  const bank = buildEvidenceBank(state);
  const selected = (draft.evidenceIds ?? []).map((id) => bank.find((item) => item.id === id)).filter(Boolean);

  if (!selected.length) {
    setState({ documentError: missingEvidenceMessage });
    return false;
  }
  if (selected.some((item) => !item.source)) {
    setState({ documentError: missingEvidenceMessage });
    return false;
  }
  if (!draft.description?.trim() || !draft.impact?.trim() || !draft.criticality || !draft.justification?.trim() || !draft.category) {
    setState({
      documentError: 'Completa hallazgo, categoría, impacto, criticidad y justificación antes de agregar.',
    });
    return false;
  }

  const sources = findingSources(state, draft.evidenceIds);
  const fingerprints = {};
  selected.forEach((item) => {
    fingerprints[item.id] = item.fingerprint;
  });

  const findingId = draft.findingId || nextFindingId(diagnose.findings);
  const existing = diagnose.findings.find((item) => item.findingId === findingId);
  const entry = {
    findingId,
    title: draft.title.trim() || draft.description.trim().slice(0, 80),
    description: draft.description.trim(),
    evidenceIds: [...draft.evidenceIds],
    evidenceFingerprints: fingerprints,
    sourceSections: [...new Set(sources.map((item) => item.sourceSectionId))],
    sources: [...new Set(sources.map((item) => item.source))],
    impact: draft.impact.trim(),
    impactCategories: [...draft.impactCategories],
    criticality: draft.criticality,
    justification: draft.justification.trim(),
    category: draft.category,
    kind: draft.kind || 'standard',
    observation: draft.observation,
    status: FINDING_STATUS.DOCUMENTED,
    createdAt: existing?.createdAt ?? nowIso(),
    lastUpdated: nowIso(),
  };

  const similar = findSimilarFinding(
    diagnose.findings,
    draft,
    findingId,
  );

  patchDiagnose((current) => {
    const without = current.findings.filter((item) => item.findingId !== findingId);
    return {
      ...current,
      findings: [...without, entry],
      draft: createFindingDraft(),
    };
  });

  patchState((prev) => {
    const findingsDoc = prev.documentSections?.findings;
    if (findingsDoc?.status === DATA_STATUS.DOCUMENTED) {
      return {
        ...prev,
        documentError: similar
          ? 'Este hallazgo parece similar a uno existente. Revisa si realmente representa un problema diferente.'
          : null,
        documentSections: {
          ...prev.documentSections,
          findings: { ...findingsDoc, reviewRequired: true },
        },
      };
    }
    return {
      ...prev,
      documentError: similar
        ? 'Este hallazgo parece similar a uno existente. Revisa si realmente representa un problema diferente.'
        : null,
      documentSections: {
        ...prev.documentSections,
        findings: findingsDoc?.status
          ? findingsDoc
          : {
              status: 'IN_PROGRESS',
              text: '',
              rows: [],
              lastUpdated: nowIso(),
            },
      },
    };
  });
  if (existing) {
    invalidateAnalysesUsingFinding(findingId);
    invalidateDecisionsUsingFinding(findingId);
  }
  return true;
}

export function expandFinding(findingId) {
  patchDiagnose((current) => ({
    ...current,
    expandedFindingId: current.expandedFindingId === findingId ? null : findingId,
  }));
}

export function setDiagnoseSort(sortBy) {
  patchDiagnose((current) => ({ ...current, sortBy }));
}

export function markEvidenceChanged(evidenceId) {
  const state = getState();
  const item = buildEvidenceBank(state).find((entry) => entry.id === evidenceId);
  if (!item) {
    return;
  }
  const nextRevision = (item.revision ?? 1) + 1;
  const fingerprint = evidenceFingerprint({ ...item, revision: nextRevision, datum: `${item.datum} · actualizado` });

  patchDiagnose((current) => {
    const findings = current.findings.map((finding) => {
      if (!(finding.evidenceIds ?? []).includes(evidenceId)) {
        return finding;
      }
      const changed = [...new Set([...(finding.changedEvidenceIds ?? []), evidenceId])];
      return {
        ...finding,
        status: FINDING_STATUS.REVIEW_REQUIRED,
        changedEvidenceIds: changed,
        lastUpdated: nowIso(),
      };
    });
    return {
      ...current,
      evidenceRevisions: {
        ...current.evidenceRevisions,
        [evidenceId]: { revision: nextRevision, fingerprint, changedAt: nowIso() },
      },
      findings,
    };
  });
  patchState((prev) => ({
    ...prev,
    documentError: reviewRequiredMessage,
    documentSections: prev.documentSections?.findings?.status
      ? {
          ...prev.documentSections,
          findings: { ...prev.documentSections.findings, reviewRequired: true },
        }
      : prev.documentSections,
  }));
}

export function invalidateFindingsUsingEvidence(evidenceId) {
  markEvidenceChanged(evidenceId);
}

export function invalidateFindingsUsingKeys(keys = []) {
  const state = getState();
  const bank = buildEvidenceBank(state);
  const related = bank
    .filter((item) => {
      if (item.id === 'ev-cpu' && keys.includes('appCpuPeak')) return true;
      if (item.id === 'ev-ram' && keys.includes('appRam')) return true;
      if (item.id === 'ev-latency' && keys.includes('appLatencyPeak')) return true;
      if (item.id === 'ev-demand' && keys.includes('appDemandPeak')) return true;
      if (item.id === 'ev-avail' && (keys.includes('observedPeriodHours') || keys.includes('unavailabilityHours'))) return true;
      if (item.id === 'ev-mttr' && (keys.includes('totalRestoreHours') || keys.includes('incidentCount'))) return true;
      if (item.id === 'ev-storage-used' && (keys.includes('nasCapacityTb') || keys.includes('nasUsedTb'))) return true;
      if (item.id === 'ev-growth' && keys.includes('nasGrowthGbMonth')) return true;
      return false;
    })
    .map((item) => item.id);
  related.forEach((id) => markEvidenceChanged(id));
}

export function addFindingsToDocument() {
  const state = getState();
  const diagnose = diagnoseFrom(state);
  const completion = getDiagnoseCompletion(diagnose, documentsFrom(state));
  const summary = diagnose.summary.draft.trim();
  if (diagnose.findings.length < MIN_FINDINGS) {
    setState({ documentError: `Documenta al menos ${MIN_FINDINGS} hallazgos sustentados.` });
    return false;
  }
  if (completion.reviewPending) {
    setState({ documentError: reviewRequiredMessage });
    return false;
  }
  if (diagnose.findings.some((item) => !isFindingReady(item))) {
    setState({ documentError: 'Todos los hallazgos deben tener evidencia, impacto, criticidad justificada y fuente.' });
    return false;
  }
  if (!summary) {
    setState({ documentError: 'Redacta un resumen breve de diagnóstico (1-2 párrafos).' });
    return false;
  }

  const rows = diagnose.findings.map((item) => ({
    findingId: item.findingId,
    name: item.title,
    label: item.title,
    category: item.category,
    justification: item.justification,
    impact: item.impact,
    criticality: item.criticality,
    sources: item.sources,
  }));

  const tableText = diagnose.findings
    .map(
      (item, index) =>
        `${index + 1}. ${item.title} [${item.category}] · Impacto: ${item.impact} · Criticidad: ${item.criticality}. Fuentes: ${(item.sources ?? []).join(', ')}.`,
    )
    .join('\n');

  const entry = {
    status: DATA_STATUS.DOCUMENTED,
    text: `${tableText}\n\nResumen de diagnóstico\n${summary}`,
    rows,
    summary,
    sources: [...new Set(diagnose.findings.flatMap((item) => item.sources ?? []))],
    evidences: diagnose.findings.flatMap((item) => item.evidenceIds ?? []),
    lastUpdated: nowIso(),
    reviewRequired: false,
  };

  patchDiagnose((current) => ({
    ...current,
    summary: { ...current.summary, documented: true },
  }));

  patchState((prev) => ({
    ...prev,
    documentError: null,
    documentViewKey: 'findings',
    documentSections: { ...documentsFrom(prev), findings: entry },
  }));
  return true;
}

function isFindingReady(finding) {
  return Boolean(
    (finding.evidenceIds ?? []).length &&
      (finding.sources ?? []).length &&
      finding.description?.trim() &&
      finding.impact?.trim() &&
      finding.criticality &&
      finding.justification?.trim() &&
      finding.category &&
      finding.status !== FINDING_STATUS.REVIEW_REQUIRED,
  );
}

export function completeDiagnoseStage() {
  const state = getState();
  const diagnose = diagnoseFrom(state);
  const completion = getDiagnoseCompletion(diagnose, documentsFrom(state));
  if (!completion.ready) {
    setState({
      documentError:
        'Se requieren mínimo 8 hallazgos con evidencia, impacto, criticidad justificada y fuente, más matriz y resumen documentados.',
    });
    return false;
  }
  const completedStages = [...new Set([...(state.completedStages ?? []), 5])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 5,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      diagnose: { ...diagnoseFrom(prev), completed: true },
    },
  }));
  return true;
}

export function insertSummaryTemplate() {
  patchDiagnose((current) => ({
    ...current,
    summary: {
      ...current.summary,
      draft: current.summary.draft.trim() ? current.summary.draft : summaryTemplate,
    },
  }));
}

export function getDiagnoseSnapshot(state = getState()) {
  const diagnose = diagnoseFrom(state);
  const bank = buildEvidenceBank(state);
  return {
    diagnose,
    bank,
    documents: documentsFrom(state),
    completion: getDiagnoseCompletion(diagnose, documentsFrom(state)),
    draftStatus: deriveDraftStatus(diagnose.draft),
    similar: findSimilarFinding(diagnose.findings, diagnose.draft, diagnose.draft.findingId),
  };
}

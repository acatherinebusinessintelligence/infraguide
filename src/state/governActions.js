import { DATA_STATUS } from '../data/methodology/data-map.js';
import { GOVERN_STATUS, reviewRequiredMessage, vagueItil, vagueCobit, vagueIso } from '../data/methodology/govern.js';
import { nowIso } from './understandModel.js';
import {
  createGovernState,
  createItilDraft,
  createCobitDraft,
  createIsoDraft,
  documentedFindings,
  computeGovernCoverage,
  analyzeItilDraft,
  analyzeCobitDraft,
  analyzeIsoDraft,
  getGovernCompletion,
  isItilComplete,
  isCobitComplete,
  isIsoComplete,
  findingUsage,
  itilPracticeLabel,
  cobitResponsibleLabel,
  isoAssetLabel,
  isoThreatLabel,
  isoVulnLabel,
  MIN_ITIL,
  MIN_COBIT,
  MIN_ISO,
} from './governModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';
import { rejectIfStageLocked } from './stageGates.js';

function governFrom(state = getState()) {
  return state.analysis?.govern ?? createGovernState();
}

function documentsFrom(state = getState()) {
  return state.documentSections ?? {};
}

export function patchGovern(updater) {
  const current = governFrom();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  const findings = documentedFindings(getState());
  patchState((prev) => ({
    ...prev,
    analysis: {
      ...prev.analysis,
      govern: { ...next, coverage: computeGovernCoverage(next, findings) },
    },
  }));
}

export function setGovernSubstage(id) {
  patchGovern((current) => ({ ...current, currentSubstage: Number(id) }));
}

export function setGovernActivity(activityId, optionId) {
  patchGovern((current) => ({
    ...current,
    activities: { ...current.activities, [activityId]: optionId },
  }));
}

export function setGovernCheckpoint(activityId, optionId) {
  patchGovern((current) => ({
    ...current,
    checkpoint: { ...current.checkpoint, [activityId]: optionId },
  }));
}

export function classifyGovernItem(itemId, value) {
  patchGovern((current) => ({
    ...current,
    classifications: { ...current.classifications, [itemId]: value },
  }));
}

export function selectGovernFinding(findingId) {
  patchGovern((current) => {
    const finding = documentedFindings(getState()).find((item) => item.findingId === findingId);
    const usage = findingUsage(current, findingId);
    return {
      ...current,
      selectedFindingId: findingId,
      perspectives: {
        itil: usage.itil || current.perspectives.itil,
        cobit: usage.cobit || current.perspectives.cobit,
        iso: usage.iso || current.perspectives.iso,
      },
      itilDraft: {
        ...current.itilDraft,
        findingId,
        situation: current.itilDraft.findingId === findingId && current.itilDraft.situation
          ? current.itilDraft.situation
          : finding?.description || finding?.title || '',
      },
      cobitDraft: {
        ...current.cobitDraft,
        findingId,
        problem: current.cobitDraft.findingId === findingId && current.cobitDraft.problem
          ? current.cobitDraft.problem
          : finding?.description || finding?.title || '',
      },
      isoDraft: { ...current.isoDraft, findingId },
    };
  });
}

export function togglePerspective(framework) {
  patchGovern((current) => ({
    ...current,
    perspectives: { ...current.perspectives, [framework]: !current.perspectives[framework] },
  }));
}

export function expandGovernFinding(findingId) {
  patchGovern((current) => ({
    ...current,
    expandedFindingId: current.expandedFindingId === findingId ? null : findingId,
  }));
}

export function expandGovernAnalysis(analysisId) {
  patchGovern((current) => ({
    ...current,
    expandedAnalysisId: current.expandedAnalysisId === analysisId ? null : analysisId,
  }));
}

export function setItilDraftField(field, value) {
  patchGovern((current) => {
    const itilDraft = { ...current.itilDraft, [field]: value };
    const finding = documentedFindings(getState()).find((item) => item.findingId === itilDraft.findingId);
    itilDraft.warnings = analyzeItilDraft(itilDraft, finding);
    return { ...current, itilDraft };
  });
}

export function setCobitDraftField(field, value) {
  patchGovern((current) => {
    const cobitDraft = { ...current.cobitDraft, [field]: value };
    cobitDraft.warnings = analyzeCobitDraft(cobitDraft);
    return { ...current, cobitDraft };
  });
}

export function setIsoDraftField(field, value) {
  patchGovern((current) => {
    const isoDraft = { ...current.isoDraft, [field]: value };
    isoDraft.warnings = analyzeIsoDraft(isoDraft);
    return { ...current, isoDraft };
  });
}

export function toggleCobitResponsible(id) {
  patchGovern((current) => {
    const selected = current.cobitDraft.responsibleIds.includes(id)
      ? current.cobitDraft.responsibleIds.filter((item) => item !== id)
      : [...current.cobitDraft.responsibleIds, id];
    const cobitDraft = { ...current.cobitDraft, responsibleIds: selected };
    cobitDraft.warnings = analyzeCobitDraft(cobitDraft);
    return { ...current, cobitDraft };
  });
}

export function toggleIsoControlType(id) {
  patchGovern((current) => {
    const selected = current.isoDraft.controlTypes.includes(id)
      ? current.isoDraft.controlTypes.filter((item) => item !== id)
      : [...current.isoDraft.controlTypes, id];
    return { ...current, isoDraft: { ...current.isoDraft, controlTypes: selected } };
  });
}

export function setItilStep(step) {
  patchGovern((current) => ({ ...current, itilDraft: { ...current.itilDraft, step: Number(step) } }));
}

export function setCobitStep(step) {
  patchGovern((current) => ({ ...current, cobitDraft: { ...current.cobitDraft, step: Number(step) } }));
}

export function setIsoStep(step) {
  patchGovern((current) => ({ ...current, isoDraft: { ...current.isoDraft, step: Number(step) } }));
}

function sourcesFromFinding(finding) {
  return {
    evidenceIds: [...(finding?.evidenceIds ?? [])],
    sourceSections: [...(finding?.sourceSections ?? [])],
    sources: [...(finding?.sources ?? [])],
  };
}

function nextAnalysisId(prefix, list) {
  return `${prefix}-${String(list.length + 1).padStart(2, '0')}-${Date.now().toString(36)}`;
}

function requireFinding(findingId) {
  const finding = documentedFindings(getState()).find((item) => item.findingId === findingId);
  if (!finding) {
    setState({ documentError: 'Selecciona un hallazgo documentado. GOBERNAR reutiliza DIAGNOSTICAR; no inventa situaciones.' });
    return null;
  }
  if (!(finding.sources ?? []).length && !(finding.sourceSections ?? []).length) {
    setState({ documentError: 'El hallazgo no tiene fuente. No se puede analizar sin trazabilidad.' });
    return null;
  }
  return finding;
}

export function saveItilAnalysis() {
  const state = getState();
  const govern = governFrom(state);
  const draft = govern.itilDraft;
  const finding = requireFinding(draft.findingId);
  if (!finding) return false;
  if (!draft.situation?.trim() || !draft.practice || !draft.action?.trim() || !draft.benefit?.trim()) {
    setState({ documentError: 'ITIL exige situación, práctica, acción y beneficio. No basta con “Aplicar ITIL”.' });
    return false;
  }
  if (vagueItil.test(draft.action) || vagueItil.test(draft.situation)) {
    setState({ documentError: 'ITIL exige situación, práctica, acción y beneficio. No basta con “Aplicar ITIL”.' });
    return false;
  }
  const warnings = analyzeItilDraft(draft, finding);
  const analysisId = draft.analysisId || nextAnalysisId('itil', govern.itil);
  const existing = govern.itil.find((item) => item.analysisId === analysisId);
  const trace = sourcesFromFinding(finding);
  const entry = {
    analysisId,
    findingId: finding.findingId,
    situation: draft.situation.trim(),
    practice: draft.practice,
    practiceLabel: itilPracticeLabel(draft.practice),
    action: draft.action.trim(),
    benefit: draft.benefit.trim(),
    indicator: draft.indicator,
    ...trace,
    status: GOVERN_STATUS.DOCUMENTED,
    warnings,
    createdAt: existing?.createdAt ?? nowIso(),
    lastUpdated: nowIso(),
  };
  patchGovern((current) => ({
    ...current,
    itil: [...current.itil.filter((item) => item.analysisId !== analysisId), entry],
    itilDraft: createItilDraft(),
    selectedFindingId: finding.findingId,
  }));
  markDocDirty('itil');
  setState({ documentError: warnings.find((item) => item.type === 'vague') ? warnings[0].message : null });
  return true;
}

export function saveCobitAnalysis() {
  const govern = governFrom();
  const draft = govern.cobitDraft;
  const finding = requireFinding(draft.findingId);
  if (!finding) return false;
  if (!draft.problem?.trim() || !draft.decision?.trim() || !(draft.responsibleIds ?? []).length || !draft.responsibleJustification?.trim() || !draft.indicator) {
    setState({ documentError: 'COBIT exige problema, decisión de gobierno, responsable justificado e indicador.' });
    return false;
  }
  if (vagueCobit.test(draft.decision) || vagueCobit.test(draft.problem)) {
    setState({ documentError: 'COBIT exige problema, decisión, responsable e indicador. No basta con “COBIT recomienda mejorar”.' });
    return false;
  }
  const warnings = analyzeCobitDraft(draft);
  const analysisId = draft.analysisId || nextAnalysisId('cobit', govern.cobit);
  const existing = govern.cobit.find((item) => item.analysisId === analysisId);
  const entry = {
    analysisId,
    findingId: finding.findingId,
    problem: draft.problem.trim(),
    decision: draft.decision.trim(),
    responsibleIds: [...draft.responsibleIds],
    responsible: draft.responsibleIds.map(cobitResponsibleLabel).join(' + '),
    responsibleJustification: draft.responsibleJustification.trim(),
    indicator: draft.indicator,
    ...sourcesFromFinding(finding),
    status: GOVERN_STATUS.DOCUMENTED,
    warnings,
    createdAt: existing?.createdAt ?? nowIso(),
    lastUpdated: nowIso(),
  };
  patchGovern((current) => ({
    ...current,
    cobit: [...current.cobit.filter((item) => item.analysisId !== analysisId), entry],
    cobitDraft: createCobitDraft(),
    selectedFindingId: finding.findingId,
  }));
  markDocDirty('cobit');
  setState({ documentError: null });
  return true;
}

export function saveIsoAnalysis() {
  const govern = governFrom();
  const draft = govern.isoDraft;
  const finding = requireFinding(draft.findingId);
  if (!finding) return false;
  if (!draft.assetId || !draft.threatId || !draft.vulnerabilityId || !draft.impact?.trim() || !draft.control?.trim()) {
    setState({ documentError: 'ISO 27001 exige activo, amenaza, vulnerabilidad, impacto y control.' });
    return false;
  }
  if (vagueIso.test(draft.control) || vagueIso.test(draft.impact)) {
    setState({ documentError: 'ISO 27001 exige activo, amenaza, vulnerabilidad, impacto y control. No basta con “Riesgo de seguridad”.' });
    return false;
  }
  const warnings = analyzeIsoDraft(draft);
  const analysisId = draft.analysisId || nextAnalysisId('iso', govern.iso27001);
  const existing = govern.iso27001.find((item) => item.analysisId === analysisId);
  const entry = {
    analysisId,
    findingId: finding.findingId,
    assetId: draft.assetId,
    asset: isoAssetLabel(draft.assetId),
    threatId: draft.threatId,
    threat: isoThreatLabel(draft.threatId),
    vulnerabilityId: draft.vulnerabilityId,
    vulnerability: isoVulnLabel(draft.vulnerabilityId),
    impact: draft.impact.trim(),
    control: draft.control.trim(),
    controlTypes: [...(draft.controlTypes ?? [])],
    ...sourcesFromFinding(finding),
    status: GOVERN_STATUS.DOCUMENTED,
    warnings,
    createdAt: existing?.createdAt ?? nowIso(),
    lastUpdated: nowIso(),
  };
  patchGovern((current) => ({
    ...current,
    iso27001: [...current.iso27001.filter((item) => item.analysisId !== analysisId), entry],
    isoDraft: createIsoDraft(),
    selectedFindingId: finding.findingId,
  }));
  markDocDirty('iso27001');
  setState({ documentError: null });
  return true;
}

function markDocDirty(key) {
  patchState((prev) => {
    const current = prev.documentSections?.[key];
    if (current?.status === DATA_STATUS.DOCUMENTED) {
      return {
        ...prev,
        documentSections: {
          ...prev.documentSections,
          [key]: { ...current, reviewRequired: true },
        },
      };
    }
    return {
      ...prev,
      documentSections: {
        ...prev.documentSections,
        [key]: current?.status
          ? current
          : { status: 'IN_PROGRESS', text: '', rows: [], lastUpdated: nowIso() },
      },
    };
  });
}

export function loadItilIntoDraft(analysisId) {
  const item = governFrom().itil.find((entry) => entry.analysisId === analysisId);
  if (!item) return;
  patchGovern((current) => ({
    ...current,
    currentSubstage: 3,
    selectedFindingId: item.findingId,
    itilDraft: {
      ...createItilDraft(),
      analysisId: item.analysisId,
      findingId: item.findingId,
      situation: item.situation,
      practice: item.practice,
      action: item.action,
      benefit: item.benefit,
      indicator: item.indicator ?? '',
      warnings: item.warnings ?? [],
      step: 1,
    },
  }));
}

export function loadCobitIntoDraft(analysisId) {
  const item = governFrom().cobit.find((entry) => entry.analysisId === analysisId);
  if (!item) return;
  patchGovern((current) => ({
    ...current,
    currentSubstage: 4,
    selectedFindingId: item.findingId,
    cobitDraft: {
      ...createCobitDraft(),
      analysisId: item.analysisId,
      findingId: item.findingId,
      problem: item.problem,
      decision: item.decision,
      responsibleIds: [...(item.responsibleIds ?? [])],
      responsibleJustification: item.responsibleJustification,
      indicator: item.indicator,
      warnings: item.warnings ?? [],
      step: 1,
    },
  }));
}

export function loadIsoIntoDraft(analysisId) {
  const item = governFrom().iso27001.find((entry) => entry.analysisId === analysisId);
  if (!item) return;
  patchGovern((current) => ({
    ...current,
    currentSubstage: 5,
    selectedFindingId: item.findingId,
    isoDraft: {
      ...createIsoDraft(),
      analysisId: item.analysisId,
      findingId: item.findingId,
      assetId: item.assetId,
      threatId: item.threatId,
      vulnerabilityId: item.vulnerabilityId,
      impact: item.impact,
      control: item.control,
      controlTypes: [...(item.controlTypes ?? [])],
      warnings: item.warnings ?? [],
      step: 1,
    },
  }));
}

export function invalidateAnalysesUsingFinding(findingId) {
  if (!findingId) return;
  let changed = false;
  patchGovern((current) => {
    const flag = (list) =>
      list.map((item) => {
        if (item.findingId !== findingId || item.status === GOVERN_STATUS.REVIEW_REQUIRED) {
          return item;
        }
        changed = true;
        return { ...item, status: GOVERN_STATUS.REVIEW_REQUIRED, lastUpdated: nowIso() };
      });
    return {
      ...current,
      itil: flag(current.itil),
      cobit: flag(current.cobit),
      iso27001: flag(current.iso27001),
    };
  });
  if (changed) {
    ['itil', 'cobit', 'iso27001'].forEach(markDocDirty);
    setState({ documentError: reviewRequiredMessage });
  }
}

export function addItilToDocument() {
  const govern = governFrom();
  const ready = govern.itil.filter(isItilComplete);
  if (ready.length < MIN_ITIL) {
    setState({ documentError: `Documenta al menos ${MIN_ITIL} situaciones ITIL.` });
    return false;
  }
  const findings = documentedFindings(getState());
  const rows = ready.map((item) => {
    const finding = findings.find((entry) => entry.findingId === item.findingId);
    return {
      name: item.situation,
      practice: item.practiceLabel || itilPracticeLabel(item.practice),
      action: item.action,
      benefit: item.benefit,
      indicator: item.indicator,
      findingId: item.findingId,
      findingTitle: finding?.title,
      sources: item.sources,
      evidences: item.evidenceIds,
    };
  });
  const text = ready
    .map((item, index) => `${index + 1}. ${item.situation} · ${itilPracticeLabel(item.practice)} · ${item.action}`)
    .join('\n');
  return saveGovernSection('itil', {
    title: '11. ITIL',
    text,
    rows,
    sources: [...new Set(ready.flatMap((item) => item.sources ?? []))],
    evidences: ready.flatMap((item) => item.evidenceIds ?? []),
  });
}

export function addCobitToDocument() {
  const govern = governFrom();
  const ready = govern.cobit.filter(isCobitComplete);
  if (ready.length < MIN_COBIT) {
    setState({ documentError: `Documenta al menos ${MIN_COBIT} situaciones COBIT.` });
    return false;
  }
  const rows = ready.map((item) => ({
    name: item.problem,
    decision: item.decision,
    responsible: item.responsible,
    indicator: item.indicator,
    findingId: item.findingId,
    sources: item.sources,
    evidences: item.evidenceIds,
  }));
  const text = ready.map((item, index) => `${index + 1}. ${item.problem} → ${item.decision} (${item.responsible})`).join('\n');
  return saveGovernSection('cobit', {
    title: '12. COBIT',
    text,
    rows,
    sources: [...new Set(ready.flatMap((item) => item.sources ?? []))],
    evidences: ready.flatMap((item) => item.evidenceIds ?? []),
  });
}

export function addIsoToDocument() {
  const govern = governFrom();
  const ready = govern.iso27001.filter(isIsoComplete);
  if (ready.length < MIN_ISO) {
    setState({ documentError: `Documenta al menos ${MIN_ISO} riesgos ISO 27001.` });
    return false;
  }
  const rows = ready.map((item) => ({
    name: item.asset,
    threat: item.threat,
    vulnerability: item.vulnerability,
    impact: item.impact,
    control: item.control,
    findingId: item.findingId,
    sources: item.sources,
    evidences: item.evidenceIds,
  }));
  const text = ready
    .map((item, index) => `${index + 1}. ${item.asset} / ${item.threat} / ${item.vulnerability} → ${item.control}`)
    .join('\n');
  return saveGovernSection('iso27001', {
    title: '13. ISO 27001',
    text,
    rows,
    sources: [...new Set(ready.flatMap((item) => item.sources ?? []))],
    evidences: ready.flatMap((item) => item.evidenceIds ?? []),
  });
}

function saveGovernSection(key, payload) {
  const entry = {
    status: DATA_STATUS.DOCUMENTED,
    text: payload.text,
    rows: payload.rows,
    sources: payload.sources,
    evidences: payload.evidences,
    lastUpdated: nowIso(),
    reviewRequired: false,
  };
  patchState((prev) => ({
    ...prev,
    documentError: null,
    documentViewKey: key,
    documentSections: { ...documentsFrom(prev), [key]: entry },
  }));
  return true;
}

export function completeGovernStage() {
  const state = getState();
  const locked = rejectIfStageLocked(state, 6);
  if (locked) {
    setState({ documentError: locked });
    return false;
  }
  const completion = getGovernCompletion(governFrom(state), documentsFrom(state));
  if (!completion.ready) {
    setState({
      documentError:
        'Se requieren mínimo 4 ITIL, 3 COBIT y 5 ISO 27001, con trazabilidad, sin revisiones pendientes y las tres secciones documentadas.',
    });
    return false;
  }
  const completedStages = [...new Set([...(state.completedStages ?? []), 6])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 6,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      govern: { ...governFrom(prev), completed: true },
    },
  }));
  return true;
}

export function getGovernSnapshot(state = getState()) {
  const govern = governFrom(state);
  const findings = documentedFindings(state);
  return {
    govern,
    findings,
    documents: documentsFrom(state),
    completion: getGovernCompletion(govern, documentsFrom(state)),
    coverage: computeGovernCoverage(govern, findings),
    selected: findings.find((item) => item.findingId === govern.selectedFindingId) ?? null,
  };
}

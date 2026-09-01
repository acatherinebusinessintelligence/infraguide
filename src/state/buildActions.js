import { DATA_STATUS } from '../data/methodology/data-map.js';
import { nowIso } from './understandModel.js';
import {
  createBuildState,
  createConclusionsDraft,
  assembleDocument,
  validateDocument,
  auditTraceability,
  checkConsistency,
  validateNumbers,
  analyzeConclusionsText,
  evaluateQualityChecks,
  documentSummary,
  getBuildCompletion,
  traceabilityNodes,
} from './buildModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';

function buildFrom(state = getState()) {
  return state.analysis?.build ?? createBuildState();
}

export function patchBuild(updater) {
  const current = buildFrom();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  const snapshotState = { ...getState(), analysis: { ...getState().analysis, build: next } };
  const issues = validateDocument(snapshotState);
  const summary = documentSummary(snapshotState);
  patchState((prev) => ({
    ...prev,
    analysis: {
      ...prev.analysis,
      build: {
        ...next,
        issues,
        validation: { summary, issueCount: issues.length },
        readyToExport: summary.readyToExport,
      },
    },
  }));
}

export function setBuildSubstage(id) {
  patchBuild((current) => ({
    ...current,
    currentSubstage: Number(id),
    previewReviewed: Number(id) === 5 ? true : current.previewReviewed,
  }));
}

export function setPreviewMode(mode) {
  patchBuild((current) => ({ ...current, previewMode: mode }));
}

export function setPreviewSection(key) {
  patchBuild((current) => ({ ...current, previewSection: key, currentSubstage: 5, previewReviewed: true }));
}

export function toggleIndexOpen() {
  patchBuild((current) => ({ ...current, indexOpen: !current.indexOpen }));
}

export function expandPreviewRec(id) {
  patchBuild((current) => ({ ...current, expandedRecId: current.expandedRecId === id ? null : id }));
}

export function setBuildActivity(activityId, optionId) {
  patchBuild((current) => ({ ...current, activities: { ...current.activities, [activityId]: optionId } }));
}

export function setBuildCheckpoint(activityId, optionId) {
  patchBuild((current) => ({ ...current, checkpoint: { ...current.checkpoint, [activityId]: optionId } }));
}

export function startSectionEdit(sectionKey) {
  patchBuild((current) => ({ ...current, returnSection: sectionKey, previewSection: sectionKey }));
}

export function clearSectionEdit() {
  const returnSection = buildFrom().returnSection;
  patchBuild((current) => ({
    ...current,
    returnSection: null,
    currentSubstage: 5,
    previewSection: returnSection || current.previewSection,
    previewReviewed: true,
  }));
  return returnSection;
}

export function toggleConclusionChip(field, id) {
  patchBuild((current) => {
    const list = current.conclusions[field] ?? [];
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    const conclusions = { ...current.conclusions, [field]: next };
    conclusions.warnings = analyzeConclusionsText(conclusions.draft);
    return { ...current, conclusions };
  });
}

export function setConclusionField(field, value) {
  patchBuild((current) => {
    const conclusions = { ...current.conclusions, [field]: value };
    if (field === 'draft') conclusions.warnings = analyzeConclusionsText(value);
    return { ...current, conclusions };
  });
}

export function markPreviewReviewed() {
  patchBuild((current) => ({ ...current, previewReviewed: true, currentSubstage: 5 }));
}

export function addConclusionsToDocument() {
  const state = getState();
  const build = buildFrom(state);
  const c = build.conclusions;
  const warnings = analyzeConclusionsText(c.draft);
  if ((c.selectedFindings ?? []).length < 3 || (c.selectedFindings ?? []).length > 5) {
    setState({ documentError: 'Selecciona 3 a 5 hallazgos principales.' });
    return false;
  }
  if ((c.selectedStrengths ?? []).length < 2 || (c.selectedStrengths ?? []).length > 3) {
    setState({ documentError: 'Selecciona 2 o 3 fortalezas o capacidades existentes. No se agregan solas.' });
    return false;
  }
  if (!(c.constraintIds ?? []).length) {
    setState({ documentError: 'Selecciona las restricciones que condicionan las decisiones.' });
    return false;
  }
  if (!(c.priorities ?? []).length) {
    setState({ documentError: 'Selecciona prioridades estratégicas a partir de las recomendaciones.' });
    return false;
  }
  if (!(c.limitations ?? []).length && !c.limitationText?.trim()) {
    setState({ documentError: 'Identifica limitaciones de información. Declararlas es fortaleza metodológica.' });
    return false;
  }
  if (!c.draft?.trim() || c.draft.trim().length < 280) {
    setState({ documentError: 'Redacta la conclusión (orientación: 3–5 párrafos). No se llena sola.' });
    return false;
  }
  if (warnings.some((item) => item.type === 'vague')) {
    setState({ documentError: warnings.find((item) => item.type === 'vague').message });
    return false;
  }

  const findings = (state.analysis?.diagnose?.findings ?? []).filter((item) => c.selectedFindings.includes(item.findingId));
  const entry = {
    status: DATA_STATUS.DOCUMENTED,
    text: c.draft.trim(),
    selectedFindings: [...c.selectedFindings],
    selectedStrengths: [...c.selectedStrengths],
    constraints: [...c.constraintIds],
    priorities: [...c.priorities],
    limitations: [...c.limitations, c.limitationText.trim()].filter(Boolean),
    sources: [...new Set(findings.flatMap((item) => item.sources ?? []))],
    evidences: findings.flatMap((item) => item.evidenceIds ?? []),
    lastUpdated: nowIso(),
    reviewRequired: false,
  };
  patchBuild((current) => ({ ...current, conclusions: { ...current.conclusions, warnings } }));
  patchState((prev) => ({
    ...prev,
    documentError: warnings.length ? warnings[0].message : null,
    documentViewKey: 'conclusions',
    documentSections: { ...prev.documentSections, conclusions: entry },
  }));
  return true;
}

export function completeBuildStage() {
  const state = getState();
  const completion = getBuildCompletion(state);
  if (!completion.ready) {
    setState({
      documentError:
        'CONSTRUIR se cierra con 14 secciones, conclusiones, vista previa revisada, 0 errores y 0 revisiones pendientes. No se exporta todavía.',
    });
    return false;
  }
  const completedStages = [...new Set([...(state.completedStages ?? []), 8])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 8,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      build: { ...buildFrom(prev), completed: true, readyToExport: true, previewReviewed: true },
    },
  }));
  return true;
}

export function getBuildSnapshot(state = getState()) {
  const build = buildFrom(state);
  const assembled = assembleDocument(state);
  const issues = validateDocument(state);
  const summary = documentSummary({ ...state, analysis: { ...state.analysis, build } });
  return {
    build,
    assembled,
    issues,
    summary,
    audit: auditTraceability(state),
    consistency: checkConsistency(state),
    numbers: validateNumbers(state),
    quality: evaluateQualityChecks(state),
    completion: getBuildCompletion({ ...state, analysis: { ...state.analysis, build } }),
    chain: traceabilityNodes(state),
    documents: state.documentSections ?? {},
    conclusionsDraft: build.conclusions ?? createConclusionsDraft(),
  };
}

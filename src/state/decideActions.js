import { DATA_STATUS } from '../data/methodology/data-map.js';
import { DECISION_STATUS, reviewRequiredMessage, MIN_ALTERNATIVES, MIN_RECOMMENDATIONS } from '../data/methodology/decide.js';
import { nowIso } from './understandModel.js';
import {
  createDecideState,
  createDecisionDraft,
  documentedFindings,
  availableConstraints,
  constraintsReviewed,
  analyzeDecisionDraft,
  qualityOf,
  isRecommendationComplete,
  computeDecideCoverage,
  getDecideCompletion,
  QUALITY_STATUS,
} from './decideModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';

function decideFrom(state = getState()) {
  return state.analysis?.decide ?? createDecideState();
}

function documentsFrom(state = getState()) {
  return state.documentSections ?? {};
}

export function patchDecide(updater) {
  const current = decideFrom();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  const findings = documentedFindings(getState());
  patchState((prev) => ({
    ...prev,
    analysis: {
      ...prev.analysis,
      decide: { ...next, coverage: computeDecideCoverage(next, findings) },
    },
  }));
}

export function setDecideSubstage(id) {
  patchDecide((current) => ({ ...current, currentSubstage: Number(id), draft: { ...current.draft, step: Number(id) } }));
}

export function setDecideActivity(activityId, optionId) {
  patchDecide((current) => ({ ...current, activities: { ...current.activities, [activityId]: optionId } }));
}

export function setDecideCheckpoint(activityId, optionId) {
  patchDecide((current) => ({ ...current, checkpoint: { ...current.checkpoint, [activityId]: optionId } }));
}

export function classifyDecideItem(itemId, value) {
  patchDecide((current) => ({ ...current, classifications: { ...current.classifications, [itemId]: value } }));
}

export function selectDecideFinding(findingId, append = false) {
  const finding = documentedFindings(getState()).find((item) => item.findingId === findingId);
  if (!finding) {
    setState({ documentError: 'Selecciona un hallazgo documentado. DECIDIR no inventa problemas.' });
    return;
  }
  patchDecide((current) => {
    const findingIds = append
      ? current.draft.findingIds.includes(findingId)
        ? current.draft.findingIds
        : [...current.draft.findingIds, findingId]
      : [findingId];
    const evidenceIds = append ? current.draft.evidenceIds : [...(finding.evidenceIds ?? [])];
    return {
      ...current,
      selectedFindingId: findingId,
      draft: {
        ...current.draft,
        findingIds,
        evidenceIds,
        impact: append && current.draft.impact ? current.draft.impact : finding.impact || '',
        originalImpact: finding.impact || '',
        warnings: analyzeDecisionDraft({ ...current.draft, findingIds, evidenceIds }),
      },
    };
  });
  setState({ documentError: null });
}

export function toggleDraftFinding(findingId) {
  const finding = documentedFindings(getState()).find((item) => item.findingId === findingId);
  if (!finding) return;
  patchDecide((current) => {
    const has = current.draft.findingIds.includes(findingId);
    const findingIds = has ? current.draft.findingIds.filter((id) => id !== findingId) : [...current.draft.findingIds, findingId];
    if (!findingIds.length) {
      setState({ documentError: 'Esta recomendación no está asociada a un hallazgo del diagnóstico.' });
    }
    return { ...current, draft: { ...current.draft, findingIds, warnings: analyzeDecisionDraft({ ...current.draft, findingIds }) } };
  });
}

export function toggleDraftEvidence(evidenceId) {
  patchDecide((current) => {
    const evidenceIds = current.draft.evidenceIds.includes(evidenceId)
      ? current.draft.evidenceIds.filter((id) => id !== evidenceId)
      : [...current.draft.evidenceIds, evidenceId];
    return { ...current, draft: { ...current.draft, evidenceIds } };
  });
}

export function setDraftField(field, value) {
  patchDecide((current) => {
    const draft = { ...current.draft, [field]: value };
    draft.warnings = analyzeDecisionDraft(draft);
    return { ...current, draft };
  });
}

export function setConstraintReview(constraintId, value) {
  patchDecide((current) => {
    const constraintReviews = { ...current.draft.constraintReviews, [constraintId]: value };
    return { ...current, draft: { ...current.draft, constraintReviews } };
  });
}

export function addAlternative(type, title, description) {
  if (!title?.trim()) {
    setState({ documentError: 'Describe la alternativa. No basta con el tipo.' });
    return false;
  }
  patchDecide((current) => {
    const item = {
      id: `alt-${Date.now().toString(36)}`,
      type,
      title: title.trim(),
      description: (description || '').trim(),
    };
    const alternatives = [...current.draft.alternatives, item];
    const draft = { ...current.draft, alternatives, warnings: analyzeDecisionDraft({ ...current.draft, alternatives }) };
    return {
      ...current,
      alternatives: [...current.alternatives, item],
      draft,
    };
  });
  setState({ documentError: null });
  return true;
}

export function removeAlternative(id) {
  patchDecide((current) => {
    const alternatives = current.draft.alternatives.filter((item) => item.id !== id);
    return { ...current, draft: { ...current.draft, alternatives, selectedAlternativeId: current.draft.selectedAlternativeId === id ? '' : current.draft.selectedAlternativeId } };
  });
}

export function setTechField(model, field, value) {
  patchDecide((current) => ({
    ...current,
    draft: { ...current.draft, tech: { ...current.draft.tech, [model]: { ...current.draft.tech[model], [field]: value } } },
  }));
}

export function setTechRating(model, criterion, value) {
  patchDecide((current) => ({
    ...current,
    draft: {
      ...current.draft,
      tech: {
        ...current.draft.tech,
        [model]: {
          ...current.draft.tech[model],
          ratings: { ...current.draft.tech[model].ratings, [criterion]: value },
        },
      },
    },
  }));
}

export function toggleChip(field, id) {
  patchDecide((current) => {
    const list = current.draft[field] ?? [];
    const next = list.includes(id) ? list.filter((item) => item !== id) : [...list, id];
    const draft = { ...current.draft, [field]: next };
    draft.warnings = analyzeDecisionDraft(draft);
    return { ...current, draft };
  });
}

export function expandDecideFinding(id) {
  patchDecide((current) => ({ ...current, expandedFindingId: current.expandedFindingId === id ? null : id }));
}

export function expandRecommendation(id) {
  patchDecide((current) => ({ ...current, expandedRecId: current.expandedRecId === id ? null : id }));
}

function nextId(prefix, list) {
  return `${prefix}-${String(list.length + 1).padStart(2, '0')}-${Date.now().toString(36)}`;
}

export function saveRecommendation() {
  const state = getState();
  const decide = decideFrom(state);
  const draft = decide.draft;
  const warnings = analyzeDecisionDraft(draft);
  const constraints = availableConstraints(state);

  if (!draft.findingIds.length) {
    setState({ documentError: 'Esta recomendación no está asociada a un hallazgo del diagnóstico.' });
    return false;
  }
  if (!constraintsReviewed(draft, constraints)) {
    setState({ documentError: 'Revisa todas las restricciones disponibles. Puedes indicar que no afectan directamente, pero debes revisarlas.' });
    return false;
  }
  if ((draft.alternatives ?? []).length < MIN_ALTERNATIVES && !(draft.simpleOperational && draft.simpleJustification?.trim())) {
    setState({ documentError: `Analiza al menos ${MIN_ALTERNATIVES} alternativas, salvo una acción operativa concreta y sencilla justificada.` });
    return false;
  }
  if (!draft.decision?.trim() || !draft.justification?.trim()) {
    setState({ documentError: 'Define la decisión y justifica por qué es más pertinente que las otras.' });
    return false;
  }
  if (warnings.some((item) => item.type === 'fashion')) {
    setState({ documentError: warnings.find((item) => item.type === 'fashion').message });
    return false;
  }
  if (!(draft.benefitText?.trim() || draft.benefits.length)) {
    setState({ documentError: 'Define un beneficio concreto. No uses solo “mejorar infraestructura”.' });
    return false;
  }
  if (!(draft.riskText?.trim() || draft.risks.length || (draft.residualLow && draft.residualJustification?.trim()))) {
    setState({ documentError: 'Revisa el riesgo introducido o justifica un riesgo residual bajo.' });
    return false;
  }
  if (!draft.costModel || !draft.costJustification?.trim()) {
    setState({ documentError: 'Clasifica CAPEX, OPEX o mixto y justifica el modelo de costo.' });
    return false;
  }
  if (!(draft.metricIds.length || draft.metricText?.trim())) {
    setState({ documentError: '¿Cómo comprobarás que la decisión funcionó?' });
    return false;
  }
  if (!draft.priority || !draft.priorityJustification?.trim()) {
    setState({ documentError: 'Asigna prioridad y justifícala.' });
    return false;
  }

  const findings = documentedFindings(state).filter((item) => draft.findingIds.includes(item.findingId));
  const sources = [...new Set(findings.flatMap((item) => item.sources ?? []))];
  const decisionId = draft.decisionId || nextId('dec', decide.decisions);
  const existing = decide.recommendations.find((item) => item.decisionId === decisionId);
  const entry = {
    decisionId,
    recommendationId: decisionId,
    findingIds: [...draft.findingIds],
    evidenceIds: [...draft.evidenceIds],
    title: draft.decision.trim().slice(0, 90),
    problem: findings.map((item) => item.title).join(' · '),
    impact: draft.impact.trim(),
    originalImpact: draft.originalImpact,
    constraintReviews: { ...draft.constraintReviews },
    alternatives: [...draft.alternatives],
    simpleOperational: draft.simpleOperational,
    simpleJustification: draft.simpleJustification,
    tech: draft.tech,
    selectedAlternativeId: draft.selectedAlternativeId,
    decision: draft.decision.trim(),
    justification: draft.justification.trim(),
    benefits: [...draft.benefits],
    benefitText: draft.benefitText.trim(),
    risks: [...draft.risks],
    riskText: draft.riskText.trim(),
    residualLow: draft.residualLow,
    residualJustification: draft.residualJustification.trim(),
    costModel: draft.costModel,
    costJustification: draft.costJustification.trim(),
    metricIds: [...draft.metricIds],
    metricText: draft.metricText.trim(),
    metricTarget: draft.targetUndefined ? 'Objetivo por definir con negocio/SLA.' : draft.metricTarget.trim(),
    targetUndefined: draft.targetUndefined,
    impactEffort: draft.impactEffort,
    priority: draft.priority,
    priorityJustification: draft.priorityJustification.trim(),
    sources,
    sourceSections: [...new Set(findings.flatMap((item) => item.sourceSections ?? []))],
    quality: qualityOf({ ...draft, findingIds: draft.findingIds }),
    status: DECISION_STATUS.DOCUMENTED,
    createdAt: existing?.createdAt ?? nowIso(),
    lastUpdated: nowIso(),
  };
  entry.quality = qualityOf(entry);

  patchDecide((current) => ({
    ...current,
    decisions: [...current.decisions.filter((item) => item.decisionId !== decisionId), entry],
    recommendations: [...current.recommendations.filter((item) => item.decisionId !== decisionId), entry],
    draft: createDecisionDraft(),
  }));
  markDocDirty(['strategy', 'capex', 'recommendations']);
  setState({ documentError: entry.quality === QUALITY_STATUS.PARCIAL ? 'Recomendación guardada como PARCIAL. Completa comparación, justificación o métrica para elevar la calidad.' : null });
  return true;
}

export function loadRecommendationIntoDraft(decisionId) {
  const item = decideFrom().recommendations.find((entry) => entry.decisionId === decisionId);
  if (!item) return;
  patchDecide((current) => ({
    ...current,
    currentSubstage: 2,
    selectedFindingId: item.findingIds[0] ?? null,
    draft: {
      ...createDecisionDraft(),
      ...item,
      step: 2,
      warnings: analyzeDecisionDraft(item),
    },
  }));
}

function markDocDirty(keys) {
  patchState((prev) => {
    const documentSections = { ...prev.documentSections };
    keys.forEach((key) => {
      const current = documentSections[key];
      if (current?.status === DATA_STATUS.DOCUMENTED) {
        documentSections[key] = { ...current, reviewRequired: true };
      } else if (!current?.status) {
        documentSections[key] = { status: 'IN_PROGRESS', text: '', rows: [], lastUpdated: nowIso() };
      }
    });
    return { ...prev, documentSections };
  });
}

export function invalidateDecisionsUsingFinding(findingId) {
  if (!findingId) return;
  let changed = false;
  patchDecide((current) => {
    const flag = (list) =>
      list.map((item) => {
        if (!(item.findingIds ?? []).includes(findingId) || item.status === DECISION_STATUS.REVIEW_REQUIRED) return item;
        changed = true;
        return { ...item, status: DECISION_STATUS.REVIEW_REQUIRED, lastUpdated: nowIso() };
      });
    return { ...current, decisions: flag(current.decisions), recommendations: flag(current.recommendations) };
  });
  if (changed) {
    markDocDirty(['strategy', 'capex', 'recommendations']);
    setState({ documentError: reviewRequiredMessage });
  }
}

export function invalidateDecisionsUsingConstraint(constraintId) {
  if (!constraintId) return;
  let changed = false;
  patchDecide((current) => {
    const flag = (list) =>
      list.map((item) => {
        if (!item.constraintReviews?.[constraintId] || item.status === DECISION_STATUS.REVIEW_REQUIRED) return item;
        changed = true;
        return { ...item, status: DECISION_STATUS.REVIEW_REQUIRED, lastUpdated: nowIso() };
      });
    return { ...current, decisions: flag(current.decisions), recommendations: flag(current.recommendations) };
  });
  if (changed) {
    markDocDirty(['strategy', 'capex', 'recommendations']);
    setState({ documentError: reviewRequiredMessage });
  }
}

export function setStrategyField(field, value) {
  patchDecide((current) => ({ ...current, strategy: { ...current.strategy, [field]: value } }));
}

export function addStrategyToDocument() {
  const decide = decideFrom();
  const s = decide.strategy;
  const parts = [s.keep, s.improve, s.scale, s.redundant, s.cloud, s.edge, s.measure, s.draft].filter((item) => item?.trim());
  if (parts.length < 3) {
    setState({ documentError: 'Redacta una estrategia preliminar: qué se mantiene, qué mejora y al menos otro eje (escala, redundancia, cloud, edge o medición).' });
    return false;
  }
  if (!decide.recommendations.length) {
    setState({ documentError: 'La estrategia se apoya en decisiones documentadas. Guarda recomendaciones primero.' });
    return false;
  }
  const alts = decide.recommendations.flatMap((item) => item.alternatives ?? []).map((item) => `${item.title} (${item.type})`);
  const text = [
    s.draft.trim(),
    s.keep && `Mantener: ${s.keep}`,
    s.improve && `Mejorar: ${s.improve}`,
    s.scale && `Escalar: ${s.scale}`,
    s.redundant && `Redundancia: ${s.redundant}`,
    s.cloud && `Cloud: ${s.cloud}`,
    s.edge && `Edge: ${s.edge}`,
    s.measure && `Medir: ${s.measure}`,
    alts.length ? `Alternativas evaluadas: ${[...new Set(alts)].join('; ')}` : '',
  ]
    .filter(Boolean)
    .join('\n\n');
  patchDecide((current) => ({ ...current, strategy: { ...current.strategy, documented: true } }));
  return saveSection('strategy', {
    text,
    rows: decide.recommendations.map((item) => ({ name: item.decision, findingId: item.findingIds[0] })),
    sources: [...new Set(decide.recommendations.flatMap((item) => item.sources ?? []))],
    evidences: decide.recommendations.flatMap((item) => item.evidenceIds ?? []),
  });
}

export function addCapexToDocument() {
  const recs = decideFrom().recommendations.filter(isRecommendationComplete);
  if (recs.length < MIN_RECOMMENDATIONS) {
    setState({ documentError: `Se requieren mínimo ${MIN_RECOMMENDATIONS} recomendaciones para la tabla CAPEX/OPEX.` });
    return false;
  }
  const rows = recs.map((item) => ({
    name: item.title || item.decision,
    classification: item.costModel,
    justification: item.costJustification,
  }));
  const text = recs.map((item, i) => `${i + 1}. ${item.decision} · ${item.costModel} · ${item.costJustification}`).join('\n');
  return saveSection('capex', {
    text,
    rows,
    sources: [...new Set(recs.flatMap((item) => item.sources ?? []))],
    evidences: recs.flatMap((item) => item.evidenceIds ?? []),
  });
}

export function addRecommendationsToDocument() {
  const recs = decideFrom().recommendations.filter(isRecommendationComplete);
  if (recs.length < MIN_RECOMMENDATIONS) {
    setState({ documentError: `Documenta al menos ${MIN_RECOMMENDATIONS} recomendaciones prioritarias.` });
    return false;
  }
  if (recs.some((item) => !(item.findingIds ?? []).length)) {
    setState({ documentError: 'Hay recomendaciones sin hallazgo (NO SUSTENTADA).' });
    return false;
  }
  const rows = recs.map((item) => ({
    name: item.problem,
    priority: item.priority,
    decision: item.decision,
    benefit: item.benefitText,
    risk: item.riskText || (item.residualLow ? `Residual bajo: ${item.residualJustification}` : ''),
    metric: item.metricText || item.metricIds.join(', '),
    findingIds: item.findingIds,
    sources: item.sources,
  }));
  const text = recs
    .map((item, i) => `${i + 1}. [${item.priority}] ${item.problem} → ${item.decision}. Beneficio: ${item.benefitText}. Métrica: ${item.metricText || item.metricIds.join(', ')}.`)
    .join('\n');
  return saveSection('recommendations', {
    text,
    rows,
    sources: [...new Set(recs.flatMap((item) => item.sources ?? []))],
    evidences: recs.flatMap((item) => item.evidenceIds ?? []),
  });
}

function saveSection(key, payload) {
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

export function completeDecideStage() {
  const state = getState();
  const completion = getDecideCompletion(decideFrom(state), documentsFrom(state));
  if (!completion.ready) {
    setState({
      documentError:
        'Se requieren estrategia, CAPEX/OPEX y mínimo 5 recomendaciones con hallazgo, evidencia, impacto, decisión, beneficio, riesgo, costo, métrica y prioridad, sin revisiones pendientes.',
    });
    return false;
  }
  const completedStages = [...new Set([...(state.completedStages ?? []), 7])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 7,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: { ...prev.analysis, decide: { ...decideFrom(prev), completed: true } },
  }));
  return true;
}

export function getDecideSnapshot(state = getState()) {
  const decide = decideFrom(state);
  const findings = documentedFindings(state);
  const constraints = availableConstraints(state);
  return {
    decide,
    findings,
    constraints,
    documents: documentsFrom(state),
    completion: getDecideCompletion(decide, documentsFrom(state)),
    coverage: computeDecideCoverage(decide, findings),
    selected: findings.find((item) => item.findingId === decide.selectedFindingId) ?? null,
    warnings: analyzeDecisionDraft(decide.draft),
    constraintsReady: constraintsReviewed(decide.draft, constraints),
  };
}

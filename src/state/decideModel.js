import {
  DECISION_STATUS,
  QUALITY_STATUS,
  MIN_RECOMMENDATIONS,
  MIN_ALTERNATIVES,
  fashionPattern,
  vagueBenefitPattern,
  vagueJustificationPattern,
  alternativeTypes,
  successMetrics,
  costModels,
  priorityLevels,
} from '../data/methodology/decide.js';
import { restrictionItems } from '../data/methodology/understand.js';
import { FINDING_STATUS } from '../data/methodology/diagnose.js';
import { findingUsage } from './governModel.js';
import { isDocumented } from './understandModel.js';

export function createDecisionDraft() {
  return {
    step: 1,
    decisionId: null,
    findingIds: [],
    evidenceIds: [],
    impact: '',
    originalImpact: '',
    constraintReviews: {},
    alternatives: [],
    simpleOperational: false,
    simpleJustification: '',
    tech: {
      onprem: { helps: '', notHelps: '', cost: '', dependency: '', skills: '', respects: '', ratings: {} },
      cloud: { elasticity: '', provision: '', variableCost: '', connectivity: '', vendor: '', security: '', operations: '', skills: '', ratings: {} },
      hybrid: { local: '', remote: '', why: '', ratings: {} },
      edge: { localNeed: '', connectivity: '', latency: '', distributed: '', ratings: {} },
    },
    selectedAlternativeId: '',
    decision: '',
    justification: '',
    benefits: [],
    benefitText: '',
    risks: [],
    riskText: '',
    residualLow: false,
    residualJustification: '',
    costModel: '',
    costJustification: '',
    metricIds: [],
    metricText: '',
    metricTarget: '',
    targetUndefined: false,
    impactEffort: '',
    priority: '',
    priorityJustification: '',
    warnings: [],
  };
}

export function createStrategyState() {
  return {
    keep: '',
    improve: '',
    scale: '',
    redundant: '',
    cloud: '',
    edge: '',
    measure: '',
    draft: '',
    documented: false,
  };
}

export function createDecideState() {
  return {
    currentSubstage: 1,
    selectedFindingId: null,
    expandedFindingId: null,
    expandedRecId: null,
    draft: createDecisionDraft(),
    alternatives: [],
    decisions: [],
    recommendations: [],
    strategy: createStrategyState(),
    capexOpex: {},
    coverage: {},
    classifications: {},
    activities: {},
    checkpoint: {},
    completed: false,
  };
}

export function mergeDecide(saved) {
  const base = createDecideState();
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    draft: mergeDraft(base.draft, saved.draft),
    alternatives: Array.isArray(saved.alternatives) ? saved.alternatives : [],
    decisions: Array.isArray(saved.decisions) ? saved.decisions : [],
    recommendations: Array.isArray(saved.recommendations) ? saved.recommendations : [],
    strategy: { ...base.strategy, ...saved.strategy },
    capexOpex: saved.capexOpex && typeof saved.capexOpex === 'object' ? saved.capexOpex : {},
    coverage: saved.coverage && typeof saved.coverage === 'object' ? saved.coverage : {},
    classifications: saved.classifications ?? {},
    activities: saved.activities ?? {},
    checkpoint: saved.checkpoint ?? {},
  };
}

function mergeDraft(base, saved) {
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    findingIds: saved.findingIds ?? [],
    evidenceIds: saved.evidenceIds ?? [],
    constraintReviews: saved.constraintReviews ?? {},
    alternatives: Array.isArray(saved.alternatives) ? saved.alternatives : [],
    benefits: saved.benefits ?? [],
    risks: saved.risks ?? [],
    metricIds: saved.metricIds ?? [],
    tech: {
      onprem: { ...base.tech.onprem, ...saved.tech?.onprem, ratings: saved.tech?.onprem?.ratings ?? {} },
      cloud: { ...base.tech.cloud, ...saved.tech?.cloud, ratings: saved.tech?.cloud?.ratings ?? {} },
      hybrid: { ...base.tech.hybrid, ...saved.tech?.hybrid, ratings: saved.tech?.hybrid?.ratings ?? {} },
      edge: { ...base.tech.edge, ...saved.tech?.edge, ratings: saved.tech?.edge?.ratings ?? {} },
    },
  };
}

export function documentedFindings(state) {
  return (state.analysis?.diagnose?.findings ?? []).filter(
    (item) =>
      item?.findingId &&
      (item.status === FINDING_STATUS.DOCUMENTED ||
        item.status === FINDING_STATUS.VALIDATED ||
        item.status === FINDING_STATUS.REVIEW_REQUIRED),
  );
}

export function availableConstraints(state) {
  const rows = state.documentSections?.constraints?.rows ?? [];
  if (rows.length) {
    return rows.map((row) => ({
      id: row.id,
      label: row.label,
      impact: row.impact || '',
      documented: true,
    }));
  }
  return restrictionItems.map((item) => ({
    id: item.id,
    label: item.label,
    impact: item.suggestedImpact,
    documented: false,
  }));
}

export function constraintsReviewed(draft, constraints) {
  if (!constraints.length) return false;
  return constraints.every((item) => Boolean(draft.constraintReviews?.[item.id]));
}

export function alternativeTypeLabel(id) {
  return alternativeTypes.find((item) => item.id === id)?.label ?? id;
}

export function analyzeDecisionDraft(draft) {
  const warnings = [];
  const blob = `${draft.decision || ''} ${draft.justification || ''} ${draft.benefitText || ''}`;
  if (!draft.findingIds?.length) {
    warnings.push({ type: 'unsupported', message: 'Esta recomendación no está asociada a un hallazgo del diagnóstico.' });
  }
  if (fashionPattern.test(blob) || vagueJustificationPattern.test((draft.justification || '').trim())) {
    warnings.push({
      type: 'fashion',
      message: 'Justificación insuficiente. Relaciona la decisión con evidencia, restricciones, beneficio y riesgo.',
    });
  }
  if (vagueBenefitPattern.test((draft.benefitText || '').trim()) && !(draft.benefits ?? []).length) {
    warnings.push({ type: 'benefit', message: 'Evita “mejorar infraestructura” como único beneficio.' });
  }
  if (!hasSuccessMetric(draft)) {
    warnings.push({ type: 'metric', message: '¿Cómo comprobarás que la decisión funcionó?' });
  }
  const alts = draft.alternatives ?? [];
  if (alts.length < MIN_ALTERNATIVES && !draft.simpleOperational) {
    warnings.push({ type: 'alts', message: `Compara al menos ${MIN_ALTERNATIVES} alternativas antes de decidir, salvo una acción operativa concreta y sencilla.` });
  }
  if (draft.simpleOperational && !draft.simpleJustification?.trim()) {
    warnings.push({ type: 'alts', message: 'Si marcas acción operativa sencilla, justifica por qué no requiere comparación amplia.' });
  }
  if (draft.residualLow && !draft.residualJustification?.trim()) {
    warnings.push({ type: 'risk', message: 'Riesgo residual bajo / no significativo solo si existe justificación.' });
  }
  return warnings;
}

export function hasSuccessMetric(item) {
  return Boolean((item.metricIds ?? []).length || item.metricText?.trim());
}

export function qualityOf(item) {
  if (!(item.findingIds ?? []).length) return QUALITY_STATUS.NO_SUSTENTADA;
  const complete =
    (item.evidenceIds ?? []).length &&
    item.impact?.trim() &&
    item.decision?.trim() &&
    item.justification?.trim() &&
    (item.benefitText?.trim() || (item.benefits ?? []).length) &&
    (item.riskText?.trim() || (item.risks ?? []).length || (item.residualLow && item.residualJustification?.trim())) &&
    item.costModel &&
    hasSuccessMetric(item) &&
    item.priority &&
    item.priorityJustification?.trim();
  const fashion = fashionPattern.test(`${item.decision} ${item.justification}`) || vagueJustificationPattern.test((item.justification || '').trim());
  const altsOk = (item.alternatives ?? []).length >= MIN_ALTERNATIVES || item.simpleOperational;
  if (!complete || !altsOk) return QUALITY_STATUS.PARCIAL;
  if (fashion) return QUALITY_STATUS.PARCIAL;
  return QUALITY_STATUS.ADECUADA;
}

export function isRecommendationComplete(item) {
  return (
    qualityOf(item) !== QUALITY_STATUS.NO_SUSTENTADA &&
    (item.findingIds ?? []).length &&
    (item.evidenceIds ?? []).length &&
    item.impact?.trim() &&
    item.decision?.trim() &&
    (item.benefitText?.trim() || (item.benefits ?? []).length) &&
    (item.riskText?.trim() || (item.risks ?? []).length || (item.residualLow && item.residualJustification?.trim())) &&
    item.costModel &&
    hasSuccessMetric(item) &&
    item.priority &&
    item.status !== DECISION_STATUS.REVIEW_REQUIRED
  );
}

export function computeDecideCoverage(decide, findings = []) {
  const recs = decide.recommendations ?? [];
  const covered = new Set(recs.flatMap((item) => item.findingIds ?? []));
  return {
    totalFindings: findings.length,
    covered: covered.size,
    recommendations: recs.length,
    byFinding: Object.fromEntries(findings.map((item) => [item.findingId, covered.has(item.findingId)])),
  };
}

export function getDecideCompletion(decide, documentSections) {
  const recs = (decide.recommendations ?? []).filter(isRecommendationComplete);
  const reviewPending = (decide.recommendations ?? []).some((item) => item.status === DECISION_STATUS.REVIEW_REQUIRED);
  const strategyOk = isDocumented(documentSections.strategy) && !documentSections.strategy?.reviewRequired;
  const capexOk = isDocumented(documentSections.capex) && !documentSections.capex?.reviewRequired;
  const recsDoc = isDocumented(documentSections.recommendations) && !documentSections.recommendations?.reviewRequired;
  const hasAlts = recs.some((item) => (item.alternatives ?? []).length >= 1);
  return {
    recCount: recs.length,
    minMet: recs.length >= MIN_RECOMMENDATIONS,
    strategyOk,
    capexOk,
    recsDoc,
    reviewPending,
    hasAlts,
    ready:
      recs.length >= MIN_RECOMMENDATIONS &&
      strategyOk &&
      capexOk &&
      recsDoc &&
      hasAlts &&
      !reviewPending &&
      recs.every((item) => (item.findingIds ?? []).length && hasSuccessMetric(item)),
  };
}

export function relatedConstraintsForFinding(state, findingId) {
  const recs = (state.analysis?.decide?.recommendations ?? []).filter((item) => (item.findingIds ?? []).includes(findingId));
  const constraints = availableConstraints(state);
  const ids = new Set();
  recs.forEach((rec) => {
    Object.entries(rec.constraintReviews ?? {}).forEach(([id, value]) => {
      if (value === 'affects') ids.add(id);
    });
  });
  return constraints.filter((item) => ids.has(item.id));
}

export function metricLabel(id) {
  return successMetrics.find((item) => item.id === id)?.label ?? id;
}

export function costLabel(id) {
  return costModels.find((item) => item.id === id)?.label ?? id;
}

export function priorityLabel(id) {
  return priorityLevels.find((item) => item.id === id)?.label ?? id;
}

export function frameworksFor(state, findingId) {
  return findingUsage(state.analysis?.govern ?? { itil: [], cobit: [], iso27001: [] }, findingId);
}

export const DECISION_STATUS_LABEL = {
  DRAFT: 'Borrador',
  FINDING_LINKED: 'Vinculado a hallazgo',
  ALTERNATIVES_ANALYZED: 'Alternativas analizadas',
  DECISION_SELECTED: 'Decisión seleccionada',
  RISK_REVIEWED: 'Riesgo revisado',
  METRIC_DEFINED: 'Métrica definida',
  PRIORITIZED: 'Priorizado',
  DOCUMENTED: 'Documentado',
  REVIEW_REQUIRED: 'Revisión requerida',
};

export { DECISION_STATUS, QUALITY_STATUS, MIN_RECOMMENDATIONS, MIN_ALTERNATIVES };

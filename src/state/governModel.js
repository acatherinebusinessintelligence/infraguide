import {
  GOVERN_STATUS,
  MIN_ITIL,
  MIN_COBIT,
  MIN_ISO,
  itilPractices,
  cobitResponsibles,
  isoAssets,
  isoThreats,
  isoVulnerabilities,
  isoControlTypes,
  itilIndicators,
  cobitIndicators,
  vagueBenefit,
  vagueItil,
  vagueCobit,
  vagueIso,
  isoStructureInItil,
  managementAction,
  productControl,
} from '../data/methodology/govern.js';
import { FINDING_STATUS } from '../data/methodology/diagnose.js';
import { isDocumented } from './understandModel.js';

export function createItilDraft() {
  return {
    step: 1,
    analysisId: null,
    findingId: '',
    situation: '',
    practice: '',
    action: '',
    actionOption: '',
    benefit: '',
    indicator: '',
    warnings: [],
  };
}

export function createCobitDraft() {
  return {
    step: 1,
    analysisId: null,
    findingId: '',
    problem: '',
    decision: '',
    responsibleIds: [],
    responsibleJustification: '',
    indicator: '',
    warnings: [],
  };
}

export function createIsoDraft() {
  return {
    step: 1,
    analysisId: null,
    findingId: '',
    assetId: '',
    threatId: '',
    vulnerabilityId: '',
    impact: '',
    control: '',
    controlTypes: [],
    warnings: [],
  };
}

export function createGovernState() {
  return {
    currentSubstage: 1,
    selectedFindingId: null,
    perspectives: { itil: false, cobit: false, iso: false },
    expandedFindingId: null,
    expandedAnalysisId: null,
    itil: [],
    cobit: [],
    iso27001: [],
    coverage: {},
    itilDraft: createItilDraft(),
    cobitDraft: createCobitDraft(),
    isoDraft: createIsoDraft(),
    classifications: {},
    activities: {},
    checkpoint: {},
    completed: false,
  };
}

export function mergeGovern(saved) {
  const base = createGovernState();
  if (!saved || typeof saved !== 'object') {
    return base;
  }
  return {
    ...base,
    ...saved,
    perspectives: { ...base.perspectives, ...saved.perspectives },
    itil: Array.isArray(saved.itil) ? saved.itil : [],
    cobit: Array.isArray(saved.cobit) ? saved.cobit : [],
    iso27001: Array.isArray(saved.iso27001) ? saved.iso27001 : [],
    coverage: saved.coverage && typeof saved.coverage === 'object' ? saved.coverage : {},
    itilDraft: { ...base.itilDraft, ...saved.itilDraft },
    cobitDraft: { ...base.cobitDraft, ...saved.cobitDraft, responsibleIds: saved.cobitDraft?.responsibleIds ?? [] },
    isoDraft: { ...base.isoDraft, ...saved.isoDraft, controlTypes: saved.isoDraft?.controlTypes ?? [] },
    classifications: saved.classifications ?? {},
    activities: saved.activities ?? {},
    checkpoint: saved.checkpoint ?? {},
  };
}

export function documentedFindings(state) {
  const list = state.analysis?.diagnose?.findings ?? [];
  return list.filter(
    (item) =>
      item?.findingId &&
      (item.status === FINDING_STATUS.DOCUMENTED ||
        item.status === FINDING_STATUS.VALIDATED ||
        item.status === FINDING_STATUS.REVIEW_REQUIRED),
  );
}

export function findingUsage(govern, findingId) {
  return {
    itil: (govern.itil ?? []).some((item) => item.findingId === findingId),
    cobit: (govern.cobit ?? []).some((item) => item.findingId === findingId),
    iso: (govern.iso27001 ?? []).some((item) => item.findingId === findingId),
  };
}

export function computeGovernCoverage(govern, findings = []) {
  const analyzedItil = new Set((govern.itil ?? []).map((item) => item.findingId));
  const analyzedCobit = new Set((govern.cobit ?? []).map((item) => item.findingId));
  const analyzedIso = new Set((govern.iso27001 ?? []).map((item) => item.findingId));
  return {
    totalFindings: findings.length,
    itilFindings: analyzedItil.size,
    cobitFindings: analyzedCobit.size,
    isoFindings: analyzedIso.size,
    itilCount: (govern.itil ?? []).length,
    cobitCount: (govern.cobit ?? []).length,
    isoCount: (govern.iso27001 ?? []).length,
  };
}

export function analyzeItilDraft(draft, finding) {
  const warnings = [];
  const action = draft.action ?? '';
  const benefit = draft.benefit ?? '';
  const situation = draft.situation ?? '';
  const blob = `${situation} ${action} ${benefit}`;
  if (vagueItil.test(action) || vagueItil.test(situation)) {
    warnings.push({ type: 'vague', message: 'No aceptamos solo “Aplicar ITIL”. Debe existir situación, práctica, acción y beneficio.' });
  }
  if (isoStructureInItil.test(blob)) {
    warnings.push({ type: 'framework', message: 'Esta estructura corresponde al análisis de riesgo de ISO 27001.' });
  }
  if (vagueBenefit.test(benefit)) {
    warnings.push({ type: 'benefit', message: 'Evita beneficios vagos como “mejorar TI”. Indica detección, trazabilidad o respuesta.' });
  }
  if (findingLooksLikeBackup(finding) && draft.practice === 'incident') {
    warnings.push({
      type: 'partial',
      message: 'Parcial. El incidente debe atenderse, pero el problema también muestra una debilidad de detección. Revisa monitoreo y gestión de eventos.',
    });
  }
  return warnings;
}

export function analyzeCobitDraft(draft) {
  const warnings = [];
  const decision = draft.decision ?? '';
  const problem = draft.problem ?? '';
  if (vagueCobit.test(decision) || vagueCobit.test(problem)) {
    warnings.push({ type: 'vague', message: 'No aceptamos “COBIT recomienda mejorar”. Debe existir problema, decisión, responsable e indicador.' });
  }
  if (managementAction.test(decision) && decision.trim().split(/\s+/).length <= 6) {
    warnings.push({ type: 'framework', message: 'Esto es una acción de gestión/operación, no una decisión de gobierno.' });
  }
  const onlyCio = (draft.responsibleIds ?? []).length === 1 && draft.responsibleIds[0] === 'cio';
  const mentionsOnlyCio = /^cio\.?$/i.test((draft.responsibleJustification ?? '').trim());
  if (onlyCio || mentionsOnlyCio) {
    warnings.push({
      type: 'partial',
      message: 'Parcial. Identifica quién debe realmente aprobar, supervisar o ser dueño de la decisión. No todas las decisiones pertenecen exclusivamente al CIO.',
    });
  }
  return warnings;
}

export function analyzeIsoDraft(draft) {
  const warnings = [];
  const threatLabel = isoThreats.find((item) => item.id === draft.threatId)?.label ?? '';
  const vulnLabel = isoVulnerabilities.find((item) => item.id === draft.vulnerabilityId)?.label ?? '';
  const control = draft.control ?? '';
  if (vagueIso.test(control) || vagueIso.test(draft.impact ?? '')) {
    warnings.push({ type: 'vague', message: 'No aceptamos solo “Riesgo de seguridad”. Completa activo, amenaza, vulnerabilidad, impacto y control.' });
  }
  if (draft.threatId === 'mfa-gap' || /falta de mfa/i.test(threatLabel) || draft.threatId === 'stale-account') {
    warnings.push({ type: 'swap', message: 'Revisa. La falta de MFA es una vulnerabilidad. La amenaza puede ser el acceso no autorizado.' });
  }
  if (/falta de mfa|cuenta de exempleado|backup sin/i.test(threatLabel)) {
    warnings.push({ type: 'swap', message: 'Revisa. Eso describe una vulnerabilidad, no la amenaza.' });
  }
  if (productControl.test(control.trim())) {
    warnings.push({
      type: 'product',
      message: '“Control” no significa necesariamente comprar una herramienta. Puede ser procedimiento, revisión, monitoreo, política o configuración.',
    });
  }
  if (draft.threatId && draft.vulnerabilityId && draft.threatId === draft.vulnerabilityId) {
    warnings.push({ type: 'swap', message: 'Amenaza y vulnerabilidad no deben ser el mismo elemento.' });
  }
  void vulnLabel;
  return warnings;
}

export function findingLooksLikeBackup(finding) {
  if (!finding) return false;
  const text = `${finding.title ?? ''} ${finding.description ?? ''} ${(finding.evidenceIds ?? []).join(' ')}`.toLowerCase();
  return text.includes('backup') || text.includes('respald') || (finding.evidenceIds ?? []).includes('ev-inc-d');
}

export function isItilComplete(item) {
  return Boolean(
    item.findingId &&
      item.situation?.trim() &&
      item.practice &&
      item.action?.trim() &&
      item.benefit?.trim() &&
      (item.sources ?? []).length &&
      item.status !== GOVERN_STATUS.REVIEW_REQUIRED,
  );
}

export function isCobitComplete(item) {
  return Boolean(
    item.findingId &&
      item.problem?.trim() &&
      item.decision?.trim() &&
      ((item.responsibleIds ?? []).length || item.responsible?.trim()) &&
      item.responsibleJustification?.trim() &&
      item.indicator &&
      (item.sources ?? []).length &&
      item.status !== GOVERN_STATUS.REVIEW_REQUIRED,
  );
}

export function isIsoComplete(item) {
  return Boolean(
    item.findingId &&
      item.assetId &&
      item.threatId &&
      item.vulnerabilityId &&
      item.impact?.trim() &&
      item.control?.trim() &&
      (item.sources ?? []).length &&
      item.status !== GOVERN_STATUS.REVIEW_REQUIRED,
  );
}

export function getGovernCompletion(govern, documentSections) {
  const itilReady = (govern.itil ?? []).filter(isItilComplete);
  const cobitReady = (govern.cobit ?? []).filter(isCobitComplete);
  const isoReady = (govern.iso27001 ?? []).filter(isIsoComplete);
  const reviewPending =
    (govern.itil ?? []).some((item) => item.status === GOVERN_STATUS.REVIEW_REQUIRED) ||
    (govern.cobit ?? []).some((item) => item.status === GOVERN_STATUS.REVIEW_REQUIRED) ||
    (govern.iso27001 ?? []).some((item) => item.status === GOVERN_STATUS.REVIEW_REQUIRED);
  const documented =
    isDocumented(documentSections.itil) &&
    !documentSections.itil?.reviewRequired &&
    isDocumented(documentSections.cobit) &&
    !documentSections.cobit?.reviewRequired &&
    isDocumented(documentSections.iso27001) &&
    !documentSections.iso27001?.reviewRequired;

  return {
    itilCount: itilReady.length,
    cobitCount: cobitReady.length,
    isoCount: isoReady.length,
    itilMin: itilReady.length >= MIN_ITIL,
    cobitMin: cobitReady.length >= MIN_COBIT,
    isoMin: isoReady.length >= MIN_ISO,
    documented,
    reviewPending,
    ready: itilReady.length >= MIN_ITIL && cobitReady.length >= MIN_COBIT && isoReady.length >= MIN_ISO && documented && !reviewPending,
  };
}

export function labelOf(list, id) {
  return list.find((item) => item.id === id)?.label ?? id ?? '';
}

export function itilPracticeLabel(id) {
  return labelOf(itilPractices, id);
}

export function cobitResponsibleLabel(id) {
  return labelOf(cobitResponsibles, id);
}

export function isoAssetLabel(id) {
  return labelOf(isoAssets, id);
}

export function isoThreatLabel(id) {
  return labelOf(isoThreats, id);
}

export function isoVulnLabel(id) {
  return labelOf(isoVulnerabilities, id);
}

export function isoControlTypeLabel(id) {
  return labelOf(isoControlTypes, id);
}

export function itilIndicatorLabel(id) {
  return labelOf(itilIndicators, id);
}

export function cobitIndicatorLabel(id) {
  return labelOf(cobitIndicators, id);
}

export const GOVERN_STATUS_LABEL = {
  DRAFT: 'Borrador',
  LINKED_TO_FINDING: 'Vinculado a hallazgo',
  ANALYZED: 'Analizado',
  VALIDATED: 'Validado',
  DOCUMENTED: 'Documentado',
  REVIEW_REQUIRED: 'Revisión requerida',
};

export { GOVERN_STATUS, MIN_ITIL, MIN_COBIT, MIN_ISO };

import { getState, setState, patchState, getSelectedCaseData } from './appState.js';
import { getConcept } from '../data/pedagogy/concepts.js';
import { FEEDBACK_STATUS } from '../data/pedagogy/index.js';
import { getEvidenceForField } from '../data/evidence/index.js';
import { expectedFromFacts, resolveCaseFacts, getFact } from './measureModel.js';
import {
  assessInterpretation,
  composeInterpretation,
  createEmptyTrace,
  mapCalcError,
  storageThresholdMonths as thresholdFromFacts,
  traceStepsForMetric,
} from './pedagogyModel.js';

const CORE_METRICS = new Set(['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance']);

function measureFrom(state = getState()) {
  return state.analysis?.measure ?? {};
}

function patchMeasureSlot(updater) {
  patchState((prev) => {
    const current = prev.analysis?.measure ?? {};
    const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
    return {
      ...prev,
      analysis: { ...prev.analysis, measure: next },
    };
  });
}

export function openGlossary(termId) {
  setState({ glossaryTerm: termId || null, mobileNavOpen: false });
}

export function closeGlossary() {
  setState({ glossaryTerm: null });
}

export function toggleHowObtained(metricId) {
  const current = getState().howObtainedMetric;
  setState({ howObtainedMetric: current === metricId ? null : metricId });
}

export function setPedagogyLevel(metricId, level) {
  const n = Number(level);
  if (![1, 2, 3].includes(n)) return;
  patchMeasureSlot((current) => ({
    ...current,
    [metricId]: { ...current[metricId], level: n },
  }));
}

export function toggleConceptOpen(metricId) {
  patchMeasureSlot((current) => {
    const slot = current[metricId] || {};
    const defaultOpen = CORE_METRICS.has(metricId);
    const isOpen = defaultOpen ? slot.conceptOpen !== false : slot.conceptOpen === true;
    return {
      ...current,
      [metricId]: { ...slot, conceptOpen: !isOpen },
    };
  });
}

export function setMetricFeedback(metricId, feedback) {
  patchMeasureSlot((current) => ({
    ...current,
    [metricId]: { ...current[metricId], feedback },
  }));
}

export function applyCalcFeedback(metricId, message) {
  setMetricFeedback(metricId, mapCalcError(message));
}

export function validateInterpretation(metricId) {
  const parts = measureFrom()[metricId]?.interpretationParts || {};
  const assessment = assessInterpretation(parts);
  const composed = composeInterpretation(parts);
  patchMeasureSlot((current) => ({
    ...current,
    [metricId]: {
      ...current[metricId],
      feedback: assessment,
      draft: current[metricId]?.draft?.trim() ? current[metricId].draft : composed,
      interpretation: composed,
    },
  }));
  persistTrace(metricId);
  return assessment;
}

export function buildTraceForMetric(metricId, extras = {}) {
  const state = getState();
  const caseData = getSelectedCaseData();
  const facts = resolveCaseFacts(caseData);
  const expected = facts.length ? expectedFromFacts(facts) : {};
  const concept = getConcept(metricId);
  const slot = measureFrom(state)[metricId] || {};
  const inputs = (concept?.variables ?? []).map((variable) => {
    const evidence = variable.key ? getEvidenceForField(caseData, variable.key) : null;
    const fact = variable.key ? getFact(facts, variable.key) : null;
    return {
      name: variable.name,
      symbol: variable.symbol,
      value: fact?.displayValue ?? fact?.value ?? evidence?.value ?? '',
      unit: variable.unit || fact?.unit || '',
      evidenceId: evidence?.evidenceId || '',
      page: evidence?.page ?? null,
      calculated: Boolean(variable.calculated),
    };
  });
  const resultMap = {
    availability: { value: expected.availabilityPercent, unit: '%', rounding: '2 decimales' },
    mttr: { value: expected.mttrHours, unit: 'h', rounding: '2 decimales' },
    mtbf: { value: expected.mtbfHours, unit: 'h', rounding: '2 decimales, estimación' },
    storage: { value: expected.storageUsedPercent, unit: '%', rounding: 'entero para uso; 1 decimal para meses' },
    performance: { value: expected.latencyRatio, unit: 'razón', rounding: '2 decimales' },
    capacity: { value: getFact(facts, 'appCpuPeak')?.value, unit: '% CPU pico', rounding: 'dato observado' },
  };
  const base = createEmptyTrace(metricId);
  const period = getFact(facts, 'periodHours');
  return {
    ...base,
    calculationId: `CAL-HB-${String(metricId).replace(/[^a-z0-9]/gi, '').slice(0, 8).toUpperCase()}`,
    inputs,
    steps: extras.steps || slot.trace?.steps || traceStepsForMetric(metricId, facts),
    result: resultMap[metricId] || base.result,
    rounding: resultMap[metricId]?.rounding || '',
    period: period?.displayValue || period?.value || '',
    scope: extras.scope || concept?.limitation || 'Alcance del registro del caso, no un SLA.',
    interpretation: composeInterpretation(slot.interpretationParts) || slot.draft || '',
    student: 'analista en InfraGuide',
    validationStatus: slot.feedback?.status || '',
    findingId: slot.findingFromMetric?.condition ? `work-${metricId}` : '',
    reportSection: 'performance',
    ...extras,
  };
}

export function persistTrace(metricId, extras = {}) {
  const trace = buildTraceForMetric(metricId, extras);
  patchMeasureSlot((current) => ({
    ...current,
    [metricId]: { ...current[metricId], trace },
    traces: { ...(current.traces || {}), [metricId]: trace },
  }));
  return trace;
}

export function persistMetricFinding(metricId) {
  persistTrace(metricId);
  const finding = measureFrom()[metricId]?.findingFromMetric || {};
  const filled = Object.values(finding).filter((value) => String(value || '').trim().length >= 4).length;
  const status = filled >= 5 ? FEEDBACK_STATUS.CORRECT : FEEDBACK_STATUS.PARTIAL;
  setMetricFeedback(metricId, {
    status,
    message:
      filled >= 5
        ? 'Hallazgo de trabajo guardado en el modo aprendizaje. No se copia la pedagogía al informe profesional: transcríbelo en DIAGNOSTICAR con evidencia.'
        : 'Faltan campos del hallazgo (condición, evidencia, impacto, riesgo o criterio de aceptación).',
  });
}

export function storageThresholdMonths() {
  return thresholdFromFacts(resolveCaseFacts(getSelectedCaseData()));
}

export function setInsufficientFeedback(conceptId) {
  const concept = getConcept(conceptId);
  setState({
    pedagogyNotice: {
      conceptId,
      status: FEEDBACK_STATUS.INSUFFICIENT,
      message: concept?.insufficientReason || 'No existen datos suficientes para calcular el indicador.',
    },
  });
}

export { FEEDBACK_STATUS };

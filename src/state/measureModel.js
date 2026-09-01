import { getCaseField, formatFieldValue } from '../data/cases/index.js';
import {
  METRIC_STATUS,
  metricDefinitions,
  measureFactKeys,
  expectedResults,
} from '../data/methodology/measure.js';
import { isDocumented } from './understandModel.js';

export function createMetricSlot() {
  return {
    status: METRIC_STATUS.READY_TO_CALCULATE,
    inputs: {},
    interpretation: null,
    draft: '',
    sourceKeys: [],
    reviewRequired: false,
    result: null,
    limitation: '',
  };
}

export function createMeasureState() {
  return {
    currentSubstage: 1,
    usedKeys: [...measureFactKeys],
    availability: createMetricSlot(),
    mttr: createMetricSlot(),
    mtbf: createMetricSlot(),
    capacity: createMetricSlot(),
    storage: createMetricSlot(),
    performance: createMetricSlot(),
    activities: {},
    checkpoint: {},
    completed: false,
  };
}

export function mergeMeasure(saved) {
  const base = createMeasureState();
  if (!saved || typeof saved !== 'object') {
    return base;
  }
  const slots = ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'];
  const merged = {
    ...base,
    ...saved,
    usedKeys: Array.isArray(saved.usedKeys) ? saved.usedKeys : base.usedKeys,
    activities: saved.activities ?? {},
    checkpoint: saved.checkpoint ?? {},
  };
  slots.forEach((id) => {
    merged[id] = { ...base[id], ...saved[id], inputs: { ...base[id].inputs, ...saved[id]?.inputs } };
  });
  return merged;
}

export function resolveCaseFacts(caseData) {
  return measureFactKeys
    .map((key) => {
      const located = getCaseField(caseData, key);
      if (!located) {
        return null;
      }
      return {
        key,
        label: located.field.label,
        value: located.field.value,
        unit: located.field.unit ?? '',
        displayValue: formatFieldValue(located.field),
        sourceSectionId: located.section.sectionId,
        sourceLabel: located.section.sectionTitle,
      };
    })
    .filter(Boolean);
}

export function getFact(facts, key) {
  return facts.find((item) => item.key === key) ?? null;
}

export function metricReadiness(definition, facts, usedKeys = measureFactKeys) {
  const present = definition.requiredKeys.map((key) => {
    const fact = getFact(facts, key);
    const used = usedKeys.includes(key);
    return { key, fact, used, ok: Boolean(fact) && used };
  });
  const missing = present.filter((item) => !item.ok);
  if (missing.length) {
    return { status: METRIC_STATUS.MISSING_DATA, items: present, label: 'FALTAN DATOS' };
  }
  return {
    status: METRIC_STATUS.READY_TO_CALCULATE,
    items: present,
    label: definition.readyWhenComplete,
  };
}

export function expectedFromFacts(facts) {
  const period = getFact(facts, 'periodHours')?.value;
  const down = getFact(facts, 'downtimeHours')?.value;
  const incidents = getFact(facts, 'incidentCount')?.value;
  const recovery = getFact(facts, 'totalRecoveryHours')?.value;
  const cap = getFact(facts, 'storageCapacity')?.value;
  const used = getFact(facts, 'storageUsed')?.value;
  const growth = getFact(facts, 'storageGrowth')?.value;
  const latN = getFact(facts, 'appLatencyNormal')?.value;
  const latP = getFact(facts, 'appLatencyPeak')?.value;
  const demN = getFact(facts, 'appDemandNormal')?.value;
  const demP = getFact(facts, 'appDemandPeak')?.value;

  const uptime = period != null && down != null ? period - down : expectedResults.uptimeHours;
  const availability = period ? (uptime / period) * 100 : expectedResults.availabilityPercent;
  const mttr = incidents ? recovery / incidents : expectedResults.mttrHours;
  const mtbf = incidents ? uptime / incidents : expectedResults.mtbfHours;
  const free = cap != null && used != null ? cap - used : expectedResults.storageFreeTb;
  const usedPct = cap ? (used / cap) * 100 : expectedResults.storageUsedPercent;
  const freeGb = free * 1000;
  const months = growth ? freeGb / growth : expectedResults.storageMonths;
  const ratio = latN ? latP / latN : expectedResults.latencyRatio;
  const demandInc = demN ? ((demP - demN) / demN) * 100 : expectedResults.demandIncreasePercent;

  return {
    uptimeHours: uptime,
    availabilityPercent: availability,
    mttrHours: mttr,
    mtbfHours: mtbf,
    storageFreeTb: free,
    storageUsedPercent: usedPct,
    storageMonths: months,
    latencyRatio: ratio,
    demandIncreasePercent: demandInc,
  };
}

export function effectiveMetricStatus(slot, readiness) {
  if (slot?.reviewRequired || slot?.status === METRIC_STATUS.REVIEW_REQUIRED) {
    return METRIC_STATUS.REVIEW_REQUIRED;
  }
  if (slot?.status && slot.status !== METRIC_STATUS.READY_TO_CALCULATE) {
    return slot.status;
  }
  return readiness.status;
}

export function getMeasureCompletion(measure, documentSections, evidence = []) {
  const metricsDoc = documentSections.metrics;
  const sub = metricsDoc?.subsections ?? {};
  const availability = Boolean(sub.availability?.text?.trim()) || measure.availability.status === METRIC_STATUS.DOCUMENTED;
  const mttr = Boolean(sub.mttr?.text?.trim()) || measure.mttr.status === METRIC_STATUS.DOCUMENTED;
  const mtbf =
    Boolean(sub.mtbf?.text?.trim()) ||
    measure.mtbf.status === METRIC_STATUS.DOCUMENTED ||
    (measure.mtbf.status === METRIC_STATUS.INTERPRETED && measure.mtbf.limitation);
  const capacity =
    Boolean(sub.capacity?.text?.trim()) ||
    measure.capacity.status === METRIC_STATUS.DOCUMENTED ||
    (measure.capacity.status === METRIC_STATUS.INTERPRETED && measure.capacity.draft?.trim());
  const storage = Boolean(sub.storage?.text?.trim()) || measure.storage.status === METRIC_STATUS.DOCUMENTED;
  const performance =
    Boolean(sub.performance?.text?.trim()) ||
    measure.performance.status === METRIC_STATUS.DOCUMENTED ||
    (measure.performance.status === METRIC_STATUS.INTERPRETED && measure.performance.draft?.trim());
  const hasEvidence = evidence.length > 0;
  const reviewPending = ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'].some(
    (id) => measure[id]?.reviewRequired,
  );

  return {
    availability,
    mttr,
    mtbf,
    capacity,
    storage,
    performance,
    hasEvidence,
    reviewPending,
    ready: availability && mttr && mtbf && capacity && storage && performance && hasEvidence && !reviewPending,
  };
}

export function metricsDocumentComplete(entry) {
  return isDocumented(entry) && Boolean(entry.subsections);
}

export { metricDefinitions };

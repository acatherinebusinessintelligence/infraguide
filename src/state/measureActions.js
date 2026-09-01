import { DATA_STATUS } from '../data/methodology/data-map.js';
import {
  METRIC_STATUS,
  missingEvidenceMessage,
  reviewRequiredMessage,
  metricDefinitions,
  templates,
} from '../data/methodology/measure.js';
import { validateMetricInput } from '../utils/numbers.js';
import {
  createMeasureState,
  resolveCaseFacts,
  expectedFromFacts,
  getMeasureCompletion,
} from './measureModel.js';
import { nowIso } from './understandModel.js';
import { computeProgress, getState, patchState, setState, getSelectedCaseData } from './appState.js';

function measureFrom(state = getState()) {
  return state.analysis?.measure ?? createMeasureState();
}

function documentsFrom(state = getState()) {
  return state.documentSections ?? {};
}

function factsNow() {
  return resolveCaseFacts(getSelectedCaseData());
}

export function patchMeasure(updater) {
  const current = measureFrom();
  const next = typeof updater === 'function' ? updater(current) : { ...current, ...updater };
  patchState((prev) => ({
    ...prev,
    analysis: { ...prev.analysis, measure: next },
  }));
}

export function setMeasureSubstage(id) {
  patchMeasure((current) => ({ ...current, currentSubstage: Number(id) }));
}

export function toggleMeasureUsedKey(key) {
  const state = getState();
  const measure = measureFrom(state);
  const used = measure.usedKeys.includes(key)
    ? measure.usedKeys.filter((item) => item !== key)
    : [...measure.usedKeys, key];
  const removing = measure.usedKeys.includes(key);
  patchMeasure((current) => {
    const next = { ...current, usedKeys: used };
    if (removing) {
      metricDefinitions.forEach((definition) => {
        if (definition.requiredKeys.includes(key) && current[definition.id]?.status !== METRIC_STATUS.READY_TO_CALCULATE) {
          next[definition.id] = {
            ...current[definition.id],
            reviewRequired: true,
            status: METRIC_STATUS.REVIEW_REQUIRED,
          };
        }
      });
    }
    return next;
  });
  if (removing) {
    flagDocumentedMetricsReview(key);
    setState({ documentError: reviewRequiredMessage });
  }
}

export function flagMetricsUsingKey(key) {
  const measure = measureFrom();
  let changed = false;
  patchMeasure((current) => {
    const next = { ...current };
    metricDefinitions.forEach((definition) => {
      const slot = current[definition.id];
      const uses = (slot?.sourceKeys ?? definition.requiredKeys).includes(key);
      if (uses && slot && slot.status !== METRIC_STATUS.READY_TO_CALCULATE && slot.status !== METRIC_STATUS.MISSING_DATA) {
        next[definition.id] = { ...slot, reviewRequired: true, status: METRIC_STATUS.REVIEW_REQUIRED };
        changed = true;
      }
    });
    return next;
  });
  if (changed) {
    flagDocumentedMetricsReview(key);
    setState({ documentError: reviewRequiredMessage });
  }
}

function flagDocumentedMetricsReview(key) {
  const docs = documentsFrom();
  if (docs.metrics?.status !== DATA_STATUS.DOCUMENTED) {
    return;
  }
  const subsections = { ...docs.metrics.subsections };
  Object.entries(subsections).forEach(([id, entry]) => {
    if ((entry?.sourceKeys ?? []).includes(key)) {
      subsections[id] = { ...entry, reviewRequired: true };
    }
  });
  patchState((prev) => ({
    ...prev,
    documentSections: {
      ...prev.documentSections,
      metrics: { ...prev.documentSections.metrics, subsections, reviewRequired: true },
    },
  }));
}

export function setMeasureActivity(id, value) {
  patchMeasure((current) => ({
    ...current,
    activities: { ...current.activities, [id]: value },
  }));
}

export function setMeasureCheckpoint(id, value) {
  patchMeasure((current) => ({
    ...current,
    checkpoint: { ...current.checkpoint, [id]: value },
  }));
}

export function setMeasureDraft(metricId, value) {
  patchMeasure((current) => ({
    ...current,
    [metricId]: { ...current[metricId], draft: value },
  }));
}

export function setMeasureInput(metricId, field, value) {
  patchMeasure((current) => ({
    ...current,
    [metricId]: {
      ...current[metricId],
      inputs: { ...current[metricId].inputs, [field]: value },
    },
  }));
}

function failCalc(message) {
  setState({ documentError: message });
  return false;
}

function sourceKeysOf(id) {
  return metricDefinitions.find((item) => item.id === id)?.requiredKeys ?? [];
}

export function submitAvailabilityStep(step) {
  const facts = factsNow();
  const expected = expectedFromFacts(facts);
  const measure = measureFrom();
  const inputs = measure.availability.inputs;

  if (step === 'uptime') {
    const check = validateMetricInput(inputs.uptime, { expected: expected.uptimeHours, tolerance: 0.01 });
    if (!check.ok) return failCalc(check.message);
    patchMeasure((current) => ({
      ...current,
      availability: {
        ...current.availability,
        inputs: { ...current.availability.inputs, uptimeOk: true },
        sourceKeys: sourceKeysOf('availability'),
      },
    }));
    setState({ documentError: null });
    return true;
  }

  if (step === 'percent') {
    const check = validateMetricInput(inputs.percent, {
      expected: expected.availabilityPercent,
      tolerance: 0.1,
      max: 100,
    });
    if (!check.ok) return failCalc(check.message);
    patchMeasure((current) => ({
      ...current,
      availability: {
        ...current.availability,
        status: METRIC_STATUS.CALCULATED,
        result: expected.availabilityPercent,
        reviewRequired: false,
        sourceKeys: sourceKeysOf('availability'),
        inputs: { ...current.availability.inputs, percentOk: true },
      },
    }));
    setState({ documentError: null });
    return true;
  }
  return false;
}

export function submitMttr() {
  const expected = expectedFromFacts(factsNow());
  const check = validateMetricInput(measureFrom().mttr.inputs.result, {
    expected: expected.mttrHours,
    tolerance: 0.05,
  });
  if (!check.ok) return failCalc(check.message);
  patchMeasure((current) => ({
    ...current,
    mttr: {
      ...current.mttr,
      status: METRIC_STATUS.CALCULATED,
      result: expected.mttrHours,
      reviewRequired: false,
      sourceKeys: sourceKeysOf('mttr'),
      inputs: { ...current.mttr.inputs, resultOk: true },
    },
  }));
  setState({ documentError: null });
  return true;
}

export function submitMtbfStep(step) {
  const expected = expectedFromFacts(factsNow());
  const inputs = measureFrom().mtbf.inputs;
  if (step === 'uptime') {
    const check = validateMetricInput(inputs.uptime, { expected: expected.uptimeHours, tolerance: 0.01 });
    if (!check.ok) return failCalc(check.message);
    patchMeasure((current) => ({
      ...current,
      mtbf: { ...current.mtbf, inputs: { ...current.mtbf.inputs, uptimeOk: true }, sourceKeys: sourceKeysOf('mtbf') },
    }));
    setState({ documentError: null });
    return true;
  }
  const check = validateMetricInput(inputs.result, { expected: expected.mtbfHours, tolerance: 0.15 });
  if (!check.ok) return failCalc(check.message);
  patchMeasure((current) => ({
    ...current,
    mtbf: {
      ...current.mtbf,
      status: METRIC_STATUS.CALCULATED,
      result: expected.mtbfHours,
      reviewRequired: false,
      limitation: 'Estimación académica: el caso no detalla cada fallo.',
      sourceKeys: sourceKeysOf('mtbf'),
      inputs: { ...current.mtbf.inputs, resultOk: true },
    },
  }));
  setState({ documentError: null });
  return true;
}

export function submitStorageStep(step) {
  const expected = expectedFromFacts(factsNow());
  const inputs = measureFrom().storage.inputs;
  const map = {
    free: { field: 'free', expected: expected.storageFreeTb, tolerance: 0.05, flag: 'freeOk' },
    percent: { field: 'percent', expected: expected.storageUsedPercent, tolerance: 0.2, max: 100, flag: 'percentOk' },
    months: { field: 'months', expected: expected.storageMonths, tolerance: 0.2, flag: 'monthsOk' },
  };
  const spec = map[step];
  if (!spec) return false;
  const check = validateMetricInput(inputs[spec.field], {
    expected: spec.expected,
    tolerance: spec.tolerance,
    max: spec.max,
  });
  if (!check.ok) return failCalc(check.message);
  patchMeasure((current) => {
    const inputsNext = { ...current.storage.inputs, [spec.flag]: true };
    const complete = inputsNext.freeOk && inputsNext.percentOk && inputsNext.monthsOk;
    return {
      ...current,
      storage: {
        ...current.storage,
        inputs: inputsNext,
        status: complete ? METRIC_STATUS.CALCULATED : current.storage.status,
        result: complete
          ? {
              free: expected.storageFreeTb,
              percent: expected.storageUsedPercent,
              months: expected.storageMonths,
            }
          : current.storage.result,
        reviewRequired: complete ? false : current.storage.reviewRequired,
        sourceKeys: sourceKeysOf('storage'),
      },
    };
  });
  setState({ documentError: null });
  return true;
}

export function submitPerformanceStep(step) {
  const expected = expectedFromFacts(factsNow());
  const inputs = measureFrom().performance.inputs;
  if (step === 'ratio') {
    const check = validateMetricInput(inputs.ratio, { expected: expected.latencyRatio, tolerance: 0.05 });
    if (!check.ok) return failCalc(check.message);
    patchMeasure((current) => ({
      ...current,
      performance: { ...current.performance, inputs: { ...current.performance.inputs, ratioOk: true } },
    }));
    setState({ documentError: null });
    return true;
  }
  const check = validateMetricInput(inputs.demand, { expected: expected.demandIncreasePercent, tolerance: 0.6 });
  if (!check.ok) return failCalc(check.message);
  patchMeasure((current) => ({
    ...current,
    performance: {
      ...current.performance,
      status: METRIC_STATUS.CALCULATED,
      result: { ratio: expected.latencyRatio, demandIncrease: expected.demandIncreasePercent },
      reviewRequired: false,
      sourceKeys: sourceKeysOf('performance'),
      inputs: { ...current.performance.inputs, demandOk: true },
    },
  }));
  setState({ documentError: null });
  return true;
}

export function markMetricInterpreted(metricId, interpretationId) {
  patchMeasure((current) => ({
    ...current,
    activities: { ...current.activities, [interpretationId]: current.activities[interpretationId] },
    [metricId]: {
      ...current[metricId],
      interpretation: current.activities[interpretationId] || current[metricId].interpretation,
      status:
        current[metricId].status === METRIC_STATUS.DOCUMENTED
          ? METRIC_STATUS.DOCUMENTED
          : METRIC_STATUS.INTERPRETED,
    },
  }));
}

function failDoc() {
  setState({ documentError: missingEvidenceMessage });
  return false;
}

function saveMetricsSubsection(id, payload) {
  const timestamp = nowIso();
  const state = getState();
  const current = documentsFrom(state).metrics ?? {
    text: '',
    subsections: {},
    status: DATA_STATUS.DOCUMENTED,
  };
  const subsections = {
    ...current.subsections,
    [id]: { ...payload, lastUpdated: timestamp, reviewRequired: false },
  };
  const text = Object.values(subsections)
    .map((item) => item.text)
    .filter(Boolean)
    .join('\n\n');
  const entry = {
    ...current,
    text,
    subsections,
    status: DATA_STATUS.DOCUMENTED,
    timestamp: current.timestamp ?? timestamp,
    lastUpdated: timestamp,
    sources: [...new Set([...(current.sources ?? []), ...(payload.sources ?? [])])],
    evidences: [...new Set([...(current.evidences ?? []), ...(payload.evidences ?? [])])],
    reviewRequired: false,
  };
  patchState((prev) => ({
    ...prev,
    documentError: null,
    documentViewKey: 'metrics',
    documentPanelOpen: true,
    mobileNavOpen: false,
    documentSections: { ...documentsFrom(prev), metrics: entry },
  }));
  patchMeasure((measure) => ({
    ...measure,
    [id]: { ...measure[id], status: METRIC_STATUS.DOCUMENTED, reviewRequired: false },
  }));
  return true;
}

export function addAvailabilityToDocument() {
  const measure = measureFrom();
  const slot = measure.availability;
  const text = slot.draft.trim();
  if (!slot.inputs.percentOk || !text || measure.activities['m-avail-affirm'] !== 'a') {
    return failDoc();
  }
  const expected = expectedFromFacts(factsNow());
  return saveMetricsSubsection('availability', {
    title: '9.1 Disponibilidad',
    text,
    source: 'Información operacional disponible',
    sourceKeys: sourceKeysOf('availability'),
    data: '720 h / 12 h',
    formula: '(Tiempo total − tiempo fuera de servicio) / Tiempo total × 100',
    substitution: '(720 − 12) / 720 × 100',
    result: `${expected.availabilityPercent.toFixed(2).replace('.', ',')} %`,
    interpretation: 'Disponibilidad observada del periodo analizado.',
    limitation: 'No afirma SLA, suficiencia, causa ni solución.',
    sources: ['Información operacional disponible'],
    evidences: ['Periodo 720 h', 'Indisponibilidad 12 h'],
  });
}

export function addMttrToDocument() {
  const measure = measureFrom();
  const text = measure.mttr.draft.trim();
  if (!measure.mttr.inputs.resultOk || !text || measure.activities['m-mttr-mean'] !== 'b') {
    return failDoc();
  }
  return saveMetricsSubsection('mttr', {
    title: '9.2 MTTR',
    text,
    source: 'Información operacional disponible',
    sourceKeys: sourceKeysOf('mttr'),
    data: '10 incidentes / 31 h',
    formula: 'Tiempo total de recuperación / Número de incidentes',
    substitution: '31 / 10',
    result: '3,1 h',
    interpretation: 'Tiempo promedio para restaurar el servicio.',
    limitation: 'No es la duración de cada incidente ni un SLA.',
    sources: ['Información operacional disponible'],
    evidences: ['10 incidentes', '31 h de recuperación'],
  });
}

export function addMtbfToDocument() {
  const measure = measureFrom();
  const text = measure.mtbf.draft.trim();
  if (!measure.mtbf.inputs.resultOk || !text || measure.activities['m-mtbf-present'] !== 'b') {
    return failDoc();
  }
  return saveMetricsSubsection('mtbf', {
    title: '9.3 MTBF estimado',
    text,
    source: 'Información operacional disponible',
    sourceKeys: sourceKeysOf('mtbf'),
    data: '708 h operativos estimados / 10 incidentes',
    formula: 'Tiempo operativo estimado / Número de incidentes',
    substitution: '708 / 10',
    result: '≈ 70,8 h',
    interpretation: 'Estimación con limitaciones de información.',
    limitation: 'No hay marca temporal completa ni definición uniforme de fallo por servicio.',
    method: 'Tiempo operativo = periodo − indisponibilidad.',
    sources: ['Información operacional disponible'],
    evidences: ['720 h', '12 h', '10 incidentes'],
  });
}

export function addCapacityToDocument() {
  const measure = measureFrom();
  const text = measure.capacity.draft.trim();
  if (measure.activities['m-cap-pattern'] !== 'a' || !text) {
    return failDoc();
  }
  patchMeasure((current) => ({
    ...current,
    capacity: {
      ...current.capacity,
      status: METRIC_STATUS.INTERPRETED,
      interpretation: 'a',
      sourceKeys: sourceKeysOf('capacity'),
    },
  }));
  return saveMetricsSubsection('capacity', {
    title: '9.4 Capacidad y rendimiento',
    text,
    source: 'Información operacional — APP-SRV01',
    sourceKeys: sourceKeysOf('capacity'),
    data: 'CPU 78 % / 96 %, RAM 88 %, demanda 14 000 → 31 000, latencia 180 → 900 ms',
    formula: 'Relación cualitativa de variables observadas. No es una única fórmula.',
    substitution: 'Demanda ↑ · CPU ↑ · Latencia ↑',
    result: 'Patrón de degradación bajo alta demanda',
    interpretation: 'Evidencia de degradación asociada a alta demanda, sin causa única demostrada.',
    limitation: 'No autoriza compra ni migración. Promedio ≠ pico.',
    sources: ['Información operacional disponible'],
    evidences: ['CPU pico 96 %', 'RAM 88 %', 'Latencia 900 ms', 'Demanda 31 000'],
  });
}

export function addStorageToDocument() {
  const measure = measureFrom();
  const text = measure.storage.draft.trim();
  if (!measure.storage.inputs.monthsOk || !text || measure.activities['m-sto-wait'] !== 'no') {
    return failDoc();
  }
  const expected = expectedFromFacts(factsNow());
  return saveMetricsSubsection('storage', {
    title: '9.5 Almacenamiento y crecimiento',
    text,
    source: 'Almacenamiento / NAS',
    sourceKeys: sourceKeysOf('storage'),
    data: '20 TB / 16,8 TB / 420 GB/mes',
    formula: 'Libre = capacidad − usado; % = usado/capacidad × 100; meses ≈ (libre en GB) / crecimiento',
    substitution: '20 − 16,8 = 3,2 TB; 16,8/20 × 100 = 84 %; 3 200 / 420 ≈ 7,62',
    result: `${expected.storageUsedPercent.toFixed(0)} % usado · ≈ ${expected.storageMonths.toFixed(1).replace('.', ',')} meses de margen teórico`,
    interpretation: 'Si el crecimiento continúa a un ritmo similar, el margen teórico es de aproximadamente 7,6 meses.',
    limitation: 'Supone crecimiento constante. No es una fecha exacta de agotamiento.',
    sources: ['Almacenamiento'],
    evidences: ['20 TB', '16,8 TB', '420 GB/mes'],
  });
}

export function addPerformanceToDocument() {
  const measure = measureFrom();
  const text = measure.performance.draft.trim();
  if (!measure.performance.inputs.ratioOk || !text || measure.activities['m-perf-avail'] !== 'yes') {
    return failDoc();
  }
  return saveMetricsSubsection('performance', {
    title: '9.4 Capacidad y rendimiento — latencia',
    text,
    source: 'Información operacional — APP-SRV01',
    sourceKeys: sourceKeysOf('performance'),
    data: '180 ms / 900 ms; 14 000 / 31 000 pedidos',
    formula: '900 / 180; (31 000 − 14 000) / 14 000 × 100',
    substitution: '5 veces; ≈ 121,43 %',
    result: 'Latencia pico ≈ 5× la normal; demanda pico ≈ 121 % superior a la de referencia',
    interpretation: 'Degradación de rendimiento aunque el servicio pueda permanecer disponible.',
    limitation: 'El 121 % no es crecimiento empresarial; compara niveles observados.',
    sources: ['Información operacional disponible'],
    evidences: ['Latencia 180→900 ms', 'Demanda 14 000→31 000'],
  });
}

export function saveMetricEvidence(payload) {
  const item = {
    evidenceId: payload.evidenceId,
    metricId: payload.metricId,
    data: payload.data,
    interpretation: payload.interpretation,
    sourceKeys: payload.sourceKeys ?? [],
    timestamp: nowIso(),
  };
  patchState((prev) => {
    const list = prev.metricEvidence ?? [];
    const without = list.filter((entry) => entry.evidenceId !== item.evidenceId);
    return { ...prev, metricEvidence: [...without, item] };
  });
  return true;
}

export function completeMeasureStage() {
  const state = getState();
  const completion = getMeasureCompletion(measureFrom(state), documentsFrom(state), state.metricEvidence ?? []);
  if (!completion.ready) {
    setState({
      documentError: 'Documenta las métricas, guarda al menos una evidencia y resuelve las revisiones pendientes.',
    });
    return false;
  }
  const completedStages = [...new Set([...(state.completedStages ?? []), 4])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 4,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      measure: { ...measureFrom(prev), completed: true },
    },
  }));
  return true;
}

export function getMeasureSnapshot(state = getState()) {
  const measure = measureFrom(state);
  const facts = resolveCaseFacts(state.selectedCase ? getSelectedCaseData() ?? state.selectedCase : getSelectedCaseData());
  return {
    measure,
    facts,
    expected: expectedFromFacts(facts),
    documents: documentsFrom(state),
    evidence: state.metricEvidence ?? [],
    completion: getMeasureCompletion(measure, documentsFrom(state), state.metricEvidence ?? []),
  };
}

export function insertMeasureTemplate(metricId) {
  const template = templates[metricId];
  if (!template) return;
  setMeasureDraft(metricId, template);
}

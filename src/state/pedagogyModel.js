import { METRIC_STATUS } from '../data/methodology/measure.js';
import { FEEDBACK_STATUS, PEDAGOGY_LEVEL, STORAGE_EXERCISE_THRESHOLD } from '../data/pedagogy/index.js';
import { getConcept } from '../data/pedagogy/concepts.js';
import { expectedFromFacts, getFact } from './measureModel.js';

export function emptyInterpretationParts() {
  return {
    resultOf: '',
    indicates: '',
    during: '',
    affects: '',
    because: '',
    limitation: '',
    recommend: '',
    improvedWhen: '',
  };
}

export function emptyFindingFromMetric() {
  return {
    condition: '',
    evidence: '',
    criterion: '',
    cause: '',
    impact: '',
    risk: '',
    recommendation: '',
    acceptance: '',
  };
}

export function createEmptyTrace(metricId) {
  const concept = getConcept(metricId);
  return {
    calculationId: '',
    metricId,
    name: concept?.name || metricId,
    definition: concept?.what || '',
    purpose: concept?.whatFor || '',
    formula: concept?.formula || '',
    inputs: [],
    steps: [],
    result: { value: null, unit: concept?.unit || '' },
    rounding: '',
    period: '',
    scope: '',
    interpretation: '',
    limitations: concept?.limitation ? [concept.limitation] : [],
    student: '',
    validationStatus: '',
    findingId: '',
    reportSection: 'performance',
  };
}

export function defaultSlotPedagogy(status) {
  let level = PEDAGOGY_LEVEL.UNDERSTAND;
  if (status === METRIC_STATUS.CALCULATED) level = PEDAGOGY_LEVEL.APPLY;
  if (status === METRIC_STATUS.INTERPRETED || status === METRIC_STATUS.DOCUMENTED) {
    level = PEDAGOGY_LEVEL.ANALYZE;
  }
  return {
    level,
    conceptOpen: true,
    howOpen: false,
    feedback: null,
    interpretationParts: emptyInterpretationParts(),
    findingFromMetric: emptyFindingFromMetric(),
    trace: null,
  };
}

export function composeInterpretation(parts = {}) {
  const resultOf = parts.resultOf?.trim();
  const indicates = parts.indicates?.trim();
  const during = parts.during?.trim();
  const affects = parts.affects?.trim();
  const because = parts.because?.trim();
  const limitation = parts.limitation?.trim();
  const recommend = parts.recommend?.trim();
  const improvedWhen = parts.improvedWhen?.trim();
  const filled = [resultOf, indicates, during, affects, because, limitation, recommend, improvedWhen].filter(Boolean);
  if (!filled.length) return '';
  return [
    resultOf || indicates
      ? `El resultado de ${resultOf || 'este indicador'} indica que ${indicates || '…'} durante ${during || 'el periodo observado'}.`
      : '',
    affects || because ? `Este valor afecta a ${affects || '…'} porque ${because || '…'}.` : '',
    limitation ? `La principal limitación del cálculo es ${limitation}.` : '',
    recommend ? `Por lo tanto, se recomienda analizar/implementar ${recommend}.` : '',
    improvedWhen ? `El resultado se considerará mejorado cuando ${improvedWhen}.` : '',
  ]
    .filter(Boolean)
    .join(' ');
}

export function assessInterpretation(parts = {}) {
  const composed = composeInterpretation(parts);
  const keys = ['resultOf', 'indicates', 'during', 'affects', 'because', 'limitation', 'recommend', 'improvedWhen'];
  const filled = keys.filter((key) => String(parts[key] || '').trim().length >= 4).length;
  if (!composed) {
    return { status: FEEDBACK_STATUS.PARTIAL, message: 'Completa la interpretación. El cálculo no se convierte solo en hallazgo.' };
  }
  if (filled < 5) {
    return {
      status: FEEDBACK_STATUS.PARTIAL,
      message: 'El cálculo puede ser válido, pero faltan alcance, limitación o criterio de mejora.',
    };
  }
  const blob = composed.toLowerCase();
  if (/sla se cumple|excelente|migrar a cloud|comprar ya/.test(blob)) {
    return {
      status: FEEDBACK_STATUS.DONT_CONFUSE,
      message: 'Estás usando el resultado como veredicto de SLA, calidad o compra. Separa hecho, cálculo e inferencia.',
    };
  }
  return {
    status: FEEDBACK_STATUS.CORRECT,
    message: 'Procedimiento, unidades e interpretación son consistentes con el alcance declarado. Sigue al hallazgo.',
  };
}

export function mapCalcError(message = '') {
  const text = String(message);
  if (/vacío|número|NaN/i.test(text)) {
    return { status: FEEDBACK_STATUS.REVIEW_DATA, message: `${text} Revisa unidades y el valor que escribiste.` };
  }
  if (/esperado|tolerance|cerca/i.test(text) || /no coincide/i.test(text)) {
    return {
      status: FEEDBACK_STATUS.REVIEW_DATA,
      message: `${text} Comprueba que el periodo, el servicio y la unidad coincidan con el dato del caso.`,
    };
  }
  return { status: FEEDBACK_STATUS.REVIEW_DATA, message: text };
}

export function storageThresholdMonths(facts = []) {
  const cap = Number(getFact(facts, 'storageCapacity')?.value);
  const used = Number(getFact(facts, 'storageUsed')?.value);
  const growthGb = Number(getFact(facts, 'storageGrowth')?.value);
  if (![cap, used, growthGb].every((item) => Number.isFinite(item) && item > 0)) {
    return null;
  }
  const growthTb = growthGb / 1000;
  const target = cap * STORAGE_EXERCISE_THRESHOLD.ratio;
  const gap = target - used;
  if (gap <= 0) {
    return { months: 0, target, gap, growthTb, note: 'El uso actual ya alcanza o supera el umbral de ejercicio.' };
  }
  return {
    months: gap / growthTb,
    target,
    gap,
    growthTb,
    note: STORAGE_EXERCISE_THRESHOLD.note,
  };
}

export function traceStepsForMetric(metricId, facts) {
  const expected = facts?.length ? expectedFromFacts(facts) : {};
  const period = Number(getFact(facts, 'periodHours')?.value);
  const down = Number(getFact(facts, 'downtimeHours')?.value);
  const recovery = Number(getFact(facts, 'totalRecoveryHours')?.value);
  const incidents = Number(getFact(facts, 'incidentCount')?.value);
  const cap = Number(getFact(facts, 'storageCapacity')?.value);
  const used = Number(getFact(facts, 'storageUsed')?.value);
  if (metricId === 'availability' && period && Number.isFinite(down)) {
    return [
      `Indisponibilidad = ${down} h (suma; no cifra literal del PDF)`,
      `Tiempo operativo = ${period} − ${down} = ${expected.uptimeHours} h`,
      `Disponibilidad = (${period} − ${down}) / ${period} × 100 ≈ ${Number(expected.availabilityPercent).toFixed(2)} %`,
    ];
  }
  if (metricId === 'mttr' && recovery && incidents) {
    const minutes = recovery * 60;
    return [
      `MTTR = ${recovery} h / ${incidents} = ${Number(expected.mttrHours).toFixed(2)} h`,
      `${minutes} min / ${incidents} = ${minutes / incidents} min (2 h 8 min)`,
    ];
  }
  if (metricId === 'mtbf' && period && incidents) {
    return [`MTBF ≈ ${expected.uptimeHours} / ${incidents} ≈ ${Number(expected.mtbfHours).toFixed(2)} h (estimación)`];
  }
  if (metricId === 'storage' && cap && used) {
    const threshold = storageThresholdMonths(facts);
    return [
      `Uso = ${used} / ${cap} × 100 = ${expected.storageUsedPercent} %`,
      `Libre = ${cap} − ${used} = ${expected.storageFreeTb} TB`,
      `Meses al 100 % ≈ ${Number(expected.storageMonths).toFixed(2)} (proyección)`,
      threshold
        ? `Ejercicio 85 % (no está en el PDF): ${Number(threshold.months).toFixed(2)} meses`
        : STORAGE_EXERCISE_THRESHOLD.note,
    ];
  }
  if (metricId === 'performance') {
    return [
      `Relación de latencia ≈ ${Number(expected.latencyRatio).toFixed(2)}`,
      `Incremento de demanda del corte ≈ ${Number(expected.demandIncreasePercent).toFixed(1)} % (no es crecimiento anual)`,
    ];
  }
  return [];
}

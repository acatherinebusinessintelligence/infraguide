export function parseStudentNumber(raw) {
  if (raw == null) {
    return { ok: false, reason: 'empty' };
  }
  const trimmed = String(raw).trim().replace(/\s/g, '').replace(',', '.');
  if (!trimmed) {
    return { ok: false, reason: 'empty' };
  }
  const value = Number(trimmed);
  if (Number.isNaN(value)) {
    return { ok: false, reason: 'nan' };
  }
  if (!Number.isFinite(value)) {
    return { ok: false, reason: 'infinity' };
  }
  return { ok: true, value };
}

export function numbersClose(actual, expected, tolerance = 0.05) {
  return Math.abs(actual - expected) <= tolerance;
}

export function validateMetricInput(raw, { expected, tolerance = 0.05, min = 0, max = null, allowOver100 = false } = {}) {
  const parsed = parseStudentNumber(raw);
  if (!parsed.ok) {
    return {
      ok: false,
      reason: parsed.reason,
      message:
        parsed.reason === 'empty'
          ? 'Escribe un número. Puedes usar coma o punto decimal.'
          : 'Ese valor no es un número válido. No se aceptan NaN ni infinito.',
    };
  }
  if (parsed.value < min) {
    return { ok: false, reason: 'negative', message: 'Un tiempo o un porcentaje de este tipo no puede ser negativo.' };
  }
  if (!allowOver100 && max == null && parsed.value > 100 && expected != null && expected <= 100) {
    return { ok: false, reason: 'over100', message: 'Un porcentaje de disponibilidad no puede superar 100 %.' };
  }
  if (max != null && parsed.value > max) {
    return { ok: false, reason: 'max', message: `El valor no puede ser mayor que ${max}.` };
  }
  if (expected != null && !numbersClose(parsed.value, expected, tolerance)) {
    return {
      ok: false,
      reason: 'mismatch',
      message: 'Revisa la operación. El resultado no coincide con los datos del caso.',
    };
  }
  return { ok: true, value: parsed.value };
}

export function formatEsNumber(value, decimals = 2) {
  if (!Number.isFinite(value)) {
    return '';
  }
  return value.toLocaleString('es-CO', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

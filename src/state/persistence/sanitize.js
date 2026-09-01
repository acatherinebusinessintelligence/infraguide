const TAGS = /<\/?[^>]+>/g;
const DANGEROUS_KEYS = new Set(['__proto__', 'prototype', 'constructor']);

export function stripRenderedText(value) {
  if (value == null) return '';
  return String(value)
    .replace(/\u0000/g, '')
    .replace(TAGS, '')
    .replace(/javascript:/gi, '')
    .trim();
}

export function sanitizePersistedValue(value) {
  if (value == null) return value;
  const type = typeof value;
  if (type === 'string') return stripRenderedText(value);
  if (type === 'number') return Number.isFinite(value) ? value : 0;
  if (type === 'boolean') return value;
  if (type === 'function' || type === 'symbol') return null;
  if (Array.isArray(value)) return value.map((item) => sanitizePersistedValue(item));
  if (type === 'object') {
    const out = {};
    Object.keys(value).forEach((key) => {
      if (DANGEROUS_KEYS.has(key)) return;
      out[key] = sanitizePersistedValue(value[key]);
    });
    return out;
  }
  return null;
}

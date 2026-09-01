/**
 * Checksum no criptográfico. Solo detecta corrupción accidental.
 * No se usa como mecanismo de seguridad.
 */
export function checksum(value) {
  const text = typeof value === 'string' ? value : stableStringify(value);
  let hash = 2166136261;
  for (let index = 0; index < text.length; index += 1) {
    hash ^= text.charCodeAt(index);
    hash = Math.imul(hash, 16777619);
  }
  return (hash >>> 0).toString(16).padStart(8, '0');
}

export function checksumMatches(value, expected) {
  if (!expected || typeof expected !== 'string') return true;
  return checksum(value) === expected;
}

function stableStringify(value) {
  if (value == null) return String(value);
  if (typeof value !== 'object') return JSON.stringify(value);
  if (Array.isArray(value)) {
    return `[${value.map((item) => stableStringify(item)).join(',')}]`;
  }
  const keys = Object.keys(value).sort();
  return `{${keys.map((key) => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(',')}}`;
}

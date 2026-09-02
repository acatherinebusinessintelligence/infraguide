const TAGS = /<\/?[^>]+>/g;
const SCRIPTISH = /<\s*script|javascript:|onerror\s*=|onload\s*=/i;
const TECH_ID = /\b(finding|metric|component|dec|itil|cobit|iso|ev)-\d+/i;

export function sanitizePlain(value) {
  if (value == null) return '';
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return '';
    return String(value);
  }
  let text = String(value);
  if (text === 'undefined' || text === 'NaN' || text === 'null') return '';
  text = text.replace(TAGS, '');
  return text.trim();
}

export function looksUnsafe(value) {
  return SCRIPTISH.test(String(value ?? ''));
}

export function hasBrokenPlaceholder(value) {
  const text = String(value ?? '');
  return /\bundefined\b|\bNaN\b/.test(text);
}

export function containsTechnicalId(value) {
  return TECH_ID.test(String(value ?? ''));
}

export function stripTechnicalIds(value) {
  return sanitizePlain(value)
    .replace(/\b(finding|metric|component|dec|itil|cobit|iso|ev)-[\w-]+/gi, '')
    .replace(/\s{2,}/g, ' ')
    .trim();
}

export function safeFileName(name, ext) {
  const stem = String(name ?? 'Documento')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Za-z0-9]+/g, '_')
    .replace(/^_+|_+$/g, '')
    .slice(0, 80) || 'Documento';
  if (!ext) return stem;
  const suffix = ext.startsWith('.') ? ext : `.${ext}`;
  return `${stem}${suffix}`;
}

export function generateTimestamp(date = new Date()) {
  return date.toISOString();
}

export function formatLocalDate(date = new Date()) {
  try {
    return date.toLocaleDateString('es-CO');
  } catch {
    return date.toISOString().slice(0, 10);
  }
}

export function downloadBlob(blob, filename) {
  if (typeof document === 'undefined') return false;
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 1500);
  return true;
}

export function exportBaseName(caseName) {
  const raw = sanitizePlain(caseName).replace(/S\.A\.S\.?/gi, '').trim() || 'Caso';
  return safeFileName(`Informe Tecnico Consultoria ${raw}`, '').replace(/\.$/, '');
}

export function modelConsultoriaBaseName() {
  return 'Informe_Modelo_Consultoria_Helados_Boreal';
}

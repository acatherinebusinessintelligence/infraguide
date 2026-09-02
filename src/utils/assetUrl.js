import { pagesBase, PUBLIC_APP_URL } from '../config.js';

function normalizeBase(base) {
  const value = typeof base === 'string' && base.length ? base : '/';
  return value.endsWith('/') ? value : `${value}/`;
}

export function assetUrl(relativePath) {
  const prefix = normalizeBase(pagesBase);
  const path = String(relativePath || '').replace(/^\/+/, '');
  return `${prefix}${path}`;
}

export function publicAssetUrl(relativePath) {
  const prefix = normalizeBase(PUBLIC_APP_URL);
  const path = String(relativePath || '').replace(/^\/+/, '').replace(/^infraguide\//, '');
  return `${prefix}${path}`;
}

export function pdfPageHref(file, page, { standalone = false } = {}) {
  const url = standalone ? publicAssetUrl(file) : assetUrl(file);
  const n = Number(page);
  if (Number.isFinite(n) && n >= 1) {
    return `${url}#page=${n}`;
  }
  return url;
}

export function sanitizeExportHref(href) {
  if (!href) return '';
  let out = String(href).trim();
  out = out.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, '');
  if (!out) return '';
  if (/^https?:\/\//i.test(out)) {
    return out.replace(/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/i, PUBLIC_APP_URL.replace(/\/$/, ''));
  }
  if (out.startsWith('#') || out.startsWith('./') || out.startsWith('../')) {
    return out;
  }
  if (out.startsWith('/')) {
    const path = out.replace(/^\/infraguide\/?/, '').replace(/^\/+/, '');
    return publicAssetUrl(path);
  }
  return publicAssetUrl(out);
}

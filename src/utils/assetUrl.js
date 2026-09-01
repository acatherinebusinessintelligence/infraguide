import { pagesBase } from '../config.js';

export function assetUrl(relativePath) {
  const base = typeof pagesBase === 'string' && pagesBase.length ? pagesBase : '/';
  const prefix = base.endsWith('/') ? base : `${base}/`;
  const path = String(relativePath || '').replace(/^\/+/, '');
  return `${prefix}${path}`;
}

export function pdfPageHref(file, page) {
  const url = assetUrl(file);
  const n = Number(page);
  if (Number.isFinite(n) && n >= 1) {
    return `${url}#page=${n}`;
  }
  return url;
}

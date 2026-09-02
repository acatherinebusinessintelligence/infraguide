import { exportBaseName } from './text.js';
import { renderDocumentBody, wrapStandaloneHtml } from './documentHtml.js';
import { sanitizeExportHref } from '../utils/assetUrl.js';

function scrubLocalhost(html) {
  return String(html || '')
    .replace(/https?:\/\/localhost(?::\d+)?/gi, '')
    .replace(/https?:\/\/127\.0\.0\.1(?::\d+)?/gi, '');
}

function rewriteHrefs(html) {
  return scrubLocalhost(html).replace(/\shref="([^"]+)"/g, (match, href) => {
    if (href.startsWith('#') || href.startsWith('mailto:')) return match;
    return ` href="${sanitizeExportHref(href)}"`;
  });
}

export function HtmlExporter(model, options = {}) {
  const inner = renderDocumentBody(model, 'html');
  const html = rewriteHrefs(wrapStandaloneHtml(model, inner));
  const fileName = `${options.fileBase || exportBaseName(model.cover.caseName)}.html`;
  return { html, fileName, mime: 'text/html;charset=utf-8' };
}

export function htmlBlob(model) {
  const { html, fileName, mime } = HtmlExporter(model);
  return { blob: new Blob([html], { type: mime }), fileName, html };
}

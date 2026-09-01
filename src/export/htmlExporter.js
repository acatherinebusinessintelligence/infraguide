import { exportBaseName } from './text.js';
import { renderDocumentBody, wrapStandaloneHtml } from './documentHtml.js';

export function HtmlExporter(model) {
  const inner = renderDocumentBody(model, 'html');
  const html = wrapStandaloneHtml(model, inner);
  const fileName = `${exportBaseName(model.cover.caseName)}.html`;
  return { html, fileName, mime: 'text/html;charset=utf-8' };
}

export function htmlBlob(model) {
  const { html, fileName, mime } = HtmlExporter(model);
  return { blob: new Blob([html], { type: mime }), fileName, html };
}

import { assetUrl } from '../../utils/assetUrl.js';
import { highlightTextLayer } from './EvidenceHighlighter.js';

const MIN_SCALE = 0.7;
const MAX_SCALE = 2.4;

let pdfjsLib = null;
let cached = { url: null, pdf: null };
let current = {
  page: 1,
  pageCount: 1,
  scale: 1.15,
  fitWidth: true,
  quote: '',
};

async function loadPdfJs() {
  if (pdfjsLib) return pdfjsLib;
  const mod = await import('pdfjs-dist');
  const worker = await import('pdfjs-dist/build/pdf.worker.min.mjs?url');
  mod.GlobalWorkerOptions.workerSrc = worker.default;
  pdfjsLib = mod;
  return pdfjsLib;
}

async function getDocument(url) {
  if (cached.url === url && cached.pdf) {
    return cached.pdf;
  }
  const lib = await loadPdfJs();
  const loading = lib.getDocument({
    url,
    withCredentials: false,
    isEvalSupported: false,
  });
  const pdf = await loading.promise;
  cached = { url, pdf };
  return pdf;
}

function fitScale(page, container) {
  if (!container) return current.scale;
  const viewport = page.getViewport({ scale: 1 });
  const width = container.clientWidth || 720;
  return Math.max(MIN_SCALE, Math.min(MAX_SCALE, (width - 24) / viewport.width));
}

async function renderPage(root) {
  const canvas = root.querySelector('[data-pdf-canvas]');
  const textLayer = root.querySelector('[data-pdf-text-layer]');
  const highlight = root.querySelector('[data-pdf-highlight-layer]');
  const fallback = root.querySelector('[data-pdf-fallback]');
  const stage = root.querySelector('[data-pdf-stage]');
  const total = root.querySelector('[data-pdf-page-total]');
  const input = root.querySelector('[data-pdf-page-input]');
  if (!canvas || !cached.pdf) return;

  const pageNumber = Math.min(Math.max(1, current.page), cached.pdf.numPages);
  current.page = pageNumber;
  current.pageCount = cached.pdf.numPages;
  if (total) total.textContent = ` / ${current.pageCount}`;
  if (input && document.activeElement !== input) input.value = String(pageNumber);

  const page = await cached.pdf.getPage(pageNumber);
  const scale = current.fitWidth ? fitScale(page, stage) : current.scale;
  current.scale = scale;
  const viewport = page.getViewport({ scale });
  const context = canvas.getContext('2d', { alpha: false });
  canvas.width = viewport.width;
  canvas.height = viewport.height;
  canvas.style.width = `${viewport.width}px`;
  canvas.style.height = `${viewport.height}px`;
  await page.render({ canvasContext: context, viewport }).promise;

  if (textLayer) {
    textLayer.innerHTML = '';
    textLayer.style.width = `${viewport.width}px`;
    textLayer.style.height = `${viewport.height}px`;
    try {
      const textContent = await page.getTextContent();
      const lib = await loadPdfJs();
      if (lib.renderTextLayer) {
        await lib.renderTextLayer({
          textContentSource: textContent,
          container: textLayer,
          viewport,
        }).promise;
      } else {
        textContent.items.forEach((item) => {
          const span = document.createElement('span');
          span.textContent = item.str;
          textLayer.append(span);
        });
      }
      const hasText = (textContent.items || []).some((item) => String(item.str || '').trim());
      const matched = hasText && current.quote ? highlightTextLayer(textLayer, current.quote) : false;
      if (highlight) {
        highlight.classList.toggle('is-marker', !matched);
        highlight.innerHTML = matched
          ? ''
          : '<div class="pdf-side-marker" aria-hidden="true"></div>';
      }
    } catch {
      if (highlight) {
        highlight.classList.add('is-marker');
        highlight.innerHTML = '<div class="pdf-side-marker" aria-hidden="true"></div>';
      }
    }
  }

  if (fallback) fallback.classList.add('is-hidden');
  stage?.scrollIntoView({ block: 'start' });
}

function activeRoot() {
  return document.querySelector('[data-pdf-root]');
}

export async function mountPdfRuntime(root, { url, page = 1, quote = '' }) {
  if (!root) return;
  const fallback = root.querySelector('[data-pdf-fallback]');
  current.page = Number(page) >= 1 ? Number(page) : 1;
  current.quote = quote || '';
  current.fitWidth = true;
  try {
    await getDocument(url);
    await renderPage(root);
  } catch {
    fallback?.classList.remove('is-hidden');
  }
}

export function pdfGoTo(page) {
  const root = activeRoot();
  if (!root) return;
  current.page = Number(page) || 1;
  renderPage(root);
}

export function pdfStep(delta) {
  pdfGoTo(current.page + delta);
}

export function pdfZoom(delta) {
  const root = activeRoot();
  if (!root) return;
  current.fitWidth = false;
  current.scale = Math.max(MIN_SCALE, Math.min(MAX_SCALE, current.scale + delta));
  renderPage(root);
}

export function pdfFitWidth() {
  const root = activeRoot();
  if (!root) return;
  current.fitWidth = true;
  renderPage(root);
}

export function pdfSetQuote(quote) {
  current.quote = quote || '';
}

export function pdfRuntimeState() {
  return { ...current };
}

export function sourcePdfAsset(file) {
  return assetUrl(file);
}

export function unmountPdfRuntime() {
  cached = { url: null, pdf: null };
}

import { readFileSync, writeFileSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const pdfjs = await import('pdfjs-dist/legacy/build/pdf.mjs');

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const file = join(root, 'public', 'cases', 'helados-boreal', 'caso-helados-boreal.pdf');
const data = new Uint8Array(readFileSync(file));
const loading = pdfjs.getDocument({ data, verbosity: 0, isEvalSupported: false, useSystemFonts: true });
const pdf = await loading.promise;
const pages = [];

for (let n = 1; n <= pdf.numPages; n += 1) {
  const page = await pdf.getPage(n);
  const content = await page.getTextContent();
  const lines = [];
  let current = '';
  let lastY = null;
  content.items.forEach((item) => {
    const y = item.transform?.[5];
    const str = String(item.str || '');
    if (lastY != null && Math.abs(y - lastY) > 6 && current.trim()) {
      lines.push(current.replace(/\s+/g, ' ').trim());
      current = '';
    }
    current += (current && !current.endsWith(' ') && str && !str.startsWith(' ') ? ' ' : '') + str;
    lastY = y;
  });
  if (current.trim()) lines.push(current.replace(/\s+/g, ' ').trim());
  pages.push({ page: n, text: lines.join('\n') });
}

const out = join(root, 'tmp-pdf-extract.json');
writeFileSync(out, JSON.stringify({ pages: pdf.numPages, items: pages }, null, 2), 'utf8');
console.log(`pages=${pdf.numPages} wrote ${out}`);
pages.forEach((item) => {
  console.log(`\n===== PAGE ${item.page} (${item.text.length} chars) =====`);
  console.log(item.text);
});

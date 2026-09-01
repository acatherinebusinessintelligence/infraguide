import { mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const lines = [
  'PENDIENTE DE VINCULAR',
  'Este archivo es un marcador de posicion.',
  'No es el PDF original del caso Helados Boreal.',
  'Coloque el documento fuente en:',
  'public/cases/helados-boreal/caso-helados-boreal.pdf',
  'Hasta entonces, ninguna evidencia debe marcarse como verificada.',
];

function encodeWinAnsi(text) {
  return text.replace(/[()\\]/g, '\\$&');
}

const commands = ['BT', '/F1 14 Tf', '50 720 Td'];
lines.forEach((line, index) => {
  if (index === 0) {
    commands.push(`(${encodeWinAnsi(line)}) Tj`);
  } else {
    commands.push('0 -22 Td');
    commands.push(`(${encodeWinAnsi(line)}) Tj`);
  }
});
commands.push('ET');
const stream = commands.join('\n');

const objects = [
  '1 0 obj << /Type /Catalog /Pages 2 0 R >> endobj',
  '2 0 obj << /Type /Pages /Kids [3 0 R] /Count 1 >> endobj',
  '3 0 obj << /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R >> >> >> endobj',
  `4 0 obj << /Length ${stream.length} >> stream\n${stream}\nendstream endobj`,
  '5 0 obj << /Type /Font /Subtype /Type1 /BaseFont /Helvetica >> endobj',
];

let body = '%PDF-1.4\n';
const offsets = [0];
objects.forEach((obj) => {
  offsets.push(Buffer.byteLength(body, 'latin1'));
  body += `${obj}\n`;
});
const xrefStart = Buffer.byteLength(body, 'latin1');
let xref = `xref\n0 6\n0000000000 65535 f \n`;
for (let i = 1; i <= 5; i += 1) {
  xref += `${String(offsets[i]).padStart(10, '0')} 00000 n \n`;
}
body += xref;
body += `trailer << /Size 6 /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF\n`;

const dir = join(dirname(fileURLToPath(import.meta.url)), '..', 'public', 'cases', 'helados-boreal');
mkdirSync(dir, { recursive: true });
const target = join(dir, 'caso-helados-boreal.pdf');
writeFileSync(target, body, 'latin1');
console.log(`Wrote ${target}`);

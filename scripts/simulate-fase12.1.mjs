import { getCaseById, listCaseFields } from '../src/data/cases/index.js';
import { validateCase } from '../src/data/cases/caseValidator.js';
import {
  EvidenceValidator,
  buildEvidenceRegistry,
  getPrimarySourceDocument,
  caseMapSections,
  calculatedMetrics,
  formatAcademicCitation,
} from '../src/data/evidence/index.js';
import { parseRoute } from '../src/utils/router.js';
import { assetUrl, pdfPageHref } from '../src/utils/assetUrl.js';
import { existsSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

const boreal = getCaseById('modelo-helados-boreal');
assert(boreal, 'No está el caso Helados Boreal');
assert(validateCase(boreal).ok, `CaseValidator: ${validateCase(boreal).errors.join(' ')}`);

const doc = getPrimarySourceDocument(boreal);
assert(doc?.id === 'caso-helados-boreal', 'Falta sourceDocuments.id');
assert(doc.file === 'cases/helados-boreal/caso-helados-boreal.pdf', `file: ${doc.file}`);
assert(doc.linked === true, 'El original debe marcarse vinculado');
assert(doc.placeholder === false, 'Ya no es placeholder');
assert(Number(doc.pages) === 10, `pages: ${doc.pages}`);

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pdfPath = join(root, 'public', doc.file);
assert(existsSync(pdfPath), `No existe el PDF en ${pdfPath}`);

const evidence = EvidenceValidator(boreal);
assert(evidence.ok, `EvidenceValidator: ${evidence.errors.join(' ')}`);
assert(evidence.verifiedCount > 20, `Deben existir evidencias verificadas (${evidence.verifiedCount})`);
assert(evidence.evidenceCount > 20, `Registry corto: ${evidence.evidenceCount}`);

const registry = buildEvidenceRegistry(boreal);
const inventedPages = registry.filter((item) => item.page != null && Number(item.page) > Number(doc.pages));
assert(inventedPages.length === 0, 'Hay páginas fuera del PDF');
const calculated = registry.filter((item) => item.origin === 'CALCULATED');
assert(calculated.length >= 2, 'Faltan campos calculados');
assert(
  calculated.every((item) => item.verified !== true),
  'Un resultado calculado no puede marcarse verified',
);

const fields = listCaseFields(boreal);
assert(fields.length === registry.length, 'Cada dato del JSON debe tener evidencia');

calculatedMetrics.forEach((metric) => {
  metric.sourceKeys.forEach((key) => {
    assert(fields.some((item) => item.field.key === key), `Falta dato fuente ${key} para ${metric.id}`);
  });
});

const map = caseMapSections(boreal);
assert(map.some((item) => item.sourceSectionId === 'context'), 'Mapa sin contexto');
assert(map.every((item) => item.page == null || item.verified), 'El mapa no puede publicar páginas no verificadas');

assert(parseRoute('/caso/conocer').view === 'caseIntro', 'Ruta intro');
assert(parseRoute('/caso/lectura').view === 'caseGuided', 'Ruta lectura');
assert(parseRoute('/caso/documento').view === 'casePdf', 'Ruta PDF');

const href = pdfPageHref(doc.file, 3);
assert(href.includes('cases/helados-boreal/caso-helados-boreal.pdf'), href);
assert(href.includes('#page=3'), href);
assert(assetUrl(doc.file).includes(doc.file), assetUrl(doc.file));

const citation = formatAcademicCitation(boreal, registry.find((item) => item.verified));
assert(citation.includes('Helados Boreal'), citation);
assert(/página \d+/.test(citation), `La cita verificada debe incluir página: ${citation}`);

const calcCitation = formatAcademicCitation(boreal, calculated[0]);
assert(calcCitation.includes('calculado') || calcCitation.includes('calculada'), calcCitation);

console.log(
  JSON.stringify(
    {
      ok: true,
      pdf: doc.file,
      evidenceCount: evidence.evidenceCount,
      verifiedCount: evidence.verifiedCount,
      pendingCount: evidence.pendingCount,
      calculatedCount: calculated.length,
      warnings: evidence.warnings?.slice(0, 8) ?? [],
      sections: map.map((item) => item.title),
    },
    null,
    2,
  ),
);

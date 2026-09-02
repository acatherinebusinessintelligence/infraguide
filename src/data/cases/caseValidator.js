import { normalizeCaseMode } from './caseMode.js';

const REQUIRED_SECTIONS = [
  'context',
  'services',
  'infrastructure',
  'operational-data',
  'incidents',
  'constraints',
];

export function validateCase(caseData) {
  const errors = [];
  if (!caseData || typeof caseData !== 'object') {
    return { ok: false, errors: ['El caso no es un objeto JSON válido.'] };
  }
  if (!String(caseData.id || '').trim()) errors.push('Falta id.');
  if (!String(caseData.name || '').trim()) errors.push('Falta name.');
  if (!normalizeCaseMode(caseData.caseMode)) {
    errors.push('Falta caseMode válido (MODEL_SOLVED o STUDENT_WORK).');
  }
  if (!Array.isArray(caseData.sections) || !caseData.sections.length) {
    errors.push('Faltan secciones.');
    return { ok: false, errors };
  }

  const sectionIds = new Set();
  caseData.sections.forEach((section, index) => {
    if (!section?.sectionId) {
      errors.push(`La sección ${index + 1} no tiene sectionId.`);
      return;
    }
    sectionIds.add(section.sectionId);
  });

  REQUIRED_SECTIONS.forEach((id) => {
    if (!sectionIds.has(id)) errors.push(`Falta la sección crítica “${id}”.`);
  });

  caseData.sections.forEach((section) => {
    (section.blocks ?? []).forEach((block) => {
      collectFields(block).forEach((field) => {
        if (!field || typeof field !== 'object') {
          errors.push(`Dato mal formado en ${section.sectionId}.`);
          return;
        }
        if (field.sourceSectionId && !sectionIds.has(field.sourceSectionId)) {
          errors.push(`sourceSectionId inválido (${field.sourceSectionId}) en ${section.sectionId}.`);
        }
      });
    });
  });

  if (Array.isArray(caseData.sourceDocuments)) {
    caseData.sourceDocuments.forEach((doc, index) => {
      if (!doc?.id) errors.push(`sourceDocuments[${index}] no tiene id.`);
      if (!doc?.file) errors.push(`sourceDocuments[${index}] no tiene file.`);
    });
  }

  if (Array.isArray(caseData.evidenceRegistry)) {
    const seen = new Set();
    caseData.evidenceRegistry.forEach((item, index) => {
      if (!item?.evidenceId) {
        errors.push(`evidenceRegistry[${index}] no tiene evidenceId.`);
        return;
      }
      if (seen.has(item.evidenceId)) {
        errors.push(`evidenceId duplicado: ${item.evidenceId}.`);
      }
      seen.add(item.evidenceId);
      if (item.sourceSectionId && !sectionIds.has(item.sourceSectionId)) {
        errors.push(`evidenceRegistry ${item.evidenceId}: sourceSectionId inválido.`);
      }
      if (item.verified === true && (item.page == null || Number(item.page) < 1)) {
        errors.push(`evidenceRegistry ${item.evidenceId}: verificada sin página.`);
      }
    });
  }

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

function collectFields(block) {
  const fields = [...(block.fields ?? [])];
  (block.records ?? []).forEach((record) => {
    fields.push(...(record.fields ?? []));
  });
  return fields;
}

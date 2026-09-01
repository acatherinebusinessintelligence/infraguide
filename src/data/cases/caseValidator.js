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

  return { ok: errors.length === 0, errors: [...new Set(errors)] };
}

function collectFields(block) {
  const fields = [...(block.fields ?? [])];
  (block.records ?? []).forEach((record) => {
    fields.push(...(record.fields ?? []));
  });
  return fields;
}

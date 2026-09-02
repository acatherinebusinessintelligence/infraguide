import borealModel from './caso-modelo-helados-boreal.json' with { type: 'json' };
import { validateCase } from './caseValidator.js';
import { CASE_MODE, isModelSolvedCase, isStudentWorkCase } from './caseMode.js';

const extraCases = [];

function warnInvalid(entry, errors) {
  if (typeof console !== 'undefined') {
    console.warn(`InfraGuide omitió el caso “${entry.id}”: ${errors.join(' ')}`);
  }
}

export const caseRegistry = [
  {
    id: borealModel.id,
    name: borealModel.name,
    type: borealModel.kind || 'model',
    data: borealModel,
  },
];

export const cases = caseRegistry
  .map((entry) => {
    const result = validateCase(entry.data);
    if (!result.ok) {
      warnInvalid(entry, result.errors);
      return null;
    }
    return entry.data;
  })
  .filter(Boolean);

export function getRegisteredCases() {
  return caseRegistry;
}

export function registerCaseForTests(caseData) {
  const result = validateCase(caseData);
  if (!result.ok) {
    throw new Error(`Fixture de caso inválido: ${result.errors.join(' ')}`);
  }
  const idx = extraCases.findIndex((item) => item.id === caseData.id);
  if (idx >= 0) extraCases[idx] = caseData;
  else extraCases.push(caseData);
  return caseData;
}

export function getCaseById(id) {
  return cases.find((item) => item.id === id) ?? extraCases.find((item) => item.id === id) ?? null;
}

export function getModelCases() {
  return cases.filter((item) => isModelSolvedCase(item));
}

export function getStudentWorkCases() {
  return cases.filter((item) => isStudentWorkCase(item));
}

export { CASE_MODE, isModelSolvedCase, isStudentWorkCase };

export function getCaseSection(caseData, sectionId) {
  return caseData?.sections?.find((section) => section.sectionId === sectionId) ?? null;
}

export function listCaseFields(caseData) {
  const results = [];
  if (!caseData?.sections) {
    return results;
  }

  caseData.sections.forEach((section) => {
    (section.blocks ?? []).forEach((block) => {
      (block.fields ?? []).forEach((field) => {
        results.push({ field, section, recordTitle: block.title ?? null });
      });
      (block.records ?? []).forEach((record) => {
        (record.fields ?? []).forEach((field) => {
          results.push({ field, section, recordTitle: record.title });
        });
      });
    });
  });

  return results;
}

export function getCaseField(caseData, key) {
  return listCaseFields(caseData).find((entry) => entry.field.key === key) ?? null;
}

export function formatFieldValue(field) {
  if (!field) {
    return '';
  }
  if (field.displayValue) {
    return field.displayValue;
  }
  const unit = field.unit ? ` ${field.unit}` : '';
  const qualifier = field.qualifier ? `${field.qualifier} ` : '';
  return `${qualifier}${field.value}${unit}`.trim();
}

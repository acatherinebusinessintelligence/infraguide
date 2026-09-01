import { APP_VERSION, PERSISTENCE_VERSION, STORAGE_STATE_KEY, pagesBase, debugMode } from '../config.js';
import { stages } from '../data/stages/index.js';
import { documentSections } from '../data/document/sections.js';
import { cases, getRegisteredCases } from '../data/cases/index.js';
import { validateCase } from '../data/cases/caseValidator.js';
import { EvidenceValidator } from '../data/evidence/evidenceValidator.js';

export function runAppHealthCheck() {
  const issues = [];
  if (!APP_VERSION) issues.push('Falta la versión de InfraGuide.');
  if (!PERSISTENCE_VERSION) issues.push('Falta la versión de persistencia.');
  if (!STORAGE_STATE_KEY || STORAGE_STATE_KEY !== 'infraguide_state') {
    issues.push('El namespace de persistencia no es específico.');
  }
  if (!Array.isArray(stages) || stages.length < 8) issues.push('El catálogo de etapas está incompleto.');
  if (!Array.isArray(documentSections) || documentSections.length < 14) {
    issues.push('El esquema del documento está incompleto.');
  }
  if (!getRegisteredCases().length) issues.push('No hay casos en el registro.');
  if (!cases.length) issues.push('No hay casos válidos disponibles.');
  cases.forEach((item) => {
    const result = validateCase(item);
    if (!result.ok) issues.push(`Caso ${item.id}: ${result.errors.join(' ')}`);
    const evidence = EvidenceValidator(item);
    if (!evidence.ok) issues.push(`Evidencias ${item.id}: ${evidence.errors.join(' ')}`);
  });
  if (typeof pagesBase !== 'string') issues.push('Base path no configurado.');

  return {
    ok: issues.length === 0,
    issues,
    debugMode,
    version: APP_VERSION,
    persistenceVersion: PERSISTENCE_VERSION,
    caseCount: cases.length,
  };
}

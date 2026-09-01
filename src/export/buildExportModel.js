import { effectiveExportConfig, createExportConfig } from '../data/methodology/export.js';
import { assembleDocument } from '../state/buildModel.js';
import { documentedFindings } from '../state/decideModel.js';
import { generateConsultingReport, consultingReportToExportModel } from '../report/index.js';
import { hasBrokenPlaceholder, looksUnsafe, sanitizePlain } from './text.js';

export function validateExportPayload(state, config) {
  const errors = [];
  if (!state.analysis?.build?.readyToExport) {
    errors.push('Tu documento todavía requiere revisión antes de exportar.');
  }
  (state.analysis?.decide?.recommendations ?? []).forEach((rec) => {
    const blob = `${rec.decision} ${rec.benefitText} ${rec.metricText}`;
    if (hasBrokenPlaceholder(blob) || looksUnsafe(blob)) {
      errors.push('Una recomendación contiene un valor no exportable.');
    }
  });
  documentedFindings(state).forEach((item) => {
    const blob = `${item.title} ${item.description} ${item.impact}`;
    if (hasBrokenPlaceholder(blob) || looksUnsafe(blob)) {
      errors.push('Un hallazgo contiene un valor no exportable.');
    }
  });
  assembleDocument(state).forEach((section) => {
    if (looksUnsafe(section.text) || hasBrokenPlaceholder(section.text)) {
      errors.push(`La sección ${section.title} contiene un valor no exportable.`);
    }
  });
  void config;
  return [...new Set(errors)];
}

export function buildExportModel(state, rawConfig = createExportConfig()) {
  const config = effectiveExportConfig(rawConfig);
  const report = generateConsultingReport(state);
  return consultingReportToExportModel(report, config);
}

export function modelHasTechnicalIds(model) {
  const blob = JSON.stringify({ cover: model.cover, sections: model.sections });
  return /\bfinding-\d{2}\b|\bdec-\d{2}\b|\bev-[a-z]+(?:-[a-z0-9]+)*\b/i.test(blob);
}

export function consultingWarnings(state, rawConfig = createExportConfig()) {
  const model = buildExportModel(state, rawConfig);
  return model.report?.validation ?? { ok: true, errors: [], warnings: [] };
}

export { sanitizePlain };

import { documentedFindings } from '../../state/decideModel.js';
import { consultingDocumentSections } from '../document/consultingSections.js';
import { sectionStatusFor } from '../../state/documentTrace.js';
import { EVIDENCE_ORIGIN } from './status.js';
import { generateConsultingReport } from '../../report/consultingReportGenerator.js';

export function TraceabilityValidator(state) {
  const errors = [];
  const warnings = [];
  const measure = state.analysis?.measure ?? {};
  const recs = state.analysis?.decide?.recommendations ?? [];
  const findings = documentedFindings(state);
  const report = generateConsultingReport(state);

  ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'].forEach((id) => {
    const slot = measure[id];
    if (!slot || slot.result == null) return;
    if (!(slot.sourceKeys ?? []).length && !(slot.trace?.inputs ?? []).length) {
      errors.push(`${id}: cálculo sin datos fuente.`);
    }
  });

  findings.forEach((item) => {
    if (!(item.evidenceIds ?? []).length) {
      errors.push(`${item.findingId}: hallazgo sin evidencia.`);
    }
  });

  recs.forEach((item) => {
    if (!(item.findingIds ?? []).length) {
      errors.push(`${item.decisionId || item.title}: recomendación sin hallazgo.`);
    }
    if (!item.riskText && !item.impact) {
      warnings.push(`${item.decisionId || item.title}: decisión sin riesgo o impacto asociado.`);
    }
  });

  consultingDocumentSections.forEach((spec) => {
    const status = sectionStatusFor(spec.key, state, report);
    if (status !== 'VACÍO' && !spec.activityId) {
      errors.push(`${spec.key}: sección del documento sin origen.`);
    }
  });

  (report.performanceAndCapacity ?? []).forEach((metric) => {
    if (metric.kind === 'cálculo' && /pdf|literal|texto del caso/i.test(String(metric.result || ''))) {
      errors.push(`${metric.id}: resultado calculado presentado como dato textual.`);
    }
  });

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
}

export function ReportValidator(report) {
  const errors = [];
  const warnings = [];
  const required = [
    'executiveOpinion',
    'scope',
    'findings',
    'architectureAssessment',
    'performanceAndCapacity',
    'prioritizedRisks',
    'targetArchitecture',
    'alternatives',
    'recommendedProgram',
    'governance',
    'closing',
    'evidenceRegister',
    'detailedEngineeringRequirements',
  ];

  required.forEach((key) => {
    const value = report?.[key];
    const empty = value == null || (Array.isArray(value) && !value.length) || (typeof value === 'object' && !Array.isArray(value) && !Object.keys(value).length);
    if (empty) errors.push(`Sección obligatoria vacía: ${key}.`);
  });

  (report?.findings ?? []).forEach((item) => {
    if (!item.acceptance && !item.criterion) {
      warnings.push(`${item.id}: hallazgo sin criterio de aceptación.`);
    }
    if ((item.evidence ?? []).some((ev) => !ev.evidenceId)) {
      errors.push(`${item.id}: referencia de evidencia rota.`);
    }
  });

  (report?.evidenceRegister ?? []).forEach((item) => {
    if (item.verificationStatus === 'VERIFICADA' && !item.quote && !item.extract) {
      errors.push(`${item.evidenceId}: evidencia pendiente presentada como confirmada.`);
    }
  });

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
  };
}

export { EVIDENCE_ORIGIN };

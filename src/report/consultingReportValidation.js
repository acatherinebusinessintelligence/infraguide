import { EVIDENCE_STATE, STATEMENT_KIND } from './consultingReportModel.js';

const INSUFFICIENT = 'Información insuficiente para emitir una conclusión definitiva';

export function validateConsultingReport(report) {
  const errors = [];
  const warnings = [];

  if (!report.findings?.length) {
    errors.push(INSUFFICIENT);
  }

  report.findings.forEach((item) => {
    if (!item.evidence?.length) {
      warnings.push(`${item.id}: sin evidenceId asociado.`);
    }
    item.evidence?.forEach((ev) => {
      if (!ev.evidenceId) {
        warnings.push(`${item.id}: evidencia sin evidenceId.`);
      }
      if (!ev.document && !ev.citation) {
        warnings.push(`${ev.evidenceId || item.id}: evidencia sin documento fuente.`);
      }
      if (ev.page == null) {
        warnings.push(`${ev.evidenceId || item.id}: evidencia sin página verificada.`);
      }
      if (ev.page != null && Number(ev.page) < 1) {
        errors.push(`${item.id}: página inválida en ${ev.evidenceId}.`);
      }
    });
    if (item.evidenceState === EVIDENCE_STATE.PENDING && item.kind === STATEMENT_KIND.FACT) {
      errors.push(`${item.id}: un hallazgo pendiente no puede figurar como confirmado.`);
    }
    if (item.evidenceState === EVIDENCE_STATE.CONFIRMED && item.kind === STATEMENT_KIND.CALCULATION) {
      warnings.push(`${item.id}: un cálculo no debe presentarse como cifra literal del PDF.`);
    }
  });

  (report.performanceAndCapacity ?? []).forEach((metric) => {
    if (metric.kind === 'cálculo' && !(metric.sources ?? []).length) {
      warnings.push(`${metric.id}: cálculo sin datos fuente.`);
    }
  });

  (report.targetArchitecture?.requirements ?? []).forEach((req) => {
    if (!(req.findingIds ?? []).length) {
      warnings.push(`${req.id}: requisito sin hallazgo asociado.`);
    }
    if (!req.acceptance || /pendiente/i.test(req.acceptance)) {
      warnings.push(`${req.id}: criterio de aceptación pendiente.`);
    }
  });

  (report.recommendedProgram?.initiatives ?? []).forEach((ini) => {
    if (!(ini.findingIds ?? []).length) {
      errors.push(`${ini.id}: la iniciativa no indica qué hallazgo o riesgo reduce.`);
    }
  });

  const pages = (report.evidenceRegister ?? []).map((item) => item.page).filter((page) => page != null);
  const max = report.metadata?.sourcePages;
  if (max != null) {
    pages.forEach((page) => {
      if (Number(page) > Number(max)) {
        errors.push(`Página ${page} no existe en el documento fuente (${max} páginas).`);
      }
    });
  }

  return {
    ok: errors.length === 0,
    errors: [...new Set(errors)],
    warnings: [...new Set(warnings)],
    insufficient: errors.includes(INSUFFICIENT),
  };
}

export { INSUFFICIENT };

import {
  DOCUMENT_STATUS,
  SECTION_STATUS,
  ISSUE_SEVERITY,
  PREVIEW_MODES,
  finalReportSections,
  metricSubsections,
  vagueConclusionPatterns,
  absolutePatterns,
  categoryKeywords,
  qualityChecks,
  terminology,
} from '../data/methodology/build.js';
import { DATA_STATUS } from '../data/methodology/data-map.js';
import { MIN_FINDINGS } from './diagnoseModel.js';
import { MIN_ITIL, MIN_COBIT, MIN_ISO, isItilComplete, isCobitComplete, isIsoComplete } from './governModel.js';
import { MIN_RECOMMENDATIONS, isRecommendationComplete, hasSuccessMetric, documentedFindings } from './decideModel.js';
import { expectedFromFacts, resolveCaseFacts } from './measureModel.js';
import { isDocumented } from './understandModel.js';
import { FINDING_STATUS } from '../data/methodology/diagnose.js';
import { GOVERN_STATUS } from '../data/methodology/govern.js';
import { DECISION_STATUS } from '../data/methodology/decide.js';
import { getCaseById } from '../data/cases/index.js';

export function createConclusionsDraft() {
  return {
    selectedFindings: [],
    selectedStrengths: [],
    constraintIds: [],
    priorities: [],
    limitations: [],
    limitationText: '',
    draft: '',
    warnings: [],
  };
}

export function createBuildState() {
  return {
    currentSubstage: 1,
    previewMode: PREVIEW_MODES.academic,
    previewSection: null,
    returnSection: null,
    previewReviewed: false,
    indexOpen: true,
    expandedRecId: null,
    conclusions: createConclusionsDraft(),
    validation: {},
    issues: [],
    quality: {},
    checkpoint: {},
    activities: {},
    readyToExport: false,
    completed: false,
  };
}

export function mergeBuild(saved) {
  const base = createBuildState();
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    ...saved,
    conclusions: {
      ...base.conclusions,
      ...saved.conclusions,
      selectedFindings: saved.conclusions?.selectedFindings ?? [],
      selectedStrengths: saved.conclusions?.selectedStrengths ?? [],
      constraintIds: saved.conclusions?.constraintIds ?? [],
      priorities: saved.conclusions?.priorities ?? [],
      limitations: saved.conclusions?.limitations ?? [],
    },
    validation: saved.validation ?? {},
    issues: Array.isArray(saved.issues) ? saved.issues : [],
    quality: saved.quality ?? {},
    checkpoint: saved.checkpoint ?? {},
    activities: saved.activities ?? {},
  };
}

export function sectionStatusOf(entry) {
  if (!entry || !(entry.text || '').trim()) return SECTION_STATUS.INCOMPLETE;
  if (entry.reviewRequired) return SECTION_STATUS.REVIEW_REQUIRED;
  if (entry.status === DATA_STATUS.DOCUMENTED) return SECTION_STATUS.COMPLETE;
  return SECTION_STATUS.INCOMPLETE;
}

export function assembleDocument(state) {
  const docs = state.documentSections ?? {};
  return finalReportSections.map((meta) => {
    const entry = docs[meta.key];
    return {
      ...meta,
      entry,
      status: sectionStatusOf(entry),
      text: entry?.text || '',
      rows: entry?.rows ?? [],
      nodes: entry?.nodes ?? [],
      chains: entry?.chains ?? [],
      subsections: entry?.subsections ?? {},
      sources: entry?.sources ?? [],
      evidences: entry?.evidences ?? [],
      lastUpdated: entry?.lastUpdated ?? null,
    };
  });
}

function issue(id, severity, message, sectionKey, target = '') {
  return {
    id,
    severity,
    message,
    sectionKey,
    target,
    reviewPath: finalReportSections.find((item) => item.key === sectionKey)?.editPath || '/construir',
  };
}

export function analyzeConclusionsText(text = '') {
  const warnings = [];
  const trimmed = text.trim();
  if (!trimmed) return warnings;
  vagueConclusionPatterns.forEach((rule) => {
    if (rule.test.test(trimmed)) warnings.push({ type: 'vague', message: rule.message });
  });
  absolutePatterns.forEach((rule) => {
    if (rule.test.test(trimmed)) {
      warnings.push({
        type: 'absolute',
        message: `Advertencia: “${rule.term}” aparece sin que el caso justifique una afirmación absoluta.`,
      });
    }
  });
  const paragraphs = trimmed.split(/\n\s*\n/).filter((item) => item.trim().length > 40);
  if (trimmed.length > 80 && paragraphs.length < 3) {
    warnings.push({ type: 'length', message: 'Orienta la conclusión a 3–5 párrafos de síntesis, no a un listado.' });
  }
  return warnings;
}

function findingList(state) {
  return documentedFindings(state).length
    ? documentedFindings(state)
    : (state.analysis?.diagnose?.findings ?? []).filter((item) => item?.findingId);
}

function recList(state) {
  return state.analysis?.decide?.recommendations ?? [];
}

export function checkConsistency(state) {
  const issues = [];
  const findings = findingList(state);
  recList(state).forEach((rec) => {
    const linked = findings.filter((item) => (rec.findingIds ?? []).includes(item.findingId));
    if (!linked.length) return;
    const blob = `${rec.decision || ''} ${rec.title || ''} ${rec.benefitText || ''} ${rec.justification || ''}`.toLowerCase();
    const mismatch = linked.every((finding) => {
      const keys = categoryKeywords[finding.category] ?? [];
      if (!keys.length) return false;
      const hitsOwn = keys.some((word) => blob.includes(word));
      const otherHits = Object.entries(categoryKeywords)
        .filter(([cat]) => cat !== finding.category)
        .some(([, words]) => words.some((word) => blob.includes(word)));
      return !hitsOwn && otherHits;
    });
    if (mismatch) {
      issues.push(
        issue(
          `cons-${rec.decisionId}`,
          ISSUE_SEVERITY.WARNING,
          'Esta recomendación parece no corresponder con el hallazgo seleccionado.',
          'recommendations',
          rec.decisionId,
        ),
      );
    }
  });
  return issues;
}

function formatCanonical(value, digits = 2) {
  if (value == null || Number.isNaN(Number(value))) return '';
  return Number(value).toFixed(digits).replace('.', ',');
}

export function validateNumbers(state) {
  const issues = [];
  const caseData = state.selectedCase?.id ? getCaseById(state.selectedCase.id) : null;
  const expected = caseData ? expectedFromFacts(resolveCaseFacts(caseData)) : null;
  const measure = state.analysis?.measure ?? {};
  const sub = state.documentSections?.metrics?.subsections ?? {};
  const narrative = state.documentSections?.metrics?.text || '';

  const checks = [
    {
      id: 'availability',
      label: 'Disponibilidad',
      canonical: measure.availability?.result ?? expected?.availabilityPercent,
      expectedToken: formatCanonical(measure.availability?.result ?? expected?.availabilityPercent),
      documentedResult: sub.availability?.result || '',
      pattern: /\b\d{2}[.,]\d{1,2}\s*%/g,
    },
    {
      id: 'mttr',
      label: 'MTTR',
      canonical: measure.mttr?.result ?? expected?.mttrHours,
      expectedToken: formatCanonical(measure.mttr?.result ?? expected?.mttrHours, 1),
      documentedResult: sub.mttr?.result || '',
      pattern: /\b\d[.,]\d\s*h/g,
    },
    {
      id: 'mtbf',
      label: 'MTBF',
      canonical: measure.mtbf?.result ?? expected?.mtbfHours,
      expectedToken: formatCanonical(measure.mtbf?.result ?? expected?.mtbfHours, 1),
      documentedResult: sub.mtbf?.result || '',
      pattern: /\b\d{2}[.,]\d\s*h/g,
    },
    {
      id: 'storage',
      label: 'Almacenamiento',
      canonical: measure.storage?.result?.percent ?? expected?.storageUsedPercent,
      expectedToken: String(Math.round(Number(measure.storage?.result?.percent ?? expected?.storageUsedPercent ?? 84))),
      documentedResult: sub.storage?.result || '',
      pattern: /\b\d{2}\s*%/g,
    },
  ];

  checks.forEach((item) => {
    const token = item.expectedToken;
    if (token && item.documentedResult && !String(item.documentedResult).includes(token) && !String(item.documentedResult).includes(String(item.canonical))) {
      issues.push(
        issue(
          `num-${item.id}`,
          ISSUE_SEVERITY.WARNING,
          `El valor documentado de ${item.label} no coincide con el cálculo original (${token}). El resultado calculado no se edita desde la narrativa.`,
          'metrics',
          item.id,
        ),
      );
    }
    if (token && narrative) {
      const matches = narrative.match(item.pattern) || [];
      const foreign = matches.filter((hit) => !hit.includes(token));
      if (foreign.length && item.documentedResult && !item.documentedResult.includes(token)) {
        issues.push(
          issue(
            `num-narr-${item.id}`,
            ISSUE_SEVERITY.WARNING,
            `La redacción de ${item.label} menciona un valor distinto al cálculo original. Puedes editar el texto, no el resultado.`,
            'metrics',
            item.id,
          ),
        );
      }
    }
  });
  return issues;
}

export function auditTraceability(state) {
  const issues = [];
  const findings = findingList(state);
  const measure = state.analysis?.measure ?? {};
  ['availability', 'mttr', 'mtbf', 'storage', 'capacity', 'performance'].forEach((id) => {
    const slot = measure[id];
    const sub = state.documentSections?.metrics?.subsections?.[id];
    const hasSource = (slot?.sourceKeys ?? []).length || (sub?.sourceKeys ?? []).length || (sub?.sources ?? []).length;
    if ((slot?.result != null || sub?.result) && !hasSource) {
      issues.push(issue(`tr-metric-${id}`, ISSUE_SEVERITY.ERROR, `Métrica ${id}: ¿tiene fuente?`, 'metrics', id));
    }
  });

  findings.forEach((finding) => {
    if (!(finding.evidenceIds ?? []).length) {
      issues.push(
        issue(`tr-find-${finding.findingId}`, ISSUE_SEVERITY.ERROR, `Hallazgo “${finding.title}” sin evidencia.`, 'findings', finding.findingId),
      );
    }
    if (finding.status === FINDING_STATUS.REVIEW_REQUIRED) {
      issues.push(
        issue(
          `tr-find-rev-${finding.findingId}`,
          ISSUE_SEVERITY.REVIEW,
          `Hallazgo “${finding.title}” requiere revisión (evidencia o contenido modificado).`,
          'findings',
          finding.findingId,
        ),
      );
    }
  });

  (state.analysis?.govern?.itil ?? []).forEach((item) => {
    if (!item.findingId) {
      issues.push(issue(`tr-itil-${item.analysisId}`, ISSUE_SEVERITY.ERROR, 'ITIL sin hallazgo/situación de origen.', 'itil', item.analysisId));
    }
  });
  (state.analysis?.govern?.cobit ?? []).forEach((item) => {
    if (!item.findingId) {
      issues.push(issue(`tr-cobit-${item.analysisId}`, ISSUE_SEVERITY.ERROR, 'COBIT sin problema de origen.', 'cobit', item.analysisId));
    }
  });
  (state.analysis?.govern?.iso27001 ?? []).forEach((item) => {
    if (!item.assetId || !(item.sources ?? []).length) {
      issues.push(issue(`tr-iso-${item.analysisId}`, ISSUE_SEVERITY.ERROR, 'ISO 27001 sin activo y evidencia.', 'iso27001', item.analysisId));
    }
  });

  recList(state).forEach((rec) => {
    const missingFinding = !(rec.findingIds ?? []).length;
    const missingEvidence = !(rec.evidenceIds ?? []).length;
    const missingMetric = !hasSuccessMetric(rec);
    if (missingFinding || missingEvidence || missingMetric) {
      issues.push(
        issue(
          `tr-rec-${rec.decisionId}`,
          ISSUE_SEVERITY.ERROR,
          'TRAZABILIDAD INCOMPLETA. La recomendación necesita hallazgo + evidencia + métrica de éxito.',
          'recommendations',
          rec.decisionId,
        ),
      );
    }
    const broken = (rec.findingIds ?? []).filter((id) => !findings.some((item) => item.findingId === id));
    if (broken.length) {
      issues.push(
        issue(`tr-rec-ref-${rec.decisionId}`, ISSUE_SEVERITY.ERROR, 'Referencia rota: el hallazgo asociado ya no existe.', 'recommendations', rec.decisionId),
      );
    }
  });

  return issues;
}

export function validateDocument(state) {
  const issues = [];
  const assembled = assembleDocument(state);
  assembled.forEach((section) => {
    if (section.status === SECTION_STATUS.INCOMPLETE) {
      issues.push(issue(`empty-${section.key}`, ISSUE_SEVERITY.ERROR, `Sección vacía: ${section.title}.`, section.key));
    }
    if (section.status === SECTION_STATUS.REVIEW_REQUIRED) {
      issues.push(issue(`rev-${section.key}`, ISSUE_SEVERITY.REVIEW, `Sección con revisión requerida: ${section.title}.`, section.key));
    }
  });

  const findings = findingList(state);
  findings.forEach((finding) => {
    if (!(finding.evidenceIds ?? []).length) {
      issues.push(issue(`ev-${finding.findingId}`, ISSUE_SEVERITY.ERROR, `Hallazgo sin evidencia: ${finding.title}.`, 'findings', finding.findingId));
    }
    if (finding.criticality && !(finding.justification || '').trim()) {
      issues.push(issue(`crit-${finding.findingId}`, ISSUE_SEVERITY.ERROR, `Criticidad sin justificación: ${finding.title}.`, 'findings', finding.findingId));
    }
  });
  if (findings.length < MIN_FINDINGS) {
    issues.push(issue('min-findings', ISSUE_SEVERITY.ERROR, `Se requieren mínimo ${MIN_FINDINGS} hallazgos.`, 'findings'));
  }

  const govern = state.analysis?.govern ?? {};
  const itilOk = (govern.itil ?? []).filter(isItilComplete);
  const cobitOk = (govern.cobit ?? []).filter(isCobitComplete);
  const isoOk = (govern.iso27001 ?? []).filter(isIsoComplete);
  if (itilOk.length < MIN_ITIL) issues.push(issue('itil-min', ISSUE_SEVERITY.ERROR, `ITIL incompleto (mínimo ${MIN_ITIL} situaciones).`, 'itil'));
  if (cobitOk.length < MIN_COBIT) issues.push(issue('cobit-min', ISSUE_SEVERITY.ERROR, `COBIT incompleto (mínimo ${MIN_COBIT} situaciones).`, 'cobit'));
  if (isoOk.length < MIN_ISO) issues.push(issue('iso-min', ISSUE_SEVERITY.ERROR, `ISO 27001 incompleto (mínimo ${MIN_ISO} riesgos).`, 'iso27001'));
  (govern.iso27001 ?? []).forEach((item) => {
    if (!isIsoComplete(item) && item.status !== GOVERN_STATUS.REVIEW_REQUIRED) {
      issues.push(
        issue(
          `iso-inc-${item.analysisId}`,
          ISSUE_SEVERITY.ERROR,
          'Riesgo ISO incompleto (activo, amenaza, vulnerabilidad, impacto, control).',
          'iso27001',
          item.analysisId,
        ),
      );
    }
  });

  recList(state).forEach((rec) => {
    if (!(rec.findingIds ?? []).length) {
      issues.push(issue(`rec-nf-${rec.decisionId}`, ISSUE_SEVERITY.ERROR, 'Recomendación sin hallazgo.', 'recommendations', rec.decisionId));
    }
    if (!hasSuccessMetric(rec)) {
      issues.push(issue(`rec-nm-${rec.decisionId}`, ISSUE_SEVERITY.ERROR, 'Recomendación sin métrica de éxito.', 'recommendations', rec.decisionId));
    }
    if (rec.status === DECISION_STATUS.REVIEW_REQUIRED) {
      issues.push(issue(`rec-rev-${rec.decisionId}`, ISSUE_SEVERITY.REVIEW, 'Recomendación en revisión requerida.', 'recommendations', rec.decisionId));
    }
    if (!isRecommendationComplete(rec) && rec.status !== DECISION_STATUS.REVIEW_REQUIRED) {
      issues.push(
        issue(
          `rec-inc-${rec.decisionId}`,
          ISSUE_SEVERITY.ERROR,
          'Recomendación incompleta (evidencia, impacto, beneficio, riesgo, CAPEX/OPEX o prioridad).',
          'recommendations',
          rec.decisionId,
        ),
      );
    }
  });

  analyzeConclusionsText(state.documentSections?.conclusions?.text || state.analysis?.build?.conclusions?.draft || '').forEach(
    (warn, index) => {
      issues.push(issue(`conc-${index}`, ISSUE_SEVERITY.WARNING, warn.message, 'conclusions'));
    },
  );

  void terminology;

  const merged = [...issues, ...auditTraceability(state), ...checkConsistency(state), ...validateNumbers(state)];
  const seen = new Set();
  return merged.filter((item) => {
    if (seen.has(item.id)) return false;
    seen.add(item.id);
    return true;
  });
}

export function evaluateQualityChecks(state) {
  const docs = state.documentSections ?? {};
  const findings = findingList(state);
  const govern = state.analysis?.govern ?? {};
  const recs = recList(state);
  const mtbfSub = docs.metrics?.subsections?.mtbf;
  const mtbfSlot = state.analysis?.measure?.mtbf;
  const tests = {
    context: isDocumented(docs.context),
    criticalServices: isDocumented(docs.criticalServices),
    asis: isDocumented(docs.asis) && !/to-be|arquitectura futura/i.test(docs.asis?.text || ''),
    spof: isDocumented(docs.spof) && (docs.spof.rows ?? []).some((row) => row.evidence || row.justification),
    metrics: Boolean(docs.metrics?.subsections?.availability?.formula || docs.metrics?.subsections?.mttr?.formula),
    mtbfLimit: Boolean(mtbfSub?.limitation || mtbfSlot?.limitation),
    findingsMin: findings.length >= MIN_FINDINGS,
    itilMin: (govern.itil ?? []).filter(isItilComplete).length >= MIN_ITIL,
    cobitMin: (govern.cobit ?? []).filter(isCobitComplete).length >= MIN_COBIT,
    isoMin: (govern.iso27001 ?? []).filter(isIsoComplete).length >= MIN_ISO,
    recsLinked: recs.length >= MIN_RECOMMENDATIONS && recs.every((item) => (item.findingIds ?? []).length),
    recsMetrics: recs.length >= MIN_RECOMMENDATIONS && recs.every((item) => hasSuccessMetric(item)),
    capex: isDocumented(docs.capex) && (docs.capex.rows ?? []).every((row) => row.justification || row.classification),
    conclusions: isDocumented(docs.conclusions),
  };
  return qualityChecks.map((item) => ({ ...item, passed: Boolean(tests[item.test]) }));
}

export function documentSummary(state) {
  const assembled = assembleDocument(state);
  const issues = validateDocument(state);
  const errors = issues.filter((item) => item.severity === ISSUE_SEVERITY.ERROR);
  const reviews = issues.filter((item) => item.severity === ISSUE_SEVERITY.REVIEW);
  const complete = assembled.filter((item) => item.status === SECTION_STATUS.COMPLETE).length;
  const govern = state.analysis?.govern ?? {};
  const recs = recList(state);
  const findings = findingList(state);
  const reviewSections = assembled.some((item) => item.status === SECTION_STATUS.REVIEW_REQUIRED);
  const ready =
    complete === 14 &&
    errors.length === 0 &&
    reviews.length === 0 &&
    !reviewSections &&
    Boolean(state.analysis?.build?.previewReviewed);
  return {
    sections: `${complete} / 14`,
    completeCount: complete,
    findings: findings.length,
    itil: (govern.itil ?? []).length,
    cobit: (govern.cobit ?? []).length,
    iso: (govern.iso27001 ?? []).length,
    recommendations: recs.length,
    errors: errors.length,
    reviews: reviews.length,
    warnings: issues.filter((item) => item.severity === ISSUE_SEVERITY.WARNING).length,
    readyToExport: ready,
    status: ready
      ? DOCUMENT_STATUS.READY_TO_EXPORT
      : reviewSections || reviews.length
        ? DOCUMENT_STATUS.REVIEW_REQUIRED
        : complete === 14 && errors.length === 0
          ? DOCUMENT_STATUS.VALIDATED
          : DOCUMENT_STATUS.IN_PROGRESS,
  };
}

export function getBuildCompletion(state) {
  const summary = documentSummary(state);
  const issues = validateDocument(state);
  const errors = issues.filter((item) => item.severity === ISSUE_SEVERITY.ERROR);
  const reviews = issues.filter((item) => item.severity === ISSUE_SEVERITY.REVIEW);
  const conclusionsOk = isDocumented(state.documentSections?.conclusions);
  const previewOk = Boolean(state.analysis?.build?.previewReviewed);
  return {
    summary,
    issues,
    errors,
    reviews,
    conclusionsOk,
    previewOk,
    readyToExport: summary.readyToExport,
    ready: summary.readyToExport && conclusionsOk && previewOk && errors.length === 0 && reviews.length === 0,
  };
}

export function traceabilityNodes(state) {
  const findings = findingList(state);
  const recs = recList(state);
  const selected = recs[0] || null;
  const finding = selected ? findings.find((item) => (selected.findingIds ?? []).includes(item.findingId)) : findings[0];
  return [
    { id: 'case', label: 'CASO', detail: state.selectedCase?.name || 'Helados Boreal', path: '/caso' },
    { id: 'data', label: 'DATO', detail: (finding?.evidenceIds ?? []).join(', ') || '—', path: '/explorar' },
    { id: 'metric', label: 'MÉTRICA / INCIDENTE', detail: (finding?.evidenceIds ?? []).join(' · ') || '—', path: '/medir' },
    { id: 'finding', label: 'HALLAZGO', detail: finding?.title || 'Pendiente', path: '/diagnosticar' },
    { id: 'govern', label: 'GOBIERNO / DECISIÓN', detail: selected?.decision || 'Pendiente', path: '/gobernar' },
    { id: 'rec', label: 'RECOMENDACIÓN', detail: selected?.decision || 'Pendiente', path: '/decidir/11' },
    { id: 'success', label: 'MÉTRICA DE ÉXITO', detail: selected?.metricText || (selected?.metricIds ?? []).join(', ') || 'Pendiente', path: '/decidir/9' },
  ];
}

export { DOCUMENT_STATUS, SECTION_STATUS, ISSUE_SEVERITY, PREVIEW_MODES, metricSubsections };

import { consultingDocumentSections, DOCUMENT_SECTION_STATUS } from '../data/document/consultingSections.js';
import { isDocumented } from './understandModel.js';
import { documentedFindings } from './decideModel.js';
import { generateConsultingReport } from '../report/consultingReportGenerator.js';
import { validateConsultingReport } from '../report/consultingReportValidation.js';

function hasText(value) {
  return String(value || '').trim().length > 0;
}

function academicFilled(documentEntries, keys = []) {
  return keys.some((key) => isDocumented(documentEntries?.[key]));
}

function academicPartial(documentEntries, keys = []) {
  return keys.some((key) => {
    const entry = documentEntries?.[key];
    return Boolean(entry?.text || entry?.rows?.length || entry?.nodes?.length || entry?.status === 'IN_PROGRESS');
  });
}

export function sectionStatusFor(key, state, report) {
  const spec = consultingDocumentSections.find((item) => item.key === key);
  const docs = state.documentSections || {};
  const findings = documentedFindings(state);
  const recs = state.analysis?.decide?.recommendations ?? [];
  const measure = state.analysis?.measure ?? {};
  const represent = state.analysis?.represent ?? {};
  const govern = state.analysis?.govern ?? {};
  const collected = state.collectedData ?? [];
  const ready = Boolean(state.analysis?.build?.readyToExport);
  const validation = report?.validation || validateConsultingReport(report || generateConsultingReport(state));

  let filled = false;
  let partial = academicPartial(docs, spec?.academicKeys);
  let observations = false;

  if (key === 'dictamen') {
    filled = hasText(report?.executiveOpinion?.condition) && !report?.executiveOpinion?.insufficient;
    partial = partial || hasText(docs.conclusions?.text);
    observations = Boolean(report?.executiveOpinion?.insufficient);
  } else if (key === 'scope') {
    filled = (report?.scope?.sources?.length || 0) > 0;
    partial = partial || collected.length > 0;
  } else if (key === 'findings') {
    filled = findings.length > 0;
    partial = (state.analysis?.diagnose?.findings ?? []).length > 0;
    observations = findings.some((item) => !(item.evidenceIds ?? []).length);
  } else if (key === 'architecture') {
    filled = hasText(represent.asIs?.description) || academicFilled(docs, ['asis', 'spof']);
    partial = partial || Boolean(represent.spof?.records && Object.keys(represent.spof.records).length);
  } else if (key === 'performance') {
    const metrics = ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'];
    filled = metrics.some((id) => measure[id]?.result != null);
    partial = metrics.some((id) => measure[id]?.status && measure[id].status !== 'EMPTY');
  } else if (key === 'risks') {
    filled = (govern.itil?.length || 0) + (govern.cobit?.length || 0) + (govern.iso27001?.length || 0) > 0;
    partial = filled || academicPartial(docs, ['itil', 'cobit', 'iso27001']);
  } else if (key === 'target') {
    filled = (report?.targetArchitecture?.requirements ?? []).length > 0 || academicFilled(docs, ['strategy']);
    partial = hasText(docs.strategy?.text);
  } else if (key === 'alternatives') {
    filled = (report?.alternatives?.options ?? []).length > 0;
    partial = recs.some((item) => (item.alternatives ?? []).length);
  } else if (key === 'program') {
    filled = recs.length > 0;
    partial = recs.length > 0;
    observations = recs.some((item) => !(item.findingIds ?? []).length);
  } else if (key === 'governance') {
    filled = hasText(report?.governance?.acceptance || report?.governance?.summary);
    partial = (govern.itil?.length || 0) > 0;
  } else if (key === 'closing') {
    filled = hasText(report?.closing?.text || docs.conclusions?.text);
    partial = hasText(docs.conclusions?.text);
  } else if (key === 'annexEvidence') {
    filled = (report?.evidenceRegister ?? []).length > 0 || collected.length > 0;
    partial = collected.length > 0;
  } else if (key === 'annexEngineering') {
    filled = (report?.detailedEngineeringRequirements ?? []).length > 0;
    partial = ready || (report?.detailedEngineeringRequirements ?? []).length > 0;
  }

  if (observations || (validation.errors ?? []).some((item) => String(item).toLowerCase().includes(key))) {
    return DOCUMENT_SECTION_STATUS.OBSERVATIONS;
  }
  if (ready && filled) return DOCUMENT_SECTION_STATUS.VALIDATED;
  if (filled) return DOCUMENT_SECTION_STATUS.READY;
  if (partial) return DOCUMENT_SECTION_STATUS.BUILDING;
  return DOCUMENT_SECTION_STATUS.EMPTY;
}

export function buildConsultingDocumentIndex(state) {
  const report = generateConsultingReport(state);
  const validation = report.validation || validateConsultingReport(report);
  const items = consultingDocumentSections.map((spec) => {
    const status = sectionStatusFor(spec.key, state, report);
    const content = excerptFor(spec.key, state, report);
    const evidenceIds = evidenceFor(spec.key, state, report);
    const calculationIds = calculationsFor(spec.key, state);
    const findingIds = findingsFor(spec.key, state);
    const decisionIds = decisionsFor(spec.key, state);
    const lastUpdated = lastUpdateFor(spec, state);
    const missing = missingFor(spec.key, status, report);
    return {
      ...spec,
      status,
      content,
      evidenceIds,
      calculationIds,
      findingIds,
      decisionIds,
      lastUpdated,
      missing,
      trace: {
        stage: spec.feeds[0] || '',
        activityId: spec.activityId,
        findingIds,
        evidenceIds,
        calculationIds,
        decisionIds,
        updatedAt: lastUpdated,
      },
    };
  });

  const readyCount = items.filter((item) =>
    [DOCUMENT_SECTION_STATUS.READY, DOCUMENT_SECTION_STATUS.VALIDATED].includes(item.status),
  ).length;
  return {
    report,
    validation,
    items,
    readiness: Math.round((readyCount / items.length) * 100),
  };
}

function excerptFor(key, state, report) {
  if (key === 'dictamen') return report.executiveOpinion?.condition || '';
  if (key === 'findings') return documentedFindings(state).map((item) => item.title).filter(Boolean).join(' · ');
  if (key === 'architecture') return state.analysis?.represent?.asIs?.description || state.documentSections?.asis?.text || '';
  if (key === 'performance') {
    const measure = state.analysis?.measure ?? {};
    return ['availability', 'mttr', 'storage']
      .filter((id) => measure[id]?.result != null)
      .map((id) => `${id}: ${typeof measure[id].result === 'object' ? JSON.stringify(measure[id].result) : measure[id].result}`)
      .join(' · ');
  }
  if (key === 'program') return (state.analysis?.decide?.recommendations ?? []).map((item) => item.decision).filter(Boolean).join(' · ');
  if (key === 'closing' || key === 'dictamen') return state.documentSections?.conclusions?.text || report.closing?.text || '';
  if (key === 'annexEvidence') return `${(report.evidenceRegister ?? []).length} evidencias en el registro.`;
  const firstKey = consultingDocumentSections.find((item) => item.key === key)?.academicKeys?.[0];
  return firstKey ? state.documentSections?.[firstKey]?.text || '' : '';
}

function evidenceFor(key, state, report) {
  if (key === 'findings') {
    return documentedFindings(state).flatMap((item) => item.evidenceIds || []);
  }
  if (key === 'annexEvidence') {
    return (report.evidenceRegister ?? []).map((item) => item.evidenceId).filter(Boolean);
  }
  if (key === 'performance') {
    return state.collectedData.filter((item) => (item.usedIn || []).some((use) => /avail|mttr|mtbf|storage|capacity|performance/i.test(use))).map((item) => item.evidenceId);
  }
  return (state.collectedData ?? []).map((item) => item.evidenceId).filter(Boolean).slice(0, 8);
}

function calculationsFor(key, state) {
  if (key !== 'performance' && key !== 'findings') return [];
  const measure = state.analysis?.measure ?? {};
  return ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'].filter((id) => measure[id]?.result != null);
}

function findingsFor(key, state) {
  const ids = documentedFindings(state).map((item) => item.findingId);
  if (['findings', 'dictamen', 'risks', 'program', 'closing'].includes(key)) return ids;
  return [];
}

function decisionsFor(key, state) {
  const ids = (state.analysis?.decide?.recommendations ?? []).map((item) => item.decisionId);
  if (['program', 'target', 'alternatives', 'dictamen', 'closing'].includes(key)) return ids;
  return [];
}

function lastUpdateFor(spec, state) {
  const keys = spec.academicKeys || [];
  const dates = keys.map((key) => state.documentSections?.[key]?.lastUpdated).filter(Boolean);
  return dates.sort().at(-1) || null;
}

function missingFor(key, status, report) {
  if (status === DOCUMENT_SECTION_STATUS.VALIDATED || status === DOCUMENT_SECTION_STATUS.READY) {
    return status === DOCUMENT_SECTION_STATUS.READY ? ['Revisión final pendiente.'] : [];
  }
  if (key === 'findings' && !(report?.findings ?? []).length) return ['Falta interpretación convertida en hallazgo.'];
  if (key === 'annexEvidence') return ['Falta evidencia.'];
  if (key === 'governance') return ['Falta criterio de aceptación.'];
  if (status === DOCUMENT_SECTION_STATUS.EMPTY) return ['Sección todavía no construida.'];
  return ['Contenido parcial. Completa la actividad que alimenta esta sección.'];
}

export function documentChainFor(item) {
  return ['PDF', 'EVIDENCIA', 'DATO', 'CÁLCULO', 'INTERPRETACIÓN', 'HALLAZGO', 'SECCIÓN'];
}

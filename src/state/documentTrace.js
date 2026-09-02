import { consultingDocumentSections, DOCUMENT_SECTION_STATUS } from '../data/document/consultingSections.js';
import { isDocumented } from './understandModel.js';
import { documentedFindings } from './decideModel.js';
import { generateConsultingReport } from '../report/consultingReportGenerator.js';
import { validateConsultingReport } from '../report/consultingReportValidation.js';
import { canWorkStage, isTeacherMode } from './stageGates.js';
import { isModelSolved } from './caseMode.js';
import { howBuiltForSection } from '../data/testing/heladosBorealSolvedContent.js';

function hasStudentText(value) {
  const text = String(value || '').trim();
  if (!text) return false;
  if (text.length < 40) return false;
  return true;
}

function studentDocumented(entry) {
  return isDocumented(entry) && hasStudentText(entry?.text);
}

function studentStarted(entry) {
  return Boolean(
    entry?.status === 'IN_PROGRESS' ||
      hasStudentText(entry?.text) ||
      (entry?.rows ?? []).some((row) => hasStudentText(row?.justification || row?.impact)) ||
      (entry?.nodes ?? []).length,
  );
}

function studentUsedEvidence(state) {
  const collected = (state.collectedData ?? []).filter((item) => item.selectedAt && !item.autoLoaded);
  const metricIds = new Set((state.metricEvidence ?? []).map((item) => item.evidenceId));
  const docIds = new Set();
  Object.values(state.documentSections || {}).forEach((entry) => {
    (entry?.evidences || []).forEach((id) => docIds.add(id));
  });
  return collected.filter(
    (item) => metricIds.has(item.evidenceId) || docIds.has(item.evidenceId) || item.usedInActivity === true,
  );
}

function feedingDone(state, stageId) {
  if (isTeacherMode(state) && (state.completedStages ?? []).includes(stageId)) return true;
  return (state.completedStages ?? []).includes(stageId);
}

function decideUnlocked(state) {
  return canWorkStage(state, 7);
}

export function sectionStatusFor(key, state, report) {
  if (isModelSolved(state)) {
    return DOCUMENT_SECTION_STATUS.SOLVED;
  }
  const docs = state.documentSections || {};
  const findings = documentedFindings(state);
  const recs = (state.analysis?.decide?.recommendations ?? []).filter((item) => String(item.decision || '').trim().length > 20);
  const measure = state.analysis?.measure ?? {};
  const represent = state.analysis?.represent ?? {};
  const govern = state.analysis?.govern ?? {};
  const collected = state.collectedData ?? [];

  let studentWork = false;
  let started = false;
  let observations = false;
  let feedingStage = null;
  let hasBase = Boolean(state.selectedCase);

  if (key === 'dictamen') {
    feedingStage = 8;
    studentWork = studentDocumented(docs.conclusions) && feedingDone(state, 8);
    started = studentStarted(docs.conclusions);
    observations = Boolean(report?.executiveOpinion?.insufficient) && feedingDone(state, 8);
  } else if (key === 'scope') {
    feedingStage = 1;
    studentWork = feedingDone(state, 1) && (studentDocumented(docs.context) || studentDocumented(docs.constraints));
    started = studentStarted(docs.context) || studentStarted(docs.constraints);
  } else if (key === 'findings') {
    feedingStage = 5;
    studentWork = feedingDone(state, 5) && findings.length > 0;
    started = (state.analysis?.diagnose?.findings ?? []).length > 0;
    observations = findings.some((item) => !(item.evidenceIds ?? []).length);
  } else if (key === 'architecture') {
    feedingStage = 2;
    studentWork =
      feedingDone(state, 2) &&
      (studentDocumented(docs.asis) || studentDocumented(docs.spof) || hasStudentText(represent.asIs?.description));
    started =
      studentStarted(docs.asis) ||
      studentStarted(docs.spof) ||
      Boolean(represent.asIs?.description) ||
      Boolean(represent.spof?.records && Object.keys(represent.spof.records).length);
  } else if (key === 'performance') {
    feedingStage = 4;
    const metrics = ['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'];
    studentWork = feedingDone(state, 4) && metrics.some((id) => measure[id]?.result != null && measure[id]?.status && measure[id].status !== 'MISSING_DATA');
    started = metrics.some((id) => measure[id]?.status && !['', 'MISSING_DATA', 'EMPTY'].includes(measure[id].status));
  } else if (key === 'risks') {
    feedingStage = 6;
    const count = (govern.itil?.length || 0) + (govern.cobit?.length || 0) + (govern.iso27001?.length || 0);
    studentWork = feedingDone(state, 6) && count > 0;
    started = count > 0 || studentStarted(docs.itil) || studentStarted(docs.cobit) || studentStarted(docs.iso27001);
  } else if (key === 'target') {
    feedingStage = 7;
    studentWork = feedingDone(state, 7) && (studentDocumented(docs.strategy) || recs.length > 0);
    started = studentStarted(docs.strategy) || recs.length > 0;
  } else if (key === 'alternatives') {
    feedingStage = 7;
    const hasAlts = recs.some((item) => (item.alternatives ?? []).length >= 2);
    if (!decideUnlocked(state) && !feedingDone(state, 7)) {
      return DOCUMENT_SECTION_STATUS.BASE;
    }
    studentWork = feedingDone(state, 7) && hasAlts;
    started = hasAlts || recs.length > 0;
  } else if (key === 'program') {
    feedingStage = 7;
    studentWork = feedingDone(state, 7) && recs.length > 0;
    started = recs.length > 0 || studentStarted(docs.recommendations) || studentStarted(docs.capex);
    observations = recs.some((item) => !(item.findingIds ?? []).length);
  } else if (key === 'governance') {
    feedingStage = 6;
    studentWork = feedingDone(state, 6) && ((govern.itil?.length || 0) > 0 || (govern.cobit?.length || 0) > 0);
    started = (govern.itil?.length || 0) + (govern.cobit?.length || 0) + (govern.iso27001?.length || 0) > 0;
  } else if (key === 'closing') {
    feedingStage = 8;
    studentWork = feedingDone(state, 8) && studentDocumented(docs.conclusions);
    started = studentStarted(docs.conclusions);
  } else if (key === 'annexEvidence') {
    feedingStage = 1;
    const used = studentUsedEvidence(state);
    studentWork = used.length > 0 && (feedingDone(state, 1) || feedingDone(state, 4));
    started = used.length > 0;
    hasBase = true;
    if (!studentWork) {
      return DOCUMENT_SECTION_STATUS.BASE;
    }
  } else if (key === 'annexEngineering') {
    feedingStage = 8;
    if (!feedingDone(state, 8)) {
      return DOCUMENT_SECTION_STATUS.BASE;
    }
    studentWork = feedingDone(state, 8);
    started = feedingDone(state, 8);
  }

  if (observations) return DOCUMENT_SECTION_STATUS.OBSERVATIONS;
  if (studentWork && feedingStage && feedingDone(state, feedingStage)) {
    if (isTeacherMode(state) || (state.completedStages ?? []).includes(8)) {
      return DOCUMENT_SECTION_STATUS.VALIDATED;
    }
    return DOCUMENT_SECTION_STATUS.READY;
  }
  if (studentWork) return DOCUMENT_SECTION_STATUS.BUILDING;
  if (started) return DOCUMENT_SECTION_STATUS.BUILDING;
  if (hasBase) return DOCUMENT_SECTION_STATUS.BASE;
  return DOCUMENT_SECTION_STATUS.EMPTY;
}

export function buildConsultingDocumentIndex(state) {
  const report = generateConsultingReport(state);
  const validation = report.validation || validateConsultingReport(report);
  const items = consultingDocumentSections.map((spec) => {
    const status = sectionStatusFor(spec.key, state, report);
    const content = excerptFor(spec.key, state, report, status);
    const chain = documentChainFor(spec, state, report);
    const evidenceIds = chain.evidenceIds;
    const calculationIds = chain.calculationIds;
    const findingIds = chain.findingIds;
    const decisionIds = chain.decisionIds;
    const lastUpdated = lastUpdateFor(spec, state);
    const missing = missingFor(spec.key, status);
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
      chain,
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
    [DOCUMENT_SECTION_STATUS.READY, DOCUMENT_SECTION_STATUS.VALIDATED, DOCUMENT_SECTION_STATUS.SOLVED].includes(item.status),
  ).length;
  return {
    report,
    validation,
    items,
    readiness: Math.round((readyCount / items.length) * 100),
  };
}

function excerptFor(key, state, report, status) {
  if (status === DOCUMENT_SECTION_STATUS.BASE || status === DOCUMENT_SECTION_STATUS.EMPTY) {
    return '';
  }
  if (key === 'dictamen') return state.documentSections?.conclusions?.text || '';
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
  if (key === 'closing') return state.documentSections?.conclusions?.text || '';
  if (key === 'annexEvidence') return `${(state.collectedData ?? []).length} datos recolectados por el estudiante.`;
  const firstKey = consultingDocumentSections.find((item) => item.key === key)?.academicKeys?.[0];
  return firstKey ? state.documentSections?.[firstKey]?.text || '' : '';
}

function lastUpdateFor(spec, state) {
  const keys = spec.academicKeys || [];
  const dates = keys.map((key) => state.documentSections?.[key]?.lastUpdated).filter(Boolean);
  return dates.sort().at(-1) || null;
}

function missingFor(key, status) {
  if (status === DOCUMENT_SECTION_STATUS.SOLVED || status === DOCUMENT_SECTION_STATUS.VALIDATED) return [];
  if (status === DOCUMENT_SECTION_STATUS.READY) return ['Revisión final pendiente.'];
  if (status === DOCUMENT_SECTION_STATUS.BASE) {
    if (key === 'annexEvidence') return ['Hay evidencias del caso. Valídalas y úsalas en tus actividades para pasar a revisión.'];
    if (key === 'annexEngineering') return ['Quedará lista cuando cierres CONSTRUIR.'];
    if (key === 'alternatives') return ['DECIDIR todavía no está habilitado. La evaluación de alternativas se construye en esa etapa.'];
    return ['Existe información inicial del caso. La sección se construye cuando completes la actividad que la alimenta.'];
  }
  if (status === DOCUMENT_SECTION_STATUS.EMPTY) return ['Sección todavía no construida.'];
  return ['Contenido parcial. Completa la actividad que alimenta esta sección.'];
}

export function documentChainFor(spec, state, report) {
  if (isModelSolved(state)) {
    const steps = howBuiltForSection(spec.key).filter((step) => step.label && step.text);
    return {
      steps,
      empty: steps.length === 0,
      message: steps.length ? '' : 'Esta trazabilidad se completará cuando desarrolles la actividad',
      evidenceIds: (state.collectedData ?? []).map((item) => item.evidenceId).filter(Boolean),
      calculationIds: ['availability', 'mttr', 'storage'].filter((id) => state.analysis?.measure?.[id]?.result != null),
      findingIds: documentedFindings(state).map((item) => item.findingId),
      decisionIds: (state.analysis?.decide?.recommendations ?? []).map((item) => item.decisionId).filter(Boolean),
    };
  }
  const steps = [];
  const collected = (state.collectedData ?? []).filter((item) => item.page || item.evidenceId);
  const evidenceIds = [];
  const calculationIds = [];
  const findingIds = [];
  const decisionIds = [];

  const pdfItem = collected.find((item) => Number(item.page) >= 1);
  if (pdfItem) {
    steps.push({ label: 'PDF', text: `Documento fuente, página ${pdfItem.page}` });
  }

  if (spec.key === 'findings') {
    evidenceIds.push(...documentedFindings(state).flatMap((item) => item.evidenceIds || []));
  } else if (spec.key === 'annexEvidence') {
    evidenceIds.push(...collected.map((item) => item.evidenceId).filter(Boolean));
  } else if (collected.length) {
    evidenceIds.push(...collected.map((item) => item.evidenceId).filter(Boolean).slice(0, 8));
  }
  if (evidenceIds.length) {
    steps.push({ label: 'EVIDENCIA', text: evidenceIds.slice(0, 6).join(', ') });
  }

  const dataLabels = collected
    .filter((item) => spec.academicKeys?.includes(item.documentSectionId) || spec.key === 'annexEvidence' || spec.key === 'scope')
    .map((item) => item.label)
    .filter(Boolean);
  if (dataLabels.length) {
    steps.push({ label: 'DATO', text: dataLabels.slice(0, 4).join(' · ') });
  } else if (collected[0]?.label && ['performance', 'findings'].includes(spec.key)) {
    steps.push({ label: 'DATO', text: collected[0].label });
  }

  if (spec.key === 'performance' || spec.key === 'findings') {
    const measure = state.analysis?.measure ?? {};
    calculationIds.push(
      ...['availability', 'mttr', 'mtbf', 'capacity', 'storage', 'performance'].filter((id) => measure[id]?.result != null),
    );
    if (calculationIds.length) {
      steps.push({ label: 'CÁLCULO', text: calculationIds.join(', ') });
      const interp = calculationIds
        .map((id) => measure[id]?.interpretation || measure[id]?.draft)
        .find((item) => String(item || '').trim());
      if (interp) steps.push({ label: 'INTERPRETACIÓN', text: String(interp).slice(0, 180) });
    }
  }

  if (['findings', 'dictamen', 'risks', 'program', 'closing'].includes(spec.key)) {
    findingIds.push(...documentedFindings(state).map((item) => item.findingId));
    if (findingIds.length) {
      steps.push({
        label: 'HALLAZGO',
        text: documentedFindings(state)
          .map((item) => item.title)
          .filter(Boolean)
          .slice(0, 3)
          .join(' · '),
      });
    }
  }

  if (['program', 'target', 'alternatives', 'dictamen', 'closing'].includes(spec.key)) {
    decisionIds.push(...(state.analysis?.decide?.recommendations ?? []).map((item) => item.decisionId).filter(Boolean));
  }

  if (steps.length) {
    steps.push({ label: 'SECCIÓN', text: spec.title });
  }

  return {
    steps,
    empty: steps.length === 0,
    message: steps.length ? '' : 'Esta trazabilidad se completará cuando desarrolles la actividad',
    evidenceIds: [...new Set(evidenceIds)],
    calculationIds,
    findingIds,
    decisionIds,
  };
}

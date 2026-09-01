import { DATA_STATUS } from '../data/methodology/data-map.js';
import { contextEvidence, missingEvidenceMessage, restrictionItems } from '../data/methodology/understand.js';
import {
  createUnderstandState,
  createDocumentBundle,
  getUnderstandCompletion,
  relevantContextEvidence,
  getServiceById,
  nowIso,
} from './understandModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';
import { invalidateDecisionsUsingConstraint } from './decideActions.js';

function understandFrom(state = getState()) {
  return state.analysis?.understand ?? createUnderstandState();
}

function documentsFrom(state = getState()) {
  return state.documentSections && typeof state.documentSections === 'object'
    ? state.documentSections
    : createDocumentBundle();
}

export function patchUnderstand(updater) {
  const state = getState();
  const current = understandFrom(state);
  const next = typeof updater === 'function' ? updater(current, state) : { ...current, ...updater };
  patchState((prev) => ({
    ...prev,
    analysis: { ...prev.analysis, understand: next },
  }));
}

export function setUnderstandSubstage(id) {
  patchUnderstand((current) => ({ ...current, currentSubstage: Number(id) }));
}

export function toggleContextEvidence(id) {
  patchUnderstand((current) => {
    const selectedIds = new Set(current.context.selectedIds);
    const wrongMomentIds = new Set(current.context.wrongMomentIds);
    const item = contextEvidence.find((entry) => entry.id === id);
    if (selectedIds.has(id)) {
      selectedIds.delete(id);
      wrongMomentIds.delete(id);
    } else {
      selectedIds.add(id);
      if (item && !item.relevant) {
        wrongMomentIds.add(id);
      }
    }
    return {
      ...current,
      context: {
        ...current.context,
        selectedIds: [...selectedIds],
        wrongMomentIds: [...wrongMomentIds],
      },
    };
  });
}

export function acknowledgeWrongMoment(id) {
  patchUnderstand((current) => ({
    ...current,
    context: {
      ...current.context,
      wrongMomentIds: current.context.wrongMomentIds.includes(id)
        ? current.context.wrongMomentIds
        : [...current.context.wrongMomentIds, id],
    },
  }));
}

export function setContextField(slot, value) {
  patchUnderstand((current) => ({
    ...current,
    context: {
      ...current.context,
      fields: { ...current.context.fields, [slot]: value },
    },
  }));
}

export function setUnderstandDraft(section, value) {
  patchUnderstand((current) => ({
    ...current,
    [section]: { ...current[section], draft: value },
  }));
}

export function classifyUser(itemId, category) {
  patchUnderstand((current) => ({
    ...current,
    usersAndOperations: {
      ...current.usersAndOperations,
      classifications: { ...current.usersAndOperations.classifications, [itemId]: category },
    },
  }));
}

export function classifyServiceItem(itemId, category) {
  patchUnderstand((current) => ({
    ...current,
    services: {
      ...current.services,
      classification: { ...current.services.classification, [itemId]: category },
    },
  }));
}

export function toggleReviewedService(id) {
  patchUnderstand((current) => {
    const selected = new Set(current.services.selectedIds);
    const reviewed = new Set(current.services.reviewedIds);
    if (selected.has(id)) {
      selected.delete(id);
    } else {
      selected.add(id);
    }
    reviewed.add(id);
    return {
      ...current,
      services: {
        ...current.services,
        selectedIds: [...selected],
        reviewedIds: [...reviewed],
      },
    };
  });
}

export function setActiveCriticalService(id) {
  patchUnderstand((current) => ({
    ...current,
    services: {
      ...current.services,
      reviewedIds: current.services.reviewedIds.includes(id)
        ? current.services.reviewedIds
        : [...current.services.reviewedIds, id],
    },
    criticality: { ...current.criticality, activeServiceId: id },
  }));
}

export function updateCriticalityRecord(serviceId, partial) {
  patchUnderstand((current) => {
    const previous = current.criticality.records[serviceId] ?? { serviceId };
    return {
      ...current,
      criticality: {
        ...current.criticality,
        records: {
          ...current.criticality.records,
          [serviceId]: { ...previous, ...partial, serviceId },
        },
      },
    };
  });
}

export function toggleCompareService(id) {
  patchUnderstand((current) => {
    const compareIds = current.criticality.compareIds.includes(id)
      ? current.criticality.compareIds.filter((item) => item !== id)
      : [...current.criticality.compareIds, id].slice(-3);
    return {
      ...current,
      criticality: { ...current.criticality, compareIds },
    };
  });
}

export function toggleTableService(id) {
  patchUnderstand((current) => {
    const record = current.criticality.records[id];
    if (!record?.justification?.trim() || !record?.impact) {
      return current;
    }
    const tableIds = current.criticality.tableIds.includes(id)
      ? current.criticality.tableIds.filter((item) => item !== id)
      : [...current.criticality.tableIds, id];
    return {
      ...current,
      criticality: { ...current.criticality, tableIds },
    };
  });
}

export function classifyRestriction(id, typeId) {
  patchUnderstand((current) => ({
    ...current,
    constraints: {
      ...current.constraints,
      classifications: { ...current.constraints.classifications, [id]: typeId },
    },
  }));
}

export function toggleRestriction(id) {
  patchUnderstand((current) => {
    const selectedIds = current.constraints.selectedIds.includes(id)
      ? current.constraints.selectedIds.filter((item) => item !== id)
      : [...current.constraints.selectedIds, id];
    return {
      ...current,
      constraints: { ...current.constraints, selectedIds },
    };
  });
}

export function setRestrictionImpact(id, value) {
  patchUnderstand((current) => ({
    ...current,
    constraints: {
      ...current.constraints,
      impacts: { ...current.constraints.impacts, [id]: value },
    },
  }));
}

export function setUnderstandAnswer(group, key, value) {
  patchUnderstand((current) => ({
    ...current,
    [group]: { ...current[group], [key]: value },
  }));
}

export function setCheckpointAnswer(id, optionId) {
  patchUnderstand((current) => ({
    ...current,
    checkpoint: { ...current.checkpoint, [id]: optionId },
  }));
}

function failValidation() {
  setState({ documentError: missingEvidenceMessage });
  return false;
}

function saveDocument(key, payload) {
  const state = getState();
  const timestamp = nowIso();
  const entry = {
    ...payload,
    status: DATA_STATUS.DOCUMENTED,
    timestamp: payload.timestamp ?? timestamp,
    lastUpdated: timestamp,
  };
  patchState((prev) => ({
    ...prev,
    documentError: null,
    documentViewKey: key,
    documentPanelOpen: true,
    mobileNavOpen: false,
    documentSections: { ...documentsFrom(prev), [key]: entry },
  }));
  return true;
}

export function addContextToDocument() {
  const state = getState();
  const understand = understandFrom(state);
  const evidences = relevantContextEvidence(understand.context.selectedIds);
  const text = understand.context.draft.trim();
  const interpretation = Object.values(understand.context.fields).some((value) => value.trim());
  if (!evidences.length || !text || !interpretation) {
    return failValidation();
  }
  return saveDocument('context', {
    text,
    evidences: evidences.map((item) => item.label),
    sources: evidences.map((item) => item.source),
    fields: understand.context.fields,
  });
}

export function addOperationsToDocument() {
  const state = getState();
  const understand = understandFrom(state);
  const classified = Object.keys(understand.usersAndOperations.classifications);
  const text = understand.usersAndOperations.draft.trim();
  if (!classified.length || !text) {
    return failValidation();
  }
  return saveDocument('usersAndOperations', {
    text,
    evidences: classified,
    sources: ['Contexto', 'Servicios tecnológicos', 'Operación actual'],
    classifications: understand.usersAndOperations.classifications,
    scheduleAnswer: understand.usersAndOperations.scheduleAnswer,
  });
}

export function addServicesToDocument() {
  const state = getState();
  const understand = understandFrom(state);
  const selected = understand.services.selectedIds
    .map(getServiceById)
    .filter(Boolean);
  if (!selected.length) {
    return failValidation();
  }
  const text = selected.map((item) => `${item.name}: ${item.description}`).join('\n');
  return saveDocument('services', {
    text,
    evidences: selected.map((item) => item.description),
    sources: selected.map((item) => item.sourceLabel),
    serviceIds: selected.map((item) => item.id),
  });
}

export function addCriticalServicesToDocument() {
  const state = getState();
  const understand = understandFrom(state);
  const rows = understand.criticality.tableIds
    .map((id) => {
      const service = getServiceById(id);
      const record = understand.criticality.records[id];
      if (!service || !record?.justification?.trim()) {
        return null;
      }
      return {
        serviceId: id,
        name: service.name,
        users: record.users || service.users,
        operation: record.when || service.operation,
        impact: record.failure || service.failureImpact,
        studentCriticality: record.impact,
        justification: record.justification,
        evidence: service.description,
        sourceSections: [service.sourceLabel],
      };
    })
    .filter(Boolean);

  if (rows.length < 3) {
    return failValidation();
  }

  const text = rows
    .map(
      (row) =>
        `${row.name} | ${row.users} | ${row.operation} | ${row.impact} | ${row.studentCriticality}`,
    )
    .join('\n');

  return saveDocument('criticalServices', {
    text,
    rows,
    evidences: rows.map((row) => row.evidence),
    sources: [...new Set(rows.flatMap((row) => row.sourceSections))],
  });
}

export function addConstraintsToDocument() {
  const state = getState();
  const understand = understandFrom(state);
  const selected = understand.constraints.selectedIds
    .map((id) => restrictionItems.find((item) => item.id === id))
    .filter(Boolean);
  const text = understand.constraints.draft.trim();
  if (!selected.length || !text) {
    return failValidation();
  }
  const rows = selected.map((item) => ({
    id: item.id,
    label: item.label,
    type: understand.constraints.classifications[item.id] ?? item.correctType,
    impact: understand.constraints.impacts[item.id] ?? '',
  }));
  const existed = Boolean(documentsFrom(state).constraints?.status);
  const saved = saveDocument('constraints', {
    text,
    rows,
    evidences: selected.map((item) => item.label),
    sources: ['Restricciones del caso'],
  });
  if (saved && existed) {
    rows.forEach((row) => invalidateDecisionsUsingConstraint(row.id));
  }
  return saved;
}

export function updateDocumentSectionText(key, text) {
  const state = getState();
  const current = documentsFrom(state)[key];
  if (!current) {
    return;
  }
  saveDocument(key, { ...current, text });
}

export function completeUnderstandStage() {
  const state = getState();
  const understand = understandFrom(state);
  const completion = getUnderstandCompletion(understand, documentsFrom(state));
  if (!completion.ready) {
    setState({ documentError: 'Completa las secciones pendientes antes de cerrar COMPRENDER.' });
    return false;
  }

  const completedStages = state.completedStages.includes(1) ? state.completedStages : [...state.completedStages, 1];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 1,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      understand: { ...understandFrom(prev), completed: true },
    },
  }));
  return true;
}

export function getUnderstandSnapshot(state = getState()) {
  const understand = understandFrom(state);
  const documents = documentsFrom(state);
  return {
    understand,
    documents,
    completion: getUnderstandCompletion(understand, documents),
  };
}

import {
  contextEvidence,
  understandServices,
  restrictionItems,
  checkpointQuestions,
} from '../data/methodology/understand.js';

export function createUnderstandState() {
  return {
    currentSubstage: 1,
    context: {
      selectedIds: [],
      wrongMomentIds: [],
      fields: {
        activity: '',
        coverage: '',
        operation: '',
        size: '',
        channels: '',
      },
      draft: '',
    },
    usersAndOperations: {
      classifications: {},
      scheduleAnswer: null,
      draft: '',
    },
    services: {
      classification: {},
      selectedIds: [],
      reviewedIds: [],
    },
    criticality: {
      activeServiceId: 'erp',
      records: {},
      compareIds: [],
      tableIds: [],
      hoursQuestion: null,
    },
    constraints: {
      classifications: {},
      selectedIds: [],
      impacts: {},
      draft: '',
    },
    checkpoint: {},
    completed: false,
  };
}

export function mergeUnderstand(saved) {
  const base = createUnderstandState();
  if (!saved || typeof saved !== 'object') {
    return base;
  }
  return {
    ...base,
    ...saved,
    context: {
      ...base.context,
      ...saved.context,
      fields: { ...base.context.fields, ...saved.context?.fields },
    },
    usersAndOperations: { ...base.usersAndOperations, ...saved.usersAndOperations },
    services: { ...base.services, ...saved.services },
    criticality: {
      ...base.criticality,
      ...saved.criticality,
      records: saved.criticality?.records ?? {},
    },
    constraints: { ...base.constraints, ...saved.constraints },
    checkpoint: saved.checkpoint ?? {},
  };
}

export function createDocumentBundle() {
  return {
    context: null,
    usersAndOperations: null,
    services: null,
    criticalServices: null,
    constraints: null,
    asis: null,
    inventory: null,
    spof: null,
    metrics: null,
    findings: null,
    itil: null,
    cobit: null,
    iso27001: null,
    strategy: null,
    capex: null,
    recommendations: null,
    conclusions: null,
  };
}

export function isDocumented(entry) {
  return Boolean(entry?.status === 'DOCUMENTED' && entry?.text?.trim());
}

export function getUnderstandCompletion(understand, documentSections) {
  const documentedContext = isDocumented(documentSections.context);
  const documentedUsers = isDocumented(documentSections.usersAndOperations);
  const documentedServices = isDocumented(documentSections.services);
  const documentedConstraints = isDocumented(documentSections.constraints);
  const justified = Object.values(understand.criticality.records ?? {}).filter(
    (record) => record?.justification?.trim() && record?.impact,
  );
  const tableCount = (understand.criticality.tableIds ?? []).filter((id) =>
    justified.some((record) => record.serviceId === id),
  ).length;
  const reviewed = (understand.services.reviewedIds ?? []).length >= 6;
  const documentedCritical =
    isDocumented(documentSections.criticalServices) && (justified.length >= 3 || tableCount >= 3);
  const checkpoint = checkpointQuestions.every(
    (item) => understand.checkpoint?.[item.id] === item.correctId,
  );

  return {
    context: documentedContext,
    usersAndOperations: documentedUsers,
    services: documentedServices || reviewed,
    criticalServices: documentedCritical,
    constraints: documentedConstraints,
    checkpoint,
    ready:
      documentedContext &&
      documentedUsers &&
      (documentedServices || reviewed) &&
      justified.length >= 3 &&
      documentedConstraints &&
      documentedCritical &&
      checkpoint,
    justifiedCount: justified.length,
  };
}

export function relevantContextEvidence(selectedIds = []) {
  return contextEvidence.filter((item) => item.relevant && selectedIds.includes(item.id));
}

export function getServiceById(id) {
  return understandServices.find((item) => item.id === id) ?? null;
}

export function getRestrictionById(id) {
  return restrictionItems.find((item) => item.id === id) ?? null;
}

export function formatTimestamp(iso) {
  if (!iso) {
    return '';
  }
  try {
    return new Intl.DateTimeFormat('es-CO', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

export function nowIso() {
  return new Date().toISOString();
}

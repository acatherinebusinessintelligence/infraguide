import { DATA_STATUS } from '../data/methodology/data-map.js';
import {
  architectureNodes,
  missingEvidenceMessage,
  asIsChangeWarning,
  pickerCatalog,
} from '../data/methodology/represent.js';
import {
  createRepresentState,
  getNodeById,
  getDiagramNode,
  uniqueChainNodes,
  principalAsIsNodes,
  getRepresentCompletion,
  serializeAsIs,
  relationFor,
} from './representModel.js';
import { nowIso, getServiceById, isDocumented } from './understandModel.js';
import { computeProgress, getState, patchState, setState } from './appState.js';

function representFrom(state = getState()) {
  return state.analysis?.represent ?? createRepresentState();
}

function documentsFrom(state = getState()) {
  return state.documentSections ?? {};
}

export function patchRepresent(updater) {
  const state = getState();
  const current = representFrom(state);
  const next = typeof updater === 'function' ? updater(current, state) : { ...current, ...updater };
  patchState((prev) => ({
    ...prev,
    analysis: { ...prev.analysis, represent: next },
  }));
}

export function setRepresentSubstage(id) {
  patchRepresent((current) => ({ ...current, currentSubstage: Number(id) }));
}

export function setRepresentActiveService(id) {
  patchRepresent((current) => ({ ...current, activeServiceId: id }));
}

export function toggleServiceComponent(serviceId, componentId) {
  patchRepresent((current) => {
    const selected = new Set(current.serviceComponents[serviceId] ?? []);
    if (selected.has(componentId)) {
      selected.delete(componentId);
    } else {
      selected.add(componentId);
    }
    return {
      ...current,
      activeServiceId: serviceId,
      serviceComponents: {
        ...current.serviceComponents,
        [serviceId]: [...selected],
      },
    };
  });
}

export function toggleInventoryComponent(id) {
  const node = getNodeById(id);
  if (!node || node.trap) {
    return;
  }
  patchRepresent((current) => {
    const selectedIds = current.inventory.selectedIds.includes(id)
      ? current.inventory.selectedIds.filter((item) => item !== id)
      : [...current.inventory.selectedIds, id];
    return {
      ...current,
      inventory: { ...current.inventory, selectedIds },
    };
  });
}

export function setInventoryRelevance(id, value) {
  patchRepresent((current) => ({
    ...current,
    inventory: {
      ...current.inventory,
      relevance: { ...current.inventory.relevance, [id]: value },
    },
  }));
}

export function setInventoryServiceLink(id, serviceId) {
  patchRepresent((current) => {
    const currentLinks = new Set(current.inventory.serviceLinks[id] ?? []);
    if (currentLinks.has(serviceId)) {
      currentLinks.delete(serviceId);
    } else {
      currentLinks.add(serviceId);
    }
    return {
      ...current,
      inventory: {
        ...current.inventory,
        serviceLinks: { ...current.inventory.serviceLinks, [id]: [...currentLinks] },
      },
    };
  });
}

export function setRepresentDraft(section, value) {
  patchRepresent((current) => ({
    ...current,
    [section]: { ...current[section], draft: value },
  }));
}

export function setAsIsDescription(value) {
  patchRepresent((current) => ({
    ...current,
    asIs: { ...current.asIs, description: value },
  }));
}

function markRemovedNodesForReview(current, previousIds, nextIds) {
  const removed = previousIds.filter((id) => !nextIds.includes(id));
  if (!removed.length) {
    return { records: current.spof.records, reviewRequired: current.spof.reviewRequired, warned: false };
  }
  const records = { ...current.spof.records };
  removed.forEach((id) => {
    if (records[id]) {
      records[id] = { ...records[id], reviewRequired: true, componentId: id };
    }
  });
  return { records, reviewRequired: true, warned: true };
}

export function addAsIsNode(serviceId, nodeId) {
  if (!getDiagramNode(nodeId)) {
    return;
  }
  let warned = false;
  patchRepresent((current) => {
    const previous = current.asIs.chains[serviceId] ?? [];
    if (previous.includes(nodeId)) {
      return current;
    }
    const next = [...previous, nodeId];
    const hasSpof = Object.keys(current.spof.records ?? {}).length > 0;
    warned = hasSpof;
    return {
      ...current,
      activeServiceId: serviceId,
      asIs: {
        ...current.asIs,
        chains: { ...current.asIs.chains, [serviceId]: next },
        lastEditedAt: nowIso(),
      },
      spof: { ...current.spof, reviewRequired: hasSpof || current.spof.reviewRequired },
    };
  });
  if (warned) {
    flagDocumentedSpofReview();
    setState({ documentError: asIsChangeWarning });
  }
}

export function removeAsIsNode(serviceId, index) {
  let warned = false;
  patchRepresent((current) => {
    const previous = current.asIs.chains[serviceId] ?? [];
    const next = previous.filter((_, itemIndex) => itemIndex !== index);
    const review = markRemovedNodesForReview(
      current,
      uniqueChainNodes(current.asIs.chains),
      uniqueChainNodes({ ...current.asIs.chains, [serviceId]: next }),
    );
    warned = review.warned;
    return {
      ...current,
      asIs: {
        ...current.asIs,
        chains: { ...current.asIs.chains, [serviceId]: next },
        lastEditedAt: nowIso(),
      },
      spof: { ...current.spof, records: review.records, reviewRequired: review.reviewRequired || current.spof.reviewRequired },
    };
  });
  if (warned) {
    flagDocumentedSpofReview();
    setState({ documentError: asIsChangeWarning });
  }
}

export function moveAsIsNode(serviceId, index, direction) {
  patchRepresent((current) => {
    const chain = [...(current.asIs.chains[serviceId] ?? [])];
    const target = index + direction;
    if (target < 0 || target >= chain.length) {
      return current;
    }
    const [item] = chain.splice(index, 1);
    chain.splice(target, 0, item);
    return {
      ...current,
      asIs: {
        ...current.asIs,
        chains: { ...current.asIs.chains, [serviceId]: chain },
        lastEditedAt: nowIso(),
      },
      spof: { ...current.spof, reviewRequired: current.spof.reviewRequired },
    };
  });
}

export function setAsIsNodePosition(serviceId, fromIndex, toIndex) {
  patchRepresent((current) => {
    const chain = [...(current.asIs.chains[serviceId] ?? [])];
    const nextIndex = Number(toIndex);
    if (!Number.isFinite(nextIndex) || nextIndex < 0 || nextIndex >= chain.length || fromIndex === nextIndex) {
      return current;
    }
    const [item] = chain.splice(fromIndex, 1);
    chain.splice(nextIndex, 0, item);
    return {
      ...current,
      asIs: {
        ...current.asIs,
        chains: { ...current.asIs.chains, [serviceId]: chain },
        lastEditedAt: nowIso(),
      },
    };
  });
}

export function setActiveSpofComponent(id) {
  patchRepresent((current) => ({
    ...current,
    spof: { ...current.spof, activeComponentId: id },
  }));
}

export function updateSpofRecord(componentId, partial) {
  patchRepresent((current) => {
    const previous = current.spof.records[componentId] ?? { componentId };
    return {
      ...current,
      spof: {
        ...current.spof,
        records: {
          ...current.spof.records,
          [componentId]: { ...previous, ...partial, componentId, reviewRequired: false },
        },
      },
    };
  });
}

export function acknowledgeSpofReviews() {
  patchRepresent((current) => {
    const records = { ...current.spof.records };
    Object.keys(records).forEach((id) => {
      if (records[id]?.reviewRequired) {
        records[id] = { ...records[id], reviewRequired: false };
      }
    });
    return {
      ...current,
      spof: { ...current.spof, records, reviewRequired: false },
    };
  });
}

export function linkIncident(incidentId, componentId) {
  patchRepresent((current) => {
    const selected = new Set(current.incidents[incidentId] ?? []);
    if (!componentId) {
      return {
        ...current,
        incidents: { ...current.incidents, [incidentId]: [] },
      };
    }
    if (selected.has(componentId)) {
      selected.delete(componentId);
    } else {
      selected.add(componentId);
    }
    return {
      ...current,
      incidents: { ...current.incidents, [incidentId]: [...selected] },
    };
  });
}

export function setRepresentActivity(id, value) {
  patchRepresent((current) => ({
    ...current,
    spof: { ...current.spof, activities: { ...current.spof.activities, [id]: value } },
  }));
}

export function setRepresentCheckpoint(id, value) {
  patchRepresent((current) => ({
    ...current,
    checkpoint: { ...current.checkpoint, [id]: value },
  }));
}

function flagDocumentedSpofReview() {
  const state = getState();
  if (!isDocumented(state.documentSections?.spof)) {
    return;
  }
  patchState((prev) => ({
    ...prev,
    documentSections: {
      ...prev.documentSections,
      spof: { ...prev.documentSections.spof, reviewRequired: true },
    },
  }));
}

function failValidation() {
  setState({ documentError: missingEvidenceMessage });
  return false;
}

function saveDocument(key, payload) {
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

export function addInventoryToDocument() {
  const state = getState();
  const represent = representFrom(state);
  const rows = represent.inventory.selectedIds
    .filter((id) => represent.inventory.relevance[id] === 'yes')
    .map((id) => {
      const node = getNodeById(id);
      if (!node || node.trap) {
        return null;
      }
      const serviceIds = represent.inventory.serviceLinks[id] ?? node.relatedServiceIds ?? [];
      return {
        componentId: node.id,
        name: node.name,
        type: node.type,
        characteristics: node.characteristics,
        relatedServices: serviceIds.map((serviceId) => getServiceById(serviceId)?.name ?? serviceId).join(' / '),
        sourceSectionId: node.sourceSectionId,
        sourceLabel: node.sourceLabel,
        sourceEvidence: node.characteristics,
      };
    })
    .filter(Boolean);

  const text = represent.inventory.draft.trim();
  if (!rows.length || !text) {
    return failValidation();
  }

  return saveDocument('inventory', {
    text,
    rows,
    evidences: rows.map((row) => row.characteristics),
    sources: [...new Set(rows.map((row) => row.sourceLabel))],
    nodes: rows.map((row) => ({ name: row.name, sourceLabel: row.sourceLabel })),
  });
}

export function addAsIsToDocument(serviceId) {
  const state = getState();
  const represent = representFrom(state);
  const activeId =
    serviceId ||
    represent.activeServiceId ||
    Object.keys(represent.asIs.chains).find((id) => (represent.asIs.chains[id] ?? []).length >= 3);
  const serialized = serializeAsIs(represent, activeId);
  const text = represent.asIs.description.trim();
  if (serialized.nodeIds.length < 3 || !text) {
    return failValidation();
  }
  const allChains = Object.entries(represent.asIs.chains).map(([id, nodeIds]) => ({
    serviceId: id,
    serviceName: getServiceById(id)?.name ?? id,
    nodeIds,
    connections: serializeAsIs(represent, id).connections,
  }));
  const nodes = uniqueChainNodes(represent.asIs.chains)
    .map(getDiagramNode)
    .filter(Boolean)
    .map((node) => ({
      componentId: node.id,
      name: node.name,
      type: node.type,
      sourceSectionId: node.sourceSectionId,
      sourceLabel: node.sourceLabel,
      relatedServices: node.relatedServiceIds,
      sourceEvidence: node.characteristics,
    }));

  return saveDocument('asis', {
    text,
    serviceId: activeId,
    chains: allChains,
    nodes,
    connections: serialized.connections,
    evidences: nodes.map((node) => node.sourceEvidence),
    sources: [...new Set(nodes.map((node) => node.sourceLabel))],
  });
}

export function addSpofToDocument() {
  const state = getState();
  const represent = representFrom(state);
  const principals = principalAsIsNodes(represent.asIs.chains);
  const rows = principals
    .map((node) => {
      const record = represent.spof.records[node.id];
      if (!record?.status || !record?.justification?.trim()) {
        return null;
      }
      const incidentIds = Object.entries(represent.incidents)
        .filter(([, ids]) => (ids ?? []).includes(node.id))
        .map(([incidentId]) => incidentId);
      return {
        componentId: node.id,
        name: node.name,
        label: node.name,
        dependency: record.depends ?? '',
        redundancy: record.redundancy ?? '',
        failover: record.failover ?? '',
        impact: record.failureImpact ?? '',
        studentCriticality: record.status,
        justification: record.justification,
        evidence: node.characteristics,
        sourceSectionId: node.sourceSectionId,
        sourceLabel: node.sourceLabel,
        evidenceIds: [node.id],
        incidentIds,
        reviewRequired: Boolean(record.reviewRequired),
      };
    })
    .filter(Boolean);

  if (rows.length < 1 || rows.length !== principals.length || rows.some((row) => row.reviewRequired)) {
    return failValidation();
  }

  const text = rows
    .map((row) => `${row.name} | ${row.impact || 'impacto no descrito'} | ${row.studentCriticality} | ${row.justification}`)
    .join('\n');

  patchRepresent((current) => ({
    ...current,
    spof: { ...current.spof, reviewRequired: false },
  }));

  return saveDocument('spof', {
    text,
    rows,
    evidences: rows.map((row) => row.evidence),
    sources: [...new Set(rows.map((row) => row.sourceLabel))],
    reviewRequired: false,
  });
}

export function completeRepresentStage() {
  const state = getState();
  const represent = representFrom(state);
  const completion = getRepresentCompletion(represent, documentsFrom(state));
  if (!completion.ready) {
    setState({ documentError: 'Completa inventario, AS-IS y la matriz SPOF, y resuelve las revisiones pendientes.' });
    return false;
  }

  const completedStages = [...new Set([...(state.completedStages ?? []), 2, 3])];
  patchState((prev) => ({
    ...prev,
    completedStages,
    currentStage: 2,
    progress: computeProgress(completedStages),
    documentError: null,
    analysis: {
      ...prev.analysis,
      represent: { ...representFrom(prev), completed: true, spof: { ...representFrom(prev).spof, reviewRequired: false } },
    },
  }));
  return true;
}

export function getRepresentSnapshot(state = getState()) {
  const represent = representFrom(state);
  const documents = documentsFrom(state);
  return {
    represent,
    documents,
    completion: getRepresentCompletion(represent, documents),
  };
}

export function getPickerItems() {
  return pickerCatalog;
}

export function getArchitectureNodes() {
  return architectureNodes;
}

export function componentRelation(serviceId, componentId) {
  return relationFor(serviceId, componentId);
}

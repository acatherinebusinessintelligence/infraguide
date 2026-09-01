import { architectureNodes, pickerCatalog, serviceComponentHints } from '../data/methodology/represent.js';
import { getServiceById, isDocumented } from './understandModel.js';

export function createRepresentState() {
  return {
    currentSubstage: 1,
    activeServiceId: null,
    serviceComponents: {},
    inventory: {
      selectedIds: [],
      relevance: {},
      serviceLinks: {},
      draft: '',
    },
    asIs: {
      chains: {},
      description: '',
      lastEditedAt: null,
    },
    incidents: {},
    spof: {
      activeComponentId: null,
      records: {},
      reviewRequired: false,
      activities: {},
    },
    checkpoint: {},
    completed: false,
  };
}

export function mergeRepresent(saved) {
  const base = createRepresentState();
  if (!saved || typeof saved !== 'object') {
    return base;
  }
  return {
    ...base,
    ...saved,
    serviceComponents: saved.serviceComponents ?? {},
    inventory: { ...base.inventory, ...saved.inventory },
    asIs: { ...base.asIs, ...saved.asIs, chains: saved.asIs?.chains ?? {} },
    incidents: saved.incidents ?? {},
    spof: {
      ...base.spof,
      ...saved.spof,
      records: saved.spof?.records ?? {},
      activities: saved.spof?.activities ?? {},
    },
    checkpoint: saved.checkpoint ?? {},
  };
}

export function getNodeById(id) {
  return architectureNodes.find((item) => item.id === id) ?? pickerCatalog.find((item) => item.id === id) ?? null;
}

export function getDiagramNode(id) {
  return architectureNodes.find((item) => item.id === id && item.inDiagram) ?? null;
}

export function relationFor(serviceId, componentId) {
  const hints = serviceComponentHints[serviceId];
  if (!hints) {
    return 'possible';
  }
  if (hints.direct?.includes(componentId)) return 'direct';
  if (hints.possible?.includes(componentId)) return 'possible';
  if (hints.unrelated?.includes(componentId)) return 'unrelated';
  return 'possible';
}

export function getCriticalServiceList(state) {
  const rows = state.documentSections?.criticalServices?.rows ?? [];
  const tableIds = state.analysis?.understand?.criticality?.tableIds ?? [];
  const fromRecords = Object.values(state.analysis?.understand?.criticality?.records ?? {})
    .filter((record) => record?.justification?.trim() && record?.impact)
    .map((record) => record.serviceId);
  const ids = [...new Set([...rows.map((row) => row.serviceId), ...tableIds, ...fromRecords])].filter(Boolean);
  return ids.map((id) => {
    const service = getServiceById(id);
    const row = rows.find((item) => item.serviceId === id);
    if (!service) {
      return null;
    }
    return {
      ...service,
      studentCriticality: row?.studentCriticality ?? state.analysis?.understand?.criticality?.records?.[id]?.impact,
      justification: row?.justification ?? state.analysis?.understand?.criticality?.records?.[id]?.justification,
    };
  }).filter(Boolean);
}

export function uniqueChainNodes(chains = {}) {
  return [...new Set(Object.values(chains).flat())];
}

export function chainConnections(nodeIds = []) {
  const links = [];
  for (let index = 0; index < nodeIds.length - 1; index += 1) {
    links.push({ from: nodeIds[index], to: nodeIds[index + 1] });
  }
  return links;
}

export function principalAsIsNodes(chains = {}) {
  return uniqueChainNodes(chains)
    .map(getDiagramNode)
    .filter((node) => node?.principal);
}

export function getRepresentCompletion(represent, documentSections) {
  const documentedInventory = isDocumented(documentSections.inventory);
  const documentedAsis = isDocumented(documentSections.asis);
  const documentedSpof = isDocumented(documentSections.spof);
  const hasChain = uniqueChainNodes(represent.asIs?.chains).length >= 3;
  const hasDescription = Boolean(represent.asIs?.description?.trim() || documentSections.asis?.text?.trim());
  const principals = principalAsIsNodes(represent.asIs?.chains);
  const reviewed = principals.filter((node) => {
    const record = represent.spof?.records?.[node.id];
    return Boolean(record?.status && record?.justification?.trim());
  });
  const allPrincipalReviewed = principals.length > 0 && reviewed.length === principals.length;
  const reviewPending = Boolean(represent.spof?.reviewRequired) ||
    Object.values(represent.spof?.records ?? {}).some((record) => record?.reviewRequired);

  return {
    inventory: documentedInventory,
    asIs: documentedAsis && hasChain && hasDescription,
    spof: documentedSpof && allPrincipalReviewed,
    reviewPending,
    ready: documentedInventory && documentedAsis && hasChain && hasDescription && documentedSpof && allPrincipalReviewed && !reviewPending,
    principalCount: principals.length,
    reviewedCount: reviewed.length,
  };
}

export function serializeAsIs(represent, serviceId) {
  const nodeIds = represent.asIs.chains[serviceId] ?? [];
  const nodes = nodeIds.map(getDiagramNode).filter(Boolean);
  return {
    serviceId,
    nodeIds,
    nodes: nodes.map((node) => ({
      componentId: node.id,
      name: node.name,
      type: node.type,
      sourceSectionId: node.sourceSectionId,
      sourceLabel: node.sourceLabel,
      relatedServices: node.relatedServiceIds,
      sourceEvidence: node.characteristics,
    })),
    connections: chainConnections(nodeIds),
  };
}

export const DATA_STATUS = {
  NOT_FOUND: 'NOT_FOUND',
  FOUND: 'FOUND',
  COLLECTED: 'COLLECTED',
  READY_TO_PROCESS: 'READY_TO_PROCESS',
  PROCESSED: 'PROCESSED',
  DOCUMENTED: 'DOCUMENTED',
};

export const DATA_STATUS_LABEL = {
  NOT_FOUND: 'No localizado',
  FOUND: 'Dato identificado',
  COLLECTED: 'Dato recolectado',
  READY_TO_PROCESS: 'Listo para calcular',
  PROCESSED: 'Procesado',
  DOCUMENTED: 'Documentado',
};

export const dataMap = {
  periodHours: {
    key: 'periodHours',
    sourceSectionId: 'operational-data',
    usedIn: ['availability', 'mtbf'],
    laterUses: ['comparación con SLA'],
    documentSectionId: 6,
  },
  downtimeHours: {
    key: 'downtimeHours',
    sourceSectionId: 'operational-data',
    usedIn: ['availability', 'mtbf', 'continuity'],
    laterUses: ['hallazgos', 'análisis de continuidad'],
    documentSectionId: 6,
  },
  incidentCount: {
    key: 'incidentCount',
    sourceSectionId: 'operational-data',
    usedIn: ['mttr', 'mtbf', 'diagnosis'],
    laterUses: ['hallazgos'],
    documentSectionId: 6,
  },
  totalRecoveryHours: {
    key: 'totalRecoveryHours',
    sourceSectionId: 'operational-data',
    usedIn: ['mttr'],
    laterUses: ['análisis de recuperación', 'comparación con SLA', 'hallazgos'],
    documentSectionId: 6,
  },
  appCpuPeak: {
    key: 'appCpuPeak',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity', 'diagnosis'],
    laterUses: ['hallazgos de rendimiento'],
    documentSectionId: 7,
  },
  appRamUsage: {
    key: 'appRamUsage',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity'],
    laterUses: ['hallazgos'],
    documentSectionId: 6,
  },
  appLatencyPeak: {
    key: 'appLatencyPeak',
    sourceSectionId: 'operational-data',
    usedIn: ['performance', 'diagnosis'],
    laterUses: ['hallazgos'],
    documentSectionId: 7,
  },
  appDemandPeak: {
    key: 'appDemandPeak',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity', 'performance'],
    laterUses: ['proyección de demanda'],
    documentSectionId: 6,
  },
  dbStorageUsage: {
    key: 'dbStorageUsage',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity'],
    laterUses: ['crecimiento'],
    documentSectionId: 6,
  },
  dbMonthlyGrowth: {
    key: 'dbMonthlyGrowth',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity'],
    laterUses: ['proyección de almacenamiento'],
    documentSectionId: 6,
  },
  dbConnectionsPeak: {
    key: 'dbConnectionsPeak',
    sourceSectionId: 'operational-data',
    usedIn: ['capacity', 'performance'],
    laterUses: ['hallazgos'],
    documentSectionId: 6,
  },
  storageCapacity: {
    key: 'storageCapacity',
    sourceSectionId: 'storage',
    usedIn: ['capacity'],
    laterUses: ['crecimiento'],
    documentSectionId: 6,
  },
  storageUsed: {
    key: 'storageUsed',
    sourceSectionId: 'storage',
    usedIn: ['capacity'],
    laterUses: ['crecimiento'],
    documentSectionId: 6,
  },
  storageGrowth: {
    key: 'storageGrowth',
    sourceSectionId: 'storage',
    usedIn: ['capacity'],
    laterUses: ['proyección de almacenamiento'],
    documentSectionId: 6,
  },
  bogotaUsers: {
    key: 'bogotaUsers',
    sourceSectionId: 'context',
    usedIn: ['context'],
    laterUses: ['dimensionamiento de usuarios'],
    documentSectionId: 1,
  },
  systemUsers: {
    key: 'systemUsers',
    sourceSectionId: 'context',
    usedIn: ['context'],
    laterUses: ['capacidad de identidad'],
    documentSectionId: 1,
  },
  concurrentUsersHighSeason: {
    key: 'concurrentUsersHighSeason',
    sourceSectionId: 'context',
    usedIn: ['context'],
    laterUses: ['capacidad concurrente'],
    documentSectionId: 1,
  },
  virtualizationHosts: {
    key: 'virtualizationHosts',
    sourceSectionId: 'infrastructure',
    usedIn: ['architecture'],
    laterUses: ['inventario AS-IS'],
    documentSectionId: 4,
  },
  mainInternetLinks: {
    key: 'mainInternetLinks',
    sourceSectionId: 'network',
    usedIn: ['architecture', 'continuity'],
    laterUses: ['SPOF de conectividad'],
    documentSectionId: 3,
  },
  mainFirewallCount: {
    key: 'mainFirewallCount',
    sourceSectionId: 'network',
    usedIn: ['architecture', 'continuity'],
    laterUses: ['SPOF'],
    documentSectionId: 5,
  },
  mfaCoverage: {
    key: 'mfaCoverage',
    sourceSectionId: 'security',
    usedIn: ['security'],
    laterUses: ['ISO 27001', 'hallazgos'],
    documentSectionId: 10,
  },
  privilegedAccessReview: {
    key: 'privilegedAccessReview',
    sourceSectionId: 'security',
    usedIn: ['security'],
    laterUses: ['gobierno de accesos'],
    documentSectionId: 10,
  },
  staleAccounts: {
    key: 'staleAccounts',
    sourceSectionId: 'security',
    usedIn: ['security'],
    laterUses: ['hallazgos de identidad'],
    documentSectionId: 10,
  },
  backupRestoreTests: {
    key: 'backupRestoreTests',
    sourceSectionId: 'backup',
    usedIn: ['governance', 'continuity'],
    laterUses: ['ITIL', 'continuidad'],
    documentSectionId: 8,
  },
  backupExternalGapDays: {
    key: 'backupExternalGapDays',
    sourceSectionId: 'backup',
    usedIn: ['governance', 'continuity'],
    laterUses: ['hallazgos', 'ITIL'],
    documentSectionId: 8,
  },
  incidentRegistrationCoverage: {
    key: 'incidentRegistrationCoverage',
    sourceSectionId: 'operations',
    usedIn: ['governance'],
    laterUses: ['ITIL'],
    documentSectionId: 8,
  },
  executiveReporting: {
    key: 'executiveReporting',
    sourceSectionId: 'operations',
    usedIn: ['governance'],
    laterUses: ['métricas ejecutivas'],
    documentSectionId: 6,
  },
  slaCompleteness: {
    key: 'slaCompleteness',
    sourceSectionId: 'governance',
    usedIn: ['governance'],
    laterUses: ['comparación de disponibilidad'],
    documentSectionId: 8,
  },
  capacityDecisions: {
    key: 'capacityDecisions',
    sourceSectionId: 'governance',
    usedIn: ['governance', 'capacity'],
    laterUses: ['decisión de inversión'],
    documentSectionId: 11,
  },
  itHeadcount: {
    key: 'itHeadcount',
    sourceSectionId: 'it-team',
    usedIn: ['context'],
    laterUses: ['capacidad operativa de TI'],
    documentSectionId: 1,
  },
  incidentERollback: {
    key: 'incidentERollback',
    sourceSectionId: 'incidents',
    usedIn: ['governance', 'diagnosis'],
    laterUses: ['gestión de cambios'],
    documentSectionId: 7,
  },
  serviceErpCriticality: {
    key: 'serviceErpCriticality',
    sourceSectionId: 'services',
    usedIn: ['services'],
    laterUses: ['servicios críticos'],
    documentSectionId: 2,
  },
  serviceProductionCriticality: {
    key: 'serviceProductionCriticality',
    sourceSectionId: 'services',
    usedIn: ['services'],
    laterUses: ['servicios críticos'],
    documentSectionId: 2,
  },
  serviceSalesCriticality: {
    key: 'serviceSalesCriticality',
    sourceSectionId: 'services',
    usedIn: ['services'],
    laterUses: ['servicios críticos'],
    documentSectionId: 2,
  },
  serviceFilesCriticality: {
    key: 'serviceFilesCriticality',
    sourceSectionId: 'services',
    usedIn: ['services'],
    laterUses: ['servicios críticos'],
    documentSectionId: 2,
  },
  serviceColdChainCriticality: {
    key: 'serviceColdChainCriticality',
    sourceSectionId: 'services',
    usedIn: ['services'],
    laterUses: ['servicios críticos'],
    documentSectionId: 2,
  },
};

export const analysisCatalog = {
  availability: {
    id: 'availability',
    label: 'Disponibilidad',
    requiredKeys: ['periodHours', 'downtimeHours'],
    documentSectionId: 6,
    documentLabel: 'Sección 6 - Métricas',
  },
  mttr: {
    id: 'mttr',
    label: 'MTTR',
    requiredKeys: ['incidentCount', 'totalRecoveryHours'],
    documentSectionId: 6,
    documentLabel: 'Sección 6 - Métricas',
  },
  mtbf: {
    id: 'mtbf',
    label: 'MTBF estimado',
    requiredKeys: ['periodHours', 'downtimeHours', 'incidentCount'],
    documentSectionId: 6,
    documentLabel: 'Sección 6 - Métricas',
  },
  capacity: {
    id: 'capacity',
    label: 'Capacidad de almacenamiento',
    requiredKeys: ['storageCapacity', 'storageUsed', 'storageGrowth'],
    documentSectionId: 6,
    documentLabel: 'Sección 6 - Métricas',
  },
  performance: {
    id: 'performance',
    label: 'Rendimiento',
    requiredKeys: ['appLatencyPeak', 'appCpuPeak'],
    documentSectionId: 7,
    documentLabel: 'Sección 7 - Hallazgos',
  },
  diagnosis: {
    id: 'diagnosis',
    label: 'Diagnóstico',
    requiredKeys: ['incidentCount', 'downtimeHours'],
    documentSectionId: 7,
    documentLabel: 'Sección 7 - Hallazgos',
  },
  continuity: {
    id: 'continuity',
    label: 'Análisis de continuidad',
    requiredKeys: ['downtimeHours'],
    documentSectionId: 7,
    documentLabel: 'Sección 7 - Hallazgos',
  },
  context: {
    id: 'context',
    label: 'Contexto organizacional',
    requiredKeys: ['systemUsers', 'bogotaUsers'],
    documentSectionId: 1,
    documentLabel: 'Sección 1 - Contexto de la organización',
  },
  services: {
    id: 'services',
    label: 'Servicios críticos',
    requiredKeys: ['serviceErpCriticality', 'serviceColdChainCriticality'],
    documentSectionId: 2,
    documentLabel: 'Sección 2 - Servicios críticos',
  },
  architecture: {
    id: 'architecture',
    label: 'Arquitectura',
    requiredKeys: ['virtualizationHosts'],
    documentSectionId: 3,
    documentLabel: 'Sección 3 - Arquitectura AS-IS',
  },
  security: {
    id: 'security',
    label: 'Seguridad',
    requiredKeys: ['mfaCoverage', 'staleAccounts'],
    documentSectionId: 10,
    documentLabel: 'Sección 10 - ISO 27001',
  },
  governance: {
    id: 'governance',
    label: 'Gobierno TI',
    requiredKeys: ['slaCompleteness', 'backupExternalGapDays'],
    documentSectionId: 8,
    documentLabel: 'Sección 8 - ITIL',
  },
};

export const dataGroups = [
  { id: 'context', label: 'CONTEXTO', keys: ['systemUsers', 'bogotaUsers', 'concurrentUsersHighSeason', 'itHeadcount'] },
  {
    id: 'services',
    label: 'SERVICIOS',
    keys: [
      'serviceErpCriticality',
      'serviceProductionCriticality',
      'serviceColdChainCriticality',
      'serviceSalesCriticality',
      'serviceFilesCriticality',
    ],
  },
  { id: 'architecture', label: 'ARQUITECTURA', keys: ['virtualizationHosts', 'mainInternetLinks', 'mainFirewallCount'] },
  { id: 'availability', label: 'DISPONIBILIDAD', keys: ['periodHours', 'downtimeHours'] },
  { id: 'recovery', label: 'RECUPERACIÓN', keys: ['incidentCount', 'totalRecoveryHours'] },
  {
    id: 'capacity',
    label: 'CAPACIDAD',
    keys: [
      'storageCapacity',
      'storageUsed',
      'storageGrowth',
      'appCpuPeak',
      'appRamUsage',
      'appDemandPeak',
    ],
  },
  { id: 'security', label: 'SEGURIDAD', keys: ['mfaCoverage', 'privilegedAccessReview', 'staleAccounts'] },
  {
    id: 'governance',
    label: 'GOBIERNO',
    keys: [
      'backupRestoreTests',
      'backupExternalGapDays',
      'incidentRegistrationCoverage',
      'slaCompleteness',
      'capacityDecisions',
      'incidentERollback',
    ],
  },
];

export function getAnalysisLabel(id) {
  return analysisCatalog[id]?.label ?? id;
}

export function isGroupIdentified(group, collectedKeys) {
  return group.keys.some((key) => collectedKeys.has(key));
}

export function deriveMethodologyStatus(collectedData, previous = {}) {
  const collectedKeys = new Set(collectedData.map((item) => item.key));
  const status = { ...previous };

  Object.keys(dataMap).forEach((key) => {
    if (collectedKeys.has(key)) {
      status[key] = DATA_STATUS.COLLECTED;
      return;
    }
    if (status[key] === DATA_STATUS.COLLECTED || status[key] === DATA_STATUS.READY_TO_PROCESS) {
      status[key] = previous[key] === DATA_STATUS.FOUND ? DATA_STATUS.FOUND : DATA_STATUS.NOT_FOUND;
    }
  });

  Object.values(analysisCatalog).forEach((analysis) => {
    const ready = analysis.requiredKeys.every((key) => collectedKeys.has(key));
    if (ready) {
      status[analysis.id] = DATA_STATUS.READY_TO_PROCESS;
    } else {
      status[analysis.id] = DATA_STATUS.NOT_FOUND;
    }
  });

  return status;
}

export function getGroupProgress(collectedData) {
  const collectedKeys = new Set(collectedData.map((item) => item.key));
  const identified = dataGroups.filter((group) => isGroupIdentified(group, collectedKeys)).length;
  return { identified, total: dataGroups.length };
}

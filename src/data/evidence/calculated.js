export const calculatedMetrics = [
  {
    id: 'calc-availability',
    label: 'Disponibilidad',
    formula: 'Disponibilidad = (Tiempo total − tiempo fuera de servicio) / Tiempo total × 100',
    sourceKeys: ['periodHours', 'downtimeHours'],
    usedBy: ['measure', 'diagnose', 'document'],
  },
  {
    id: 'calc-mttr',
    label: 'MTTR',
    formula: 'MTTR = Tiempo total de recuperación / Número de incidentes',
    sourceKeys: ['totalRecoveryHours', 'incidentCount'],
    usedBy: ['measure', 'diagnose', 'document'],
  },
  {
    id: 'calc-mtbf',
    label: 'MTBF',
    formula: 'MTBF ≈ (Tiempo total − tiempo fuera de servicio) / Número de incidentes',
    sourceKeys: ['periodHours', 'downtimeHours', 'incidentCount'],
    usedBy: ['measure', 'diagnose', 'document'],
  },
  {
    id: 'calc-storage-used',
    label: 'Uso de almacenamiento',
    formula: 'Uso % = Almacenamiento usado / Capacidad × 100',
    sourceKeys: ['storageUsed', 'storageCapacity'],
    usedBy: ['measure', 'diagnose', 'document'],
  },
  {
    id: 'calc-storage-margin',
    label: 'Margen de almacenamiento',
    formula: 'Meses ≈ (Capacidad − usado) / Crecimiento mensual',
    sourceKeys: ['storageCapacity', 'storageUsed', 'storageGrowth'],
    usedBy: ['measure', 'diagnose', 'document'],
  },
];

export const calculatedDiagnoseIds = new Set([
  'ev-avail',
  'ev-mttr',
  'ev-mtbf',
  'ev-margin',
  'ev-metric-capacity-01',
]);

export const diagnoseFieldKeys = {
  'ev-wms': 'serviceErp',
  'ev-mes': 'serviceProduction',
  'ev-ecom': 'serviceSales',
  'ev-db-srv01': 'erpDb01Vcpu',
  'ev-wms-srv01': 'prodApp01Vcpu',
  'ev-cpu': 'appCpuPeak',
  'ev-ram': 'appRamUsage',
  'ev-latency': 'appLatencyPeak',
  'ev-demand': 'appDemandPeak',
  'ev-storage-used': 'storageUsed',
  'ev-growth': 'storageGrowth',
  'ev-stale-accounts': 'staleAccounts',
};

export const diagnoseCalculatedMap = {
  'ev-avail': 'calc-availability',
  'ev-mttr': 'calc-mttr',
  'ev-mtbf': 'calc-mtbf',
  'ev-margin': 'calc-storage-margin',
  'ev-metric-capacity-01': 'calc-storage-used',
};

export function getCalculatedMetric(id) {
  return calculatedMetrics.find((item) => item.id === id) ?? null;
}

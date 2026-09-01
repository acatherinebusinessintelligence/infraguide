export const STAGE_STATUS = {
  BLOCKED: 'blocked',
  AVAILABLE: 'available',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed',
};

export const STAGE_STATUS_LABEL = {
  blocked: 'BLOQUEADO',
  available: 'DISPONIBLE',
  in_progress: 'EN PROGRESO',
  completed: 'COMPLETADO',
};

export const stages = [
  {
    id: 1,
    number: '01',
    name: 'COMPRENDER',
    description:
      'Identifica qué hace la organización, quiénes utilizan sus servicios y qué es crítico.',
    documentTargets: [1, 2],
  },
  {
    id: 2,
    number: '02',
    name: 'REPRESENTAR',
    description: 'Arquitectura AS-IS.',
    documentTargets: [3, 4],
  },
  {
    id: 3,
    number: '03',
    name: 'IDENTIFICAR',
    description: 'Dependencias y SPOF (se documentan en REPRESENTAR).',
    documentTargets: [5],
  },
  {
    id: 4,
    number: '04',
    name: 'MEDIR',
    description: 'Cálculo guiado: disponibilidad, MTTR, MTBF y capacidad, con glosario e interpretación.',
    documentTargets: [6],
  },
  {
    id: 5,
    number: '05',
    name: 'DIAGNOSTICAR',
    description: 'Hallazgos y evidencia.',
    documentTargets: [7],
  },
  {
    id: 6,
    number: '06',
    name: 'GOBERNAR',
    description: 'ITIL, COBIT e ISO 27001.',
    documentTargets: [8, 9, 10],
  },
  {
    id: 7,
    number: '07',
    name: 'DECIDIR',
    description: 'Estrategia tecnológica y CAPEX/OPEX.',
    documentTargets: [11, 12, 13],
  },
  {
    id: 8,
    number: '08',
    name: 'CONSTRUIR',
    description: 'Documento final.',
    documentTargets: [14],
  },
];

export function getStageStatus(stage, state) {
  if (state.completedStages.includes(stage.id)) {
    return STAGE_STATUS.COMPLETED;
  }
  if (state.currentStage === stage.id) {
    return STAGE_STATUS.IN_PROGRESS;
  }
  if (stage.id === 1) {
    return STAGE_STATUS.AVAILABLE;
  }
  if (state.completedStages.includes(stage.id - 1)) {
    return STAGE_STATUS.AVAILABLE;
  }
  return STAGE_STATUS.BLOCKED;
}

export function isStageActionable(status) {
  return (
    status === STAGE_STATUS.AVAILABLE ||
    status === STAGE_STATUS.IN_PROGRESS ||
    status === STAGE_STATUS.COMPLETED
  );
}

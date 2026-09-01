export const STATEMENT_KIND = {
  FACT: 'hecho confirmado',
  CALCULATION: 'cálculo',
  INFERENCE: 'inferencia técnica',
  ASSUMPTION: 'supuesto',
  RECOMMENDATION: 'recomendación',
  PENDING: 'información pendiente',
};

export const EVIDENCE_STATE = {
  CONFIRMED: 'Confirmada',
  CALCULATED: 'Calculada',
  INFERRED: 'Inferida',
  PENDING: 'Pendiente',
};

export const SEVERITY = {
  critical: 'Crítica',
  high: 'Alta',
  medium: 'Media',
  low: 'Baja',
};

export const COST_CLASS = {
  REFERENCE: 'estimación de referencia',
  TO_VALIDATE: 'valor por validar',
  NOT_INCLUDED: 'no incluye impuestos, instalación o contingencia',
};

export const CONSULTING_SECTION_KEYS = [
  'dictamen',
  'scope',
  'findings',
  'architecture',
  'performance',
  'risks',
  'target',
  'alternatives',
  'program',
  'governance',
  'closing',
  'annexEvidence',
  'annexEngineering',
];

export function createEmptyConsultingReport() {
  return {
    metadata: {
      documentType: 'Informe técnico de consultoría de infraestructura TI',
      caseName: '',
      recipient: 'Comité de decisión / dirección de TI',
      object: 'Evaluación de infraestructura tecnológica, resiliencia, capacidad y gobierno.',
      cutoffDate: '',
      horizon: '',
      classification: 'Uso interno — apoyo a decisión de inversión',
      generatedAt: '',
      appVersion: '',
      documentVersion: '',
    },
    executiveOpinion: {
      insufficient: true,
      condition: '',
      exposures: [],
      recommendedDecision: '',
      immediatePriorities: [],
      investmentConditions: [],
      kpis: [],
    },
    scope: {
      domains: [],
      sources: [],
      method: '',
      limitations: [],
      assumptions: [],
      toConfirm: [],
    },
    findings: [],
    architectureAssessment: {
      asIsSummary: '',
      criticalDependencies: [],
      spof: [],
      failureModes: [],
      redundancyNote: '',
      recovery: '',
      componentTable: [],
    },
    performanceAndCapacity: [],
    prioritizedRisks: [],
    controlMap: [],
    targetArchitecture: {
      disclaimer:
        'Arquitectura objetivo de referencia, sujeta a validación de compatibilidad, dimensionamiento y pruebas.',
      summary: '',
      components: [],
      requirements: [],
    },
    alternatives: {
      criteria: [],
      options: [],
      selectedId: '',
      justification: '',
      scored: false,
    },
    recommendedProgram: {
      budgetNote: '',
      budgetLimit: null,
      initiatives: [],
      horizons: [],
      sufficiency: '',
    },
    governance: {
      practices: [],
      kpis: [],
    },
    closing: {
      condition: '',
      decision: '',
      priorities: [],
      inactionRisks: [],
      approvalConditions: [],
      pending: [],
    },
    evidenceRegister: [],
    detailedEngineeringRequirements: [],
    validation: { ok: true, errors: [], warnings: [] },
    usedEvidenceIds: [],
  };
}

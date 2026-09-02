import { getCaseById } from '../cases/index.js';
import { FINDING_STATUS } from '../../data/methodology/diagnose.js';
import { GOVERN_STATUS } from '../../data/methodology/govern.js';
import { DECISION_STATUS } from '../../data/methodology/decide.js';
import { METRIC_STATUS } from '../../data/methodology/measure.js';
import { createUnderstandState, createDocumentBundle } from '../../state/understandModel.js';
import { createRepresentState } from '../../state/representModel.js';
import { createMeasureState } from '../../state/measureModel.js';
import { createDiagnoseState } from '../../state/diagnoseModel.js';
import { createGovernState } from '../../state/governModel.js';
import { createDecideState } from '../../state/decideModel.js';
import { createBuildState } from '../../state/buildModel.js';
import { createExportState } from '../../state/exportModel.js';

function govBase(findingId, extra) {
  return {
    findingId,
    sources: ['Diagnóstico'],
    sourceSections: ['findings'],
    status: GOVERN_STATUS.DOCUMENTED,
    ...extra,
  };
}

export function modelFindings() {
  return [
    {
      findingId: 'finding-01',
      title: 'ERP-APP01 degrada el cierre comercial (CPU 92 % y 4,8 s)',
      category: 'performance',
      evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'],
      impact: 'Facturación y despacho lentos durante el pico del 28 de agosto.',
      criticality: 'high',
      justification: 'Pico documentado de CPU, latencia y demanda concurrente.',
      description: 'ERP-APP01 alcanzó 92 % de CPU y 4,8 s de respuesta con 181 usuarios concurrentes.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['findings'],
    },
    {
      findingId: 'finding-02',
      title: 'NAS-01 al 80 % con crecimiento de 650 GB/mes',
      category: 'storage',
      evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin'],
      impact: 'Riesgo de saturación si el crecimiento se mantiene.',
      criticality: 'high',
      justification: 'Capacidad y uso de NAS-01 están en el caso; el margen es cálculo.',
      description: 'NAS-01: 19,2 TB de 24 TB. Crecimiento 650 GB/mes.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['findings'],
    },
    {
      findingId: 'finding-03',
      title: 'FW-01 es instancia única de perímetro',
      category: 'dependency',
      evidenceIds: ['ev-firewall-unique', 'ev-inc-b'],
      impact: 'La VPN de sedes queda incomunicada si FW-01 falla.',
      criticality: 'critical',
      justification: 'Un firewall principal y el incidente de 1 h 35 min.',
      description: 'Existe un único firewall principal (FW-01).',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['findings'],
    },
    {
      findingId: 'finding-04',
      title: 'Baja tardía de cuentas de exempleados',
      category: 'security',
      evidenceIds: ['ev-stale-accounts'],
      impact: 'Cuentas privilegiadas o de usuario pueden permanecer activas tras el retiro.',
      criticality: 'high',
      justification: 'Revisión de agosto: cuatro cuentas deshabilitadas entre 12 y 27 días después.',
      description: 'Cuatro cuentas de exempleados se deshabilitaron tarde.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['findings'],
    },
    {
      findingId: 'finding-05',
      title: 'Cambio ERP sin plan de reversa',
      category: 'operation',
      evidenceIds: ['ev-inc-e'],
      impact: 'Un cambio incompatible afecta el servicio sin rollback documentado.',
      criticality: 'medium',
      justification: 'El incidente de actualización no incluía riesgo, pruebas ni reversa.',
      description: 'Actualización de conector ERP sin plan de reversa.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['findings'],
    },
  ];
}

export function modelRecommendations() {
  return [
    {
      decisionId: 'dec-01',
      findingIds: ['finding-03'],
      evidenceIds: ['ev-firewall-unique'],
      decision: 'Diseñar failover de perímetro compatible con la VPN actual, sin fijar marca.',
      title: 'Resiliencia de FW-01',
      impact: 'VPN de sedes.',
      benefitText: 'Eliminar el punto único de falla de perímetro.',
      riskText: 'Complejidad de recorte y compatibilidad.',
      costModel: 'capex',
      costJustification: 'Valor de referencia del segundo firewall en el caso.',
      metricIds: ['availability'],
      metricText: 'Disponibilidad de VPN de sedes.',
      metricTarget: 'Failover ensayado con evidencia de conmutación.',
      priority: 'immediate',
      justification: 'FW-01 es único y ya interrumpió la VPN.',
      alternatives: [{ title: 'Mantener FW-01 único' }, { title: 'Failover de perímetro' }],
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-02',
      findingIds: ['finding-02'],
      evidenceIds: ['ev-storage-used'],
      decision: 'Retención/archivado y ampliación planificada de NAS-01.',
      title: 'Capacidad de almacenamiento',
      impact: 'Saturación de archivos e imágenes.',
      benefitText: 'Anticipar umbral de uso.',
      riskText: 'Pérdida si la retención se aplica mal.',
      costModel: 'mixed',
      costJustification: 'Expansión NAS del caso es estimación de referencia.',
      metricIds: ['storage-use'],
      metricText: '% uso NAS.',
      metricTarget: 'Uso bajo umbral aprobado y prueba de crecimiento.',
      priority: 'high',
      justification: '80 % y 650 GB/mes están en el caso.',
      alternatives: [{ title: 'Solo comprar disco' }, { title: 'Retención + ampliación' }],
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-03',
      findingIds: ['finding-04'],
      evidenceIds: ['ev-stale-accounts'],
      decision: 'Formalizar baja de cuentas en el mismo día hábil del retiro y completar MFA privilegiado.',
      title: 'Ciclo de vida de identidades',
      impact: 'Acceso residual.',
      benefitText: 'Reducir cuentas huérfanas y privilegios sin MFA.',
      riskText: 'Fricción operativa.',
      costModel: 'opex',
      costJustification: 'Esfuerzo de identidad.',
      metricIds: [],
      metricText: 'Cuentas privilegiadas con MFA y tiempo de baja.',
      metricTarget: '0 cuentas de exempleados activas > 1 día hábil; MFA en 17/17 privilegiadas.',
      priority: 'immediate',
      justification: 'La revisión de agosto documenta bajas tardías y MFA parcial.',
      alternatives: [{ title: 'Revisión trimestral' }, { title: 'Baja el mismo día hábil' }],
      status: DECISION_STATUS.DOCUMENTED,
    },
  ];
}

export function createModelReportState() {
  const caseData = getCaseById('modelo-helados-boreal');
  const findings = modelFindings();
  const recs = modelRecommendations();
  return {
    selectedCase: { id: caseData.id, name: caseData.name },
    completedStages: [1, 2, 3, 4, 5, 6, 7, 8],
    collectedData: [],
    documentSections: {
      ...createDocumentBundle(),
      spof: {
        status: 'DOCUMENTED',
        text: 'FW-01 sin redundancia documentada.',
        rows: [{ name: 'FW-01', impact: 'VPN de sedes', justification: 'Instancia única', evidence: 'Página de red e incidente B' }],
      },
      asis: {
        status: 'DOCUMENTED',
        text: 'Cadena ERP documentada. No se relista el inventario.',
        chains: [{ serviceId: 'erp', nodeIds: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'] }],
      },
      metrics: { status: 'DOCUMENTED', text: 'Métricas del periodo.', subsections: {} },
      strategy: { status: 'DOCUMENTED', text: 'Mantener el ERP; fortalecer perímetro, identidad y capacidad de NAS.' },
      conclusions: {
        status: 'DOCUMENTED',
        text: 'La infraestructura opera, pero concentra exposiciones en perímetro, identidad y almacenamiento.',
      },
    },
    analysis: {
      understand: createUnderstandState(),
      represent: {
        ...createRepresentState(),
        asIs: {
          description: 'Cadena ERP: usuarios → red → FW-01 → ERP-APP01 → ERP-DB01.',
          chains: { erp: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'] },
        },
        spof: {
          records: {
            firewall: {
              componentId: 'firewall',
              name: 'FW-01',
              status: 'justified',
              impact: 'VPN de sedes interrumpida',
              justification: 'Instancia única',
            },
          },
        },
      },
      measure: {
        ...createMeasureState(),
        availability: {
          ...createMeasureState().availability,
          result: 99.51,
          sourceKeys: ['periodHours', 'downtimeHours'],
          status: METRIC_STATUS.DOCUMENTED,
        },
        mttr: {
          ...createMeasureState().mttr,
          result: 2.13,
          sourceKeys: ['totalRecoveryHours', 'incidentCount'],
          status: METRIC_STATUS.DOCUMENTED,
        },
        storage: {
          ...createMeasureState().storage,
          result: { percent: 80, months: 7.4 },
          sourceKeys: ['storageUsed', 'storageCapacity', 'storageGrowth'],
          status: METRIC_STATUS.DOCUMENTED,
        },
      },
      diagnose: { ...createDiagnoseState(), findings },
      govern: {
        ...createGovernState(),
        itil: [
          govBase('finding-05', {
            analysisId: 'itil-01',
            situation: 'Cambio sin reversa.',
            practice: 'change',
            action: 'Exigir rollback.',
            benefit: 'Menos interrupciones.',
            indicator: 'changes-rollback',
          }),
        ],
        cobit: [
          govBase('finding-03', {
            analysisId: 'cobit-01',
            problem: 'SPOF de perímetro.',
            decision: 'Dueño de resiliencia.',
            responsibleIds: ['infra-lead'],
            responsibleJustification: 'Opera el perímetro.',
            indicator: 'recovery-policy',
          }),
        ],
        iso27001: [
          govBase('finding-04', {
            analysisId: 'iso-01',
            assetId: 'credentials',
            threatId: 'unauthorized-access',
            vulnerabilityId: 'stale-account',
            impact: 'Acceso residual.',
            control: 'Baja el mismo día hábil y MFA privilegiado.',
          }),
        ],
      },
      decide: { ...createDecideState(), recommendations: recs, decisions: recs },
      build: { ...createBuildState(), readyToExport: true },
      export: createExportState(),
    },
  };
}

export const MODEL_REPORT_BANNER = 'INFORME MODELO – CASO ACADÉMICO FICTICIO';
export const MODEL_REPORT_NOTICE =
  'Este informe muestra la estructura y el nivel técnico esperado. Tu análisis debe estar sustentado en las evidencias y decisiones que construyas durante el recorrido.';

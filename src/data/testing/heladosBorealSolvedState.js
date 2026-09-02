import { getCaseById } from '../cases/index.js';
import { CASE_MODE, caseSelectionMeta } from '../cases/caseMode.js';
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

const DOCUMENTED = 'DOCUMENTED';

function documented(text, extras = {}) {
  return {
    status: DOCUMENTED,
    text,
    lastUpdated: '2026-08-31T12:00:00.000Z',
    sources: extras.sources || ['PDF Helados Boreal'],
    evidences: extras.evidences || [],
    ...extras,
  };
}

function govBase(findingId, extra) {
  return {
    findingId,
    sources: ['Diagnóstico'],
    sourceSections: ['findings'],
    status: GOVERN_STATUS.DOCUMENTED,
    ...extra,
  };
}

function collected(partial) {
  return {
    selectedAt: '2026-08-31T12:00:00.000Z',
    autoLoaded: true,
    usedInActivity: true,
    unit: '',
    quote: '',
    verificationStatus: 'VERIFICADA',
    ...partial,
  };
}

export function solvedFindings() {
  return [
    {
      findingId: 'finding-01',
      title: 'ERP-APP01 degrada el cierre comercial en el pico documentado',
      category: 'performance',
      evidenceIds: ['HB-operational-data-appCpuPeak', 'HB-operational-data-appLatencyPeak', 'HB-operational-data-appDemandPeak'],
      impact: 'Facturación y despacho lentos durante el pico del 28 de agosto.',
      criticality: 'high',
      justification: 'CPU 92 %, latencia 4,8 s y 181 usuarios concurrentes aparecen en el PDF, página 7.',
      description: 'ERP-APP01 alcanzó 92 % de CPU y 4,8 s de respuesta con 181 usuarios concurrentes.',
      criterion: 'Tiempo de respuesta habitual 1,4 s y demanda habitual 110-135 usuarios (página 7).',
      cause: 'Capacidad de cómputo insuficiente en el pico de temporada, sin separación de medición por servicio.',
      risk: 'Incumplir el cierre comercial en temporada alta.',
      recommendation: 'Aislar el pico del ERP y dimensionar CPU/concurrencia antes de un SLA.',
      acceptance: 'Latencia de pico ≤ 2,0 s en la siguiente temporada, con evidencia de monitoreo.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['operational-data'],
    },
    {
      findingId: 'finding-02',
      title: 'NAS-01 al 80 % con crecimiento de 650 GB/mes',
      category: 'storage',
      evidenceIds: ['HB-storage-storageUsed', 'HB-storage-storageGrowth', 'HB-storage-storageCapacity'],
      impact: 'Riesgo de saturación de archivos e imágenes de operación si el crecimiento se mantiene.',
      criticality: 'high',
      justification: 'Capacidad 24 TB, uso 19,2 TB y crecimiento 650 GB/mes están en la página 6.',
      description: 'NAS-01 utiliza 19,2 TB de 24 TB (80 %) con crecimiento de 650 GB/mes.',
      criterion: 'El 85 % es umbral pedagógico; no está aprobado en el PDF.',
      cause: 'Crecimiento observado sin política de retención documentada en el cálculo.',
      risk: 'Agotar el volumen antes de completar una compra.',
      recommendation: 'Retención/archivado y ampliación planificada con el costo de referencia de 8 TB.',
      acceptance: 'Uso bajo umbral aprobado y prueba de crecimiento documentada.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['storage'],
    },
    {
      findingId: 'finding-03',
      title: 'FW-01 es instancia única de perímetro',
      category: 'dependency',
      evidenceIds: ['HB-network-mainFirewallCount', 'HB-incidents-incidentBDuration'],
      impact: 'La VPN de sedes queda incomunicada si FW-01 falla.',
      criticality: 'critical',
      justification: 'Hay un único firewall principal y el incidente B registró 1 h 35 min por reinicio no planeado.',
      description: 'Existe un único firewall físico principal (FW-01). Los dos enlaces de Internet convergen en ese equipo.',
      criterion: 'Dos enlaces no equivalen a redundancia de perímetro si el punto de convergencia es único.',
      cause: 'Diseño de perímetro sin segunda instancia documentada.',
      risk: 'Indisponibilidad simultánea de sedes y acceso remoto.',
      recommendation: 'Segundo firewall y ensayo de failover, contrastado con el umbral de comité.',
      acceptance: 'Failover de perímetro ensayado con evidencia de tiempo de recuperación.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['network'],
    },
    {
      findingId: 'finding-04',
      title: 'Baja tardía de cuentas de exempleados',
      category: 'security',
      evidenceIds: ['HB-security-staleAccounts'],
      impact: 'Cuentas privilegiadas o de usuario pueden permanecer activas tras el retiro.',
      criticality: 'high',
      justification: 'Revisión de agosto: cuatro cuentas deshabilitadas entre 12 y 27 días después del retiro (página 5).',
      description: 'Cuatro cuentas de exempleados se deshabilitaron tarde.',
      criterion: 'La baja debería ocurrir el mismo día hábil del retiro.',
      cause: 'Proceso de identidad no sincronizado con RR. HH.',
      risk: 'Acceso residual a sistemas de facturación y archivos.',
      recommendation: 'Baja el mismo día hábil y revisión trimestral de cuentas.',
      acceptance: 'Cero cuentas de exempleados activas más de un día hábil.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['security'],
    },
    {
      findingId: 'finding-05',
      title: 'Cambio a producción sin reversa documentada',
      category: 'change',
      evidenceIds: ['HB-incidents-incidentERollback', 'HB-incidents-incidentEDuration'],
      impact: 'Lentitud en facturación y despacho; dos lotes de facturas reprocesados.',
      criticality: 'high',
      justification: 'El cambio del 7 de agosto no incluía evaluación de riesgo, pruebas ni plan de reversa (página 8).',
      description: 'Un cambio a producción se aplicó sin rollback y generó 2 h 40 min de afectación.',
      criterion: 'ITIL Change: riesgo, prueba y reversa antes de promover.',
      cause: 'Cambio tratado como tarea operativa, no como cambio controlado.',
      risk: 'Repetir interrupciones por cambios no ensayados.',
      recommendation: 'Exigir rollback y dueño de cambio antes de promover a producción.',
      acceptance: '100 % de cambios de producción con reversa documentada en el siguiente trimestre.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['incidents'],
    },
    {
      findingId: 'finding-06',
      title: 'Copia externa advertida con hueco de 9 días',
      category: 'continuity',
      evidenceIds: ['HB-backup-backupExternalGapDays', 'HB-backup-backupRestoreTests'],
      impact: 'Una pérdida del sitio principal no tendría copia externa reciente demostrable.',
      criticality: 'high',
      justification: 'Agosto 2026: 9 días sin copia externa advertida. Última restauración parcial: noviembre de 2025.',
      description: 'Hay un hueco de 9 días en la copia externa y no hay prueba completa de restauración del ERP.',
      criterion: 'No se declara RPO. No se puede afirmar cumplimiento de respaldo.',
      cause: 'Respaldo sin evidencia de copias externas continuas ni restore integral.',
      risk: 'Pérdida de datos de facturación y recetas si falla el sitio.',
      recommendation: 'Cerrar el hueco externo y ensayar restore del ERP, sin inventar un % de éxito.',
      acceptance: 'Copia externa verificada y restore parcial del ERP con acta.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['backup'],
    },
    {
      findingId: 'finding-07',
      title: 'MFA incompleto en cuentas privilegiadas',
      category: 'security',
      evidenceIds: ['HB-security-mfaCoverage'],
      impact: 'Ocho de diecisiete cuentas privilegiadas no tienen MFA.',
      criticality: 'high',
      justification: 'MFA en 9 de 17 cuentas privilegiadas (página 5).',
      description: 'La cobertura de MFA privilegiado es parcial.',
      criterion: 'Cuentas privilegiadas deberían tener MFA.',
      cause: 'Despliegue incompleto de control de acceso.',
      risk: 'Uso de credenciales privilegiadas sin segundo factor.',
      recommendation: 'Completar MFA privilegiado y retirar excepciones.',
      acceptance: '17 de 17 cuentas privilegiadas con MFA verificado.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['security'],
    },
    {
      findingId: 'finding-08',
      title: 'Siete servidores con parches pendientes de más de 60 días',
      category: 'security',
      evidenceIds: ['HB-security-pendingPatches'],
      impact: 'Ventana de exposición conocida en hosts de infraestructura.',
      criticality: 'medium',
      justification: 'Siete servidores con parches pendientes > 60 días (página 5). El PDF no da un porcentaje de flota.',
      description: 'Hay un rezago de parcheo documentado; no se calcula un % de cumplimiento porque falta el denominador total.',
      criterion: 'No hay política de ventana de parcheo formal en el PDF.',
      cause: 'Parcheo reactivo.',
      risk: 'Explotación de vulnerabilidades ya publicadas.',
      recommendation: 'Ventana de parcheo con inventario y evidencia, sin inventar cobertura porcentual.',
      acceptance: 'Cero servidores con parches críticos > 60 días en la siguiente revisión.',
      status: FINDING_STATUS.DOCUMENTED,
      sources: ['Caso'],
      sourceSections: ['security'],
    },
  ];
}

export function solvedRecommendations() {
  return [
    {
      decisionId: 'dec-01',
      findingIds: ['finding-03'],
      decision: 'Incorporar un segundo firewall y ensayar failover de perímetro.',
      alternatives: [
        { title: 'Segundo firewall físico', score: 8.2, selected: true },
        { title: 'Solo monitoreo del FW-01', score: 4.1, selected: false },
      ],
      benefitText: 'Reduce el SPOF de perímetro documentado.',
      riskText: 'Costo de referencia COP 68 millones, por encima del umbral de comité.',
      costText: 'CAPEX de referencia COP 68 millones (página 9).',
      metricText: 'Tiempo de failover ensayado.',
      priority: 'alta',
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-02',
      findingIds: ['finding-02'],
      decision: 'Ampliar NAS-01 en 8 TB y definir retención, usando el costo de referencia del caso.',
      alternatives: [
        { title: 'Expansión NAS 8 TB', score: 7.6, selected: true },
        { title: 'Solo depuración sin compra', score: 5.0, selected: false },
      ],
      benefitText: 'Aplaza el agotamiento teórico del volumen.',
      riskText: 'El 85 % es umbral pedagógico, no un umbral aprobado.',
      costText: 'CAPEX de referencia COP 42 millones; entrega 6 semanas (página 9).',
      metricText: 'Uso % y meses al umbral pedagógico.',
      priority: 'alta',
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-03',
      findingIds: ['finding-01'],
      decision: 'Separar la medición del ERP y dimensionar el pico antes de un SLA.',
      alternatives: [
        { title: 'Monitoreo y capacidad del ERP', score: 7.1, selected: true },
        { title: 'Reemplazar el ERP', score: 1.5, selected: false },
      ],
      benefitText: 'Evita tratar 99,51 % como SLA del ERP.',
      riskText: 'El ERP no puede reemplazarse en 18 meses (restricción del PDF).',
      costText: 'OPEX de monitoreo central: COP 3,8 millones/mes (página 9).',
      metricText: 'Latencia de pico y CPU de ERP-APP01.',
      priority: 'alta',
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-04',
      findingIds: ['finding-05'],
      decision: 'Exigir evaluación de riesgo, prueba y reversa en cambios a producción.',
      alternatives: [
        { title: 'Cambio controlado con rollback', score: 8.0, selected: true },
        { title: 'Seguir con cambios ad hoc', score: 2.0, selected: false },
      ],
      benefitText: 'Reduce interrupciones como la del 7 de agosto.',
      riskText: 'Requiere disciplina operativa del equipo de 4 personas.',
      costText: 'Principalmente esfuerzo interno; no hay tarifa en el PDF.',
      metricText: '% de cambios con reversa documentada.',
      priority: 'alta',
      status: DECISION_STATUS.DOCUMENTED,
    },
    {
      decisionId: 'dec-05',
      findingIds: ['finding-04', 'finding-07'],
      decision: 'Completar MFA privilegiado y bajar cuentas el mismo día hábil.',
      alternatives: [
        { title: 'MFA + baja el mismo día', score: 8.4, selected: true },
        { title: 'Revisión trimestral solamente', score: 4.5, selected: false },
      ],
      benefitText: 'Cierra acceso residual documentado en agosto.',
      riskText: 'No hay costo de herramienta en el PDF; el alcance es de proceso.',
      costText: 'Supuesto de método: esfuerzo interno. No hay precio de IAM en el caso.',
      metricText: 'Cuentas privilegiadas con MFA y tiempo de baja.',
      priority: 'alta',
      status: DECISION_STATUS.DOCUMENTED,
    },
  ];
}

export function createHeladosBorealSolvedState() {
  const caseData = getCaseById('modelo-helados-boreal');
  const findings = solvedFindings();
  const recs = solvedRecommendations();
  const selectedCase = caseSelectionMeta(caseData) || {
    id: 'modelo-helados-boreal',
    name: 'Helados Boreal S.A.S.',
    caseMode: CASE_MODE.MODEL_SOLVED,
    readOnly: true,
    stagesUnlocked: true,
    reportAvailable: true,
  };

  return {
    selectedCase,
    completedStages: [1, 2, 3, 4, 5, 6, 7, 8],
    currentStage: 1,
    progress: 100,
    collectedData: [
      collected({
        key: 'organizationName',
        label: 'Empresa',
        displayValue: 'Helados Boreal S.A.S.',
        value: 'Helados Boreal S.A.S.',
        evidenceId: 'HB-context-organizationName',
        page: 2,
        quote: 'Helados Boreal S.A.S.',
        sourceSectionId: 'context',
        documentSectionId: 'context',
      }),
      collected({
        key: 'systemUsers',
        label: 'Usuarios con acceso a servicios tecnológicos',
        displayValue: '235',
        value: 235,
        evidenceId: 'HB-context-systemUsers',
        page: 2,
        sourceSectionId: 'context',
        documentSectionId: 'usersAndOperations',
      }),
      collected({
        key: 'periodHours',
        label: 'Periodo de observación',
        displayValue: '90 días (2.160 h)',
        value: 2160,
        unit: 'h',
        evidenceId: 'HB-operational-data-periodHours',
        page: 8,
        sourceSectionId: 'operational-data',
        documentSectionId: 'metrics',
      }),
      collected({
        key: 'storageUsed',
        label: 'Capacidad utilizada',
        displayValue: '19,2 TB',
        value: 19.2,
        unit: 'TB',
        evidenceId: 'HB-storage-storageUsed',
        page: 6,
        sourceSectionId: 'storage',
        documentSectionId: 'metrics',
      }),
      collected({
        key: 'mainFirewallCount',
        label: 'Firewall físico',
        displayValue: 'FW-01, único',
        evidenceId: 'HB-network-mainFirewallCount',
        page: 5,
        sourceSectionId: 'network',
        documentSectionId: 'spof',
      }),
    ],
    metricEvidence: [
      { evidenceId: 'HB-operational-data-periodHours', metricId: 'availability' },
      { evidenceId: 'HB-storage-storageUsed', metricId: 'storage' },
    ],
    documentSections: {
      ...createDocumentBundle(),
      context: documented(
        'Helados Boreal S.A.S. fabrica y comercializa helados y postres congelados. La planta, las oficinas y el centro de datos están en Bogotá; hay centros de distribución en Medellín y Cali, y operación remota de ventas. El PDF es la fuente; no se inventan sedes ni volúmenes de negocio.',
        { evidences: ['HB-context-organizationName', 'HB-context-activity'] },
      ),
      usersAndOperations: documented(
        'Hay 235 usuarios con acceso a servicios tecnológicos: 145 en Bogotá, 28 en Medellín, 24 en Cali y 38 remotos. En temporada alta se observan aproximadamente 185 usuarios concurrentes. La criticidad se justifica por operación de facturación, despacho y cadena de frío, no por el tamaño de la empresa.',
        { evidences: ['HB-context-systemUsers', 'HB-context-concurrentUsersHighSeason'] },
      ),
      services: documented(
        'Los servicios tecnológicos declarados son ERP, producción, cadena de frío, ventas web y archivos. ERP, producción y cadena de frío figuran como críticos en la página 3.',
        { evidences: ['HB-services-serviceErp', 'HB-services-serviceColdChain'] },
      ),
      criticalServices: documented(
        'El ERP es crítico porque concentra facturación y despacho. La cadena de frío es crítica por 96 sensores y expectativa informal de recuperación menor a una hora. Un servicio de archivos de criticidad media no se trata como si fuera el ERP.',
        { evidences: ['HB-services-serviceErpCriticality', 'HB-services-expectedColdRecovery'] },
      ),
      constraints: documented(
        'Presupuesto de primera etapa: COP 180 millones a 12 meses. Umbral de comité: COP 60 millones. El ERP no puede reemplazarse en 18 meses. Estos valores condicionan DECIDIR; no se ignoran para proponer un recambio de ERP.',
        { evidences: ['HB-constraints-budgetLimit', 'HB-constraints-erpReplacementMonths'] },
      ),
      asis: documented(
        'Cadena ERP documentada: usuarios y planta → red interna → FW-01 → ERP-APP01 → ERP-DB01. NAS-01 sostiene archivos. No se relista el inventario en el dictamen; el AS-IS muestra dependencias, no el TO-BE.',
        {
          evidences: ['HB-network-mainFirewallCount'],
          chains: [{ serviceId: 'erp', nodeIds: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'] }],
        },
      ),
      inventory: documented(
        'Inventario relevante: tres hosts de virtualización, ERP-APP01, ERP-DB01, FW-01, NAS-01, IOT-GW01. Cada elemento entra porque sostiene un servicio crítico o un SPOF, no porque aparezca en una lista genérica.',
        { evidences: ['HB-infrastructure-virtualizationHosts', 'HB-network-mainFirewallCount'] },
      ),
      spof: documented(
        'FW-01 es SPOF de perímetro: los dos enlaces de Internet convergen en un único firewall. IOT-GW01 es SPOF de la cadena de frío. ERP-APP01 es crítico, pero su tratamiento de SPOF se justifica por dependencia e impacto, no solo por la etiqueta “crítico”.',
        {
          evidences: ['HB-network-mainFirewallCount', 'HB-incidents-incidentBDuration'],
          rows: [
            {
              name: 'FW-01',
              impact: 'VPN de sedes y acceso remoto',
              justification: 'Instancia única; dos enlaces no evitan el punto de convergencia',
              evidence: 'Página 5 e incidente B, página 8',
            },
            {
              name: 'IOT-GW01',
              impact: 'Pérdida de sensores de cadena de frío',
              justification: 'Incidente C de 3 h 10 min',
              evidence: 'Página 8',
            },
          ],
        },
      ),
      metrics: documented(
        'En 90 días (2.160 h) la disponibilidad observada del registro es ≈ 99,51 %. MTTR ≈ 2,13 h. NAS-01 al 80 % con 650 GB/mes. CPU pico ERP-APP01 92 %, latencia 4,8 s, 181 concurrentes. MTTD, RTO, RPO, % de éxito de backups y % de parcheo no se calculan: el PDF no trae los datos suficientes.',
        { evidences: ['HB-operational-data-periodHours', 'HB-storage-storageUsed'] },
      ),
      findings: documented(
        'Ocho hallazgos de ingeniería cubren desempeño del ERP, capacidad de NAS, SPOF de perímetro, identidad, cambio sin reversa, copia externa, MFA y parches. Cada uno tiene evidencia de página y no se presenta como opinión.',
        { evidences: ['HB-operational-data-appCpuPeak', 'HB-network-mainFirewallCount'] },
      ),
      itil: documented(
        'ITIL se aplica a cambio y continuidad: el incidente E carece de reversa y el respaldo no tiene restore integral del ERP. No se copia un capítulo teórico de ITIL.',
      ),
      cobit: documented(
        'COBIT se aplica a la decisión de resiliencia del perímetro y a la capacidad: hace falta un dueño que apruebe el tratamiento del SPOF y de NAS-01.',
      ),
      iso27001: documented(
        'ISO/IEC 27001 se aplica a identidad (bajas tardías y MFA parcial) y a parches pendientes. El control se describe sobre el hallazgo, no como lista de anexos de la norma.',
      ),
      strategy: documented(
        'Mantener el ERP (restricción de 18 meses). Fortalecer perímetro, identidad, capacidad de NAS, cambio controlado y evidencia de restore. La arquitectura objetivo no redibuja un data center imaginario.',
      ),
      capex: documented(
        'CAPEX de referencia del PDF: expansión NAS 8 TB COP 42 millones; segundo firewall COP 68 millones. OPEX de monitoreo central COP 3,8 millones/mes. El presupuesto de primera etapa es COP 180 millones; el firewall supera el umbral de comité (COP 60 millones).',
      ),
      recommendations: documented(
        'Programa: segundo firewall con failover ensayado; ampliación NAS y retención; medición del ERP sin reemplazarlo; cambios con reversa; MFA privilegiado y baja el mismo día hábil; restore externo del ERP.',
      ),
      conclusions: documented(
        'La infraestructura opera y sostiene la temporada, pero concentra exposiciones en perímetro único, identidad incompleta, almacenamiento al 80 % y cambios sin reversa. El dictamen recomienda un programa de 12 meses dentro del presupuesto declarado, sin reemplazar el ERP y sin inventar indicadores que el PDF no permite calcular.',
      ),
    },
    analysis: {
      understand: {
        ...createUnderstandState(),
        completed: true,
        currentSubstage: 6,
      },
      represent: {
        ...createRepresentState(),
        completed: true,
        asIs: {
          description: 'Cadena ERP: usuarios y planta → red interna → FW-01 → ERP-APP01 → ERP-DB01. La cadena de frío pasa por IOT-GW01.',
          chains: {
            erp: ['plant', 'internal-net', 'firewall', 'app-srv01', 'db-srv01'],
            cold: ['plant', 'internal-net', 'iot-gw01', 'cold-app01'],
          },
        },
        inventory: {
          items: [
            { id: 'fw-01', name: 'FW-01', service: 'Perímetro / VPN', reason: 'Único firewall físico', page: 5, dependsOn: 'Enlaces de 500 Mbps y 200 Mbps', ifFails: 'VPN de sedes y acceso remoto se interrumpen (incidente B).' },
            { id: 'nas-01', name: 'NAS-01', service: 'Archivos', reason: 'Volumen de 24 TB al 80 %', page: 6, dependsOn: 'Copias locales y operación de archivos', ifFails: 'Archivos e imágenes de operación dejan de crecer con margen.' },
            { id: 'erp-app01', name: 'ERP-APP01', service: 'ERP', reason: 'Pico de CPU y latencia', page: 7, dependsOn: 'ERP-DB01 y el perímetro FW-01', ifFails: 'Cierre comercial y despacho se degradan en el pico.' },
            { id: 'iot-gw01', name: 'IOT-GW01', service: 'Cadena de frío', reason: 'Pasarela única de sensores', page: 4, dependsOn: 'Sensores de cámara', ifFails: 'Se pierde lectura de temperatura (incidente C).' },
          ],
        },
        spof: {
          records: {
            firewall: {
              componentId: 'firewall',
              name: 'FW-01',
              status: 'justified',
              impact: 'VPN de sedes interrumpida',
              justification: 'Instancia única. Dos enlaces convergen en un equipo.',
              failureMode: 'Reinicio o falla del appliance',
              control: 'Enlace secundario de Internet, sin segundo firewall',
              gap: 'No hay failover de perímetro',
              treatment: 'Segundo firewall y ensayo',
            },
            iot: {
              componentId: 'iot-gw01',
              name: 'IOT-GW01',
              status: 'justified',
              impact: 'Pérdida de lectura de sensores',
              justification: 'Incidente C de 3 h 10 min',
              failureMode: 'Pasarela deja de recibir sensores',
              control: 'No documentado',
              gap: 'Sin redundancia de pasarela',
              treatment: 'Segunda pasarela o contingencia operativa',
            },
          },
        },
      },
      measure: {
        ...createMeasureState(),
        completed: true,
        availability: {
          ...createMeasureState().availability,
          result: 99.51,
          sourceKeys: ['periodHours', 'downtimeHours'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'Disponibilidad observada del registro en 90 días ≈ 99,51 %. No es el SLA del ERP.',
          limitation: 'Los cinco incidentes no pertenecen todos al mismo servicio.',
          level: 3,
        },
        mttr: {
          ...createMeasureState().mttr,
          result: 2.13,
          sourceKeys: ['totalRecoveryHours', 'incidentCount'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'MTTR ≈ 2,13 h. El promedio no es RTO ni el máximo.',
          limitation: 'Duraciones heterogéneas; el evento más largo distorsiona el promedio.',
          level: 3,
        },
        mtbf: {
          ...createMeasureState().mtbf,
          result: 429.87,
          sourceKeys: ['periodHours', 'incidentCount'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'MTBF estimado del registro. Es un promedio del conjunto, no confiabilidad de un activo.',
          limitation: 'Cinco eventos de cadenas distintas.',
          level: 3,
        },
        storage: {
          ...createMeasureState().storage,
          result: { percent: 80, freeTb: 4.8, monthsToThreshold: 1.85, monthsToFull: 7.4 },
          sourceKeys: ['storageUsed', 'storageCapacity', 'storageGrowth'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'Uso 80 %. El 85 % es umbral pedagógico. El agotamiento teórico ≈ 7,4 meses si el crecimiento se mantiene.',
          limitation: 'El 85 % no está aprobado en el PDF.',
          level: 3,
        },
        capacity: {
          ...createMeasureState().capacity,
          result: { cpuPeak: 92, ramPeak: 88 },
          sourceKeys: ['appCpuPeak', 'appRamUsage'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'CPU pico 92 % y RAM pico 88 % en ERP-APP01.',
          limitation: 'Son observaciones de pico, no un modelo de capacidad completo.',
          level: 3,
        },
        performance: {
          ...createMeasureState().performance,
          result: { latencyPeak: 4.8, latencyNormal: 1.4, concurrentPeak: 181 },
          sourceKeys: ['appLatencyPeak', 'appDemandPeak'],
          status: METRIC_STATUS.DOCUMENTED,
          interpretation: 'La latencia de pico (4,8 s) triplica la habitual (1,4 s) con 181 usuarios concurrentes.',
          limitation: 'No hay SLA formal de tiempo de respuesta.',
          level: 3,
        },
      },
      diagnose: { ...createDiagnoseState(), findings, completed: true },
      govern: {
        ...createGovernState(),
        completed: true,
        itil: [
          govBase('finding-05', {
            analysisId: 'itil-01',
            situation: 'Cambio a producción sin reversa.',
            practice: 'change',
            action: 'Exigir rollback, prueba y dueño del cambio.',
            benefit: 'Menos interrupciones como la del 7 de agosto.',
            indicator: 'Porcentaje de cambios con reversa documentada',
            owner: 'Coordinador de TI',
          }),
          govBase('finding-06', {
            analysisId: 'itil-02',
            situation: 'Hueco de copia externa y restore no integral.',
            practice: 'it-service-continuity',
            action: 'Cerrar copia externa y ensayar restore del ERP.',
            benefit: 'Evidencia de recuperación, no un RPO inventado.',
            indicator: 'Acta de restore y antigüedad máxima de copia externa',
            owner: 'Administradores de infraestructura',
          }),
        ],
        cobit: [
          govBase('finding-03', {
            analysisId: 'cobit-01',
            problem: 'SPOF de perímetro sin dueño de decisión de resiliencia.',
            decision: 'Dueño de resiliencia y tratamiento del FW-01.',
            responsibleIds: ['infra-lead'],
            responsibleJustification: 'Opera el perímetro y debe elevar el gasto al comité.',
            indicator: 'Failover de perímetro ensayado',
            owner: 'Coordinador de TI',
          }),
          govBase('finding-02', {
            analysisId: 'cobit-02',
            problem: 'Capacidad de NAS sin umbral aprobado.',
            decision: 'Aprobar umbral de uso y plan de expansión.',
            responsibleIds: ['infra-lead'],
            responsibleJustification: 'Administra almacenamiento.',
            indicator: 'Meses al umbral aprobado',
            owner: 'Administradores de infraestructura',
          }),
        ],
        iso27001: [
          govBase('finding-04', {
            analysisId: 'iso-01',
            assetId: 'credentials',
            threatId: 'unauthorized-access',
            vulnerabilityId: 'stale-account',
            impact: 'Acceso residual.',
            control: 'Baja el mismo día hábil.',
            owner: 'Coordinador de TI',
            indicator: 'Tiempo máximo de baja',
          }),
          govBase('finding-07', {
            analysisId: 'iso-02',
            assetId: 'privileged-accounts',
            threatId: 'credential-theft',
            vulnerabilityId: 'partial-mfa',
            impact: 'Cuentas privilegiadas sin segundo factor.',
            control: 'MFA en las 17 cuentas privilegiadas.',
            owner: 'Coordinador de TI',
            indicator: '17/17 con MFA',
          }),
          govBase('finding-08', {
            analysisId: 'iso-03',
            assetId: 'servers',
            threatId: 'known-vulnerability',
            vulnerabilityId: 'late-patch',
            impact: 'Siete servidores con parches > 60 días.',
            control: 'Ventana de parcheo con inventario. No se declara un % de flota.',
            owner: 'Administradores de infraestructura',
            indicator: 'Servidores con parches críticos > 60 días',
          }),
        ],
      },
      decide: {
        ...createDecideState(),
        completed: true,
        recommendations: recs,
        decisions: recs,
        alternatives: recs.flatMap((item) => item.alternatives || []),
        strategyText:
          'Mantener el ERP. Tratar perímetro, NAS, identidad, cambio y restore dentro de COP 180 millones. El segundo firewall requiere comité porque supera COP 60 millones.',
      },
      build: {
        ...createBuildState(),
        completed: true,
        readyToExport: true,
        previewReviewed: true,
      },
      export: createExportState(),
    },
  };
}

export const HELADOS_BOREAL_SOLVED_ID = 'helados-boreal-solved-state';

export function createModelReportState() {
  return createHeladosBorealSolvedState();
}

export const MODEL_REPORT_BANNER = 'INFORME MODELO — CASO ACADÉMICO FICTICIO';
export const MODEL_REPORT_NOTICE =
  'Este documento muestra la estructura y el nivel técnico esperado. Su finalidad es enseñar cómo se transforma la evidencia del caso en un informe de consultoría. Los casos asignados deben desarrollarse con sus propios datos, cálculos, hallazgos y decisiones.';

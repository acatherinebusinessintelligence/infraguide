const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, String(value)),
    removeItem: (key) => store.delete(key),
  },
  location: { hash: '' },
  dispatchEvent() {},
};

const { getState, setState, patchState, selectWorkCase, hydrateFromStorage } = await import('../src/state/appState.js');
const { DATA_STATUS } = await import('../src/data/methodology/data-map.js');
const { FINDING_STATUS } = await import('../src/data/methodology/diagnose.js');
const { GOVERN_STATUS } = await import('../src/data/methodology/govern.js');
const { DECISION_STATUS } = await import('../src/data/methodology/decide.js');
const { METRIC_STATUS } = await import('../src/data/methodology/measure.js');
const { SECTION_STATUS, ISSUE_SEVERITY } = await import('../src/data/methodology/build.js');
const { markEvidenceChanged } = await import('../src/state/diagnoseActions.js');
const {
  toggleConclusionChip,
  setConclusionField,
  addConclusionsToDocument,
  markPreviewReviewed,
  completeBuildStage,
  getBuildSnapshot,
  setPreviewMode,
  startSectionEdit,
  clearSectionEdit,
} = await import('../src/state/buildActions.js');
const { getStageStatus, stages } = await import('../src/data/stages/index.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function documented(text, extra = {}) {
  return {
    status: DATA_STATUS.DOCUMENTED,
    text,
    rows: extra.rows ?? [],
    sources: extra.sources ?? ['Caso modelo Helados Boreal'],
    lastUpdated: new Date().toISOString(),
    reviewRequired: false,
    ...extra,
  };
}

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');

const findings = [
  { findingId: 'finding-01', title: 'Degradación de rendimiento bajo alta demanda', category: 'performance', evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'], impact: 'Lentitud y abandono de compras.', criticality: 'high', justification: 'CPU 96 % y latencia 900 ms.', sources: ['Información operacional disponible'], sourceSections: ['operational-data'] },
  { findingId: 'finding-02', title: 'Riesgo de agotamiento de almacenamiento', category: 'storage', evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin'], impact: 'Depuraciones urgentes.', criticality: 'high', justification: '84 % y 7,6 meses.', sources: ['Almacenamiento'], sourceSections: ['storage'] },
  { findingId: 'finding-03', title: 'Debilidad de monitoreo de respaldos', category: 'monitoring', evidenceIds: ['ev-inc-d'], impact: 'Riesgo de recuperación.', criticality: 'high', justification: 'Dos días sin alerta.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-04', title: 'Dependencia crítica del firewall', category: 'dependency', evidenceIds: ['ev-firewall-unique', 'ev-inc-b'], impact: 'Tiendas incomunicadas.', criticality: 'critical', justification: 'SPOF + 4 h.', sources: ['Infraestructura'], sourceSections: ['infrastructure'] },
  { findingId: 'finding-05', title: 'Cambio POS sin reversa', category: 'operation', evidenceIds: ['ev-inc-e'], impact: 'Interrupción POS.', criticality: 'medium', justification: 'Sin rollback.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-06', title: 'Baja trazabilidad de incidentes', category: 'operation', evidenceIds: ['ev-incident-channels'], impact: 'No se cuantifica frecuencia.', criticality: 'medium', justification: 'Múltiples canales.', sources: ['Incidentes'], sourceSections: ['incidents'] },
  { findingId: 'finding-07', title: 'Ciclo de vida de identidades débil', category: 'security', evidenceIds: ['ev-stale-accounts'], impact: 'Cuentas activas de exempleados.', criticality: 'high', justification: 'Deshabilitación tardía.', sources: ['Seguridad'], sourceSections: ['security'] },
  { findingId: 'finding-08', title: 'Gestión reactiva de capacidad', category: 'government', evidenceIds: ['ev-capacity-reactive'], impact: 'Inversiones urgentes.', criticality: 'medium', justification: 'Decisiones reactivas.', sources: ['Operación'], sourceSections: ['operational-data'] },
].map((item) => ({ ...item, description: item.title, status: FINDING_STATUS.DOCUMENTED }));

const recs = [
  {
    decisionId: 'dec-01',
    findingIds: ['finding-01'],
    evidenceIds: ['ev-cpu', 'ev-latency'],
    decision: 'Optimizar y evaluar capacidad elástica del canal digital.',
    title: 'Capacidad elástica',
    impact: 'Lentitud en picos.',
    benefitText: 'Anticipar capacidad y reducir latencia.',
    riskText: 'Complejidad híbrida.',
    costModel: 'mixed',
    costJustification: 'CAPEX local y OPEX cloud puntual.',
    metricIds: ['latency', 'cpu'],
    metricText: 'Latencia pico y CPU.',
    priority: 'high',
    justification: 'El pico documentado exige elasticidad, no una marca.',
    alternatives: [{ title: 'Ampliar local' }, { title: 'Optimizar' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-02',
    findingIds: ['finding-03'],
    evidenceIds: ['ev-inc-d'],
    decision: 'Alerta automática de backup a mesa.',
    title: 'Monitoreo de backup',
    impact: 'Fallo no detectado.',
    benefitText: 'Reducir tiempo de detección.',
    riskText: 'Ruido de alertas.',
    costModel: 'opex',
    costJustification: 'Esfuerzo operativo / suscripción.',
    metricIds: ['detection-time', 'backup-success'],
    metricText: 'Tiempo de detección y % backup exitoso.',
    priority: 'high',
    justification: 'La evidencia de dos días sin alerta exige detección, no un producto de moda.',
    alternatives: [{ title: 'Manual' }, { title: 'Alerta automática' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-03',
    findingIds: ['finding-04'],
    evidenceIds: ['ev-firewall-unique'],
    decision: 'Planificar failover de perímetro sin fijar marca.',
    title: 'Resiliencia de firewall',
    impact: 'Tiendas incomunicadas.',
    benefitText: 'Mejorar disponibilidad.',
    riskText: 'Complejidad operativa.',
    costModel: 'capex',
    costJustification: 'Infraestructura de perímetro.',
    metricIds: ['availability'],
    metricText: 'Disponibilidad de conectividad de tiendas.',
    priority: 'immediate',
    justification: 'El SPOF y las 4 h documentadas exigen resiliencia planificada.',
    alternatives: [{ title: 'Mantener' }, { title: 'Failover' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-04',
    findingIds: ['finding-02'],
    evidenceIds: ['ev-storage-used', 'ev-margin'],
    decision: 'Retención/archivado y ampliación planificada de capacidad.',
    title: 'Almacenamiento',
    impact: 'Margen teórico limitado.',
    benefitText: 'Anticipar saturación.',
    riskText: 'Pérdida si la retención se aplica mal.',
    costModel: 'mixed',
    costJustification: 'Proceso más posible CAPEX posterior.',
    metricIds: ['storage-use', 'storage-growth'],
    metricText: '% uso y crecimiento mensual.',
    priority: 'medium',
    justification: 'No basta comprar disco; el margen de 7,6 meses permite planificar.',
    alternatives: [{ title: 'Comprar disco' }, { title: 'Retención' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
  {
    decisionId: 'dec-05',
    findingIds: ['finding-08'],
    evidenceIds: ['ev-capacity-reactive'],
    decision: 'Revisión periódica de capacidad e inversión.',
    title: 'Gobierno de capacidad',
    impact: 'Decisiones reactivas.',
    benefitText: 'Anticipar capacidad.',
    riskText: 'El proceso se abandona sin dueño.',
    costModel: 'opex',
    costJustification: 'Esfuerzo de gobierno.',
    metricIds: ['cpu'],
    metricText: 'Servicios con revisión periódica de capacidad.',
    priority: 'strategic',
    justification: 'El hallazgo es de gobierno, no de una compra inmediata.',
    alternatives: [{ title: 'Seguir reactivo' }, { title: 'Calendario de revisión' }],
    status: DECISION_STATUS.DOCUMENTED,
  },
];

function govBase(findingId, extra) {
  return { findingId, sources: ['Diagnóstico'], sourceSections: ['findings'], status: GOVERN_STATUS.DOCUMENTED, ...extra };
}

patchState((prev) => ({
  ...prev,
  completedStages: [1, 2, 3, 4, 5, 6, 7],
  currentStage: 7,
  analysis: {
    ...prev.analysis,
    diagnose: { ...prev.analysis.diagnose, findings },
    measure: {
      ...prev.analysis.measure,
      availability: { ...prev.analysis.measure.availability, result: 98.33, sourceKeys: ['periodHours', 'downtimeHours'], status: METRIC_STATUS.DOCUMENTED },
      mttr: { ...prev.analysis.measure.mttr, result: 3.1, sourceKeys: ['totalRecoveryHours', 'incidentCount'], status: METRIC_STATUS.DOCUMENTED },
      mtbf: { ...prev.analysis.measure.mtbf, result: 70.8, limitation: 'Estimación con limitaciones de información.', sourceKeys: ['periodHours', 'incidentCount'], status: METRIC_STATUS.DOCUMENTED },
      storage: { ...prev.analysis.measure.storage, result: { percent: 84, months: 7.62, free: 3.2 }, sourceKeys: ['storageUsed', 'storageCapacity', 'storageGrowth'], status: METRIC_STATUS.DOCUMENTED },
      capacity: { ...prev.analysis.measure.capacity, result: 96, sourceKeys: ['cpuPeak'], status: METRIC_STATUS.DOCUMENTED },
      performance: { ...prev.analysis.measure.performance, result: 900, sourceKeys: ['appLatencyPeak'], status: METRIC_STATUS.DOCUMENTED },
    },
    represent: {
      ...prev.analysis.represent,
      asIs: { description: 'Cadena POS: tiendas → internet → firewall → APP-SRV01.', chains: { pos: ['stores', 'internet', 'firewall'] } },
    },
    govern: {
      ...prev.analysis.govern,
      itil: [
        govBase('finding-03', { analysisId: 'itil-01', situation: 'Backup falla sin detección.', practice: 'monitoring', action: 'Alerta a mesa.', benefit: 'Detección temprana.', indicator: 'detection-time' }),
        govBase('finding-05', { analysisId: 'itil-02', situation: 'Cambio POS sin reversa.', practice: 'change', action: 'Exigir rollback.', benefit: 'Menos interrupciones.', indicator: 'changes-rollback' }),
        govBase('finding-06', { analysisId: 'itil-03', situation: 'Incidentes en varios canales.', practice: 'incident', action: 'Registro único.', benefit: 'Trazabilidad.', indicator: 'incidents-registered' }),
        govBase('finding-01', { analysisId: 'itil-04', situation: 'Picos de demanda.', practice: 'capacity', action: 'Revisar capacidad del canal digital.', benefit: 'Anticipar saturación.', indicator: 'sla-compliance' }),
      ],
      cobit: [
        govBase('finding-08', { analysisId: 'cobit-01', problem: 'Inversión reactiva.', decision: 'Criterios de capacidad.', responsibleIds: ['ti-direction'], responsibleJustification: 'Gobierna la inversión.', indicator: 'capacity-review' }),
        govBase('finding-04', { analysisId: 'cobit-02', problem: 'SPOF de perímetro.', decision: 'Dueño de resiliencia.', responsibleIds: ['infra-lead'], responsibleJustification: 'Opera el perímetro.', indicator: 'recovery-policy' }),
        govBase('finding-03', { analysisId: 'cobit-03', problem: 'Nadie alerta el backup.', decision: 'Asignar control de recuperación.', responsibleIds: ['service-owner'], responsibleJustification: 'Dueño del servicio de archivos.', indicator: 'recovery-policy' }),
      ],
      iso27001: [
        govBase('finding-07', { analysisId: 'iso-01', assetId: 'credentials', threatId: 'unauthorized-access', vulnerabilityId: 'stale-account', impact: 'Acceso indebido.', control: 'Revisión de altas y bajas.' }),
        govBase('finding-03', { analysisId: 'iso-02', assetId: 'backups', threatId: 'info-loss', vulnerabilityId: 'backup-unverified', impact: 'Pérdida de recuperación.', control: 'Prueba y alerta de backup.' }),
        govBase('finding-04', { analysisId: 'iso-03', assetId: 'configs', threatId: 'unavailability', vulnerabilityId: 'no-redundancy', impact: 'Tiendas caídas.', control: 'Failover de perímetro.' }),
        govBase('finding-02', { analysisId: 'iso-04', assetId: 'database', threatId: 'info-loss', vulnerabilityId: 'no-monitoring', impact: 'Saturación de NAS.', control: 'Umbral y retención.' }),
        govBase('finding-05', { analysisId: 'iso-05', assetId: 'wms', threatId: 'unauthorized-change', vulnerabilityId: 'no-monitoring', impact: 'Cambio sin reversa.', control: 'Ventana y rollback.' }),
      ],
    },
    decide: { ...prev.analysis.decide, recommendations: recs, decisions: recs },
  },
  documentSections: {
    ...prev.documentSections,
    context: documented('Helados Boreal produce y comercializa helados. Planta, CD, 46 tiendas y e-commerce.'),
    criticalServices: documented('POS, ERP, e-commerce y WMS sustentan operación crítica.', { rows: [{ name: 'POS', justification: 'Cierra la venta en tienda.' }] }),
    asis: documented('AS-IS del canal de tiendas: usuario → conectividad → firewall → aplicación.', { chains: [{ serviceId: 'pos', nodeIds: ['stores', 'internet', 'firewall'] }], nodes: [{ name: 'Firewall' }] }),
    inventory: documented('Inventario relevante: APP-SRV01, firewall, NAS, enlaces.', { rows: [{ name: 'Firewall', justification: 'Perímetro único.' }] }),
    spof: documented('Firewall principal sin redundancia documentada.', { rows: [{ name: 'Firewall', impact: 'Tiendas incomunicadas', justification: 'Instancia única', evidence: 'Diagrama e incidente de 4 h' }] }),
    metrics: documented('Disponibilidad 98,33 %. MTTR 3,1 h. MTBF estimado 70,8 h. NAS 84 %.', {
      subsections: {
        availability: { title: 'Disponibilidad', text: 'Observada 98,33 %.', data: '720 h / 12 h', formula: '(T-D)/T×100', substitution: '(720-12)/720×100', result: '98,33 %', interpretation: 'Periodo analizado.', limitation: 'No afirma SLA.', sources: ['Información operacional disponible'], sourceKeys: ['periodHours'] },
        mttr: { title: 'MTTR', text: '3,1 h.', data: '31 h / 10 incidentes', formula: '31/10', substitution: '31/10', result: '3,1 h', interpretation: 'Promedio del periodo.', sources: ['Incidentes'], sourceKeys: ['totalRecoveryHours'] },
        mtbf: { title: 'MTBF estimado', text: '70,8 h.', data: '708 / 10', formula: 'uptime/incidentes', substitution: '708/10', result: '70,8 h', interpretation: 'Estimación.', limitation: 'No es un dato directo del caso.', sources: ['Información operacional disponible'], sourceKeys: ['periodHours'] },
        capacity: { title: 'Capacidad', text: 'CPU pico 96 %.', result: '96 %', formula: 'dato observado', sources: ['Información operacional disponible'], sourceKeys: ['cpuPeak'] },
        performance: { title: 'Rendimiento', text: 'Latencia pico 900 ms.', result: '900 ms', formula: 'dato observado', sources: ['Información operacional disponible'], sourceKeys: ['appLatencyPeak'] },
        storage: { title: 'Almacenamiento', text: '84 % y ≈7,6 meses.', result: '84 % usado · ≈ 7,6 meses', formula: 'libre/crecimiento', sources: ['Almacenamiento'], sourceKeys: ['storageUsed'] },
      },
    }),
    findings: documented('Ocho hallazgos sustentados de capacidad, almacenamiento, monitoreo, SPOF, operación, seguridad y gobierno.', { rows: findings.map((item) => ({ name: item.title, findingId: item.findingId })) }),
    itil: documented('ITIL cubre monitoreo, cambio, incidentes y capacidad.'),
    cobit: documented('COBIT asigna responsabilidad de capacidad, resiliencia y recuperación.'),
    iso27001: documented('ISO cubre identidades, backup, perímetro, archivos y cambios POS.'),
    strategy: documented('Mantener ERP; fortalecer resiliencia y monitoreo; evaluar híbrido si se justifica.'),
    capex: documented('Capacidad mixta; backup OPEX; perímetro CAPEX; almacenamiento mixto; gobierno OPEX.', {
      rows: recs.map((item) => ({ name: item.title, classification: item.costModel, justification: item.costJustification })),
    }),
    recommendations: documented('Cinco recomendaciones priorizadas con hallazgo, beneficio y métrica.', {
      rows: recs.map((item) => ({ name: item.decision, priority: item.priority, findingIds: item.findingIds })),
    }),
    conclusions: null,
  },
}));

let snap = getBuildSnapshot();
assert(snap.assembled.filter((item) => item.status === SECTION_STATUS.COMPLETE).length === 13, 'Deben existir 13 secciones completas');
assert(snap.assembled.find((item) => item.key === 'conclusions').status === SECTION_STATUS.INCOMPLETE, 'Conclusiones deben estar pendientes');
console.log('1-3 CONSTRUIR abierto, 13 secciones, conclusiones pendientes');

['finding-01', 'finding-03', 'finding-04', 'finding-02'].forEach((id) => toggleConclusionChip('selectedFindings', id));
['helpdesk', 'backup-exists', 'ti-team'].forEach((id) => toggleConclusionChip('selectedStrengths', id));
['budget', 'production-window'].forEach((id) => toggleConclusionChip('constraintIds', id));
toggleConclusionChip('priorities', 'dec-02');
toggleConclusionChip('priorities', 'dec-03');
toggleConclusionChip('limitations', 'mtbf-estimate');

const conclusionText = [
  'El análisis de la infraestructura de Helados Boreal evidencia una operación tecnológica que soporta POS, ERP, e-commerce y logística, pero presenta oportunidades de mejora principalmente en monitoreo, resiliencia de perímetro y capacidad del canal digital.',
  'Los hallazgos de mayor relevancia corresponden a la degradación en picos, el SPOF del firewall y la detección tardía de backups, debido a su impacto sobre ventas en tienda y recuperación de información.',
  'Las decisiones futuras deben considerar restricciones como presupuesto limitado y la necesidad de no detener producción. Existen fortalezas: mesa de ayuda, backup existente y equipo TI establecido.',
  'La estrategia recomendada debe priorizar alerta de backup y failover de perímetro, utilizando indicadores como tiempo de detección, disponibilidad y latencia para validar los resultados.',
  'No obstante, el análisis presenta limitaciones relacionadas con el MTBF estimado y la ausencia de un SLA documentado. Declarar esos límites evita inventar certeza que el caso no sostiene.',
].join('\n\n');
setConclusionField('draft', conclusionText);
assert(addConclusionsToDocument(), `No se guardaron conclusiones: ${getState().documentError}`);
console.log('4-9 conclusiones construidas y guardadas');

markPreviewReviewed();
setPreviewMode('document');
snap = getBuildSnapshot();
assert(snap.assembled.find((item) => item.key === 'conclusions').status === SECTION_STATUS.COMPLETE, 'Conclusiones no quedaron completas');
assert(snap.issues.filter((item) => item.severity === ISSUE_SEVERITY.ERROR).length === 0, `Errores inesperados: ${snap.issues.filter((i) => i.severity === ISSUE_SEVERITY.ERROR).map((i) => i.message).join(' | ')}`);
console.log('10-11 validator OK, 18-21 preview y modo documento OK');

const recsNow = getState().analysis.decide.recommendations.map((item) => (item.decisionId === 'dec-02' ? { ...item, metricIds: [], metricText: '' } : item));
patchState((prev) => ({ ...prev, analysis: { ...prev.analysis, decide: { ...prev.analysis.decide, recommendations: recsNow } } }));
snap = getBuildSnapshot();
assert(snap.issues.some((item) => item.severity === ISSUE_SEVERITY.ERROR && /métrica/i.test(item.message)), 'Debe existir ERROR por recomendación sin métrica');
console.log('12-13 ERROR por falta de métrica');

patchState((prev) => ({
  ...prev,
  analysis: {
    ...prev.analysis,
    decide: {
      ...prev.analysis.decide,
      recommendations: prev.analysis.decide.recommendations.map((item) =>
        item.decisionId === 'dec-02' ? recs.find((row) => row.decisionId === 'dec-02') : item,
      ),
    },
  },
}));
console.log('14 métrica corregida');

markEvidenceChanged('ev-cpu');
snap = getBuildSnapshot();
assert(
  snap.issues.some((item) => item.severity === ISSUE_SEVERITY.REVIEW) || getState().documentSections.findings.reviewRequired,
  'Debe aparecer REVIEW_REQUIRED al modificar evidencia',
);
console.log('15-16 REVIEW_REQUIRED por evidencia');

patchState((prev) => ({
  ...prev,
  documentSections: { ...prev.documentSections, findings: { ...prev.documentSections.findings, reviewRequired: false } },
  analysis: {
    ...prev.analysis,
    diagnose: {
      ...prev.analysis.diagnose,
      findings: prev.analysis.diagnose.findings.map((item) => ({ ...item, status: FINDING_STATUS.DOCUMENTED, changedEvidenceIds: [] })),
    },
  },
}));
console.log('17 corrección de revisión');

markPreviewReviewed();
snap = getBuildSnapshot();
assert(snap.audit.filter((item) => item.severity === ISSUE_SEVERITY.ERROR).length === 0, 'TraceabilityAudit con errores');
assert(snap.issues.filter((item) => item.severity === ISSUE_SEVERITY.ERROR).length === 0, 'Aún hay ERROR');
assert(snap.issues.filter((item) => item.severity === ISSUE_SEVERITY.REVIEW).length === 0, 'Aún hay REVISIÓN');
console.log('18-19 auditoría sin errores');

startSectionEdit('metrics');
assert(getState().analysis.build.returnSection === 'metrics', 'No se conservó contexto de edición');
clearSectionEdit();
console.log('22-23 editar y regresar al preview');

hydrateFromStorage();
assert(getState().documentSections.conclusions?.status === DATA_STATUS.DOCUMENTED, 'Conclusiones no persistieron');
assert(getState().analysis.build.conclusions.draft.includes('Helados Boreal'), 'Borrador de conclusiones no persistió');
console.log('24-25 persistencia OK');

markPreviewReviewed();
snap = getBuildSnapshot();
assert(snap.summary.readyToExport, `READY_TO_EXPORT false: ${JSON.stringify(snap.summary)}`);
assert(completeBuildStage(), `No se completó CONSTRUIR: ${getState().documentError}`);
assert(getState().completedStages.includes(8), 'Etapa 8 ausente');
const buildStage = stages.find((item) => item.id === 8);
assert(getStageStatus(buildStage, getState()) === 'completed', 'CONSTRUIR no quedó completado');
console.log('26-27 READY_TO_EXPORT y CONSTRUIR finalizado');

console.log('FASE 9 simulación OK', {
  sections: snap.summary.sections,
  errors: snap.summary.errors,
  ready: getState().analysis.build.readyToExport,
});

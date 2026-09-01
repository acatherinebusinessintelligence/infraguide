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

const { getState, setState, selectWorkCase, hydrateFromStorage } = await import('../src/state/appState.js');
const { patchDiagnose, addFindingToMatrix, addFindingsToDocument } = await import('../src/state/diagnoseActions.js');
const {
  selectDecideFinding,
  setConstraintReview,
  addAlternative,
  setDraftField,
  toggleChip,
  saveRecommendation,
  setStrategyField,
  addStrategyToDocument,
  addCapexToDocument,
  addRecommendationsToDocument,
  completeDecideStage,
  getDecideSnapshot,
} = await import('../src/state/decideActions.js');
const { analyzeDecisionDraft } = await import('../src/state/decideModel.js');
const { restrictionItems } = await import('../src/data/methodology/understand.js');
const { getStageStatus, stages } = await import('../src/data/stages/index.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

function fillFinding(partial) {
  patchDiagnose((current) => ({
    ...current,
    draft: { ...current.draft, ...partial, evidenceIds: partial.evidenceIds, impactCategories: partial.impactCategories ?? ['operational'] },
  }));
}

const findingsSeed = [
  {
    evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand', 'ev-ram'],
    title: 'Degradación de rendimiento bajo alta demanda',
    description: 'Existe evidencia de degradación de rendimiento durante periodos de alta demanda.',
    category: 'performance',
    impact: 'Lentitud y abandono de compras.',
    criticality: 'high',
    justification: 'CPU 96 %, latencia 900 ms y demanda 31 000.',
  },
  {
    evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin', 'ev-inc-c'],
    title: 'Riesgo de agotamiento de almacenamiento',
    description: 'Existe riesgo de agotamiento progresivo de capacidad de almacenamiento.',
    category: 'storage',
    impact: 'Depuraciones urgentes.',
    criticality: 'high',
    justification: '84 % y 7,6 meses de margen teórico.',
  },
  {
    evidenceIds: ['ev-inc-d'],
    title: 'Debilidad de monitoreo de respaldos',
    description: 'El monitoreo de respaldos presenta debilidades de detección.',
    category: 'monitoring',
    impact: 'Riesgo de recuperación.',
    criticality: 'high',
    justification: 'Dos días sin alerta.',
  },
  {
    evidenceIds: ['ev-firewall-unique', 'ev-inc-b', 'ev-spof-firewall'],
    title: 'Dependencia crítica del firewall',
    description: 'Existe una dependencia crítica del firewall principal.',
    category: 'dependency',
    impact: 'Tiendas incomunicadas.',
    criticality: 'critical',
    justification: 'SPOF + caída 4 h.',
  },
  {
    evidenceIds: ['ev-inc-e'],
    title: 'Cambio POS sin reversa',
    description: 'El proceso de cambios presenta debilidad en planificación de reversa.',
    category: 'operation',
    impact: 'Interrupción de integración POS.',
    criticality: 'medium',
    justification: 'Sin rollback formal.',
  },
  {
    evidenceIds: ['ev-incident-channels'],
    title: 'Baja trazabilidad de incidentes',
    description: 'Existe baja trazabilidad consolidada de incidentes.',
    category: 'operation',
    impact: 'No se cuantifica frecuencia.',
    criticality: 'medium',
    justification: 'Múltiples canales.',
  },
  {
    evidenceIds: ['ev-stale-accounts'],
    title: 'Ciclo de vida de identidades débil',
    description: 'Existe riesgo de acceso no autorizado por debilidad en el ciclo de vida de identidades.',
    category: 'security',
    impact: 'Cuentas de exempleados activas.',
    criticality: 'high',
    justification: 'Deshabilitación tardía.',
  },
  {
    evidenceIds: ['ev-capacity-reactive'],
    title: 'Gestión reactiva de capacidad',
    description: 'Existe una gestión reactiva de capacidad e inversión tecnológica.',
    category: 'government',
    impact: 'Inversiones ante urgencias.',
    criticality: 'medium',
    justification: 'Decisiones reactivas.',
  },
];

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');
setState({ completedStages: [1, 2, 3, 4, 5, 6], currentStage: 6 });

findingsSeed.forEach((item) => {
  fillFinding({ ...item, kind: 'standard', observation: 'a' });
  assert(addFindingToMatrix(), `No se guardó ${item.title}`);
});
patchDiagnose((current) => ({
  ...current,
  summary: { draft: 'Diagnóstico de capacidad, almacenamiento, monitoreo, dependencia, operación y gobierno.' },
}));
assert(addFindingsToDocument(), 'No se documentaron hallazgos');

const fashion = analyzeDecisionDraft({
  findingIds: ['x'],
  justification: 'migrar a cloud porque es más moderno',
  decision: 'cloud',
  alternatives: [{}, {}],
  benefitText: 'mejor',
});
assert(fashion.some((item) => item.type === 'fashion'), 'Debe detectar moda');
console.log('detección de moda OK');

function byTitle(part) {
  return getState().analysis.diagnose.findings.find((item) => item.title.includes(part));
}

function reviewConstraints(affectIds = []) {
  restrictionItems.forEach((item) => {
    setConstraintReview(item.id, affectIds.includes(item.id) ? 'affects' : 'not-direct');
  });
}

const capacityFinding = byTitle('rendimiento bajo alta demanda');
selectDecideFinding(capacityFinding.findingId);
reviewConstraints(['budget']);
addAlternative('optimize', 'Optimizar', 'Proceso.');
addAlternative('cloud', 'Cloud', 'Capacidad elástica.');
setDraftField('decision', 'Migrar a cloud');
setDraftField('justification', 'migrar a cloud porque es más moderno');
setDraftField('benefitText', 'Reducir latencia en picos.');
setDraftField('riskText', 'Dependencia de proveedor.');
setDraftField('costModel', 'opex');
setDraftField('costJustification', 'Servicio mensual.');
toggleChip('metricIds', 'latency');
setDraftField('metricText', 'Latencia pico.');
setDraftField('priority', 'high');
setDraftField('priorityJustification', 'Impacto en ventas digitales.');
assert(!saveRecommendation(), 'No debe guardar justificación de moda');
assert(getState().documentError.includes('Justificación insuficiente'), 'Mensaje de moda ausente');
console.log('bloqueo por moda OK');

setDraftField('justification', 'El pico de 31 000 pedidos y CPU 96 % exige elasticidad, no una marca.');
setDraftField('metricText', '');
getState().analysis.decide.draft.metricIds = [];
setDraftField('targetUndefined', true);
assert(!saveRecommendation(), 'No debe guardar sin métrica');
assert(getState().documentError.includes('comprobarás'), 'Mensaje de métrica ausente');
console.log('bloqueo sin métrica OK');

function makeRec({ titlePart, affect, alts, decision, justification, benefit, risk, cost, costWhy, metrics, metricText, priority, effort }) {
  const finding = byTitle(titlePart);
  selectDecideFinding(finding.findingId);
  reviewConstraints(affect);
  alts.forEach((alt) => assert(addAlternative(alt.type, alt.title, alt.desc), `alt ${alt.title}`));
  setDraftField('decision', decision);
  setDraftField('justification', justification);
  setDraftField('benefitText', benefit);
  setDraftField('riskText', risk);
  setDraftField('costModel', cost);
  setDraftField('costJustification', costWhy);
  metrics.forEach((id) => toggleChip('metricIds', id));
  setDraftField('metricText', metricText);
  setDraftField('targetUndefined', true);
  setDraftField('impactEffort', effort);
  setDraftField('priority', priority);
  setDraftField('priorityJustification', `Prioridad ${priority} según impacto, factibilidad y restricciones revisadas.`);
  assert(saveRecommendation(), `No se guardó recomendación: ${titlePart}`);
}

makeRec({
  titlePart: 'rendimiento bajo alta demanda',
  affect: ['budget', 'ecom-growth', 'cloud-ok', 'variable-cost'],
  alts: [
    { type: 'optimize', title: 'Optimizar arquitectura actual', desc: 'Revisar cuellos de botella antes de escalar.' },
    { type: 'hybrid', title: 'Capacidad elástica para el canal digital', desc: 'Mantener núcleo local y escalar el componente de picos.' },
    { type: 'scale-up', title: 'Ampliar infraestructura local', desc: 'Más CPU/RAM on-premise.' },
  ],
  decision: 'Optimizar primero y evaluar capacidad elástica solo para el componente de picos del e-commerce.',
  justification: 'Respeta presupuesto limitado y preocupación por costos variables; el crecimiento del 35 % exige elasticidad, no un ganador automático cloud.',
  benefit: 'Anticipar capacidad y reducir latencia en picos.',
  risk: 'Complejidad de un diseño híbrido si se escala el componente digital sin gobierno de costo.',
  cost: 'mixed',
  costWhy: 'CAPEX residual local + OPEX si se usa capacidad cloud puntual.',
  metrics: ['latency', 'cpu'],
  metricText: 'Latencia pico y CPU en periodos de alta demanda.',
  priority: 'high',
  effort: 'high-high',
});
console.log('2-12 recomendación capacidad OK');

makeRec({
  titlePart: 'monitoreo de respaldos',
  affect: ['budget', 'production-window'],
  alts: [
    { type: 'monitoring', title: 'Alerta automática a mesa', desc: 'Monitoreo de jobs de backup con ticket.' },
    { type: 'managed', title: 'Servicio de monitoreo administrado', desc: 'Tercero opera el monitoreo.' },
  ],
  decision: 'Alerta automática integrada a mesa de ayuda.',
  justification: 'Es una acción operativa concreta, de menor CAPEX que un servicio administrado, y ataca la evidencia de dos días sin detección.',
  benefit: 'Reducir tiempo de detección y mejorar trazabilidad.',
  risk: 'Ruido de alertas si se configura mal.',
  cost: 'opex',
  costWhy: 'Esfuerzo operativo y posible suscripción de monitoreo. No compra de hardware.',
  metrics: ['detection-time', 'backup-success'],
  metricText: 'Tiempo de detección de fallo y porcentaje de backups exitosos.',
  priority: 'high',
  effort: 'high-low',
});
console.log('13 backup OK');

makeRec({
  titlePart: 'firewall',
  affect: ['budget', 'keep-stores', 'production-window'],
  alts: [
    { type: 'onprem', title: 'Mantener arquitectura actual', desc: 'Aceptar el SPOF.' },
    { type: 'redundancy', title: 'Failover de perímetro', desc: 'Segundo equipo o HA, sin fijar marca.' },
  ],
  decision: 'Planificar redundancia/failover del perímetro sin seleccionar marca.',
  justification: 'La evidencia de instancia única y 4 h de tiendas incomunicadas exige resiliencia; el presupuesto obliga a planificar, no a comprar de inmediato un producto.',
  benefit: 'Mejorar disponibilidad del canal de tiendas.',
  risk: 'Complejidad operativa del failover.',
  cost: 'capex',
  costWhy: 'Infraestructura de perímetro es inversión de capital, no suscripción.',
  metrics: ['availability'],
  metricText: 'Disponibilidad observada y tiempo de recuperación de conectividad de tiendas.',
  priority: 'immediate',
  effort: 'high-high',
});
console.log('14 firewall OK');

makeRec({
  titlePart: 'almacenamiento',
  affect: ['budget'],
  alts: [
    { type: 'process', title: 'Política de retención y archivado', desc: 'No solo comprar disco.' },
    { type: 'onprem', title: 'Ampliar capacidad NAS', desc: 'Más almacenamiento local.' },
  ],
  decision: 'Combinar política de retención/archivado con ampliación planificada de capacidad.',
  justification: 'El margen de 7,6 meses no obliga a comprar de inmediato; presupuesto limitado favorece proceso + plan de capacidad.',
  benefit: 'Anticipar saturación y reducir depuraciones urgentes.',
  risk: 'Si la retención se aplica mal, se puede perder información operativa.',
  cost: 'mixed',
  costWhy: 'Proceso (OPEX de operación) y posible CAPEX de ampliación posterior.',
  metrics: ['storage-use', 'storage-growth'],
  metricText: '% de uso y crecimiento mensual del NAS.',
  priority: 'medium',
  effort: 'high-low',
});
console.log('15 almacenamiento OK');

makeRec({
  titlePart: 'Gestión reactiva',
  affect: ['budget', 'ecom-growth'],
  alts: [
    { type: 'process', title: 'Criterios periódicos de capacidad', desc: 'Gobierno de revisión, no compra.' },
    { type: 'monitoring', title: 'Tablero de capacidad', desc: 'Visibilidad para decidir con evidencia.' },
  ],
  decision: 'Definir revisión periódica de capacidad e inversión con criterios de criticidad y riesgo.',
  justification: 'El hallazgo es de gobierno: las compras urgentes no se resuelven con más hardware inmediato.',
  benefit: 'Anticipar capacidad y reducir decisiones reactivas.',
  risk: 'Si no hay dueño del proceso, el calendario de revisión se abandona.',
  cost: 'opex',
  costWhy: 'Esfuerzo de gobierno y operación, no compra de activos.',
  metrics: ['cpu', 'storage-growth'],
  metricText: 'Servicios críticos con revisión periódica de capacidad (indicador de gobierno) y CPU/almacenamiento como insumos.',
  priority: 'strategic',
  effort: 'low-low',
});
console.log('16-17 cinco recomendaciones OK', getState().analysis.decide.recommendations.length);

setStrategyField('keep', 'Mantener el ERP actual a corto plazo.');
setStrategyField('improve', 'Fortalecer monitoreo de backups y resiliencia de perímetro.');
setStrategyField('scale', 'Analizar capacidad elástica del canal digital en picos.');
setStrategyField('redundant', 'Planificar failover del firewall principal.');
setStrategyField('cloud', 'Evaluar híbrido solo donde el pico y las restricciones lo justifiquen.');
setStrategyField('edge', 'No se propone edge: no hay evidencia de procesamiento local de baja latencia más allá de la operación de tiendas.');
setStrategyField('measure', 'Medir latencia, CPU, % backup exitoso, tiempo de detección y uso de NAS.');
setStrategyField('draft', 'Estrategia preliminar: evolucionar sobre el ERP, mejorar detección y resiliencia, y no comprar por moda.');
assert(addStrategyToDocument(), 'No se documentó estrategia');
assert(addCapexToDocument(), 'No se documentó CAPEX');
assert(addRecommendationsToDocument(), 'No se documentaron recomendaciones');
console.log('18-21 documento y trazabilidad OK');

hydrateFromStorage();
assert(getState().analysis.decide.recommendations.length >= 5, 'Persistencia de recomendaciones falló');
assert(getState().documentSections.strategy.status === 'DOCUMENTED', 'Estrategia no persistió');
console.log('22-23 persistencia OK');

const capFinding = getState().analysis.diagnose.findings.find((item) => item.title.includes('rendimiento'));
fillFinding({
  findingId: capFinding.findingId,
  evidenceIds: capFinding.evidenceIds,
  title: capFinding.title,
  description: `${capFinding.description} Actualizado.`,
  category: capFinding.category,
  impact: capFinding.impact,
  criticality: capFinding.criticality,
  justification: `${capFinding.justification} Revisión.`,
  kind: 'standard',
});
assert(addFindingToMatrix(), 'No se actualizó el hallazgo');
const related = getState().analysis.decide.recommendations.find((item) => (item.findingIds ?? []).includes(capFinding.findingId));
assert(related.status === 'REVIEW_REQUIRED', 'La recomendación no quedó REVIEW_REQUIRED');
console.log('24-25 REVIEW_REQUIRED OK');

selectDecideFinding(capFinding.findingId);
const { loadRecommendationIntoDraft } = await import('../src/state/decideActions.js');
loadRecommendationIntoDraft(related.decisionId);
reviewConstraints(['budget', 'ecom-growth', 'cloud-ok', 'variable-cost']);
setDraftField('justification', `${getState().analysis.decide.draft.justification} Revalidada tras cambio del hallazgo.`);
assert(saveRecommendation(), 'No se revalidó');
assert(addStrategyToDocument() && addCapexToDocument() && addRecommendationsToDocument(), 'Re-documentar');
console.log('26 corrección OK');

assert(completeDecideStage(), 'No se completó DECIDIR');
assert(getState().completedStages.includes(7), 'Etapa 7 ausente');
const build = stages.find((item) => item.id === 8);
assert(getStageStatus(build, getState()) === 'available', 'CONSTRUIR no habilitado');
console.log('27-28 DECIDIR completo y CONSTRUIR available');

const snap = getDecideSnapshot();
console.log('FASE 8 simulación OK', {
  recs: snap.decide.recommendations.length,
  construir: getStageStatus(build, getState()),
});

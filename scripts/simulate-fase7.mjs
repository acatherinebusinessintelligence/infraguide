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
  selectGovernFinding,
  setItilDraftField,
  setCobitDraftField,
  setIsoDraftField,
  toggleCobitResponsible,
  toggleIsoControlType,
  saveItilAnalysis,
  saveCobitAnalysis,
  saveIsoAnalysis,
  addItilToDocument,
  addCobitToDocument,
  addIsoToDocument,
  completeGovernStage,
  getGovernSnapshot,
} = await import('../src/state/governActions.js');
const { analyzeItilDraft, analyzeCobitDraft, analyzeIsoDraft } = await import('../src/state/governModel.js');
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
    evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'],
    title: 'Degradación de rendimiento bajo alta demanda',
    description: 'Existe evidencia de degradación de rendimiento durante periodos de alta demanda.',
    category: 'performance',
    impact: 'Los clientes pueden experimentar tiempos de respuesta elevados.',
    criticality: 'high',
    justification: 'Afecta el canal digital en picos.',
  },
  {
    evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-inc-c'],
    title: 'Riesgo de agotamiento de almacenamiento',
    description: 'Existe riesgo de agotamiento progresivo de capacidad de almacenamiento.',
    category: 'storage',
    impact: 'Depuraciones urgentes de archivos.',
    criticality: 'high',
    justification: 'Uso 84 % y crecimiento mensual documentado.',
  },
  {
    evidenceIds: ['ev-inc-d'],
    title: 'Debilidad de monitoreo de respaldos',
    description: 'El monitoreo de respaldos presenta debilidades de detección.',
    category: 'monitoring',
    impact: 'Se compromete capacidad de recuperación.',
    criticality: 'high',
    justification: 'Backup falla dos días sin alerta.',
  },
  {
    evidenceIds: ['ev-firewall-unique', 'ev-inc-b'],
    title: 'Dependencia crítica del firewall',
    description: 'Existe una dependencia crítica del firewall principal.',
    category: 'dependency',
    impact: 'Tiendas incomunicadas.',
    criticality: 'critical',
    justification: 'Un firewall y caída de 4 h.',
  },
  {
    evidenceIds: ['ev-inc-e'],
    title: 'Cambio POS sin reversa',
    description: 'El proceso de cambios presenta debilidad en planificación de reversa.',
    category: 'operation',
    impact: 'Interrupción de integración POS.',
    criticality: 'medium',
    justification: 'Sin plan formal de rollback.',
  },
  {
    evidenceIds: ['ev-incident-channels'],
    title: 'Baja trazabilidad de incidentes',
    description: 'Existe baja trazabilidad consolidada de incidentes.',
    category: 'operation',
    impact: 'No se cuantifica frecuencia y causas.',
    criticality: 'medium',
    justification: 'Múltiples canales y registro incompleto.',
  },
  {
    evidenceIds: ['ev-stale-accounts'],
    title: 'Ciclo de vida de identidades débil',
    description: 'Existe riesgo de acceso no autorizado por debilidad en el ciclo de vida de identidades.',
    category: 'security',
    impact: 'Cuentas de exempleados pueden permanecer activas.',
    criticality: 'high',
    justification: 'Deshabilitación tardía documentada.',
  },
  {
    evidenceIds: ['ev-capacity-reactive'],
    title: 'Gestión reactiva de capacidad',
    description: 'Existe una gestión reactiva de capacidad e inversión tecnológica.',
    category: 'government',
    impact: 'Inversiones ante urgencias.',
    criticality: 'medium',
    justification: 'Decisiones principalmente reactivas.',
  },
];

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');
setState({ completedStages: [1, 2, 3, 4, 5], currentStage: 5 });

findingsSeed.forEach((item) => {
  fillFinding({ ...item, kind: 'standard', observation: 'a' });
  assert(addFindingToMatrix(), `No se guardó ${item.title}`);
});
patchDiagnose((current) => ({
  ...current,
  summary: {
    draft: 'El diagnóstico evidencia rendimiento, almacenamiento, monitoreo, dependencia, operación, seguridad y gobierno.',
  },
}));
assert(addFindingsToDocument(), 'No se documentó la matriz de hallazgos');

const findings = getState().analysis.diagnose.findings;
const byTitle = (part) => findings.find((item) => item.title.includes(part));
assert(findings.length >= 8, 'Se necesitan los hallazgos de DIAGNOSTICAR');
console.log('1-2 banco de hallazgos OK', findings.length);

const isoInItil = analyzeItilDraft({
  situation: 'Activo, amenaza, vulnerabilidad del backup',
  action: 'Tratar el riesgo',
  benefit: 'menos riesgo',
  practice: 'monitoring',
});
assert(isoInItil.some((item) => item.type === 'framework'), 'Debe detectar estructura ISO en ITIL');
const cobitMgmt = analyzeCobitDraft({ decision: 'Reiniciar servidor', problem: 'caída', responsibleIds: [], responsibleJustification: '' });
assert(cobitMgmt.some((item) => item.type === 'framework'), 'Debe detectar gestión en COBIT');
const isoSwap = analyzeIsoDraft({ threatId: 'stale-account', vulnerabilityId: 'no-monitoring', impact: 'x', control: 'y' });
assert(isoSwap.some((item) => item.type === 'swap'), 'Debe detectar amenaza mal clasificada');
console.log('detección de confusiones OK');

function saveItil(titlePart, practice, action, benefit, indicator) {
  const finding = byTitle(titlePart);
  selectGovernFinding(finding.findingId);
  setItilDraftField('situation', finding.description);
  setItilDraftField('practice', practice);
  setItilDraftField('action', action);
  setItilDraftField('benefit', benefit);
  setItilDraftField('indicator', indicator);
  assert(saveItilAnalysis(), `ITIL falló: ${titlePart}`);
}

function saveCobit(titlePart, problem, decision, respIds, justification, indicator) {
  const finding = byTitle(titlePart);
  selectGovernFinding(finding.findingId);
  setCobitDraftField('problem', problem);
  setCobitDraftField('decision', decision);
  respIds.forEach((id) => toggleCobitResponsible(id));
  setCobitDraftField('responsibleJustification', justification);
  setCobitDraftField('indicator', indicator);
  assert(saveCobitAnalysis(), `COBIT falló: ${titlePart}`);
}

function saveIso(titlePart, assetId, threatId, vulnerabilityId, impact, control, types) {
  const finding = byTitle(titlePart);
  selectGovernFinding(finding.findingId);
  setIsoDraftField('assetId', assetId);
  setIsoDraftField('threatId', threatId);
  setIsoDraftField('vulnerabilityId', vulnerabilityId);
  setIsoDraftField('impact', impact);
  setIsoDraftField('control', control);
  types.forEach((id) => toggleIsoControlType(id));
  assert(saveIsoAnalysis(), `ISO falló: ${titlePart}`);
}

saveItil(
  'monitoreo de respaldos',
  'monitoring',
  'Configurar monitoreo automático de tareas de backup y generar alerta/ticket ante fallo.',
  'Reducir tiempo de detección y permitir respuesta más rápida.',
  'detection-time',
);
console.log('3-8 ITIL backup OK');

saveCobit(
  'Gestión reactiva',
  'No existe planeación formal de capacidad.',
  'Definir criterios y periodicidad de revisión de capacidad.',
  ['ti-direction', 'service-owner'],
  'Dirección TI define el criterio; el dueño del servicio valida criticidad. No se asigna todo al CIO.',
  'capacity-review',
);
console.log('9-14 COBIT capacidad OK');

saveIso(
  'identidades',
  'credentials',
  'unauthorized-access',
  'stale-account',
  'Consulta o modificación no autorizada de información.',
  'Proceso formal de baja y revisión periódica de cuentas.',
  ['procedure', 'review'],
);
console.log('15-22 ISO identidades OK');

saveItil(
  'Cambio POS',
  'change',
  'Evaluación de riesgo, pruebas, ventana de cambio y plan de rollback.',
  'Reducir impacto de cambios fallidos.',
  'changes-rollback',
);
saveCobit(
  'Cambio POS',
  'El proceso de cambios no tiene control de aprobación ni rollback obligatorio.',
  'Definir y controlar el proceso de aprobación de cambios sobre servicios críticos.',
  ['ti-direction', 'tech-committee'],
  'El comité aprueba el estándar; Dirección TI supervisa el cumplimiento.',
  'change-approval',
);
console.log('23 hallazgo en dos marcos OK');

saveItil(
  'trazabilidad de incidentes',
  'incident',
  'Centralizar el registro de incidentes provenientes de mesa, correo, llamadas y solicitudes directas.',
  'Trazabilidad y medición de la operación.',
  'incidents-registered',
);
saveItil(
  'rendimiento bajo alta demanda',
  'capacity',
  'Establecer umbrales de CPU, RAM y latencia con revisión de capacidad en picos de demanda.',
  'Anticipar degradación antes de que el canal digital falle.',
  'sla-compliance',
);
console.log('24 ITIL 4 OK', getState().analysis.govern.itil.length);

saveCobit(
  'Baja trazabilidad',
  'SLA e indicadores de incidente incompletos.',
  'Definir y aprobar niveles de servicio para servicios críticos.',
  ['ti-direction', 'service-owner'],
  'Dueño del servicio acuerda el nivel; Dirección TI lo mide.',
  'sla-defined',
);
console.log('25 COBIT 3 OK', getState().analysis.govern.cobit.length);

saveIso(
  'monitoreo de respaldos',
  'backups',
  'info-loss',
  'backup-unverified',
  'Incapacidad de recuperación de información corporativa.',
  'Monitoreo, verificación y pruebas periódicas de restauración.',
  ['monitoring', 'backup'],
);
saveIso(
  'firewall',
  'wms',
  'unavailability',
  'no-redundancy',
  'Indisponibilidad de conectividad de tiendas y de servicios centrales.',
  'Revisión de arquitectura de perímetro y criterio de redundancia, no la compra automática.',
  ['review', 'policy'],
);
saveIso(
  'Cambio POS',
  'configs',
  'unauthorized-change',
  'no-monitoring',
  'Modificación no controlada que afecta disponibilidad de la integración.',
  'Control de cambios con revisión y registro de configuraciones.',
  ['procedure', 'configuration'],
);
saveIso(
  'almacenamiento',
  'inventory-info',
  'info-loss',
  'no-monitoring',
  'Pérdida o inaccesibilidad de información de inventario al saturarse el NAS.',
  'Revisión periódica de capacidad y procedimiento de retención.',
  ['review', 'procedure'],
);
console.log('26 ISO 5 OK', getState().analysis.govern.iso27001.length);

assert(addItilToDocument(), 'No se documentó ITIL');
assert(addCobitToDocument(), 'No se documentó COBIT');
assert(addIsoToDocument(), 'No se documentó ISO');
assert(getState().documentSections.itil.status === 'DOCUMENTED', 'ITIL no quedó en el documento');
console.log('27 documento OK');

hydrateFromStorage();
assert(getState().analysis.govern.itil.length >= 4, 'Persistencia ITIL falló');
assert(getState().analysis.govern.cobit.length >= 3, 'Persistencia COBIT falló');
assert(getState().analysis.govern.iso27001.length >= 5, 'Persistencia ISO falló');
console.log('28-29 persistencia OK');

const backupFinding = getState().analysis.diagnose.findings.find((item) => item.title.includes('respaldos'));
fillFinding({
  findingId: backupFinding.findingId,
  evidenceIds: backupFinding.evidenceIds,
  title: backupFinding.title,
  description: `${backupFinding.description} Actualizado tras nueva evidencia.`,
  category: backupFinding.category,
  impact: backupFinding.impact,
  criticality: backupFinding.criticality,
  justification: `${backupFinding.justification} Revisión.`,
  kind: 'standard',
});
assert(addFindingToMatrix(), 'No se actualizó el hallazgo');
const related = getState().analysis.govern.itil.find((item) => item.findingId === backupFinding.findingId);
assert(related.status === 'REVIEW_REQUIRED', 'ITIL no quedó en REVIEW_REQUIRED');
console.log('30-31 REVIEW_REQUIRED OK');

selectGovernFinding(backupFinding.findingId);
setItilDraftField('analysisId', related.analysisId);
setItilDraftField('situation', 'El monitoreo de respaldos presenta debilidades de detección. Revalidado.');
setItilDraftField('practice', 'monitoring');
setItilDraftField('action', 'Configurar monitoreo automático de tareas de backup y generar alerta/ticket ante fallo.');
setItilDraftField('benefit', 'Reducir tiempo de detección.');
setItilDraftField('indicator', 'detection-time');
assert(saveItilAnalysis(), 'No se corrigió ITIL');
const relatedIso = getState().analysis.govern.iso27001.find((item) => item.findingId === backupFinding.findingId);
if (relatedIso) {
  selectGovernFinding(backupFinding.findingId);
  setIsoDraftField('analysisId', relatedIso.analysisId);
  setIsoDraftField('assetId', relatedIso.assetId);
  setIsoDraftField('threatId', relatedIso.threatId);
  setIsoDraftField('vulnerabilityId', relatedIso.vulnerabilityId);
  setIsoDraftField('impact', relatedIso.impact);
  setIsoDraftField('control', relatedIso.control);
  assert(saveIsoAnalysis(), 'No se corrigió ISO vinculado');
}
assert(addItilToDocument(), 'No se re-documentó ITIL');
assert(addCobitToDocument(), 'No se re-documentó COBIT');
assert(addIsoToDocument(), 'No se re-documentó ISO');
console.log('32 corrección OK');

assert(completeGovernStage(), 'No se completó GOBERNAR');
assert(getState().completedStages.includes(6), 'Etapa 6 no completada');
const decide = stages.find((item) => item.id === 7);
assert(getStageStatus(decide, getState()) === 'available', 'DECIDIR no quedó habilitado');
console.log('33-34 GOBERNAR completo y DECIDIR available');

const snap = getGovernSnapshot();
console.log('FASE 7 simulación OK', {
  itil: snap.govern.itil.length,
  cobit: snap.govern.cobit.length,
  iso: snap.govern.iso27001.length,
  decide: getStageStatus(decide, getState()),
});

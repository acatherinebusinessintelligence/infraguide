import { createRequire } from 'node:module';

const store = new Map();
globalThis.window = {
  localStorage: {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => {
      store.set(key, String(value));
    },
    removeItem: (key) => store.delete(key),
  },
  location: { hash: '' },
  dispatchEvent() {},
};

const {
  getState,
  setState,
  selectWorkCase,
  hydrateFromStorage,
} = await import('../src/state/appState.js');
const {
  patchDiagnose,
  addFindingToMatrix,
  addFindingsToDocument,
  completeDiagnoseStage,
  markEvidenceChanged,
  loadFindingIntoDraft,
  getDiagnoseSnapshot,
} = await import('../src/state/diagnoseActions.js');
const { analyzeFindingText, buildEvidenceBank, MIN_FINDINGS } = await import('../src/state/diagnoseModel.js');
const { getStageStatus, stages } = await import('../src/data/stages/index.js');

const require = createRequire(import.meta.url);
void require;

function assert(condition, message) {
  if (!condition) {
    throw new Error(message);
  }
}

function fillDraft(partial) {
  patchDiagnose((current) => ({
    ...current,
    draft: {
      ...current.draft,
      ...partial,
      evidenceIds: partial.evidenceIds ?? current.draft.evidenceIds,
      impactCategories: partial.impactCategories ?? current.draft.impactCategories,
    },
  }));
}

const findingsSeed = [
  {
    evidenceIds: ['ev-cpu', 'ev-latency', 'ev-demand'],
    title: 'Degradación de rendimiento bajo alta demanda',
    description: 'Existe evidencia de degradación de rendimiento durante periodos de alta demanda.',
    category: 'performance',
    impact: 'Los clientes pueden experimentar tiempos de respuesta elevados y abandono de compras.',
    impactCategories: ['user', 'operational'],
    criticality: 'high',
    justification: 'Afecta el canal digital en picos, con evidencia de CPU, latencia y demanda.',
  },
  {
    evidenceIds: ['ev-storage-used', 'ev-growth', 'ev-margin', 'ev-inc-c'],
    title: 'Riesgo de agotamiento de almacenamiento',
    description: 'Existe riesgo de agotamiento progresivo de capacidad de almacenamiento.',
    category: 'storage',
    impact: 'Operación de archivos y respaldos puede verse forzada a depuraciones urgentes.',
    impactCategories: ['operational', 'continuity'],
    criticality: 'high',
    justification: 'Uso 84 %, crecimiento 420 GB/mes y incidente NAS 94 %.',
  },
  {
    evidenceIds: ['ev-inc-d'],
    title: 'Debilidad de monitoreo de respaldos',
    description: 'El monitoreo de respaldos presenta debilidades de detección.',
    category: 'monitoring',
    impact: 'Se compromete capacidad de recuperación.',
    impactCategories: ['continuity'],
    criticality: 'high',
    justification: 'El riesgo afecta continuidad y recuperación, aunque no produzca indisponibilidad inmediata.',
  },
  {
    evidenceIds: ['ev-firewall-unique', 'ev-inc-b', 'ev-spof-firewall'],
    title: 'Dependencia crítica del firewall',
    description: 'Existe una dependencia crítica del firewall principal.',
    category: 'dependency',
    impact: 'Las tiendas pueden quedar incomunicadas con sistemas centrales.',
    impactCategories: ['operational', 'continuity'],
    criticality: 'critical',
    justification: 'Un solo firewall y un incidente de 4 horas sobre conectividad de tiendas.',
  },
  {
    evidenceIds: ['ev-inc-e'],
    title: 'Cambio POS sin reversa',
    description: 'El proceso de cambios presenta debilidad en planificación de reversa.',
    category: 'operation',
    impact: 'Una actualización puede interrumpir integración POS sin plan de retorno.',
    impactCategories: ['operational'],
    criticality: 'medium',
    justification: 'Hay interrupción documentada y ausencia de rollback, sin impacto permanente demostrado.',
  },
  {
    evidenceIds: ['ev-incident-channels'],
    title: 'Baja trazabilidad de incidentes',
    description: 'Existe baja trazabilidad consolidada de incidentes.',
    category: 'operation',
    impact: 'No se puede cuantificar con precisión frecuencia y causas.',
    impactCategories: ['operational', 'regulatory'],
    criticality: 'medium',
    justification: 'Múltiples canales y registro incompleto, sin caída inmediata de servicio.',
  },
  {
    evidenceIds: ['ev-stale-accounts'],
    title: 'Ciclo de vida de identidades débil',
    description: 'Existe riesgo de acceso no autorizado por debilidad en el ciclo de vida de identidades.',
    category: 'security',
    impact: 'Cuentas de exempleados pueden permanecer habilitadas más tiempo del debido.',
    impactCategories: ['security'],
    criticality: 'high',
    justification: 'Afecta seguridad de acceso aunque no se documente un incidente de abuso.',
  },
  {
    evidenceIds: ['ev-capacity-reactive'],
    title: 'Gestión reactiva de capacidad',
    description: 'Existe una gestión reactiva de capacidad e inversión tecnológica.',
    category: 'government',
    impact: 'Las decisiones de inversión aparecen ante urgencias, no como planificación.',
    impactCategories: ['financial', 'operational'],
    criticality: 'medium',
    justification: 'El caso describe decisiones principalmente reactivas, sin indisponibilidad inmediata.',
  },
];

hydrateFromStorage();
selectWorkCase('modelo-helados-boreal');
setState({ completedStages: [1, 2, 3, 4], currentStage: 4 });

const bank = buildEvidenceBank(getState());
const needed = ['ev-cpu', 'ev-latency', 'ev-demand', 'ev-storage-used', 'ev-growth', 'ev-inc-d', 'ev-firewall-unique', 'ev-inc-b'];
needed.forEach((id) => assert(bank.some((item) => item.id === id), `Falta evidencia ${id} en el banco`));
console.log('1-2 banco OK', bank.length, 'evidencias');

const weak = analyzeFindingText('El servidor está lento.');
assert(weak.some((item) => item.type === 'weak'), 'Debe advertir hallazgo débil');
console.log('15 hallazgo débil OK', weak[0].message);

const jump = analyzeFindingText('Migrar a cloud resolverá la latencia.');
assert(jump.some((item) => item.type === 'solution'), 'Debe advertir salto a solución');
console.log('17 salto a solución OK', jump[0].message);

findingsSeed.forEach((item, index) => {
  fillDraft({ ...item, kind: 'standard', observation: 'a' });
  const ok = addFindingToMatrix();
  assert(ok, `No se guardó hallazgo ${index + 1}`);
});
console.log('3-14 ocho hallazgos OK', getState().analysis.diagnose.findings.length);

fillDraft({
  evidenceIds: ['ev-missing-history'],
  title: 'Ausencia de historial de disponibilidad',
  description: 'No existe un registro completo de incidentes que permita cuantificar con precisión frecuencia y causas.',
  category: 'missing',
  kind: 'missing',
  impact: 'No se puede afirmar un porcentaje de disponibilidad por servicio.',
  impactCategories: ['operational'],
  criticality: 'medium',
  justification: 'La limitación está en el caso. No se inventa un 99 %.',
});
assert(addFindingToMatrix(), 'No se guardó hallazgo de ausencia');
console.log('19 ausencia OK');

fillDraft({ draft: 'x' });
patchDiagnose((current) => ({
  ...current,
  summary: {
    draft:
      'El diagnóstico evidencia principalmente situaciones relacionadas con rendimiento, almacenamiento, monitoreo y dependencia. Los hallazgos de mayor criticidad corresponden a firewall y backup, sustentados por incidentes y métricas del caso.',
  },
}));
assert(addFindingsToDocument(), 'No se documentó la matriz');
console.log('20 matriz documentada OK');

const beforeReload = JSON.parse(window.localStorage.getItem('infraguide:v1'));
assert(beforeReload.analysis.diagnose.findings.length >= MIN_FINDINGS, 'Persistencia incompleta antes de recargar');
hydrateFromStorage();
assert(getState().analysis.diagnose.findings.length >= MIN_FINDINGS, 'Persistencia falló al recargar');
console.log('21-22 persistencia OK', getState().analysis.diagnose.findings.length);

const target = getState().analysis.diagnose.findings[0];
markEvidenceChanged(target.evidenceIds[0]);
const reviewed = getState().analysis.diagnose.findings.find((item) => item.findingId === target.findingId);
assert(reviewed.status === 'REVIEW_REQUIRED', 'Invalidación no marcó REVIEW_REQUIRED');
assert((reviewed.changedEvidenceIds ?? []).includes(target.evidenceIds[0]), 'No indica qué evidencia cambió');
console.log('23-24 REVIEW_REQUIRED OK', reviewed.changedEvidenceIds);

loadFindingIntoDraft(target.findingId);
fillDraft({
  ...getState().analysis.diagnose.draft,
  justification: `${getState().analysis.diagnose.draft.justification} Revisado tras cambio de evidencia.`,
});
assert(addFindingToMatrix(), 'No se revalidó el hallazgo');
assert(
  getState().analysis.diagnose.findings.find((item) => item.findingId === target.findingId).status === 'DOCUMENTED',
  'El hallazgo no volvió a DOCUMENTED',
);
assert(addFindingsToDocument(), 'Hay que volver a documentar la matriz');
console.log('25 revalidación OK');

assert(completeDiagnoseStage(), 'No se completó DIAGNOSTICAR');
assert(getState().completedStages.includes(5), 'Etapa 5 no quedó completada');
const govern = stages.find((item) => item.id === 6);
assert(getStageStatus(govern, getState()) === 'available', 'GOBERNAR no quedó habilitado');
console.log('26-27 DIAGNOSTICAR completo y GOBERNAR available');

const snap = getDiagnoseSnapshot();
assert(snap.completion.ready, 'Completion no está ready');
console.log('FASE 6 simulación OK', {
  findings: snap.diagnose.findings.length,
  documented: snap.completion.documented,
  govern: getStageStatus(govern, getState()),
});

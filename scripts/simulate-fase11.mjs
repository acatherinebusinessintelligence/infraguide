const store = new Map();

class MemoryStorage {
  getItem(key) {
    return store.has(key) ? store.get(key) : null;
  }
  setItem(key, value) {
    if (this._quota) {
      const error = new Error('quota');
      error.name = 'QuotaExceededError';
      error.code = 22;
      throw error;
    }
    store.set(key, String(value));
  }
  removeItem(key) {
    store.delete(key);
  }
}

const memory = new MemoryStorage();
globalThis.window = {
  localStorage: memory,
  location: { hash: '' },
  dispatchEvent() {},
  addEventListener() {},
  removeEventListener() {},
};
globalThis.document = {
  querySelector: () => null,
  createElement: () => ({ click() {}, remove() {} }),
  body: { appendChild() {} },
};

const {
  getState,
  setState,
  patchState,
  selectWorkCase,
  hydrateFromStorage,
  applyPersistedPayload,
  importProgressState,
  resetWork,
  addCollectedData,
} = await import('../src/state/appState.js');
const { PersistenceService } = await import('../src/state/persistence.js');
const { validateState } = await import('../src/state/persistence/StateValidator.js');
const { migrateState, StateMigrationService } = await import('../src/state/persistence/StateMigrationService.js');
const { parseProgressFile, progressFileName, buildProgressFile } = await import('../src/state/persistence/progressFile.js');
const { DATA_STATUS } = await import('../src/data/methodology/data-map.js');
const { FINDING_STATUS } = await import('../src/data/methodology/diagnose.js');
const { GOVERN_STATUS } = await import('../src/data/methodology/govern.js');
const { DECISION_STATUS } = await import('../src/data/methodology/decide.js');
const { METRIC_STATUS } = await import('../src/data/methodology/measure.js');
const { STORAGE_STATE_KEY, STORAGE_BACKUP_KEY } = await import('../src/state/persistence/storageAdapter.js');

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

function fillUntilMeasure() {
  selectWorkCase('modelo-helados-boreal');
  addCollectedData('periodHours');
  addCollectedData('downtimeHours');
  patchState((prev) => ({
    ...prev,
    completedStages: [1, 2, 3],
    currentStage: 4,
    analysis: {
      ...prev.analysis,
      represent: {
        ...prev.analysis.represent,
        asis: {
          ...(prev.analysis.represent.asis ?? {}),
          description: 'AS-IS de Helados Boreal con WMS, POS y firewall perimetral.',
          nodesByService: { wms: [{ componentId: 'wms-app' }], firewall: [{ componentId: 'fw-edge' }] },
        },
        spof: {
          ...(prev.analysis.represent.spof ?? {}),
          records: {
            'fw-edge': { componentId: 'fw-edge', status: 'spof', justification: 'Único perímetro documentado.' },
          },
        },
      },
      measure: {
        ...prev.analysis.measure,
        availability: {
          ...prev.analysis.measure.availability,
          result: 98.33,
          sourceKeys: ['periodHours', 'downtimeHours'],
          status: METRIC_STATUS.CALCULATED,
        },
      },
    },
    documentSections: {
      ...prev.documentSections,
      context: documented('Helados Boreal produce y comercializa helados.'),
      asis: documented('Arquitectura AS-IS con WMS y firewall único.'),
      spof: documented('El firewall perimetral es un SPOF.'),
      metrics: documented('Disponibilidad 98,33 % con fuente y fórmula.'),
    },
  }));
  PersistenceService.flush();
}

function fillCompleteDocument() {
  fillUntilMeasure();
  const findings = Array.from({ length: 8 }, (_, index) => ({
    findingId: `finding-0${index + 1}`,
    title: `Hallazgo ${index + 1} de infraestructura`,
    description: `Evidencia del hallazgo ${index + 1}.`,
    category: 'operation',
    evidenceIds: ['ev-cpu'],
    impact: 'Impacto operativo documentado.',
    criticality: index < 2 ? 'critical' : 'high',
    justification: 'Sustentado en el caso.',
    sources: ['Caso modelo'],
    sourceSections: ['operational-data'],
    status: FINDING_STATUS.DOCUMENTED,
  }));
  const recs = Array.from({ length: 5 }, (_, index) => ({
    decisionId: `dec-0${index + 1}`,
    findingIds: [`finding-0${index + 1}`],
    evidenceIds: ['ev-cpu'],
    decision: `Decisión ${index + 1}`,
    title: `Recomendación ${index + 1}`,
    impact: 'Impacto',
    benefitText: 'Beneficio',
    riskText: 'Riesgo residual',
    costModel: 'mixed',
    costJustification: 'CAPEX/OPEX argumentado',
    metricIds: ['availability'],
    metricText: 'Disponibilidad',
    priority: 'high',
    justification: 'Prioridad con evidencia.',
    alternatives: [{ title: 'A' }, { title: 'B' }],
    status: DECISION_STATUS.DOCUMENTED,
  }));
  patchState((prev) => ({
    ...prev,
    completedStages: [1, 2, 3, 4, 5, 6, 7, 8],
    currentStage: 8,
    analysis: {
      ...prev.analysis,
      diagnose: { ...prev.analysis.diagnose, findings },
      govern: {
        ...prev.analysis.govern,
        itil: [
          {
            findingId: 'finding-01',
            practice: 'incident',
            analysis: 'ITIL sobre incidentes.',
            status: GOVERN_STATUS.DOCUMENTED,
            sources: ['Diagnóstico'],
            sourceSections: ['findings'],
          },
        ],
        cobit: [
          {
            findingId: 'finding-08',
            objective: 'APO12',
            analysis: 'COBIT de gobierno de riesgo.',
            status: GOVERN_STATUS.DOCUMENTED,
            sources: ['Diagnóstico'],
            sourceSections: ['findings'],
          },
        ],
        iso27001: [
          {
            findingId: 'finding-07',
            control: 'A.5',
            analysis: 'ISO 27001 sobre identidades.',
            status: GOVERN_STATUS.DOCUMENTED,
            sources: ['Diagnóstico'],
            sourceSections: ['findings'],
          },
        ],
      },
      decide: { ...prev.analysis.decide, recommendations: recs },
      export: {
        ...prev.analysis.export,
        history: [
          { format: 'HTML', version: 1, generatedAt: new Date().toISOString(), label: 'v1' },
          { format: 'WORD', version: 2, generatedAt: new Date().toISOString(), label: 'v2' },
        ],
        nextVersion: 3,
      },
    },
    documentSections: {
      ...prev.documentSections,
      findings: documented('Ocho hallazgos documentados.'),
      itil: documented('Análisis ITIL.'),
      cobit: documented('Análisis COBIT.'),
      iso27001: documented('Análisis ISO 27001.'),
      recommendations: documented('Cinco recomendaciones priorizadas.'),
      conclusions: documented('Conclusiones con evidencia y límites.'),
      usersAndOperations: documented('Usuarios y operación.'),
      services: documented('Servicios.'),
      criticalServices: documented('Servicios críticos.'),
      constraints: documented('Restricciones.'),
      inventory: documented('Inventario relevante.'),
      strategy: documented('Estrategia.'),
      capex: documented('CAPEX/OPEX.'),
    },
  }));
  PersistenceService.flush();
}

const results = [];
function caseRun(name, fn) {
  fn();
  results.push(name);
}

hydrateFromStorage();

caseRun('A nuevo usuario', () => {
  assert(!getState().selectedCase, 'Un usuario nuevo no debe tener caso.');
  assert(!store.get(STORAGE_STATE_KEY), 'No debe haber estado previo.');
});

caseRun('B autosave', () => {
  selectWorkCase('modelo-helados-boreal');
  PersistenceService.flush();
  const raw = store.get(STORAGE_STATE_KEY);
  assert(raw, 'Debe existir estado guardado.');
  const parsed = JSON.parse(raw);
  assert(parsed.stateVersion === 1, 'stateVersion debe ser 1.');
  assert(parsed.caseId === 'modelo-helados-boreal', 'Debe guardar el caseId.');
  assert(parsed.payload.selectedCase.id === 'modelo-helados-boreal', 'Debe persistir el caso.');
});

caseRun('C recargar', () => {
  hydrateFromStorage();
  assert(getState().selectedCase?.id === 'modelo-helados-boreal', 'Tras recargar debe conservar el caso.');
});

caseRun('D cerrar y abrir', () => {
  PersistenceService.flush();
  hydrateFromStorage();
  assert(getState().selectedCase?.id === 'modelo-helados-boreal', 'Al volver debe cargar el último autosave válido.');
});

let exported;
caseRun('E exportar JSON', () => {
  fillUntilMeasure();
  exported = PersistenceService.exportState(getState());
  assert(exported.format === 'InfraGuideProgress', 'El archivo debe usar el formato InfraGuideProgress.');
  assert(exported.stateVersion === 1, 'El archivo lleva stateVersion.');
  assert(exported.infraGuideVersion, 'El archivo lleva versión de InfraGuide.');
  assert(exported.caseId === 'modelo-helados-boreal', 'El archivo lleva caseId.');
  assert(exported.state.analysis.represent.spof.records['fw-edge'], 'Incluye SPOF.');
  assert(progressFileName('Helados Boreal S.A.S.') === 'InfraGuide_Helados_Boreal_Progreso.json', 'Nombre de archivo esperado.');
});

caseRun('F importar en estado limpio', () => {
  resetWork();
  assert(!getState().selectedCase, 'Estado limpio.');
  const parsed = parseProgressFile(JSON.stringify(exported));
  assert(parsed.ok, parsed.errors?.join(' '));
  assert(parsed.preview.caseName.includes('Helados Boreal'), 'Preview debe mostrar el caso.');
  importProgressState(parsed.payload);
  assert(getState().selectedCase?.id === 'modelo-helados-boreal', 'Debe restaurar el caso.');
  assert(getState().completedStages.includes(1), 'Debe restaurar etapas.');
  assert(getState().analysis.represent.spof.records['fw-edge'], 'Debe restaurar SPOF.');
  assert(getState().analysis.measure.availability.result === 98.33, 'Debe restaurar métricas.');
});

const beforeImportId = 'keep-me';
caseRun('G importar sobre trabajo existente', () => {
  selectWorkCase('modelo-helados-boreal');
  patchState((prev) => ({ ...prev, explorerSectionId: beforeImportId }));
  PersistenceService.flush();
  const parsed = parseProgressFile(JSON.stringify(exported));
  importProgressState(parsed.payload);
  assert(store.get(STORAGE_BACKUP_KEY), 'Debe crear backup antes de importar.');
  assert(getState().explorerSectionId !== beforeImportId || getState().completedStages.includes(3), 'El estado importado reemplaza el actual.');
});

caseRun('H cancelar importación', () => {
  const current = getState().completedStages.slice();
  const parsed = parseProgressFile(JSON.stringify(exported));
  assert(parsed.ok && parsed.preview, 'Debe haber preview sin aplicar.');
  assert(JSON.stringify(getState().completedStages) === JSON.stringify(current), 'Cancelar deja el trabajo igual.');
});

caseRun('I archivo corrupto', () => {
  const result = parseProgressFile('{ no json');
  assert(!result.ok, 'JSON inválido debe fallar.');
  assert(result.errors[0].includes('No reconocemos este archivo'), 'Mensaje controlado, sin stack.');
});

caseRun('J archivo incorrecto', () => {
  const result = parseProgressFile(JSON.stringify({ format: 'otro', hola: 1 }));
  assert(!result.ok, 'Un JSON ajeno debe rechazarse.');
});

caseRun('K versión superior', () => {
  const future = { ...exported, stateVersion: 99, state: { ...exported.state, meta: { ...exported.state.meta, stateVersion: 99 } } };
  const result = parseProgressFile(JSON.stringify(future));
  assert(!result.ok, 'No debe cargar una versión futura a ciegas.');
  assert(String(result.errors?.[0] || '').includes('versión más reciente'), 'Debe explicar la incompatibilidad.');
});

caseRun('L restaurar backup', () => {
  selectWorkCase('modelo-helados-boreal');
  patchState((prev) => ({ ...prev, currentStage: 1 }));
  PersistenceService.flush();
  patchState((prev) => ({ ...prev, currentStage: 8 }));
  PersistenceService.flush();
  const restored = PersistenceService.restoreBackup();
  assert(restored.ok, 'Debe restaurar backup.');
  applyPersistedPayload(restored.payload, { persist: false });
  assert(getState().currentStage !== 8 || restored.payload.currentStage !== 8, 'El backup no es el último estado.');
});

caseRun('M crear snapshot', () => {
  PersistenceService.createSnapshot(getState(), 'Antes de métricas');
  PersistenceService.createSnapshot(getState(), 'Antes de recomendaciones');
  PersistenceService.createSnapshot(getState(), 'Documento final');
  PersistenceService.createSnapshot(getState(), 'Cuarto');
  const snaps = PersistenceService.listSnapshots();
  assert(snaps.length === 3, 'Máximo 3 snapshots.');
  assert(snaps[0].label !== 'Antes de métricas', 'El más antiguo se elimina.');
  assert(snaps.some((item) => item.label === 'Documento final'), 'Conserva los recientes.');
});

caseRun('N restaurar snapshot', () => {
  const snaps = PersistenceService.listSnapshots();
  const target = snaps[0];
  patchState((prev) => ({ ...prev, currentStage: 99 }));
  const restored = PersistenceService.restoreSnapshot(target.id);
  assert(restored.ok, 'Debe restaurar el snapshot.');
  applyPersistedPayload(restored.payload, { persist: false });
  assert(getState().currentStage !== 99, 'El snapshot reemplaza el estado actual.');
});

caseRun('O reiniciar', () => {
  resetWork();
  assert(!getState().selectedCase, 'Reiniciar deja el trabajo vacío.');
  assert(!store.get(STORAGE_STATE_KEY), 'Reiniciar elimina el progreso local.');
});

caseRun('Portabilidad hasta MEDIR', () => {
  fillUntilMeasure();
  const file = PersistenceService.exportState(getState());
  resetWork();
  hydrateFromStorage();
  assert(!getState().selectedCase, 'Tras borrar, la app inicia limpia.');
  const parsed = parseProgressFile(JSON.stringify(file));
  importProgressState(parsed.payload);
  const state = getState();
  assert(state.selectedCase?.id === 'modelo-helados-boreal', 'Caso reconstruido.');
  assert(state.completedStages.includes(2), 'Etapas reconstruidas.');
  assert(state.analysis.represent.asis.description.includes('AS-IS'), 'AS-IS reconstruido.');
  assert(state.analysis.represent.spof.records['fw-edge'], 'SPOF reconstruido.');
  assert(state.analysis.measure.availability.result === 98.33, 'Métricas reconstruidas.');
  assert(state.documentSections.context.status === DATA_STATUS.DOCUMENTED, 'Documento reconstruido.');
  assert(state.collectedData.some((item) => item.key === 'periodHours'), 'Trazabilidad reconstruida.');
});

caseRun('Documento completo import/export', () => {
  fillCompleteDocument();
  const file = PersistenceService.exportState(getState());
  resetWork();
  const parsed = parseProgressFile(JSON.stringify(file));
  importProgressState(parsed.payload);
  const state = getState();
  const documentedCount = Object.values(state.documentSections).filter((item) => item?.status === DATA_STATUS.DOCUMENTED).length;
  assert(documentedCount >= 14, `Debe restaurar 14 secciones, hay ${documentedCount}.`);
  assert(state.analysis.diagnose.findings.length >= 8, '8+ hallazgos.');
  assert(state.analysis.govern.itil.length >= 1, 'ITIL.');
  assert(state.analysis.govern.cobit.length >= 1, 'COBIT.');
  assert(state.analysis.govern.iso27001.length >= 1, 'ISO.');
  assert(state.analysis.decide.recommendations.length >= 5, '5+ recomendaciones.');
  assert(state.analysis.export.history.length >= 2, 'Historial de exportación.');
});

caseRun('Validator y migración', () => {
  const invalid = validateState(null);
  assert(!invalid.ok, 'Validator rechaza nulo.');
  const ok = validateState(exported);
  assert(ok.ok || migrateState(exported).ok, 'El estado exportado es válido o migrable.');
  assert(StateMigrationService.currentVersion === 1, 'Arquitectura de migraciones en v1.');
  assert(typeof StateMigrationService.registerMigration === 'function', 'Se pueden registrar migraciones futuras.');
});

caseRun('Sanitización y cuota', () => {
  const dirty = {
    ...exported,
    state: {
      ...exported.state,
      analysis: {
        ...exported.state.analysis,
        understand: { draft: '<script>alert(1)</script>texto' },
      },
    },
  };
  const parsed = parseProgressFile(JSON.stringify(dirty));
  assert(parsed.ok, 'El JSON se trata como datos.');
  assert(!JSON.stringify(parsed.payload).includes('<script'), 'No debe conservar HTML ejecutable.');
  memory._quota = true;
  const failed = PersistenceService.saveState(getState(), { force: true });
  memory._quota = false;
  assert(!failed.ok, 'La cuota debe reportarse.');
});

caseRun('Estado corrupto usa backup', () => {
  fillUntilMeasure();
  PersistenceService.flush();
  patchState((prev) => ({ ...prev, currentStage: 7 }));
  PersistenceService.flush();
  store.set(STORAGE_STATE_KEY, '{roto');
  const loaded = PersistenceService.loadState();
  assert(loaded.ok && loaded.recoveredFromBackup, 'Debe restaurar el backup si el actual está corrupto.');
});

console.log(`FASE 11 OK: ${results.length} casos`);
results.forEach((name) => console.log(` - ${name}`));

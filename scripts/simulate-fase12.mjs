await import('./simulate-fase10.mjs');

import { writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const { getState, importProgressState } = await import('../src/state/appState.js');
const { validateCase } = await import('../src/data/cases/caseValidator.js');
const { cases, caseRegistry, getCaseById } = await import('../src/data/cases/index.js');
const { runAppHealthCheck } = await import('../src/runtime/healthCheck.js');
const { exportProgressPayload, parseProgressFile, loadPersistedState } = await import('../src/state/persistence.js');
const { STORAGE_STATE_KEY, caseStorageKey, APP_VERSION, PERSISTENCE_VERSION } = await import('../src/config.js');
const { parseRoute } = await import('../src/utils/router.js');

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

assert(APP_VERSION === '1.0.0', `Versión: ${APP_VERSION}`);
assert(PERSISTENCE_VERSION === 1, 'Persistencia no es v1');
assert(STORAGE_STATE_KEY === 'infraguide:v1:state', `Clave: ${STORAGE_STATE_KEY}`);
assert(caseStorageKey('modelo-helados-boreal') === 'infraguide:v1:modelo-helados-boreal', 'Namespace por caso');

const boreal = getCaseById('modelo-helados-boreal');
const valid = validateCase(boreal);
assert(valid.ok, `CaseValidator rechazó el caso modelo: ${valid.errors.join(' ')}`);
const invalid = validateCase({ name: 'Sin id', sections: [] });
assert(!invalid.ok, 'CaseValidator debe rechazar un caso corrupto');
assert(caseRegistry.length === 1 && caseRegistry[0].type === 'model', 'caseRegistry incompleto');
assert(cases.length === 1, 'Un caso corrupto no debe vaciar el registro válido');

const health = runAppHealthCheck();
assert(health.ok, `AppHealthCheck: ${health.issues.join(' | ')}`);
assert(health.caseCount === 1, 'Health no ve el caso modelo');

assert(parseRoute('/exportar').view === 'export', 'Hash /exportar');
assert(parseRoute('/construir/5').view === 'build', 'Hash /construir');
assert(parseRoute('/ruta').view === 'dashboard', 'Hash /ruta');

const payload = exportProgressPayload(getState());
assert(payload.kind === 'infraguide-progress', 'kind de progreso');
assert(payload.selectedCaseId === 'modelo-helados-boreal', 'progreso sin caso');
assert(payload.completedStages.includes(8), 'progreso incompleto');
const roundtrip = parseProgressFile(JSON.stringify(payload));
assert(roundtrip.selectedCaseId === payload.selectedCaseId, 'parseProgressFile perdió el caso');
assert(importProgressState(roundtrip), 'importProgressState falló');

const stored = loadPersistedState();
assert(stored?.selectedCaseId === 'modelo-helados-boreal', 'loadPersistedState no leyó v1:state');
assert(window.localStorage.getItem(STORAGE_STATE_KEY), 'No se guardó infraguide:v1:state');
assert(window.localStorage.getItem(caseStorageKey('modelo-helados-boreal')), 'No se guardó namespace por caso');

const demoDir = join(dirname(fileURLToPath(import.meta.url)), '../src/data/testing');
mkdirSync(demoDir, { recursive: true });
writeFileSync(join(demoDir, 'completed-demo-state.json'), JSON.stringify(payload, null, 2));

console.log('FASE 12 simulación OK', {
  version: APP_VERSION,
  storage: STORAGE_STATE_KEY,
  cases: cases.map((item) => item.id),
  health: health.ok,
  readyToExport: getState().analysis.build.readyToExport,
});

import { STATE_VERSION, APP_VERSION } from '../../config.js';
import { wrapEnvelope, legacyToPayload } from './payload.js';

const migrations = {
  // v1 → v2 se registrará aquí cuando exista un formato nuevo.
  // 1: (envelope) => ({ ...envelope, stateVersion: 2, payload: transformed })
};

export function migrateState(input) {
  if (!input || typeof input !== 'object') {
    return { ok: false, code: 'INVALID', errors: ['No hay estado para migrar.'] };
  }

  let envelope = toEnvelope(input);
  const original = Number(envelope.stateVersion) || 1;

  if (original > STATE_VERSION) {
    return {
      ok: false,
      code: 'FUTURE_VERSION',
      errors: ['Este progreso fue creado con una versión más reciente de InfraGuide.'],
      envelope,
    };
  }

  const steps = [];
  while ((Number(envelope.stateVersion) || 1) < STATE_VERSION) {
    const from = Number(envelope.stateVersion) || 1;
    const migrate = migrations[from];
    if (typeof migrate !== 'function') {
      return {
        ok: false,
        code: 'NO_MIGRATION',
        errors: [`No hay migración disponible desde la versión ${from}.`],
        envelope,
      };
    }
    envelope = migrate(envelope);
    envelope.stateVersion = from + 1;
    steps.push(`${from}→${from + 1}`);
  }

  envelope.infraGuideVersion = envelope.infraGuideVersion || APP_VERSION;
  return {
    ok: true,
    envelope,
    migrated: steps.length > 0 || original < STATE_VERSION || !input.payload,
    migratedFrom: original,
    steps,
  };
}

function toEnvelope(input) {
  if (input.payload && typeof input.payload === 'object') {
    return {
      stateVersion: Number(input.stateVersion) || 1,
      infraGuideVersion: input.infraGuideVersion || APP_VERSION,
      createdAt: input.createdAt || null,
      updatedAt: input.updatedAt || null,
      caseId: input.caseId ?? input.payload?.meta?.caseId ?? null,
      documentVersion: input.documentVersion || input.payload?.meta?.documentVersion || 1,
      payload: input.payload,
      checksum: input.checksum,
    };
  }
  const payload = legacyToPayload(input);
  return wrapEnvelope(payload, { createdAt: payload.meta?.createdAt });
}

export const StateMigrationService = {
  migrateState,
  currentVersion: STATE_VERSION,
  registerMigration(fromVersion, fn) {
    migrations[fromVersion] = fn;
  },
};

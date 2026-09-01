export const PERSISTENCE_EVENTS = {
  STATE_SAVED: 'STATE_SAVED',
  STATE_IMPORTED: 'STATE_IMPORTED',
  STATE_EXPORTED: 'STATE_EXPORTED',
  STATE_RESTORED: 'STATE_RESTORED',
  STATE_RESET: 'STATE_RESET',
  SNAPSHOT_CREATED: 'SNAPSHOT_CREATED',
};

const MAX_EVENTS = 40;
const log = [];
const listeners = new Set();

export function emitPersistenceEvent(type, extra = {}) {
  const entry = {
    type,
    at: new Date().toISOString(),
    ...sanitizeExtra(extra),
  };
  log.push(entry);
  if (log.length > MAX_EVENTS) log.shift();
  listeners.forEach((listener) => listener(entry));
  return entry;
}

export function getPersistenceEvents() {
  return [...log];
}

export function subscribePersistenceEvents(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function sanitizeExtra(extra) {
  const allowed = {};
  if (typeof extra.source === 'string') allowed.source = extra.source;
  if (typeof extra.reason === 'string') allowed.reason = extra.reason;
  if (typeof extra.ok === 'boolean') allowed.ok = extra.ok;
  return allowed;
}

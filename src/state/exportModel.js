import { EXPORT_STATUS, createExportConfig, effectiveExportConfig } from '../data/methodology/export.js';

export function createExportState() {
  return {
    config: createExportConfig(),
    history: [],
    lastExport: null,
    status: EXPORT_STATUS.NOT_READY,
    previewOpen: false,
    previewFormat: 'html',
    printAuto: false,
    nextVersion: 1,
    lastError: '',
  };
}

export function mergeExport(saved) {
  const base = createExportState();
  if (!saved || typeof saved !== 'object') return base;
  return {
    ...base,
    config: effectiveExportConfig({ ...base.config, ...(saved.config || {}) }),
    history: Array.isArray(saved.history) ? saved.history.slice(-20) : [],
    lastExport: saved.lastExport ?? null,
    nextVersion: Number(saved.nextVersion) > 0 ? Number(saved.nextVersion) : 1,
    status: saved.status === EXPORT_STATUS.READY ? EXPORT_STATUS.READY : EXPORT_STATUS.NOT_READY,
    previewOpen: false,
    printAuto: false,
    lastError: '',
  };
}

export function persistableExport(exportState = {}) {
  return {
    config: exportState.config || createExportConfig(),
    history: Array.isArray(exportState.history) ? exportState.history.slice(-20) : [],
    lastExport: exportState.lastExport ?? null,
    nextVersion: exportState.nextVersion || 1,
  };
}

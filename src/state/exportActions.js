import { EXPORT_STATUS, EXPORT_FORMATS, effectiveExportConfig, exportCopy } from '../data/methodology/export.js';
import { getState, patchState } from './appState.js';
import { createExportState } from './exportModel.js';
import { buildExportModel, validateExportPayload } from '../export/buildExportModel.js';
import { HtmlExporter } from '../export/htmlExporter.js';
import { downloadBlob, exportBaseName } from '../export/text.js';

let modelCache = { key: '', model: null };

function exportFrom(state = getState()) {
  return state.analysis?.export ?? createExportState();
}

function patchExport(updater) {
  patchState((prev) => {
    const current = prev.analysis?.export ?? createExportState();
    const next = typeof updater === 'function' ? updater(current, prev) : { ...current, ...updater };
    const status = prev.analysis?.build?.readyToExport
      ? next.status === EXPORT_STATUS.GENERATING || next.status === EXPORT_STATUS.ERROR || next.status === EXPORT_STATUS.SUCCESS
        ? next.status
        : EXPORT_STATUS.READY
      : EXPORT_STATUS.NOT_READY;
    return {
      ...prev,
      analysis: {
        ...prev.analysis,
        export: { ...next, status },
      },
    };
  });
}

export function cacheKeyFor(state, config) {
  return JSON.stringify({
    mode: config.mode,
    flags: {
      includeTraceability: config.includeTraceability,
      includeFormulas: config.includeFormulas,
      includeLimitations: config.includeLimitations,
      includeEvidence: config.includeEvidence,
      includeAsIs: config.includeAsIs,
    },
    findings: (state.analysis?.diagnose?.findings ?? []).map((item) => item.findingId),
    recs: (state.analysis?.decide?.recommendations ?? []).map((item) => item.decisionId),
    version: state.analysis?.export?.nextVersion,
    updated: state.documentSections?.conclusions?.lastUpdated,
    caseId: state.selectedCase?.id,
  });
}

export function getExportModel(state = getState()) {
  const config = effectiveExportConfig(exportFrom(state).config);
  const key = cacheKeyFor(state, config);
  if (modelCache.key === key && modelCache.model) {
    return modelCache.model;
  }
  const model = buildExportModel(state, config);
  modelCache = { key, model };
  return model;
}

export function invalidateExportCache() {
  modelCache = { key: '', model: null };
}

export function setExportMode(mode) {
  invalidateExportCache();
  patchExport((current) => ({
    ...current,
    config: effectiveExportConfig({
      ...current.config,
      mode,
      includeTraceability: mode === 'academic',
      includeEvidence: mode === 'academic',
    }),
    previewOpen: false,
    lastError: '',
  }));
}

export function setExportFlag(flag, value) {
  invalidateExportCache();
  patchExport((current) => ({
    ...current,
    config: { ...current.config, [flag]: Boolean(value) },
    lastError: '',
  }));
}

export function setPreviewFormat(format) {
  patchExport({ previewFormat: format });
}

export function toggleExportPreview(open) {
  const state = getState();
  if (!state.analysis?.build?.readyToExport) {
    patchExport({ lastError: exportCopy.notReady, previewOpen: false, status: EXPORT_STATUS.NOT_READY });
    return false;
  }
  if (open) {
    getExportModel(state);
  }
  patchExport({ previewOpen: Boolean(open), lastError: '' });
  return true;
}

function recordHistory(format, fileName, state = getState()) {
  const current = exportFrom(state);
  const version = current.nextVersion || 1;
  const entry = {
    version,
    label: `v${version}`,
    format,
    mode: current.config?.mode || 'academic',
    generatedAt: new Date().toISOString(),
    fileName: fileName || '',
  };
  return {
    history: [...(current.history || []), entry].slice(-20),
    lastExport: entry,
    nextVersion: version + 1,
    status: EXPORT_STATUS.SUCCESS,
    lastError: '',
  };
}

export function canExport(state = getState()) {
  return Boolean(state.analysis?.build?.readyToExport);
}

export function exportHtml() {
  const state = getState();
  if (!canExport(state)) {
    patchExport({ lastError: exportCopy.notReady, status: EXPORT_STATUS.NOT_READY });
    return false;
  }
  const errors = validateExportPayload(state, exportFrom(state).config);
  if (errors.length) {
    patchExport({ lastError: errors[0], status: EXPORT_STATUS.ERROR });
    return false;
  }
  patchExport({ status: EXPORT_STATUS.GENERATING, lastError: '' });
  try {
    const model = getExportModel(getState());
    const { html, fileName, mime } = HtmlExporter(model);
    downloadBlob(new Blob([html], { type: mime }), fileName);
    patchExport((current, prev) => ({ ...current, ...recordHistory(EXPORT_FORMATS.html, fileName, prev) }));
    return true;
  } catch {
    patchExport({ status: EXPORT_STATUS.ERROR, lastError: 'No fue posible generar el archivo HTML.' });
    return false;
  }
}

export async function exportDocx() {
  const state = getState();
  if (!canExport(state)) {
    patchExport({ lastError: exportCopy.notReady, status: EXPORT_STATUS.NOT_READY });
    return false;
  }
  const errors = validateExportPayload(state, exportFrom(state).config);
  if (errors.length) {
    patchExport({ lastError: errors[0], status: EXPORT_STATUS.ERROR });
    return false;
  }
  patchExport({ status: EXPORT_STATUS.GENERATING, lastError: '' });
  try {
    const { packDocx, docxFileName, DOCX_MIME } = await import('../export/docxExporter.js');
    const model = getExportModel(getState());
    const packed = await packDocx(model);
    const blob =
      packed instanceof Blob
        ? packed
        : new Blob([packed], { type: DOCX_MIME });
    const fileName = docxFileName(model);
    downloadBlob(blob, fileName);
    patchExport((current, prev) => ({ ...current, ...recordHistory(EXPORT_FORMATS.docx, fileName, prev) }));
    return true;
  } catch (error) {
    if (import.meta.env?.DEV) {
      console.error(error);
    }
    patchExport({
      status: EXPORT_STATUS.ERROR,
      lastError: exportCopy.wordFail,
    });
    return false;
  }
}

export function startPrintExport({ auto = true } = {}) {
  const state = getState();
  if (!canExport(state)) {
    patchExport({ lastError: exportCopy.notReady, status: EXPORT_STATUS.NOT_READY });
    return false;
  }
  const errors = validateExportPayload(state, exportFrom(state).config);
  if (errors.length) {
    patchExport({ lastError: errors[0], status: EXPORT_STATUS.ERROR });
    return false;
  }
  getExportModel(state);
  patchExport({ printAuto: Boolean(auto), previewFormat: 'print', lastError: '', status: EXPORT_STATUS.GENERATING });
  return true;
}

export function finishPrintExport() {
  const state = getState();
  const name = `${exportBaseName(state.selectedCase?.name)}.pdf`;
  patchExport((current, prev) => ({
    ...current,
    printAuto: false,
    ...recordHistory(EXPORT_FORMATS.print, name, prev),
  }));
}

export function clearExportError() {
  patchExport({ lastError: '', status: getState().analysis?.build?.readyToExport ? EXPORT_STATUS.READY : EXPORT_STATUS.NOT_READY });
}

export function exportSnapshotHtml(snapshot) {
  const model = buildExportModel(snapshot);
  const { html, fileName, mime } = HtmlExporter(model);
  downloadBlob(new Blob([html], { type: mime }), fileName);
  return true;
}

export async function exportSnapshotDocx(snapshot) {
  const { packDocx, docxFileName, DOCX_MIME } = await import('../export/docxExporter.js');
  const model = buildExportModel(snapshot);
  const packed = await packDocx(model);
  const blob = packed instanceof Blob ? packed : new Blob([packed], { type: DOCX_MIME });
  downloadBlob(blob, docxFileName(model));
  return true;
}

export function openSnapshotPrint(snapshot) {
  const model = buildExportModel(snapshot);
  const { html } = HtmlExporter(model);
  const win = typeof window !== 'undefined' ? window.open('', '_blank') : null;
  if (!win) return false;
  win.document.write(html);
  win.document.close();
  win.focus();
  win.print();
  return true;
}

export { exportCopy };

import { APP_VERSION } from '../../config.js';

export const INFRAGUIDE_VERSION = APP_VERSION;
export const DOCX_LIBRARY = { name: 'docx', version: '9.7.1' };

export const EXPORT_STATUS = {
  NOT_READY: 'NOT_READY',
  READY: 'READY',
  GENERATING: 'GENERATING',
  SUCCESS: 'SUCCESS',
  ERROR: 'ERROR',
};

export const EXPORT_MODES = {
  clean: 'clean',
  academic: 'academic',
};

export const EXPORT_FORMATS = {
  html: 'HTML',
  docx: 'WORD',
  print: 'PRINT',
};

export function createExportConfig() {
  return {
    mode: EXPORT_MODES.academic,
    includeCover: true,
    includeIndex: true,
    includeTraceability: true,
    includeFormulas: true,
    includeLimitations: true,
    includeAsIs: true,
    includeEvidence: true,
  };
}

export function effectiveExportConfig(config = createExportConfig()) {
  const base = { ...createExportConfig(), ...config };
  if (base.mode === EXPORT_MODES.clean) {
    return {
      ...base,
      includeTraceability: false,
      includeEvidence: false,
    };
  }
  return base;
}

export const exportCopy = {
  notReady: 'Tu documento todavía requiere revisión antes de exportar.',
  review: 'Revisar documento',
  wordFail: 'No fue posible generar el archivo Word.',
  fallback: 'Puedes descargar HTML o abrir la vista imprimible.',
  generating: 'Generando archivo…',
  success: 'Archivo generado.',
  htmlCard: 'Informe técnico de consultoría en HTML, con vínculos al PDF del caso.',
  wordCard: 'Informe técnico editable (.docx) para entrega al comité.',
  printCard: 'Vista A4 lista para imprimir o guardar como PDF.',
};

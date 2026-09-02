export const EVIDENCE_STATUS = {
  VERIFIED: 'VERIFICADA',
  PENDING: 'PENDIENTE_DE_VERIFICAR',
  NOT_FOUND: 'NO_LOCALIZADA',
};

export const EVIDENCE_STATUS_LABEL = {
  VERIFICADA: 'Verificada',
  PENDIENTE_DE_VERIFICAR: 'Pendiente de verificar',
  NO_LOCALIZADA: 'No localizada',
};

export const EVIDENCE_ORIGIN = {
  SOURCE: 'SOURCE',
  CALCULATED: 'CALCULATED',
};

function quoteOf(entry) {
  return String(entry?.quote || entry?.extract || entry?.text || '').trim();
}

export function resolveEvidenceStatus(entry) {
  if (!entry) return EVIDENCE_STATUS.NOT_FOUND;
  if (entry.origin === EVIDENCE_ORIGIN.CALCULATED) {
    return EVIDENCE_STATUS.PENDING;
  }
  const page = Number(entry.page);
  const hasPage = Number.isFinite(page) && page >= 1;
  const hasQuote = quoteOf(entry).length > 0;
  if (entry.verified === true && hasPage && hasQuote) {
    return EVIDENCE_STATUS.VERIFIED;
  }
  if (hasPage) {
    return EVIDENCE_STATUS.PENDING;
  }
  return EVIDENCE_STATUS.NOT_FOUND;
}

export function isProductionVerified(entry) {
  return resolveEvidenceStatus(entry) === EVIDENCE_STATUS.VERIFIED;
}

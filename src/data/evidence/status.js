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

export function resolveEvidenceStatus(entry) {
  if (!entry) return EVIDENCE_STATUS.NOT_FOUND;
  if (entry.origin === EVIDENCE_ORIGIN.CALCULATED) {
    return EVIDENCE_STATUS.PENDING;
  }
  if (entry.verified === true && Number.isFinite(Number(entry.page)) && Number(entry.page) >= 1) {
    return EVIDENCE_STATUS.VERIFIED;
  }
  if (entry.verificationStatus && EVIDENCE_STATUS_LABEL[entry.verificationStatus]) {
    return entry.verificationStatus;
  }
  if (Number.isFinite(Number(entry.page)) && Number(entry.page) >= 1) {
    return EVIDENCE_STATUS.PENDING;
  }
  return EVIDENCE_STATUS.NOT_FOUND;
}

export function isProductionVerified(entry) {
  return resolveEvidenceStatus(entry) === EVIDENCE_STATUS.VERIFIED;
}

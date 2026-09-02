export const CASE_MODE = {
  MODEL_SOLVED: 'MODEL_SOLVED',
  STUDENT_WORK: 'STUDENT_WORK',
};

export const CASE_MODE_LABEL = {
  MODEL_SOLVED: 'Caso modelo resuelto',
  STUDENT_WORK: 'Caso de trabajo del equipo',
};

export function normalizeCaseMode(value) {
  if (value === CASE_MODE.MODEL_SOLVED || value === CASE_MODE.STUDENT_WORK) {
    return value;
  }
  return null;
}

export function getCaseMode(source) {
  if (!source) return null;
  const direct = normalizeCaseMode(source.caseMode);
  if (direct) return direct;
  if (source.selectedCase) {
    const fromSelected = normalizeCaseMode(source.selectedCase.caseMode);
    if (fromSelected) return fromSelected;
  }
  return null;
}

export function isModelSolvedCase(caseData) {
  return getCaseMode(caseData) === CASE_MODE.MODEL_SOLVED;
}

export function isStudentWorkCase(caseData) {
  return getCaseMode(caseData) === CASE_MODE.STUDENT_WORK;
}

export function caseSelectionMeta(caseData) {
  if (!caseData) return null;
  const caseMode = getCaseMode(caseData) || CASE_MODE.STUDENT_WORK;
  const model = caseMode === CASE_MODE.MODEL_SOLVED;
  return {
    id: caseData.id,
    name: caseData.name,
    kind: caseData.kind,
    kindLabel: caseData.kindLabel,
    caseMode,
    readOnly: model ? true : Boolean(caseData.readOnly),
    stagesUnlocked: model ? true : Boolean(caseData.stagesUnlocked),
    reportAvailable: model ? true : Boolean(caseData.reportAvailable),
  };
}

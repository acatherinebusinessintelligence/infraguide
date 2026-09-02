import { getCaseById } from '../data/cases/index.js';
import { CASE_MODE, getCaseMode, isModelSolvedCase, isStudentWorkCase, caseSelectionMeta } from '../data/cases/caseMode.js';

export function resolveCaseData(state) {
  const id = state?.selectedCase?.id;
  return id ? getCaseById(id) : null;
}

export function isModelSolved(state) {
  if (getCaseMode(state) === CASE_MODE.MODEL_SOLVED) return true;
  return isModelSolvedCase(resolveCaseData(state));
}

export function isStudentWork(state) {
  if (!state?.selectedCase) return false;
  if (getCaseMode(state) === CASE_MODE.STUDENT_WORK) return true;
  return isStudentWorkCase(resolveCaseData(state));
}

export { CASE_MODE, getCaseMode, isModelSolvedCase, isStudentWorkCase, caseSelectionMeta };

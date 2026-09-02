import { STAGE_GUIDES } from '../data/stages/stageGuide.js';
import { STAGE_STATUS, getStageStatus } from '../data/stages/index.js';
import { getUnderstandCompletion } from './understandModel.js';
import { checkpointQuestions } from '../data/methodology/understand.js';
import { isModelSolved } from './caseMode.js';

export function isCheckpointApproved(understand = {}) {
  return checkpointQuestions.every((item) => understand.checkpoint?.[item.id] === item.correctId);
}

export function understandRequirementItems(state) {
  const understand = state.analysis?.understand ?? {};
  const documents = state.documentSections ?? {};
  const completion = getUnderstandCompletion(understand, documents);
  return [
    { id: 'context', label: 'Contexto agregado al documento', done: Boolean(completion.context) },
    { id: 'users', label: 'Usuarios y operación agregados', done: Boolean(completion.usersAndOperations) },
    { id: 'services', label: 'Servicios tecnológicos agregados', done: Boolean(completion.services) },
    { id: 'critical', label: 'Servicios críticos justificados', done: Boolean(completion.criticalServices) },
    { id: 'constraints', label: 'Restricciones agregadas', done: Boolean(completion.constraints) },
    { id: 'checkpoint', label: 'Checkpoint final aprobado', done: Boolean(completion.checkpoint) },
  ];
}

export function isTeacherMode(state) {
  return Boolean(state?.teacherMode);
}

export function canWorkStage(state, stageId) {
  if (!state?.selectedCase) return false;
  if (isTeacherMode(state)) return true;
  if (isModelSolved(state)) return true;
  if (stageId === 1) return true;
  if (stageId === 2 || stageId === 3) {
    return (state.completedStages ?? []).includes(1);
  }
  if (stageId === 4) {
    return (state.completedStages ?? []).includes(2) || (state.completedStages ?? []).includes(3);
  }
  return (state.completedStages ?? []).includes(stageId - 1);
}

export function isStageSelectable() {
  return true;
}

export function pendingActivityPath(state, stageId) {
  const guide = STAGE_GUIDES[stageId];
  if (canWorkStage(state, stageId)) {
    return guide?.path || '/ruta';
  }
  if (!(state.completedStages ?? []).includes(1)) return '/comprender';
  if (stageId >= 4 && !((state.completedStages ?? []).includes(2) || (state.completedStages ?? []).includes(3))) {
    return '/representar';
  }
  if (stageId >= 5 && !(state.completedStages ?? []).includes(4)) return '/medir';
  if (stageId >= 6 && !(state.completedStages ?? []).includes(5)) return '/diagnosticar';
  if (stageId >= 7 && !(state.completedStages ?? []).includes(6)) return '/gobernar';
  if (stageId >= 8 && !(state.completedStages ?? []).includes(7)) return '/decidir';
  return guide?.pendingPath || '/ruta';
}

export function unlockRequirements(state, stageId) {
  const completed = state.completedStages ?? [];
  const understandItems = understandRequirementItems(state);
  if (stageId === 1) return understandItems;
  if (stageId === 2 || stageId === 3) {
    if (completed.includes(1)) {
      return [{ id: 'understand-done', label: 'COMPRENDER finalizado', done: true }];
    }
    return understandItems;
  }
  const chain = [];
  chain.push({
    id: 'st-1',
    label: 'COMPRENDER finalizado',
    done: completed.includes(1),
  });
  if (stageId >= 4) {
    chain.push({
      id: 'st-2',
      label: 'REPRESENTAR finalizado (incluye IDENTIFICAR / SPOF)',
      done: completed.includes(2) || completed.includes(3),
    });
  }
  if (stageId >= 5) {
    chain.push({ id: 'st-4', label: 'MEDIR finalizado', done: completed.includes(4) });
  }
  if (stageId >= 6) {
    chain.push({ id: 'st-5', label: 'DIAGNOSTICAR finalizado', done: completed.includes(5) });
  }
  if (stageId >= 7) {
    chain.push({ id: 'st-6', label: 'GOBERNAR finalizado', done: completed.includes(6) });
  }
  if (stageId >= 8) {
    chain.push({ id: 'st-7', label: 'DECIDIR finalizado', done: completed.includes(7) });
  }
  if (!completed.includes(1)) {
    return [...understandItems, ...chain.filter((item) => item.id !== 'st-1')];
  }
  return chain;
}

export function rejectIfStageLocked(state, stageId) {
  if (canWorkStage(state, stageId)) return null;
  const missing = unlockRequirements(state, stageId)
    .filter((item) => !item.done)
    .map((item) => item.label);
  return missing.length
    ? `No puedes editar ni finalizar esta etapa. Falta: ${missing.join('; ')}.`
    : 'No puedes editar ni finalizar esta etapa hasta cumplir los prerrequisitos.';
}

export function requirementProgress(state, stageId) {
  const items = unlockRequirements(state, stageId);
  const done = items.filter((item) => item.done).length;
  return { done, total: items.length, items };
}

export function getStageWorkStatus(stage, state) {
  if (isModelSolved(state)) {
    return STAGE_STATUS.SOLVED;
  }
  if (isTeacherMode(state) && (state.completedStages ?? []).includes(stage.id)) {
    return STAGE_STATUS.COMPLETED;
  }
  if (isTeacherMode(state)) {
    return STAGE_STATUS.AVAILABLE;
  }
  if (stage.id === 3) {
    if ((state.completedStages ?? []).includes(2) || (state.completedStages ?? []).includes(3)) {
      return STAGE_STATUS.COMPLETED;
    }
    if ((state.completedStages ?? []).includes(1)) {
      return STAGE_STATUS.AVAILABLE;
    }
    return STAGE_STATUS.BLOCKED;
  }
  return getStageStatus(stage, state);
}

import { getState, setPersistEnabled, applyTeacherLiveState } from './appState.js';
import { createModelReportState } from '../data/testing/modelReportState.js';
import { navigate } from '../utils/router.js';

let studentSnapshot = null;

function snapshotStudent(state) {
  return structuredClone({
    selectedCase: state.selectedCase,
    currentStage: state.currentStage,
    completedStages: state.completedStages,
    analysis: state.analysis,
    metricEvidence: state.metricEvidence,
    documentSections: state.documentSections,
    collectedData: state.collectedData,
    methodologyStatus: state.methodologyStatus,
    dataGroups: state.dataGroups,
    explorerSectionId: state.explorerSectionId,
    lastCollectedKey: state.lastCollectedKey,
    activityAnswers: state.activityAnswers,
    documentViewKey: state.documentViewKey,
    documentError: state.documentError,
    progress: state.progress,
    caseReading: state.caseReading,
    currentView: state.currentView,
  });
}

export async function enterTeacherMode() {
  const current = getState();
  if (current.teacherMode) return true;
  studentSnapshot = snapshotStudent(current);
  setPersistEnabled(false);

  let demoPayload = null;
  try {
    const mod = await import('../data/testing/completed-demo-state.json');
    demoPayload = mod.default;
  } catch {
    demoPayload = null;
  }
  const model = createModelReportState();
  applyTeacherLiveState({
    ...model,
    collectedData: demoPayload?.collectedData?.length ? demoPayload.collectedData : model.collectedData,
    documentSections: {
      ...(demoPayload?.documentSections || {}),
      ...model.documentSections,
    },
    analysis: {
      ...model.analysis,
      ...(demoPayload?.analysis || {}),
      understand: { ...(demoPayload?.analysis?.understand || {}), ...(model.analysis.understand || {}), completed: true },
      represent: { ...(demoPayload?.analysis?.represent || {}), ...model.analysis.represent },
      measure: { ...(demoPayload?.analysis?.measure || {}), ...model.analysis.measure },
      diagnose: { ...(demoPayload?.analysis?.diagnose || {}), ...model.analysis.diagnose },
      govern: { ...(demoPayload?.analysis?.govern || {}), ...model.analysis.govern },
      decide: { ...(demoPayload?.analysis?.decide || {}), ...model.analysis.decide },
      build: { ...(demoPayload?.analysis?.build || {}), ...model.analysis.build, readyToExport: true },
      export: model.analysis.export,
    },
    completedStages: [1, 2, 3, 4, 5, 6, 7, 8],
    currentStage: 8,
    teacherMode: true,
    documentError: null,
  });
  navigate('/ruta');
  return true;
}

export function exitTeacherMode() {
  const current = getState();
  if (!current.teacherMode) return false;
  const restored = studentSnapshot ? structuredClone(studentSnapshot) : null;
  studentSnapshot = null;
  applyTeacherLiveState({
    ...(restored || {}),
    teacherMode: false,
  });
  setPersistEnabled(true);
  navigate('/ruta');
  return true;
}

export function hasTeacherSnapshot() {
  return Boolean(studentSnapshot);
}

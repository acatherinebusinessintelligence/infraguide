import { escapeHtml } from '../../utils/escape.js';
import { MODEL_INTRO } from '../../data/testing/heladosBorealSolvedContent.js';
import { isModelSolved, isStudentWork } from '../../state/caseMode.js';

export function ModelCaseBanner({ state }) {
  if (state.teacherMode) return '';
  if (isModelSolved(state)) {
    return `
      <div class="model-case-banner" role="status">
        <p><strong>CASO MODELO RESUELTO</strong></p>
        <p>${escapeHtml(MODEL_INTRO.warning)}</p>
      </div>
    `;
  }
  if (isStudentWork(state)) {
    return `
      <div class="work-case-banner" role="status">
        <p><strong>${escapeHtml(MODEL_INTRO.workBanner)}</strong></p>
      </div>
    `;
  }
  return '';
}

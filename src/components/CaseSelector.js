import { escapeHtml } from '../utils/escape.js';
import { CASE_MODE } from '../data/cases/caseMode.js';
import { getModelCases, getStudentWorkCases } from '../data/cases/index.js';

export function CaseSelector({ cases, selectedCaseId }) {
  const modelCases = (cases || []).filter((item) => item.caseMode === CASE_MODE.MODEL_SOLVED);
  const workCases = (cases || []).filter((item) => item.caseMode === CASE_MODE.STUDENT_WORK);
  const models = modelCases.length ? modelCases : getModelCases();
  const works = workCases.length ? workCases : getStudentWorkCases();

  return `
    <div class="case-selector case-selector--split">
      <section class="case-track">
        <h3>APRENDER CON EL CASO MODELO</h3>
        <p>Explora un ejemplo completo y resuelto para comprender la metodología.</p>
        ${models.map((item) => caseCard(item, selectedCaseId, 'EXPLORAR EJEMPLO RESUELTO')).join('')}
      </section>
      <section class="case-track">
        <h3>TRABAJAR MI CASO</h3>
        <p>Desarrolla paso a paso el caso asignado a tu equipo.</p>
        ${
          works.length
            ? works.map((item) => caseCard(item, selectedCaseId, item.useButtonLabel || 'SELECCIONAR CASO DE TRABAJO')).join('')
            : '<p class="case-track__empty">Los casos de trabajo serán incorporados posteriormente.</p>'
        }
      </section>
    </div>
  `;
}

function caseCard(item, selectedCaseId, fallbackLabel) {
  const selected = item.id === selectedCaseId;
  const buttonLabel = item.useButtonLabel || fallbackLabel;
  return `
    <article class="case-card${selected ? ' is-selected' : ''}${item.caseMode === CASE_MODE.MODEL_SOLVED ? ' case-card--model' : ' case-card--work'}">
      <p class="case-card__kind">${escapeHtml(item.kindLabel || 'Caso')}</p>
      <h3 class="case-card__name">${escapeHtml(item.name)}</h3>
      <p class="case-card__sector">${escapeHtml(item.sector || '')}</p>
      <p class="case-card__summary">${escapeHtml(item.summary || '')}</p>
      <button
        class="btn ${selected ? 'btn--ghost-dark' : 'btn--primary'}"
        type="button"
        data-action="select-case"
        data-case-id="${escapeHtml(item.id)}"
        ${selected ? 'aria-current="true"' : ''}
      >
        ${escapeHtml(selected ? 'CASO ACTIVO' : buttonLabel)}
      </button>
    </article>
  `;
}

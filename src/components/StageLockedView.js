import { escapeHtml } from '../utils/escape.js';
import { STAGE_GUIDES } from '../data/stages/stageGuide.js';
import { pendingActivityPath, requirementProgress } from '../state/stageGates.js';

export function StageLockedView({ state, stageId }) {
  const guide = STAGE_GUIDES[stageId];
  if (!guide) return '';
  const progress = requirementProgress(state, stageId);
  const pending = pendingActivityPath(state, stageId);
  const activities = (guide.activities ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const reqs = progress.items
    .map(
      (item) => `
        <li>
          <label>
            <input type="checkbox" disabled ${item.done ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        </li>
      `,
    )
    .join('');

  return `
    <section class="panel stage-locked" aria-labelledby="stage-locked-title">
      <p class="understand-kicker">Vista pedagógica · etapa aún no habilitada para editar</p>
      <h2 id="stage-locked-title">${escapeHtml(guide.name)}</h2>
      <p><strong>Objetivo.</strong> ${escapeHtml(guide.objective)}</p>
      <p><strong>Actividades que contiene</strong></p>
      <ul>${activities}</ul>
      <p><strong>Producto que generará.</strong> ${escapeHtml(guide.product)}</p>
      <p><strong>Sección del documento que alimentará.</strong> ${escapeHtml(guide.documentSection)}</p>
      <p><strong>Requisitos para desbloquearla:</strong> ${progress.done} de ${progress.total} requisitos completados.</p>
      <ul class="stage-locked__reqs">${reqs}</ul>
      <p>Puedes consultar esta etapa, pero no editarla ni finalizarla hasta cumplir los prerrequisitos.</p>
      <a class="btn btn--primary" href="#${escapeHtml(pending)}" data-nav="${escapeHtml(pending)}">Regresar a la actividad pendiente</a>
    </section>
  `;
}

export function UnderstandChecklist({ state }) {
  const progress = requirementProgress(state, 1);
  const items = progress.items
    .map(
      (item) => `
        <li>
          <label>
            <input type="checkbox" disabled ${item.done ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        </li>
      `,
    )
    .join('');
  return `
    <aside class="understand-checklist" aria-label="Checklist de COMPRENDER">
      <p><strong>Checklist de COMPRENDER</strong> · ${progress.done} de ${progress.total}</p>
      <ul>${items}</ul>
    </aside>
  `;
}

export function TeacherBanner({ state }) {
  if (!state.teacherMode) return '';
  return `
    <div class="teacher-banner" role="status">
      <p><strong>MODO DEMOSTRACIÓN – LOS CAMBIOS NO SE GUARDAN</strong></p>
      <button class="btn btn--small" type="button" data-action="exit-teacher-mode">SALIR DEL MODO DEMOSTRACIÓN</button>
    </div>
  `;
}

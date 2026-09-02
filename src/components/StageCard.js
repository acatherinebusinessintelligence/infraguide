import { STAGE_STATUS_LABEL } from '../data/stages/index.js';
import { escapeHtml } from '../utils/escape.js';
import { MODEL_STAGE_META } from '../data/testing/heladosBorealSolvedContent.js';
import { STAGE_GUIDES } from '../data/stages/stageGuide.js';

export function StageCard({ stage, status, selected = false, solved = false }) {
  const label = solved ? 'RESUELTO' : STAGE_STATUS_LABEL[status];
  const locked = !solved && status === 'blocked';
  const guide = STAGE_GUIDES[stage.id] || {};
  const meta = MODEL_STAGE_META[stage.id] || {};

  if (solved) {
    return `
      <article class="stage-card stage-card--solved${selected ? ' is-selected' : ''}">
        <span class="stage-card__number">${escapeHtml(stage.number)}</span>
        <span class="stage-card__name">${escapeHtml(stage.name)}</span>
        <p><strong>Qué enseña.</strong> ${escapeHtml(meta.teaches || stage.description)}</p>
        <p><strong>Resultado.</strong> ${escapeHtml(meta.result || guide.product || '')}</p>
        <p><strong>Informe.</strong> ${escapeHtml(guide.documentSection || '')}</p>
        <span class="badge badge--solved">RESUELTO</span>
        <span class="badge badge--available">EJEMPLO GUIADO</span>
        <span class="badge">DISPONIBLE PARA CONSULTA</span>
        <button class="btn btn--primary" type="button" data-action="select-stage" data-stage-id="${stage.id}">
          EXPLORAR ETAPA
        </button>
      </article>
    `;
  }

  return `
    <button
      class="stage-card${selected ? ' is-selected' : ''}${locked ? ' is-locked' : ''}"
      type="button"
      data-action="select-stage"
      data-stage-id="${stage.id}"
      aria-disabled="false"
      aria-current="${selected ? 'true' : 'false'}"
      title="${escapeHtml(locked ? `${stage.name}: consulta pedagógica. Aún no se puede editar.` : stage.name)}"
    >
      <span class="stage-card__number">${escapeHtml(stage.number)}</span>
      <span class="stage-card__name">${escapeHtml(stage.name)}</span>
      <span class="stage-card__desc">${escapeHtml(stage.description)}</span>
      <span class="badge badge--${escapeHtml(status)}">${escapeHtml(label)}</span>
    </button>
  `;
}

import { appCopy } from '../data/copy.js';
import {
  measureSubstages,
  measureFinders,
  measureMethodSteps,
  measureMethodValues,
  measureActivities,
  measureCheckpoint,
  measureClosing,
  METRIC_STATUS_LABEL,
} from '../data/methodology/measure.js';
import { getMeasureSnapshot } from '../state/measureActions.js';
import { formatTimestamp } from '../state/understandModel.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { FindTheData } from '../components/FindTheData.js';
import { CaseFactsBoard, DataReadiness } from '../components/measure/DataReadiness.js';
import {
  AvailabilityCalculator,
  MTTRCalculator,
  MTBFEstimator,
  CapacityAnalyzer,
  StorageCapacityCalculator,
  PerformanceAnalyzer,
  MetricEvidencePanel,
} from '../components/measure/Calculators.js';
import { escapeHtml } from '../utils/escape.js';

export function MeasurePage(state) {
  if (!state.selectedCase) {
    return shell(state, `<h1>MEDIR</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`);
  }
  if (!state.completedStages.includes(2) && !state.completedStages.includes(3)) {
    return shell(
      state,
      `<h1>MEDIR</h1><p>Primero cierra REPRESENTAR. Calcular sin arquitectura es adelantar el diagnóstico.</p><a class="btn btn--primary" href="#/representar" data-nav="/representar">Ir a REPRESENTAR</a>`,
    );
  }

  const { measure, facts, expected, documents, evidence, completion } = getMeasureSnapshot(state);
  const substage = measureSubstages.find((item) => item.id === measure.currentSubstage) ?? measureSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page measure-page">
        ${renderProgress(measure.currentSubstage, substage)}
        <p class="principle">Calcular no es diagnosticar.</p>
        <aside class="panel warning-panel">
          <p>Una métrica se convierte en evidencia cuando puedes explicar: de dónde salió, cómo se calculó y qué significa.</p>
          <p class="consultant-tip">Un resultado sin fuente es solo un número.</p>
        </aside>
        ${MethodCard({
          steps: measureMethodSteps,
          values: measureMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, measure, facts, expected, documents, evidence, completion, error)}
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function shell(state, inner) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page"><section class="panel">${inner}</section></main>
      ${SiteFooter()}
    </div>
  `;
}

function renderProgress(current, substage) {
  const steps = measureSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/medir/${item.id}" data-nav="/medir/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');
  return `
    <header class="understand-progress">
      <p class="understand-kicker">MEDIR</p>
      <h1>${current} de 9 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/medir/${prev}" data-nav="/medir/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/medir/${next}" data-nav="/medir/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderSubstage(id, measure, facts, expected, documents, evidence, completion, error) {
  if (id === 1) {
    return `
      <section class="stack">
        <h2>Preparar datos</h2>
        ${SourceFinder({ finder: measureFinders.prepare })}
        ${CaseFactsBoard({ facts, usedKeys: measure.usedKeys })}
        ${DataReadiness({ facts, usedKeys: measure.usedKeys, measure })}
        ${navRow(null, 2)}
      </section>
    `;
  }
  if (id === 2) {
    return `
      <section class="stack">
        <h2>Disponibilidad</h2>
        ${SourceFinder({ finder: measureFinders.availability })}
        ${AvailabilityCalculator({ facts, slot: measure.availability, activities: measure.activities, error })}
        ${navRow(1, 3)}
      </section>
    `;
  }
  if (id === 3) {
    return `
      <section class="stack">
        <h2>MTTR</h2>
        ${SourceFinder({ finder: measureFinders.mttr })}
        ${MTTRCalculator({ facts, slot: measure.mttr, activities: measure.activities, error })}
        ${navRow(2, 4)}
      </section>
    `;
  }
  if (id === 4) {
    return `
      <section class="stack">
        <h2>MTBF estimado</h2>
        ${SourceFinder({ finder: measureFinders.mtbf })}
        ${MTBFEstimator({ facts, slot: measure.mtbf, activities: measure.activities, error })}
        ${navRow(3, 5)}
      </section>
    `;
  }
  if (id === 5) {
    return `
      <section class="stack">
        <h2>Capacidad</h2>
        ${SourceFinder({ finder: measureFinders.capacity })}
        ${CapacityAnalyzer({ facts, slot: measure.capacity, activities: measure.activities, error })}
        ${navRow(4, 6)}
      </section>
    `;
  }
  if (id === 6) {
    return `
      <section class="stack">
        <h2>Almacenamiento y crecimiento</h2>
        ${SourceFinder({ finder: measureFinders.storage })}
        ${StorageCapacityCalculator({ facts, slot: measure.storage, activities: measure.activities, error })}
        ${navRow(5, 7)}
      </section>
    `;
  }
  if (id === 7) {
    return `
      <section class="stack">
        <h2>Rendimiento y latencia</h2>
        ${SourceFinder({ finder: measureFinders.performance })}
        ${PerformanceAnalyzer({ facts, slot: measure.performance, activities: measure.activities, error })}
        ${navRow(6, 8)}
      </section>
    `;
  }
  if (id === 8) {
    return `
      <section class="stack">
        <h2>Integrar métricas</h2>
        ${MetricEvidencePanel({ expected, evidence })}
        ${FindTheData({ activities: [measureActivities.integrate], answers: measure.activities })}
        ${navRow(7, 9)}
      </section>
    `;
  }
  return renderReview(measure, documents, completion, evidence);
}

function renderReview(measure, documents, completion, evidence) {
  const rows = [
    ['Disponibilidad', completion.availability],
    ['MTTR', completion.mttr],
    ['MTBF', completion.mtbf],
    ['Capacidad', completion.capacity],
    ['Almacenamiento', completion.storage],
    ['Rendimiento', completion.performance],
    ['Evidencia para diagnosticar', completion.hasEvidence],
  ]
    .map(
      ([label, done]) => `
        <li class="review-item${done ? ' is-done' : ''}">
          <span>${escapeHtml(label)}</span>
          <strong>${done ? '✓' : 'Pendiente'}</strong>
        </li>
      `,
    )
    .join('');

  const subsections = Object.values(documents.metrics?.subsections ?? {})
    .map(
      (item) => `
        <article class="trace-doc">
          <h3>${escapeHtml(item.title || 'Métrica')}</h3>
          <p>${escapeHtml(item.text)}</p>
          <p><strong>Datos:</strong> ${escapeHtml(item.data || '')}</p>
          <p><strong>Fórmula:</strong> ${escapeHtml(item.formula || '')}</p>
          <p><strong>Resultado:</strong> ${escapeHtml(item.result || '')}</p>
          <p><strong>Limitación:</strong> ${escapeHtml(item.limitation || '')}</p>
          ${item.reviewRequired ? '<p class="form-error">REVISIÓN REQUERIDA</p>' : ''}
          <p>Última actualización: ${escapeHtml(formatTimestamp(item.lastUpdated))}</p>
        </article>
      `,
    )
    .join('');

  return `
    <section class="stack">
      <h2>Lo que ya mediste</h2>
      <ul class="review-list">${rows}</ul>
      ${completion.reviewPending ? '<p class="form-error">Hay métricas en revisión requerida.</p>' : ''}
      ${subsections}
      <p>Evidencias: ${evidence.length} · Estados: ${['availability', 'mttr', 'mtbf', 'storage']
        .map((id) => `${id}: ${METRIC_STATUS_LABEL[measure[id].status] || measure[id].status}`)
        .join(' · ')}</p>
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: measureCheckpoint, answers: measure.checkpoint })}
      </section>
      ${
        measure.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(measureClosing.lead)}</p>
              <p>${escapeHtml(measureClosing.next)}</p>
              <p><strong>${escapeHtml(measureClosing.nextStage)}</strong> — ${escapeHtml(measureClosing.nextHint)}</p>
              <a class="btn btn--primary" href="#/diagnosticar" data-nav="/diagnosticar">Continuar a DIAGNOSTICAR</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-measure" ${completion.ready ? '' : 'disabled'}>
              Finalizar MEDIR
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan subsecciones, evidencia o hay revisiones pendientes.</p>'}
          `
      }
      ${navRow(8, null)}
    </section>
  `;
}

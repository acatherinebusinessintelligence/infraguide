import { appCopy } from '../data/copy.js';
import {
  decideSubstages,
  decideFinders,
  decideMethodSteps,
  decideMethodValues,
  decideActivities,
  decideCheckpoint,
  decideClosing,
  capexOpexItems,
  MIN_RECOMMENDATIONS,
} from '../data/methodology/decide.js';
import { getDecideSnapshot } from '../state/decideActions.js';
import { formatTimestamp } from '../state/understandModel.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { FindTheData } from '../components/FindTheData.js';
import {
  DecisionFindingBank,
  SelectedProblem,
  ConstraintReview,
  RecommendationCoverage,
} from '../components/decide/DecisionFindingBank.js';
import {
  AlternativeBuilder,
  TechnologyOptionCompare,
  DecisionBuilder,
  IntroducedRiskBuilder,
  CapexOpexAnalyzer,
  SuccessMetricSelector,
  PriorityBuilder,
  RecommendationCard,
  TechnologyStrategyBuilder,
  DecideTables,
  PedagogicalNotes,
} from '../components/decide/DecisionBuilders.js';
import { escapeHtml } from '../utils/escape.js';
import { TermLink } from '../data/pedagogy/glossary.js';
import { ContextualHelp } from '../components/pedagogy/ContextualHelp.js';
import { StageLockedView } from '../components/StageLockedView.js';
import { canWorkStage } from '../state/stageGates.js';
import { isModelSolved } from '../state/caseMode.js';
import { SolvedStagePage } from '../components/model/SolvedStages.js';

export function DecidePage(state) {
  if (isModelSolved(state)) {
    return SolvedStagePage(state, 7);
  }

  if (!state.selectedCase) {
    return shell(state, `<h1>DECIDIR</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`);
  }
  if (!canWorkStage(state, 7)) {
    return shell(state, StageLockedView({ state, stageId: 7 }));
  }

  const snap = getDecideSnapshot(state);
  const { decide, findings, constraints, documents, completion, coverage, selected, warnings, constraintsReady } = snap;
  const substage = decideSubstages.find((item) => item.id === decide.currentSubstage) ?? decideSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page decide-page">
        ${renderProgress(decide.currentSubstage, substage)}
        <p class="principle">No empieces por la tecnología.</p>
        ${ContextualHelp({
          termId: 'criterio-aceptacion',
          why: 'Una decisión sin hallazgo, alternativa y criterio no se puede defender.',
          where: 'Hallazgos, restricciones de la página 9 y costos de referencia del caso.',
          usedFor: 'Comparar alternativas y formular el programa recomendado.',
          documentTarget: 'Arquitectura objetivo, alternativas, programa e inversión.',
        })}
        <aside class="panel warning-panel">
          <p><strong>INCORRECTO:</strong> “Usar cloud porque es moderno.”</p>
          <p><strong>CORRECTO:</strong> “El servicio presenta picos de demanda y degradación; se comparan alternativas para mejorar capacidad y elasticidad.”</p>
        </aside>
        <p class="consultant-tip">Una recomendación debe poder defenderse incluso si cambias el nombre de la tecnología.</p>
        ${MethodCard({
          steps: decideMethodSteps,
          values: decideMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, decide, findings, constraints, documents, completion, coverage, selected, warnings, constraintsReady, error, state)}
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
  const steps = decideSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/decidir/${item.id}" data-nav="/decidir/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');
  return `
    <header class="understand-progress">
      <p class="understand-kicker">DECIDIR</p>
      <h1>${current} de 12 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next, options = {}) {
  const nextLink = options.nextDisabled
    ? `<span class="btn btn--primary" aria-disabled="true">Siguiente</span>`
    : next
      ? `<a class="btn btn--primary" href="#/decidir/${next}" data-nav="/decidir/${next}">Siguiente</a>`
      : '';
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/decidir/${prev}" data-nav="/decidir/${prev}">Anterior</a>` : '<span></span>'}
      ${nextLink}
      ${options.nextHint ? `<p class="form-error" role="status">${options.nextHint}</p>` : ''}
    </div>
  `;
}

function renderSubstage(id, decide, findings, constraints, documents, completion, coverage, selected, warnings, constraintsReady, error, state) {
  if (id === 1) {
    return `
      <section class="stack">
        ${SourceFinder({ finder: decideFinders.findings })}
        ${FindTheData({ activities: [decideActivities.start], answers: decide.activities })}
        ${DecisionFindingBank({ findings, decide, state })}
        ${RecommendationCoverage({ findings, coverage, completion })}
        ${navRow(null, 2)}
      </section>
    `;
  }
  if (id === 2) {
    return `
      <section class="stack">
        <h2>Seleccionar problema</h2>
        ${DecisionFindingBank({ findings, decide, state })}
        ${SelectedProblem({ finding: selected, decide })}
        ${navRow(1, 3)}
      </section>
    `;
  }
  if (id === 3) {
    return `
      <section class="stack">
        ${ConstraintReview({ constraints, draft: decide.draft })}
        ${navRow(2, 4, {
          nextDisabled: !constraintsReady,
          nextHint: constraintsReady ? '' : 'Revisa todas las restricciones antes de continuar. Puedes indicar que no afectan directamente.',
        })}
      </section>
    `;
  }
  if (id === 4) {
    return `
      <section class="stack">
        ${SourceFinder({ finder: decideFinders.alternatives })}
        ${AlternativeBuilder({ draft: decide.draft, error })}
        ${PedagogicalNotes()}
        ${navRow(3, 5)}
      </section>
    `;
  }
  if (id === 5) {
    return `
      <section class="stack">
        ${TechnologyOptionCompare({ draft: decide.draft })}
        ${navRow(4, 6)}
      </section>
    `;
  }
  if (id === 6) {
    return `
      <section class="stack">
        ${DecisionBuilder({ decide, finding: selected, warnings, error })}
        ${navRow(5, 7)}
      </section>
    `;
  }
  if (id === 7) {
    return `
      <section class="stack">
        <p>${TermLink({ termId: 'capex' })} y ${TermLink({ termId: 'opex' })} se clasifican con montos de referencia del caso, no como cotización.</p>
        ${ClassifyBoard({ items: capexOpexItems, answers: decide.classifications })}
        ${CapexOpexAnalyzer({ draft: decide.draft })}
        ${navRow(6, 8)}
      </section>
    `;
  }
  if (id === 8) {
    return `
      <section class="stack">
        ${IntroducedRiskBuilder({ draft: decide.draft })}
        ${navRow(7, 9)}
      </section>
    `;
  }
  if (id === 9) {
    return `
      <section class="stack">
        ${SuccessMetricSelector({ draft: decide.draft })}
        ${warnings.some((item) => item.type === 'metric') ? '<p class="form-error" role="status">¿Cómo comprobarás que la decisión funcionó?</p>' : ''}
        ${navRow(8, 10)}
      </section>
    `;
  }
  if (id === 10) {
    return `
      <section class="stack">
        ${PriorityBuilder({ draft: decide.draft })}
        ${navRow(9, 11)}
      </section>
    `;
  }
  if (id === 11) {
    const cards = (decide.recommendations ?? [])
      .map((item) => RecommendationCard({ item, expanded: decide.expandedRecId === item.decisionId }))
      .join('');
    return `
      <section class="stack">
        <h2>Recomendaciones</h2>
        <p>${decide.recommendations.length} / mínimo ${MIN_RECOMMENDATIONS}</p>
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
        ${warnings.map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`).join('')}
        <button class="btn btn--primary" type="button" data-action="save-recommendation">Guardar recomendación</button>
        <div class="rec-grid">${cards || '<p>Aún no hay recomendaciones.</p>'}</div>
        ${RecommendationCoverage({ findings, coverage, completion })}
        ${navRow(10, 12)}
      </section>
    `;
  }
  return renderReview(decide, findings, documents, completion, coverage, error);
}

function renderReview(decide, findings, documents, completion, coverage, error) {
  return `
    <section class="stack">
      <h2>Documentar estrategia</h2>
      ${TechnologyStrategyBuilder({ strategy: decide.strategy })}
      <p>Elementos propuestos para futuro TO-BE (a partir de decisiones, no un dibujo automático):</p>
      <ul>${(decide.recommendations ?? []).map((item) => `<li>${escapeHtml(item.decision)}</li>`).join('') || '<li>Sin decisiones aún.</li>'}</ul>
      ${DecideTables({ decide })}
      ${RecommendationCoverage({ findings, coverage, completion })}
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      <div class="doc-actions">
        <button class="btn btn--primary" type="button" data-action="add-strategy-doc">Agregar 14. Estrategia al documento</button>
        <button class="btn btn--primary" type="button" data-action="add-capex-doc">Agregar 15. CAPEX/OPEX al documento</button>
        <button class="btn btn--primary" type="button" data-action="add-recs-doc">Agregar 16. Recomendaciones al documento</button>
      </div>
      ${
        documents.strategy
          ? `<article class="trace-doc"><h3>14. Estrategia</h3><p>${escapeHtml(documents.strategy.text || '')}</p><p>${escapeHtml(formatTimestamp(documents.strategy.lastUpdated))}</p></article>`
          : ''
      }
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: decideCheckpoint, answers: decide.checkpoint })}
      </section>
      ${
        decide.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(decideClosing.lead)}</p>
              <p>${escapeHtml(decideClosing.next)}</p>
              <p><strong>${escapeHtml(decideClosing.nextStage)}</strong> — ${escapeHtml(decideClosing.nextHint)}</p>
              <a class="btn btn--primary" href="#/construir" data-nav="/construir">Continuar a CONSTRUIR</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-decide" ${completion.ready ? '' : 'disabled'}>
              Finalizar DECIDIR
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan estrategia, tablas, mínimo 5 recomendaciones completas o hay revisiones pendientes.</p>'}
          `
      }
      ${navRow(11, null)}
    </section>
  `;
}

function ClassifyBoard({ items, answers = {} }) {
  const labels = [
    { value: 'capex', label: 'CAPEX' },
    { value: 'opex', label: 'OPEX' },
    { value: 'mixed', label: 'MIXTO' },
  ];
  const cards = items
    .map((item) => {
      const selected = answers[item.id];
      const revealed = Boolean(selected);
      const correct = selected === item.correct;
      const buttons = labels
        .map(
          (label) => `
            <button class="btn btn--small" type="button" data-action="classify-decide" data-item-id="${escapeHtml(item.id)}" data-value="${escapeHtml(label.value)}" ${revealed ? 'disabled' : ''}>
              ${escapeHtml(label.label)}
            </button>
          `,
        )
        .join('');
      return `
        <article class="classify-card${revealed ? (correct ? ' is-correct' : ' is-wrong') : ''}">
          <p>${escapeHtml(item.text)}</p>
          <div class="classify-actions">${buttons}</div>
          ${
            revealed
              ? `<p class="activity-feedback${correct ? ' is-correct' : ' is-wrong'}" role="status">${
                  correct
                    ? item.correct === 'mixed'
                      ? 'Puede ser mixto: CAPEX local y OPEX cloud/servicios.'
                      : `Correcto: ${item.correct.toUpperCase()}.`
                    : item.correct === 'mixed'
                      ? 'Una solución híbrida suele ser MIXTA.'
                      : `Revisa: es ${item.correct.toUpperCase()}.`
                }</p>`
              : ''
          }
        </article>
      `;
    })
    .join('');
  return `<div class="classify-grid">${cards}</div>`;
}

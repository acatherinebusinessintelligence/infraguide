import { appCopy } from '../data/copy.js';
import {
  governSubstages,
  governFinders,
  governMethodSteps,
  governMethodValues,
  governActivities,
  governCheckpoint,
  governClosing,
  govVsMgmtItems,
  threatVsVulnItems,
  MIN_ITIL,
  MIN_COBIT,
  MIN_ISO,
} from '../data/methodology/govern.js';
import { getGovernSnapshot } from '../state/governActions.js';
import { formatTimestamp } from '../state/understandModel.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { FindTheData } from '../components/FindTheData.js';
import {
  GovernanceFindingBank,
  FrameworkPerspectiveSelector,
  FrameworkIntroCards,
  GovernanceCoverage,
  MultiFrameworkView,
} from '../components/govern/GovernanceFindingBank.js';
import {
  ITILAnalysisBuilder,
  GovernanceAnalysisBuilder,
  RiskBuilder,
  GovernTables,
} from '../components/govern/FrameworkBuilders.js';
import { escapeHtml } from '../utils/escape.js';

export function GovernPage(state) {
  if (!state.selectedCase) {
    return shell(state, `<h1>GOBERNAR</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`);
  }
  if (!state.completedStages.includes(5)) {
    return shell(
      state,
      `<h1>GOBERNAR</h1><p>Primero cierra DIAGNOSTICAR. ITIL, COBIT e ISO 27001 se aplican a hallazgos sustentados, no a opiniones.</p><a class="btn btn--primary" href="#/diagnosticar" data-nav="/diagnosticar">Ir a DIAGNOSTICAR</a>`,
    );
  }

  const { govern, findings, documents, completion, coverage, selected } = getGovernSnapshot(state);
  const substage = governSubstages.find((item) => item.id === govern.currentSubstage) ?? governSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page govern-page">
        ${renderProgress(govern.currentSubstage, substage)}
        <p class="principle">ITIL, COBIT e ISO 27001 no son respuestas intercambiables.</p>
        ${FrameworkIntroCards()}
        <p class="consultant-tip">No preguntes primero qué marco usar. Pregunta qué problema necesitas analizar.</p>
        ${MethodCard({
          steps: governMethodSteps,
          values: governMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, govern, findings, documents, completion, coverage, selected, error)}
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
  const steps = governSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/gobernar/${item.id}" data-nav="/gobernar/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');
  return `
    <header class="understand-progress">
      <p class="understand-kicker">GOBERNAR</p>
      <h1>${current} de 8 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/gobernar/${prev}" data-nav="/gobernar/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/gobernar/${next}" data-nav="/gobernar/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderSubstage(id, govern, findings, documents, completion, coverage, selected, error) {
  if (id === 1) {
    return `
      <section class="stack">
        <h2>Revisar hallazgos</h2>
        ${SourceFinder({ finder: governFinders.findings })}
        ${GovernanceFindingBank({ findings, govern })}
        ${GovernanceCoverage({ findings, coverage, completion })}
        ${navRow(null, 2)}
      </section>
    `;
  }
  if (id === 2) {
    return `
      <section class="stack">
        <h2>Elegir perspectiva</h2>
        ${FindTheData({ activities: [governActivities.backupPerspectives], answers: govern.activities })}
        ${GovernanceFindingBank({ findings, govern })}
        ${FrameworkPerspectiveSelector({ govern, finding: selected })}
        ${navRow(1, 3)}
      </section>
    `;
  }
  if (id === 3) {
    return `
      <section class="stack">
        ${SourceFinder({ finder: governFinders.itil })}
        <p>ITIL ${govern.itil.length} / mínimo ${MIN_ITIL}</p>
        ${GovernanceFindingBank({ findings, govern })}
        ${ITILAnalysisBuilder({ govern, finding: selected, error })}
        ${navRow(2, 4)}
      </section>
    `;
  }
  if (id === 4) {
    return `
      <section class="stack">
        ${SourceFinder({ finder: governFinders.cobit })}
        <p>COBIT ${govern.cobit.length} / mínimo ${MIN_COBIT}</p>
        ${ClassifyBoard({
          items: govVsMgmtItems,
          answers: govern.classifications,
          action: 'classify-gov',
          labels: [
            { value: 'gestion', label: 'GESTIÓN' },
            { value: 'gobierno', label: 'GOBIERNO' },
          ],
          ok: (item) => (item.correct === 'gestion' ? 'Ejecuta el servicio: es gestión.' : 'Evalúa, dirige o monitorea: es gobierno.'),
          bad: (item) => (item.correct === 'gestion' ? 'Eso se ejecuta. Es gestión.' : 'Eso define criterio o responsabilidad. Es gobierno.'),
        })}
        ${GovernanceFindingBank({ findings, govern })}
        ${GovernanceAnalysisBuilder({ govern, finding: selected, error })}
        ${navRow(3, 5)}
      </section>
    `;
  }
  if (id === 5) {
    return `
      <section class="stack">
        ${SourceFinder({ finder: governFinders.iso })}
        <p>ISO 27001 ${govern.iso27001.length} / mínimo ${MIN_ISO}</p>
        ${ClassifyBoard({
          items: threatVsVulnItems,
          answers: govern.classifications,
          action: 'classify-gov',
          labels: [
            { value: 'amenaza', label: 'AMENAZA' },
            { value: 'vulnerabilidad', label: 'VULNERABILIDAD' },
            { value: 'contexto', label: 'DEPENDE DEL CONTEXTO' },
          ],
          ok: (item) => item.note || (item.correct === 'amenaza' ? 'Amenaza: lo que puede ocurrir.' : 'Vulnerabilidad: la debilidad que lo facilita.'),
          bad: (item) => item.note || (item.correct === 'amenaza' ? 'Eso es una amenaza.' : item.correct === 'contexto' ? 'Puede ser amenaza o impacto según la formulación.' : 'Eso es una vulnerabilidad.'),
        })}
        ${GovernanceFindingBank({ findings, govern })}
        ${RiskBuilder({ govern, finding: selected, error })}
        ${navRow(4, 6)}
      </section>
    `;
  }
  if (id === 6) {
    return `
      <section class="stack">
        <h2>Un mismo hallazgo, varios marcos</h2>
        ${GovernanceFindingBank({ findings, govern })}
        ${MultiFrameworkView({ finding: selected, govern })}
        ${navRow(5, 7)}
      </section>
    `;
  }
  if (id === 7) {
    return `
      <section class="stack">
        <h2>Secciones del documento</h2>
        ${GovernTables({ govern })}
        ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
        <div class="doc-actions">
          <button class="btn btn--primary" type="button" data-action="add-itil-doc">Agregar 11. ITIL al documento</button>
          <button class="btn btn--primary" type="button" data-action="add-cobit-doc">Agregar 12. COBIT al documento</button>
          <button class="btn btn--primary" type="button" data-action="add-iso-doc">Agregar 13. ISO 27001 al documento</button>
        </div>
        ${navRow(6, 8)}
      </section>
    `;
  }
  return renderReview(govern, findings, documents, completion, coverage, error);
}

function renderReview(govern, findings, documents, completion, coverage, error) {
  const rows = [
    ['ITIL mínimo 4', completion.itilMin, `${completion.itilCount} / ${MIN_ITIL}`],
    ['COBIT mínimo 3', completion.cobitMin, `${completion.cobitCount} / ${MIN_COBIT}`],
    ['ISO mínimo 5', completion.isoMin, `${completion.isoCount} / ${MIN_ISO}`],
    ['Tres secciones documentadas', completion.documented, completion.documented ? '✓' : 'Pendiente'],
    ['Sin revisiones pendientes', !completion.reviewPending, completion.reviewPending ? 'Hay REVIEW_REQUIRED' : '✓'],
  ]
    .map(
      ([label, done, value]) => `
        <li class="review-item${done ? ' is-done' : ''}">
          <span>${escapeHtml(label)}</span>
          <strong>${escapeHtml(String(value))}</strong>
        </li>
      `,
    )
    .join('');

  return `
    <section class="stack">
      <h2>Revisión final</h2>
      ${GovernanceCoverage({ findings, coverage, completion })}
      <ul class="review-list">${rows}</ul>
      ${GovernTables({ govern })}
      ${
        documents.itil
          ? `<article class="trace-doc"><h3>11. ITIL</h3><p>${escapeHtml(documents.itil.text || '')}</p><p>${escapeHtml(formatTimestamp(documents.itil.lastUpdated))}</p></article>`
          : ''
      }
      ${
        documents.cobit
          ? `<article class="trace-doc"><h3>12. COBIT</h3><p>${escapeHtml(documents.cobit.text || '')}</p></article>`
          : ''
      }
      ${
        documents.iso27001
          ? `<article class="trace-doc"><h3>13. ISO 27001</h3><p>${escapeHtml(documents.iso27001.text || '')}</p></article>`
          : ''
      }
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: governCheckpoint, answers: govern.checkpoint })}
      </section>
      ${
        govern.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(governClosing.lead)}</p>
              <p>${escapeHtml(governClosing.mid)}</p>
              <p>${escapeHtml(governClosing.next)}</p>
              <p><strong>${escapeHtml(governClosing.nextStage)}</strong> — ${escapeHtml(governClosing.nextHint)}</p>
              <a class="btn btn--primary" href="#/decidir" data-nav="/decidir">Continuar a DECIDIR</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-govern" ${completion.ready ? '' : 'disabled'}>
              Finalizar GOBERNAR
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan mínimos, trazabilidad, secciones o hay revisiones pendientes.</p>'}
            ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
          `
      }
      ${navRow(7, null)}
    </section>
  `;
}

function ClassifyBoard({ items, answers = {}, action, labels, ok, bad }) {
  const cards = items
    .map((item) => {
      const selected = answers[item.id];
      const revealed = Boolean(selected);
      const correct = selected === item.correct;
      const buttons = labels
        .map(
          (label) => `
            <button class="btn btn--small" type="button" data-action="${escapeHtml(action)}" data-item-id="${escapeHtml(item.id)}" data-value="${escapeHtml(label.value)}" ${revealed ? 'disabled' : ''}>
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
              ? `<p class="activity-feedback${correct ? ' is-correct' : ' is-wrong'}" role="status">${escapeHtml(correct ? ok(item) : bad(item))}</p>`
              : ''
          }
        </article>
      `;
    })
    .join('');
  return `<div class="classify-grid">${cards}</div>`;
}

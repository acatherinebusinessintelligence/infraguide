import { appCopy } from '../data/copy.js';
import {
  diagnoseSubstages,
  diagnoseFinders,
  diagnoseMethodSteps,
  diagnoseMethodValues,
  datoVsFindingItems,
  diagnoseCheckpoint,
  diagnoseClosing,
  pedagogicalExamples,
} from '../data/methodology/diagnose.js';
import { getDiagnoseSnapshot } from '../state/diagnoseActions.js';
import { MIN_FINDINGS } from '../state/diagnoseModel.js';
import { formatTimestamp } from '../state/understandModel.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { FindTheData } from '../components/FindTheData.js';
import { EvidenceBank } from '../components/diagnose/EvidenceBank.js';
import { FindingBuilder, MissingEvidenceFinding } from '../components/diagnose/FindingBuilder.js';
import { DiagnosticMatrix, CoveragePanel, DiagnoseSummary } from '../components/diagnose/DiagnosticMatrix.js';
import { escapeHtml } from '../utils/escape.js';
import { TermLink } from '../data/pedagogy/glossary.js';
import { ContextualHelp } from '../components/pedagogy/ContextualHelp.js';
import { StageLockedView } from '../components/StageLockedView.js';
import { canWorkStage } from '../state/stageGates.js';
import { isModelSolved } from '../state/caseMode.js';
import { SolvedStagePage } from '../components/model/SolvedStages.js';

export function DiagnosePage(state) {
  if (isModelSolved(state)) {
    return SolvedStagePage(state, 5);
  }

  if (!state.selectedCase) {
    return shell(state, `<h1>DIAGNOSTICAR</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`);
  }
  if (!canWorkStage(state, 5)) {
    return shell(state, StageLockedView({ state, stageId: 5 }));
  }

  const { diagnose, bank, documents, completion, draftStatus, similar } = getDiagnoseSnapshot(state);
  const substage = diagnoseSubstages.find((item) => item.id === diagnose.currentSubstage) ?? diagnoseSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page diagnose-page">
        ${renderProgress(diagnose.currentSubstage, substage)}
        <p class="principle">Un hallazgo no es una opinión. Es una conclusión que puedes rastrear hasta la evidencia. ${TermLink({ termId: 'riesgo' })} se ancla al hallazgo, no a un adjetivo vacío.</p>
        ${ContextualHelp({
          termId: 'riesgo',
          why: 'El informe no puede listar números sueltos: necesita condiciones, evidencia e impacto.',
          where: 'PDF y cálculos de MEDIR que ya sustentaste.',
          usedFor: 'Convertir evidencia y métricas en hallazgos de ingeniería.',
          documentTarget: 'Hallazgos de ingeniería.',
        })}
        <aside class="panel warning-panel">
          <p><strong>DATO ≠ HALLAZGO.</strong> “CPU pico 92 %” es un dato. “Existe degradación de rendimiento durante periodos de alta demanda” puede ser un hallazgo si está sustentado.</p>
          <p>DATO → EVIDENCIA → INTERPRETACIÓN → HALLAZGO → IMPACTO → CRITICIDAD</p>
        </aside>
        ${MethodCard({
          steps: diagnoseMethodSteps,
          values: diagnoseMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, diagnose, bank, documents, completion, draftStatus, similar, error, state.analysis?.govern)}
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
  const steps = diagnoseSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/diagnosticar/${item.id}" data-nav="/diagnosticar/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');
  return `
    <header class="understand-progress">
      <p class="understand-kicker">DIAGNOSTICAR</p>
      <h1>${current} de 9 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/diagnosticar/${prev}" data-nav="/diagnosticar/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/diagnosticar/${next}" data-nav="/diagnosticar/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderSubstage(id, diagnose, bank, documents, completion, draftStatus, similar, error, govern) {
  if (id === 1) {
    return `
      <section class="stack">
        <h2>Banco de evidencias</h2>
        ${SourceFinder({ finder: diagnoseFinders.bank })}
        ${EvidenceBank({ bank, filter: diagnose.currentFilter, selectedIds: diagnose.draft.evidenceIds, showSelect: true })}
        ${navRow(null, 2)}
      </section>
    `;
  }
  if (id === 2) {
    return `
      <section class="stack">
        <h2>Dato vs hallazgo</h2>
        <p>El dato describe lo que ocurrió. El hallazgo explica qué significa esa evidencia en el contexto del servicio.</p>
        ${DatoVsFindingBoard({ items: datoVsFindingItems, answers: diagnose.datoClassifications })}
        ${navRow(1, 3)}
      </section>
    `;
  }
  if (id === 3) {
    return `
      <section class="stack">
        <h2>Construir hallazgos</h2>
        ${SourceFinder({ finder: diagnoseFinders.build })}
        ${FindingBuilder({ diagnose, bank, draftStatus, similar, error })}
        ${navRow(2, 4)}
      </section>
    `;
  }
  if (id === 4) {
    return `
      <section class="stack">
        <h2>Analizar impacto</h2>
        ${FindingBuilder({ diagnose: { ...diagnose, draft: { ...diagnose.draft, step: 4 } }, bank, draftStatus, similar, error })}
        ${navRow(3, 5)}
      </section>
    `;
  }
  if (id === 5) {
    return `
      <section class="stack">
        <h2>Definir criticidad</h2>
        <aside class="panel warning-panel">
          <p>Hallazgo: “Falla de backup permanece dos días sin detección.”</p>
          <p>Impacto: “Se compromete capacidad de recuperación.”</p>
          <p>Criticidad: <strong>ALTA</strong> — el riesgo afecta continuidad y recuperación, aunque no produzca indisponibilidad inmediata.</p>
        </aside>
        ${FindingBuilder({ diagnose: { ...diagnose, draft: { ...diagnose.draft, step: 5 } }, bank, draftStatus, similar, error })}
        ${navRow(4, 6)}
      </section>
    `;
  }
  if (id === 6) {
    return `
      <section class="stack">
        ${MissingEvidenceFinding({ diagnose, error })}
        ${navRow(5, 7)}
      </section>
    `;
  }
  if (id === 7) {
    return `
      <section class="stack">
        <h2>Clasificar hallazgos</h2>
        <p>El estudiante selecciona la categoría. No se infiere automáticamente sin posibilidad de editar.</p>
        ${CoveragePanel({ findings: diagnose.findings })}
        ${DiagnosticMatrix({ diagnose, govern })}
        ${navRow(6, 8)}
      </section>
    `;
  }
  if (id === 8) {
    return `
      <section class="stack">
        <h2>Matriz de diagnóstico</h2>
        ${DiagnosticMatrix({ diagnose, govern })}
        ${CoveragePanel({ findings: diagnose.findings })}
        ${navRow(7, 9)}
      </section>
    `;
  }
  return renderReview(diagnose, documents, completion, error, govern);
}

function renderReview(diagnose, documents, completion, error, govern) {
  const rows = [
    [`Hallazgos sustentados`, `${completion.completeCount} / mínimo ${MIN_FINDINGS}`],
    ['Matriz documentada', completion.documented],
    ['Resumen breve', completion.summaryOk],
    ['Revisiones pendientes', !completion.reviewPending],
  ]
    .map(
      ([label, done]) => `
        <li class="review-item${done === true || (typeof done === 'string' && completion.minMet) ? ' is-done' : ''}">
          <span>${escapeHtml(label)}</span>
          <strong>${typeof done === 'string' ? escapeHtml(done) : done ? '✓' : 'Pendiente'}</strong>
        </li>
      `,
    )
    .join('');

  const examples = pedagogicalExamples
    .map((item) => `<li><strong>${escapeHtml(item.title)}:</strong> ${escapeHtml(item.finding)}</li>`)
    .join('');

  return `
    <section class="stack">
      <h2>Documentar el diagnóstico</h2>
      <ul class="review-list">${rows}</ul>
      ${completion.reviewPending ? '<p class="form-error">Hay hallazgos en revisión requerida.</p>' : ''}
      ${DiagnosticMatrix({ diagnose, govern })}
      ${DiagnoseSummary({ diagnose, error })}
      ${
        documents.findings
          ? `
            <article class="trace-doc">
              <h3>10. Hallazgos</h3>
              <p>${escapeHtml(documents.findings.summary || documents.findings.text || '')}</p>
              <p>Última actualización: ${escapeHtml(formatTimestamp(documents.findings.lastUpdated))}</p>
            </article>
          `
          : ''
      }
      <details class="example-box">
        <summary>Orientación del caso modelo (no se inserta sola)</summary>
        <ul>${examples}</ul>
      </details>
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: diagnoseCheckpoint, answers: diagnose.checkpoint })}
      </section>
      ${
        diagnose.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(diagnoseClosing.lead)}</p>
              <p>${escapeHtml(diagnoseClosing.next)}</p>
              <p><strong>${escapeHtml(diagnoseClosing.nextStage)}</strong> — ${escapeHtml(diagnoseClosing.nextHint)}</p>
              <a class="btn btn--primary" href="#/gobernar" data-nav="/gobernar">Continuar a GOBERNAR</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-diagnose" ${completion.ready ? '' : 'disabled'}>
              Finalizar DIAGNOSTICAR
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan hallazgos, fuentes, matriz, resumen o hay revisiones pendientes.</p>'}
            ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
          `
      }
      ${navRow(8, null)}
    </section>
  `;
}

function DatoVsFindingBoard({ items, answers = {} }) {
  const cards = items
    .map((item) => {
      const selected = answers[item.id];
      const revealed = Boolean(selected);
      const correct = selected === item.correct;
      return `
        <article class="classify-card${revealed ? (correct ? ' is-correct' : ' is-wrong') : ''}">
          <p>${escapeHtml(item.text)}</p>
          <div class="classify-actions">
            <button class="btn btn--small" type="button" data-action="classify-dato" data-item-id="${escapeHtml(item.id)}" data-value="dato" ${revealed ? 'disabled' : ''}>DATO</button>
            <button class="btn btn--small" type="button" data-action="classify-dato" data-item-id="${escapeHtml(item.id)}" data-value="hallazgo" ${revealed ? 'disabled' : ''}>HALLAZGO</button>
          </div>
          ${
            revealed
              ? `<p class="activity-feedback${correct ? ' is-correct' : ' is-wrong'}" role="status">${
                  correct
                    ? item.correct === 'dato'
                      ? 'El dato describe lo que ocurrió.'
                      : 'El hallazgo explica qué significa esa evidencia en el contexto del servicio.'
                    : item.correct === 'dato'
                      ? 'Eso describe un evento o número. Es un dato.'
                      : 'Eso interpreta el evento. Es un hallazgo.'
                }</p>`
              : ''
          }
        </article>
      `;
    })
    .join('');
  return `<div class="classify-grid">${cards}</div>`;
}

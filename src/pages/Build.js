import { appCopy } from '../data/copy.js';
import {
  buildSubstages,
  buildMethodSteps,
  buildMethodValues,
  buildActivities,
  buildCheckpoint,
  buildClosing,
} from '../data/methodology/build.js';
import { getBuildSnapshot } from '../state/buildActions.js';
import { documentedFindings, availableConstraints } from '../state/decideModel.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { FindTheData } from '../components/FindTheData.js';
import {
  DocumentAssembler,
  DocumentStatusPanel,
  DocumentSummary,
  DocumentValidator,
  TraceabilityAudit,
  ConsistencyChecker,
  DocumentQualityCheck,
  DocumentIssuesPanel,
} from '../components/build/DocumentAssembler.js';
import { ConclusionsBuilder, DocumentPreview } from '../components/build/DocumentPreview.js';
import { escapeHtml } from '../utils/escape.js';
import { ContextualHelp } from '../components/pedagogy/ContextualHelp.js';

export function BuildPage(state) {
  if (!state.selectedCase) {
    return shell(state, `<h1>CONSTRUIR</h1><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p><a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>`);
  }
  if (!state.completedStages.includes(7)) {
    return shell(
      state,
      `<h1>CONSTRUIR</h1><p>Primero cierra DECIDIR. El documento final ensambla lo ya construido; no inventa análisis.</p><a class="btn btn--primary" href="#/decidir" data-nav="/decidir">Ir a DECIDIR</a>`,
    );
  }

  const snap = getBuildSnapshot(state);
  const { build, assembled, issues, summary, audit, consistency, quality, completion, chain } = snap;
  const substage = buildSubstages.find((item) => item.id === build.currentSubstage) ?? buildSubstages[0];
  const error = state.documentError;
  const findings = documentedFindings(state);
  const recs = state.analysis?.decide?.recommendations ?? [];
  const constraints = availableConstraints(state);

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page build-page">
        ${renderProgress(build.currentSubstage, substage)}
        <p class="principle">Ensamblar, orientar y validar. No generar análisis que no hayas construido.</p>
        ${ContextualHelp({
          termId: 'criterio-aceptacion',
          why: 'CONSTRUIR ensambla el informe de consultoría; no inventa evidencia nueva.',
          where: 'Todas las evidencias y decisiones ya registradas.',
          usedFor: 'Cerrar dictamen, limitaciones y anexos.',
          documentTarget: 'Dictamen técnico, recomendación de cierre y anexos.',
        })}
        ${
          build.returnSection
            ? `<p class="consultant-tip">Editaste una sección del informe. <button class="btn btn--small" type="button" data-action="return-to-preview">Volver a la vista previa</button></p>`
            : ''
        }
        ${MethodCard({
          steps: buildMethodSteps,
          values: buildMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, { state, build, assembled, issues, summary, audit, consistency, quality, completion, chain, findings, recs, constraints, error })}
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
  const steps = buildSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/construir/${item.id}" data-nav="/construir/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');
  return `
    <header class="understand-progress">
      <p class="understand-kicker">CONSTRUIR</p>
      <h1>${current} de 6 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/construir/${prev}" data-nav="/construir/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/construir/${next}" data-nav="/construir/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderSubstage(id, ctx) {
  const { assembled, summary, issues, audit, consistency, quality, chain, findings, recs, constraints, build, error, state, completion } = ctx;
  if (id === 1) {
    const complete = assembled.filter((item) => item.status === 'COMPLETA').length;
    return `
      <section class="stack">
        ${FindTheData({ activities: [buildActivities.start], answers: build.activities })}
        <p>${complete} de 14 secciones del informe final están completas. Las conclusiones suelen ser la pendiente.</p>
        ${DocumentSummary({ summary })}
        ${DocumentStatusPanel({ assembled })}
        ${DocumentAssembler({ assembled })}
        ${navRow(null, 2)}
      </section>
    `;
  }
  if (id === 2) {
    return `
      <section class="stack">
        ${DocumentValidator({ issues })}
        ${ConsistencyChecker({ consistency })}
        ${navRow(1, 3)}
      </section>
    `;
  }
  if (id === 3) {
    return `
      <section class="stack">
        ${TraceabilityAudit({ audit, chain })}
        ${navRow(2, 4)}
      </section>
    `;
  }
  if (id === 4) {
    return `
      <section class="stack">
        ${ConclusionsBuilder({
          draft: build.conclusions,
          findings,
          recommendations: recs,
          constraints,
          warnings: build.conclusions?.warnings ?? [],
          error,
        })}
        ${navRow(3, 5)}
      </section>
    `;
  }
  if (id === 5) {
    return `
      <section class="stack">
        ${DocumentPreview({ state, assembled, build, findings, recommendations: recs })}
        ${navRow(4, 6)}
      </section>
    `;
  }
  return `
    <section class="stack">
      ${DocumentQualityCheck({ quality })}
      ${DocumentSummary({ summary })}
      ${DocumentIssuesPanel({ issues })}
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: buildCheckpoint, answers: build.checkpoint })}
      </section>
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      ${
        build.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(buildClosing.lead)}</p>
              <p>${escapeHtml(buildClosing.mid)}</p>
              <p>${escapeHtml(buildClosing.next)}</p>
              <button class="btn btn--primary" type="button" data-action="goto-export">Exportar documento</button>
              <p class="consultant-tip">${escapeHtml(buildClosing.exportHint)}</p>
            </section>
          `
          : `
            <p><strong>${summary.readyToExport ? 'DOCUMENTO LISTO PARA EXPORTAR' : 'Aún no está listo para exportar.'}</strong></p>
            <button class="btn btn--primary" type="button" data-action="complete-build" ${completion.ready ? '' : 'disabled'}>Finalizar CONSTRUIR</button>
            ${completion.ready ? '' : '<p class="form-error">Faltan conclusiones, hay errores/revisiones, o no se ha revisado la vista previa.</p>'}
            <button class="btn" type="button" data-action="goto-export" ${summary.readyToExport ? '' : 'disabled'}>Exportar documento</button>
            <p class="consultant-tip">${escapeHtml(buildClosing.exportHint)}</p>
          `
      }
      ${navRow(5, null)}
    </section>
  `;
}

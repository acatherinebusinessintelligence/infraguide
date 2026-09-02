import { appCopy, dataMethodChain, diagnosisChain, sourceMethodChain } from '../data/copy.js';
import { methodSteps, traceabilityFields } from '../data/methodology/methodSteps.js';
import { availabilityExample } from '../data/methodology/availabilityExample.js';
import { readingGuide, consultantTips } from '../data/methodology/sourceFinders.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { TraceabilityPanel } from '../components/TraceabilityPanel.js';
import { escapeHtml } from '../utils/escape.js';
import { APP_VERSION } from '../config.js';

export function HelpPage(state) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page">
        <div class="help-grid">
          <section class="panel" aria-labelledby="about-title">
            <header class="panel__header">
              <h1 class="panel__title" id="about-title">${escapeHtml(appCopy.help.aboutTitle)}</h1>
            </header>
            <p>${escapeHtml(appCopy.help.aboutBody)}</p>
            <p>InfraGuide v${escapeHtml(APP_VERSION)}</p>
            <p><a class="btn btn--primary" href="#/aprender" data-nav="/aprender">Abrir APRENDIZAJE</a></p>
          </section>

          <section class="panel" aria-labelledby="learn-help-title">
            <h2 class="panel__title" id="learn-help-title">Capa pedagógica</h2>
            <p>El menú <strong>APRENDIZAJE</strong> explica conceptos, glosario y cálculo guiado. El menú <strong>Tu documento</strong> es el informe profesional: no incluye esas instrucciones.</p>
          </section>

          <section class="panel" aria-labelledby="help-title">
            <header class="panel__header">
              <h2 class="panel__title" id="help-title">${escapeHtml(appCopy.help.title)}</h2>
              <p class="panel__intro">${escapeHtml(appCopy.help.intro)}</p>
            </header>
          </section>

          <section class="panel" aria-labelledby="progress-title">
            <h2 class="panel__title" id="progress-title">${escapeHtml(appCopy.help.progressTitle)}</h2>
            <p>${escapeHtml(appCopy.help.progressIntro)}</p>
            ${state.documentError ? `<p class="form-error" role="status">${escapeHtml(state.documentError)}</p>` : ''}
            <div class="export-actions">
              <a class="btn btn--primary" href="#/progreso" data-nav="/progreso">${escapeHtml(appCopy.help.openProgress)}</a>
              <button class="btn" type="button" data-action="export-progress">${escapeHtml(appCopy.help.exportProgress)}</button>
              <label class="btn">
                ${escapeHtml(appCopy.help.importProgress)}
                <input class="visually-hidden" type="file" accept="application/json,.json" data-action="import-progress" />
              </label>
              ${
                state.teacherMode
                  ? `<button class="btn" type="button" data-action="exit-teacher-mode">Salir del modo demostración</button>`
                  : `<button class="btn" type="button" data-action="enter-teacher-mode">${escapeHtml(appCopy.help.teacherMode)}</button>`
              }
              <a class="btn" href="#/informe/modelo" data-nav="/informe/modelo">${escapeHtml(appCopy.dashboard.modelReport)}</a>
            </div>
          </section>

          <section class="panel" aria-labelledby="reading-title">
            <h2 class="panel__title" id="reading-title">${escapeHtml(appCopy.help.readingTitle)}</h2>
            <ol class="reading-guide">
              ${readingGuide.map((item, index) => `<li><span>${index + 1}.</span> ${escapeHtml(item)}</li>`).join('')}
            </ol>
          </section>

          <section class="panel" aria-labelledby="tips-title">
            <h2 class="panel__title" id="tips-title">${escapeHtml(appCopy.help.consultantTitle)}</h2>
            ${consultantTips.map((tip) => `<blockquote class="consultant-tip">${escapeHtml(tip)}</blockquote>`).join('')}
          </section>

          <section class="panel" aria-labelledby="help-method-title">
            <h2 class="panel__title" id="help-method-title">${escapeHtml(appCopy.help.methodTitle)}</h2>
            ${chain(sourceMethodChain, '↓')}
            <p class="panel__intro">${escapeHtml(appCopy.caseWork.principle)}</p>
            ${chain(dataMethodChain, '↓')}
          </section>

          <section class="panel" aria-labelledby="help-decision-title">
            <h2 class="panel__title" id="help-decision-title">${escapeHtml(appCopy.help.decisionTitle)}</h2>
            ${chain(diagnosisChain, '→')}
          </section>

          ${MethodCard({
            steps: methodSteps,
            values: availabilityExample.steps,
            topic: availabilityExample.topic,
            disclaimer: availabilityExample.disclaimer,
          })}

          ${TraceabilityPanel({
            fields: traceabilityFields,
            values: availabilityExample.trace,
          })}
        </div>
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function chain(items, arrowChar) {
  const nodes = items
    .map((item, index) => {
      const arrow =
        index < items.length - 1
          ? `<span class="flow__arrow" aria-hidden="true">${arrowChar}</span>`
          : '';
      return `<li class="flow__item">${escapeHtml(item.label)}</li>${arrow}`;
    })
    .join('');

  return `<ol class="flow${arrowChar === '→' ? ' flow--row' : ''}">${nodes}</ol>`;
}

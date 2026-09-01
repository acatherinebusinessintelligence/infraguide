import { appCopy, pipelineSteps, dataMethodChain, diagnosisChain } from '../data/copy.js';
import { LandingHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { escapeHtml } from '../utils/escape.js';

export function HomePage(state) {
  return `
    <div class="app-shell">
      ${LandingHeader({ state })}
      <main id="contenido" class="page">
        <section class="hero-card" aria-labelledby="home-lead">
          <p class="hero__lead" id="home-lead">${escapeHtml(appCopy.home.lead)}</p>
          <p class="hero__body">${escapeHtml(appCopy.home.body)}</p>
          <a class="btn btn--primary" href="#/intro" data-nav="/intro">
            ${escapeHtml(appCopy.home.startButton)}
          </a>
        </section>
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

export function IntroPage(state) {
  return `
    <div class="app-shell">
      ${LandingHeader({ state })}
      <main id="contenido" class="page">
        <section class="intro-panel" aria-labelledby="intro-lead">
          <div class="intro-split">
            <div>
              <p class="intro-panel__lead" id="intro-lead">${escapeHtml(appCopy.intro.lead)}</p>
              <div class="stack">
                <div class="chain-block">
                  <h2 id="method-chain-title">${escapeHtml(appCopy.intro.methodologyLabel)}</h2>
                  ${verticalList(dataMethodChain, 'method-chain-title')}
                </div>
                <div class="chain-block">
                  <h2 id="decision-chain-title">${escapeHtml(appCopy.intro.decisionLabel)}</h2>
                  ${horizontalList(diagnosisChain, appCopy.intro.decisionLabel)}
                </div>
                <div>
                  <a class="btn btn--primary" href="#/ruta" data-nav="/ruta">
                    ${escapeHtml(appCopy.intro.startButton)}
                  </a>
                </div>
              </div>
            </div>
            ${pipeline(pipelineSteps, appCopy.intro.pipelineLabel)}
          </div>
        </section>
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function pipeline(items, label) {
  const nodes = items
    .map((item, index) => {
      const arrow =
        index < items.length - 1
          ? '<li class="pipeline-visual__arrow" aria-hidden="true">↓</li>'
          : '';
      return `
        <li class="pipeline-visual__item">${escapeHtml(item.label)}</li>
        ${arrow}
      `;
    })
    .join('');

  return `
    <ol class="pipeline-visual" aria-label="${escapeHtml(label)}">
      ${nodes}
    </ol>
  `;
}

function verticalList(items, labelledBy) {
  const nodes = items
    .map((item, index) => {
      const arrow =
        index < items.length - 1
          ? '<span class="flow__arrow" aria-hidden="true">↓</span>'
          : '';
      return `<li class="flow__item">${escapeHtml(item.label)}</li>${arrow}`;
    })
    .join('');

  return `
    <ol class="flow" aria-labelledby="${labelledBy}">
      ${nodes}
    </ol>
  `;
}

function horizontalList(items, label) {
  const nodes = items
    .map((item, index) => {
      const arrow =
        index < items.length - 1
          ? '<span class="flow__arrow" aria-hidden="true">→</span>'
          : '';
      return `<li class="flow__item">${escapeHtml(item.label)}</li>${arrow}`;
    })
    .join('');

  return `
    <ol class="flow flow--row" aria-label="${escapeHtml(label)}">
      ${nodes}
    </ol>
  `;
}

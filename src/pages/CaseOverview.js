import { appCopy, sourceMethodChain } from '../data/copy.js';
import { cases, getCaseById } from '../data/cases/index.js';
import { sourceFinders, findTheDataActivities, consultantTips } from '../data/methodology/sourceFinders.js';
import { getGroupProgress } from '../data/methodology/data-map.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { CaseSelector } from '../components/CaseSelector.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { FindTheData } from '../components/FindTheData.js';
import { MethodDataInfo } from '../components/MethodDataInfo.js';
import { CollectedDataPanel } from '../components/CollectedDataPanel.js';
import { escapeHtml } from '../utils/escape.js';

export function CaseOverviewPage(state) {
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  const progress = getGroupProgress(state.collectedData);

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page">
        <p class="principle">${escapeHtml(appCopy.caseWork.principle)}</p>
        ${
          caseData
            ? renderOverview(caseData, state, progress)
            : `
              <section class="panel">
                <h1 class="panel__title">${escapeHtml(appCopy.dashboard.workCaseHeading)}</h1>
                <p class="panel__intro">${escapeHtml(appCopy.caseWork.noCaseYet)}</p>
                ${CaseSelector({ cases, selectedCaseId: null })}
              </section>
            `
        }
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${MethodDataInfo({ caseData, dataKey: state.methodInfoKey })}
      ${SiteFooter()}
    </div>
  `;
}

function renderOverview(caseData, state, progress) {
  const cards = caseData.sections
    .map(
      (section) => `
        <a class="section-index-card" href="#/explorar/${encodeURIComponent(section.sectionId)}" data-nav="/explorar/${section.sectionId}">
          <span>${section.index}</span>
          <strong>${escapeHtml(section.sectionTitle)}</strong>
          <em>${escapeHtml(section.summary || '')}</em>
        </a>
      `,
    )
    .join('');

  const chain = sourceMethodChain
    .map((item, index) => {
      const arrow =
        index < sourceMethodChain.length - 1
          ? '<span class="flow__arrow" aria-hidden="true">↓</span>'
          : '';
      return `<li class="flow__item">${escapeHtml(item.label)}</li>${arrow}`;
    })
    .join('');

  const finders = sourceFinders.map((finder) => SourceFinder({ finder })).join('');
  const tips = consultantTips.map((tip) => `<blockquote class="consultant-tip">${escapeHtml(tip)}</blockquote>`).join('');

  return `
    <header class="overview-hero">
      <p class="overview-hero__case">${escapeHtml(caseData.name)} · ${escapeHtml(caseData.kindLabel)}</p>
      <h1>${escapeHtml(appCopy.caseWork.overviewTitle)}</h1>
      <p>${escapeHtml(appCopy.caseWork.overviewLead)}</p>
      <p class="prep-indicator">${escapeHtml(appCopy.dashboard.prepLabel)}: ${progress.identified} de ${progress.total} grupos de datos identificados.</p>
      <p class="readonly-note">${escapeHtml(appCopy.caseWork.readonlyNote)}</p>
    </header>

    <ol class="flow overview-chain" aria-label="${escapeHtml(appCopy.caseWork.principle)}">${chain}</ol>

    <section class="panel" aria-labelledby="case-index-title">
      <h2 id="case-index-title">Índice del caso</h2>
      <div class="section-index-grid">
        ${cards}
      </div>
    </section>

    <section class="stack" aria-label="${escapeHtml(appCopy.caseWork.needHeading)}">
      ${finders}
    </section>

    <section class="panel" aria-labelledby="activities-title">
      <h2 id="activities-title">${escapeHtml(appCopy.caseWork.activitiesTitle)}</h2>
      ${FindTheData({ activities: findTheDataActivities, answers: state.activityAnswers })}
    </section>

    <section class="panel" aria-labelledby="tips-title">
      <h2 id="tips-title">${escapeHtml(appCopy.help.consultantTitle)}</h2>
      ${tips}
    </section>

    ${CollectedDataPanel({
      collectedData: state.collectedData,
      methodologyStatus: state.methodologyStatus,
      open: true,
      variant: 'inline',
    })}
  `;
}

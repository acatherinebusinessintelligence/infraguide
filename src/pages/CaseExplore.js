import { appCopy } from '../data/copy.js';
import { getCaseById } from '../data/cases/index.js';
import { sourceFinders } from '../data/methodology/sourceFinders.js';
import { identificationTraceFields } from '../data/methodology/sourceFinders.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { CaseExplorer } from '../components/CaseExplorer.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { DataTraceFlow } from '../components/DataTraceFlow.js';
import { TraceabilityPanel, buildIdentificationTraceItems } from '../components/TraceabilityPanel.js';
import { MethodDataInfo } from '../components/MethodDataInfo.js';
import { CollectedDataPanel } from '../components/CollectedDataPanel.js';
import { escapeHtml } from '../utils/escape.js';

export function CaseExplorePage(state) {
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  const collectedKeys = new Set(state.collectedData.map((item) => item.key));
  const sectionId = state.explorerSectionId || 'operational-data';
  const finder =
    sourceFinders.find((item) => item.lookInSectionId === sectionId) ?? sourceFinders[0];
  const traced = state.collectedData.find((item) => item.key === state.lastCollectedKey) ?? state.collectedData[0];
  const traceItems = traced ? buildIdentificationTraceItems(traced, state.methodologyStatus) : null;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page">
        ${
          caseData
            ? `
              <p class="principle">${escapeHtml(appCopy.caseWork.principle)}</p>
              ${CaseExplorer({ caseData, sectionId, collectedKeys })}
              <div class="explore-side">
                ${SourceFinder({ finder })}
                ${DataTraceFlow({
                  caseData,
                  dataKey: state.lastCollectedKey,
                  methodologyStatus: state.methodologyStatus,
                })}
                ${
                  traceItems
                    ? TraceabilityPanel({
                        fields: identificationTraceFields,
                        items: traceItems,
                        kicker: 'Dato del caso',
                      })
                    : ''
                }
                ${CollectedDataPanel({
                  collectedData: state.collectedData,
                  methodologyStatus: state.methodologyStatus,
                  open: true,
                  variant: 'inline',
                })}
              </div>
            `
            : `<section class="panel"><p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p></section>`
        }
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${MethodDataInfo({ caseData, dataKey: state.methodInfoKey })}
      ${SiteFooter()}
    </div>
  `;
}

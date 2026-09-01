import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { CaseDocumentIntro } from '../components/evidence/CaseDocumentIntro.js';
import { GuidedCaseReading } from '../components/evidence/GuidedCaseReading.js';
import { CasePdfViewer, CaseMap } from '../components/evidence/CasePdfViewer.js';
import { getCaseById } from '../data/cases/index.js';
import { caseMapSections } from '../data/evidence/index.js';
import { escapeHtml } from '../utils/escape.js';
import { appCopy } from '../data/copy.js';

export function CaseIntroPage(state) {
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  if (!caseData) return missing(state);
  return wrap(
    state,
    `<main id="contenido" class="page">${CaseDocumentIntro({ caseData, state })}</main>`,
  );
}

export function CaseGuidedPage(state) {
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  if (!caseData) return missing(state);
  return wrap(
    state,
    `<main id="contenido" class="page">${GuidedCaseReading({ state, caseData })}</main>`,
  );
}

export function CaseDocumentPage(state) {
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  if (!caseData) return missing(state);
  return wrap(
    state,
    `<main id="contenido" class="page page--pdf">
      <p class="principle">El PDF es la fuente académica. El JSON solo estructura los datos.</p>
      ${CasePdfViewer({ state, caseData })}
      ${CaseMap({ sections: caseMapSections(caseData) })}
    </main>`,
  );
}

function missing(state) {
  return wrap(
    state,
    `<main id="contenido" class="page">
      <section class="panel">
        <h1>Caso</h1>
        <p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p>
        <a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>
      </section>
    </main>`,
  );
}

function wrap(state, inner) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      ${inner}
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

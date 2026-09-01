import { appCopy } from '../data/copy.js';
import { escapeHtml } from '../utils/escape.js';

export function SourceFinder({ finder }) {
  if (!finder) {
    return '';
  }

  const needed = finder.needed.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const notYet = finder.notYet.map((item) => `<li>${escapeHtml(item)}</li>`).join('');

  return `
    <article class="source-finder">
      <p class="source-finder__kicker">${escapeHtml(appCopy.caseWork.needHeading)}</p>
      <h3 class="source-finder__need">${escapeHtml(finder.need)}</h3>
      <p class="source-finder__look">
        <span>${escapeHtml(appCopy.caseWork.lookHeading)}</span>
        ${escapeHtml(finder.lookIn)}
      </p>
      ${
        finder.lookInSectionId
          ? `<p><a class="btn btn--small btn--ghost-dark" href="#/explorar/${escapeHtml(finder.lookInSectionId)}" data-nav="/explorar/${escapeHtml(finder.lookInSectionId)}">Abrir esta sección del caso</a></p>`
          : ''
      }
      <div class="source-finder__cols">
        <div>
          <h4>${escapeHtml(appCopy.caseWork.needDataHeading)}</h4>
          <ul>${needed}</ul>
        </div>
        <div>
          <h4>${escapeHtml(appCopy.caseWork.notYetHeading)}</h4>
          <ul>${notYet}</ul>
        </div>
      </div>
    </article>
  `;
}

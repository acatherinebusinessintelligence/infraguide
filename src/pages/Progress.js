import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { ProgressManagementPanel } from '../components/progress/ProgressManagementPanel.js';

export function ProgressPage(state) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page progress-page">
        ${ProgressManagementPanel({ state })}
      </main>
      ${DocumentOverlay({ state })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

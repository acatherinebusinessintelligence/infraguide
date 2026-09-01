import { appCopy } from '../data/copy.js';
import { APP_VERSION } from '../config.js';
import { Navigation, NavMenu } from './Navigation.js';
import { BrandLockup } from './Header.js';
import { DocumentPanel } from './DocumentPanel.js';
import { CollectedDataPanel } from './CollectedDataPanel.js';
import { escapeHtml } from '../utils/escape.js';

export function SkipLink() {
  return `<a class="skip-link" href="#contenido">${escapeHtml(appCopy.skipLink)}</a>`;
}

export function SiteFooter() {
  return `
    <footer class="site-footer">
      <p><strong>InfraGuide</strong> · Gestión de la Infraestructura · v${escapeHtml(APP_VERSION)}</p>
      <p>${escapeHtml(appCopy.footer.note)}</p>
    </footer>
  `;
}

export function DocumentOverlay({ state, variant = 'overlay' }) {
  const panel = DocumentPanel({
    open: state.documentPanelOpen,
    collectedData: state.collectedData,
    methodologyStatus: state.methodologyStatus,
    documentEntries: state.documentSections,
    documentViewKey: state.documentViewKey,
    variant,
    readyToExport: Boolean(state.analysis?.build?.readyToExport),
  });

  if (!state.documentPanelOpen && variant === 'overlay') {
    return panel;
  }

  const backdrop = state.documentPanelOpen
    ? '<button class="backdrop backdrop--overlay" type="button" data-action="close-document" aria-label="Cerrar panel del documento"></button>'
    : '';

  return `${panel}${backdrop}`;
}

export function CollectedOverlay({ state }) {
  if (!state.collectedPanelOpen) {
    return '';
  }

  return `
    <button class="backdrop backdrop--overlay" type="button" data-action="toggle-collected" aria-label="${escapeHtml(appCopy.caseWork.closeCollected)}"></button>
    ${CollectedDataPanel({
      collectedData: state.collectedData,
      methodologyStatus: state.methodologyStatus,
      open: true,
      variant: 'drawer',
    })}
  `;
}

export function LandingHeader({ state }) {
  return `
    ${SkipLink()}
    <header class="site-header site-header--hero">
      <div class="site-header__inner site-header__inner--spread">
        ${BrandLockup({ heading: true })}
        ${NavMenu({
          currentView: state.currentView,
          documentPanelOpen: state.documentPanelOpen,
          collectedPanelOpen: state.collectedPanelOpen,
          mobileNavOpen: state.mobileNavOpen,
          selectedCase: state.selectedCase,
        })}
      </div>
    </header>
  `;
}

export function AppHeader({ state }) {
  const returning = state.analysis?.build?.returnSection && state.currentView !== 'build';
  return `
    ${SkipLink()}
    ${Navigation({
      currentView: state.currentView,
      documentPanelOpen: state.documentPanelOpen,
      collectedPanelOpen: state.collectedPanelOpen,
      mobileNavOpen: state.mobileNavOpen,
      selectedCase: state.selectedCase,
      showBrand: true,
    })}
    ${
      returning
        ? `<p class="consultant-tip return-banner">Estás editando una sección del informe. <button class="btn btn--small" type="button" data-action="return-to-preview">Volver a la vista previa</button></p>`
        : ''
    }
  `;
}

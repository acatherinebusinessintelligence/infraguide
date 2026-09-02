import { appCopy } from '../data/copy.js';
import { BrandLockup } from './Header.js';
import { escapeHtml } from '../utils/escape.js';
import { SaveIndicator } from './progress/SaveIndicator.js';

export function NavMenu({
  currentView,
  documentPanelOpen,
  collectedPanelOpen = false,
  mobileNavOpen,
  selectedCase = null,
  progressMenuOpen = false,
}) {
  const items = [
    { id: 'home', label: appCopy.nav.home, path: '/', view: 'home' },
    { id: 'route', label: appCopy.nav.route, path: '/ruta', view: 'dashboard' },
    { id: 'case', label: appCopy.nav.case, path: '/caso', view: 'caseOverview' },
    { id: 'learn', label: appCopy.nav.learn, path: '/aprender', view: 'learn' },
    { id: 'collected', label: appCopy.nav.collected, action: 'collected' },
    { id: 'document', label: appCopy.nav.document, action: 'document' },
    { id: 'progress', label: appCopy.nav.progress, action: 'progress' },
    { id: 'help', label: appCopy.nav.help, path: '/ayuda', view: 'help' },
  ];

  const links = items
    .map((item) => {
      if (item.action === 'document') {
        return `
          <li>
            <button
              class="nav__button${documentPanelOpen ? ' is-active' : ''}"
              type="button"
              data-action="toggle-document"
              aria-expanded="${documentPanelOpen ? 'true' : 'false'}"
              aria-controls="document-panel"
            >
              ${escapeHtml(item.label)}
            </button>
          </li>
        `;
      }

      if (item.action === 'progress') {
        return `
          <li class="nav__item--menu${progressMenuOpen ? ' is-open' : ''}">
            <button
              class="nav__button${currentView === 'progress' ? ' is-active' : ''}"
              type="button"
              data-action="toggle-progress-menu"
              aria-expanded="${progressMenuOpen ? 'true' : 'false'}"
              aria-controls="progress-submenu"
            >
              ${escapeHtml(item.label)}
            </button>
            <ul class="nav__submenu" id="progress-submenu">
              <li><a class="nav__button" href="#/progreso" data-nav="/progreso">Estado del progreso</a></li>
              <li><button class="nav__button" type="button" data-action="export-progress">Guardar copia</button></li>
              <li>
                <label class="nav__button">
                  Cargar copia
                  <input class="visually-hidden" type="file" accept="application/json,.json" data-action="import-progress" />
                </label>
              </li>
              <li><button class="nav__button" type="button" data-action="preview-backup">Restaurar backup</button></li>
              <li><button class="nav__button" type="button" data-action="begin-reset">Reiniciar</button></li>
            </ul>
          </li>
        `;
      }
      if (item.action === 'collected') {
        return `
          <li>
            <button
              class="nav__button${collectedPanelOpen ? ' is-active' : ''}"
              type="button"
              data-action="toggle-collected"
              aria-expanded="${collectedPanelOpen ? 'true' : 'false'}"
              aria-controls="collected-panel"
            >
              ${escapeHtml(item.label)}
            </button>
          </li>
        `;
      }

      const isHomeGroup = item.view === 'home' && (currentView === 'home' || currentView === 'intro');
      const isCaseGroup =
        item.view === 'caseOverview' && (currentView === 'caseOverview' || currentView === 'caseExplore');
      const isRouteGroup =
        item.view === 'dashboard' &&
        (currentView === 'dashboard' ||
          currentView === 'understand' ||
          currentView === 'represent' ||
          currentView === 'measure' ||
          currentView === 'diagnose' ||
          currentView === 'govern' ||
          currentView === 'decide' ||
          currentView === 'build' ||
          currentView === 'export' ||
          currentView === 'reportPreview');
      const isActive = item.view === 'home'
        ? isHomeGroup
        : item.view === 'caseOverview'
          ? isCaseGroup
          : item.view === 'dashboard'
            ? isRouteGroup
            : currentView === item.view;
      const path = item.id === 'case' && !selectedCase ? '/ruta' : item.path;

      return `
        <li>
          <a
            class="nav__button${isActive ? ' is-active' : ''}"
            href="#${path}"
            data-nav="${path}"
            ${isActive ? 'aria-current="page"' : ''}
          >
            ${escapeHtml(item.label)}
          </a>
        </li>
      `;
    })
    .join('');

  return `
    <nav class="nav${mobileNavOpen ? ' is-open' : ''}" aria-label="Principal">
      <button
        class="nav__toggle"
        type="button"
        data-action="toggle-nav"
        aria-expanded="${mobileNavOpen ? 'true' : 'false'}"
        aria-controls="primary-nav"
        aria-label="${escapeHtml(mobileNavOpen ? appCopy.nav.closeMenu : appCopy.nav.menu)}"
      >
        <span class="nav__toggle-bars"></span>
      </button>
      <ul class="nav__list" id="primary-nav">
        ${links}
      </ul>
    </nav>
  `;
}

export function Navigation({
  currentView,
  documentPanelOpen,
  collectedPanelOpen = false,
  mobileNavOpen,
  selectedCase = null,
  progressMenuOpen = false,
  showBrand = true,
  persistence = {},
}) {
  return `
    <div class="topbar">
      <div class="topbar__row">
        ${showBrand ? BrandLockup({ heading: false, compact: true }) : '<span></span>'}
        ${SaveIndicatorSlot(persistence)}
        ${NavMenu({
          currentView,
          documentPanelOpen,
          collectedPanelOpen,
          mobileNavOpen,
          selectedCase,
          progressMenuOpen,
        })}
      </div>
    </div>
  `;
}

function SaveIndicatorSlot(persistence) {
  return `<div class="topbar__save">${SaveIndicator({ persistence })}</div>`;
}

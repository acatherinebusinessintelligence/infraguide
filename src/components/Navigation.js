import { appCopy } from '../data/copy.js';
import { BrandLockup } from './Header.js';
import { escapeHtml } from '../utils/escape.js';

export function NavMenu({
  currentView,
  documentPanelOpen,
  collectedPanelOpen = false,
  mobileNavOpen,
  selectedCase = null,
}) {
  const items = [
    { id: 'home', label: appCopy.nav.home, path: '/', view: 'home' },
    { id: 'route', label: appCopy.nav.route, path: '/ruta', view: 'dashboard' },
    { id: 'case', label: appCopy.nav.case, path: '/caso', view: 'caseOverview' },
    { id: 'collected', label: appCopy.nav.collected, action: 'collected' },
    { id: 'document', label: appCopy.nav.document, action: 'document' },
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
          currentView === 'export');
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
  showBrand = true,
}) {
  return `
    <div class="topbar">
      <div class="topbar__row">
        ${showBrand ? BrandLockup({ heading: false, compact: true }) : '<span></span>'}
        ${NavMenu({
          currentView,
          documentPanelOpen,
          collectedPanelOpen,
          mobileNavOpen,
          selectedCase,
        })}
      </div>
    </div>
  `;
}

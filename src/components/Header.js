import { appCopy } from '../data/copy.js';
import { escapeHtml } from '../utils/escape.js';

export function Header({ compact = true } = {}) {
  const variant = compact ? 'site-header--compact' : 'site-header--hero';
  const headingTag = compact ? 'p' : 'h1';

  return `
    <header class="site-header ${variant}">
      <div class="site-header__inner">
        <a class="site-header__brand" href="#/" data-nav="/">
          ${renderMark()}
          <div class="site-header__texts">
            <p class="site-header__institution">${escapeHtml(appCopy.institution)}</p>
            <${headingTag} class="site-header__name">${escapeHtml(appCopy.name)}</${headingTag}>
            <p class="site-header__subtitle">${escapeHtml(appCopy.subtitle)}</p>
          </div>
        </a>
      </div>
    </header>
  `;
}

export function BrandLockup({ heading = false, compact = false } = {}) {
  const headingTag = heading ? 'h1' : 'p';
  const subtitle = compact
    ? ''
    : `<p class="site-header__subtitle">${escapeHtml(appCopy.subtitle)}</p>`;
  return `
    <a class="site-header__brand" href="#/" data-nav="/">
      ${renderMark()}
      <div class="site-header__texts">
        <p class="site-header__institution">${escapeHtml(appCopy.institution)}</p>
        <${headingTag} class="site-header__name">${escapeHtml(appCopy.name)}</${headingTag}>
        ${subtitle}
      </div>
    </a>
  `;
}

function renderMark() {
  return `
    <svg class="site-header__mark" viewBox="0 0 32 32" aria-hidden="true" focusable="false">
      <rect width="32" height="32" rx="4" fill="#E8F1FA"/>
      <rect x="6" y="6" width="8" height="8" fill="#0B1F3A"/>
      <rect x="18" y="6" width="8" height="8" fill="#2B6CB0"/>
      <rect x="6" y="18" width="8" height="8" fill="#2B6CB0"/>
      <rect x="18" y="18" width="8" height="8" fill="#C9A227"/>
    </svg>
  `;
}

import { appCopy } from '../data/copy.js';
import { getCaseSection, formatFieldValue } from '../data/cases/index.js';
import { DataTag } from './DataTag.js';
import { EvidenceLink } from './evidence/EvidenceLink.js';
import { escapeHtml } from '../utils/escape.js';

export function CaseExplorer({ caseData, sectionId, collectedKeys = new Set() }) {
  if (!caseData) {
    return `<p class="panel__intro">${escapeHtml(appCopy.caseWork.noCaseYet)}</p>`;
  }

  const section = getCaseSection(caseData, sectionId) ?? caseData.sections[0];
  const options = caseData.sections
    .map(
      (item) =>
        `<option value="${escapeHtml(item.sectionId)}" ${item.sectionId === section.sectionId ? 'selected' : ''}>${item.index}. ${escapeHtml(item.sectionTitle)}</option>`,
    )
    .join('');

  const nav = caseData.sections
    .map((item) => {
      const active = item.sectionId === section.sectionId;
      return `
        <li>
          <a
            class="explorer-nav__link${active ? ' is-active' : ''}"
            href="#/explorar/${encodeURIComponent(item.sectionId)}"
            data-nav="/explorar/${item.sectionId}"
            ${active ? 'aria-current="page"' : ''}
          >
            <span>${item.index}</span>
            ${escapeHtml(item.sectionTitle)}
          </a>
        </li>
      `;
    })
    .join('');

  return `
    <div class="explorer">
      <div class="explorer__mobile">
        <label class="explorer__select-label" for="case-section-select">${escapeHtml(appCopy.caseWork.sectionSelectLabel)}</label>
        <select id="case-section-select" class="explorer__select" data-action="change-section">
          ${options}
        </select>
      </div>
      <nav class="explorer-nav" aria-label="${escapeHtml(appCopy.caseWork.explorerTitle)}">
        <ol class="explorer-nav__list">
          ${nav}
        </ol>
      </nav>
      <section class="explorer-content" aria-labelledby="explorer-section-title">
        <p class="explorer-content__kicker">${escapeHtml(appCopy.caseWork.explorerTitle)}</p>
        <h2 id="explorer-section-title">${section.index}. ${escapeHtml(section.sectionTitle)}</h2>
        <p class="explorer-content__summary">${escapeHtml(section.summary || '')}</p>
        ${renderBlocks(section, collectedKeys, caseData)}
      </section>
    </div>
  `;
}

function renderBlocks(section, collectedKeys, caseData) {
  return (section.blocks ?? [])
    .map((block) => {
      if (block.type === 'list') {
        const items = (block.items ?? []).map((item) => `<li>${escapeHtml(item)}</li>`).join('');
        return `
          <div class="explorer-block">
            ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}
            <ul class="explorer-list">${items}</ul>
          </div>
        `;
      }

      if (block.type === 'records') {
        const records = (block.records ?? [])
          .map((record) => {
            return `
              <article class="explorer-record">
                <h4>${escapeHtml(record.title)}</h4>
                <div class="data-tag-grid">
                  ${renderFields(record.fields ?? [], section, collectedKeys, caseData)}
                </div>
              </article>
            `;
          })
          .join('');
        return `
          <div class="explorer-block">
            ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}
            ${records}
          </div>
        `;
      }

      return `
        <div class="explorer-block">
          ${block.title ? `<h3>${escapeHtml(block.title)}</h3>` : ''}
          <div class="data-tag-grid">
            ${renderFields(block.fields ?? [], section, collectedKeys, caseData)}
          </div>
        </div>
      `;
    })
    .join('');
}

function renderFields(fields, section, collectedKeys, caseData) {
  return fields
    .map((field) => {
      if (field.usable) {
        return DataTag({
          field,
          section,
          collected: collectedKeys.has(field.key),
        });
      }
      return `
        <div class="data-plain" data-evidence-field="${escapeHtml(field.key)}">
          <p class="data-plain__label">${escapeHtml(field.label)}</p>
          <p class="data-plain__value">${escapeHtml(formatFieldValue(field))}</p>
          ${EvidenceLink({ caseData, fieldKey: field.key, component: 'explorer' })}
        </div>
      `;
    })
    .join('');
}

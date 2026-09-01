import { escapeHtml } from '../../utils/escape.js';
import { getGlossaryTerm, glossaryTerms } from '../../data/pedagogy/glossary.js';

export function GlossaryDrawer({ termId }) {
  if (!termId) return '';
  if (termId === 'index') {
    return `
    <div class="glossary-drawer" role="dialog" aria-modal="true" aria-labelledby="glossary-title">
      <button class="backdrop backdrop--overlay" type="button" data-action="close-glossary" aria-label="Cerrar glosario"></button>
      <article class="glossary-panel">
        <h2 id="glossary-title">Glosario contextual</h2>
        <p>Abre un término sin salir de la actividad.</p>
        <ul class="glossary-index">
          ${glossaryTerms.map((term) => `<li><button class="term-link" type="button" data-action="open-glossary" data-term="${escapeHtml(term.id)}">${escapeHtml(term.term)}</button></li>`).join('')}
        </ul>
        <button class="btn btn--primary" type="button" data-action="close-glossary">Cerrar</button>
      </article>
    </div>
  `;
  }
  const item = getGlossaryTerm(termId);
  if (!item) return '';
  return `
    <div class="glossary-drawer" role="dialog" aria-modal="true" aria-labelledby="glossary-title">
      <button class="backdrop backdrop--overlay" type="button" data-action="close-glossary" aria-label="Cerrar glosario"></button>
      <article class="glossary-panel">
        <h2 id="glossary-title">${escapeHtml(item.term)}</h2>
        <p>${escapeHtml(item.definition)}</p>
        <p><strong>Para qué se usa aquí:</strong> ${escapeHtml(item.use)}</p>
        <button class="btn btn--primary" type="button" data-action="close-glossary">Cerrar</button>
        <details>
          <summary>Ver más términos</summary>
          <ul class="glossary-index">
            ${glossaryTerms.map((term) => `<li><button class="term-link" type="button" data-action="open-glossary" data-term="${escapeHtml(term.id)}">${escapeHtml(term.term)}</button></li>`).join('')}
          </ul>
        </details>
      </article>
    </div>
  `;
}

export function GlossaryIndex() {
  return `
    <section class="builder-card glossary-card">
      <h3>Glosario contextual</h3>
      <p>Abre un término sin salir de la actividad.</p>
      <div class="chip-grid">
        ${glossaryTerms
          .map(
            (term) =>
              `<button class="btn btn--small" type="button" data-action="open-glossary" data-term="${escapeHtml(term.id)}">${escapeHtml(term.term)}</button>`,
          )
          .join('')}
      </div>
    </section>
  `;
}

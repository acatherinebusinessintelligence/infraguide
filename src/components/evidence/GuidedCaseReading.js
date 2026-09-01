import { escapeHtml } from '../../utils/escape.js';
import { guidedReadingSteps } from '../../data/evidence/guidedReading.js';
import { getEvidenceForSection, getPrimarySourceDocument, caseMapSections } from '../../data/evidence/index.js';
import { EvidenceLink } from './EvidenceLink.js';
import { CaseMap } from './CasePdfViewer.js';

export function GuidedCaseReading({ state, caseData }) {
  const stepId = Number(state.caseReading?.guidedStep) || 1;
  const step = guidedReadingSteps.find((item) => item.id === stepId) ?? guidedReadingSteps[0];
  const examples = getEvidenceForSection(caseData, step.sourceSectionId).slice(0, 4);
  const doc = getPrimarySourceDocument(caseData);
  const nav = guidedReadingSteps
    .map(
      (item) => `
        <li>
          <button
            class="substage-link${item.id === step.id ? ' is-active' : ''}"
            type="button"
            data-action="guided-step"
            data-step="${item.id}"
          >${item.id}. ${escapeHtml(item.title)}</button>
        </li>
      `,
    )
    .join('');

  const look = step.lookFor.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const extra = step.extraSectionId
    ? getEvidenceForSection(caseData, step.extraSectionId).slice(0, 2)
    : [];
  const exampleItems = [...examples, ...extra]
    .map(
      (item) => `
        <li>
          <strong>${escapeHtml(item.label)}</strong>
          <span>${escapeHtml(item.value)}</span>
          ${EvidenceLink({ caseData, fieldKey: item.fieldKey, component: 'guided-reading', activity: `paso-${step.id}` })}
        </li>
      `,
    )
    .join('');

  return `
    <section class="guided-reading" aria-labelledby="guided-title">
      <p class="guided-kicker">Lectura guiada</p>
      <h1 id="guided-title">Localiza la información en el documento fuente</h1>
      <p>Helados Boreal puede usarse como caso modelo, pero InfraGuide no entrega el análisis resuelto. Tú localizas, registras y explicas.</p>
      <ol class="substage-nav">${nav}</ol>
      <article class="panel">
        <h2>Paso ${step.id} — ${escapeHtml(step.title)}</h2>
        <p><strong>Busca en el PDF</strong>${doc?.linked === false ? ' (cuando el documento original esté vinculado)' : ''}:</p>
        <ul>${look}</ul>
        <p>${escapeHtml(step.why)}</p>
        <div class="guided-split">
          <section class="example-box">
            <h3>Ejemplo guiado</h3>
            <p>Datos ya estructurados en el JSON del caso modelo. Comprueba su origen con el vínculo de evidencia.</p>
            <ul class="guided-examples">${exampleItems || '<li>No hay ejemplos de esta sección.</li>'}</ul>
          </section>
          <section class="panel">
            <h3>Trabajo del estudiante</h3>
            <ol>
              <li>Abre el PDF y busca la sección.</li>
              <li>Selecciona la evidencia subrayada.</li>
              <li>Registra el dato en tus datos recolectados.</li>
              <li>Explica por qué es relevante para el análisis.</li>
            </ol>
            <label for="guided-note">Por qué es relevante</label>
            <textarea id="guided-note" rows="4" data-action-blur="guided-note" data-scope="case-reading" data-draft="notes.${step.id}">${escapeHtml(state.caseReading?.notes?.[step.id] || '')}</textarea>
          </section>
        </div>
        <div class="substage-footer">
          ${
            step.id > 1
              ? `<button class="btn btn--ghost-dark" type="button" data-action="guided-step" data-step="${step.id - 1}">Anterior</button>`
              : '<span></span>'
          }
          <button class="btn btn--primary" type="button" data-action="open-case-pdf" data-section-id="${escapeHtml(step.sourceSectionId)}">Abrir esta sección en el PDF</button>
          ${
            step.id < guidedReadingSteps.length
              ? `<button class="btn btn--primary" type="button" data-action="guided-step" data-step="${step.id + 1}">Siguiente</button>`
              : `<a class="btn btn--primary" href="#/comprender" data-nav="/comprender">Comenzar COMPRENDER</a>`
          }
        </div>
      </article>
      ${CaseMap({ sections: caseMapSections(caseData) })}
    </section>
  `;
}

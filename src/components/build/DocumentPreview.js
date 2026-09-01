import { escapeHtml } from '../../utils/escape.js';
import {
  conclusionTemplate,
  conclusionHints,
  strengthOptions,
  limitationOptions,
  PREVIEW_MODES,
  metricSubsections,
} from '../../data/methodology/build.js';
import { restrictionItems } from '../../data/methodology/understand.js';
import { categoryLabel, criticalityLabel } from '../../state/diagnoseModel.js';
import { costLabel, metricLabel, priorityLabel } from '../../state/decideModel.js';
import {
  itilPracticeLabel,
  cobitResponsibleLabel,
  cobitIndicatorLabel,
  isoAssetLabel,
  isoThreatLabel,
  isoVulnLabel,
  itilIndicatorLabel,
} from '../../state/governModel.js';
import { baseEvidenceCatalog } from '../../data/methodology/diagnose.js';
import { getDiagramNode } from '../../state/representModel.js';
import { getCaseById } from '../../data/cases/index.js';

function evidenceLabel(id) {
  return baseEvidenceCatalog.find((item) => item.id === id)?.datum ?? id;
}

function academic(mode) {
  return mode === PREVIEW_MODES.academic;
}

export function ConclusionsBuilder({ draft, findings = [], recommendations = [], constraints = [], warnings = [], error = '' }) {
  const findingChips = findings
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-finding" data-id="${escapeHtml(item.findingId)}" ${draft.selectedFindings.includes(item.findingId) ? 'checked' : ''} />
          ${escapeHtml(item.title)}
        </label>
      `,
    )
    .join('');
  const strengthChips = strengthOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-strength" data-id="${escapeHtml(item.id)}" ${draft.selectedStrengths.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  const constraintChips = (constraints.length ? constraints : restrictionItems)
    .map((item) => {
      const id = item.id;
      const label = item.label;
      return `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-constraint" data-id="${escapeHtml(id)}" ${draft.constraintIds.includes(id) ? 'checked' : ''} />
          ${escapeHtml(label)}
        </label>
      `;
    })
    .join('');
  const priorityChips = recommendations
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-priority" data-id="${escapeHtml(item.decisionId)}" ${draft.priorities.includes(item.decisionId) ? 'checked' : ''} />
          ${escapeHtml(priorityLabel(item.priority))} · ${escapeHtml(item.decision)}
        </label>
      `,
    )
    .join('');
  const limitChips = limitationOptions
    .map(
      (item) => `
        <label class="chip-option">
          <input type="checkbox" data-action="toggle-conc-limit" data-id="${escapeHtml(item.id)}" ${draft.limitations.includes(item.id) ? 'checked' : ''} />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  const template = conclusionTemplate.map((line) => `<li>${escapeHtml(line)}</li>`).join('');
  return `
    <section class="finding-builder">
      <h2>ConclusionsBuilder</h2>
      <p>Las conclusiones sintetizan estado, riesgos, patrones, madurez, prioridades y relación con el negocio. No son un resumen de tablas ni una lista de compras.</p>
      <p class="consultant-tip">${escapeHtml(conclusionHints.strengths)}</p>
      <fieldset><legend>Paso 1 · 3 a 5 hallazgos principales</legend><div class="chip-grid">${findingChips}</div></fieldset>
      <fieldset><legend>Paso 2 · 2 a 3 fortalezas (no se agregan solas)</legend><div class="chip-grid">${strengthChips}</div></fieldset>
      <fieldset><legend>Paso 3 · Restricciones</legend><div class="chip-grid">${constraintChips}</div></fieldset>
      <fieldset><legend>Paso 4 · Prioridades estratégicas</legend><div class="chip-grid">${priorityChips || '<p>Guarda recomendaciones en DECIDIR primero.</p>'}</div></fieldset>
      <fieldset>
        <legend>Paso 5 · Limitaciones del análisis</legend>
        <p class="consultant-tip">${escapeHtml(conclusionHints.limits)}</p>
        <div class="chip-grid">${limitChips}</div>
        <label>Detalle opcional<textarea rows="2" data-draft="conclusions.limitationText" data-scope="build">${escapeHtml(draft.limitationText)}</textarea></label>
      </fieldset>
      <details class="example-box">
        <summary>Estructura orientadora (no se llena sola)</summary>
        <ol>${template}</ol>
        <p>${escapeHtml(conclusionHints.length)}</p>
      </details>
      <label>Paso 6 · Conclusión<textarea rows="10" data-draft="conclusions.draft" data-scope="build">${escapeHtml(draft.draft)}</textarea></label>
      ${warnings.map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`).join('')}
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="save-conclusions">Agregar 14. Conclusiones al documento</button>
    </section>
  `;
}

export function DocumentPreview({ state, assembled, build, findings = [], recommendations = [] }) {
  const caseData = state.selectedCase?.id ? getCaseById(state.selectedCase.id) : null;
  const mode = build.previewMode || PREVIEW_MODES.academic;
  const indexOpen = build.indexOpen !== false;
  const index = assembled
    .map((section) => `<li><a href="#doc-sec-${escapeHtml(section.key)}" data-action="scroll-doc-section" data-section-key="${escapeHtml(section.key)}">${section.id}. ${escapeHtml(section.title)}</a></li>`)
    .join('');
  const sections = assembled.map((section) => renderPreviewSection(section, { state, mode, findings, recommendations, build })).join('');
  return `
    <article class="report" aria-label="Vista previa del informe">
      <div class="preview-toolbar">
        <div class="chip-grid" role="group" aria-label="Modo de vista previa">
          <button class="btn btn--small${mode === PREVIEW_MODES.academic ? ' btn--primary' : ''}" type="button" data-action="preview-mode" data-mode="academic">Modo académico</button>
          <button class="btn btn--small${mode === PREVIEW_MODES.document ? ' btn--primary' : ''}" type="button" data-action="preview-mode" data-mode="document">Modo documento</button>
        </div>
        <button class="btn btn--small" type="button" data-action="toggle-doc-index" aria-expanded="${indexOpen ? 'true' : 'false'}" aria-controls="report-index">Índice</button>
        <button class="btn btn--small" type="button" data-action="mark-preview-reviewed">He revisado la vista previa</button>
      </div>
      ${renderCover(caseData)}
      <nav id="report-index" class="report-index${indexOpen ? '' : ' is-collapsed'}" aria-label="Índice del informe">
        <h2>Índice</h2>
        <ol>${index}</ol>
      </nav>
      ${sections}
    </article>
  `;
}

function renderCover(caseData) {
  const today = new Date().toLocaleDateString('es-CO');
  return `
    <header class="report-cover">
      <p class="report-kicker">GESTIÓN DE LA INFRAESTRUCTURA</p>
      <h1>Análisis del Caso Técnico</h1>
      <p><strong>Caso:</strong> ${escapeHtml(caseData?.name || 'Helados Boreal S.A.S.')}</p>
      <p><strong>Sector:</strong> ${escapeHtml(caseData?.sector || 'Producción y comercialización de alimentos congelados.')}</p>
      <p>Documento construido con InfraGuide.</p>
      <p>Fecha local: ${escapeHtml(today)}</p>
    </header>
  `;
}

function editButton(section) {
  return `<button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-from-preview" data-section-key="${escapeHtml(section.key)}" data-path="${escapeHtml(section.editPath)}" aria-label="${escapeHtml(section.editLabel)}">${escapeHtml(section.editLabel)}</button>`;
}

function renderPreviewSection(section, ctx) {
  const body = sectionBody(section, ctx);
  return `
    <section class="report-section" id="doc-sec-${escapeHtml(section.key)}">
      <div class="report-section__head">
        <h2>${section.id}. ${escapeHtml(section.title)}</h2>
        ${editButton(section)}
      </div>
      ${body}
    </section>
  `;
}

function sectionBody(section, ctx) {
  const { mode, state, findings, recommendations, build } = ctx;
  if (section.key === 'asis') return renderAsIs(section, mode, state);
  if (section.key === 'metrics') return renderMetrics(section, mode, state);
  if (section.key === 'findings') return renderFindings(section, findings, mode);
  if (section.key === 'itil') return renderItil(state, mode);
  if (section.key === 'cobit') return renderCobit(state, mode);
  if (section.key === 'iso27001') return renderIso(state, mode);
  if (section.key === 'capex') return renderCapex(recommendations, mode);
  if (section.key === 'recommendations') return renderRecs(recommendations, findings, build, mode);
  if (section.key === 'conclusions') return renderConclusions(section, mode, state);
  if (section.key === 'spof') return renderSpof(section, mode);
  if (section.key === 'inventory') return renderInventory(section, mode);
  if (section.key === 'criticalServices') return renderCritical(section, mode);
  return `
    <div class="report-prose">${escapeHtml(section.text || 'Sección pendiente. InfraGuide no inventa este análisis.')}</div>
    ${academic(mode) && section.sources?.length ? `<p class="academic-note">Fuentes: ${escapeHtml(section.sources.join(', '))}</p>` : ''}
  `;
}

function renderAsIs(section, mode, state) {
  const chains = section.chains?.length ? section.chains : Object.entries(state.analysis?.represent?.asIs?.chains ?? {}).map(([id, nodeIds]) => ({ serviceId: id, nodeIds }));
  const diagrams = chains
    .map((chain) => {
      const steps = (chain.nodeIds ?? [])
        .map((id) => {
          const node = getDiagramNode(id);
          const source = academic(mode) && node ? ` (${escapeHtml(node.sourceLabel)})` : '';
          return `<li>${escapeHtml(node?.name || id)}${source}</li>`;
        })
        .join('');
      return `<ol class="asis-static" aria-label="Cadena AS-IS">${steps || '<li>Sin cadena documentada.</li>'}</ol>`;
    })
    .join('');
  return `
    <p>El diagrama representa únicamente el estado actual (AS-IS). No incluye controles interactivos.</p>
    ${diagrams}
    <div class="report-prose">${escapeHtml(section.text || state.analysis?.represent?.asIs?.description || '')}</div>
  `;
}

function renderMetrics(section, mode, state) {
  const sub = section.subsections || {};
  const blocks = metricSubsections
    .filter((item) => sub[item.id] || state.analysis?.measure?.[item.id]?.result != null)
    .map((meta) => {
      const entry = sub[meta.id] || {};
      const slot = state.analysis?.measure?.[meta.id] || {};
      const result = entry.result || (slot.result != null ? String(slot.result) : '—');
      return `
        <article class="metric-block">
          <h3>${escapeHtml(meta.number)} ${escapeHtml(meta.title)}</h3>
          <p><strong>Datos utilizados:</strong> ${escapeHtml(entry.data || (slot.sourceKeys ?? []).join(', ') || '—')}</p>
          <p><strong>Fórmula:</strong> ${escapeHtml(entry.formula || '—')}</p>
          <p><strong>Cálculo:</strong> ${escapeHtml(entry.substitution || '—')}</p>
          <p class="metric-result"><strong>Resultado:</strong> ${escapeHtml(result)}</p>
          <p><strong>Interpretación:</strong> ${escapeHtml(entry.interpretation || entry.text || slot.draft || '—')}</p>
          <p><strong>Limitaciones:</strong> ${escapeHtml(entry.limitation || slot.limitation || '—')}</p>
          ${academic(mode) ? `<p class="academic-note">Fuente: ${escapeHtml((entry.sources || []).join(', ') || 'Información operacional disponible')}</p>` : ''}
        </article>
      `;
    })
    .join('');
  return `<div>${blocks || `<div class="report-prose">${escapeHtml(section.text || '')}</div>`}</div>`;
}

function renderFindings(section, findings, mode) {
  const rows = findings
    .map(
      (item, index) => `
        <tr>
          <th scope="row">${index + 1}</th>
          <td>${escapeHtml(item.title)}</td>
          <td>${escapeHtml(categoryLabel(item.category))}</td>
          <td>${escapeHtml((item.evidenceIds ?? []).map(evidenceLabel).join('; '))}</td>
          <td>${escapeHtml(item.impact)}</td>
          <td>${escapeHtml(criticalityLabel(item.criticality))}</td>
        </tr>
      `,
    )
    .join('');
  return `
    <div class="matrix-table-wrap">
      <table class="matrix-table">
        <thead>
          <tr>
            <th scope="col">#</th>
            <th scope="col">Hallazgo</th>
            <th scope="col">Categoría</th>
            <th scope="col">Evidencia</th>
            <th scope="col">Impacto</th>
            <th scope="col">Criticidad</th>
          </tr>
        </thead>
        <tbody>${rows || '<tr><td colspan="6">Sin hallazgos documentados.</td></tr>'}</tbody>
      </table>
    </div>
    <div class="matrix-cards">${findings.map((item) => `<article class="matrix-card"><h4>${escapeHtml(item.title)}</h4><p>${escapeHtml(item.impact)}</p></article>`).join('')}</div>
    ${academic(mode) ? `<p class="academic-note">Cada hallazgo conserva su fuente en DIAGNOSTICAR.</p>` : ''}
    ${section.text ? `<div class="report-prose">${escapeHtml(section.text)}</div>` : ''}
  `;
}

function renderItil(state, mode) {
  const rows = (state.analysis?.govern?.itil ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.situation)}</td>
          <td>${escapeHtml(item.practiceLabel || itilPracticeLabel(item.practice))}</td>
          <td>${escapeHtml(item.action)}</td>
          <td>${escapeHtml(item.benefit)}</td>
          <td>${escapeHtml(itilIndicatorLabel(item.indicator) || item.indicator || '—')}</td>
        </tr>
      `,
    )
    .join('');
  return tableWrap(
    ['Situación', 'Práctica', 'Acción', 'Beneficio', 'Indicador'],
    rows,
    academic(mode) ? 'ITIL gestiona el servicio a partir de un hallazgo, no al revés.' : '',
  );
}

function renderCobit(state, mode) {
  const rows = (state.analysis?.govern?.cobit ?? [])
    .map((item) => {
      const resp = (item.responsibleIds ?? []).map(cobitResponsibleLabel).join(', ') || item.responsible || '—';
      return `
        <tr>
          <td>${escapeHtml(item.problem)}</td>
          <td>${escapeHtml(item.decision)}</td>
          <td>${escapeHtml(resp)}</td>
          <td>${escapeHtml(cobitIndicatorLabel(item.indicator) || item.indicator || '—')}</td>
        </tr>
      `;
    })
    .join('');
  return tableWrap(['Problema', 'Decisión', 'Responsable', 'Indicador'], rows, academic(mode) ? 'COBIT gobierna: quién decide y con qué control.' : '');
}

function renderIso(state, mode) {
  const rows = (state.analysis?.govern?.iso27001 ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(isoAssetLabel(item.assetId) || item.assetId)}</td>
          <td>${escapeHtml(isoThreatLabel(item.threatId) || item.threatId)}</td>
          <td>${escapeHtml(isoVulnLabel(item.vulnerabilityId) || item.vulnerabilityId)}</td>
          <td>${escapeHtml(item.impact)}</td>
          <td>${escapeHtml(item.control)}</td>
        </tr>
      `,
    )
    .join('');
  return tableWrap(['Activo', 'Amenaza', 'Vulnerabilidad', 'Impacto', 'Control'], rows, academic(mode) ? 'ISO 27001 trata el riesgo sobre la información.' : '');
}

function renderCapex(recommendations, mode) {
  const rows = recommendations
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.title || item.decision)}</td>
          <td>${escapeHtml(costLabel(item.costModel))}</td>
          <td>${escapeHtml(item.costJustification)}</td>
        </tr>
      `,
    )
    .join('');
  return tableWrap(['Recomendación', 'CAPEX/OPEX', 'Justificación'], rows, academic(mode) ? 'CAPEX/OPEX informa; no elige solo la alternativa.' : '');
}

function renderRecs(recommendations, findings, build, mode) {
  const rows = recommendations
    .map((item) => {
      const linked = findings.filter((finding) => (item.findingIds ?? []).includes(finding.findingId)).map((finding) => finding.title);
      return `
        <tr>
          <td>${escapeHtml(priorityLabel(item.priority))}</td>
          <td>${escapeHtml(item.decision)}</td>
          <td>${escapeHtml(linked.join(' · '))}</td>
          <td>${escapeHtml(item.benefitText)}</td>
          <td>${escapeHtml(item.metricText || (item.metricIds ?? []).map(metricLabel).join(', '))}</td>
        </tr>
      `;
    })
    .join('');
  const cards = recommendations
    .map((item) => {
      const expanded = build.expandedRecId === item.decisionId;
      return `
        <article class="matrix-card">
          <button type="button" class="matrix-card__head" data-action="expand-preview-rec" data-rec-id="${escapeHtml(item.decisionId)}" aria-expanded="${expanded ? 'true' : 'false'}">
            <strong>${escapeHtml(priorityLabel(item.priority))}</strong>
            <span>${escapeHtml(item.decision)}</span>
          </button>
          ${
            expanded
              ? `<p><strong>Evidencia:</strong> ${escapeHtml((item.evidenceIds ?? []).map(evidenceLabel).join('; '))}</p>
                 <p><strong>Riesgo introducido:</strong> ${escapeHtml(item.riskText || '—')}</p>
                 <p><strong>Alternativas:</strong> ${escapeHtml((item.alternatives ?? []).map((alt) => alt.title).join(' / ') || '—')}</p>
                 <p><strong>Justificación:</strong> ${escapeHtml(item.justification)}</p>`
              : ''
          }
        </article>
      `;
    })
    .join('');
  return `
    ${tableWrap(['Prioridad', 'Recomendación', 'Hallazgo', 'Beneficio', 'Métrica'], rows, '')}
    <div class="matrix-cards">${cards}</div>
    ${academic(mode) ? '<p class="academic-note">Expande cada fila para evidencia, riesgo, alternativas y justificación.</p>' : ''}
  `;
}

function renderConclusions(section, mode, state) {
  const extra = section.entry || {};
  const limits = (extra.limitations ?? []).join('; ');
  return `
    <div class="report-prose">${escapeHtml(section.text || 'Conclusiones pendientes. No se generan solas.')}</div>
    ${
      limits
        ? `<h3>Limitaciones del análisis</h3><p>${escapeHtml(limits)}</p>`
        : ''
    }
    ${academic(mode) && extra.selectedFindings?.length ? `<p class="academic-note">Hallazgos de síntesis: ${escapeHtml(extra.selectedFindings.join(', '))}</p>` : ''}
    ${academic(mode) && extra.selectedStrengths?.length ? `<p class="academic-note">Fortalezas declaradas: ${escapeHtml(extra.selectedStrengths.join(', '))}</p>` : ''}
  `;
}

function renderSpof(section, mode) {
  const rows = (section.rows ?? [])
    .map((row) => `<tr><td>${escapeHtml(row.name)}</td><td>${escapeHtml(row.impact || '')}</td><td>${escapeHtml(row.justification || '')}</td>${academic(mode) ? `<td>${escapeHtml(row.evidence || row.sourceLabel || '')}</td>` : ''}</tr>`)
    .join('');
  const headers = academic(mode) ? ['Componente', 'Impacto', 'Justificación', 'Evidencia'] : ['Componente', 'Impacto', 'Justificación'];
  return tableWrap(headers, rows, '');
}

function renderInventory(section, mode) {
  const rows = (section.rows ?? [])
    .map((row) => `<tr><td>${escapeHtml(row.name || row.label || '')}</td><td>${escapeHtml(row.justification || row.type || '')}</td></tr>`)
    .join('');
  return `${tableWrap(['Componente', 'Relevancia'], rows, academic(mode) ? (section.sources || []).join(', ') : '')}${section.text ? `<div class="report-prose">${escapeHtml(section.text)}</div>` : ''}`;
}

function renderCritical(section, mode) {
  const rows = (section.rows ?? [])
    .map((row) => `<tr><td>${escapeHtml(row.name || row.label || '')}</td><td>${escapeHtml(row.justification || '')}</td></tr>`)
    .join('');
  return `${tableWrap(['Servicio', 'Justificación'], rows, '')}${section.text ? `<div class="report-prose">${escapeHtml(section.text)}</div>` : ''}`;
}

function tableWrap(headers, rows, note) {
  const head = headers.map((item) => `<th scope="col">${escapeHtml(item)}</th>`).join('');
  return `
    <div class="matrix-table-wrap">
      <table class="matrix-table">
        <thead><tr>${head}</tr></thead>
        <tbody>${rows || `<tr><td colspan="${headers.length}">Sin filas documentadas. No se inventa contenido.</td></tr>`}</tbody>
      </table>
    </div>
    ${note ? `<p class="academic-note">${escapeHtml(note)}</p>` : ''}
  `;
}

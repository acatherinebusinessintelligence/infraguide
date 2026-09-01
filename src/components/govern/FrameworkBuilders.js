import { escapeHtml } from '../../utils/escape.js';
import {
  itilPractices,
  itilIndicators,
  cobitResponsibles,
  cobitIndicators,
  isoAssets,
  isoThreats,
  isoVulnerabilities,
  isoControlTypes,
  pedagogicalItil,
  pedagogicalCobit,
  pedagogicalIso,
  governActivities,
} from '../../data/methodology/govern.js';
import { itilPracticeLabel, cobitIndicatorLabel, itilIndicatorLabel, GOVERN_STATUS_LABEL } from '../../state/governModel.js';
import { FindTheData } from '../FindTheData.js';
import { TraceabilityChain } from './GovernanceFindingBank.js';

function liveWarnings(warnings = []) {
  if (!warnings.length) return '';
  return `<div aria-live="polite">${warnings.map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`).join('')}</div>`;
}

function examplesBlock(items, render) {
  return `
    <details class="example-box">
      <summary>Ejemplos metodológicos (no se insertan solos)</summary>
      ${items.map(render).join('')}
    </details>
  `;
}

export function ITILAnalysisBuilder({ govern, finding, error }) {
  const draft = govern.itilDraft;
  const steps = [
    { id: 1, label: 'Hallazgo / situación' },
    { id: 2, label: 'Práctica ITIL' },
    { id: 3, label: 'Acción' },
    { id: 4, label: 'Beneficio' },
    { id: 5, label: 'Indicador' },
    { id: 6, label: 'Guardar' },
  ];
  const nav = steps
    .map(
      (step) => `
        <li>
          <button class="builder-step${draft.step === step.id ? ' is-active' : ''}" type="button" data-action="itil-step" data-step="${step.id}">
            <span>${step.id}</span> ${escapeHtml(step.label)}
          </button>
        </li>
      `,
    )
    .join('');

  return `
    <section class="finding-builder" aria-labelledby="itil-builder-title">
      <h3 id="itil-builder-title">ITIL — ¿Cómo gestionamos mejor el servicio?</h3>
      <p>No se enseña ITIL como teoría extensa. Se elige práctica, acción, beneficio e indicador.</p>
      <ol class="builder-nav">${nav}</ol>
      <div class="finding-layout">
        <div class="finding-main">${renderItilStep(draft.step, draft, govern, finding, error)}</div>
        <aside class="finding-side">
          ${TraceabilityChain({
            finding,
            framework: 'ITIL',
            analysis: draft.practice ? itilPracticeLabel(draft.practice) : '',
            documentTarget: '11. ITIL',
          })}
        </aside>
      </div>
    </section>
  `;
}

function renderItilStep(step, draft, govern, finding, error) {
  if (step === 1) {
    return `
      <h4>Hallazgo / situación</h4>
      <p>${finding ? escapeHtml(finding.title) : 'Selecciona un hallazgo en el banco.'}</p>
      <p>${finding ? escapeHtml(finding.description) : ''}</p>
      <label>
        Situación a gestionar
        <textarea rows="3" data-draft="itilDraft.situation" data-scope="govern">${escapeHtml(draft.situation)}</textarea>
      </label>
    `;
  }
  if (step === 2) {
    const options = itilPractices
      .map(
        (item) => `
          <label class="chip-option">
            <input type="radio" name="itil-practice" data-action="itil-practice" value="${escapeHtml(item.id)}" ${draft.practice === item.id ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        `,
      )
      .join('');
    return `
      <h4>Práctica ITIL</h4>
      ${FindTheData({ activities: [governActivities.itilBackupPractice], answers: govern.activities })}
      <fieldset><legend>Selecciona la práctica</legend><div class="chip-grid">${options}</div></fieldset>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 3) {
    return `
      <h4>Acción</h4>
      ${FindTheData({ activities: [governActivities.itilBackupAction], answers: govern.activities })}
      <label>
        Acción (no se autogenera)
        <textarea rows="3" data-draft="itilDraft.action" data-scope="govern" placeholder="Ejemplo: configurar monitoreo automático y alerta/ticket ante fallo.">${escapeHtml(draft.action)}</textarea>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 4) {
    return `
      <h4>Beneficio</h4>
      <p>Ejemplos: reducir tiempo de detección; mejorar trazabilidad; permitir respuesta más rápida. Evita “mejorar TI”.</p>
      <label>
        ¿Qué beneficio esperas?
        <textarea rows="3" data-draft="itilDraft.benefit" data-scope="govern">${escapeHtml(draft.benefit)}</textarea>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 5) {
    const options = itilIndicators
      .map((item) => `<option value="${escapeHtml(item.id)}" ${draft.indicator === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
      .join('');
    return `
      <h4>Indicador opcional</h4>
      <label>
        Indicador
        <select data-action="itil-indicator">
          <option value="">Sin indicador todavía</option>
          ${options}
        </select>
      </label>
    `;
  }
  return `
    <h4>Guardar análisis ITIL</h4>
    ${examplesBlock(
      pedagogicalItil,
      (item) => `
        <article class="example-card">
          <p><strong>Hallazgo:</strong> ${escapeHtml(item.finding)}</p>
          <p><strong>Práctica:</strong> ${escapeHtml(item.practice)}</p>
          <p><strong>Acción:</strong> ${escapeHtml(item.action)}</p>
        </article>
      `,
    )}
    ${error ? `<p class="form-error" role="status">${escapeHtml(error)}</p>` : ''}
    ${liveWarnings(draft.warnings)}
    <button class="btn btn--primary" type="button" data-action="save-itil">Guardar situación ITIL</button>
  `;
}

export function GovernanceAnalysisBuilder({ govern, finding, error }) {
  const draft = govern.cobitDraft;
  const steps = [
    { id: 1, label: 'Problema' },
    { id: 2, label: 'Decisión de gobierno' },
    { id: 3, label: 'Responsable' },
    { id: 4, label: 'Indicador' },
    { id: 5, label: 'Guardar' },
  ];
  const nav = steps
    .map(
      (step) => `
        <li>
          <button class="builder-step${draft.step === step.id ? ' is-active' : ''}" type="button" data-action="cobit-step" data-step="${step.id}">
            <span>${step.id}</span> ${escapeHtml(step.label)}
          </button>
        </li>
      `,
    )
    .join('');
  return `
    <section class="finding-builder" aria-labelledby="cobit-builder-title">
      <h3 id="cobit-builder-title">COBIT — ¿Quién decide y cómo se controla?</h3>
      <p>GESTIÓN ejecuta. GOBIERNO evalúa, dirige y monitorea.</p>
      <p class="edm-flow">EVALUAR → DIRIGIR → MONITOREAR</p>
      <ol class="builder-nav">${nav}</ol>
      <div class="finding-layout">
        <div class="finding-main">${renderCobitStep(draft.step, draft, finding, error)}</div>
        <aside class="finding-side">
          ${TraceabilityChain({
            finding,
            framework: 'COBIT',
            analysis: draft.decision,
            documentTarget: '12. COBIT',
          })}
        </aside>
      </div>
    </section>
  `;
}

function renderCobitStep(step, draft, finding, error) {
  if (step === 1) {
    return `
      <h4>Problema</h4>
      <p>${finding ? escapeHtml(finding.title) : 'Selecciona un hallazgo.'}</p>
      <label>
        Problema de gobierno
        <textarea rows="3" data-draft="cobitDraft.problem" data-scope="govern" placeholder="Ejemplo: no existe planeación formal de capacidad.">${escapeHtml(draft.problem)}</textarea>
      </label>
    `;
  }
  if (step === 2) {
    return `
      <h4>Decisión de gobierno</h4>
      <p>No escribas “reiniciar servidor”. Eso es gestión.</p>
      <label>
        Decisión
        <textarea rows="3" data-draft="cobitDraft.decision" data-scope="govern" placeholder="Ejemplo: definir criterios y periodicidad de revisión de capacidad.">${escapeHtml(draft.decision)}</textarea>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 3) {
    const options = cobitResponsibles
      .map(
        (item) => `
          <label class="chip-option">
            <input type="checkbox" data-action="toggle-cobit-resp" data-resp="${escapeHtml(item.id)}" ${draft.responsibleIds.includes(item.id) ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        `,
      )
      .join('');
    return `
      <h4>Responsable</h4>
      <p>No asignes todo al CIO. Justifica quién aprueba, supervisa o es dueño de la decisión.</p>
      <fieldset><legend>ResponsibilitySelector</legend><div class="chip-grid">${options}</div></fieldset>
      <label>
        Justificación
        <textarea rows="3" data-draft="cobitDraft.responsibleJustification" data-scope="govern">${escapeHtml(draft.responsibleJustification)}</textarea>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 4) {
    const options = cobitIndicators
      .map((item) => `<option value="${escapeHtml(item.id)}" ${draft.indicator === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
      .join('');
    return `
      <h4>Indicador</h4>
      <label>
        Indicador
        <select data-action="cobit-indicator">
          <option value="">Selecciona</option>
          ${options}
        </select>
      </label>
    `;
  }
  return `
    <h4>Guardar análisis COBIT</h4>
    ${examplesBlock(
      pedagogicalCobit,
      (item) => `
        <article class="example-card">
          <p><strong>${escapeHtml(item.finding || item.problem || '')}</strong></p>
          <p>Decisión: ${escapeHtml(item.decision)}</p>
        </article>
      `,
    )}
    ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
    ${liveWarnings(draft.warnings)}
    <button class="btn btn--primary" type="button" data-action="save-cobit">Guardar situación COBIT</button>
  `;
}

export function RiskBuilder({ govern, finding, error }) {
  const draft = govern.isoDraft;
  const steps = [
    { id: 1, label: 'Activo' },
    { id: 2, label: 'Amenaza' },
    { id: 3, label: 'Vulnerabilidad' },
    { id: 4, label: 'Impacto' },
    { id: 5, label: 'Control' },
    { id: 6, label: 'Guardar' },
  ];
  const nav = steps
    .map(
      (step) => `
        <li>
          <button class="builder-step${draft.step === step.id ? ' is-active' : ''}" type="button" data-action="iso-step" data-step="${step.id}">
            <span>${step.id}</span> ${escapeHtml(step.label)}
          </button>
        </li>
      `,
    )
    .join('');
  return `
    <section class="finding-builder" aria-labelledby="iso-builder-title">
      <h3 id="iso-builder-title">ISO 27001 — ¿Qué riesgo debemos tratar?</h3>
      <p>ACTIVO → AMENAZA → VULNERABILIDAD → IMPACTO → CONTROL</p>
      <p class="consultant-tip">No se está implementando ISO 27001 completa. Se aplica lógica de análisis de riesgos.</p>
      <ol class="builder-nav">${nav}</ol>
      <div class="finding-layout">
        <div class="finding-main">${renderIsoStep(draft.step, draft, finding, error)}</div>
        <aside class="finding-side">
          ${TraceabilityChain({
            finding,
            framework: 'ISO 27001',
            analysis: draft.assetId,
            documentTarget: '13. ISO 27001',
          })}
        </aside>
      </div>
    </section>
  `;
}

function renderIsoStep(step, draft, finding, error) {
  if (step === 1) {
    const options = isoAssets
      .map((item) => `<option value="${escapeHtml(item.id)}" ${draft.assetId === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
      .join('');
    return `
      <h4>AssetSelector</h4>
      <p>${finding ? escapeHtml(finding.title) : 'Selecciona un hallazgo, componente, servicio o activo.'}</p>
      <label>
        Activo
        <select data-action="iso-asset">
          <option value="">Selecciona</option>
          ${options}
        </select>
      </label>
    `;
  }
  if (step === 2) {
    const options = isoThreats
      .map((item) => `<option value="${escapeHtml(item.id)}" ${draft.threatId === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
      .join('');
    return `
      <h4>Amenaza</h4>
      <label>
        Amenaza
        <select data-action="iso-threat">
          <option value="">Selecciona</option>
          ${options}
        </select>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  if (step === 3) {
    const options = isoVulnerabilities
      .map((item) => `<option value="${escapeHtml(item.id)}" ${draft.vulnerabilityId === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
      .join('');
    return `
      <h4>Vulnerabilidad</h4>
      <label>
        Vulnerabilidad
        <select data-action="iso-vuln">
          <option value="">Selecciona</option>
          ${options}
        </select>
      </label>
    `;
  }
  if (step === 4) {
    return `
      <h4>Impacto</h4>
      <label>
        Impacto
        <textarea rows="3" data-draft="isoDraft.impact" data-scope="govern">${escapeHtml(draft.impact)}</textarea>
      </label>
    `;
  }
  if (step === 5) {
    const types = isoControlTypes
      .map(
        (item) => `
          <label class="chip-option">
            <input type="checkbox" data-action="toggle-iso-control-type" data-type="${escapeHtml(item.id)}" ${draft.controlTypes.includes(item.id) ? 'checked' : ''} />
            ${escapeHtml(item.label)}
          </label>
        `,
      )
      .join('');
    return `
      <h4>Control</h4>
      <p class="consultant-tip">Control no significa necesariamente comprar una herramienta. Puede ser procedimiento, segregación, revisión, monitoreo, autenticación, capacitación, política, configuración, respaldo o control técnico.</p>
      <fieldset><legend>Tipo de control</legend><div class="chip-grid">${types}</div></fieldset>
      <label>
        Control
        <textarea rows="3" data-draft="isoDraft.control" data-scope="govern">${escapeHtml(draft.control)}</textarea>
      </label>
      ${liveWarnings(draft.warnings)}
    `;
  }
  return `
    <h4>Guardar riesgo</h4>
    ${examplesBlock(
      pedagogicalIso,
      (item) => `
        <article class="example-card">
          <p>${escapeHtml(item.finding || item.asset)}</p>
          <p>${escapeHtml(item.threat)} / ${escapeHtml(item.vulnerability)} → ${escapeHtml(item.control)}</p>
        </article>
      `,
    )}
    ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
    ${liveWarnings(draft.warnings)}
    <button class="btn btn--primary" type="button" data-action="save-iso">Guardar riesgo ISO 27001</button>
  `;
}

export function GovernTables({ govern }) {
  const itilRows = (govern.itil ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.situation)}</td>
          <td>${escapeHtml(item.practiceLabel || itilPracticeLabel(item.practice))}</td>
          <td>${escapeHtml(item.action)}</td>
          <td>${escapeHtml(item.benefit)}</td>
          <td>${escapeHtml(itilIndicatorLabel(item.indicator) || item.indicator || '—')}</td>
          <td>${escapeHtml(GOVERN_STATUS_LABEL[item.status])}</td>
          <td><button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-itil" data-analysis-id="${escapeHtml(item.analysisId)}">Editar</button></td>
        </tr>
      `,
    )
    .join('');
  const cobitRows = (govern.cobit ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.problem)}</td>
          <td>${escapeHtml(item.decision)}</td>
          <td>${escapeHtml(item.responsible)}</td>
          <td>${escapeHtml(cobitIndicatorLabel(item.indicator) || item.indicator)}</td>
          <td>${escapeHtml(GOVERN_STATUS_LABEL[item.status])}</td>
          <td><button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-cobit" data-analysis-id="${escapeHtml(item.analysisId)}">Editar</button></td>
        </tr>
      `,
    )
    .join('');
  const isoRows = (govern.iso27001 ?? [])
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.asset)}</td>
          <td>${escapeHtml(item.threat)}</td>
          <td>${escapeHtml(item.vulnerability)}</td>
          <td>${escapeHtml(item.impact)}</td>
          <td>${escapeHtml(item.control)}</td>
          <td>${escapeHtml(GOVERN_STATUS_LABEL[item.status])}</td>
          <td><button class="btn btn--small btn--ghost-dark" type="button" data-action="edit-iso" data-analysis-id="${escapeHtml(item.analysisId)}">Editar</button></td>
        </tr>
      `,
    )
    .join('');

  const itilCards = (govern.itil ?? [])
    .map(
      (item) => `
        <article class="matrix-card">
          <p><strong>${escapeHtml(item.situation)}</strong></p>
          <p>${escapeHtml(item.practiceLabel)} · ${escapeHtml(item.action)}</p>
          <p>${escapeHtml(GOVERN_STATUS_LABEL[item.status])}</p>
        </article>
      `,
    )
    .join('');
  const cobitCards = (govern.cobit ?? [])
    .map(
      (item) => `
        <article class="matrix-card">
          <p><strong>${escapeHtml(item.problem)}</strong></p>
          <p>${escapeHtml(item.decision)} · ${escapeHtml(item.responsible)}</p>
        </article>
      `,
    )
    .join('');
  const isoCards = (govern.iso27001 ?? [])
    .map(
      (item) => `
        <article class="matrix-card">
          <p><strong>${escapeHtml(item.asset)}</strong></p>
          <p>${escapeHtml(item.threat)} / ${escapeHtml(item.vulnerability)}</p>
          <p>${escapeHtml(item.control)}</p>
        </article>
      `,
    )
    .join('');

  return `
    <section class="gov-tables">
      <h3>8 / 11. ITIL</h3>
      <p>ITIL ${(govern.itil ?? []).length} / mínimo 4</p>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Situación</th><th>Práctica</th><th>Acción</th><th>Beneficio</th><th>Indicador</th><th>Estado</th><th></th></tr></thead>
          <tbody>${itilRows || '<tr><td colspan="7">Sin filas ITIL.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="matrix-cards">${itilCards}</div>
      <h3>9 / 12. COBIT</h3>
      <p>COBIT ${(govern.cobit ?? []).length} / mínimo 3</p>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Problema</th><th>Decisión de gobierno</th><th>Responsable</th><th>Indicador</th><th>Estado</th><th></th></tr></thead>
          <tbody>${cobitRows || '<tr><td colspan="6">Sin filas COBIT.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="matrix-cards">${cobitCards}</div>
      <h3>10 / 13. ISO 27001</h3>
      <p>ISO 27001 ${(govern.iso27001 ?? []).length} / mínimo 5</p>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead><tr><th>Activo</th><th>Amenaza</th><th>Vulnerabilidad</th><th>Impacto</th><th>Control</th><th>Estado</th><th></th></tr></thead>
          <tbody>${isoRows || '<tr><td colspan="7">Sin filas ISO.</td></tr>'}</tbody>
        </table>
      </div>
      <div class="matrix-cards">${isoCards}</div>
    </section>
  `;
}

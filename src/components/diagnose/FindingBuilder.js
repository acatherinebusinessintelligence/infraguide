import { escapeHtml } from '../../utils/escape.js';
import {
  findingStarters,
  findingCategories,
  impactCategories,
  criticalityLevels,
  criticalityCriteria,
  pedagogicalExamples,
  diagnoseActivities,
} from '../../data/methodology/diagnose.js';
import { FINDING_STATUS_LABEL, categoryLabel } from '../../state/diagnoseModel.js';
import { EvidenceBank, EvidenceChain } from './EvidenceBank.js';
import { FindTheData } from '../FindTheData.js';

const steps = [
  { id: 1, label: 'Selecciona evidencia' },
  { id: 2, label: '¿Qué observas?' },
  { id: 3, label: 'Construye el hallazgo' },
  { id: 4, label: 'Define impacto' },
  { id: 5, label: 'Define criticidad' },
  { id: 6, label: 'Revisa trazabilidad' },
  { id: 7, label: 'Agrega al diagnóstico' },
];

export function FindingBuilder({ diagnose, bank, draftStatus, similar, error }) {
  const draft = diagnose.draft;
  const selected = bank.filter((item) => draft.evidenceIds.includes(item.id));
  const nav = steps
    .map(
      (step) => `
        <li>
          <button
            class="builder-step${draft.step === step.id ? ' is-active' : ''}"
            type="button"
            data-action="diagnose-builder-step"
            data-step="${step.id}"
          >
            <span>${step.id}</span> ${escapeHtml(step.label)}
          </button>
        </li>
      `,
    )
    .join('');

  return `
    <section class="finding-builder" aria-labelledby="finding-builder-title">
      <div class="section-heading">
        <h3 id="finding-builder-title">Constructor de hallazgos</h3>
        <p>Un hallazgo no es una opinión. Es una conclusión que puedes rastrear hasta la evidencia.</p>
        <p class="status-pill status-${escapeHtml(draftStatus)}">${escapeHtml(FINDING_STATUS_LABEL[draftStatus] || draftStatus)}</p>
      </div>
      <ol class="builder-nav">${nav}</ol>
      <div class="finding-layout">
        <div class="finding-main">
          ${renderBuilderStep(draft.step, draft, diagnose, bank, similar, error)}
        </div>
        <aside class="finding-side">
          ${EvidenceChain({
            evidences: selected,
            finding: draft.description,
            impact: draft.impact,
          })}
          ${
            selected.length
              ? `<ul class="side-evidence">${selected
                  .map((item) => `<li><strong>${escapeHtml(item.datum)}</strong><br>Fuente: ${escapeHtml(item.source)}</li>`)
                  .join('')}</ul>`
              : '<p>Selecciona una o varias evidencias. Un hallazgo puede sustentarse con varias.</p>'
          }
        </aside>
      </div>
    </section>
  `;
}

function renderBuilderStep(step, draft, diagnose, bank, similar, error) {
  if (step === 1) {
    return `
      <h4>Paso 1 · Selecciona evidencias</h4>
      <p>No se exige una única evidencia. Ejemplo: CPU 92 % + respuesta 4,8 s + concurrentes 181.</p>
      ${EvidenceBank({
        bank,
        filter: diagnose.currentFilter,
        selectedIds: draft.evidenceIds,
        showSelect: true,
      })}
    `;
  }
  if (step === 2) {
    return `
      <h4>Paso 2 · ¿Qué observas?</h4>
      <p>¿Qué patrón aparece en los datos?</p>
      ${FindTheData({ activities: [diagnoseActivities.pattern], answers: diagnose.activities })}
      <fieldset class="form-block">
        <legend>Tu observación</legend>
        <label>
          <span class="sr-only">Observación</span>
          <textarea
            rows="3"
            data-draft="draft.observation"
            data-scope="diagnose"
            placeholder="Describe el patrón, no la solución."
          >${escapeHtml(draft.observation || '')}</textarea>
        </label>
      </fieldset>
    `;
  }
  if (step === 3) {
    const starters = findingStarters
      .map(
        (item) => `
          <button class="btn btn--small btn--ghost-dark" type="button" data-action="apply-starter" data-starter="${escapeHtml(item)}">
            ${escapeHtml(item)}…
          </button>
        `,
      )
      .join('');
    const warnings = (draft.warnings ?? [])
      .map((item) => `<p class="form-error" role="status">${escapeHtml(item.message)}</p>`)
      .join('');
    const examples = pedagogicalExamples
      .map(
        (item) => `
          <article class="example-card">
            <h5>${escapeHtml(item.title)}</h5>
            <p><strong>Evidencia:</strong> ${escapeHtml(item.evidence)}</p>
            <p><strong>Hallazgo posible:</strong> ${escapeHtml(item.finding)}</p>
            ${item.note ? `<p class="consultant-tip">${escapeHtml(item.note)}</p>` : ''}
          </article>
        `,
      )
      .join('');
    return `
      <h4>Paso 3 · Construye el hallazgo</h4>
      <p>Estos ejemplos son orientación del caso modelo. InfraGuide no los agrega automáticamente.</p>
      <div class="starter-row">${starters}</div>
      <p class="consultant-tip">Evita: “Definitivamente…”, “La única causa es…”, “La solución debe ser…”.</p>
      <label>
        Título corto
        <input type="text" data-draft="draft.title" data-scope="diagnose" value="${escapeHtml(draft.title)}" />
      </label>
      <label>
        Hallazgo
        <textarea rows="4" data-draft="draft.description" data-scope="diagnose">${escapeHtml(draft.description)}</textarea>
      </label>
      ${FindingCategorySelect({ value: draft.category })}
      <div aria-live="polite">${warnings}</div>
      <details class="example-box">
        <summary>Ejemplos metodológicos (no se insertan solos)</summary>
        ${examples}
      </details>
    `;
  }
  if (step === 4) {
    return ImpactBuilder({ draft, activities: diagnose.activities });
  }
  if (step === 5) {
    return CriticalitySelector({ draft, findings: diagnose.findings });
  }
  if (step === 6) {
    return TraceabilityReview({ draft, bank, similar, error });
  }
  return `
    <h4>Paso 7 · Agregar a la matriz</h4>
    <p>Se guarda findingId, título, descripción, evidencias, fuentes, impacto, criticidad, justificación y estado.</p>
    ${similar ? `<p class="form-error" role="status">Este hallazgo parece similar a uno existente. Revisa si realmente representa un problema diferente.</p>` : ''}
    ${error ? `<p class="form-error" role="status">${escapeHtml(error)}</p>` : ''}
    <button class="btn btn--primary" type="button" data-action="add-finding">AGREGAR A MATRIZ DE DIAGNÓSTICO</button>
    <button class="btn btn--ghost-dark" type="button" data-action="reset-finding-draft">Limpiar borrador</button>
  `;
}

export function FindingCategorySelect({ value }) {
  const options = findingCategories
    .map((item) => `<option value="${escapeHtml(item.id)}" ${value === item.id ? 'selected' : ''}>${escapeHtml(item.label)}</option>`)
    .join('');
  return `
    <label>
      Categoría del hallazgo
      <select data-action="finding-category" aria-label="Categoría del hallazgo">
        <option value="">Selecciona (no se infiere sola)</option>
        ${options}
      </select>
    </label>
  `;
}

export function ImpactBuilder({ draft, activities }) {
  const chips = impactCategories
    .map(
      (item) => `
        <label class="chip-option">
          <input
            type="checkbox"
            data-action="toggle-impact-cat"
            data-category="${escapeHtml(item.id)}"
            ${draft.impactCategories.includes(item.id) ? 'checked' : ''}
          />
          ${escapeHtml(item.label)}
        </label>
      `,
    )
    .join('');
  return `
    <h4>Paso 4 · Impacto</h4>
    <p>¿Qué consecuencia tiene este hallazgo? El impacto no es la causa.</p>
    ${FindTheData({ activities: [diagnoseActivities.impactCpu, diagnoseActivities.impactUser], answers: activities })}
    <fieldset>
      <legend>Categorías de impacto</legend>
      <div class="chip-grid">${chips}</div>
    </fieldset>
    <label>
      Consecuencia
      <textarea
        rows="3"
        data-draft="draft.impact"
        data-scope="diagnose"
        placeholder="Ejemplo: Los clientes pueden experimentar tiempos de respuesta elevados y abandono de compras."
      >${escapeHtml(draft.impact)}</textarea>
    </label>
  `;
}

export function CriticalitySelector({ draft, findings }) {
  const options = criticalityLevels
    .map((item) => {
      const checked = draft.criticality === item.id;
      return `
        <label class="crit-option crit-${escapeHtml(item.id)}${checked ? ' is-active' : ''}">
          <input type="radio" name="finding-criticality" data-action="finding-criticality" value="${escapeHtml(item.id)}" ${checked ? 'checked' : ''} />
          <span class="crit-label">${escapeHtml(item.label)}</span>
        </label>
      `;
    })
    .join('');
  const criteria = criticalityCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('');
  const allCritical = findings.filter((item) => item.criticality).length >= 2 && findings.every((item) => !item.criticality || item.criticality === 'critical');
  return `
    <h4>Paso 5 · Criticidad</h4>
    <p>No todo es crítico. La criticidad exige justificación.</p>
    <fieldset>
      <legend>Nivel (texto + color)</legend>
      <div class="crit-grid">${options}</div>
    </fieldset>
    <p>Criterios visibles:</p>
    <ul>${criteria}</ul>
    <label>
      Justificación
      <textarea
        rows="3"
        data-draft="draft.justification"
        data-scope="diagnose"
        placeholder="Ejemplo: El riesgo afecta continuidad y recuperación, aunque no produzca indisponibilidad inmediata."
      >${escapeHtml(draft.justification)}</textarea>
    </label>
    ${allCritical || draft.criticality === 'critical' ? '<p class="form-error" role="status">Si todos tus hallazgos son críticos, probablemente no estás priorizando.</p>' : ''}
  `;
}

export function TraceabilityReview({ draft, bank, similar, error }) {
  const selected = bank.filter((item) => draft.evidenceIds.includes(item.id));
  const blocks = selected
    .map(
      (item, index) => `
        <article class="trace-doc">
          <h5>EVIDENCIA ${index + 1}</h5>
          <p>${escapeHtml(item.datum)}</p>
          <p>Fuente: ${escapeHtml(item.source)}</p>
          <p>Sección: ${escapeHtml(item.sourceSectionId)} · Etapa: ${escapeHtml(item.stage)}</p>
        </article>
      `,
    )
    .join('');
  const canDocument = selected.length > 0 && selected.every((item) => item.source);
  return `
    <h4>Paso 6 · Trazabilidad</h4>
    <article class="trace-doc">
      <h5>HALLAZGO</h5>
      <p>${escapeHtml(draft.description || 'Aún no redactado')}</p>
      <p>Categoría: ${escapeHtml(categoryLabel(draft.category) || '—')}</p>
    </article>
    ${blocks || '<p class="form-error">Sin evidencias seleccionadas.</p>'}
    <article class="trace-doc">
      <h5>IMPACTO</h5>
      <p>${escapeHtml(draft.impact || '—')}</p>
    </article>
    <article class="trace-doc">
      <h5>CRITICIDAD</h5>
      <p>${escapeHtml(draft.criticality || '—')}</p>
      <p>${escapeHtml(draft.justification || '')}</p>
    </article>
    <p>¿Puedes rastrear el hallazgo hasta el caso?</p>
    ${canDocument ? '<p class="ok-note">Sí: cada evidencia tiene fuente.</p>' : `<p class="form-error">${escapeHtml('Si no hay fuente: no se permite DOCUMENTAR.')}</p>`}
    ${similar ? '<p class="form-error" role="status">Este hallazgo parece similar a uno existente. Revisa si realmente representa un problema diferente.</p>' : ''}
    ${error ? `<p class="form-error" role="status">${escapeHtml(error)}</p>` : ''}
  `;
}

export function MissingEvidenceFinding({ diagnose, error }) {
  const draft = diagnose.draft;
  return `
    <section class="stack">
      <h3>¿Qué hago cuando faltan datos?</h3>
      <aside class="panel warning-panel">
        <p>Usuarios reportan lentitud. Pero no existen logs, CPU, latencia ni tiempos.</p>
        <p><strong>Conclusión incorrecta:</strong> “El servidor está saturado.”</p>
        <p><strong>Conclusión válida:</strong> “No existe evidencia suficiente para determinar la causa de la lentitud.”</p>
      </aside>
      ${FindTheData({ activities: [diagnoseActivities.missing], answers: diagnose.activities })}
      <p>Puedes crear un hallazgo de tipo <strong>AUSENCIA DE INFORMACIÓN</strong>.</p>
      <p>Ejemplo: “No existe un registro completo de incidentes que permita cuantificar con precisión frecuencia y causas.”</p>
      <button class="btn btn--ghost-dark" type="button" data-action="start-missing-finding">Preparar hallazgo de ausencia</button>
      ${
        draft.kind === 'missing'
          ? `
            <label>
              Hallazgo de ausencia
              <textarea rows="3" data-draft="draft.description" data-scope="diagnose">${escapeHtml(draft.description)}</textarea>
            </label>
            ${FindingCategorySelect({ value: draft.category || 'missing' })}
            <p class="consultant-tip">Sigue con impacto y criticidad en el constructor. Debes seleccionar una evidencia de ausencia del banco (por ejemplo, historial incompleto).</p>
          `
          : ''
      }
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
    </section>
  `;
}


import { escapeHtml } from '../../utils/escape.js';
import { getConcept } from '../../data/pedagogy/concepts.js';
import { PEDAGOGY_LEVEL, PEDAGOGY_LEVEL_LABEL, STORAGE_EXERCISE_THRESHOLD } from '../../data/pedagogy/index.js';
import { ConceptExplanationCard } from './ConceptExplanationCard.js';
import { FindingFromMetricBuilder, InterpretationBuilder, PedagogyFeedback } from './InterpretationBuilder.js';
import { EvidenceLink } from '../evidence/EvidenceLink.js';
import { getEvidenceForField, resolveEvidenceStatus, EVIDENCE_STATUS, EVIDENCE_ORIGIN } from '../../data/evidence/index.js';
import { getSelectedCaseData } from '../../state/appState.js';
import { getFact } from '../../state/measureModel.js';
import { METRIC_STATUS } from '../../data/methodology/measure.js';
import { formatEsNumber } from '../../utils/numbers.js';
import { storageThresholdMonths } from '../../state/pedagogyModel.js';

const EXAMPLES = {
  availability: {
    condition: 'La disponibilidad observada del periodo de 90 días es ≈ 99,51 %, calculada con 2.160 h y 10 h 40 min acumulados.',
    evidence: 'Periodo 2.160 h (PDF). Indisponibilidad = suma de duraciones (cálculo, no cifra literal).',
    criterion: 'No hay SLA formal. Comparar con la expectativa de negocio cuando exista.',
    cause: 'Cinco incidentes de distintos servicios; el acumulado mezcla alcances.',
    impact: 'La cifra no demuestra, por sí sola, que el ERP cumpla un acuerdo.',
    risk: 'Aprobar un SLA con un denominador mezclado.',
    recommendation: 'Separar medición por servicio antes de un acuerdo contractual.',
    acceptance: 'Disponibilidad por servicio con registro homogéneo del siguiente periodo.',
  },
  mttr: {
    condition: 'El MTTR del registro es ≈ 2,13 h (10,67 h / 5 incidentes).',
    evidence: 'Cinco incidentes y suma de duraciones (cálculo).',
    criterion: 'Expectativa informal de recuperación del ERP (< 2 h) si se usa, sin tratarla como RTO.',
    cause: 'Duraciones heterogéneas; el promedio oculta el evento más largo.',
    impact: 'Operación y facturación según el servicio afectado en cada evento.',
    risk: 'Diseñar continuidad con el promedio como si fuera el máximo.',
    recommendation: 'Ensayar restauración del servicio crítico y registrar por evento.',
    acceptance: 'MTTR por servicio con evidencia de restore, no solo el promedio global.',
  },
  storage: {
    condition: 'NAS-01 usa 19,2 TB de 24 TB (80 %) con crecimiento de 650 GB/mes.',
    evidence: 'PDF, almacenamiento. Margen y umbral 85 % son cálculos; el 85 % no está en el PDF.',
    criterion: 'Umbral de ejercicio 85 % (no aprobado en el caso) y 100 % teórico.',
    cause: 'Crecimiento observado sin política de retención documentada en el cálculo.',
    impact: 'Archivos e imágenes de operación si se agota el volumen.',
    risk: 'Llegar al umbral sin tiempo de compra.',
    recommendation: 'Retención/archivado y ampliación planificada antes del 100 %.',
    acceptance: 'Uso bajo umbral aprobado y prueba de crecimiento.',
  },
};

export function GuidedCalculator({ metricId, facts, slot = {}, calculatorHtml = '', error = '', howOpen = false }) {
  const concept = getConcept(metricId);
  const level = Number(slot.level || PEDAGOGY_LEVEL.UNDERSTAND);
  const calculated =
    slot.status === METRIC_STATUS.CALCULATED ||
    slot.status === METRIC_STATUS.INTERPRETED ||
    slot.status === METRIC_STATUS.DOCUMENTED ||
    Boolean(slot.inputs?.percentOk || slot.inputs?.resultOk || slot.inputs?.monthsOk);
  return `
    <section class="guided-calc" aria-label="Calculadora guiada de ${escapeHtml(concept?.name || metricId)}">
      ${levelNav(metricId, level)}
      ${pipelineLegend(level)}
      ${level >= 1 ? ConceptExplanationCard({ conceptId: metricId, open: slot.conceptOpen !== false }) : ''}
      ${
        level === 1
          ? `<p><button class="btn btn--primary" type="button" data-action="pedagogy-level" data-metric-id="${escapeHtml(metricId)}" data-level="2">Continuar a aplicar el cálculo</button></p>`
          : ''
      }
      ${level >= 2 ? VariableTable({ concept, facts }) : ''}
      ${level >= 2 ? calculatorHtml : ''}
      ${level >= 2 && metricId === 'storage' && slot.inputs?.monthsOk ? ThresholdExercise({ facts }) : ''}
      ${level >= 2 && calculated ? HowObtainedButton({ metricId, open: howOpen }) : ''}
      ${level >= 2 && calculated ? InterpretationBuilder({ metricId, slot, error }) : ''}
      ${level >= 3 ? FindingFromMetricBuilder({ metricId, slot, example: EXAMPLES[metricId] || EXAMPLES.availability }) : ''}
      ${PedagogyFeedback({ feedback: slot.feedback })}
    </section>
  `;
}

function pipelineLegend(level) {
  const steps = [
    '1 Comprender el indicador',
    '2 Identificar datos',
    '3 Validar',
    '4 Fórmula',
    '5 Sustituir',
    '6 Resolver',
    '7 Resultado',
    '8 Interpretar',
    '9 Hallazgo',
    '10 Incorporar al informe',
  ];
  const activeFrom = level === 1 ? 0 : level === 2 ? 1 : 7;
  const items = steps
    .map((label, index) => `<li class="${index >= activeFrom && index <= activeFrom + (level === 1 ? 0 : level === 2 ? 6 : 2) ? 'is-current' : ''}">${escapeHtml(label)}</li>`)
    .join('');
  return `<ol class="pipeline-legend" aria-label="Cadena de razonamiento">${items}</ol>`;
}

function levelNav(metricId, level) {
  const items = [1, 2, 3]
    .map((n) => {
      const active = level === n ? ' is-active' : '';
      return `<button class="level-chip${active}" type="button" data-action="pedagogy-level" data-metric-id="${escapeHtml(metricId)}" data-level="${n}">Nivel ${n} · ${escapeHtml(PEDAGOGY_LEVEL_LABEL[n])}</button>`;
    })
    .join('');
  return `<div class="level-nav" role="group" aria-label="Progreso pedagógico">${items}</div>`;
}

function VariableTable({ concept, facts }) {
  if (!concept?.variables?.length) return '';
  const caseData = getSelectedCaseData();
  const rows = concept.variables
    .map((variable) => {
      const fact = variable.key ? getFact(facts, variable.key) : null;
      const evidence = variable.key ? getEvidenceForField(caseData, variable.key) : null;
      const status = evidence ? resolveEvidenceStatus(evidence) : '';
      const origin = evidence?.origin === EVIDENCE_ORIGIN.CALCULATED ? 'Calculada' : status === EVIDENCE_STATUS.VERIFIED ? 'Verificada' : 'Pendiente';
      return `
        <tr>
          <td>${escapeHtml(variable.name)}</td>
          <td>${escapeHtml(variable.symbol)}</td>
          <td>${escapeHtml(String(fact?.displayValue ?? fact?.value ?? evidence?.value ?? '—'))}</td>
          <td>${escapeHtml(variable.unit || fact?.unit || '')}<span class="sr-only"> ${escapeHtml(variable.unit || fact?.unit || 'sin unidad')}</span></td>
          <td>${escapeHtml(evidence?.section || fact?.sourceLabel || '—')}</td>
          <td>${evidence?.page != null ? escapeHtml(String(evidence.page)) : '—'}</td>
          <td>${escapeHtml(origin)}${variable.calculated ? ' · no literal del PDF' : ''}</td>
          <td>${variable.key ? EvidenceLink({ caseData, fieldKey: variable.key, component: 'guided-calc' }) : '—'}</td>
        </tr>
      `;
    })
    .join('');
  return `
    <section class="builder-card">
      <h3>Paso 2 y 3 · Identificar y validar datos</h3>
      <p>Unidades y periodo deben coincidir. Un valor calculado no se cita como texto del PDF.</p>
      <div class="matrix-table-wrap">
        <table class="matrix-table">
          <thead>
            <tr>
              <th scope="col">Variable</th>
              <th scope="col">Símbolo</th>
              <th scope="col">Valor</th>
              <th scope="col">Unidad</th>
              <th scope="col">Fuente</th>
              <th scope="col">Página</th>
              <th scope="col">Estado</th>
              <th scope="col">Evidencia</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>
      </div>
    </section>
  `;
}

function ThresholdExercise({ facts = [] }) {
  const result = storageThresholdMonths(facts);
  if (!result) {
    return `<aside class="pedagogy-feedback pedagogy-feedback--info">No hay datos suficientes para el umbral de ejercicio.</aside>`;
  }
  return `
    <section class="builder-card">
      <h3>Tiempo hasta umbral de ejercicio (${escapeHtml(STORAGE_EXERCISE_THRESHOLD.label)})</h3>
      <p class="concept-warn">${escapeHtml(STORAGE_EXERCISE_THRESHOLD.note)}</p>
      <p class="formula-body">24 × 0,85 = 20,4 TB · 20,4 − 19,2 = 1,2 TB · 1,2 / 0,65 ≈ ${escapeHtml(formatEsNumber(result.months, 2))} meses</p>
      <p>Si el crecimiento se mantiene, el 85 % de ejercicio se alcanza en menos de dos meses. No esperes al 100 %.</p>
    </section>
  `;
}

export function HowObtainedButton({ metricId, open = false }) {
  return `
    <p>
      <button class="btn btn--small" type="button" data-action="toggle-how-obtained" data-metric-id="${escapeHtml(metricId)}" aria-expanded="${open ? 'true' : 'false'}">
        ¿Cómo se obtuvo este resultado?
      </button>
    </p>
  `;
}

export function HowObtainedPanel({ metricId, trace, open }) {
  if (!open || !trace) return '';
  const inputs = (trace.inputs ?? [])
    .map((item) => `<li>${escapeHtml(item.name)} = ${escapeHtml(String(item.value))} ${escapeHtml(item.unit || '')} ${item.page ? `(página ${item.page})` : ''} ${item.calculated ? '(cálculo)' : ''}</li>`)
    .join('');
  return `
    <aside class="how-obtained" aria-label="Trazabilidad del cálculo">
      <h3>¿Cómo se obtuvo? · ${escapeHtml(trace.name)}</h3>
      <p>${escapeHtml(trace.definition)}</p>
      <p><strong>Fórmula:</strong> ${escapeHtml(trace.formula)}</p>
      <p><strong>Datos:</strong></p>
      <ul>${inputs || '<li>Sin variables vinculadas.</li>'}</ul>
      ${
        (trace.steps ?? []).length
          ? `<p><strong>Operaciones:</strong></p><ol>${trace.steps.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ol>`
          : ''
      }
      <p><strong>Resultado:</strong> ${escapeHtml(String(trace.result?.value ?? '—'))} ${escapeHtml(trace.result?.unit || '')} · ${escapeHtml(trace.rounding || '')}</p>
      <p><strong>Periodo / alcance:</strong> ${escapeHtml(trace.period || '—')} · ${escapeHtml(trace.scope || '')}</p>
      <p><strong>Interpretación:</strong> ${escapeHtml(trace.interpretation || 'Pendiente del estudiante.')}</p>
      <p><strong>Limitaciones:</strong> ${(trace.limitations ?? []).map((item) => escapeHtml(item)).join(' ')}</p>
      <p class="classify-note">Esta explicación es de aprendizaje. El informe profesional exporta solo resultado, alcance, interpretación validada y limitación.</p>
    </aside>
  `;
}

import { escapeHtml } from '../../utils/escape.js';
import {
  availabilityLimits,
  availabilityMissingForConclusion,
  mtbfNeedsForPrecision,
  templates,
  measureActivities,
} from '../../data/methodology/measure.js';
import { formatEsNumber } from '../../utils/numbers.js';
import { getFact } from '../../state/measureModel.js';
import { FindTheData } from '../FindTheData.js';
import { MetricNarrativeBuilder } from './DataReadiness.js';
import { TraceabilityPanel } from '../TraceabilityPanel.js';

function formulaBlock(label, text) {
  return `<div class="formula-step" aria-label="${escapeHtml(label)}"><p class="formula-kicker">${escapeHtml(label)}</p><p class="formula-body">${escapeHtml(text)}</p></div>`;
}

function calcInput({ id, label, field, metricId, value, action, step }) {
  return `
    <div class="builder-field">
      <label for="${escapeHtml(id)}">${escapeHtml(label)}</label>
      <input
        id="${escapeHtml(id)}"
        type="text"
        inputmode="decimal"
        data-scope="measure"
        data-draft="${escapeHtml(metricId)}.inputs.${field}"
        value="${escapeHtml(value || '')}"
        autocomplete="off"
      />
      <button class="btn btn--small btn--primary" type="button" data-action="${escapeHtml(action)}" data-step="${escapeHtml(step)}">Comprobar</button>
    </div>
  `;
}

export function AvailabilityCalculator({ facts, slot, activities, error }) {
  const period = getFact(facts, 'periodHours');
  const down = getFact(facts, 'downtimeHours');
  return `
    <section class="builder-card measure-calc" aria-labelledby="avail-title">
      <h3 id="avail-title">AvailabilityCalculator</h3>
      ${formulaBlock('Paso 1 — Fuente', period?.sourceLabel ?? 'Información operacional disponible')}
      ${formulaBlock('Paso 2 — Datos', `Periodo observado: ${period?.displayValue ?? '—'}. Indisponibilidad: ${down?.displayValue ?? '—'}.`)}
      ${formulaBlock('Paso 3 — Fórmula', 'Disponibilidad = (Tiempo total − tiempo fuera de servicio) / Tiempo total × 100')}
      ${calcInput({
        id: 'avail-uptime',
        label: 'Tiempo disponible = ______',
        field: 'uptime',
        metricId: 'availability',
        value: slot.inputs.uptime,
        action: 'submit-availability',
        step: 'uptime',
      })}
      ${
        slot.inputs.uptimeOk
          ? `
            ${formulaBlock('Paso 4 — Sustitución', 'Disponibilidad = (720 − 12) / 720 × 100')}
            ${formulaBlock('Comprobación', '720 − 12 = 708')}
            ${calcInput({
              id: 'avail-pct',
              label: 'Disponibilidad = ______ %',
              field: 'percent',
              metricId: 'availability',
              value: slot.inputs.percent,
              action: 'submit-availability',
              step: 'percent',
            })}
          `
          : ''
      }
      ${
        slot.inputs.percentOk
          ? `
            ${formulaBlock('Paso 5 — Cálculo', '708 / 720 = 0,9833 → 0,9833 × 100 = 98,33 %')}
            ${FindTheData({ activities: [measureActivities.availabilityAffirm], answers: activities })}
            <section class="panel">
              <h4>¿Qué no puedes concluir?</h4>
              <p>Con este dato todavía NO puedes afirmar:</p>
              <ul>${availabilityLimits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              <p>Porque faltan: ${availabilityMissingForConclusion.join(', ')}.</p>
            </section>
            ${TraceabilityPanel({
              items: [
                { label: 'FUENTE', value: 'Información operacional.' },
                { label: 'DATOS', value: '720 h · 12 h.' },
                { label: 'PROCESAMIENTO', value: '(720 − 12) / 720 × 100' },
                { label: 'RESULTADO', value: '98,33 %' },
                { label: 'INTERPRETACIÓN', value: 'Disponibilidad observada.' },
                { label: 'DOCUMENTO', value: '9.1 Disponibilidad.' },
              ],
              kicker: 'Trazabilidad de la métrica',
              title: 'Disponibilidad',
            })}
            ${MetricNarrativeBuilder({
              metricId: 'availability',
              draft: slot.draft,
              template: templates.availability,
              error,
              action: 'add-availability-doc',
            })}
          `
          : error
            ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>`
            : ''
      }
    </section>
  `;
}

export function MTTRCalculator({ facts, slot, activities, error }) {
  const incidents = getFact(facts, 'incidentCount');
  const recovery = getFact(facts, 'totalRecoveryHours');
  return `
    <section class="builder-card measure-calc">
      <h3>MTTRCalculator</h3>
      ${formulaBlock('Fuente', incidents?.sourceLabel ?? 'Información operacional disponible')}
      ${formulaBlock('Datos', `Incidentes: ${incidents?.displayValue ?? '—'}. Tiempo total de recuperación: ${recovery?.displayValue ?? '—'}.`)}
      ${formulaBlock('Fórmula', 'MTTR = Tiempo total de recuperación / Número de incidentes')}
      ${formulaBlock('Sustitución', '31 / 10')}
      ${calcInput({
        id: 'mttr-result',
        label: '31 / 10 = ______',
        field: 'result',
        metricId: 'mttr',
        value: slot.inputs.result,
        action: 'submit-mttr',
        step: 'result',
      })}
      ${
        slot.inputs.resultOk
          ? `
            ${formulaBlock('Resultado', '3,1 horas')}
            ${FindTheData({ activities: [measureActivities.mttrMeaning], answers: activities })}
            ${MetricNarrativeBuilder({
              metricId: 'mttr',
              draft: slot.draft,
              template: templates.mttr,
              error,
              action: 'add-mttr-doc',
            })}
          `
          : error
            ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>`
            : ''
      }
    </section>
  `;
}

export function MTBFEstimator({ facts, slot, activities, error }) {
  return `
    <section class="builder-card measure-calc">
      <h3>MTBFEstimator</h3>
      <p class="form-error">Este valor es una estimación académica basada en los datos disponibles.</p>
      ${formulaBlock('Datos', `Periodo: ${getFact(facts, 'periodHours')?.displayValue}. Indisponibilidad: ${getFact(facts, 'downtimeHours')?.displayValue}. Incidentes: ${getFact(facts, 'incidentCount')?.displayValue}.`)}
      ${formulaBlock('Tiempo operativo estimado', '720 − 12 = ______ h')}
      ${calcInput({
        id: 'mtbf-uptime',
        label: 'Tiempo operativo = ______',
        field: 'uptime',
        metricId: 'mtbf',
        value: slot.inputs.uptime,
        action: 'submit-mtbf',
        step: 'uptime',
      })}
      ${
        slot.inputs.uptimeOk
          ? `
            ${formulaBlock('Estimación', '708 / 10 = ______ h')}
            ${calcInput({
              id: 'mtbf-result',
              label: 'MTBF estimado = ______',
              field: 'result',
              metricId: 'mtbf',
              value: slot.inputs.result,
              action: 'submit-mtbf',
              step: 'result',
            })}
          `
          : ''
      }
      ${
        slot.inputs.resultOk
          ? `
            ${formulaBlock('Resultado', '≈ 70,8 h')}
            <section class="panel">
              <h4>Limitaciones</h4>
              <p>Para un MTBF más preciso sería útil conocer:</p>
              <ul>${mtbfNeedsForPrecision.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
            </section>
            ${FindTheData({ activities: [measureActivities.mtbfPresent], answers: activities })}
            ${MetricNarrativeBuilder({
              metricId: 'mtbf',
              draft: slot.draft,
              template: templates.mtbf,
              error,
              action: 'add-mtbf-doc',
            })}
          `
          : error
            ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>`
            : ''
      }
    </section>
  `;
}

export function CorrelationCard() {
  return `
    <section class="correlation-card" aria-label="Correlación observada">
      <h3>CorrelationCard</h3>
      <ol class="correlation-flow">
        <li>Demanda ↑</li>
        <li>CPU ↑</li>
        <li>Latencia ↑</li>
      </ol>
      <p>Existe evidencia de degradación de rendimiento asociada con condiciones de alta demanda.</p>
      <p class="classify-note">No se afirma que la demanda cause la saturación: el caso no lo demuestra de forma exclusiva.</p>
    </section>
  `;
}

export function CapacityAnalyzer({ facts, slot, activities, error }) {
  return `
    <section class="builder-card measure-calc">
      <h3>CapacityAnalyzer</h3>
      <p>No es una única calculadora: relaciona varios datos del mismo periodo.</p>
      <ul>
        <li>CPU promedio: ${escapeHtml(getFact(facts, 'appCpuAverage')?.displayValue ?? '78 %')}</li>
        <li>CPU pico: ${escapeHtml(getFact(facts, 'appCpuPeak')?.displayValue ?? '96 %')}</li>
        <li>RAM: ${escapeHtml(getFact(facts, 'appRamUsage')?.displayValue ?? '88 %')}</li>
        <li>Demanda normal: ${escapeHtml(getFact(facts, 'appDemandNormal')?.displayValue ?? '14 000')}</li>
        <li>Demanda pico: ${escapeHtml(getFact(facts, 'appDemandPeak')?.displayValue ?? '31 000')}</li>
        <li>Latencia normal: ${escapeHtml(getFact(facts, 'appLatencyNormal')?.displayValue ?? '180 ms')}</li>
        <li>Latencia pico: ${escapeHtml(getFact(facts, 'appLatencyPeak')?.displayValue ?? '900 ms')}</li>
      </ul>
      ${FindTheData({ activities: [measureActivities.capacityPattern], answers: activities })}
      ${activities['m-cap-pattern'] === 'a' ? CorrelationCard() : ''}
      <section class="panel">
        <h4>Promedio frente a pico</h4>
        <p><strong>Promedio</strong> (78 %): comportamiento general. <strong>Pico</strong> (96 %): valor máximo observado.</p>
        <p>Un pico aislado no demuestra presión sostenida.</p>
        ${FindTheData({ activities: [measureActivities.peakEqualsAverage], answers: activities })}
      </section>
      <section class="panel">
        <h4>RAM 88 %</h4>
        ${FindTheData({ activities: [measureActivities.ramBuy], answers: activities })}
      </section>
      ${
        activities['m-cap-pattern'] === 'a'
          ? MetricNarrativeBuilder({
              metricId: 'capacity',
              draft: slot.draft,
              template: templates.capacity,
              error,
              action: 'add-capacity-doc',
            })
          : ''
      }
    </section>
  `;
}

export function StorageCapacityCalculator({ facts, slot, activities, error }) {
  const cap = getFact(facts, 'storageCapacity');
  const used = getFact(facts, 'storageUsed');
  const growth = getFact(facts, 'storageGrowth');
  return `
    <section class="builder-card measure-calc">
      <h3>StorageCapacityCalculator</h3>
      ${formulaBlock('Fuente', cap?.sourceLabel ?? 'Almacenamiento')}
      ${formulaBlock('Datos', `Capacidad: ${cap?.displayValue}. Utilizado: ${used?.displayValue}. Crecimiento: ${growth?.displayValue}.`)}
      ${calcInput({
        id: 'sto-free',
        label: '20 − 16,8 = ______ TB',
        field: 'free',
        metricId: 'storage',
        value: slot.inputs.free,
        action: 'submit-storage',
        step: 'free',
      })}
      ${
        slot.inputs.freeOk
          ? calcInput({
              id: 'sto-pct',
              label: '16,8 / 20 × 100 = ______ %',
              field: 'percent',
              metricId: 'storage',
              value: slot.inputs.percent,
              action: 'submit-storage',
              step: 'percent',
            })
          : ''
      }
      ${
        slot.inputs.percentOk
          ? `
            ${formulaBlock('Proyección', 'Libre ≈ 3,2 TB ≈ 3 200 GB. Crecimiento 420 GB/mes. 3 200 / 420 ≈ ______ meses.')}
            <p class="classify-note">Esta proyección supone crecimiento constante. No digas que el almacenamiento se agotará exactamente en 7,62 meses.</p>
            ${calcInput({
              id: 'sto-months',
              label: 'Margen teórico ≈ ______ meses',
              field: 'months',
              metricId: 'storage',
              value: slot.inputs.months,
              action: 'submit-storage',
              step: 'months',
            })}
          `
          : ''
      }
      ${
        slot.inputs.monthsOk
          ? `
            ${formulaBlock('Texto correcto', 'Si el crecimiento continúa a un ritmo similar, el margen teórico es de aproximadamente 7,6 meses.')}
            ${FindTheData({ activities: [measureActivities.storageWait], answers: activities })}
            ${MetricNarrativeBuilder({
              metricId: 'storage',
              draft: slot.draft,
              template: templates.storage,
              error,
              action: 'add-storage-doc',
            })}
          `
          : error
            ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>`
            : ''
      }
    </section>
  `;
}

export function PerformanceAnalyzer({ facts, slot, activities, error }) {
  return `
    <section class="builder-card measure-calc">
      <h3>PerformanceAnalyzer</h3>
      ${formulaBlock('Datos', `Latencia normal: ${getFact(facts, 'appLatencyNormal')?.displayValue}. Latencia pico: ${getFact(facts, 'appLatencyPeak')?.displayValue}.`)}
      ${calcInput({
        id: 'perf-ratio',
        label: '900 / 180 = ______',
        field: 'ratio',
        metricId: 'performance',
        value: slot.inputs.ratio,
        action: 'submit-performance',
        step: 'ratio',
      })}
      ${
        slot.inputs.ratioOk
          ? `
            ${formulaBlock('Relación', 'La latencia en pico es aproximadamente 5 veces la latencia normal.')}
            <section class="panel warning-panel">
              <h4>Servicio disponible, pero responde lento</h4>
              <p>Disponibilidad evalúa si el servicio está operativo. Rendimiento analiza cómo responde.</p>
              ${FindTheData({ activities: [measureActivities.availableSlow], answers: activities })}
            </section>
            ${formulaBlock('Incremento de demanda', '(31 000 − 14 000) / 14 000 × 100')}
            ${calcInput({
              id: 'perf-demand',
              label: 'Incremento relativo ≈ ______ %',
              field: 'demand',
              metricId: 'performance',
              value: slot.inputs.demand,
              action: 'submit-performance',
              step: 'demand',
            })}
          `
          : ''
      }
      ${
        slot.inputs.demandOk
          ? `
            ${formulaBlock('Demanda', 'El volumen pico observado es aproximadamente 121 % superior al volumen normal de referencia.')}
            <p class="classify-note">No confundir con “la empresa creció 121 %”: compara niveles de demanda observados, no crecimiento empresarial.</p>
            ${MetricNarrativeBuilder({
              metricId: 'performance',
              draft: slot.draft,
              template: templates.performance,
              error,
              action: 'add-performance-doc',
            })}
          `
          : error
            ? `<p class="form-error" role="alert" aria-live="polite">${escapeHtml(error)}</p>`
            : ''
      }
    </section>
  `;
}

export function MetricEvidencePanel({ expected, evidence = [] }) {
  const tiles = [
    ['Disponibilidad', `${formatEsNumber(expected.availabilityPercent, 2)} %`],
    ['MTTR', `${formatEsNumber(expected.mttrHours, 1)} h`],
    ['MTBF', `≈ ${formatEsNumber(expected.mtbfHours, 1)} h`],
    ['Storage', `${formatEsNumber(expected.storageUsedPercent, 0)} %`],
    ['Margen', `≈ ${formatEsNumber(expected.storageMonths, 1)} meses`],
    ['CPU pico', '96 %'],
    ['RAM', '88 %'],
    ['Latencia', '180 → 900 ms'],
    ['Demanda', '14 000 → 31 000'],
  ]
    .map(([label, value]) => `<article class="metric-tile"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(value)}</p></article>`)
    .join('');

  const saved = evidence
    .map((item) => `<li><strong>${escapeHtml(item.evidenceId)}</strong> — ${escapeHtml(item.interpretation)}</li>`)
    .join('');

  return `
    <section class="builder-card">
      <h3>MetricEvidencePanel</h3>
      <p>No hay semáforo automático. 84 % de almacenamiento no es “malo” por sí solo: hace falta crecimiento, umbral, criticidad, políticas y capacidad futura.</p>
      <div class="metric-tiles">${tiles}</div>
      <h4>Evidencias guardadas para diagnosticar</h4>
      <ul>${saved || '<li>Todavía no has guardado evidencias.</li>'}</ul>
      <button class="btn btn--primary" type="button" data-action="save-capacity-evidence">Guardar evidencia de degradación bajo demanda</button>
    </section>
  `;
}

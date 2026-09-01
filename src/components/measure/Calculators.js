import { escapeHtml } from '../../utils/escape.js';
import {
  availabilityLimits,
  availabilityMissingForConclusion,
  mtbfNeedsForPrecision,
  templates,
  measureActivities,
} from '../../data/methodology/measure.js';
import { formatEsNumber } from '../../utils/numbers.js';
import { getFact, expectedFromFacts } from '../../state/measureModel.js';
import { FindTheData } from '../FindTheData.js';
import { MetricNarrativeBuilder } from './DataReadiness.js';
import { TraceabilityPanel } from '../TraceabilityPanel.js';
import { CalculatedSources } from '../evidence/CalculatedSources.js';
import { getSelectedCaseData } from '../../state/appState.js';

function formulaBlock(label, text) {
  return `<div class="formula-step" aria-label="${escapeHtml(label)}"><p class="formula-kicker">${escapeHtml(label)}</p><p class="formula-body">${escapeHtml(text)}</p></div>`;
}

function num(facts, key) {
  return Number(getFact(facts, key)?.value);
}

function disp(facts, key) {
  const field = getFact(facts, key);
  return field?.displayValue || field?.value || '—';
}

function es(value, decimals = 2) {
  return formatEsNumber(Number(value), decimals);
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
  const expected = expectedFromFacts(facts);
  const periodN = num(facts, 'periodHours');
  const downN = num(facts, 'downtimeHours');
  const uptime = expected.uptimeHours;
  const pct = expected.availabilityPercent;
  return `
    <section class="builder-card measure-calc" aria-labelledby="avail-title">
      <h3 id="avail-title">AvailabilityCalculator</h3>
      ${formulaBlock('Paso 1 — Fuente', period?.sourceLabel ?? 'Información operacional disponible')}
      ${formulaBlock('Paso 2 — Datos', `Periodo observado: ${period?.displayValue ?? '—'}. Indisponibilidad: ${down?.displayValue ?? '—'} (suma de duraciones; no aparece como cifra única en el PDF).`)}
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
            ${formulaBlock('Paso 4 — Sustitución', `Disponibilidad = (${es(periodN, 0)} − ${es(downN, 2)}) / ${es(periodN, 0)} × 100`)}
            ${formulaBlock('Comprobación', `${es(periodN, 0)} − ${es(downN, 2)} = ${es(uptime, 2)}`)}
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
            ${formulaBlock('Paso 5 — Cálculo', `${es(uptime, 2)} / ${es(periodN, 0)} → ${es(pct, 2)} %`)}
            ${FindTheData({ activities: [measureActivities.availabilityAffirm], answers: activities })}
            <section class="panel">
              <h4>¿Qué no puedes concluir?</h4>
              <p>Con este dato todavía NO puedes afirmar:</p>
              <ul>${availabilityLimits.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
              <p>Porque faltan: ${availabilityMissingForConclusion.join(', ')}.</p>
            </section>
            ${TraceabilityPanel({
              items: [
                { label: 'PDF', value: 'Documento fuente' },
                { label: 'DATOS FUENTE', value: `${disp(facts, 'periodHours')} · ${disp(facts, 'downtimeHours')} (calculado).` },
                { label: 'PROCESAMIENTO', value: `(${es(periodN, 0)} − ${es(downN, 2)}) / ${es(periodN, 0)} × 100` },
                { label: 'RESULTADO CALCULADO', value: `${es(pct, 2)} %` },
                { label: 'INTERPRETACIÓN', value: 'Disponibilidad observada.' },
                { label: 'DOCUMENTO', value: '9.1 Disponibilidad.' },
              ],
              kicker: 'Trazabilidad de la métrica',
              title: 'Disponibilidad',
            })}
            ${CalculatedSources({
              caseData: getSelectedCaseData(),
              metricId: 'calc-availability',
              resultLabel: 'Disponibilidad',
              resultValue: `${es(pct, 2)} %`,
              open: true,
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
  const expected = expectedFromFacts(facts);
  const recN = num(facts, 'totalRecoveryHours');
  const incN = num(facts, 'incidentCount');
  return `
    <section class="builder-card measure-calc">
      <h3>MTTRCalculator</h3>
      ${formulaBlock('Fuente', incidents?.sourceLabel ?? 'Información operacional disponible')}
      ${formulaBlock('Datos', `Incidentes: ${incidents?.displayValue ?? incidents?.value ?? '—'}. Tiempo total de recuperación: ${recovery?.displayValue ?? '—'} (suma de duraciones).`)}
      ${formulaBlock('Fórmula', 'MTTR = Tiempo total de recuperación / Número de incidentes')}
      ${formulaBlock('Sustitución', `${es(recN, 2)} / ${es(incN, 0)}`)}
      ${calcInput({
        id: 'mttr-result',
        label: `${es(recN, 2)} / ${es(incN, 0)} = ______`,
        field: 'result',
        metricId: 'mttr',
        value: slot.inputs.result,
        action: 'submit-mttr',
        step: 'result',
      })}
      ${
        slot.inputs.resultOk
          ? `
            ${formulaBlock('Resultado', `${es(expected.mttrHours, 2)} horas`)}
            ${CalculatedSources({
              caseData: getSelectedCaseData(),
              metricId: 'calc-mttr',
              resultLabel: 'MTTR',
              resultValue: `${es(expected.mttrHours, 2)} h`,
            })}
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
  const expected = expectedFromFacts(facts);
  const periodN = num(facts, 'periodHours');
  const downN = num(facts, 'downtimeHours');
  const incN = num(facts, 'incidentCount');
  return `
    <section class="builder-card measure-calc">
      <h3>MTBFEstimator</h3>
      <p class="form-error">Este valor es una estimación académica basada en los datos disponibles.</p>
      ${formulaBlock('Datos', `Periodo: ${disp(facts, 'periodHours')}. Indisponibilidad: ${disp(facts, 'downtimeHours')}. Incidentes: ${disp(facts, 'incidentCount')}.`)}
      ${formulaBlock('Tiempo operativo estimado', `${es(periodN, 0)} − ${es(downN, 2)} = ______ h`)}
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
            ${formulaBlock('Estimación', `${es(expected.uptimeHours, 2)} / ${es(incN, 0)} = ______ h`)}
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
            ${formulaBlock('Resultado', `≈ ${es(expected.mtbfHours, 2)} h`)}
            ${CalculatedSources({
              caseData: getSelectedCaseData(),
              metricId: 'calc-mtbf',
              resultLabel: 'MTBF',
              resultValue: `≈ ${es(expected.mtbfHours, 2)} h`,
            })}
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
  const cpuAvg = disp(facts, 'appCpuAverage');
  const cpuPeak = disp(facts, 'appCpuPeak');
  const ram = disp(facts, 'appRamUsage');
  return `
    <section class="builder-card measure-calc">
      <h3>CapacityAnalyzer</h3>
      <p>No es una única calculadora: relaciona varios datos del mismo periodo.</p>
      <ul>
        <li>CPU habitual: ${escapeHtml(cpuAvg)}</li>
        <li>CPU pico: ${escapeHtml(cpuPeak)}</li>
        <li>RAM: ${escapeHtml(ram)}</li>
        <li>Concurrentes habituales: ${escapeHtml(disp(facts, 'appDemandNormal'))}</li>
        <li>Concurrentes pico: ${escapeHtml(disp(facts, 'appDemandPeak'))}</li>
        <li>Respuesta habitual: ${escapeHtml(disp(facts, 'appLatencyNormal'))}</li>
        <li>Respuesta pico: ${escapeHtml(disp(facts, 'appLatencyPeak'))}</li>
      </ul>
      ${FindTheData({ activities: [measureActivities.capacityPattern], answers: activities })}
      ${activities['m-cap-pattern'] === 'a' ? CorrelationCard() : ''}
      <section class="panel">
        <h4>Habitual frente a pico</h4>
        <p><strong>Habitual</strong> (${escapeHtml(cpuAvg)}): comportamiento general. <strong>Pico</strong> (${escapeHtml(cpuPeak)}): valor máximo observado.</p>
        <p>Un pico aislado no demuestra presión sostenida.</p>
        ${FindTheData({ activities: [measureActivities.peakEqualsAverage], answers: activities })}
      </section>
      <section class="panel">
        <h4>RAM ${escapeHtml(ram)}</h4>
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
  const expected = expectedFromFacts(facts);
  const capN = num(facts, 'storageCapacity');
  const usedN = num(facts, 'storageUsed');
  const growthN = num(facts, 'storageGrowth');
  const freeGb = expected.storageFreeTb * 1000;
  return `
    <section class="builder-card measure-calc">
      <h3>StorageCapacityCalculator</h3>
      ${formulaBlock('Fuente', cap?.sourceLabel ?? 'Almacenamiento')}
      ${formulaBlock('Datos', `Capacidad: ${cap?.displayValue ?? cap?.value}. Utilizado: ${used?.displayValue ?? used?.value}. Crecimiento: ${growth?.displayValue ?? growth?.value}.`)}
      ${calcInput({
        id: 'sto-free',
        label: `${es(capN, 1)} − ${es(usedN, 1)} = ______ TB`,
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
              label: `${es(usedN, 1)} / ${es(capN, 1)} × 100 = ______ %`,
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
            ${formulaBlock('Proyección', `Libre ≈ ${es(expected.storageFreeTb, 1)} TB ≈ ${es(freeGb, 0)} GB. Crecimiento ${es(growthN, 0)} GB/mes. ${es(freeGb, 0)} / ${es(growthN, 0)} ≈ ______ meses.`)}
            <p class="classify-note">Esta proyección supone crecimiento constante. No digas que el almacenamiento se agotará exactamente en ${es(expected.storageMonths, 2)} meses.</p>
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
            ${formulaBlock('Texto correcto', `Si el crecimiento continúa a un ritmo similar, el margen teórico es de aproximadamente ${es(expected.storageMonths, 1)} meses.`)}
            ${CalculatedSources({
              caseData: getSelectedCaseData(),
              metricId: 'calc-storage-used',
              resultLabel: 'Uso de almacenamiento',
              resultValue: `${es(expected.storageUsedPercent, 0)} %`,
            })}
            ${CalculatedSources({
              caseData: getSelectedCaseData(),
              metricId: 'calc-storage-margin',
              resultLabel: 'Margen teórico',
              resultValue: `≈ ${es(expected.storageMonths, 1)} meses`,
            })}
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
  const expected = expectedFromFacts(facts);
  const latN = num(facts, 'appLatencyNormal');
  const latP = num(facts, 'appLatencyPeak');
  const demN = num(facts, 'appDemandNormal');
  const demP = num(facts, 'appDemandPeak');
  return `
    <section class="builder-card measure-calc">
      <h3>PerformanceAnalyzer</h3>
      ${formulaBlock('Datos', `Respuesta habitual: ${disp(facts, 'appLatencyNormal')}. Respuesta pico: ${disp(facts, 'appLatencyPeak')}.`)}
      ${calcInput({
        id: 'perf-ratio',
        label: `${es(latP, 1)} / ${es(latN, 1)} = ______`,
        field: 'ratio',
        metricId: 'performance',
        value: slot.inputs.ratio,
        action: 'submit-performance',
        step: 'ratio',
      })}
      ${
        slot.inputs.ratioOk
          ? `
            ${formulaBlock('Relación', `El tiempo de respuesta en pico es aproximadamente ${es(expected.latencyRatio, 2)} veces el valor habitual.`)}
            <section class="panel warning-panel">
              <h4>Servicio disponible, pero responde lento</h4>
              <p>Disponibilidad evalúa si el servicio está operativo. Rendimiento analiza cómo responde.</p>
              ${FindTheData({ activities: [measureActivities.availableSlow], answers: activities })}
            </section>
            ${formulaBlock('Incremento de demanda', `(${es(demP, 0)} − ${es(demN, 0)}) / ${es(demN, 0)} × 100`)}
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
            ${formulaBlock('Demanda', `Los usuarios concurrentes pico observados son aproximadamente ${es(expected.demandIncreasePercent, 0)} % superiores al nivel habitual de referencia.`)}
            <p class="classify-note">No confundir con “la empresa creció ${es(expected.demandIncreasePercent, 0)} %”: compara niveles observados, no crecimiento empresarial.</p>
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

export function MetricEvidencePanel({ expected, evidence = [], facts = [] }) {
  const tiles = [
    ['Disponibilidad', `${formatEsNumber(expected.availabilityPercent, 2)} %`],
    ['MTTR', `${formatEsNumber(expected.mttrHours, 2)} h`],
    ['MTBF', `≈ ${formatEsNumber(expected.mtbfHours, 2)} h`],
    ['Storage', `${formatEsNumber(expected.storageUsedPercent, 0)} %`],
    ['Margen', `≈ ${formatEsNumber(expected.storageMonths, 1)} meses`],
    ['CPU pico', disp(facts, 'appCpuPeak')],
    ['RAM', disp(facts, 'appRamUsage')],
    ['Respuesta', `${disp(facts, 'appLatencyNormal')} → ${disp(facts, 'appLatencyPeak')}`],
    ['Concurrentes', `${disp(facts, 'appDemandNormal')} → ${disp(facts, 'appDemandPeak')}`],
  ]
    .map(([label, value]) => `<article class="metric-tile"><h4>${escapeHtml(label)}</h4><p>${escapeHtml(String(value))}</p></article>`)
    .join('');

  const saved = evidence
    .map((item) => `<li><strong>${escapeHtml(item.evidenceId)}</strong> — ${escapeHtml(item.interpretation)}</li>`)
    .join('');

  return `
    <section class="builder-card">
      <h3>MetricEvidencePanel</h3>
      <p>No hay semáforo automático. ${formatEsNumber(expected.storageUsedPercent, 0)} % de almacenamiento no es “malo” por sí solo: hace falta crecimiento, umbral, criticidad, políticas y capacidad futura.</p>
      <div class="metric-tiles">${tiles}</div>
      <h4>Evidencias guardadas para diagnosticar</h4>
      <ul>${saved || '<li>Todavía no has guardado evidencias.</li>'}</ul>
      <button class="btn btn--primary" type="button" data-action="save-capacity-evidence">Guardar evidencia de degradación bajo demanda</button>
    </section>
  `;
}

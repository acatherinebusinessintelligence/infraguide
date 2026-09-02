import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../Layout.js';
import { escapeHtml } from '../../utils/escape.js';
import { STAGE_GUIDES } from '../../data/stages/stageGuide.js';
import { MODEL_STAGE_META, INSUFFICIENT_MODEL, howBuiltForSection } from '../../data/testing/heladosBorealSolvedContent.js';
import { HowBuilt } from './HowBuilt.js';
import { EvidenceLink } from '../evidence/EvidenceLink.js';
import { getSelectedCaseData } from '../../state/appState.js';
import { asisSvgMarkup } from '../../export/asisSvg.js';
import { getConcept } from '../../data/pedagogy/concepts.js';
import { ConceptExplanationCard } from '../pedagogy/ConceptExplanationCard.js';
import { resolveCaseFacts, expectedFromFacts } from '../../state/measureModel.js';
import { documentedFindings } from '../../state/decideModel.js';
import { consultingDocumentSections } from '../../data/document/consultingSections.js';
import { generateConsultingReport } from '../../report/index.js';
import { renderDocumentBody } from '../../export/documentHtml.js';
import { createExportConfig } from '../../data/methodology/export.js';
import { consultingReportToExportModel } from '../../report/index.js';
import { MODEL_REPORT_BANNER, MODEL_REPORT_NOTICE } from '../../data/testing/heladosBorealSolvedState.js';

function shell(state, inner) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page model-solved-page">
        ${inner}
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function stageChrome(stageId) {
  const guide = STAGE_GUIDES[stageId];
  const meta = MODEL_STAGE_META[stageId] || {};
  return `
    <header class="section-heading">
      <p class="understand-kicker">Ejemplo guiado · disponible para consulta</p>
      <h1>${escapeHtml(guide?.name || '')} — RESUELTO</h1>
      <p><strong>Qué enseña.</strong> ${escapeHtml(meta.teaches || guide?.objective || '')}</p>
      <p><strong>Resultado construido.</strong> ${escapeHtml(meta.result || guide?.product || '')}</p>
      <p><strong>Sección del informe.</strong> ${escapeHtml(guide?.documentSection || '')}</p>
    </header>
    <p class="model-solved-note">Consulta el ejemplo. No hay formularios ni cierre de etapa: el caso ya está resuelto.</p>
  `;
}

function factRow({ label, value, fieldKey, page, relevance, interpretation, documentText, caseData }) {
  return `
    <article class="solved-fact">
      <h3>${escapeHtml(label)}</h3>
      <p><strong>Dato extraído:</strong> ${escapeHtml(value)}</p>
      <p><strong>Ubicación en el PDF:</strong> página ${escapeHtml(String(page))}</p>
      <p>${EvidenceLink({ caseData, fieldKey, extraLabel: `Abrir página ${page}` })}</p>
      <p><strong>Relevancia:</strong> ${escapeHtml(relevance)}</p>
      <p><strong>Interpretación:</strong> ${escapeHtml(interpretation)}</p>
      <p><strong>Texto incorporado al documento:</strong> ${escapeHtml(documentText)}</p>
      ${HowBuilt({
        steps: [
          { label: 'PDF', text: `Página ${page}` },
          { label: 'EVIDENCIA', text: fieldKey },
          { label: 'DATO', text: `${label}: ${value}` },
          { label: 'INTERPRETACIÓN', text: interpretation },
          { label: 'TEXTO DEL INFORME', text: documentText },
        ],
      })}
    </article>
  `;
}

export function SolvedUnderstand({ state }) {
  const caseData = getSelectedCaseData();
  const facts = [
    factRow({
      caseData,
      label: 'Contexto de la empresa',
      value: 'Helados Boreal S.A.S., planta y centro de datos en Bogotá, CD en Medellín y Cali',
      fieldKey: 'organizationName',
      page: 2,
      relevance: 'Define el alcance geográfico y el tipo de operación que la infraestructura debe sostener.',
      interpretation: 'No se trata de un retail genérico: hay planta, frío y facturación concentrada en Bogotá.',
      documentText: state.documentSections?.context?.text || '',
    }),
    factRow({
      caseData,
      label: 'Usuarios y operación',
      value: '235 usuarios con acceso; ~185 concurrentes en temporada alta',
      fieldKey: 'systemUsers',
      page: 2,
      relevance: 'Dimensiona identidad, concurrencia y el pico que luego aparece en MEDIR.',
      interpretation: 'La concurrencia de temporada es el contexto del pico de CPU/latencia, no un dato de capacidad por sí solo.',
      documentText: state.documentSections?.usersAndOperations?.text || '',
    }),
    factRow({
      caseData,
      label: 'Servicios tecnológicos',
      value: 'ERP, producción, cadena de frío, ventas web y archivos',
      fieldKey: 'serviceErp',
      page: 3,
      relevance: 'Permite separar servicios críticos de los de criticidad media.',
      interpretation: 'Archivos no se diagnostica como si fuera el ERP.',
      documentText: state.documentSections?.services?.text || '',
    }),
    factRow({
      caseData,
      label: 'Servicios críticos',
      value: 'ERP, producción y cadena de frío, con criticidad declarada en la página 3',
      fieldKey: 'serviceErpCriticality',
      page: 3,
      relevance: 'Justifica por qué el dictamen prioriza facturación, despacho y frío.',
      interpretation: '“Crítico” en el PDF es una declaración de negocio; el SPOF se demuestra después con dependencia.',
      documentText: state.documentSections?.criticalServices?.text || '',
    }),
    factRow({
      caseData,
      label: 'Restricciones',
      value: 'COP 180 millones / 12 meses; comité COP 60 millones; ERP no reemplazable en 18 meses',
      fieldKey: 'budgetLimit',
      page: 9,
      relevance: 'Condiciona DECIDIR. Una alternativa que ignore estas cifras no es defendible.',
      interpretation: 'El segundo firewall (COP 68 millones) exige comité. El recambio de ERP queda fuera de alcance.',
      documentText: state.documentSections?.constraints?.text || '',
    }),
  ].join('');

  return shell(
    state,
    `
      ${stageChrome(1)}
      <section class="stack">${facts}</section>
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedRepresent({ state }) {
  const caseData = getSelectedCaseData();
  const items = state.analysis?.represent?.inventory?.items ?? [];
  const chains = [
    {
      nodes: [
        { name: 'Usuarios / planta' },
        { name: 'Red interna' },
        { name: 'FW-01' },
        { name: 'ERP-APP01' },
        { name: 'ERP-DB01' },
      ],
    },
    {
      nodes: [{ name: 'Sensores' }, { name: 'IOT-GW01' }, { name: 'COLD-APP01' }],
    },
  ];
  const rows = items
    .map(
      (item) => `
        <article class="solved-fact">
          <h3>${escapeHtml(item.name)}</h3>
          <p><strong>¿Dónde aparece en el PDF?</strong> ${escapeHtml(item.page ? `Página ${item.page}` : 'Inventario AS-IS del caso, contrastado con las páginas 4 a 6.')}</p>
          <p><strong>¿Qué servicio soporta?</strong> ${escapeHtml(item.service)}</p>
          <p><strong>¿De qué depende?</strong> ${escapeHtml(item.dependsOn || 'La cadena AS-IS documentada para ese servicio.')}</p>
          <p><strong>¿Qué ocurriría si falla?</strong> ${escapeHtml(item.ifFails || item.reason)}</p>
          <p><strong>¿Por qué se considera relevante?</strong> ${escapeHtml(item.reason)}</p>
          <p><strong>¿Cómo aparece en el informe?</strong> Inventario y arquitectura AS-IS, no como TO-BE.</p>
        </article>
      `,
    )
    .join('');

  return shell(
    state,
    `
      ${stageChrome(2)}
      <section class="panel">
        <h2>Diagrama AS-IS terminado</h2>
        ${asisSvgMarkup(chains)}
        <p>${escapeHtml(state.analysis?.represent?.asIs?.description || '')}</p>
      </section>
      <section class="stack">
        <h2>Inventario relevante</h2>
        ${rows}
        <article class="solved-fact">
          <h3>FW-01</h3>
          <p><strong>¿Dónde aparece en el PDF?</strong> Página 5. ${EvidenceLink({ caseData, fieldKey: 'mainFirewallCount' })}</p>
          <p><strong>¿De qué depende?</strong> Enlaces de 500 Mbps y 200 Mbps que convergen en este appliance.</p>
          <p><strong>¿Qué ocurriría si falla?</strong> VPN de sedes y acceso remoto se interrumpen (incidente B, 1 h 35 min, página 8).</p>
        </article>
      </section>
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedIdentify({ state }) {
  const records = Object.values(state.analysis?.represent?.spof?.records || {});
  const cards = records
    .map(
      (item) => `
        <article class="solved-fact">
          <h3>${escapeHtml(item.name)}</h3>
          <p><strong>Componente:</strong> ${escapeHtml(item.name)}</p>
          <p><strong>Evidencia:</strong> ${escapeHtml(item.justification)}</p>
          <p><strong>Dependencia:</strong> servicios que atraviesan este punto único.</p>
          <p><strong>Modo de falla:</strong> ${escapeHtml(item.failureMode || 'Falla o reinicio del componente')}</p>
          <p><strong>Servicio afectado / impacto:</strong> ${escapeHtml(item.impact)}</p>
          <p><strong>Control existente:</strong> ${escapeHtml(item.control || 'No documentado')}</p>
          <p><strong>Brecha:</strong> ${escapeHtml(item.gap || '')}</p>
          <p><strong>Tratamiento recomendado:</strong> ${escapeHtml(item.treatment || '')}</p>
        </article>
      `,
    )
    .join('');

  return shell(
    state,
    `
      ${stageChrome(3)}
      <section class="stack">
        ${cards}
        <aside class="panel">
          <h2>Qué enseña este SPOF</h2>
          <p>Un componente crítico no siempre es un SPOF: la criticidad declara importancia de negocio; el SPOF se demuestra con dependencia única e impacto de falla.</p>
          <p>Dos proveedores o dos enlaces de Internet no garantizan redundancia si convergen en un único equipo (FW-01).</p>
          <p>La criticidad debe justificarse mediante dependencia e impacto, no mediante la etiqueta del catálogo de servicios.</p>
        </aside>
      </section>
      ${HowBuilt({ steps: howBuiltForSection('architecture') })}
      <p>${modelNav()}</p>
    `,
  );
}

function metricWalkthrough(id, facts, expected) {
  const concept = getConcept(id);
  if (!concept) return '';
  const examples = (concept.workedExample || [])
    .map((item) => `<p><strong>${escapeHtml(item.heading)}.</strong> ${escapeHtml(item.body)}</p>`)
    .join('');
  const result =
    id === 'availability'
      ? `≈ ${expected?.availabilityPercent?.toFixed?.(2) || '99,51'} %`
      : id === 'mttr'
        ? `≈ ${expected?.mttrHours?.toFixed?.(2) || '2,13'} h`
        : id === 'storage'
          ? '80 % de uso; ≈ 1,85 meses al umbral pedagógico 85 %; ≈ 7,4 meses al agotamiento teórico'
          : '';
  return `
    <article class="solved-fact guided-calc">
      <h3>${escapeHtml(concept.name)}</h3>
      ${ConceptExplanationCard({ conceptId: id, open: true })}
      <p><strong>Qué es.</strong> ${escapeHtml(concept.what)}</p>
      <p><strong>Para qué sirve.</strong> ${escapeHtml(concept.whatFor)}</p>
      <p><strong>Por qué se calcula.</strong> ${escapeHtml(concept.why)}</p>
      <p><strong>Fórmula.</strong> ${escapeHtml(concept.formula)}</p>
      ${examples}
      <p><strong>Resultado.</strong> ${escapeHtml(result || concept.workedExample?.find((item) => item.heading === 'Resultado')?.body || '')}</p>
      <p><strong>Interpretación.</strong> ${escapeHtml(concept.interpretation)}</p>
      <p><strong>Limitación.</strong> ${escapeHtml(concept.limitation)}</p>
      <p><strong>Error común.</strong> ${escapeHtml(concept.commonError)}</p>
    </article>
  `;
}

export function SolvedMeasure({ state }) {
  const caseData = getSelectedCaseData();
  const facts = resolveCaseFacts(caseData);
  const expected = expectedFromFacts(facts);
  const insufficient = INSUFFICIENT_MODEL.map(
    (item) => `
      <article class="insufficient-card">
        <h4>${escapeHtml(item.name)}</h4>
        <p class="pedagogy-feedback pedagogy-feedback--info" role="status"><strong>INFORMACIÓN INSUFICIENTE.</strong> ${escapeHtml(item.missing)}</p>
      </article>
    `,
  ).join('');

  return shell(
    state,
    `
      ${stageChrome(4)}
      <section class="stack">
        <article class="solved-fact">
          <h3>Duración acumulada de incidentes</h3>
          <p>Suma de duraciones del registro (página 8): 10 h 40 min = 10,67 h. Es un cálculo, no una cifra literal del PDF.</p>
        </article>
        ${metricWalkthrough('availability', facts, expected)}
        ${metricWalkthrough('mttr', facts, expected)}
        ${metricWalkthrough('mtbf', facts, expected)}
        ${metricWalkthrough('storage', facts, expected)}
        <article class="solved-fact">
          <h3>Utilización de almacenamiento</h3>
          <p><strong>Datos:</strong> 19,2 TB usados / 24 TB (página 6).</p>
          <p><strong>Fórmula:</strong> uso = usado / capacidad × 100.</p>
          <p><strong>Sustitución:</strong> 19,2 / 24 × 100 = 80 %.</p>
          <p><strong>Interpretación:</strong> 80 % es utilización observada, no un umbral aprobado en el PDF.</p>
        </article>
        <article class="solved-fact">
          <h3>Capacidad disponible</h3>
          <p>24 − 19,2 = 4,8 TB libres. Página 6.</p>
        </article>
        <article class="solved-fact">
          <h3>Tiempo hasta el umbral pedagógico (85 %)</h3>
          <p>Margen 1,2 TB / 0,65 TB/mes ≈ 1,85 meses. El 85 % es umbral pedagógico, no un acuerdo del caso.</p>
        </article>
        <article class="solved-fact">
          <h3>Tiempo teórico hasta agotamiento</h3>
          <p>4,8 TB / 0,65 TB/mes ≈ 7,4 meses, si el crecimiento se mantuviera. Es una proyección, no una fecha del PDF.</p>
        </article>
        <article class="solved-fact">
          <h3>CPU, memoria, latencia y concurrencia</h3>
          <p>CPU pico ERP-APP01 92 %; RAM pico 88 %; latencia habitual 1,4 s y pico 4,8 s; 181 usuarios concurrentes (página 7).</p>
          <p>${EvidenceLink({ caseData, fieldKey: 'appCpuPeak', extraLabel: 'Abrir página 7' })}</p>
          <p><strong>Hallazgo relacionado:</strong> saturación del ERP en el pico. Destino: desempeño y capacidad + hallazgos.</p>
        </article>
        <h2>No se presentan como calculados</h2>
        <div class="insufficient-grid">${insufficient}</div>
      </section>
      ${HowBuilt({ steps: howBuiltForSection('performance') })}
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedDiagnose({ state }) {
  const findings = documentedFindings(state);
  const cards = findings
    .map(
      (item) => `
        <article class="solved-fact" id="${escapeHtml(item.findingId)}">
          <h3>${escapeHtml(item.findingId)} · ${escapeHtml(item.title)}</h3>
          <p><strong>Condición:</strong> ${escapeHtml(item.description || '')}</p>
          <p><strong>Evidencia:</strong> ${(item.evidenceIds || []).map((id) => escapeHtml(id)).join(', ')}</p>
          <p><strong>Criterio:</strong> ${escapeHtml(item.criterion || item.justification || '')}</p>
          <p><strong>Causa o deficiencia:</strong> ${escapeHtml(item.cause || '')}</p>
          <p><strong>Impacto:</strong> ${escapeHtml(item.impact)}</p>
          <p><strong>Riesgo:</strong> ${escapeHtml(item.risk || '')}</p>
          <p><strong>Recomendación:</strong> ${escapeHtml(item.recommendation || '')}</p>
          <p><strong>Criterio de aceptación:</strong> ${escapeHtml(item.acceptance || '')}</p>
          ${HowBuilt({
            title: 'VER CÓMO SE CONSTRUYÓ',
            steps: [
              { label: 'DATO', text: item.description || item.title },
              { label: 'INTERPRETACIÓN', text: item.justification || '' },
              { label: 'CONDICIÓN', text: item.description || '' },
              { label: 'IMPACTO', text: item.impact || '' },
              { label: 'RIESGO', text: item.risk || '' },
              { label: 'RECOMENDACIÓN', text: item.recommendation || '' },
            ],
          })}
        </article>
      `,
    )
    .join('');

  return shell(
    state,
    `
      ${stageChrome(5)}
      <section class="stack">${cards}</section>
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedGovern({ state }) {
  const govern = state.analysis?.govern || {};
  function block(title, rows, explain) {
    const items = (rows || [])
      .map(
        (item) => `
          <article class="solved-fact">
            <p><strong>Hallazgo relacionado:</strong> ${escapeHtml(item.findingId)}</p>
            <p><strong>Práctica o control:</strong> ${escapeHtml(item.practice || item.control || item.decision || '')}</p>
            <p><strong>Aplicación concreta:</strong> ${escapeHtml(item.action || item.control || item.situation || item.problem || '')}</p>
            <p><strong>Responsable:</strong> ${escapeHtml(item.owner || (item.responsibleIds || []).join(', ') || '')}</p>
            <p><strong>Indicador:</strong> ${escapeHtml(item.indicator || '')}</p>
            <p><strong>Evidencia de cumplimiento:</strong> el diseño del control queda ilustrado en este ejemplo; el caso de trabajo deberá aportar evidencia propia.</p>
          </article>
        `,
      )
      .join('');
    return `<section class="stack"><h2>${escapeHtml(title)}</h2><p>${escapeHtml(explain)}</p>${items}</section>`;
  }

  return shell(
    state,
    `
      ${stageChrome(6)}
      ${block('ITIL', govern.itil, 'Se selecciona Change y Continuidad porque el PDF documenta un cambio sin reversa y un hueco de copia externa. No se copia el libro de ITIL.')}
      ${block('COBIT', govern.cobit, 'Se selecciona gobierno de resiliencia y capacidad: hay que decidir quién aprueba el tratamiento del SPOF y del NAS.')}
      ${block('ISO/IEC 27001', govern.iso27001, 'Se selecciona identidad, MFA y parches porque el PDF documenta bajas tardías, MFA 9/17 y 7 servidores rezagados.')}
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedDecide({ state }) {
  const recs = state.analysis?.decide?.recommendations ?? [];
  const rows = recs
    .map((item) => {
      const alts = (item.alternatives || [])
        .map((alt) => `<li>${escapeHtml(alt.title)} — puntaje ${escapeHtml(String(alt.score))}${alt.selected ? ' (seleccionada)' : ''}</li>`)
        .join('');
      return `
        <article class="solved-fact">
          <h3>${escapeHtml(item.decision)}</h3>
          <p><strong>Hallazgos:</strong> ${(item.findingIds || []).join(', ')}</p>
          <p><strong>Alternativas evaluadas</strong></p>
          <ul>${alts}</ul>
          <p><strong>CAPEX/OPEX:</strong> ${escapeHtml(item.costText || '')}</p>
          <p><strong>Restricción / limitación:</strong> ${escapeHtml(item.riskText || '')}</p>
          <p><strong>Métrica de éxito:</strong> ${escapeHtml(item.metricText || '')}</p>
        </article>
      `;
    })
    .join('');

  return shell(
    state,
    `
      ${stageChrome(7)}
      <section class="panel">
        <p>Los puntajes son un supuesto de método pedagógico. Los costos, el umbral de comité y la prohibición de reemplazar el ERP salen del PDF (página 9). Se comparan esas alternativas porque tratan hallazgos evidentes y caben —o deben elevarse a comité— en el presupuesto de COP 180 millones.</p>
        <p>${escapeHtml(state.analysis?.decide?.strategyText || state.documentSections?.strategy?.text || '')}</p>
      </section>
      <section class="stack">${rows}</section>
      ${HowBuilt({ steps: howBuiltForSection('alternatives') })}
      <p>${modelNav()}</p>
    `,
  );
}

export function SolvedBuild({ state }) {
  const report = generateConsultingReport(state);
  const exportModel = consultingReportToExportModel(report, createExportConfig());
  const sections = consultingDocumentSections
    .map((spec) => {
      const text =
        spec.key === 'dictamen'
          ? state.documentSections?.conclusions?.text
          : spec.key === 'findings'
            ? documentedFindings(state).map((item) => item.title).join(' · ')
            : state.documentSections?.[spec.academicKeys?.[0]]?.text || '';
      return `
        <article class="solved-fact">
          <h3>${escapeHtml(spec.number)}. ${escapeHtml(spec.title)} — RESUELTO</h3>
          <p>${escapeHtml(text || 'Contenido ensamblado en el informe modelo.')}</p>
          <p><strong>Etapas que lo alimentan:</strong> ${escapeHtml((spec.feeds || []).join(', '))}</p>
          ${HowBuilt({ steps: howBuiltForSection(spec.key) })}
        </article>
      `;
    })
    .join('');

  return shell(
    state,
    `
      ${stageChrome(8)}
      <p class="model-banner" role="status"><strong>${escapeHtml(MODEL_REPORT_BANNER)}</strong></p>
      <p>${escapeHtml(MODEL_REPORT_NOTICE)}</p>
      <p>
        <a class="btn btn--primary" href="#/informe" data-nav="/informe">VER INFORME FINAL MODELO</a>
        <a class="btn" href="#/exportar" data-nav="/exportar">Exportar HTML / Word / PDF</a>
      </p>
      <section class="stack">${sections}</section>
      <div class="report-preview-paper">${renderDocumentBody(exportModel)}</div>
    `,
  );
}

export function SolvedStagePage(state, stageId) {
  if (stageId === 1) return SolvedUnderstand({ state });
  if (stageId === 2) return SolvedRepresent({ state });
  if (stageId === 3) return SolvedIdentify({ state });
  if (stageId === 4) return SolvedMeasure({ state });
  if (stageId === 5) return SolvedDiagnose({ state });
  if (stageId === 6) return SolvedGovern({ state });
  if (stageId === 7) return SolvedDecide({ state });
  if (stageId === 8) return SolvedBuild({ state });
  return SolvedUnderstand({ state });
}

function modelNav() {
  return `
    <nav class="export-actions">
      <a class="btn" href="#/ruta" data-nav="/ruta">Volver a la ruta resuelta</a>
      <a class="btn" href="#/informe" data-nav="/informe">VER INFORME FINAL MODELO</a>
      <a class="btn" href="#/exportar" data-nav="/exportar">Exportar</a>
    </nav>
  `;
}

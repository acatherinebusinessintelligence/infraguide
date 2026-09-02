import { appCopy } from '../data/copy.js';
import {
  representSubstages,
  representFinders,
  representMethodSteps,
  representMethodValues,
  architectureNodes,
  pickerCatalog,
  caseIncidents,
  posChainExample,
  posGuideQuestions,
  spofActivities,
  representCheckpoint,
  representClosing,
} from '../data/methodology/represent.js';
import { getRepresentSnapshot } from '../state/representActions.js';
import {
  getCriticalServiceList,
  getDiagramNode,
  uniqueChainNodes,
  principalAsIsNodes,
  getNodeById,
} from '../state/representModel.js';
import { formatTimestamp } from '../state/understandModel.js';
import { getDocumentSectionByKey } from '../data/document/sections.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { TraceabilityPanel } from '../components/TraceabilityPanel.js';
import { FindTheData } from '../components/FindTheData.js';
import { ComponentPicker, RelevantInventoryBuilder } from '../components/represent/InventoryTools.js';
import { DependencyBuilder, AsIsDiagram, AsIsWriter } from '../components/represent/DependencyTools.js';
import {
  IncidentEvidenceLink,
  ArchitecturalEvidence,
  SpofAnalyzer,
  SpofMatrix,
  firewallPedagogy,
} from '../components/represent/SpofTools.js';
import { escapeHtml } from '../utils/escape.js';
import { ContextualHelp } from '../components/pedagogy/ContextualHelp.js';
import { StageLockedView } from '../components/StageLockedView.js';
import { canWorkStage } from '../state/stageGates.js';
import { isModelSolved } from '../state/caseMode.js';
import { SolvedStagePage } from '../components/model/SolvedStages.js';
import { TermLink } from '../data/pedagogy/glossary.js';

export function RepresentPage(state) {
  if (isModelSolved(state)) {
    const identify = Number(state.analysis?.represent?.currentSubstage) === 6;
    return SolvedStagePage(state, identify ? 3 : 2);
  }

  if (!state.selectedCase) {
    return `
      <div class="app-shell">
        ${AppHeader({ state })}
        <main id="contenido" class="page">
          <section class="panel">
            <h1>REPRESENTAR</h1>
            <p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p>
            <a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>
          </section>
        </main>
        ${SiteFooter()}
      </div>
    `;
  }

  if (!canWorkStage(state, 2)) {
    return shell(state, StageLockedView({ state, stageId: 2 }));
  }

  const { represent, documents, completion } = getRepresentSnapshot(state);
  const criticalServices = getCriticalServiceList(state);
  const substage = representSubstages.find((item) => item.id === represent.currentSubstage) ?? representSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page represent-page">
        ${renderProgress(represent.currentSubstage, substage)}
        <p class="principle">AS-IS significa cómo funciona actualmente la infraestructura.</p>
        ${ContextualHelp({
          termId: 'spof',
          why: 'El diagrama y el SPOF explican dependencias antes de calcular o recomendar.',
          where: 'PDF, páginas 4 a 6 y 8.',
          usedFor: 'Sustentar arquitectura, resiliencia y riesgos.',
          documentTarget: 'Arquitectura y resiliencia.',
        })}
        <aside class="panel warning-panel">
          <p><strong>NO dibujes todavía cómo debería quedar.</strong></p>
          <p><strong>AS-IS</strong> = estado actual. <strong>TO-BE</strong> = estado futuro. En esta etapa solo se construye AS-IS.</p>
        </aside>
        ${MethodCard({
          steps: representMethodSteps,
          values: representMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, represent, documents, completion, error, criticalServices)}
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function shell(state, inner) {
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page"><section class="panel">${inner}</section></main>
      ${SiteFooter()}
    </div>
  `;
}

function renderProgress(current, substage) {
  const steps = representSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/representar/${item.id}" data-nav="/representar/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');

  return `
    <header class="understand-progress">
      <p class="understand-kicker">REPRESENTAR</p>
      <h1>${current} de 7 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/representar/${prev}" data-nav="/representar/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/representar/${next}" data-nav="/representar/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderSubstage(id, represent, documents, completion, error, criticalServices) {
  if (id === 1) return renderCriticalReview(criticalServices);
  if (id === 2) return renderComponents(represent, criticalServices);
  if (id === 3) return renderInventory(represent, criticalServices, error);
  if (id === 4) return renderDependencies(represent, criticalServices, error);
  if (id === 5) return renderAsIs(represent, criticalServices, error);
  if (id === 6) return renderSpof(represent, criticalServices, error);
  return renderReview(represent, documents, completion, criticalServices);
}

function serviceChooser(criticalServices, activeId, action = 'select-represent-service') {
  if (!criticalServices.length) {
    return `
      <p class="form-error">No hay servicios críticos documentados. Vuelve a COMPRENDER y justifica al menos tres.</p>
      <a class="btn btn--primary" href="#/comprender/4" data-nav="/comprender/4">Abrir criticidad</a>
    `;
  }
  return `
    <div class="chip-row">
      ${criticalServices
        .map(
          (service) => `
            <button
              class="chip${service.id === activeId ? ' is-correct' : ''}"
              type="button"
              data-action="${action}"
              data-service-id="${escapeHtml(service.id)}"
            >${escapeHtml(service.name)}</button>
          `,
        )
        .join('')}
    </div>
  `;
}

function renderCriticalReview(criticalServices) {
  const cards = criticalServices
    .map(
      (service) => `
        <article class="service-card is-selected">
          <h4>${escapeHtml(service.name)}</h4>
          <p>${escapeHtml(service.description)}</p>
          <p>Criticidad propuesta: ${escapeHtml(service.studentCriticality || 'justificada')}</p>
          <p class="classify-note">${escapeHtml(service.justification || '')}</p>
        </article>
      `,
    )
    .join('');

  return `
    <section class="stack">
      <h2>Tus servicios críticos seleccionados</h2>
      <p>Se reutilizan los servicios que ya justificaste en COMPRENDER. No vuelves a pedirlos desde cero.</p>
      <div class="service-grid">${cards || '<p>Todavía no hay servicios críticos en el documento.</p>'}</div>
      ${navRow(null, 2)}
    </section>
  `;
}

function renderComponents(represent, criticalServices) {
  const active = criticalServices.find((item) => item.id === represent.activeServiceId) ?? criticalServices[0];
  const selectedIds = represent.serviceComponents[active?.id] ?? [];
  return `
    <section class="stack">
      <h2>¿Qué componentes realmente aparecen en el caso?</h2>
      ${SourceFinder({ finder: representFinders.components })}
      <section class="panel case-facts">
        <h3>Componentes observados</h3>
        <ul>
          ${architectureNodes
            .filter((item) => ['applications', 'data', 'storage', 'security', 'connectivity', 'continuity', 'users'].includes(item.category))
            .slice(0, 18)
            .map((item) => `<li>${escapeHtml(item.name)}</li>`)
            .join('')}
        </ul>
      </section>
      <h3>Servicio a relacionar</h3>
      ${serviceChooser(criticalServices, active?.id)}
      ${ComponentPicker({ service: active, items: pickerCatalog, selectedIds })}
      ${navRow(1, 3)}
    </section>
  `;
}

function renderInventory(represent, criticalServices, error) {
  return `
    <section class="stack">
      <h2>Inventario relevante</h2>
      ${SourceFinder({ finder: representFinders.inventory })}
      ${RelevantInventoryBuilder({
        nodes: architectureNodes,
        selectedIds: represent.inventory.selectedIds,
        relevance: represent.inventory.relevance,
        serviceLinks: represent.inventory.serviceLinks,
        services: criticalServices,
        draft: represent.inventory.draft,
        error,
      })}
      ${navRow(2, 4)}
    </section>
  `;
}

function renderDependencies(represent, criticalServices, error) {
  const active = criticalServices.find((item) => item.id === represent.activeServiceId) ?? criticalServices[0];
  const chain = represent.asIs.chains[active?.id] ?? [];
  const exampleNodes = posChainExample.map(getDiagramNode).filter(Boolean);
  return `
    <section class="stack">
      <h2>¿Cómo llega un usuario al servicio?</h2>
      ${SourceFinder({ finder: representFinders.dependencies })}
      ${serviceChooser(criticalServices, active?.id)}
      ${DependencyBuilder({ nodes: architectureNodes, chain, service: active, error })}
      ${AsIsDiagram({ chain, service: active })}
      <section class="panel pedagogy">
        <h3>Ejemplo guiado — ERP Boreal</h3>
        <p>Cadena posible: ${exampleNodes.map((item) => item.name).join(' → ')}.</p>
        ${FindTheData({
          activities: posGuideQuestions,
          answers: represent.spof.activities,
        })}
      </section>
      ${navRow(3, 5)}
    </section>
  `;
}

function renderAsIs(represent, criticalServices, error) {
  const active = criticalServices.find((item) => item.id === represent.activeServiceId) ?? criticalServices[0];
  const chain = represent.asIs.chains[active?.id] ?? [];
  const traces = chain
    .map(getDiagramNode)
    .filter(Boolean)
    .map((node) => ({
      label: node.name,
      value: `Fuente: ${node.sourceLabel}. ${node.characteristics}`,
    }));
  return `
    <section class="stack">
      <h2>Construir AS-IS</h2>
      ${serviceChooser(criticalServices, active?.id)}
      ${AsIsDiagram({ chain, service: active })}
      ${
        traces.length
          ? TraceabilityPanel({
              items: traces,
              kicker: 'Trazabilidad de nodos',
              title: active?.name ?? 'AS-IS',
            })
          : ''
      }
      ${AsIsWriter({ draft: represent.asIs.description, error })}
      ${navRow(4, 6)}
    </section>
  `;
}

function renderSpof(represent, criticalServices, error) {
  const asIsIds = uniqueChainNodes(represent.asIs.chains);
  const asIsNodes = asIsIds.map(getDiagramNode).filter(Boolean);
  const principals = principalAsIsNodes(represent.asIs.chains);
  const activeId = represent.spof.activeComponentId || principals[0]?.id || asIsNodes[0]?.id;
  const node = getNodeById(activeId);
  const record = represent.spof.records[activeId] ?? {};
  const linkedIncidents = caseIncidents.filter((incident) => (represent.incidents[incident.id] ?? []).includes(activeId));
  return `
    <section class="stack">
      <h2>¿Qué pasa si este componente falla?</h2>
      <p>${TermLink({ termId: 'spof' })} no es lo mismo que ${TermLink({ termId: 'redundancia' })} aparente. Pregunta: ¿existe alternativa real para el mismo servicio?</p>
      ${SourceFinder({ finder: representFinders.spof })}
      ${firewallPedagogy()}
      ${IncidentEvidenceLink({ links: represent.incidents, components: asIsNodes.length ? asIsNodes : architectureNodes.filter((item) => item.principal) })}
      <h3>Componentes del AS-IS</h3>
      <div class="chip-row">
        ${asIsNodes
          .map(
            (item) => `
              <button class="chip${item.id === activeId ? ' is-correct' : ''}" type="button" data-action="open-spof" data-component-id="${escapeHtml(item.id)}">
                ${escapeHtml(item.name)}
              </button>
            `,
          )
          .join('') || '<p>Construye primero una cadena AS-IS.</p>'}
      </div>
      ${ArchitecturalEvidence({ node, incidents: linkedIncidents, record })}
      ${SpofAnalyzer({ node, record, services: criticalServices, error })}
      ${FindTheData({ activities: spofActivities, answers: represent.spof.activities })}
      ${SpofMatrix({ nodes: principals.length ? principals : asIsNodes, records: represent.spof.records, error })}
      ${
        represent.spof.reviewRequired
          ? `<p class="form-error">Hay hallazgos SPOF marcados como REVISIÓN REQUERIDA porque el AS-IS cambió.</p>
             <button class="btn btn--ghost-dark" type="button" data-action="ack-spof-review">Marcar revisiones como atendidas después de actualizar justificaciones</button>`
          : ''
      }
      ${navRow(5, 7)}
    </section>
  `;
}

function renderReview(represent, documents, completion, criticalServices) {
  const rows = [
    ['Inventario relevante', completion.inventory],
    ['Arquitectura AS-IS', completion.asIs],
    ['SPOF', completion.spof],
  ]
    .map(
      ([label, done]) => `
        <li class="review-item${done ? ' is-done' : ''}">
          <span>${escapeHtml(label)}</span>
          <strong>${done ? '✓' : 'Pendiente'}</strong>
        </li>
      `,
    )
    .join('');

  const docKeys = ['inventory', 'asis', 'spof'];
  const traces = docKeys
    .map((key) => {
      const entry = documents[key];
      if (!entry) return '';
      const section = getDocumentSectionByKey(key);
      const nodes = (entry.nodes ?? [])
        .map((node) => `<li>Nodo: ${escapeHtml(node.name)}. Fuente: ${escapeHtml(node.sourceLabel)}.</li>`)
        .join('');
      const sources = (entry.sources ?? []).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join('');
      return `
        <article class="trace-doc">
          <h3>${escapeHtml(section ? `${section.number}. ${section.title}` : key)}</h3>
          <p>${escapeHtml(entry.text)}</p>
          ${nodes ? `<ul>${nodes}</ul>` : ''}
          ${sources ? `<p><strong>Fuentes utilizadas</strong></p><ul>${sources}</ul>` : ''}
          ${entry.reviewRequired ? '<p class="form-error">REVISIÓN REQUERIDA</p>' : ''}
          <p>Última actualización: ${escapeHtml(formatTimestamp(entry.lastUpdated))}</p>
        </article>
      `;
    })
    .join('');

  return `
    <section class="stack">
      <h2>Lo que ya construiste</h2>
      <p>Servicios críticos reutilizados: ${criticalServices.map((item) => item.name).join(', ') || 'ninguno'}.</p>
      <ul class="review-list">${rows}</ul>
      ${completion.reviewPending ? '<p class="form-error">Hay análisis SPOF en revisión requerida. Actualízalos antes de cerrar.</p>' : ''}
      ${traces}
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: representCheckpoint, answers: represent.checkpoint })}
      </section>
      ${
        represent.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(representClosing.lead)}</p>
              <p>${escapeHtml(representClosing.next)}</p>
              <p><strong>${escapeHtml(representClosing.nextStage)}</strong> — ${escapeHtml(representClosing.nextHint)}</p>
              <a class="btn btn--primary" href="#/medir" data-nav="/medir">Continuar a MEDIR</a>
              <a class="btn btn--ghost-dark" href="#/ruta" data-nav="/ruta">Volver a la ruta de análisis</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-represent" ${completion.ready ? '' : 'disabled'}>
              Finalizar REPRESENTAR
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan inventario, AS-IS, matriz SPOF o hay revisiones pendientes.</p>'}
          `
      }
      ${navRow(6, null)}
    </section>
  `;
}

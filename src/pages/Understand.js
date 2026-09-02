import { appCopy } from '../data/copy.js';
import {
  understandSubstages,
  understandFinders,
  understandMethodSteps,
  understandMethodValues,
  contextEvidence,
  contextSlots,
  contextTemplate,
  contextExample,
  userActors,
  userCategories,
  operationWindows,
  scheduleQuestion,
  operationsExample,
  serviceComponentItems,
  serviceComponentCategories,
  understandServices,
  criticalityCriteria,
  wmsPedagogy,
  hoursCriticalityQuestion,
  restrictionItems,
  restrictionExamples,
  checkpointQuestions,
  closingMessages,
} from '../data/methodology/understand.js';
import { getUnderstandSnapshot } from '../state/understandActions.js';
import { relevantContextEvidence, formatTimestamp, getServiceById } from '../state/understandModel.js';
import { getDocumentSectionByKey } from '../data/document/sections.js';
import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { MethodCard } from '../components/MethodCard.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { TraceabilityPanel } from '../components/TraceabilityPanel.js';
import { FindTheData } from '../components/FindTheData.js';
import { EvidencePicker, ContextBuilder, ClassifyBoard, OperationalContextBuilder } from '../components/understand/EvidencePicker.js';
import {
  ServiceSelector,
  CriticalityBuilder,
  CriticalServiceCompare,
  CriticalServicesTableBuilder,
} from '../components/understand/ServiceTools.js';
import { RestrictionClassifier, RestrictionBuilder } from '../components/understand/RestrictionTools.js';
import { EvidenceLink } from '../components/evidence/EvidenceLink.js';
import { getSelectedCaseData } from '../state/appState.js';
import { escapeHtml } from '../utils/escape.js';
import { ContextualHelp } from '../components/pedagogy/ContextualHelp.js';

export function UnderstandPage(state) {
  if (!state.selectedCase) {
    return `
      <div class="app-shell">
        ${AppHeader({ state })}
        <main id="contenido" class="page">
          <section class="panel">
            <h1>COMPRENDER</h1>
            <p>${escapeHtml(appCopy.caseWork.noCaseYet)}</p>
            <a class="btn btn--primary" href="#/ruta" data-nav="/ruta">Seleccionar caso</a>
          </section>
        </main>
        ${SiteFooter()}
      </div>
    `;
  }

  const { understand, documents, completion } = getUnderstandSnapshot(state);
  const substage = understandSubstages.find((item) => item.id === understand.currentSubstage) ?? understandSubstages[0];
  const error = state.documentError;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page understand-page">
        ${renderProgress(understand.currentSubstage, substage)}
        <p class="principle">Antes de analizar servidores, primero comprende qué necesita proteger la infraestructura.</p>
        ${ContextualHelp({
          termId: 'baseline',
          why: 'Sin contexto, usuarios y restricciones no puedes justificar criticidad ni alcance.',
          where: 'PDF, páginas 2, 3 y 9.',
          usedFor: 'Alimentar el alcance, el dictamen y el registro de evidencias.',
          documentTarget: 'Alcance, método y limitaciones.',
        })}
        ${MethodCard({
          steps: understandMethodSteps,
          values: understandMethodValues[substage.id],
          topic: substage.title,
        })}
        ${renderSubstage(substage.id, understand, documents, completion, error)}
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

function renderProgress(current, substage) {
  const steps = understandSubstages
    .map(
      (item) => `
        <li>
          <a class="substage-link${item.id === current ? ' is-active' : ''}" href="#/comprender/${item.id}" data-nav="/comprender/${item.id}">
            <span>${item.id}</span> ${escapeHtml(item.name)}
          </a>
        </li>
      `,
    )
    .join('');

  return `
    <header class="understand-progress">
      <p class="understand-kicker">COMPRENDER</p>
      <h1>${current} de 6 · ${escapeHtml(substage.name)}</h1>
      <ol class="substage-nav">${steps}</ol>
    </header>
  `;
}

function renderSubstage(id, understand, documents, completion, error) {
  if (id === 1) return renderOrganization(understand, error);
  if (id === 2) return renderUsers(understand, error);
  if (id === 3) return renderServices(understand, error);
  if (id === 4) return renderCriticality(understand, error);
  if (id === 5) return renderConstraints(understand, error);
  return renderReview(understand, documents, completion);
}

function navRow(prev, next) {
  return `
    <div class="substage-footer">
      ${prev ? `<a class="btn btn--ghost-dark" href="#/comprender/${prev}" data-nav="/comprender/${prev}">Anterior</a>` : '<span></span>'}
      ${next ? `<a class="btn btn--primary" href="#/comprender/${next}" data-nav="/comprender/${next}">Siguiente</a>` : ''}
    </div>
  `;
}

function renderOrganization(understand, error) {
  const selected = relevantContextEvidence(understand.context.selectedIds);
  const caseData = getSelectedCaseData();
  return `
    <section class="stack">
      <h2>¿Qué hace la organización?</h2>
      ${SourceFinder({ finder: understandFinders.organization })}
      <section class="panel case-facts">
        <h3>Contexto de la organización</h3>
        <p>Helados Boreal S.A.S. es una empresa colombiana mediana dedicada a la fabricación y comercialización de helados, postres congelados y productos de temporada. ${EvidenceLink({ caseData, fieldKey: 'activity', component: 'understand', activity: 'organization' })}</p>
        <ul>
          <li>Bogotá: planta, oficinas y centro de datos ${EvidenceLink({ caseData, fieldKey: 'plantCount', component: 'understand' })}</li>
          <li>Medellín y Cali: centros de distribución ${EvidenceLink({ caseData, fieldKey: 'distributionCenterCount', component: 'understand' })}</li>
          <li>Usuarios remotos de ventas y supervisión</li>
          <li>Tiendas propias, distribuidores, supermercados y clientes institucionales</li>
        </ul>
        <p>Usuarios con acceso a servicios tecnológicos: 235. ${EvidenceLink({ caseData, fieldKey: 'systemUsers', component: 'understand' })} En temporada alta, aproximadamente 185 usuarios concurrentes. ${EvidenceLink({ caseData, fieldKey: 'concurrentUsersHighSeason', component: 'understand' })}</p>
      </section>
      <h3>Selecciona la evidencia de contexto</h3>
      ${EvidencePicker({
        items: contextEvidence,
        selectedIds: understand.context.selectedIds,
      })}
      ${ContextBuilder({
        slots: contextSlots,
        fields: understand.context.fields,
        selectedEvidence: selected,
        template: contextTemplate,
        example: contextExample,
        draft: understand.context.draft,
        error,
      })}
      ${navRow(null, 2)}
    </section>
  `;
}

function renderUsers(understand, error) {
  return `
    <section class="stack">
      <h2>¿Quién utiliza los servicios y cuándo?</h2>
      ${SourceFinder({ finder: understandFinders.users })}
      <h3>Clasifica actores</h3>
      ${ClassifyBoard({
        items: userActors,
        categories: userCategories,
        answers: understand.usersAndOperations.classifications,
        action: 'classify-user',
        groupLabel: 'Usuarios',
      })}
      <section class="panel">
        <h3>Horario y operación</h3>
        <ul>
          ${operationWindows.map((item) => `<li><strong>${escapeHtml(item.label)}:</strong> ${escapeHtml(item.value)}</li>`).join('')}
        </ul>
      </section>
      ${FindTheData({
        activities: [scheduleQuestion],
        answers: understand.usersAndOperations.scheduleAnswer
          ? { [scheduleQuestion.id]: understand.usersAndOperations.scheduleAnswer }
          : {},
      })}
      ${OperationalContextBuilder({
        draft: understand.usersAndOperations.draft,
        example: operationsExample,
        error,
      })}
      ${navRow(1, 3)}
    </section>
  `;
}

function renderServices(understand, error) {
  return `
    <section class="stack">
      <h2>¿Qué servicios soportan el negocio?</h2>
      ${SourceFinder({ finder: understandFinders.services })}
      <div class="table-wrap">
        <table class="compare-table">
          <thead>
            <tr>
              <th>Servicio</th>
              <th>Descripción</th>
              <th>Criticidad declarada</th>
              <th>Usuarios</th>
              <th>Operación</th>
            </tr>
          </thead>
          <tbody>
            ${understandServices
              .map(
                (item) => `
                  <tr>
                    <td>${escapeHtml(item.name)}</td>
                    <td>${escapeHtml(item.description)}</td>
                    <td>${escapeHtml(item.declaredCriticality)}</td>
                    <td>${escapeHtml(item.users)}</td>
                    <td>${escapeHtml(item.operation)}</td>
                  </tr>
                `,
              )
              .join('')}
          </tbody>
        </table>
      </div>
      <h3>Diferenciar servicio y componente</h3>
      ${ClassifyBoard({
        items: serviceComponentItems,
        categories: serviceComponentCategories,
        answers: understand.services.classification,
        action: 'classify-service-item',
        groupLabel: 'Servicio o componente',
      })}
      <h3>ServiceSelector</h3>
      <p>Explora y marca los servicios más importantes para comprender el caso.</p>
      ${ServiceSelector({
        services: understandServices,
        selectedIds: understand.services.selectedIds,
        reviewedIds: understand.services.reviewedIds,
        activeId: understand.criticality.activeServiceId,
      })}
      ${error ? `<p class="form-error">${escapeHtml(error)}</p>` : ''}
      <button class="btn btn--primary" type="button" data-action="add-services-doc">Agregar servicios revisados al documento</button>
      ${navRow(2, 4)}
    </section>
  `;
}

function renderCriticality(understand, error) {
  const service = getServiceById(understand.criticality.activeServiceId);
  const record = understand.criticality.records[understand.criticality.activeServiceId] ?? {};
  return `
    <section class="stack">
      <h2>¿Cuál servicio protegerías primero?</h2>
      ${SourceFinder({ finder: understandFinders.criticality })}
      <section class="panel">
        <h3>Criterios</h3>
        <ul>${criticalityCriteria.map((item) => `<li>${escapeHtml(item)}</li>`).join('')}</ul>
      </section>
      <section class="panel pedagogy">
        <h3>Ejemplo pedagógico — ${escapeHtml(wmsPedagogy.service)}</h3>
        <p><strong>Servicio:</strong> ${escapeHtml(wmsPedagogy.service)}</p>
        <p><strong>Dato:</strong> ${escapeHtml(wmsPedagogy.datum)}</p>
        <p><strong>Impacto:</strong> ${escapeHtml(wmsPedagogy.impact)}</p>
        <p><strong>Conclusión:</strong> ${escapeHtml(wmsPedagogy.conclusion)}</p>
        <p>${escapeHtml(wmsPedagogy.reminder)}</p>
      </section>
      ${TraceabilityPanel({
        items: [
          { label: 'DÓNDE BUSCO', value: wmsPedagogy.trace.search },
          { label: 'DATO', value: wmsPedagogy.trace.extract },
          { label: 'PROCESO', value: wmsPedagogy.trace.process },
          { label: 'INTERPRETACIÓN', value: wmsPedagogy.trace.interpret },
          { label: 'DOCUMENTO', value: wmsPedagogy.trace.write },
        ],
        kicker: 'Trazabilidad de criticidad',
        title: wmsPedagogy.service,
      })}
      ${CriticalityBuilder({ service, record, error })}
      ${CriticalServiceCompare({
        services: understandServices,
        records: understand.criticality.records,
        compareIds: understand.criticality.compareIds,
      })}
      ${FindTheData({
        activities: [hoursCriticalityQuestion],
        answers: understand.criticality.hoursQuestion
          ? { [hoursCriticalityQuestion.id]: understand.criticality.hoursQuestion }
          : {},
      })}
      ${CriticalServicesTableBuilder({
        services: understandServices,
        records: understand.criticality.records,
        tableIds: understand.criticality.tableIds,
        error,
      })}
      ${navRow(3, 5)}
    </section>
  `;
}

function renderConstraints(understand, error) {
  return `
    <section class="stack">
      <h2>¿Qué limita las decisiones?</h2>
      ${SourceFinder({ finder: understandFinders.constraints })}
      <section class="panel">
        <h3>Restricciones del caso</h3>
        <ul>${restrictionItems.map((item) => `<li>${escapeHtml(item.label)}</li>`).join('')}</ul>
      </section>
      <h3>RestrictionClassifier</h3>
      ${RestrictionClassifier({
        items: restrictionItems,
        answers: understand.constraints.classifications,
      })}
      <section class="panel">
        <h3>Por qué importan</h3>
        ${restrictionExamples
          .map(
            (item) => `
              <blockquote class="consultant-tip">
                <p><strong>Hallazgo futuro:</strong> ${escapeHtml(item.finding)}</p>
                <p><strong>Restricción:</strong> ${escapeHtml(item.restriction)}</p>
                <p><strong>Entonces:</strong> ${escapeHtml(item.implication)}</p>
              </blockquote>
            `,
          )
          .join('')}
      </section>
      ${RestrictionBuilder({
        items: restrictionItems,
        selectedIds: understand.constraints.selectedIds,
        classifications: understand.constraints.classifications,
        impacts: understand.constraints.impacts,
        draft: understand.constraints.draft,
        error,
      })}
      ${navRow(4, 6)}
    </section>
  `;
}

function renderReview(understand, documents, completion) {
  const rows = [
    ['Contexto', completion.context],
    ['Usuarios y operación', completion.usersAndOperations],
    ['Servicios tecnológicos', completion.services],
    ['Servicios críticos', completion.criticalServices],
    ['Restricciones', completion.constraints],
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

  const docKeys = ['context', 'usersAndOperations', 'services', 'criticalServices', 'constraints'];
  const traces = docKeys
    .map((key) => {
      const entry = documents[key];
      if (!entry) return '';
      const section = getDocumentSectionByKey(key);
      const sources = (entry.sources ?? []).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join('');
      const evidences = (entry.evidences ?? []).map((item) => `<li>✓ ${escapeHtml(item)}</li>`).join('');
      return `
        <article class="trace-doc">
          <h3>${escapeHtml(section ? `${section.number}. ${section.title}` : key)}</h3>
          <p>${escapeHtml(entry.text)}</p>
          ${evidences ? `<p><strong>Evidencias utilizadas</strong></p><ul>${evidences}</ul>` : ''}
          ${sources ? `<p><strong>Fuentes utilizadas</strong></p><ul>${sources}</ul>` : ''}
          <p>Última actualización: ${escapeHtml(formatTimestamp(entry.lastUpdated))}</p>
        </article>
      `;
    })
    .join('');

  const checkpointAnswers = {};
  Object.entries(understand.checkpoint).forEach(([id, value]) => {
    checkpointAnswers[id] = value;
  });

  return `
    <section class="stack">
      <h2>Lo que ya construiste</h2>
      <ul class="review-list">${rows}</ul>
      ${traces}
      <section class="panel">
        <h3>Checkpoint final</h3>
        ${FindTheData({ activities: checkpointQuestions, answers: checkpointAnswers })}
      </section>
      ${
        understand.completed
          ? `
            <section class="panel closing">
              <p class="hero__lead">${escapeHtml(closingMessages.lead)}</p>
              <p>${escapeHtml(closingMessages.next)}</p>
              <p><strong>${escapeHtml(closingMessages.nextStage)}</strong> — ${escapeHtml(closingMessages.nextHint)}</p>
              <a class="btn btn--primary" href="#/representar" data-nav="/representar">Continuar a REPRESENTAR</a>
              <a class="btn btn--ghost-dark" href="#/ruta" data-nav="/ruta">Volver a la ruta de análisis</a>
            </section>
          `
          : `
            <button class="btn btn--primary" type="button" data-action="complete-understand" ${completion.ready ? '' : 'disabled'}>
              Finalizar COMPRENDER
            </button>
            ${completion.ready ? '' : '<p class="form-error">Faltan secciones o justificaciones para cerrar la etapa.</p>'}
          `
      }
      ${navRow(5, null)}
    </section>
  `;
}

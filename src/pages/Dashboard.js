import { appCopy } from '../data/copy.js';
import { cases, getCaseById } from '../data/cases/index.js';
import { stages } from '../data/stages/index.js';
import { getStageWorkStatus, canWorkStage } from '../state/stageGates.js';
import { StageLockedView } from '../components/StageLockedView.js';
import { methodSteps } from '../data/methodology/methodSteps.js';
import { availabilityExample } from '../data/methodology/availabilityExample.js';
import { sourceFinders } from '../data/methodology/sourceFinders.js';
import { getGroupProgress } from '../data/methodology/data-map.js';
import { AppHeader, SiteFooter } from '../components/Layout.js';
import { ProgressBar } from '../components/ProgressBar.js';
import { StageCard } from '../components/StageCard.js';
import { MethodCard } from '../components/MethodCard.js';
import { TraceabilityPanel, buildIdentificationTraceItems } from '../components/TraceabilityPanel.js';
import { DocumentPanel } from '../components/DocumentPanel.js';
import { CaseSelector } from '../components/CaseSelector.js';
import { SourceFinder } from '../components/SourceFinder.js';
import { CollectedDataPanel } from '../components/CollectedDataPanel.js';
import { CollectedOverlay } from '../components/Layout.js';
import { MethodDataInfo } from '../components/MethodDataInfo.js';
import { escapeHtml } from '../utils/escape.js';
import { CalculationDemo } from '../components/pedagogy/ContextualHelp.js';
import { isModelSolved } from '../state/caseMode.js';
import { MODEL_INTRO } from '../data/testing/heladosBorealSolvedContent.js';

export function DashboardPage(state) {
  const model = isModelSolved(state);
  const caseLabel = state.selectedCase?.name ?? appCopy.dashboard.noCase;
  const caseData = state.selectedCase ? getCaseById(state.selectedCase.id) : null;
  const progress = getGroupProgress(state.collectedData);
  const cards = stages
    .map((stage) => {
      const status = getStageWorkStatus(stage, state);
      return StageCard({
        stage,
        status,
        selected: state.currentStage === stage.id,
        solved: model,
      });
    })
    .join('');

  const selectedStage = stages.find((stage) => stage.id === state.currentStage);
  const backdrop = state.documentPanelOpen
    ? '<button class="backdrop" type="button" data-action="close-document" aria-label="Cerrar panel del documento"></button>'
    : '';
  const traced = state.collectedData.find((item) => item.key === state.lastCollectedKey) ?? state.collectedData[0];
  const traceItems = traced ? buildIdentificationTraceItems(traced, state.methodologyStatus) : null;

  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page">
        <header class="dashboard-header">
          <h1 class="dashboard-header__brand">${escapeHtml(appCopy.name)}</h1>
          ${model ? '' : ProgressBar({ progress: state.progress, caseLabel })}
          ${
            model
              ? `<p class="prep-indicator">Ejemplo guiado · 8 etapas resueltas · disponible para consulta.</p>`
              : state.selectedCase
                ? `<p class="prep-indicator">${escapeHtml(appCopy.dashboard.prepLabel)}: ${progress.identified} de ${progress.total} grupos de datos identificados.</p>`
                : ''
          }
        </header>

        <div class="dashboard-layout${state.documentPanelOpen ? '' : ' is-panel-closed'}">
          <div class="dashboard-main">
            <section class="panel" aria-labelledby="work-case-title">
              <div class="section-heading">
                <h2 id="work-case-title">${model ? 'CASO MODELO RESUELTO' : escapeHtml(appCopy.dashboard.workCaseHeading)}</h2>
                <p>${model ? escapeHtml(MODEL_INTRO.lead) : escapeHtml(appCopy.caseWork.principle)}</p>
              </div>
              ${CaseSelector({ cases, selectedCaseId: state.selectedCase?.id ?? null })}
              ${
                model
                  ? `<div class="export-actions">
                       <a class="btn btn--primary" href="#/comprender" data-nav="/comprender">EXPLORAR CASO MODELO</a>
                       <a class="btn" href="#/caso/documento" data-nav="/caso/documento">ABRIR PDF ORIGINAL</a>
                       <a class="btn" href="#/ruta" data-nav="/ruta">VER RUTA RESUELTA</a>
                       <a class="btn" href="#/informe" data-nav="/informe">VER INFORME FINAL</a>
                       <a class="btn" href="#/medir" data-nav="/medir">EXPLORAR CÁLCULOS</a>
                       <a class="btn" href="#/diagnosticar" data-nav="/diagnosticar">REVISAR HALLAZGOS</a>
                     </div>`
                  : state.selectedCase
                    ? `<a class="btn btn--primary" href="#/caso" data-nav="/caso">${escapeHtml(appCopy.dashboard.exploreCase)}</a>
                       <a class="btn" href="#/informe/modelo" data-nav="/informe/modelo">${escapeHtml(appCopy.dashboard.modelReport)}</a>`
                    : `<a class="btn" href="#/informe/modelo" data-nav="/informe/modelo">${escapeHtml(appCopy.dashboard.modelReport)}</a>`
              }
            </section>

            <section aria-labelledby="stages-heading">
              <div class="section-heading">
                <h2 id="stages-heading">${escapeHtml(appCopy.dashboard.stagesHeading)}</h2>
                <p>${model ? 'Recorre las ocho etapas resueltas en cualquier orden. El objetivo es consultar el ejemplo, no aprobar un recorrido.' : escapeHtml(appCopy.dashboard.stagesIntro)}</p>
              </div>
              <div class="stage-grid">
                ${cards}
              </div>
            </section>

            ${
              selectedStage && !model
                ? canWorkStage(state, selectedStage.id)
                  ? `
                  <section class="stage-preview" aria-labelledby="stage-preview-title">
                    <div class="section-heading">
                      <h2 id="stage-preview-title">${escapeHtml(selectedStage.number)} ${escapeHtml(selectedStage.name)}</h2>
                      ${stageWorkActions(selectedStage, state)}
                    </div>
                  </section>
                `
                  : StageLockedView({ state, stageId: selectedStage.id })
                : ''
            }

            ${state.selectedCase ? SourceFinder({ finder: sourceFinders[0] }) : ''}
            ${
              state.selectedCase
                ? `<section class="panel" aria-labelledby="calc-demo-heading">
                    <h2 id="calc-demo-heading">Demostración de cálculo</h2>
                    <p>Puedes ver cómo funcionará MEDIR sin adelantar el cálculo con tus datos.</p>
                    ${CalculationDemo({ conceptId: 'availability' })}
                  </section>`
                : ''
            }

            ${
              state.selectedCase
                ? CollectedDataPanel({
                    collectedData: state.collectedData,
                    methodologyStatus: state.methodologyStatus,
                    open: true,
                    variant: 'inline',
                  })
                : ''
            }

            ${
              traceItems
                ? TraceabilityPanel({ items: traceItems, kicker: 'Dato del caso' })
                : ''
            }

            ${
              state.selectedCase
                ? ''
                : `
                  <section aria-labelledby="method-demo-heading">
                    <div class="section-heading">
                      <h2 id="method-demo-heading">${escapeHtml(appCopy.dashboard.methodHeading)}</h2>
                      <p>${escapeHtml(appCopy.dashboard.methodIntro)}</p>
                    </div>
                    ${MethodCard({
                      steps: methodSteps,
                      values: availabilityExample.steps,
                      topic: availabilityExample.topic,
                      disclaimer: availabilityExample.disclaimer,
                    })}
                  </section>
                `
            }
          </div>

          ${DocumentPanel({
            open: state.documentPanelOpen,
            state,
            collectedData: state.collectedData,
            methodologyStatus: state.methodologyStatus,
            documentEntries: state.documentSections,
            documentViewKey: state.documentViewKey,
            variant: 'sidebar',
            readyToExport: Boolean(state.analysis?.build?.readyToExport) || isModelSolved(state),
          })}
        </div>
      </main>
      ${backdrop}
      ${CollectedOverlay({ state })}
      ${MethodDataInfo({ caseData, dataKey: state.methodInfoKey })}
      ${SiteFooter()}
    </div>
  `;
}

function stageWorkActions(stage, state) {
  if (stage.id === 1) {
    return `<p>Construye contexto, usuarios, servicios, criticidad y restricciones con evidencia.</p>
            <a class="btn btn--primary" href="#/comprender" data-nav="/comprender">${
              state.completedStages.includes(1) ? 'Reabrir COMPRENDER' : 'Abrir COMPRENDER'
            }</a>`;
  }
  if (stage.id === 2) {
    return `<p>Construye el AS-IS, el inventario relevante y los SPOF con evidencia del caso. No dibujes todavía el TO-BE.</p>
            <a class="btn btn--primary" href="#/representar" data-nav="/representar">${
              state.completedStages.includes(2) ? 'Reabrir REPRESENTAR' : 'Abrir REPRESENTAR'
            }</a>`;
  }
  if (stage.id === 3) {
    return `<p>Las dependencias y el SPOF se documentan en REPRESENTAR.</p>
            <a class="btn btn--primary" href="#/representar/6" data-nav="/representar/6">Abrir análisis SPOF</a>`;
  }
  if (stage.id === 4) {
    return `<p>Cálculo guiado: concepto, fórmula, sustitución, interpretación y hallazgo. Calcular no es diagnosticar.</p>
            <a class="btn btn--primary" href="#/medir" data-nav="/medir">${
              state.completedStages.includes(4) ? 'Reabrir MEDIR' : 'Abrir MEDIR'
            }</a>
            <a class="btn" href="#/aprender" data-nav="/aprender">Abrir aprendizaje y glosario</a>`;
  }
  if (stage.id === 5) {
    return `<p>Transforma evidencias en hallazgos técnicos sustentados. Un hallazgo no es una opinión.</p>
            <a class="btn btn--primary" href="#/diagnosticar" data-nav="/diagnosticar">${
              state.completedStages.includes(5) ? 'Reabrir DIAGNOSTICAR' : 'Abrir DIAGNOSTICAR'
            }</a>`;
  }
  if (stage.id === 6) {
    return `<p>ITIL gestiona el servicio, COBIT gobierna y ISO 27001 trata el riesgo de información. No son intercambiables.</p>
            <a class="btn btn--primary" href="#/gobernar" data-nav="/gobernar">${
              state.completedStages.includes(6) ? 'Reabrir GOBERNAR' : 'Abrir GOBERNAR'
            }</a>`;
  }
  if (stage.id === 7) {
    return `<p>No empieces por la tecnología. Compara alternativas, CAPEX/OPEX y métricas de éxito.</p>
            <a class="btn btn--primary" href="#/decidir" data-nav="/decidir">${
              state.completedStages.includes(7) ? 'Reabrir DECIDIR' : 'Abrir DECIDIR'
            }</a>`;
  }
  if (stage.id === 8) {
    return `<p>${
      state.completedStages.includes(8) && state.analysis?.build?.readyToExport
        ? 'El informe está listo. Puedes exportarlo en HTML, Word o PDF.'
        : 'Ensambla el informe, construye conclusiones y valida trazabilidad.'
    }</p>
            <a class="btn btn--primary" href="#/construir" data-nav="/construir">${
              state.completedStages.includes(8) ? 'Reabrir CONSTRUIR' : 'Abrir CONSTRUIR'
            }</a>
            ${
              state.analysis?.build?.readyToExport
                ? '<a class="btn" href="#/exportar" data-nav="/exportar">Exportar documento</a>'
                : ''
            }`;
  }
  return `<p>${escapeHtml(appCopy.dashboard.stagePreviewNote)}</p>`;
}

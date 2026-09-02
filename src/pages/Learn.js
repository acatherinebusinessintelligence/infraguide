import { AppHeader, SiteFooter, DocumentOverlay, CollectedOverlay } from '../components/Layout.js';
import { GlossaryIndex } from '../components/pedagogy/ContextualGlossary.js';
import { ConceptExplanationCard } from '../components/pedagogy/ConceptExplanationCard.js';
import { CalculationDemo } from '../components/pedagogy/ContextualHelp.js';
import { InsufficientMetricsPanel } from '../components/pedagogy/InsufficientMetrics.js';
import { TermLink } from '../data/pedagogy/glossary.js';
import { escapeHtml } from '../utils/escape.js';

const GUIDED_LINKS = [
  { path: '/medir/2', label: 'Disponibilidad' },
  { path: '/medir/3', label: 'MTTR' },
  { path: '/medir/4', label: 'MTBF' },
  { path: '/medir/5', label: 'CPU y memoria' },
  { path: '/medir/6', label: 'Almacenamiento' },
  { path: '/medir/7', label: 'Rendimiento' },
  { path: '/medir/8', label: 'Indicadores sin fórmula' },
];

export function LearnPage(state) {
  const measureReady = state.completedStages.includes(2) || state.completedStages.includes(3);
  const measure = state.analysis?.measure ?? {};
  return `
    <div class="app-shell">
      ${AppHeader({ state })}
      <main id="contenido" class="page learn-page">
        <header class="section-heading">
          <p class="understand-kicker">Capa pedagógica</p>
          <h1>Aprendizaje y cálculo guiado</h1>
          <p>Aquí se enseña el razonamiento. El menú <strong>Tu documento</strong> y la exportación son el modo informe profesional: no llevan estas explicaciones.</p>
        </header>

        <section class="mode-split">
          <article class="example-pane">
            <h2>Modo aprendizaje</h2>
            <p>Conceptos, fórmulas, sustitución, interpretación, errores comunes y ${TermLink({ termId: 'criterio-aceptacion' })}.</p>
            <p>Cadena: documento fuente → evidencia → dato → concepto → fórmula → resultado → hallazgo → decisión.</p>
            <button class="btn btn--primary" type="button" data-action="open-glossary" data-term="index">Abrir glosario</button>
          </article>
          <article class="student-pane">
            <h2>Modo informe profesional</h2>
            <p>Dictamen, hallazgos, evidencias, riesgos, arquitectura y recomendaciones. Sin instrucciones de clase.</p>
            <button class="btn" type="button" data-action="toggle-document">Abrir tu documento</button>
          </article>
        </section>

        ${GlossaryIndex()}

        <section class="builder-card">
          <h2>Cálculo guiado (MEDIR)</h2>
          <p>Cada indicador tiene tres niveles: comprender, aplicar y analizar. No se entrega solo el resultado.</p>
          ${
            measureReady
              ? ''
              : '<p class="pedagogy-feedback pedagogy-feedback--info" role="status">El cálculo con datos del caso se habilita al cerrar REPRESENTAR. El glosario y las explicaciones ya están disponibles aquí.</p>'
          }
          <div class="chip-grid">
            ${GUIDED_LINKS.map(
              (item) =>
                `<a class="btn btn--small" href="#${item.path}" data-nav="${item.path}">${escapeHtml(item.label)}</a>`,
            ).join('')}
          </div>
          ${CalculationDemo({ conceptId: 'availability' })}
          ${CalculationDemo({ conceptId: 'mttr' })}
          ${CalculationDemo({ conceptId: 'storage' })}
        </section>

        ${ConceptExplanationCard({ conceptId: 'availability', open: measure.availability?.conceptOpen !== false })}
        ${ConceptExplanationCard({ conceptId: 'mttr', open: measure.mttr?.conceptOpen === true })}
        ${ConceptExplanationCard({ conceptId: 'storage', open: measure.storage?.conceptOpen === true })}

        ${InsufficientMetricsPanel({ notice: state.pedagogyNotice, measure })}
      </main>
      ${DocumentOverlay({ state, variant: 'overlay' })}
      ${CollectedOverlay({ state })}
      ${SiteFooter()}
    </div>
  `;
}

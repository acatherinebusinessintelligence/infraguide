import { INFRAGUIDE_VERSION } from '../data/methodology/export.js';
import { CONSULTING_SECTION_KEYS } from './consultingReportModel.js';

export function consultingReportToExportModel(report, config = {}) {
  const compact = config.mode === 'clean';
  const sections = [
    dictamenSection(report),
    scopeSection(report),
    findingsSection(report),
    architectureSection(report),
    performanceSection(report),
    riskSection(report, compact),
    targetSection(report),
    alternativesSection(report),
    programSection(report),
    governanceSection(report),
    closingSection(report),
    annexEvidenceSection(report),
    annexEngineeringSection(report),
  ];

  return {
    kind: 'consulting',
    cover: {
      kicker: 'INFRAESTRUCTURA TI',
      title: report.metadata.documentType,
      caseName: report.metadata.caseName,
      recipient: report.metadata.recipient,
      object: report.metadata.object,
      cutoffDate: report.metadata.cutoffDate,
      horizon: report.metadata.horizon,
      classification: report.metadata.classification,
      generatedAt: report.metadata.generatedAt,
      generatedLabel: report.metadata.generatedLabel,
      app: 'InfraGuide',
      appVersion: report.metadata.appVersion || INFRAGUIDE_VERSION,
      documentVersion: report.metadata.documentVersion,
      modeLabel: compact ? 'Informe de consultoría (anexo reducido)' : 'Informe técnico de consultoría',
      sector: '',
    },
    index: sections.map((item) => ({ id: item.id, key: item.key, title: item.title })),
    sections,
    config: { ...config, includeCover: true, includeIndex: true },
    report,
    manifest: {
      caseId: '',
      generatedAt: report.metadata.generatedAt,
      documentVersion: report.metadata.documentVersion,
      exportMode: config.mode || 'academic',
      sectionsIncluded: CONSULTING_SECTION_KEYS,
      InfraGuideVersion: report.metadata.appVersion || INFRAGUIDE_VERSION,
      kind: 'consulting',
    },
  };
}

function section(id, key, title, blocks) {
  return { id, key, title, blocks: blocks.filter(Boolean) };
}

function p(text) {
  return text ? { type: 'paragraph', text } : null;
}

function h(text) {
  return { type: 'heading', text };
}

function list(items) {
  return items?.length ? { type: 'list', items } : null;
}

function table(headers, rows) {
  if (!rows?.length) return null;
  return { type: 'table', headers, rows };
}

function publicFinding(item) {
  return {
    id: item.id,
    title: item.title,
    severity: item.severity,
    evidenceState: item.evidenceState,
    kind: item.kind,
    condition: item.condition,
    evidence: item.evidence,
    pages: item.pages,
    implication: item.implication,
    businessImpact: item.businessImpact,
    cause: item.cause,
    riskId: item.riskId,
    treatment: item.treatment,
    priority: item.priority,
    owner: item.owner,
    deadline: item.deadline,
    acceptance: item.acceptance,
    closure: item.closure,
  };
}

function dictamenSection(report) {
  const op = report.executiveOpinion;
  return section('0', 'dictamen', '0. Dictamen técnico', [
    op.insufficient ? { type: 'callout', tone: 'warning', text: op.condition } : p(op.condition),
    h('Exposiciones principales'),
    list(op.exposures),
    h('Decisión recomendada'),
    p(op.recommendedDecision),
    h('Prioridades inmediatas'),
    list(op.immediatePriorities),
    h('Condiciones para aprobar la inversión'),
    list(op.investmentConditions),
    table(
      ['Indicador', 'Valor', 'Tipo'],
      (op.kpis ?? []).map((item) => [item.label, item.value, item.kind]),
    ),
  ]);
}

function scopeSection(report) {
  const s = report.scope;
  return section('1', 'scope', '1. Alcance, método y limitaciones', [
    h('Dominios evaluados'),
    list(s.domains),
    h('Fuentes'),
    list(s.sources),
    h('Método'),
    p(s.method),
    h('Limitaciones'),
    list(s.limitations),
    h('Supuestos de cálculo'),
    list(s.assumptions),
    h('Información a confirmar en ingeniería de detalle'),
    list(s.toConfirm),
  ]);
}

function findingsSection(report) {
  const blocks = [p('La unidad del informe es el hallazgo de ingeniería. Cada evidencia se presenta una vez y luego se referencia.')];
  if (!report.findings.length) {
    blocks.push({ type: 'callout', tone: 'warning', text: 'Información insuficiente para emitir una conclusión definitiva.' });
  }
  report.findings.forEach((item) => {
    blocks.push({ type: 'finding', finding: publicFinding(item) });
  });
  return section('2', 'findings', '2. Hallazgos de ingeniería', blocks);
}

function architectureSection(report) {
  const a = report.architectureAssessment;
  return section('3', 'architecture', '3. Análisis de arquitectura y resiliencia', [
    p(a.asIsSummary),
    h('Dependencias críticas'),
    list(a.criticalDependencies),
    p(a.redundancyNote),
    h('Puntos únicos de falla documentados'),
    table(
      ['Componente', 'Estado', 'Impacto', 'Justificación'],
      (a.spof ?? []).map((item) => [item.component, item.status, item.impact, item.justification]),
    ),
    a.chains?.length ? { type: 'asis', chains: a.chains } : null,
    h('Modos de falla observados'),
    table(
      ['Evento', 'Duración', 'Impacto', 'Componentes'],
      (a.failureModes ?? []).map((item) => [item.incident, item.duration, item.impact, (item.components ?? []).join(', ')]),
    ),
    h('Componentes que cambian el diagnóstico'),
    table(
      ['Componente', 'Condición', 'Modo de falla', 'Impacto', 'Tratamiento'],
      (a.componentTable ?? []).map((item) => [item.component, item.condition, item.failureMode, item.impact, item.treatment]),
    ),
  ]);
}

function performanceSection(report) {
  const blocks = [
    p('Solo se presentan métricas útiles para decidir. Los resultados calculados no se afirman como texto literal del PDF.'),
  ];
  (report.performanceAndCapacity ?? []).forEach((metric) => {
    blocks.push({ type: 'metric', ...metric, number: '', title: metric.label, calculation: metric.substitution, source: metric.sources?.[0]?.citation || '', sourceHref: metric.sources?.[0]?.href || '', calculatedNote: metric.kind === 'cálculo' ? 'Resultado calculado. No aparece literalmente en el PDF.' : '' });
  });
  return section('4', 'performance', '4. Desempeño y capacidad', blocks);
}

function riskSection(report, compact) {
  return section('5', 'risks', '5. Exposición de riesgo y brechas de control', [
    table(
      ['ID', 'Hallazgo', 'Probabilidad', 'Impacto', 'Exposición', 'Activo', 'Control', 'Brecha', 'Tratamiento', 'Residual'],
      (report.prioritizedRisks ?? []).map((item) => [
        item.id,
        item.findingId,
        item.probability,
        item.impact,
        item.exposure,
        item.asset,
        item.existingControl,
        item.gap,
        item.treatment,
        item.residual,
      ]),
    ),
    h('Aplicación concreta de marcos (no son capítulos teóricos)'),
    compact
      ? p('En el modo compacto el detalle ITIL/COBIT/ISO se resume. Consulte el modo completo para la matriz de aplicación.')
      : table(
          ['Dominio', 'Hallazgo', 'Referencia', 'Aplicación concreta'],
          (report.controlMap ?? []).map((item) => [item.domain, item.findingId || '—', item.reference, item.application]),
        ),
  ]);
}

function targetSection(report) {
  const t = report.targetArchitecture;
  return section('6', 'target', '6. Arquitectura objetivo y requisitos', [
    { type: 'callout', tone: 'note', text: t.disclaimer },
    p(t.summary),
    t.components?.length
      ? {
          type: 'asis',
          chains: [
            {
              nodes: t.components.slice(0, 6).map((item) => ({
                name: String(item.name || '').slice(0, 32),
              })),
            },
          ],
        }
      : null,
    h('Componentes nuevos o modificados'),
    table(
      ['Componente / cambio', 'Hallazgos que resuelve'],
      (t.components ?? []).map((item) => [item.name, (item.findingIds ?? []).join(', ')]),
    ),
    h('Requisitos técnicos'),
    table(
      ['ID', 'Dominio', 'Descripción', 'Hallazgo', 'Aceptación', 'Dependencia', 'Prioridad'],
      (t.requirements ?? []).map((item) => [
        item.id,
        item.domain,
        item.description,
        (item.findingIds ?? []).join(', '),
        item.acceptance,
        item.dependency,
        item.priority,
      ]),
    ),
  ]);
}

function alternativesSection(report) {
  const a = report.alternatives;
  const scoreHeaders = ['Alternativa', ...a.criteria.map((item) => `${item.label} (${Math.round(item.weight * 100)} %)`), 'Total'];
  const scoreRows = a.scored
    ? a.options.map((option) => [
        option.label,
        ...a.criteria.map((criterion) => String(option.scores?.[criterion.id] ?? '—')),
        option.weighted != null ? String(Number(option.weighted).toFixed(2)) : '—',
      ])
    : a.options.map((option) => [option.label, option.notes]);
  return section('7', 'alternatives', '7. Evaluación de alternativas', [
    p(a.justification),
    a.scored
      ? table(scoreHeaders, scoreRows)
      : table(['Alternativa', 'Base documentada'], scoreRows),
    p(`Selección: ${a.options.find((item) => item.id === a.selectedId)?.label || '—'}.`),
    p('Los pesos son criterios metodológicos de InfraGuide. No se extraen del PDF.'),
  ]);
}

function programSection(report) {
  const pgr = report.recommendedProgram;
  return section('8', 'program', '8. Programa recomendado, inversión y secuencia', [
    p(pgr.budgetNote),
    p(pgr.sufficiency),
    table(
      ['Iniciativa', 'Hallazgos', 'Prioridad', 'Horizonte', 'CAPEX', 'OPEX', 'Resultado', 'Responsable'],
      (pgr.initiatives ?? []).map((item) => [
        `${item.id} ${item.title}`,
        (item.findingIds ?? []).join(', '),
        item.priority,
        item.horizon,
        item.capex?.label || item.costModel,
        item.opex?.label || '—',
        item.result,
        item.owner,
      ]),
    ),
    h('Secuencia por horizonte'),
    list(
      (pgr.horizons ?? [])
        .filter((horizon) => horizon.items?.length)
        .map((horizon) => `${horizon.label}: ${horizon.items.map((item) => item.id).join(', ')}`),
    ),
  ]);
}

function governanceSection(report) {
  const g = report.governance;
  return section('9', 'governance', '9. Gobierno técnico y criterios de aceptación', [
    h('Dominios de control de la ejecución'),
    table(
      ['Dominio', 'Base en el análisis'],
      (g.practices ?? []).map((item) => [item.domain, item.source]),
    ),
    h('Matriz de aceptación'),
    table(
      ['Dominio', 'KPI', 'Línea base', 'Meta', 'Evidencia de aceptación', 'Responsable'],
      (g.kpis ?? []).map((item) => [item.domain, item.kpi, item.baseline, item.target, item.evidence, item.owner]),
    ),
  ]);
}

function closingSection(report) {
  const c = report.closing;
  return section('10', 'closing', '10. Conclusión y recomendación de cierre', [
    h('Condición actual'),
    p(c.condition),
    h('Decisión recomendada'),
    p(c.decision),
    h('Prioridades'),
    list(c.priorities),
    h('Riesgos de no actuar'),
    list(c.inactionRisks),
    h('Condiciones para aprobar'),
    list(c.approvalConditions),
    h('Información pendiente de confirmar'),
    list(c.pending),
  ]);
}

function annexEvidenceSection(report) {
  return section('A', 'annexEvidence', 'Anexo A. Registro de evidencias', [
    p('Una evidencia se presenta aquí y se referencia desde hallazgos, métricas, riesgos y recomendaciones.'),
    table(
      ['ID', 'Evidencia', 'Valor', 'Documento', 'Página', 'Estado', 'Utilizada por'],
      (report.evidenceRegister ?? []).map((item) => [
        item.evidenceId,
        item.label,
        item.value,
        item.document,
        item.page != null ? String(item.page) : '—',
        item.state,
        (item.usedBy ?? []).join(', '),
      ]),
    ),
  ]);
}

function annexEngineeringSection(report) {
  return section('B', 'annexEngineering', 'Anexo B. Información requerida para ingeniería de detalle', [
    list(report.detailedEngineeringRequirements),
    report.validation?.errors?.length ? { type: 'callout', tone: 'warning', text: report.validation.errors.join(' ') } : null,
  ]);
}

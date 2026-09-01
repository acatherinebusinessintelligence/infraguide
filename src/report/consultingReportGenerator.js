import { getCaseById } from '../data/cases/index.js';
import {
  buildEvidenceRegistry,
  getEvidenceById,
  getEvidenceForField,
  getPrimarySourceDocument,
  getCalculatedSourceBundle,
  formatAcademicCitation,
  academicPdfHref,
  EVIDENCE_ORIGIN,
  resolveEvidenceStatus,
  EVIDENCE_STATUS,
  diagnoseFieldKeys,
  diagnoseCalculatedMap,
  calculatedDiagnoseIds,
} from '../data/evidence/index.js';
import { documentedFindings, costLabel, priorityLabel } from '../state/decideModel.js';
import { categoryLabel, criticalityLabel, criticalityRank } from '../state/diagnoseModel.js';
import {
  itilPracticeLabel,
  cobitResponsibleLabel,
  cobitIndicatorLabel,
  isoAssetLabel,
  isoThreatLabel,
  isoVulnLabel,
  itilIndicatorLabel,
} from '../state/governModel.js';
import { expectedFromFacts, resolveCaseFacts, getFact } from '../state/measureModel.js';
import { getDiagramNode, getNodeById } from '../state/representModel.js';
import { architectureNodes, caseIncidents } from '../data/methodology/represent.js';
import { formatEsNumber } from '../utils/numbers.js';
import { formatLocalDate, generateTimestamp, sanitizePlain } from '../export/text.js';
import { INFRAGUIDE_VERSION } from '../data/methodology/export.js';
import { limitationOptions, strengthOptions } from '../data/methodology/build.js';
import {
  STATEMENT_KIND,
  EVIDENCE_STATE,
  SEVERITY,
  COST_CLASS,
  createEmptyConsultingReport,
} from './consultingReportModel.js';
import { validateConsultingReport } from './consultingReportValidation.js';

const CATALOG_FIELD = {
  ...diagnoseFieldKeys,
  'ev-firewall-unique': 'mainFirewallCount',
  'ev-spof-firewall': 'mainFirewallCount',
  'ev-inc-b': 'incidentBDuration',
  'ev-inc-c': 'incidentCDuration',
  'ev-inc-d': 'backupExternalGapDays',
  'ev-inc-e': 'incidentERollback',
  'ev-growth': 'storageGrowth',
  'ev-stale-accounts': 'staleAccounts',
  'ev-incident-channels': 'incidentRegistrationCoverage',
  'ev-capacity-reactive': 'capacityDecisions',
  'ev-mfa': 'mfaCoverage',
  'ev-patches': 'pendingPatches',
};

const METHOD_WEIGHTS = [
  { id: 'resilience', label: 'Resiliencia', weight: 0.18 },
  { id: 'compatibility', label: 'Compatibilidad con restricciones', weight: 0.16 },
  { id: 'time', label: 'Tiempo de implementación', weight: 0.12 },
  { id: 'cost', label: 'Costo', weight: 0.14 },
  { id: 'complexity', label: 'Complejidad', weight: 0.1 },
  { id: 'scale', label: 'Escalabilidad', weight: 0.1 },
  { id: 'vendor', label: 'Dependencia del proveedor', weight: 0.1 },
  { id: 'ops', label: 'Capacidad operativa', weight: 0.1 },
];

function text(value) {
  return sanitizePlain(value);
}

function fieldOf(caseData, key) {
  return getEvidenceForField(caseData, key);
}

function citationOf(caseData, evidence) {
  if (!evidence) return '';
  return formatAcademicCitation(caseData, evidence);
}

function evidenceStateOf(evidence) {
  if (!evidence) return EVIDENCE_STATE.PENDING;
  if (evidence.origin === EVIDENCE_ORIGIN.CALCULATED) return EVIDENCE_STATE.CALCULATED;
  const status = resolveEvidenceStatus(evidence);
  if (status === EVIDENCE_STATUS.VERIFIED) return EVIDENCE_STATE.CONFIRMED;
  if (evidence.page) return EVIDENCE_STATE.PENDING;
  return EVIDENCE_STATE.INFERRED;
}

function resolveCatalogEvidence(caseData, catalogId) {
  if (!catalogId) return null;
  if (String(catalogId).startsWith('HB-')) {
    return getEvidenceById(caseData, catalogId);
  }
  if (calculatedDiagnoseIds.has(catalogId) || diagnoseCalculatedMap[catalogId]) {
    const metricId = diagnoseCalculatedMap[catalogId];
    const bundle = metricId ? getCalculatedSourceBundle(caseData, metricId) : null;
    const first = bundle?.sources?.[0];
    if (first) {
      return { ...first, origin: EVIDENCE_ORIGIN.CALCULATED, evidenceId: first.evidenceId };
    }
  }
  const key = CATALOG_FIELD[catalogId];
  return key ? fieldOf(caseData, key) : getEvidenceById(caseData, catalogId);
}

function padFindingId(index) {
  return `F-${String(index + 1).padStart(2, '0')}`;
}

function severityOf(criticality) {
  if (criticality === 'critical') return SEVERITY.critical;
  if (criticality === 'high') return SEVERITY.high;
  if (criticality === 'medium') return SEVERITY.medium;
  if (criticality === 'low') return SEVERITY.low;
  return SEVERITY.medium;
}

function nodeName(id) {
  return getDiagramNode(id)?.name || getNodeById(id)?.name || '';
}

export function generateConsultingReport(state) {
  const report = createEmptyConsultingReport();
  const caseData = state.selectedCase?.id ? getCaseById(state.selectedCase.id) : null;
  const doc = getPrimarySourceDocument(caseData);
  const registry = caseData ? buildEvidenceRegistry(caseData) : [];
  const findingsRaw = documentedFindings(state);
  const recs = state.analysis?.decide?.recommendations ?? [];
  const facts = caseData ? resolveCaseFacts(caseData) : [];
  const expected = facts.length ? expectedFromFacts(facts) : null;
  const used = new Map();

  const markUsed = (evidence, usedBy) => {
    if (!evidence?.evidenceId) return;
    const prev = used.get(evidence.evidenceId) || { evidence, usedBy: new Set() };
    prev.usedBy.add(usedBy);
    used.set(evidence.evidenceId, prev);
  };

  report.metadata = buildMetadata(state, caseData, doc);
  report.findings = buildFindings(state, caseData, findingsRaw, recs, markUsed);
  report.scope = buildScope(state, caseData, doc, registry);
  report.executiveOpinion = buildDictamen(state, caseData, report.findings, recs, expected, facts);
  report.architectureAssessment = buildArchitecture(state, caseData, report.findings, markUsed);
  report.performanceAndCapacity = buildMetrics(state, caseData, expected, facts, markUsed);
  report.prioritizedRisks = buildRisks(state, report.findings, recs);
  report.controlMap = buildControlMap(state, report.findings);
  report.targetArchitecture = buildTarget(state, report.findings, recs);
  report.alternatives = buildAlternatives(state, recs);
  report.recommendedProgram = buildProgram(state, caseData, recs, report.findings, facts, markUsed);
  report.governance = buildGovernance(state, caseData, expected, recs, markUsed);
  report.closing = buildClosing(state, report);
  report.evidenceRegister = [...used.values()].map((item) => ({
    evidenceId: item.evidence.evidenceId,
    label: item.evidence.label,
    value: item.evidence.value,
    document: doc?.title || 'Caso fuente',
    page: item.evidence.page,
    state: evidenceStateOf(item.evidence),
    kind: item.evidence.origin === EVIDENCE_ORIGIN.CALCULATED ? STATEMENT_KIND.CALCULATION : STATEMENT_KIND.FACT,
    citation: citationOf(caseData, item.evidence),
    href: academicPdfHref(caseData, item.evidence),
    usedBy: [...item.usedBy],
  }));
  report.usedEvidenceIds = report.evidenceRegister.map((item) => item.evidenceId);
  report.detailedEngineeringRequirements = buildEngineeringGap(state, caseData, report);
  report.validation = validateConsultingReport(report);
  if (report.validation.warnings?.length) {
    report.detailedEngineeringRequirements = [
      ...report.detailedEngineeringRequirements,
      ...report.validation.warnings,
    ];
  }

  void registry;
  return report;
}

function buildMetadata(state, caseData, doc) {
  const period = fieldOf(caseData, 'periodHours');
  const generatedAt = generateTimestamp();
  return {
    documentType: 'Informe técnico de consultoría de infraestructura TI',
    caseName: text(caseData?.name || state.selectedCase?.name || ''),
    recipient: 'Comité de decisión / dirección de TI',
    object: 'Dictamen técnico sobre infraestructura, resiliencia, capacidad, controles y programa de inversión.',
    cutoffDate: '31 de agosto de 2026',
    horizon: period?.value ? `Periodo de observación declarado: ${period.value}` : 'Horizonte no documentado en el caso',
    classification: 'Uso interno — apoyo a decisión de inversión',
    generatedAt,
    generatedLabel: formatLocalDate(new Date(generatedAt)),
    appVersion: INFRAGUIDE_VERSION,
    documentVersion: `v${Number(state.analysis?.export?.nextVersion) || 1}`,
    sourceTitle: doc?.title || '',
    sourceFile: doc?.file || '',
    sourcePages: doc?.pages || null,
  };
}

function buildFindings(state, caseData, findingsRaw, recs, markUsed) {
  return findingsRaw.map((item, index) => {
    const id = padFindingId(index);
    const evidenceItems = (item.evidenceIds ?? [])
      .map((evId) => resolveCatalogEvidence(caseData, evId))
      .filter(Boolean);
    evidenceItems.forEach((ev) => markUsed(ev, id));
    const primary = evidenceItems[0];
    const rec = recs.find((entry) => (entry.findingIds ?? []).includes(item.findingId));
    const states = evidenceItems.map(evidenceStateOf);
    const evidenceState = states.includes(EVIDENCE_STATE.CONFIRMED)
      ? EVIDENCE_STATE.CONFIRMED
      : states.includes(EVIDENCE_STATE.CALCULATED)
        ? EVIDENCE_STATE.CALCULATED
        : evidenceItems.length
          ? EVIDENCE_STATE.INFERRED
          : EVIDENCE_STATE.PENDING;
    const pages = [...new Set(evidenceItems.map((ev) => ev.page).filter((page) => Number.isFinite(Number(page))))];
    return {
      id,
      sourceFindingId: item.findingId,
      title: text(item.title) || `Hallazgo ${id}`,
      severity: severityOf(item.criticality),
      severityId: item.criticality || 'medium',
      evidenceState,
      kind:
        evidenceState === EVIDENCE_STATE.CALCULATED
          ? STATEMENT_KIND.CALCULATION
          : evidenceState === EVIDENCE_STATE.CONFIRMED
            ? STATEMENT_KIND.FACT
            : evidenceState === EVIDENCE_STATE.PENDING
              ? STATEMENT_KIND.PENDING
              : STATEMENT_KIND.INFERENCE,
      category: categoryLabel(item.category),
      condition: text(item.description || item.title),
      evidence: evidenceItems.map((ev) => ({
        evidenceId: ev.evidenceId,
        label: ev.label,
        value: ev.value,
        page: ev.page,
        citation: citationOf(caseData, ev),
        href: academicPdfHref(caseData, ev),
        state: evidenceStateOf(ev),
      })),
      pages,
      implication: text(item.impact),
      businessImpact: text(item.impact),
      cause: text(item.justification),
      riskId: `R-${id.slice(2)}`,
      treatment: text(rec?.decision),
      priority: rec ? priorityLabel(rec.priority) : criticalityLabel(item.criticality),
      owner: suggestedOwner(item.category, rec),
      deadline: horizonForPriority(rec?.priority),
      acceptance: text(rec?.metricTarget || rec?.metricText) || pendingAcceptance(item.category),
      closure: evidenceState === EVIDENCE_STATE.PENDING ? 'Abierto — evidencia pendiente' : 'Abierto',
    };
  });
}

function suggestedOwner(category, rec) {
  if (rec?.owner) return text(rec.owner);
  if (category === 'security') return 'Identidad / seguridad (TI)';
  if (category === 'storage' || category === 'capacity' || category === 'performance') return 'Infraestructura';
  if (category === 'continuity' || category === 'availability') return 'Continuidad / operaciones';
  if (category === 'government' || category === 'operation') return 'Coordinación de TI';
  return 'Coordinación de TI';
}

function horizonForPriority(priority) {
  if (priority === 'immediate') return '0–30 días';
  if (priority === 'high') return '31–90 días';
  if (priority === 'medium') return '3–6 meses';
  if (priority === 'low' || priority === 'strategic') return '6–12 meses';
  return 'Por definir';
}

function pendingAcceptance(category) {
  if (category === 'security') return 'Criterio de aceptación pendiente de formalizar (p. ej. cobertura MFA o baja de cuentas).';
  if (category === 'storage') return 'Criterio de aceptación pendiente de formalizar (umbral de uso y prueba de crecimiento).';
  return 'Criterio de aceptación pendiente de formalizar en ingeniería de detalle.';
}

function buildScope(state, caseData, doc, registry) {
  const verified = registry.filter((item) => resolveEvidenceStatus(item) === EVIDENCE_STATUS.VERIFIED).length;
  const calculated = registry.filter((item) => item.origin === EVIDENCE_ORIGIN.CALCULATED).length;
  const limitations = (state.documentSections?.conclusions?.limitations ?? [])
    .map((id) => limitationOptions.find((item) => item.id === id)?.label || text(id))
    .filter(Boolean);
  const extra = text(state.documentSections?.conclusions?.limitationText);
  if (extra) limitations.push(extra);
  return {
    domains: [
      'Infraestructura y virtualización',
      'Red y perímetro',
      'Identidad y accesos',
      'Almacenamiento y respaldo',
      'Desempeño y capacidad',
      'Incidentes y cambios',
      'Gobierno y restricciones de inversión',
    ],
    sources: [
      doc?.title ? `${doc.title} (${doc.pages || '?'} páginas)` : 'Documento fuente del caso',
      `${verified} evidencias verificadas en el PDF`,
      calculated ? `${calculated} resultados calculados (no literales del PDF)` : '',
      'Trabajo documentado en InfraGuide (hallazgos, métricas, AS-IS, decisiones)',
    ].filter(Boolean),
    method:
      'Análisis guiado por evidencia: localizar dato en el caso, calcular cuando el PDF lo exige, diagnosticar, gobernar y decidir. ITIL, COBIT e ISO/IEC 27001 se usan como lentes de control, no como capítulos teóricos.',
    limitations: limitations.length
      ? limitations
      : [
          'No hay RTO/RPO formales aprobados en el caso.',
          'El MTBF, cuando se presenta, es una estimación con limitaciones.',
          'Los costos del PDF son valores de referencia, no cotizaciones.',
        ],
    assumptions: [
      'La suma de duraciones de incidentes representa el tiempo de afectación del periodo (el PDF pide calcular el total).',
      'La proyección de almacenamiento supone crecimiento constante al ritmo observado.',
    ],
    toConfirm: [
      'Topología física y versiones de software',
      'Licenciamiento y compatibilidad',
      'Telemetría continua (no solo el corte del 28 de agosto)',
      'RTO y RPO aprobados por el negocio',
      'Cotizaciones vigentes',
      'Propietarios formales de servicios',
    ],
  };
}

function buildDictamen(state, caseData, findings, recs, expected, facts) {
  const insufficient = !findings.length;
  const critical = findings.filter((item) => item.severityId === 'critical' || item.severityId === 'high');
  const budget = fieldOf(caseData, 'budgetLimit');
  const committee = fieldOf(caseData, 'committeeThreshold');
  const kpis = [];
  if (expected?.availabilityPercent != null) {
    kpis.push({
      label: 'Disponibilidad observada',
      value: `${formatEsNumber(expected.availabilityPercent, 2)} %`,
      kind: STATEMENT_KIND.CALCULATION,
    });
  }
  if (expected?.mttrHours != null) {
    kpis.push({ label: 'MTTR', value: `${formatEsNumber(expected.mttrHours, 2)} h`, kind: STATEMENT_KIND.CALCULATION });
  }
  const usedPct = getFact(facts, 'storageUsedPercent') || getFact(facts, 'storageUsed');
  if (expected?.storageUsedPercent != null) {
    kpis.push({
      label: 'Uso NAS-01',
      value: `${formatEsNumber(expected.storageUsedPercent, 0)} %`,
      kind: STATEMENT_KIND.CALCULATION,
    });
  }
  void usedPct;
  const strategy = text(state.documentSections?.strategy?.text || state.analysis?.decide?.strategy?.draft);
  const topRec = recs.find((item) => item.priority === 'immediate') || recs[0];
  return {
    insufficient,
    condition: insufficient
      ? 'Información insuficiente para emitir una conclusión definitiva.'
      : text(state.documentSections?.conclusions?.text) ||
        `La infraestructura opera, pero concentra exposiciones en ${critical.length ? critical.map((item) => item.title).slice(0, 3).join('; ') : 'controles, capacidad y continuidad'}.`,
    exposures: (critical.length ? critical : findings).slice(0, 5).map((item) => item.title),
    recommendedDecision:
      text(topRec?.decision) ||
      strategy ||
      (insufficient ? 'No se recomienda aprobar inversión hasta documentar hallazgos sustentados.' : 'Priorizar estabilización de controles y puntos únicos antes de expansión.'),
    immediatePriorities: recs
      .filter((item) => item.priority === 'immediate' || item.priority === 'high')
      .map((item) => text(item.decision))
      .filter(Boolean)
      .slice(0, 5),
    investmentConditions: [
      budget ? `Respetar el techo de ${budget.value} (página ${budget.page}).` : '',
      committee ? `Compras superiores a ${committee.value} requieren comité (página ${committee.page}).` : '',
      'No presentar valores de referencia del caso como cotización definitiva.',
      'Cada iniciativa debe citar hallazgo, evidencia y criterio de aceptación.',
    ].filter(Boolean),
    kpis,
  };
}

function buildArchitecture(state, caseData, findings, markUsed) {
  const spofDoc = state.documentSections?.spof?.rows ?? [];
  const records = state.analysis?.represent?.spof?.records ?? {};
  const chains = state.analysis?.represent?.asIs?.chains ?? {};
  const asIsText = text(state.documentSections?.asis?.text || state.analysis?.represent?.asIs?.description);
  const fw = fieldOf(caseData, 'mainFirewallCount');
  const db = fieldOf(caseData, 'erpDb01Vcpu');
  const ad = fieldOf(caseData, 'adSrv01Vcpu');
  if (fw) markUsed(fw, 'arquitectura');
  if (db) markUsed(db, 'arquitectura');
  if (ad) markUsed(ad, 'arquitectura');

  const spof = (spofDoc.length
    ? spofDoc
    : Object.values(records).filter((item) => item?.status === 'justified' || item?.status === 'possible')
  ).map((row) => {
    const id = row.componentId || row.id;
    return {
      component: text(row.name) || nodeName(id),
      status: row.status || 'documentado',
      impact: text(row.impact),
      justification: text(row.justification),
    };
  });

  const incidentRows = caseIncidents.map((incident) => {
    const linked = state.analysis?.represent?.incidents?.[incident.id] ?? incident.suggestedComponentIds ?? [];
    return {
      incident: incident.title,
      duration: incident.duration,
      impact: incident.impact,
      components: linked.map(nodeName).filter(Boolean),
    };
  });

  const uniqueIds = new Set([
    ...Object.values(chains).flat(),
    ...spof.map((item) => item.component),
  ]);
  const componentTable = architectureNodes
    .filter((node) => node.principal)
    .filter((node) => {
      const inChain = Object.values(chains).some((ids) => (ids ?? []).includes(node.id));
      const inSpof = spof.some((item) => item.component === node.name);
      return inChain || inSpof || node.id === 'firewall' || node.id === 'db-srv01' || node.id === 'nas' || node.id === 'app-srv01';
    })
    .map((node) => {
      const rec = records[node.id];
      const mode = incidentRows.find((row) => row.components.includes(node.name));
      return {
        component: node.name,
        condition: text(node.characteristics),
        failureMode: mode ? `${mode.incident} (${mode.duration})` : rec?.status === 'justified' ? 'Instancia única sin alternativa documentada' : 'No hay modo de falla documentado para este componente',
        impact: text(rec?.impact || mode?.impact),
        treatment: findings.find((item) => item.condition.toLowerCase().includes(node.name.toLowerCase()))?.treatment || 'Ver hallazgos asociados',
      };
    });

  void uniqueIds;
  return {
    asIsSummary: asIsText || 'Se representa únicamente la cadena AS-IS documentada. No se relista el inventario completo.',
    criticalDependencies: [
      fw ? `Perímetro: ${fw.value}` : '',
      db ? 'Datos: ERP-DB01 instancia única' : '',
      ad ? 'Identidad: AD-SRV01 controlador principal único' : '',
    ].filter(Boolean),
    spof,
    failureModes: incidentRows,
    redundancyNote:
      'HV-01/HV-02 no equivalen a redundancia de aplicación: ERP-APP01, ERP-DB01, FW-01 y AD-SRV01 permanecen únicos en el caso.',
    recovery: text(fieldOf(caseData, 'backupRestoreTests')?.value) || 'Pruebas de restauración: ver evidencia de respaldo.',
    componentTable,
    chains: Object.entries(chains).map(([serviceId, nodeIds]) => ({
      serviceId,
      nodes: (nodeIds ?? []).map((id) => ({ id, name: nodeName(id) })).filter((item) => item.name),
    })),
  };
}

function buildMetrics(state, caseData, expected, facts, markUsed) {
  const sub = state.documentSections?.metrics?.subsections ?? {};
  const measure = state.analysis?.measure ?? {};
  const rows = [];

  const push = (id, label, formula, sourceKeys, result, interpretation, limitation, decision) => {
    const sources = sourceKeys
      .map((key) => fieldOf(caseData, key))
      .filter(Boolean);
    sources.forEach((ev) => markUsed(ev, `métrica:${id}`));
    const documented = sub[id] || {};
    rows.push({
      id,
      label,
      formula: text(documented.formula) || formula,
      data: text(documented.data) || sources.map((ev) => `${ev.label}: ${ev.value}`).join(' · '),
      substitution: text(documented.substitution),
      result: text(documented.result) || result,
      interpretation: text(documented.interpretation || documented.text || interpretation),
      limitation: text(documented.limitation || limitation),
      decision: decision,
      kind: STATEMENT_KIND.CALCULATION,
      sources: sources.map((ev) => ({
        evidenceId: ev.evidenceId,
        citation: citationOf(caseData, ev),
        href: academicPdfHref(caseData, ev),
        page: ev.page,
        origin: ev.origin,
      })),
    });
  };

  if (expected && (sub.availability || measure.availability?.result != null || getFact(facts, 'periodHours'))) {
    push(
      'availability',
      'Disponibilidad observada',
      'Disponibilidad = (Tiempo total − tiempo fuera de servicio) / Tiempo total × 100',
      ['periodHours', 'downtimeHours'],
      `${formatEsNumber(expected.availabilityPercent, 2)} %`,
      'Disponibilidad del periodo de 90 días. No es un SLA.',
      'El total de indisponibilidad es una suma; el PDF no lo imprime como cifra única.',
      'Usar como línea base. No afirmar cumplimiento de SLA.',
    );
  }
  if (expected && (sub.mttr || measure.mttr?.result != null || getFact(facts, 'incidentCount'))) {
    push(
      'mttr',
      'MTTR',
      'MTTR = Tiempo total de recuperación / Número de incidentes',
      ['totalRecoveryHours', 'incidentCount'],
      `${formatEsNumber(expected.mttrHours, 2)} h`,
      'Promedio de restauración del registro. No es la duración de cada evento.',
      'Cinco incidentes; duraciones heterogéneas.',
      'Comparar con la expectativa informal de recuperación del ERP (<2 h) declarada en el caso, sin tratarla como RTO aprobado.',
    );
  }
  if (expected && (sub.mtbf || measure.mtbf?.result != null)) {
    push(
      'mtbf',
      'MTBF estimado',
      'MTBF ≈ (Tiempo total − tiempo fuera) / Número de incidentes',
      ['periodHours', 'downtimeHours', 'incidentCount'],
      `≈ ${formatEsNumber(expected.mtbfHours, 2)} h`,
      'Estimación académica.',
      'No hay marca temporal completa ni definición uniforme de fallo por servicio.',
      'No usar como garantía de intervalo entre fallos.',
    );
  }
  if (expected && (sub.storage || measure.storage?.result != null || getFact(facts, 'storageCapacity'))) {
    push(
      'storage',
      'Uso y margen de almacenamiento',
      'Uso % = usado / capacidad × 100; meses ≈ (capacidad − usado) / crecimiento mensual',
      ['storageCapacity', 'storageUsed', 'storageGrowth'],
      `${formatEsNumber(expected.storageUsedPercent, 0)} % usado · ≈ ${formatEsNumber(expected.storageMonths, 1)} meses de margen teórico`,
      'Si el crecimiento continúa al ritmo observado, el margen es teórico.',
      'No es fecha exacta de agotamiento.',
      'Anticipar capacidad antes de umbral. La expansión NAS del caso es un valor de referencia, no una orden de compra.',
    );
  }
  if (expected && (sub.performance || measure.performance?.result != null || getFact(facts, 'appLatencyPeak'))) {
    const latN = getFact(facts, 'appLatencyNormal');
    const latP = getFact(facts, 'appLatencyPeak');
    const demN = getFact(facts, 'appDemandNormal');
    const demP = getFact(facts, 'appDemandPeak');
    push(
      'performance',
      'Tiempo de respuesta y demanda concurrente',
      'Relación pico/habitual = respuesta pico / respuesta habitual',
      ['appLatencyNormal', 'appLatencyPeak', 'appDemandNormal', 'appDemandPeak'],
      `Relación ≈ ${formatEsNumber(expected.latencyRatio, 2)} · concurrentes ${demN?.displayValue || demN?.value} → ${demP?.value}`,
      'Degradación observada el 28 de agosto durante cierre comercial.',
      'Corte de un día; no demuestra saturación permanente.',
      'Disponible no implica responder dentro de umbral de negocio.',
    );
    void latN;
    void latP;
  }
  if (getFact(facts, 'appCpuPeak')) {
    const cpu = getFact(facts, 'appCpuPeak');
    const ram = getFact(facts, 'appRamUsage');
    markUsed(fieldOf(caseData, 'appCpuPeak'), 'métrica:capacity');
    if (ram) markUsed(fieldOf(caseData, 'appRamUsage'), 'métrica:capacity');
    rows.push({
      id: 'capacity',
      label: 'Utilización ERP-APP01 (28 ago.)',
      formula: 'No hay una única fórmula: se relacionan CPU, RAM y demanda del mismo corte.',
      data: `CPU pico ${cpu.displayValue || cpu.value}${ram ? ` · RAM ${ram.displayValue || ram.value}` : ''}`,
      result: text(sub.capacity?.result) || 'Patrón de degradación bajo alta demanda',
      interpretation: text(sub.capacity?.interpretation || sub.capacity?.text) || 'Señal de presión, no autorización de compra.',
      limitation: 'Pico ≠ promedio. Un corte no demuestra saturación sostenida.',
      decision: 'Correlacionar con tiempo de respuesta antes de dimensionar.',
      kind: STATEMENT_KIND.FACT,
      sources: [fieldOf(caseData, 'appCpuPeak'), fieldOf(caseData, 'appRamUsage')]
        .filter(Boolean)
        .map((ev) => ({ evidenceId: ev.evidenceId, citation: citationOf(caseData, ev), href: academicPdfHref(caseData, ev), page: ev.page })),
    });
  }
  return rows;
}

function buildRisks(state, findings, recs) {
  return findings.map((item) => {
    const rec = recs.find((entry) => (entry.findingIds ?? []).includes(item.sourceFindingId));
    const iso = (state.analysis?.govern?.iso27001 ?? []).find((entry) => entry.findingId === item.sourceFindingId);
    return {
      id: item.riskId,
      findingId: item.id,
      title: item.title,
      probability: item.severityId === 'critical' || item.severityId === 'high' ? 'Alta (condición ya observada)' : 'Media / por calificar',
      impact: item.businessImpact,
      exposure: item.severity,
      asset: iso ? isoAssetLabel(iso.assetId) : item.category,
      existingControl: iso ? text(iso.control) : 'Control existente no documentado de forma específica',
      gap: item.cause,
      treatment: item.treatment || 'Tratamiento pendiente de documentar',
      residual: rec?.residualLow ? text(rec.residualJustification) || 'Residual declarado bajo por el analista' : 'Residual por reevaluar tras implementar',
    };
  });
}

function buildControlMap(state, findings) {
  const rows = [];
  (state.analysis?.govern?.itil ?? []).forEach((item) => {
    const finding = findings.find((entry) => entry.sourceFindingId === item.findingId);
    rows.push({
      domain: 'ITIL',
      findingId: finding?.id || '',
      reference: itilPracticeLabel(item.practice) || text(item.practiceLabel),
      application: text(item.action || item.situation),
      indicator: itilIndicatorLabel(item.indicator) || '',
    });
  });
  (state.analysis?.govern?.cobit ?? []).forEach((item) => {
    const finding = findings.find((entry) => entry.sourceFindingId === item.findingId);
    rows.push({
      domain: 'COBIT',
      findingId: finding?.id || '',
      reference: cobitIndicatorLabel(item.indicator) || 'Gobierno de decisión',
      application: text(item.decision || item.problem),
      indicator: (item.responsibleIds ?? []).map(cobitResponsibleLabel).join(', '),
    });
  });
  (state.analysis?.govern?.iso27001 ?? []).forEach((item) => {
    const finding = findings.find((entry) => entry.sourceFindingId === item.findingId);
    rows.push({
      domain: 'ISO/IEC 27001',
      findingId: finding?.id || '',
      reference: [isoAssetLabel(item.assetId), isoThreatLabel(item.threatId), isoVulnLabel(item.vulnerabilityId)].filter(Boolean).join(' · '),
      application: text(item.control),
      indicator: text(item.impact),
    });
  });
  return rows;
}

function buildTarget(state, findings, recs) {
  const strategy = state.analysis?.decide?.strategy ?? {};
  const parts = ['keep', 'improve', 'scale', 'redundant', 'cloud', 'edge', 'measure']
    .map((key) => text(strategy[key]))
    .filter(Boolean);
  const summary = text(state.documentSections?.strategy?.text) || parts.join(' ');
  const requirements = recs.map((item, index) => {
    const linked = findings.filter((finding) => (item.findingIds ?? []).includes(finding.sourceFindingId));
    return {
      id: `RQT-${String(index + 1).padStart(2, '0')}`,
      domain: domainFromRec(item),
      description: text(item.decision),
      findingIds: linked.map((finding) => finding.id),
      acceptance: text(item.metricTarget || item.metricText) || 'Criterio de aceptación pendiente',
      dependency: (item.alternatives ?? []).map((alt) => text(alt.title)).filter(Boolean).join('; ') || 'Sin dependencia documentada',
      priority: priorityLabel(item.priority),
    };
  });
  const components = recs.slice(0, 8).map((item) => ({
    name: text(item.title || item.decision),
    change: 'Nuevo o modificado según la recomendación',
    findingIds: findings.filter((finding) => (item.findingIds ?? []).includes(finding.sourceFindingId)).map((finding) => finding.id),
  }));
  return {
    disclaimer:
      'Arquitectura objetivo de referencia, sujeta a validación de compatibilidad, dimensionamiento y pruebas.',
    summary: summary || 'No hay estrategia TO-BE documentada. No se inventa un diseño futuro.',
    components,
    requirements,
  };
}

function domainFromRec(item) {
  const blob = `${item.decision || ''} ${item.justification || ''}`.toLowerCase();
  if (/mfa|cuenta|identidad|parche/.test(blob)) return 'Identidad / seguridad';
  if (/firewall|fw-01|red|vpn/.test(blob)) return 'Red y perímetro';
  if (/nas|almacen|backup|respaldo/.test(blob)) return 'Almacenamiento / continuidad';
  if (/erp|capacidad|cpu|monitoreo/.test(blob)) return 'Capacidad / monitoreo';
  return 'Infraestructura';
}

function ratingScore(value) {
  if (value === 'favorable') return 5;
  if (value === 'medium') return 3;
  if (value === 'unfavorable') return 1;
  return null;
}

function averageRatings(ratings = {}) {
  const nums = Object.values(ratings).map(ratingScore).filter((item) => item != null);
  if (!nums.length) return null;
  return nums.reduce((a, b) => a + b, 0) / nums.length;
}

function buildAlternatives(state, recs) {
  const tech = state.analysis?.decide?.draft?.tech || recs[0]?.tech || {};
  const onprem = averageRatings(tech.onprem?.ratings);
  const cloud = averageRatings(tech.cloud?.ratings);
  const hybrid = averageRatings(tech.hybrid?.ratings);
  const scored = [onprem, cloud, hybrid].some((item) => item != null);

  const options = [
    {
      id: 'local',
      label: 'Continuidad de la arquitectura local',
      notes: text(tech.onprem?.helps) || 'Modernizar sobre el ERP actual y el sitio de Bogotá.',
      scores: {},
      total: onprem,
    },
    {
      id: 'hybrid',
      label: 'Modernización híbrida gradual',
      notes: text(tech.hybrid?.why) || 'Mantener críticos en sitio y evaluar servicios acotados.',
      scores: {},
      total: hybrid,
    },
    {
      id: 'cloud',
      label: 'Migración acelerada a nube',
      notes: text(tech.cloud?.elasticity) || 'El ERP no puede reemplazarse en 18 meses; una migración acelerada choca con esa restricción si implica reemplazo.',
      scores: {},
      total: cloud,
    },
  ];

  if (scored) {
    options.forEach((option) => {
      const base = option.total ?? 3;
      METHOD_WEIGHTS.forEach((criterion) => {
        option.scores[criterion.id] = Number(base.toFixed(2));
      });
      option.weighted = METHOD_WEIGHTS.reduce((sum, criterion) => sum + base * criterion.weight, 0);
    });
  }

  const selected = scored
    ? options.slice().sort((a, b) => (b.weighted || 0) - (a.weighted || 0))[0]
    : recs.some((item) => /híbrid|hybrid/.test(`${item.decision} ${item.justification}`.toLowerCase()))
      ? options[1]
      : options[0];

  return {
    criteria: METHOD_WEIGHTS.map((item) => ({ ...item, note: 'Peso metodológico de InfraGuide. No proviene del PDF.' })),
    options,
    selectedId: selected.id,
    scored,
    justification: scored
      ? `La alternativa “${selected.label}” obtiene el mayor puntaje ponderado a partir de las calificaciones documentadas por el analista.`
      : 'No hay matriz numérica documentada. La selección se deriva de las recomendaciones y de la restricción de no reemplazar el ERP en 18 meses. No se inventan puntajes.',
  };
}

function buildProgram(state, caseData, recs, findings, facts, markUsed) {
  const budget = fieldOf(caseData, 'budgetLimit');
  const nas = fieldOf(caseData, 'nasExpansionCost');
  const fw = fieldOf(caseData, 'secondFirewallCost');
  const mon = fieldOf(caseData, 'monitoringMonthlyCost');
  [budget, nas, fw, mon].filter(Boolean).forEach((ev) => markUsed(ev, 'programa'));

  const initiatives = recs.map((item, index) => {
    const blob = `${item.decision || ''} ${item.justification || ''}`.toLowerCase();
    let capex = { amount: null, label: COST_CLASS.TO_VALIDATE, evidenceId: null };
    let opex = { amount: null, label: COST_CLASS.TO_VALIDATE, evidenceId: null };
    if (/nas|almacen/.test(blob) && nas) {
      capex = { amount: nas.value, label: `${COST_CLASS.REFERENCE}: ${nas.value}`, evidenceId: nas.evidenceId };
    }
    if (/firewall|fw-01/.test(blob) && fw) {
      capex = { amount: fw.value, label: `${COST_CLASS.REFERENCE}: ${fw.value}`, evidenceId: fw.evidenceId };
    }
    if (/monitoreo|siem/.test(blob) && mon) {
      opex = { amount: mon.value, label: `${COST_CLASS.REFERENCE}: ${mon.value}`, evidenceId: mon.evidenceId };
    }
    const linked = findings.filter((finding) => (item.findingIds ?? []).includes(finding.sourceFindingId));
    return {
      id: `INI-${String(index + 1).padStart(2, '0')}`,
      title: text(item.decision),
      findingIds: linked.map((finding) => finding.id),
      priority: priorityLabel(item.priority),
      horizon: horizonForPriority(item.priority),
      capex,
      opex,
      costModel: costLabel(item.costModel),
      duration: horizonForPriority(item.priority),
      dependency: (item.alternatives ?? []).map((alt) => text(alt.title)).filter(Boolean).join('; '),
      result: text(item.benefitText),
      owner: suggestedOwner(linked[0]?.category, item),
    };
  });

  const capexSum = initiatives.reduce((sum, item) => sum + (Number(item.capex.amount) || 0), 0);
  const sufficiency = budget
    ? capexSum
      ? `Suma de valores de referencia vinculados: COP ${formatEsNumber(capexSum, 1)} millones frente a un techo de ${budget.value}. No es una cotización. ${COST_CLASS.NOT_INCLUDED}.`
      : `Hay un techo de ${budget.value} (página ${budget.page}). Las iniciativas sin monto quedan como ${COST_CLASS.TO_VALIDATE}.`
    : 'No hay techo presupuestal documentado.';

  const horizons = [
    { id: 'immediate', label: 'Inmediato (0–30 días)', items: initiatives.filter((item) => item.horizon === '0–30 días') },
    { id: 'stabilize', label: 'Estabilización (31–90 días)', items: initiatives.filter((item) => item.horizon === '31–90 días') },
    { id: 'implement', label: 'Implementación (3–6 meses)', items: initiatives.filter((item) => item.horizon === '3–6 meses') },
    { id: 'consolidate', label: 'Consolidación (6–12 meses)', items: initiatives.filter((item) => item.horizon === '6–12 meses' || item.horizon === 'Por definir') },
  ];

  void facts;
  return {
    budgetNote: budget ? citationOf(caseData, budget) : '',
    budgetLimit: budget ? { value: budget.value, page: budget.page, evidenceId: budget.evidenceId } : null,
    initiatives,
    horizons,
    sufficiency,
  };
}

function buildGovernance(state, caseData, expected, recs, markUsed) {
  const mfa = fieldOf(caseData, 'mfaCoverage');
  const patches = fieldOf(caseData, 'pendingPatches');
  const restore = fieldOf(caseData, 'backupRestoreTests');
  const capacity = fieldOf(caseData, 'capacityDecisions');
  const channels = fieldOf(caseData, 'incidentRegistrationCoverage');
  const rollback = fieldOf(caseData, 'incidentERollback');
  [mfa, patches, restore, capacity, channels, rollback].filter(Boolean).forEach((ev) => markUsed(ev, 'gobierno'));

  const practices = [
    { domain: 'Cambios', source: rollback ? String(rollback.value) : 'Práctica por formalizar; no hay evidencia específica en el análisis.' },
    { domain: 'Configuración', source: 'Por formalizar en ingeniería de detalle.' },
    { domain: 'Monitoreo', source: 'Depende de las herramientas y brechas documentadas en el análisis.' },
    { domain: 'Capacidad', source: capacity ? String(capacity.value) : 'Por formalizar.' },
    { domain: 'Incidentes', source: channels ? String(channels.value) : 'Por formalizar.' },
    { domain: 'Problemas', source: 'Por formalizar.' },
    { domain: 'Recuperación', source: restore ? String(restore.value) : 'Por confirmar con evidencia de restauración.' },
    { domain: 'Accesos', source: mfa ? `MFA privilegiado: ${mfa.value}` : 'Por formalizar.' },
    { domain: 'Vulnerabilidades', source: patches ? String(patches.value) : 'Por formalizar.' },
  ];
  const kpis = [
    {
      domain: 'Disponibilidad',
      kpi: 'Disponibilidad observada',
      baseline: expected ? `${formatEsNumber(expected.availabilityPercent, 2)} %` : 'No calculada',
      target: recs.find((item) => (item.metricIds ?? []).includes('availability'))?.metricTarget || 'Meta por definir',
      evidence: 'Cálculo del periodo observado. No es un SLA.',
      owner: 'Operaciones',
    },
    {
      domain: 'Recuperación',
      kpi: 'MTTR',
      baseline: expected ? `${formatEsNumber(expected.mttrHours, 2)} h` : 'No calculada',
      target: recs.find((item) => (item.metricIds ?? []).includes('mttr'))?.metricTarget || 'Meta por definir',
      evidence: 'Cálculo sobre el registro de incidentes del caso',
      owner: 'Infraestructura',
    },
    {
      domain: 'Almacenamiento',
      kpi: 'Utilización NAS',
      baseline: expected ? `${formatEsNumber(expected.storageUsedPercent, 0)} %` : 'No calculada',
      target: recs.find((item) => (item.metricIds ?? []).includes('storage-use'))?.metricTarget || 'Umbral por aprobar',
      evidence: 'Cálculo sobre capacidad y uso de NAS-01',
      owner: 'Infraestructura',
    },
  ];
  if (mfa) {
    kpis.push({
      domain: 'Accesos',
      kpi: 'Cobertura MFA privilegiado',
      baseline: String(mfa.value),
      target: recs.find((item) => /mfa/i.test(`${item.decision} ${item.metricText}`))?.metricTarget || 'Meta por definir',
      evidence: citationOf(caseData, mfa),
      owner: 'Identidad / seguridad',
    });
  }
  if (patches) {
    kpis.push({
      domain: 'Vulnerabilidades',
      kpi: 'Servidores con parches pendientes',
      baseline: String(patches.value),
      target: recs.find((item) => /parche/i.test(`${item.decision} ${item.metricText}`))?.metricTarget || 'Meta por definir',
      evidence: citationOf(caseData, patches),
      owner: 'Infraestructura',
    });
  }
  (state.analysis?.govern?.itil ?? []).forEach((item) => {
    if (item.indicator) {
      kpis.push({
        domain: 'ITIL',
        kpi: itilIndicatorLabel(item.indicator) || item.indicator,
        baseline: 'Línea base no medida en el caso',
        target: 'Meta por definir',
        evidence: text(item.action),
        owner: 'Coordinación de TI',
      });
    }
  });
  return { practices, kpis };
}

function buildClosing(state, report) {
  const strengths = (state.documentSections?.conclusions?.selectedStrengths ?? [])
    .map((id) => strengthOptions.find((item) => item.id === id)?.label)
    .filter(Boolean);
  return {
    condition: report.executiveOpinion.condition,
    decision: report.executiveOpinion.recommendedDecision,
    priorities: report.executiveOpinion.immediatePriorities,
    inactionRisks: report.findings
      .filter((item) => item.severityId === 'critical' || item.severityId === 'high')
      .map((item) => item.implication)
      .filter(Boolean)
      .slice(0, 5),
    approvalConditions: report.executiveOpinion.investmentConditions,
    pending: report.scope.toConfirm,
    strengths,
  };
}

function buildEngineeringGap(state, caseData, report) {
  const items = [
    'Topología física del cuarto técnico y de los CD',
    'Versiones de hipervisor, SQL, firmware de NAS y FW-01',
    'Licenciamiento y ventanas de soporte',
    'Compatibilidad de un segundo firewall con la VPN actual',
    'Telemetría continua (CPU, RAM, latencia, backups, seguridad) unificada',
    'Configuración vigente de FW-01, AD y respaldos',
    'RTO y RPO aprobados por el negocio (el caso solo declara expectativas informales)',
    'Cotizaciones vigentes (los montos del PDF son referencia)',
    'Evidencia de pruebas de restauración posteriores a noviembre de 2025',
    'Propietarios formales de cada servicio',
  ];
  if (report.validation?.warnings?.length) {
    items.push(...report.validation.warnings);
  }
  void state;
  void caseData;
  return items;
}

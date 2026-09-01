import { metricSubsections, limitationOptions, strengthOptions } from '../data/methodology/build.js';
import { effectiveExportConfig, INFRAGUIDE_VERSION, createExportConfig } from '../data/methodology/export.js';
import { getCaseById } from '../data/cases/index.js';
import { assembleDocument } from '../state/buildModel.js';
import { documentedFindings, costLabel, metricLabel, priorityLabel } from '../state/decideModel.js';
import { categoryLabel, criticalityLabel } from '../state/diagnoseModel.js';
import {
  itilPracticeLabel,
  cobitResponsibleLabel,
  cobitIndicatorLabel,
  isoAssetLabel,
  isoThreatLabel,
  isoVulnLabel,
  itilIndicatorLabel,
} from '../state/governModel.js';
import { baseEvidenceCatalog } from '../data/methodology/diagnose.js';
import { getDiagramNode, getNodeById } from '../state/representModel.js';
import {
  sanitizePlain,
  hasBrokenPlaceholder,
  looksUnsafe,
  formatLocalDate,
  generateTimestamp,
  stripTechnicalIds,
} from './text.js';

function evidenceLabel(id) {
  return stripTechnicalIds(baseEvidenceCatalog.find((item) => item.id === id)?.datum || '');
}

function clean(value) {
  return stripTechnicalIds(sanitizePlain(value));
}

function findingTitle(findings, id) {
  return clean(findings.find((item) => item.findingId === id)?.title || '');
}

function nodeName(id) {
  const node = getDiagramNode(id) || getNodeById(id);
  return clean(node?.name || '');
}

export function validateExportPayload(state, config) {
  const errors = [];
  if (!state.analysis?.build?.readyToExport) {
    errors.push('Tu documento todavía requiere revisión antes de exportar.');
  }
  const assembled = assembleDocument(state);
  assembled.forEach((section) => {
    const hasRows = (section.rows ?? []).length > 0;
    const hasChains = (section.chains ?? []).length > 0;
    const hasSubs = Object.keys(section.subsections ?? {}).length > 0;
    if (!clean(section.text) && section.key !== 'asis' && !hasRows && !hasChains && !hasSubs) {
      if (section.status !== 'COMPLETA') {
        errors.push(`Falta contenido obligatorio: ${section.title}.`);
      }
    }
    if (hasBrokenPlaceholder(section.text) || looksUnsafe(section.text)) {
      errors.push(`La sección ${section.title} contiene un valor no exportable.`);
    }
    Object.values(section.subsections || {}).forEach((sub) => {
      if (hasBrokenPlaceholder(sub?.result) || hasBrokenPlaceholder(sub?.text)) {
        errors.push(`Una métrica de ${section.title} contiene un valor no numérico.`);
      }
    });
  });
  const findings = documentedFindings(state);
  (state.analysis?.decide?.recommendations ?? []).forEach((rec) => {
    (rec.findingIds ?? []).forEach((id) => {
      if (!findings.some((item) => item.findingId === id)) {
        errors.push('Hay una recomendación con referencia rota a un hallazgo.');
      }
    });
    const blob = `${rec.decision} ${rec.benefitText} ${rec.metricText}`;
    if (hasBrokenPlaceholder(blob)) {
      errors.push('Una recomendación contiene un valor no numérico (NaN/undefined).');
    }
  });
  void config;
  return [...new Set(errors)];
}

export function buildExportModel(state, rawConfig = createExportConfig()) {
  const config = effectiveExportConfig(rawConfig);
  const academic = config.mode === 'academic';
  const caseData = state.selectedCase?.id ? getCaseById(state.selectedCase.id) : null;
  const findings = documentedFindings(state);
  const recs = state.analysis?.decide?.recommendations ?? [];
  const assembled = assembleDocument(state);
  const version = Number(state.analysis?.export?.nextVersion) || 1;
  const generatedAt = generateTimestamp();

  const cover = {
    kicker: 'GESTIÓN DE LA INFRAESTRUCTURA',
    title: 'Análisis del Caso Técnico',
    caseName: clean(caseData?.name || state.selectedCase?.name || 'Helados Boreal S.A.S.'),
    sector: clean(caseData?.sector || 'Producción y comercialización de alimentos congelados'),
    generatedAt,
    generatedLabel: formatLocalDate(new Date(generatedAt)),
    app: 'InfraGuide',
    appVersion: INFRAGUIDE_VERSION,
    documentVersion: `v${version}`,
    modeLabel: academic ? 'Documento académico' : 'Documento limpio',
  };

  const sections = assembled.map((section) => buildSection(section, { state, findings, recs, config, academic }));

  return {
    cover,
    index: sections.map((item) => ({ id: item.id, key: item.key, title: item.title })),
    sections,
    config,
    manifest: {
      caseId: state.selectedCase?.id || '',
      generatedAt,
      documentVersion: version,
      exportMode: config.mode,
      sectionsIncluded: sections.map((item) => item.key),
      InfraGuideVersion: INFRAGUIDE_VERSION,
    },
  };
}

function buildSection(section, ctx) {
  const { state, findings, recs, config, academic } = ctx;
  const blocks = [];

  if (section.key === 'context' || section.key === 'strategy') {
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'criticalServices') {
    blocks.push(
      tableBlock(
        ['Servicio', 'Justificación'],
        (section.rows ?? []).map((row) => [clean(row.name || row.label), clean(row.justification)]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'asis') {
    if (config.includeAsIs) blocks.push(asisBlock(section, state));
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'inventory') {
    blocks.push(
      tableBlock(
        ['Componente', 'Relevancia'],
        (section.rows ?? []).map((row) => [clean(row.name || row.label), clean(row.justification || row.type)]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'spof') {
    const headers =
      academic && config.includeEvidence
        ? ['Componente', 'Impacto', 'Justificación', 'Evidencia']
        : ['Componente', 'Impacto', 'Justificación'];
    const rows = (section.rows ?? []).map((row) => {
      const base = [clean(row.name), clean(row.impact), clean(row.justification)];
      if (headers.length === 4) base.push(clean(row.evidence || row.sourceLabel));
      return base;
    });
    blocks.push(tableBlock(headers, rows));
  } else if (section.key === 'metrics') {
    blocks.push(...metricsBlocks(section, state, config, academic));
  } else if (section.key === 'findings') {
    blocks.push(
      tableBlock(
        ['#', 'Hallazgo', 'Categoría', 'Evidencia', 'Impacto', 'Criticidad'],
        findings.map((item, index) => [
          String(index + 1),
          clean(item.title),
          categoryLabel(item.category),
          (item.evidenceIds ?? []).map(evidenceLabel).filter(Boolean).join('; '),
          clean(item.impact),
          criticalityLabel(item.criticality),
        ]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'itil') {
    blocks.push(
      tableBlock(
        ['Situación', 'Práctica', 'Acción', 'Beneficio', 'Indicador'],
        (state.analysis?.govern?.itil ?? []).map((item) => [
          clean(item.situation),
          clean(item.practiceLabel || itilPracticeLabel(item.practice)),
          clean(item.action),
          clean(item.benefit),
          clean(itilIndicatorLabel(item.indicator) || ''),
        ]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'cobit') {
    blocks.push(
      tableBlock(
        ['Problema', 'Decisión', 'Responsable', 'Indicador'],
        (state.analysis?.govern?.cobit ?? []).map((item) => [
          clean(item.problem),
          clean(item.decision),
          (item.responsibleIds ?? []).map(cobitResponsibleLabel).join(', ') || clean(item.responsible),
          clean(cobitIndicatorLabel(item.indicator) || ''),
        ]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'iso27001') {
    blocks.push(
      tableBlock(
        ['Activo', 'Amenaza', 'Vulnerabilidad', 'Impacto', 'Control'],
        (state.analysis?.govern?.iso27001 ?? []).map((item) => [
          isoAssetLabel(item.assetId),
          isoThreatLabel(item.threatId),
          isoVulnLabel(item.vulnerabilityId),
          clean(item.impact),
          clean(item.control),
        ]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'capex') {
    blocks.push(
      tableBlock(
        ['Recomendación', 'CAPEX/OPEX', 'Justificación'],
        recs.map((item) => [clean(item.title || item.decision), costLabel(item.costModel), clean(item.costJustification)]),
      ),
    );
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
  } else if (section.key === 'recommendations') {
    blocks.push(
      tableBlock(
        ['Prioridad', 'Recomendación', 'Hallazgo', 'Beneficio', 'Métrica'],
        recs.map((item) => [
          priorityLabel(item.priority),
          clean(item.decision),
          (item.findingIds ?? []).map((id) => findingTitle(findings, id)).filter(Boolean).join(' · '),
          clean(item.benefitText),
          clean(item.metricText || (item.metricIds ?? []).map(metricLabel).join(', ')),
        ]),
      ),
    );
    if (academic && config.includeTraceability) {
      recs.forEach((item) => {
        blocks.push({
          type: 'recTrace',
          recommendation: clean(item.decision),
          finding: (item.findingIds ?? []).map((id) => findingTitle(findings, id)).filter(Boolean).join(' · '),
          evidence: (item.evidenceIds ?? []).map(evidenceLabel).filter(Boolean).join('; '),
          impact: clean(item.impact),
          decision: clean(item.decision),
          metric: clean(item.metricText || (item.metricIds ?? []).map(metricLabel).join(', ')),
          risk: clean(item.riskText),
          alternatives: (item.alternatives ?? []).map((alt) => clean(alt.title)).filter(Boolean).join(' / '),
        });
      });
    }
  } else if (section.key === 'conclusions') {
    if (clean(section.text)) blocks.push({ type: 'paragraph', text: clean(section.text) });
    const extra = section.entry || {};
    if (config.includeLimitations) {
      const labels = (extra.limitations ?? [])
        .map((id) => limitationOptions.find((item) => item.id === id)?.label || clean(id))
        .filter(Boolean);
      if (labels.length) {
        blocks.push({ type: 'heading', text: 'Limitaciones del análisis' });
        blocks.push({ type: 'list', items: labels });
      }
    }
    if (academic && extra.selectedStrengths?.length) {
      const labels = extra.selectedStrengths
        .map((id) => strengthOptions.find((item) => item.id === id)?.label || '')
        .filter(Boolean);
      if (labels.length) {
        blocks.push({ type: 'heading', text: 'Fortalezas consideradas' });
        blocks.push({ type: 'list', items: labels });
      }
    }
  } else if (clean(section.text)) {
    blocks.push({ type: 'paragraph', text: clean(section.text) });
  }

  if (academic && config.includeTraceability && section.sources?.length) {
    const evidence = (section.evidences ?? [])
      .map((item) => evidenceLabel(item) || (/^ev-/i.test(String(item)) ? '' : clean(item)))
      .filter(Boolean)
      .join('; ');
    blocks.push({
      type: 'trace',
      source: section.sources.map(clean).filter(Boolean).join(', '),
      evidence,
      process: 'Construido en InfraGuide a partir de evidencia del caso.',
      result: '',
      interpretation: '',
    });
  }

  return { id: section.id, key: section.key, title: `${section.id}. ${section.title}`, blocks };
}

function tableBlock(headers, rows) {
  return { type: 'table', headers, rows: rows.map((row) => row.map((cell) => clean(cell) || '—')) };
}

function asisBlock(section, state) {
  const fallback = Object.entries(state.analysis?.represent?.asIs?.chains ?? {}).map(([id, nodeIds]) => ({
    serviceId: id,
    nodeIds,
  }));
  const chains = (section.chains?.length ? section.chains : fallback).map((chain) => ({
    nodes: (chain.nodeIds ?? []).map((id) => ({ name: nodeName(id) })).filter((node) => node.name),
  }));
  return { type: 'asis', chains };
}

function metricsBlocks(section, state, config, academic) {
  const sub = section.subsections || {};
  const measure = state.analysis?.measure ?? {};
  return metricSubsections
    .filter((meta) => sub[meta.id] || measure[meta.id]?.result != null)
    .map((meta) => {
      const entry = sub[meta.id] || {};
      const slot = measure[meta.id] || {};
      const result = clean(entry.result) || (slot.result != null ? String(slot.result) : '');
      const showFormulas = config.includeFormulas !== false;
      return {
        type: 'metric',
        number: meta.number,
        title: meta.title,
        data: showFormulas ? clean(entry.data) : '',
        formula: showFormulas ? clean(entry.formula) : '',
        calculation: showFormulas ? clean(entry.substitution) : '',
        result,
        interpretation: clean(entry.interpretation || entry.text || slot.draft),
        limitation: config.includeLimitations ? clean(entry.limitation || slot.limitation) : '',
        source: academic && config.includeTraceability ? clean((entry.sources || []).join(', ') || 'Información operacional disponible') : '',
      };
    });
}

export function modelHasTechnicalIds(model) {
  const blob = JSON.stringify({ cover: model.cover, sections: model.sections });
  return /\bfinding-\d|\bdec-\d|\bev-[a-z]|component-id/i.test(blob);
}

import {
  AlignmentType,
  BorderStyle,
  Document,
  Footer,
  Header,
  HeadingLevel,
  Packer,
  PageBreak,
  PageNumber,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import { asisFlowText } from './asisSvg.js';
import { exportBaseName } from './text.js';

const NAVY = '0B3A6A';
const MID = '1F6AA5';
const MUTED = '5B6B7C';
const HEADER_FILL = 'D6E6F5';
const BODY = '152033';
const FONT = 'Calibri';
const CONSULTING_BREAK_BEFORE = new Set(['findings', 'program', 'annexEvidence']);

function run(text, extra = {}) {
  return new TextRun({
    text: String(text ?? ''),
    font: FONT,
    size: extra.size ?? 21,
    bold: extra.bold,
    color: extra.color || BODY,
    italics: extra.italics,
  });
}

function para(text, extra = {}) {
  return new Paragraph({
    spacing: { after: extra.after ?? 140, before: extra.before ?? 0 },
    alignment: extra.align,
    heading: extra.heading,
    pageBreakBefore: extra.pageBreakBefore,
    border: extra.border,
    children: extra.children || [run(text, extra)],
  });
}

function cell(text, { header = false, width = 20 } = {}) {
  return new TableCell({
    width: { size: width, type: WidthType.PERCENTAGE },
    shading: header ? { type: ShadingType.CLEAR, fill: HEADER_FILL } : undefined,
    margins: { top: 60, bottom: 60, left: 80, right: 80 },
    children: [
      new Paragraph({
        children: [run(text || '—', { bold: header, color: header ? NAVY : BODY, size: 18 })],
      }),
    ],
  });
}

function tableFrom(headers, rows) {
  const width = Math.max(8, Math.floor(100 / Math.max(headers.length, 1)));
  const head = new TableRow({
    tableHeader: true,
    cantSplit: true,
    children: headers.map((item) => cell(item, { header: true, width })),
  });
  const body = (rows.length ? rows : [headers.map(() => 'Sin filas documentadas.')]).map(
    (row) =>
      new TableRow({
        cantSplit: true,
        children: row.map((item) => cell(String(item ?? '—'), { width })),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [head, ...body],
  });
}

function coverChildren(cover) {
  const meta = [
    ['Caso', cover.caseName],
    ['Destinatario', cover.recipient],
    ['Objeto de la evaluación', cover.object],
    ['Fecha de corte', cover.cutoffDate],
    ['Horizonte de análisis', cover.horizon],
    ['Clasificación', cover.classification],
  ].filter(([, value]) => value);
  return [
    para(cover.kicker || 'INFRAESTRUCTURA TI', { color: NAVY, bold: true, size: 20, after: 200, before: 400 }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      spacing: { after: 280 },
      children: [run(cover.title, { color: NAVY, bold: true, size: 36 })],
    }),
    ...meta.map(([label, value]) => para(`${label}: ${value}`, { after: 80 })),
    para(`Generado desde InfraGuide · ${cover.generatedLabel} · ${cover.documentVersion}`, { color: MID, after: 280, before: 200 }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function findingChildren(finding) {
  const evidence = (finding.evidence ?? [])
    .map((item) => {
      const fact = [item.label, item.value].filter(Boolean).join(': ');
      const citation = item.citation || '';
      return [fact, citation].filter(Boolean).join('. ');
    })
    .join('; ');
  const rows = [
    ['Severidad', finding.severity],
    ['Estado de evidencia', finding.evidenceState],
    ['Tipo de afirmación', finding.kind],
    ['Condición técnica', finding.condition],
    ['Evidencia', evidence || 'Sin evidencia asociada. PENDIENTE DE VERIFICACIÓN.'],
    ['Página del documento fuente', (finding.pages ?? []).join(', ') || '—'],
    ['Implicación técnica', finding.implication],
    ['Impacto para el negocio', finding.businessImpact],
    ['Causa o deficiencia de control', finding.cause],
    ['Riesgo asociado', finding.riskId],
    ['Tratamiento recomendado', finding.treatment || 'Tratamiento pendiente de documentar'],
    ['Prioridad', finding.priority],
    ['Responsable sugerido', finding.owner],
    ['Plazo', finding.deadline],
    ['Criterio de aceptación', finding.acceptance],
    ['Estado de cierre', finding.closure],
  ];
  return [
    para(`${finding.id} | ${finding.title}`, { color: NAVY, bold: true, size: 24, before: 160, after: 80 }),
    tableFrom(['Campo', 'Contenido'], rows),
    para('', { after: 120 }),
  ];
}

function blocksToChildren(blocks) {
  const children = [];
  (blocks ?? []).forEach((block) => {
    if (block.type === 'paragraph') {
      String(block.text || '')
        .split(/\n\s*\n/)
        .filter(Boolean)
        .forEach((part) => children.push(para(part, { after: 160 })));
    } else if (block.type === 'heading') {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 140, after: 80 },
          children: [run(block.text, { color: MID, bold: true, size: 24 })],
        }),
      );
    } else if (block.type === 'list') {
      (block.items ?? []).forEach((item) => children.push(para(`• ${item}`, { after: 60 })));
    } else if (block.type === 'table') {
      children.push(tableFrom(block.headers, block.rows));
      children.push(para('', { after: 120 }));
    } else if (block.type === 'asis') {
      (block.chains ?? []).forEach((chain) => {
        const flow = asisFlowText(chain);
        children.push(para(flow || 'Sin cadena documentada.', { color: NAVY, bold: true }));
        const names = (chain.nodes ?? []).map((node) => node.name).filter(Boolean);
        if (names.length) {
          children.push(tableFrom(names.map((_, i) => `Nodo ${i + 1}`), [names]));
        }
      });
    } else if (block.type === 'metric') {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 160, after: 80 },
          children: [run(block.title, { color: MID, bold: true, size: 24 })],
        }),
      );
      if (block.kind) children.push(para(`Tipo: ${block.kind}`, { italics: true, color: MID }));
      if (block.data) children.push(para(`Datos fuente: ${block.data}`));
      if (block.formula) children.push(para(`Fórmula: ${block.formula}`));
      if (block.calculation) children.push(para(`Cálculo: ${block.calculation}`));
      children.push(para(`Resultado: ${block.result || '—'}`, { bold: true }));
      if (block.interpretation) children.push(para(`Interpretación: ${block.interpretation}`));
      if (block.limitation) children.push(para(`Limitación: ${block.limitation}`));
      if (block.decision) children.push(para(`Decisión derivada: ${block.decision}`));
      if (block.source) children.push(para(`Fuente: ${block.source}`));
      if (block.calculatedNote) children.push(para(block.calculatedNote, { italics: true }));
    } else if (block.type === 'finding') {
      children.push(...findingChildren(block.finding || {}));
    } else if (block.type === 'callout') {
      children.push(para(block.text, { italics: true, color: NAVY, after: 160 }));
    } else if (block.type === 'trace') {
      if (block.source) children.push(para(`Fuente: ${block.source}`));
      if (block.evidence) children.push(para(`Evidencia: ${block.evidence}`));
    } else if (block.type === 'recTrace') {
      children.push(para(`Recomendación: ${block.recommendation}`, { bold: true }));
      if (block.finding) children.push(para(`Hallazgo: ${block.finding}`));
    }
  });
  return children;
}

export function createDocxDocument(model) {
  const children = [];
  if (model.config?.includeCover !== false) {
    children.push(...coverChildren(model.cover));
  }
  if (model.config?.includeIndex !== false) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 160 },
        children: [run('Índice', { color: NAVY, bold: true, size: 32 })],
      }),
    );
    (model.index ?? []).forEach((item) => children.push(para(item.title, { after: 60 })));
  }
  (model.sections ?? []).forEach((section) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: CONSULTING_BREAK_BEFORE.has(section.key),
        spacing: { before: 200, after: 140 },
        children: [run(section.title, { color: NAVY, bold: true, size: 32 })],
      }),
    );
    children.push(...blocksToChildren(section.blocks));
    if (section.key === 'dictamen') {
      children.push(new Paragraph({ children: [new PageBreak()] }));
    }
  });

  return new Document({
    creator: 'InfraGuide',
    title: `${model.cover.caseName} — Informe técnico de consultoría`,
    description: 'Informe técnico de consultoría de infraestructura TI. No incluye datos personales.',
    styles: {
      default: {
        document: {
          run: { font: FONT, size: 21, color: BODY },
        },
      },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: 11906, height: 16838 },
            margin: { top: 1134, right: 1134, bottom: 1330, left: 1134 },
          },
        },
        headers: {
          default: new Header({
            children: [
              new Paragraph({
                border: {
                  bottom: { color: 'C5D4E3', space: 6, style: BorderStyle.SINGLE, size: 6 },
                },
                spacing: { after: 120 },
                children: [
                  run('InfraGuide · Informe técnico de consultoría', { size: 16, color: MUTED }),
                ],
              }),
            ],
          }),
        },
        footers: {
          default: new Footer({
            children: [
              new Paragraph({
                alignment: AlignmentType.RIGHT,
                children: [
                  new TextRun({
                    font: FONT,
                    size: 16,
                    color: MUTED,
                    children: ['Página ', PageNumber.CURRENT],
                  }),
                ],
              }),
            ],
          }),
        },
        children,
      },
    ],
  });
}

export async function packDocx(model) {
  const doc = createDocxDocument(model);
  if (typeof Packer.toBlob === 'function') {
    try {
      return await Packer.toBlob(doc);
    } catch {
      const buffer = await Packer.toBuffer(doc);
      return buffer;
    }
  }
  return Packer.toBuffer(doc);
}

export function docxFileName(model) {
  return `${exportBaseName(model.cover.caseName)}.docx`;
}

export const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';

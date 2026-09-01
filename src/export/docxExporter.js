import {
  AlignmentType,
  Document,
  HeadingLevel,
  Packer,
  PageBreak,
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
const HEADER_FILL = 'D6E6F5';
const BODY = '152033';
const FONT = 'Calibri';
const PAGE_BREAK_KEYS = new Set(['asis', 'metrics', 'findings', 'itil', 'cobit', 'iso27001', 'recommendations', 'conclusions']);

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
    spacing: { after: extra.after ?? 160, before: extra.before ?? 0 },
    alignment: extra.align,
    heading: extra.heading,
    pageBreakBefore: extra.pageBreakBefore,
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
        children: [run(text || '—', { bold: header, color: header ? NAVY : BODY, size: 20 })],
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
        children: row.map((item) => cell(item, { width })),
      }),
  );
  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    rows: [head, ...body],
  });
}

function coverChildren(cover) {
  return [
    para(cover.kicker, { color: NAVY, bold: true, size: 22, align: AlignmentType.CENTER, after: 200, before: 600 }),
    new Paragraph({
      heading: HeadingLevel.TITLE,
      alignment: AlignmentType.CENTER,
      spacing: { after: 240 },
      children: [run(cover.title, { color: NAVY, bold: true, size: 40 })],
    }),
    para(`Caso: ${cover.caseName}`, { align: AlignmentType.CENTER, size: 28, color: NAVY, bold: true }),
    para(`Sector: ${cover.sector}`, { align: AlignmentType.CENTER }),
    para('Generado desde InfraGuide', { align: AlignmentType.CENTER, color: MID }),
    para(`${cover.generatedLabel} · ${cover.documentVersion} · ${cover.modeLabel}`, { align: AlignmentType.CENTER, after: 400 }),
    new Paragraph({ children: [new PageBreak()] }),
  ];
}

function blocksToChildren(blocks) {
  const children = [];
  blocks.forEach((block) => {
    if (block.type === 'paragraph') {
      String(block.text || '')
        .split(/\n\s*\n/)
        .filter(Boolean)
        .forEach((part) => children.push(para(part, { after: 200 })));
    } else if (block.type === 'heading') {
      children.push(
        new Paragraph({
          heading: HeadingLevel.HEADING_2,
          spacing: { before: 160, after: 80 },
          children: [run(block.text, { color: MID, bold: true, size: 24 })],
        }),
      );
    } else if (block.type === 'list') {
      block.items.forEach((item) => children.push(para(`• ${item}`, { after: 80 })));
    } else if (block.type === 'table') {
      children.push(tableFrom(block.headers, block.rows));
      children.push(para('', { after: 160 }));
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
          spacing: { before: 200, after: 80 },
          children: [run(`${block.number} ${block.title}`, { color: MID, bold: true, size: 24 })],
        }),
      );
      if (block.data) children.push(para(`Datos: ${block.data}`));
      if (block.formula) children.push(para(`Fórmula: ${block.formula}`));
      if (block.calculation) children.push(para(`Cálculo: ${block.calculation}`));
      children.push(para(`Resultado: ${block.result || '—'}`, { bold: true }));
      if (block.interpretation) children.push(para(`Interpretación: ${block.interpretation}`));
      if (block.limitation) children.push(para(`Limitación: ${block.limitation}`));
      if (block.source) children.push(para(`Fuente: ${block.source}`));
    } else if (block.type === 'trace') {
      if (block.source) children.push(para(`Fuente: ${block.source}`));
      if (block.evidence) children.push(para(`Evidencia: ${block.evidence}`));
      if (block.process) children.push(para(`Procesamiento: ${block.process}`));
      if (block.result) children.push(para(`Resultado: ${block.result}`));
      if (block.interpretation) children.push(para(`Interpretación: ${block.interpretation}`));
    } else if (block.type === 'recTrace') {
      children.push(para(`Recomendación: ${block.recommendation}`, { bold: true }));
      if (block.finding) children.push(para(`Hallazgo origen: ${block.finding}`));
      if (block.evidence) children.push(para(`Evidencia: ${block.evidence}`));
      if (block.impact) children.push(para(`Impacto: ${block.impact}`));
      if (block.decision) children.push(para(`Decisión: ${block.decision}`));
      if (block.metric) children.push(para(`Métrica: ${block.metric}`));
    }
  });
  return children;
}

export function createDocxDocument(model) {
  const children = [];
  if (model.config.includeCover !== false) {
    children.push(...coverChildren(model.cover));
  }
  if (model.config.includeIndex !== false) {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        spacing: { after: 200 },
        children: [run('Índice', { color: NAVY, bold: true, size: 32 })],
      }),
    );
    model.index.forEach((item) => children.push(para(item.title, { after: 80 })));
  }
  model.sections.forEach((section) => {
    children.push(
      new Paragraph({
        heading: HeadingLevel.HEADING_1,
        pageBreakBefore: PAGE_BREAK_KEYS.has(section.key),
        spacing: { before: 240, after: 160 },
        children: [run(section.title, { color: NAVY, bold: true, size: 32 })],
      }),
    );
    children.push(...blocksToChildren(section.blocks));
  });
  children.push(
    para(`${model.cover.app} ${model.cover.appVersion} · ${model.cover.documentVersion} · ${model.cover.generatedLabel}`, {
      color: MID,
      size: 18,
      before: 400,
    }),
  );

  return new Document({
    creator: 'InfraGuide',
    title: `${model.cover.caseName} — Análisis de infraestructura`,
    description: 'Documento técnico generado localmente. No incluye datos personales.',
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
            margin: { top: 1134, right: 1134, bottom: 1134, left: 1134 },
          },
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

import { escapeHtml } from '../utils/escape.js';

const BOX_W = 148;
const BOX_H = 48;
const GAP_X = 36;
const GAP_Y = 28;
const PAD = 16;

export function asisSvgMarkup(chains = []) {
  const safe = (chains.length ? chains : [{ nodes: [] }]).map((chain) => ({
    nodes: (chain.nodes ?? []).filter((node) => node?.name),
  }));
  const maxNodes = Math.max(1, ...safe.map((chain) => chain.nodes.length || 1));
  const width = PAD * 2 + maxNodes * BOX_W + (maxNodes - 1) * GAP_X;
  const height = PAD * 2 + safe.length * BOX_H + Math.max(0, safe.length - 1) * (GAP_Y + 8);
  const parts = safe.map((chain, row) => {
    const y = PAD + row * (BOX_H + GAP_Y + 8);
    const nodes = chain.nodes.length
      ? chain.nodes
      : [{ name: 'Cadena AS-IS no documentada' }];
    return nodes
      .map((node, index) => {
        const x = PAD + index * (BOX_W + GAP_X);
        const box = `<g>
          <rect x="${x}" y="${y}" width="${BOX_W}" height="${BOX_H}" rx="6" fill="#ffffff" stroke="#0B3A6A" stroke-width="1.4"/>
          <text x="${x + BOX_W / 2}" y="${y + BOX_H / 2 + 4}" text-anchor="middle" font-family="Calibri, Arial, sans-serif" font-size="12" fill="#0B3A6A">${escapeHtml(node.name)}</text>
        </g>`;
        const arrow =
          index < nodes.length - 1
            ? `<line x1="${x + BOX_W}" y1="${y + BOX_H / 2}" x2="${x + BOX_W + GAP_X}" y2="${y + BOX_H / 2}" stroke="#1F6AA5" stroke-width="1.6" marker-end="url(#ig-arrow)"/>`
            : '';
        return box + arrow;
      })
      .join('');
  });

  return `<svg class="ig-asis-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" role="img" aria-label="Diagrama AS-IS">${parts.join('')}<defs><marker id="ig-arrow" markerWidth="8" markerHeight="8" refX="6" refY="3" orient="auto"><path d="M0,0 L6,3 L0,6 Z" fill="#1F6AA5"/></marker></defs></svg>`;
}

export function asisFlowText(chain) {
  return (chain.nodes ?? []).map((node) => node.name).filter(Boolean).join(' → ');
}

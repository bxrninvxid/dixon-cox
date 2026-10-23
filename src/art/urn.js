// The urn renderer: design object in, standalone SVG string out. No DOM needed.
import { _ } from '../lib/i18n.js';
import { SKINS, SKIN_IDS, RARITY } from './skins.js';
import { SHAPES, SHAPE_IDS } from './shapes.js';
import { SYMBOLS, SYMBOL_IDS } from './icons.js';
import { qrPath } from '../lib/qr.js';
import { makeRng, hashStr, n1 } from './rng.js';

export const LEDS = {
  cyan: { name: _('Cyan'), hex: '#19e6ff' }, magenta: { name: _('Magenta'), hex: '#ff3d9a' }, amber: { name: _('Amber'), hex: '#ffb62e' },
  lime: { name: _('Lime'), hex: '#6dff7a' }, violet: { name: _('Violet'), hex: '#9a7bff' }, white: { name: _('White'), hex: '#ffffff' },
  rainbow: { name: _('Rainbow'), hex: '#ff7ad9', rainbow: true },
};
export const FONTS = {
  loud: { label: _('Loud'), family: 'Erica One', weight: 400, k: 0.6, upper: true, file: 'erica-one.woff' },
  classic: { label: _('Classic'), family: 'Lora', weight: 700, k: 0.56, upper: false, file: 'lora-bold.woff' },
  deco: { label: _('Deco'), family: 'Poiret One', weight: 400, k: 0.52, upper: true, file: 'poiret-one.woff' },
  hand: { label: _('Handwritten'), family: 'Nothing You Could Do', weight: 400, k: 0.42, upper: false, file: 'nothing-you-could-do.woff' },
  tech: { label: _('Tech'), family: 'Tektur', weight: 500, k: 0.58, upper: true, file: 'tektur-medium.woff' },
};
export const FINISHES = { gloss: { name: _('Gloss'), v: 1 }, matte: { name: _('Matte'), v: 0.35 } };
export const ENGRAVE_MODES = { plaque: _('Metal plaque'), etch: _('Etched on skin'), none: _('None') };

const METALS = {
  gold: ['#6b4500', '#f9e58f', '#c99a1c', '#fff6c4', '#a17408', '#6b4600'],
  silver: ['#555d69', '#f3f6fb', '#a9b1be', '#ffffff', '#7b8491', '#4d5561'],
  black: ['#0f0f16', '#4d4d60', '#1f1f29', '#707086', '#17171f', '#0c0c12'],
  rose: ['#783838', '#ffd6c8', '#d98b80', '#fff2ec', '#9a5148', '#6d322f'],
};
const PLAQUE_INK = { gold: '#4b3300', silver: '#27303f', black: '#e8e2ff', rose: '#4a2420' };
const STOPS = [0, 0.18, 0.42, 0.6, 0.82, 1];

export const DEFAULT_DESIGN = Object.freeze({
  shape: 'amphora', skin: 'koi', seed: 1, text: '', line2: '', font: 'loud', symbol: 'star', engrave: 'plaque',
  led: 'cyan', finish: 'gloss', qr: true, speaker: false, art: null,
});
export function normalizeDesign(d = {}) {
  const o = { ...DEFAULT_DESIGN, ...d };
  if (!SHAPES[o.shape]) o.shape = DEFAULT_DESIGN.shape;
  if (!SKINS[o.skin]) o.skin = DEFAULT_DESIGN.skin;
  if (!FONTS[o.font]) o.font = DEFAULT_DESIGN.font;
  if (!LEDS[o.led]) o.led = DEFAULT_DESIGN.led;
  if (!SYMBOLS[o.symbol]) o.symbol = 'none';
  if (!FINISHES[o.finish]) o.finish = 'gloss';
  if (!ENGRAVE_MODES[o.engrave]) o.engrave = 'plaque';
  o.seed = Number.isFinite(+o.seed) ? Math.abs(Math.trunc(+o.seed)) % 100000 : 1;
  o.text = String(o.text || '').slice(0, 28);
  o.line2 = String(o.line2 || '').slice(0, 24);
  return o;
}

// Weighted "gacha" roll: rarer skins drop less often.
export function rollDesign(rand = Math.random, base = {}) {
  const w = [55, 28, 12, 5];
  let x = rand() * 100, tier = 0;
  for (; tier < 3 && x >= w[tier]; tier++) x -= w[tier];
  const pool = SKIN_IDS.filter((id) => SKINS[id].rarity === tier);
  const pick = (a) => a[Math.floor(rand() * a.length)];
  return normalizeDesign({ ...base, shape: pick(SHAPE_IDS), skin: pick(pool), seed: Math.floor(rand() * 99999) + 1, led: pick(Object.keys(LEDS)), symbol: base.symbol && base.symbol !== 'none' ? base.symbol : pick(SYMBOL_IDS.filter((s) => s !== 'none')) });
}

let counter = 0;
const qrCache = new Map();
const cachedQr = (url) => { if (!qrCache.has(url)) qrCache.set(url, qrPath(url)); return qrCache.get(url); };
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function fitText(text, font, maxW, base, min) {
  const est = text.length * font.k;
  let fs = Math.min(base, maxW / Math.max(est, 0.1));
  const squeeze = fs < min;
  fs = Math.max(fs, min);
  return { fs: n1(fs), squeeze };
}

function textEl(x, y, text, font, fs, fill, squeeze, maxW, extra = '') {
  return `<text x="${n1(x)}" y="${n1(y)}" text-anchor="middle" font-family="'${font.family}', Georgia, serif" font-weight="${font.weight}" font-size="${fs}" fill="${fill}" ${squeeze ? `textLength="${n1(maxW)}" lengthAdjust="spacingAndGlyphs"` : ''} ${extra}>${esc(text)}</text>`;
}

function engraving(c, a) {
  const d = c.d;
  if (d.engrave === 'none') return '';
  const font = FONTS[d.font], plaque = d.engrave === 'plaque';
  const main = font.upper ? d.text.trim().toUpperCase() : d.text.trim();
  const sub = d.line2.trim();
  const sym = SYMBOLS[d.symbol] && SYMBOLS[d.symbol].svg ? d.symbol : null;
  if (!main && !sub && !sym) return '';
  const ink = plaque ? PLAQUE_INK[c.skin.metal] : c.skin.etch;
  const { cx, cy, w, h } = a, pad = 10, maxW = w - pad * 2;
  let o = '';
  if (plaque) {
    o += `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="9" fill="${c.M}"/><rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="9" fill="url(#${c.id}mo)" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/>
<rect x="${cx - w / 2 + 3.5}" y="${cy - h / 2 + 3.5}" width="${w - 7}" height="${h - 7}" rx="6.5" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1"/><rect x="${cx - w / 2 + 4.5}" y="${cy - h / 2 + 4.5}" width="${w - 9}" height="${h - 9}" rx="6" fill="none" stroke="#fff" stroke-opacity=".4" stroke-width="1"/>`;
    for (const [rx, ry] of [[-1, -1], [1, -1], [-1, 1], [1, 1]]) o += `<circle cx="${cx + rx * (w / 2 - 8)}" cy="${cy + ry * (h / 2 - 8)}" r="1.9" fill="#000" fill-opacity=".45"/><circle cx="${cx + rx * (w / 2 - 8) - .5}" cy="${cy + ry * (h / 2 - 8) - .5}" r=".9" fill="#fff" fill-opacity=".6"/>`;
  }
  if (!plaque) {
    const hex = ink.replace('#', ''), lum = (parseInt(hex.slice(0, 2), 16) * 299 + parseInt(hex.slice(2, 4), 16) * 587 + parseInt(hex.slice(4, 6), 16) * 114) / 1000;
    o += `<rect x="${cx - w / 2 + 4}" y="${cy - h / 2 + 6}" width="${w - 8}" height="${h - 12}" rx="14" fill="${lum > 140 ? '#10061d' : '#ffffff'}" opacity=".34" filter="url(#${c.id}b)"/>`;
  }
  // stack: symbol, main, sub
  const innerH = h - pad * 1.4;
  const symH = sym ? Math.min(innerH * (main || sub ? 0.34 : 0.8), 24) : 0;
  const subFs = sub ? Math.min(innerH * 0.2, 13) : 0;
  const gap = 3;
  const mainBase = main ? Math.min(innerH - symH - subFs - gap * 2, 30) : 0;
  const m = main ? fitText(main, font, maxW, mainBase, 11) : null;
  const subFit = sub ? fitText(sub, FONTS.classic, maxW, subFs, 8) : null;
  const total = symH + (symH ? gap : 0) + (m ? m.fs * 0.82 : 0) + (sub ? gap + subFit.fs * 0.9 : 0);
  let y = cy - total / 2;
  const hi = plaque ? '#fff' : '#fff', lo = '#000';
  const emboss = (draw) => `<g opacity="${plaque ? 0.7 : 0.5}" transform="translate(.9 1)" style="color:${hi}">${draw(hi)}</g><g opacity="${plaque ? 0.55 : 0.55}" transform="translate(-.7 -.8)" style="color:${lo}">${draw(lo)}</g><g opacity="${plaque ? 1 : 0.92}" style="color:${ink}">${draw(ink)}</g>`;
  if (sym) {
    const sz = n1(symH);
    const draw = () => `<g transform="translate(${n1(cx - sz / 2)} ${n1(y)}) scale(${n1(sz / 24)})">${SYMBOLS[sym].svg}</g>`;
    o += emboss(draw);
    y += symH + gap;
  }
  if (m) {
    const by = y + m.fs * 0.74;
    o += emboss((col) => textEl(cx, by, main, font, m.fs, col, m.squeeze, maxW));
    y += m.fs * 0.82 + gap;
  }
  if (sub) {
    const by = y + subFit.fs * 0.8;
    o += emboss((col) => textEl(cx, by, sub, FONTS.classic, subFit.fs, col, subFit.squeeze, maxW));
  }
  return `<g class="dc-engrave">${o}</g>`;
}

function qrTile(c, spec) {
  const { d, size } = cachedQr(c.d.qrUrl || 'https://dixoncox.example/m/demo');
  const pad = 1.6, total = size + pad * 2, k = spec.s / total, x = spec.cx - spec.s / 2, y = spec.cy - spec.s / 2;
  return `<g transform="translate(${n1(x)} ${n1(y)})"><rect width="${spec.s}" height="${spec.s}" rx="4" fill="#fff" stroke="#000" stroke-opacity=".3" stroke-width="1"/><path d="${d}" transform="translate(${n1(pad * k * 100) / 100} ${n1(pad * k * 100) / 100}) scale(${Math.round(k * 1000) / 1000})" fill="#14101f"/></g>`;
}

function speakerChip(c, p) {
  let dots = '';
  for (let r = 0; r < 3; r++) for (let q = 0; q < 6; q++) dots += `<circle cx="${p.cx - 12.5 + q * 5}" cy="${p.cy - 5 + r * 5}" r="1.5" fill="#000" fill-opacity=".6"/>`;
  return `<rect x="${p.cx - 19}" y="${p.cy - 11}" width="38" height="22" rx="7" fill="${c.M}"/><rect x="${p.cx - 19}" y="${p.cy - 11}" width="38" height="22" rx="7" fill="url(#${c.id}mo)" stroke="#000" stroke-opacity=".4"/>${dots}`;
}

export function renderUrn(design, opts = {}) {
  const d = normalizeDesign(design);
  const skin = SKINS[d.skin], shape = SHAPES[d.shape];
  const id = opts.id || `u${++counter}`;
  const rng = makeRng(hashStr(d.skin) ^ Math.imul(d.seed, 2654435761));
  const led = LEDS[d.led];
  const mk = skin.metal, stops = METALS[mk];
  const c = {
    id, d, skin, rng, M: `url(#${id}m)`, gloss: FINISHES[d.finish].v, accent: skin.accent,
    led: led.rainbow ? `url(#${id}rb)` : led.hex, ledHex: led.rainbow ? '#ff7ad9' : led.hex,
  };
  const S = shape.build(c);
  const art = d.art
    ? `<image href="${d.art}" x="0" y="0" width="400" height="560" preserveAspectRatio="xMidYMid slice"/>`
    : skin.art({ id, rng, W: 400, H: 560 });
  const metalGrad = `<linearGradient id="${id}m" x1="0" y1="0" x2="1" y2="0">${stops.map((s, i) => `<stop offset="${STOPS[i]}" stop-color="${s}"/>`).join('')}</linearGradient>
<linearGradient id="${id}mo" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity=".5"/><stop offset=".35" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>`;
  const ledDefs = `<radialGradient id="${id}gl"><stop offset="0" stop-color="${c.ledHex}" stop-opacity=".75"/><stop offset="1" stop-color="${c.ledHex}" stop-opacity="0"/></radialGradient>` +
    (led.rainbow ? `<linearGradient id="${id}rb" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#ff4d5a"/><stop offset=".2" stop-color="#ffc72c"/><stop offset=".4" stop-color="#4be3a5"/><stop offset=".6" stop-color="#3bb6ff"/><stop offset=".8" stop-color="#8a5cff"/><stop offset="1" stop-color="#ff4d5a"/></linearGradient>` : '');
  const defs = `<defs>${metalGrad}${ledDefs}<radialGradient id="${id}sh"><stop offset="0" stop-color="#14091f" stop-opacity=".55"/><stop offset="1" stop-color="#14091f" stop-opacity="0"/></radialGradient>
<filter id="${id}b" x="-30%" y="-30%" width="160%" height="160%"><feGaussianBlur stdDeviation="3"/></filter><filter id="${id}b2" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="16"/></filter>
${S.defs}<clipPath id="${id}c">${S.clip}</clipPath></defs>`;

  const f = S.floor;
  let floor = `<ellipse cx="${f.cx}" cy="${f.cy + 2}" rx="${f.rx}" ry="${n1(f.rx * 0.12)}" fill="url(#${id}sh)"/>`;
  floor += `<ellipse class="dc-led" cx="${f.cx}" cy="${f.cy}" rx="${n1(f.rx * 1.25)}" ry="${n1(f.rx * 0.22)}" fill="url(#${id}gl)"/>`;
  let ledBar = '';
  if (S.ledBar) {
    const b = S.ledBar;
    ledBar = `<rect class="dc-led" x="${b.x}" y="${b.y}" width="${b.w}" height="5" rx="2.5" fill="${c.led}" filter="url(#${id}b)"/><rect x="${b.x + 2}" y="${b.y + 1}" width="${b.w - 4}" height="3" rx="1.5" fill="${c.led}"/><rect x="${b.x + 6}" y="${b.y + 1.4}" width="${b.w - 12}" height="1" rx=".5" fill="#fff" fill-opacity=".7"/>`;
  }
  const sp = d.speaker && S.speaker ? speakerChip(c, S.speaker) : '';
  const qr = d.qr ? qrTile(c, S.qr) : '';
  const eng = engraving(c, S.plaque);
  const cls = ['dc-urn', opts.animate ? 'dc-anim' : ''].filter(Boolean).join(' ');
  const label = opts.label || `${shape.name} · ${skin.name}`;
  return `<svg class="${cls}" viewBox="0 0 400 560" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="${esc(label)}" ${opts.size ? `width="${opts.size}" height="${Math.round(opts.size * 1.4)}"` : ''}>${defs}${floor}${S.behind}<g clip-path="url(#${id}c)">${art}${S.shade}</g>${S.front}${ledBar}${sp}${qr}${eng}</svg>`;
}

export { SKINS, SKIN_IDS, SHAPES, SHAPE_IDS, SYMBOLS, SYMBOL_IDS, RARITY };

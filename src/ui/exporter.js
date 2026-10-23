// Download the urn as SVG or PNG. Fonts are embedded so the engraving looks right everywhere.
import { renderUrn, normalizeDesign, FONTS } from '../art/urn.js';
import { slug } from '../lib/format.js';

async function fontData(file) {
  const inlined = (typeof window !== 'undefined' && window.__DX_FONTS) || {};
  const src = inlined[file] || new URL('fonts/' + file, document.baseURI).href;
  const buf = await (await fetch(src)).arrayBuffer();
  let bin = ''; const u8 = new Uint8Array(buf);
  for (let i = 0; i < u8.length; i += 0x8000) bin += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000));
  return btoa(bin);
}
async function fontStyle(design) {
  const d = normalizeDesign(design), used = new Map([[d.font, FONTS[d.font]], ['classic', FONTS.classic]]);
  let css = '';
  for (const f of used.values()) {
    try { css += `@font-face{font-family:'${f.family}';font-weight:${f.weight};src:url(data:font/woff;base64,${await fontData(f.file)}) format('woff');}`; } catch (e) { /* fall back to system serif */ }
  }
  return css;
}
export async function standaloneSvg(design, px = 800) {
  const svg = renderUrn(design, { id: 'ex', size: px });
  const css = await fontStyle(design);
  return svg.replace('>', `><style>${css}</style>`).replace('<svg ', '<svg xmlns:xlink="http://www.w3.org/1999/xlink" ');
}
function download(blob, name) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob); a.download = name; document.body.appendChild(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(a.href), 4000);
}
const fileName = (d, ext) => `dixon-cox-${slug(d.text || d.skin) || 'urn'}.${ext}`;
export async function exportSvg(design) {
  const d = normalizeDesign(design);
  download(new Blob([await standaloneSvg(d)], { type: 'image/svg+xml' }), fileName(d, 'svg'));
}
export async function exportPng(design, scale = 2) {
  const d = normalizeDesign(design), w = 400 * scale, h = 560 * scale;
  const svg = (await standaloneSvg(d, w)).replace(/width="\d+" height="\d+"/, `width="${w}" height="${h}"`);
  const img = new Image();
  await new Promise((res, rej) => { img.onload = res; img.onerror = rej; img.src = 'data:image/svg+xml;charset=utf-8,' + encodeURIComponent(svg); });
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  c.getContext('2d').drawImage(img, 0, 0, w, h);
  const blob = await new Promise((r) => c.toBlob(r, 'image/png'));
  download(blob, fileName(d, 'png'));
}

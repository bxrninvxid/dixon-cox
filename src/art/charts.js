// Hand-rolled SVG charts. Fixed categorical order, thin marks, direct labels, hover tips via data-tip.
export const SERIES = ['#6a3df0', '#ff4d5a', '#14a37f', '#e0a100', '#2a8fd6', '#d6429b']; // validated: scripts/validate_palette
const INK = '#1a1033', MUTED = '#6b5f8c', GRID = '#ddd4f5';
const f = (v) => Math.round(v * 10) / 10;
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const txt = (x, y, s, o = {}) => `<text x="${f(x)}" y="${f(y)}" text-anchor="${o.anchor || 'start'}" font-family="Inter, sans-serif" font-size="${o.size || 12}" font-weight="${o.weight || 500}" fill="${o.fill || MUTED}">${esc(s)}</text>`;

export function areaChart(days, { w = 640, h = 240, label = (d) => '', fmt = String, today = 'Today' } = {}) {
  const pad = { l: 40, r: 56, t: 16, b: 26 }, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b;
  const max = Math.ceil(Math.max(...days.map((d) => d.count)) / 100) * 100, min = Math.floor(Math.min(...days.map((d) => d.count)) / 100) * 100 - 100;
  const x = (i) => pad.l + (i / (days.length - 1)) * iw, y = (v) => pad.t + ih - ((v - min) / (max - min)) * ih;
  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Send-offs per day">`;
  for (let k = 0; k <= 3; k++) { const v = min + ((max - min) * k) / 3; s += `<path d="M${pad.l},${f(y(v))} H${w - pad.r}" stroke="${GRID}" stroke-width="1"/>${txt(pad.l - 8, y(v) + 4, Math.round(v), { anchor: 'end', size: 11 })}`; }
  const line = days.map((d, i) => `${i ? 'L' : 'M'}${f(x(i))},${f(y(d.count))}`).join(' ');
  s += `<path d="${line} L${f(x(days.length - 1))},${pad.t + ih} L${pad.l},${pad.t + ih}Z" fill="${SERIES[0]}" fill-opacity=".12"/><path d="${line}" fill="none" stroke="${SERIES[0]}" stroke-width="2.4" stroke-linejoin="round" stroke-linecap="round"/>`;
  [0, 10, 20, 29].forEach((i) => { s += txt(x(i), h - 6, label(days[i]), { anchor: i === 0 ? 'start' : i === 29 ? 'end' : 'middle', size: 11 }); });
  const last = days[days.length - 1];
  s += `<circle cx="${f(x(days.length - 1))}" cy="${f(y(last.count))}" r="4.5" fill="${SERIES[0]}" stroke="#fff" stroke-width="2"/>${txt(w - pad.r + 8, y(last.count) + 4, fmt(last.count), { weight: 700, fill: INK, size: 13 })}`;
  days.forEach((d, i) => { s += `<rect x="${f(x(i) - iw / days.length / 2)}" y="${pad.t}" width="${f(iw / days.length)}" height="${ih}" fill="transparent" data-tip="${esc(label(d, true) + ': ' + fmt(d.count))}"/>`; });
  return s + '</svg>';
}

export function donut(items, { size = 200, totalLabel = '' } = {}) {
  const total = items.reduce((a, b) => a + b.value, 0), r = 70, c = size / 2, sw = 30;
  let a0 = -Math.PI / 2, s = `<svg viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Share of ash remixes">`;
  items.forEach((it, i) => {
    const frac = it.value / total, a1 = a0 + frac * Math.PI * 2, gap = 0.035, A = a0 + gap, B = a1 - gap, large = B - A > Math.PI ? 1 : 0;
    const p = (a) => `${f(c + Math.cos(a) * r)},${f(c + Math.sin(a) * r)}`;
    s += `<path d="M${p(A)} A${r},${r} 0 ${large} 1 ${p(B)}" fill="none" stroke="${it.color || SERIES[i % 6]}" stroke-width="${sw}" data-tip="${esc(it.label)}: ${Math.round(frac * 100)}%"/>`;
    a0 = a1;
  });
  return s + `${txt(c, c - 2, totalLabel, { anchor: 'middle', size: 12 })}${txt(c, c + 18, Math.round(total).toLocaleString('en-US'), { anchor: 'middle', size: 20, weight: 800, fill: INK })}</svg>`;
}

const RAMP = ['#f1ecff', '#d7c9ff', '#b79cff', '#8f6af5', '#6a3df0', '#4b25c4', '#33178f'];
export function heatmap(grid, { dayNames, w = 640, cell = 22, tipFor } = {}) {
  const lw = 40, h = 7 * cell + 34, max = Math.max(...grid.flat());
  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Busiest hours">`;
  const cw = (w - lw) / 24;
  grid.forEach((row, d) => {
    s += txt(lw - 8, d * cell + cell * 0.68, dayNames[d], { anchor: 'end', size: 11 });
    row.forEach((v, hr) => { const k = Math.min(RAMP.length - 1, Math.floor((v / max) * (RAMP.length - 0.01))); s += `<rect x="${f(lw + hr * cw + 1)}" y="${d * cell + 1}" width="${f(cw - 2)}" height="${cell - 2}" rx="3" fill="${RAMP[k]}" data-tip="${esc(tipFor ? tipFor(d, hr, v) : v)}"/>`; });
  });
  [0, 6, 12, 18, 23].forEach((hr) => { s += txt(lw + hr * cw + cw / 2, 7 * cell + 16, String(hr).padStart(2, '0') + ':00', { anchor: 'middle', size: 11 }); });
  return s + '</svg>';
}

export function histogram(bins, { w = 640, h = 200, unit = 'min', hi = 0 } = {}) {
  const pad = { l: 8, r: 8, t: 26, b: 30 }, iw = w - pad.l - pad.r, ih = h - pad.t - pad.b, max = Math.max(...bins.map((b) => b.count)), bw = iw / bins.length;
  let s = `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Turnaround time">`;
  bins.forEach((b, i) => {
    const bh = (b.count / max) * ih, x = pad.l + i * bw + 5, y = pad.t + ih - bh, on = i === hi;
    s += `<path d="M${f(x)},${f(pad.t + ih)} V${f(y + 6)} a6,6 0 0 1 6,-6 h${f(bw - 22)} a6,6 0 0 1 6,6 V${f(pad.t + ih)}Z" fill="${on ? SERIES[1] : SERIES[0]}" data-tip="${b.from}–${b.to} ${unit}: ${b.count}"/>`;
    s += txt(x + (bw - 10) / 2, h - 10, `${b.from}–${b.to}`, { anchor: 'middle', size: 11 }) + txt(x + (bw - 10) / 2, y - 6, b.count, { anchor: 'middle', size: 12, weight: 700, fill: INK });
  });
  return s + '</svg>';
}

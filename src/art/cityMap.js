// A cartoon city map (800 x 520): streets, blocks, a river with bridges, drop points and a courier route.
import { MAP } from '../data/catalog.js';
import { makeRng, n1 } from './rng.js';

const I = '#1a1033';
const riverY = (x) => 262 + 62 * Math.sin(x / 150);
const FILLS = ['#e8deff', '#ffe9b8', '#ffd9e6', '#dcefff', '#fff3d6'];

export function buildRoute(from = MAP.depot, to = MAP.home) {
  const mid = MAP.ys[2];
  return [[from.x, from.y], [from.x, mid], [to.x, mid], [to.x, to.y]];
}
export function routeLength(route) { let l = 0; for (let i = 1; i < route.length; i++) l += Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]); return l; }
export function pointAt(route, t) {
  let d = Math.min(1, Math.max(0, t)) * routeLength(route);
  for (let i = 1; i < route.length; i++) {
    const seg = Math.hypot(route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]);
    if (d <= seg || i === route.length - 1) { const k = seg ? Math.min(1, d / seg) : 0; return { x: route[i - 1][0] + (route[i][0] - route[i - 1][0]) * k, y: route[i - 1][1] + (route[i][1] - route[i - 1][1]) * k, angle: Math.atan2(route[i][1] - route[i - 1][1], route[i][0] - route[i - 1][0]) }; }
    d -= seg;
  }
  return { x: route[0][0], y: route[0][1], angle: 0 };
}

let cache = null;
function base() {
  if (cache) return cache;
  const r = makeRng(9), { xs, ys, w, h } = MAP;
  let s = `<rect width="${w}" height="${h}" fill="#f3eeff"/>`;
  for (let i = 0; i < xs.length - 1; i++) for (let j = 0; j < ys.length - 1; j++) {
    const x0 = xs[i] + 12, y0 = ys[j] + 12, bw = xs[i + 1] - xs[i] - 24, bh = ys[j + 1] - ys[j] - 24, cx = x0 + bw / 2, cy = y0 + bh / 2;
    if (Math.abs(cy - riverY(cx)) < 54) continue;
    const park = r.chance(0.16), fill = park ? '#c9f2df' : r.pick(FILLS);
    s += `<rect x="${x0}" y="${y0}" width="${bw}" height="${bh}" rx="10" fill="${fill}" stroke="${I}" stroke-width="2"/>`;
    if (park) for (let k = 0; k < 4; k++) s += `<circle cx="${n1(x0 + r.f(14, bw - 14))}" cy="${n1(y0 + r.f(14, bh - 14))}" r="${n1(r.f(6, 10))}" fill="#1fd1a0" stroke="${I}" stroke-width="1.6"/>`;
    else for (let k = 0; k < 3; k++) { const bx = x0 + 10 + k * (bw - 20) / 3, bwid = (bw - 36) / 3, hh = r.f(14, bh - 22); s += `<rect x="${n1(bx)}" y="${n1(y0 + bh - 10 - hh)}" width="${n1(bwid)}" height="${n1(hh)}" rx="3" fill="#fff" fill-opacity=".7" stroke="${I}" stroke-opacity=".5" stroke-width="1.4"/>`; }
  }
  let rp = ''; for (let x = -10; x <= w + 10; x += 20) rp += `${x === -10 ? 'M' : 'L'}${x},${n1(riverY(x))} `;
  s += `<path d="${rp}" fill="none" stroke="${I}" stroke-width="54" stroke-linecap="round"/><path d="${rp}" fill="none" stroke="#bfe5ff" stroke-width="46" stroke-linecap="round"/>`;
  for (let k = 0; k < 7; k++) { const x = 40 + k * 120; s += `<path d="M${x},${n1(riverY(x) + 6)} q10,-8 20,0 t20,0" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"/>`; }
  const lines = (arr, f) => arr.map(f).join('');
  s += lines(ys, (y) => `<path d="M-10,${y} H${w + 10}" stroke="${I}" stroke-width="15"/>`) + lines(xs, (x) => `<path d="M${x},-10 V${h + 10}" stroke="${I}" stroke-width="15"/>`);
  s += lines(ys, (y) => `<path d="M-10,${y} H${w + 10}" stroke="#fff" stroke-width="10"/>`) + lines(xs, (x) => `<path d="M${x},-10 V${h + 10}" stroke="#fff" stroke-width="10"/>`);
  s += lines(ys, (y) => `<path d="M-10,${y} H${w + 10}" stroke="#ffc72c" stroke-width="1.6" stroke-dasharray="9 9"/>`);
  cache = s;
  return s;
}
const pin = (x, y, col, label, on) => `<g transform="translate(${x} ${y})" class="map-pin${on ? ' on' : ''}"><ellipse cx="0" cy="2" rx="12" ry="4" fill="${I}" opacity=".25"/><path d="M0,0 C-15,-17 -19,-30 -19,-36 a19,19 0 1 1 38,0 c0,6 -4,19 -19,36z" fill="${col}" stroke="${I}" stroke-width="3.2" stroke-linejoin="round"/><circle cx="0" cy="-36" r="11" fill="#fff" stroke="${I}" stroke-width="2.4"/><text x="0" y="-31.5" text-anchor="middle" font-family="Inter, sans-serif" font-weight="700" font-size="13" fill="${I}">${label}</text></g>`;

export function cityMap({ points = [], selected = null, route = null, courier = null, home = false, depot = false, names = {} } = {}) {
  let s = `<svg viewBox="0 0 ${MAP.w} ${MAP.h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="City map">${base()}`;
  if (route) {
    const d = route.map((p, i) => `${i ? 'L' : 'M'}${p[0]},${p[1]}`).join(' ');
    s += `<path d="${d}" fill="none" stroke="${I}" stroke-width="10" stroke-linecap="round" stroke-linejoin="round"/><path d="${d}" fill="none" stroke="#ff4d5a" stroke-width="5" stroke-linecap="round" stroke-linejoin="round" stroke-dasharray="1 11"/>`;
  }
  if (depot) s += `<g transform="translate(${MAP.depot.x} ${MAP.depot.y})"><rect x="-22" y="-22" width="44" height="44" rx="10" fill="#6a3df0" stroke="${I}" stroke-width="3.2"/><path d="M-9,10 V-4 L0,-12 L9,-4 V10Z M-3,10 V2 H3 V10" fill="#fff" stroke="${I}" stroke-width="2" stroke-linejoin="round"/></g>`;
  if (home) s += `<g transform="translate(${MAP.home.x} ${MAP.home.y})"><circle r="20" fill="#ffc72c" stroke="${I}" stroke-width="3.2"/><path d="M-9,5 V-3 L0,-11 L9,-3 V5Z" fill="#fff" stroke="${I}" stroke-width="2.4" stroke-linejoin="round"/></g>`;
  points.forEach((p, i) => { s += `<g data-on-click="pickPoint" data-arg="${p.id}" style="cursor:pointer">${pin(p.x, p.y, selected === p.id ? '#ffc72c' : '#ff4d5a', String.fromCharCode(65 + i), selected === p.id)}</g>`; if (names[p.id]) s += `<text x="${p.x}" y="${p.y + 20}" text-anchor="middle" font-family="Inter, sans-serif" font-weight="600" font-size="13" stroke="#fff" stroke-width="4" paint-order="stroke" fill="${I}">${names[p.id]}</text>`; });
  if (courier) s += `<g transform="translate(${n1(courier.x)} ${n1(courier.y)})"><circle r="19" fill="#fff" stroke="${I}" stroke-width="3.2"/><g transform="rotate(${n1((courier.angle * 180) / Math.PI)})"><rect x="-10" y="-6" width="20" height="12" rx="3" fill="#1fd1a0" stroke="${I}" stroke-width="2.2"/><path d="M4,-6 h6 v12 h-6z" fill="#ffc72c" stroke="${I}" stroke-width="2"/></g></g>`;
  return s + '</svg>';
}

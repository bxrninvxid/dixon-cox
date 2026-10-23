// Urn skins: twelve hand-composed SVG illustrations, drawn on a 400x560 canvas.
// Every skin is deterministic for a given seed, so a design link always looks the same.
import { _ } from '../lib/i18n.js';
import { n1 } from './rng.js';

const W = 400, H = 560, TAU = Math.PI * 2;
const INK = '#1a1033';

function bez(p, t) {
  const u = 1 - t;
  return [
    u * u * u * p[0] + 3 * u * u * t * p[2] + 3 * u * t * t * p[4] + t * t * t * p[6],
    u * u * u * p[1] + 3 * u * u * t * p[3] + 3 * u * t * t * p[5] + t * t * t * p[7],
  ];
}
const svgPts = (pts) => pts.map((p) => `${n1(p[0])},${n1(p[1])}`).join(' ');
function star(n, outer, inner, rot = -Math.PI / 2) {
  const pts = [];
  for (let i = 0; i < n * 2; i++) {
    const r = i % 2 ? inner : outer, a = rot + (i * Math.PI) / n;
    pts.push([Math.cos(a) * r, Math.sin(a) * r]);
  }
  return 'M' + pts.map((p) => `${n1(p[0] * 100) / 100},${n1(p[1] * 100) / 100}`).join(' L') + 'Z';
}

/* ---------- 1. Koi pond ---------- */
function koiFish(c, x, y, ang, s, pal) {
  const cid = `${c.id}f${(c.k = (c.k || 0) + 1)}`;
  const body = 'M62,0 C44,-17 -8,-17 -42,-4 C-50,0 -50,0 -42,4 C-8,17 44,17 62,0Z';
  return `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(ang)}) scale(${s})">
<path d="M-38,0 C-58,-20 -78,-30 -100,-16 C-86,-6 -84,6 -100,16 C-78,30 -58,20 -38,0Z" fill="${pal.fin}" opacity=".9"/>
<path d="M-50,0 C-64,-11 -78,-14 -90,-8 M-50,0 C-64,11 -78,14 -90,8 M-46,0 L-92,0" stroke="#fff" stroke-opacity=".55" stroke-width="1.2" fill="none"/>
<path d="M24,-9 C16,-31 0,-36 -10,-31 C-6,-22 2,-12 10,-6Z M24,9 C16,31 0,36 -10,31 C-6,22 2,12 10,6Z" fill="${pal.fin}" opacity=".88"/>
<clipPath id="${cid}"><path d="${body}"/></clipPath>
<path d="${body}" fill="${pal.base}"/>
<g clip-path="url(#${cid})">${pal.patches.map((p) => `<ellipse cx="${p[0]}" cy="${p[1]}" rx="${p[2]}" ry="${p[3]}" fill="${p[4]}"/>`).join('')}
<path d="M-40,0 L60,0" stroke="#fff" stroke-opacity=".25" stroke-width="2"/></g>
<path d="${body}" fill="none" stroke="#fff" stroke-opacity=".35" stroke-width="1"/>
<circle cx="47" cy="-6.5" r="2.6" fill="#10131f"/><circle cx="47" cy="6.5" r="2.6" fill="#10131f"/>
<path d="M60,-2 q6,-6 13,-4 M60,2 q6,6 13,4" stroke="${pal.fin}" stroke-width="1.5" fill="none" stroke-linecap="round"/></g>`;
}
function lilyPad(x, y, r, rot, flower) {
  const a = 0.3, x1 = r * Math.cos(a), y1 = r * Math.sin(a), x2 = r * Math.cos(-a), y2 = r * Math.sin(-a);
  let s = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})"><path d="M0,0 L${n1(x1)},${n1(y1)} A${r},${r} 0 1 1 ${n1(x2)},${n1(y2)} Z" fill="#2fae74" stroke="#176d4b" stroke-width="1.6"/><path d="M0,0 L${n1(-r * .85)},0 M0,0 L${n1(-r * .55)},${n1(r * .55)} M0,0 L${n1(-r * .55)},${n1(-r * .55)}" stroke="#176d4b" stroke-opacity=".5" stroke-width="1.1" fill="none"/>`;
  if (flower) {
    for (let k = 0; k < 8; k++) s += `<ellipse cx="0" cy="-${n1(r * .3)}" rx="${n1(r * .13)}" ry="${n1(r * .3)}" transform="rotate(${k * 45})" fill="${k % 2 ? '#ffb3d6' : '#ff8fc1'}" stroke="#c9457f" stroke-width=".8"/>`;
    s += `<circle r="${n1(r * .12)}" fill="#ffd34d"/>`;
  }
  return s + '</g>';
}
function koi(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2=".35" y2="1"><stop offset="0" stop-color="#1383a4"/><stop offset=".5" stop-color="#0b4d78"/><stop offset="1" stop-color="#06284f"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  for (let i = 0; i < 8; i++) s += `<path d="M${n1(r.f(-60, 380))},${n1(r.f(0, 560))} q40,-28 90,0 t90,0 t90,0" fill="none" stroke="#9eefff" stroke-opacity=".10" stroke-width="${n1(r.f(3, 8))}" stroke-linecap="round"/>`;
  for (let i = 0; i < 7; i++) {
    const x = r.f(30, 370), y = r.f(30, 530), r0 = r.f(10, 18);
    for (let k = 1; k <= 3; k++) s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(k * r0)}" fill="none" stroke="#c8f6ff" stroke-opacity="${n1(.3 / k * 100) / 100}" stroke-width="1.6"/>`;
  }
  const pals = [
    { base: '#fff4e4', fin: '#ffb27a', patches: [[10, -4, 22, 9, '#ff5a1f'], [-24, 3, 16, 8, '#ff5a1f'], [38, 2, 10, 7, '#1c1c2b']] },
    { base: '#ff7a2f', fin: '#ffd0a8', patches: [[8, 2, 26, 10, '#fff0dc'], [-26, -3, 12, 7, '#1c1c2b']] },
    { base: '#fffaf0', fin: '#ffe1b8', patches: [[0, -5, 18, 8, '#e8412a'], [32, 3, 12, 7, '#e8412a'], [-22, 4, 10, 6, '#1c1c2b']] },
    { base: '#ffe1c6', fin: '#ff9f6a', patches: [[-4, 0, 30, 9, '#ff6a2b'], [40, -2, 9, 6, '#fff']] },
  ];
  const fish = [[150, 210, 18, 1.12, 0], [262, 318, 205, 1.02, 1], [168, 432, -22, 1.18, 2], [300, 150, 150, .8, 3], [96, 330, 80, .7, 3]];
  const pads = [[316, 220, 30, 20, 1], [92, 160, 24, 200, 0], [330, 440, 28, 110, 0], [60, 480, 22, 300, 0], [210, 120, 20, 60, 0], [220, 520, 26, 10, 0]];
  s += pads.map((p) => lilyPad(p[0] + r.f(-8, 8), p[1] + r.f(-8, 8), p[2], p[3] + r.f(-20, 20), p[4])).join('');
  s += fish.map((f) => koiFish(c, f[0] + r.f(-12, 12), f[1] + r.f(-12, 12), f[2] + r.f(-22, 22), f[3], pals[f[4]])).join('');
  return s;
}

/* ---------- 2. Sakura night ---------- */
function blossom(x, y, r, rot) {
  let s = `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">`;
  const a = n1(r * .62), b = n1(r * .34), cc = n1(r * .98), d = n1(r * .9), e = n1(r * .52);
  for (let k = 0; k < 5; k++) s += `<path d="M0,0 C-${a},-${b} -${e},-${cc} 0,-${d} C${e},-${cc} ${a},-${b} 0,0Z" transform="rotate(${k * 72})" fill="${k % 2 ? '#ffc4de' : '#ffb0d2'}" stroke="#ff7fb3" stroke-width=".9"/>`;
  s += `<circle r="${n1(r * .22)}" fill="#ffe27a"/>`;
  for (let k = 0; k < 6; k++) s += `<circle cx="${n1(Math.cos(k * 1.047) * r * .36)}" cy="${n1(Math.sin(k * 1.047) * r * .36)}" r="${n1(r * .06)}" fill="#c2336f"/>`;
  return s + '</g>';
}
function sakura(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="#43165a"/><stop offset=".6" stop-color="#2a0f3d"/><stop offset="1" stop-color="#170a2b"/></linearGradient><radialGradient id="${id}k2"><stop offset=".55" stop-color="#ffd7ea" stop-opacity=".9"/><stop offset="1" stop-color="#ffd7ea" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  s += `<circle cx="290" cy="150" r="118" fill="url(#${id}k2)" opacity=".5"/><circle cx="290" cy="150" r="62" fill="#ffeaf3"/><circle cx="274" cy="138" r="9" fill="#f3c6da"/><circle cx="308" cy="170" r="13" fill="#f3c6da" opacity=".8"/><circle cx="300" cy="120" r="6" fill="#f3c6da"/>`;
  s += `<path d="M-20,410 C60,380 120,330 200,320 S330,330 430,280 V560 H-20Z" fill="#fff" opacity=".04"/>`;
  const limb = 'M-30,490 C60,450 120,420 190,360 S310,280 430,250';
  s += `<path d="${limb}" fill="none" stroke="#24120d" stroke-width="18" stroke-linecap="round"/><path d="${limb}" fill="none" stroke="#5a3322" stroke-width="6" stroke-linecap="round" stroke-dasharray="46 16" opacity=".7" transform="translate(-2 -3)"/>`;
  const twigs = [
    [96, 462, 110, 400, 80, 340, 120, 280], [190, 360, 200, 320, 240, 300, 250, 230], [262, 318, 290, 370, 300, 390, 340, 420],
    [150, 420, 170, 460, 150, 490, 200, 540], [236, 300, 260, 250, 210, 200, 240, 140], [330, 290, 350, 240, 330, 200, 360, 150], [60, 440, 30, 400, 40, 350, 20, 300],
  ];
  for (const tw of twigs) s += `<path d="M${tw[0]},${tw[1]} C${tw.slice(2).join(',')}" fill="none" stroke="#2a150e" stroke-width="7" stroke-linecap="round"/>`;
  for (const tw of twigs) for (const t of [.3, .5, .7, .88, 1]) {
    const p = bez(tw, t);
    s += blossom(p[0] + r.f(-14, 14), p[1] + r.f(-14, 14), r.f(13, 22), r.f(0, 72));
    if (r.chance(.5)) s += `<circle cx="${n1(p[0] + r.f(-20, 20))}" cy="${n1(p[1] + r.f(-20, 20))}" r="${n1(r.f(3, 5))}" fill="#ff8fbf"/>`;
  }
  for (let i = 0; i < 28; i++) s += blossom(r.f(0, 400), r.f(0, 560), r.f(4.5, 8), r.f(0, 360)).replace('<g ', '<g opacity=".85" ');
  return s;
}

/* ---------- 3. Liquid chrome ---------- */
function chrome(c) {
  const id = c.id, r = c.rng;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f6fbff"/><stop offset=".3" stop-color="#b3d0ff"/><stop offset=".7" stop-color="#3d68cc"/><stop offset="1" stop-color="#14286b"/></linearGradient>
<linearGradient id="${id}k2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0d2"/><stop offset=".22" stop-color="#e5a85f"/><stop offset=".6" stop-color="#6d3f1b"/><stop offset="1" stop-color="#150a06"/></linearGradient></defs>`;
  const hz = 290 + r.f(-12, 12);
  s += `<rect width="${W}" height="${hz + 20}" fill="url(#${id}k1)"/>`;
  s += `<path d="M-20,150 C60,80 150,130 210,92 S330,60 430,120 V0 H-20Z" fill="#fff" opacity=".6"/>`;
  s += `<path d="M0,${hz} C100,${hz - 26} 190,${hz + 18} 260,${hz - 4} S360,${hz - 18} 400,${hz - 8} V560 H0Z" fill="url(#${id}k2)"/>`;
  for (let i = 0; i < 6; i++) {
    const y = hz + 30 + i * 38 + r.f(-6, 6), amp = r.f(14, 30);
    s += `<path d="M-20,${n1(y + 9)} q55,-${n1(amp)} 110,0 t110,0 t110,0 t110,0 t110,0" fill="none" stroke="#1a0c05" stroke-opacity=".38" stroke-width="9" stroke-linecap="round"/>`;
    s += `<path d="M-20,${n1(y)} q55,-${n1(amp)} 110,0 t110,0 t110,0 t110,0 t110,0" fill="none" stroke="#fff" stroke-opacity=".55" stroke-width="5" stroke-linecap="round"/>`;
  }
  s += `<path d="M-10,${hz - 90} C80,${hz - 130} 140,${hz - 40} 250,${hz - 80} S380,${hz - 120} 410,${hz - 70}" fill="none" stroke="#10245c" stroke-opacity=".45" stroke-width="16" stroke-linecap="round"/>`;
  s += `<circle cx="${n1(r.f(90, 150))}" cy="${n1(r.f(150, 210))}" r="20" fill="#fff" filter="url(#${id}b)"/><path d="M60,180 L180,180 M120,120 L120,240" stroke="#fff" stroke-opacity=".5" stroke-width="2"/>`;
  return s;
}

/* ---------- 4. Gold scales ---------- */
function gold(c) {
  const id = c.id, R = 38;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#8a5a00"/><stop offset=".3" stop-color="#f6d867"/><stop offset=".55" stop-color="#b98410"/><stop offset=".8" stop-color="#ffe9a0"/><stop offset="1" stop-color="#8a5a00"/></linearGradient>
<radialGradient id="${id}k2" cx=".35" cy=".3" r=".9"><stop offset="0" stop-color="#fff2b3"/><stop offset=".5" stop-color="#e9bd3e"/><stop offset="1" stop-color="#a97407"/></radialGradient>
<g id="${id}k3"><circle r="${R}" fill="url(#${id}k2)" stroke="#6b4500" stroke-width="1.6"/><circle r="${R * .74}" fill="none" stroke="#6b4500" stroke-opacity=".55" stroke-width="1.5"/><circle r="${R * .5}" fill="none" stroke="#6b4500" stroke-opacity=".55" stroke-width="1.5"/><circle r="${R * .26}" fill="none" stroke="#6b4500" stroke-opacity=".55" stroke-width="1.5"/></g></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  let row = 0;
  for (let y = -R * .5; y < H + R; y += R * .5, row++) for (let x = (row % 2 ? 0 : -R); x < W + R; x += 2 * R) s += `<use href="#${id}k3" x="${n1(x)}" y="${n1(y)}"/>`;
  s += `<defs><linearGradient id="${id}k4" x1="0" y1="0" x2="1" y2="1"><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".38" stop-color="#fff" stop-opacity=".42"/><stop offset=".5" stop-color="#fff" stop-opacity="0"/><stop offset=".7" stop-color="#fff" stop-opacity=".22"/><stop offset=".8" stop-color="#fff" stop-opacity="0"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k4)"/>`;
  return s;
}

/* ---------- 5. Arcade carpet ---------- */
function arcade(c) {
  const r = c.rng, cols = ['#18c3d4', '#ff4f8b', '#ffc72c', '#8a5cff', '#ffffff', '#ff8a3d', '#4be3a5'];
  let s = `<rect width="${W}" height="${H}" fill="#1b1448"/>`;
  const cell = 46;
  for (let gy = -1; gy < H / cell + 1; gy++) for (let gx = -1; gx < W / cell + 1; gx++) {
    const x = gx * cell + r.f(8, 38), y = gy * cell + r.f(8, 38), col = r.pick(cols), rot = r.f(0, 360), k = r.i(0, 7);
    let g = '';
    const st = `fill="none" stroke="${col}" stroke-width="4.2" stroke-linecap="round" stroke-linejoin="round"`;
    if (k === 0) g = `<path d="M-16,0 q8,-11 16,0 t16,0" ${st}/>`;
    else if (k === 1) g = `<path d="M0,-11 L11,9 L-11,9Z" ${st}/>`;
    else if (k === 2) g = `<circle r="8" ${st}/>`;
    else if (k === 3) g = `<path d="M-9,0 H9 M0,-9 V9" ${st}/>`;
    else if (k === 4) g = `<path d="M-15,7 l7.5,-13 7.5,13 7.5,-13 7.5,13" ${st}/>`;
    else if (k === 5) g = `<circle cx="-8" r="2.8" fill="${col}"/><circle cx="0" cy="-6" r="2.8" fill="${col}"/><circle cx="8" r="2.8" fill="${col}"/>`;
    else if (k === 6) g = `<path d="M-11,6 A11,11 0 0 1 11,6Z" fill="${col}"/>`;
    else g = `<path d="M0,-11 L11,0 L0,11 L-11,0Z" fill="${col}"/>`;
    s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)})">${g}</g>`;
  }
  return s;
}

/* ---------- 6. Sticker bomb ---------- */
const STICKERS = [
  { d: star(5, 1, .46), face: false }, { d: 'M.25,-1 L-.55,.12 L-.08,.12 L-.28,1 L.6,-.22 L.12,-.22Z' },
  { d: 'M0,.9 C-1.25,.05 -1,-.9 -.38,-.82 C-.1,-.78 0,-.55 0,-.45 C0,-.55 .1,-.78 .38,-.82 C1,-.9 1.25,.05 0,.9Z' },
  { d: 'M0,-1 C.2,-.5 .85,-.25 .85,.35 C.85,.8 .45,1 0,1 C-.45,1 -.85,.8 -.85,.3 C-.85,-.1 -.55,-.35 -.3,-.55 C-.3,-.25 -.15,-.05 0,0 C.2,-.3 .1,-.7 0,-1Z' },
  { d: star(12, 1, .74) }, { d: 'M-1,0 a1,1 0 1,0 2,0 a1,1 0 1,0 -2,0 M-.48,0 a.48,.48 0 1,1 .96,0 a.48,.48 0 1,1 -.96,0', evenodd: true },
  { d: 'M-1,0 a1,1 0 1,0 2,0 a1,1 0 1,0 -2,0Z', face: true },
];
function stickerBomb(c) {
  const r = c.rng, cols = ['#ff4d5a', '#ffc72c', '#2fd6a6', '#7a4dff', '#ff8ac9', '#3bb6ff', '#ff8a2b', '#ffffff'];
  let s = `<rect width="${W}" height="${H}" fill="#fdf7ea"/>`;
  const cell = 52, items = [];
  for (let gy = -1; gy < H / cell + 1; gy++) for (let gx = -1; gx < W / cell + 1; gx++) items.push([gx * cell + cell / 2 + r.f(-14, 14), gy * cell + cell / 2 + r.f(-14, 14)]);
  for (const [x, y] of r.shuffle(items)) {
    const sk = r.pick(STICKERS), col = r.pick(cols), sz = r.f(22, 34), rot = r.f(-35, 35);
    const fr = sk.evenodd ? ' fill-rule="evenodd"' : '';
    s += `<g transform="translate(${n1(x)} ${n1(y)}) rotate(${n1(rot)}) scale(${n1(sz)})"><path d="${sk.d}" fill="#fff" stroke="#fff" stroke-width=".34" stroke-linejoin="round"${fr}/><path d="${sk.d}" fill="${col}" stroke="${INK}" stroke-width=".085" stroke-linejoin="round"${fr}/>`;
    if (sk.face) s += `<circle cx="-.34" cy="-.22" r=".11" fill="${INK}"/><circle cx=".34" cy="-.22" r=".11" fill="${INK}"/><path d="M-.5,.25 Q0,.85 .5,.25" fill="none" stroke="${INK}" stroke-width=".1" stroke-linecap="round"/>`;
    s += '</g>';
  }
  return s;
}

/* ---------- 7. Tora stripes ---------- */
function tora(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ffa733"/><stop offset="1" stop-color="#ff6400"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  for (let i = 0; i < 9; i++) s += `<ellipse cx="${n1(r.f(0, 400))}" cy="${n1(r.f(0, 560))}" rx="${n1(r.f(40, 90))}" ry="${n1(r.f(20, 50))}" fill="#ffd9a0" opacity=".16" transform="rotate(${n1(r.f(0, 180))} 200 280)"/>`;
  for (let i = 0; i < 26; i++) {
    const left = i % 2 === 0, y = (i / 26) * 600 - 20 + r.f(-8, 8), len = r.f(110, 220), th = r.f(14, 26), x0 = left ? -20 : 420, dir = left ? 1 : -1;
    const x1 = x0 + dir * len, y1 = y + r.f(-34, 34), mx = x0 + dir * len * .5, my = (y + y1) / 2 + r.f(-22, 22);
    s += `<path d="M${x0},${n1(y)} Q${n1(mx)},${n1(my - th)} ${n1(x1)},${n1(y1)} Q${n1(mx)},${n1(my + th * .5)} ${x0},${n1(y + th * 1.6)}Z" fill="${r.chance(.8) ? INK : '#3a1608'}"/>`;
    if (r.chance(.55)) { const sx = x0 + dir * len * r.f(.1, .4), sy = y + r.f(30, 50); s += `<path d="M${n1(sx)},${n1(sy)} q${dir * 40},${n1(r.f(-14, 14))} ${dir * r.f(50, 90)},${n1(r.f(-18, 18))} q${dir * -30},${n1(r.f(2, 12))} ${dir * -r.f(50, 90)},${n1(r.f(6, 14))}Z" fill="${INK}" opacity=".9"/>`; }
  }
  return s;
}

/* ---------- 8. Aurora holo foil ---------- */
function sparkle(x, y, s, col = '#fff', op = .9) {
  return `<path d="M${n1(x)},${n1(y - s)} Q${n1(x)},${n1(y)} ${n1(x + s)},${n1(y)} Q${n1(x)},${n1(y)} ${n1(x)},${n1(y + s)} Q${n1(x)},${n1(y)} ${n1(x - s)},${n1(y)} Q${n1(x)},${n1(y)} ${n1(x)},${n1(y - s)}Z" fill="${col}" opacity="${op}"/>`;
}
function holo(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ed2"/><stop offset=".17" stop-color="#b9a2ff"/><stop offset=".34" stop-color="#7ad8ff"/><stop offset=".5" stop-color="#8ff7c8"/><stop offset=".66" stop-color="#fff1a0"/><stop offset=".83" stop-color="#ffb09a"/><stop offset="1" stop-color="#d6a0ff"/></linearGradient>
<radialGradient id="${id}k2"><stop offset="0" stop-color="#fff" stop-opacity=".75"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  s += `<g transform="rotate(-32 200 280)">`;
  for (let i = 0; i < 9; i++) s += `<rect x="-200" y="${n1(-120 + i * 80 + r.f(-14, 14))}" width="800" height="${n1(r.f(10, 46))}" fill="#fff" opacity="${n1(r.f(.1, .3) * 100) / 100}"/>`;
  for (let i = 0; i < 90; i++) s += `<rect x="-200" y="${-140 + i * 9}" width="800" height="1.3" fill="#fff" opacity=".12"/>`;
  s += '</g>';
  for (let i = 0; i < 6; i++) s += `<circle cx="${n1(r.f(0, 400))}" cy="${n1(r.f(0, 560))}" r="${n1(r.f(60, 130))}" fill="url(#${id}k2)" opacity=".5"/>`;
  for (let i = 0; i < 16; i++) s += sparkle(r.f(10, 390), r.f(10, 550), r.f(5, 17));
  return s;
}

/* ---------- 9. Sunset dunes ---------- */
function dunes(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe3ae"/><stop offset=".35" stop-color="#ff9a76"/><stop offset=".7" stop-color="#e8546a"/><stop offset="1" stop-color="#7b2d6b"/></linearGradient>
<radialGradient id="${id}k2"><stop offset=".3" stop-color="#fff6d6"/><stop offset="1" stop-color="#fff6d6" stop-opacity="0"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  s += `<circle cx="268" cy="190" r="150" fill="url(#${id}k2)" opacity=".7"/><circle cx="268" cy="190" r="62" fill="#fff4d1"/>`;
  s += `<path d="M64,90 q8,-8 16,0 q8,-8 16,0 M118,128 q6,-6 12,0 q6,-6 12,0" fill="none" stroke="#5b1f4f" stroke-width="2" stroke-linecap="round" opacity=".6"/>`;
  const cols = ['#ffb27a', '#ee7f62', '#c9556a', '#8e3a72', '#4a2268'];
  cols.forEach((col, k) => {
    const base = 250 + k * 62, ph = r.f(0, TAU), A = 24 + k * 6, w = r.f(90, 140);
    let d = `M-10,${H + 10} L-10,${n1(base)}`;
    for (let x = -10; x <= 410; x += 20) d += ` L${x},${n1(base + Math.sin(x / w + ph) * A + Math.sin(x / (w * .43) + ph * 2) * A * .35)}`;
    s += `<path d="${d} L410,${H + 10}Z" fill="${col}"/>`;
    let ridge = ''; for (let x = -10; x <= 410; x += 20) ridge += `${x === -10 ? 'M' : 'L'}${x},${n1(base + Math.sin(x / w + ph) * A + Math.sin(x / (w * .43) + ph * 2) * A * .35)} `;
    s += `<path d="${ridge}" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="2.2"/>`;
    for (let i = 0; i < 3; i++) { const x = r.f(0, 340), y = base + A + r.f(6, 34); s += `<path d="M${n1(x)},${n1(y)} q30,-8 60,0" fill="none" stroke="#fff" stroke-opacity=".14" stroke-width="2" stroke-linecap="round"/>`; }
  });
  return s;
}

/* ---------- 10. Star chart (matte + gold) ---------- */
function starChart(c) {
  const r = c.rng, id = c.id, G = '#d9ad4b';
  let s = `<defs><radialGradient id="${id}k1" cx=".5" cy=".5" r=".75"><stop offset="0" stop-color="#2a2336"/><stop offset="1" stop-color="#121018"/></radialGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  for (const rad of [58, 112, 172, 244, 320]) s += `<circle cx="200" cy="300" r="${rad}" fill="none" stroke="${G}" stroke-opacity=".28" stroke-width="1"/>`;
  for (let i = 0; i < 24; i++) { const a = (i / 24) * TAU; s += `<line x1="200" y1="300" x2="${n1(200 + Math.cos(a) * 340)}" y2="${n1(300 + Math.sin(a) * 340)}" stroke="${G}" stroke-opacity=".10"/>`; }
  const pts = [];
  for (let i = 0; i < 34; i++) pts.push([r.f(10, 390), r.f(40, 540), r.f(1.4, 3.6)]);
  const used = new Set();
  pts.forEach((p, i) => {
    let links = 0;
    pts.forEach((q, j) => { if (j > i && links < 2 && Math.hypot(p[0] - q[0], p[1] - q[1]) < 105 && !used.has(i + '-' + j)) { used.add(i + '-' + j); links++; s += `<line x1="${n1(p[0])}" y1="${n1(p[1])}" x2="${n1(q[0])}" y2="${n1(q[1])}" stroke="${G}" stroke-opacity=".6" stroke-width="1.1"/>`; } });
  });
  pts.forEach((p) => { s += `<circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(p[2] * 2.6)}" fill="${G}" opacity=".18"/><circle cx="${n1(p[0])}" cy="${n1(p[1])}" r="${n1(p[2])}" fill="#f6dc9a"/>`; });
  for (let i = 0; i < 10; i++) s += sparkle(r.f(10, 390), r.f(20, 540), r.f(6, 11), '#f6dc9a', .8);
  s += `<path d="M0,520 Q200,470 400,520" fill="none" stroke="${G}" stroke-opacity=".5" stroke-width="1.2"/>`;
  return s;
}

/* ---------- 11. Bubblegum pop ---------- */
function bubblegum(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><linearGradient id="${id}k1" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ff9ccb"/><stop offset="1" stop-color="#ff5aa5"/></linearGradient></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  const cell = 40;
  for (let gy = -1; gy < H / cell + 1; gy++) for (let gx = -1; gx < W / cell + 1; gx++) {
    const x = gx * cell + (gy % 2 ? cell / 2 : 0), y = gy * cell, rr = r.f(5, 12);
    s += `<circle cx="${n1(x)}" cy="${n1(y)}" r="${n1(rr)}" fill="${r.chance(.25) ? '#fff' : '#ffd9ec'}" opacity=".85"/>`;
  }
  const cols = ['#2fd6a6', '#ffc72c', '#3bb6ff', '#7a4dff', '#fff'];
  for (let i = 0; i < 46; i++) s += `<rect x="-7" y="-2" width="14" height="4.4" rx="2.2" fill="${r.pick(cols)}" transform="translate(${n1(r.f(0, 400))} ${n1(r.f(0, 560))}) rotate(${n1(r.f(0, 180))})"/>`;
  for (let i = 0; i < 6; i++) s += `<path d="M0,10 C-14,0 -11,-10 -4,-9 C-1,-8 0,-6 0,-5 C0,-6 1,-8 4,-9 C11,-10 14,0 0,10Z" fill="#fff" opacity=".9" transform="translate(${n1(r.f(20, 380))} ${n1(r.f(20, 540))}) rotate(${n1(r.f(-30, 30))}) scale(${n1(r.f(.9, 1.7))})"/>`;
  return s;
}

/* ---------- 12. Cosmos ---------- */
function cosmos(c) {
  const r = c.rng, id = c.id;
  let s = `<defs><radialGradient id="${id}k1" cx=".4" cy=".3" r="1"><stop offset="0" stop-color="#3d2a9e"/><stop offset=".5" stop-color="#1a0f4d"/><stop offset="1" stop-color="#07031a"/></radialGradient>
<radialGradient id="${id}k2"><stop offset="0" stop-color="#fff" stop-opacity=".9"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient>
<linearGradient id="${id}k3" x1=".2" y1="0" x2=".8" y2="1"><stop offset="0" stop-color="#ffe0b8"/><stop offset=".5" stop-color="#ff8a5c"/><stop offset="1" stop-color="#9c2d5e"/></linearGradient>
<linearGradient id="${id}k4" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9ff3e6"/><stop offset="1" stop-color="#1c8aa8"/></linearGradient>
<clipPath id="${id}k5"><circle cx="140" cy="170" r="56"/></clipPath></defs><rect width="${W}" height="${H}" fill="url(#${id}k1)"/>`;
  const neb = [['#ff4fa3', 90, 380, 140], ['#35d0ff', 320, 250, 120], ['#8a5cff', 200, 480, 150], ['#ff4fa3', 330, 60, 90]];
  for (const n of neb) s += `<circle cx="${n[1]}" cy="${n[2]}" r="${n[3]}" fill="${n[0]}" opacity=".28" filter="url(#${id}b2)"/>`;
  for (let i = 0; i < 130; i++) s += `<circle cx="${n1(r.f(0, 400))}" cy="${n1(r.f(0, 560))}" r="${n1(r.f(.5, 1.8))}" fill="#fff" opacity="${n1(r.f(.3, 1) * 100) / 100}"/>`;
  for (let i = 0; i < 12; i++) s += sparkle(r.f(10, 390), r.f(10, 550), r.f(5, 11), '#fff', .9);
  // ringed planet
  s += `<g transform="rotate(-16 140 170)"><ellipse cx="140" cy="170" rx="104" ry="22" fill="none" stroke="#ffe3c4" stroke-width="8" opacity=".85"/></g>`;
  s += `<circle cx="140" cy="170" r="56" fill="url(#${id}k3)"/><g clip-path="url(#${id}k5)"><path d="M70,150 q70,-16 140,6 M70,176 q70,-14 140,4 M70,200 q70,-10 140,0" stroke="#fff" stroke-opacity=".28" stroke-width="7" fill="none"/><circle cx="170" cy="200" r="64" fill="#2a0a3a" opacity=".35"/></g>`;
  s += `<g transform="rotate(-16 140 170)"><path d="M36,170 A104,22 0 0 0 244,170" fill="none" stroke="#ffe3c4" stroke-width="8"/></g>`;
  s += `<circle cx="300" cy="430" r="28" fill="url(#${id}k4)"/><circle cx="292" cy="422" r="8" fill="#fff" opacity=".25"/><circle cx="310" cy="440" r="5" fill="#0c5d78" opacity=".4"/>`;
  s += `<path d="M360,70 L250,130" stroke="#fff" stroke-width="2.2" stroke-linecap="round" opacity=".8"/><path d="M360,70 L300,103" stroke="#fff" stroke-width="5" stroke-linecap="round" opacity=".5"/>`;
  return s;
}

// rarity: 0 common, 1 rare, 2 epic, 3 legendary
export const RARITY = [
  { id: 'common', name: _('Common'), price: 0, color: '#b9aedb' },
  { id: 'rare', name: _('Rare'), price: 39, color: '#3bb6ff' },
  { id: 'epic', name: _('Epic'), price: 89, color: '#7a4dff' },
  { id: 'legendary', name: _('Legendary'), price: 149, color: '#ffc72c' },
];

export const SKINS = {
  tora: { name: _('Tora stripes'), rarity: 0, metal: 'black', etch: '#ffffff', accent: '#1a1033', swatch: ['#ff9c2a', '#ff6400', '#1a1033'], art: tora },
  bubblegum: { name: _('Bubblegum pop'), rarity: 0, metal: 'rose', etch: '#ffffff', accent: '#ff5aa5', swatch: ['#ff9ccb', '#ff5aa5', '#2fd6a6'], art: bubblegum },
  arcade: { name: _('Arcade carpet'), rarity: 0, metal: 'silver', etch: '#ffffff', accent: '#ff4f8b', swatch: ['#1b1448', '#18c3d4', '#ff4f8b'], art: arcade },
  dunes: { name: _('Sunset dunes'), rarity: 0, metal: 'rose', etch: '#fff3d6', accent: '#c9556a', swatch: ['#ffe3ae', '#e8546a', '#4a2268'], art: dunes },
  stars: { name: _('Star chart'), rarity: 1, metal: 'gold', etch: '#f2d58a', accent: '#d9ad4b', swatch: ['#121018', '#d9ad4b', '#f6dc9a'], art: starChart },
  sticker: { name: _('Sticker bomb'), rarity: 1, metal: 'black', etch: INK, accent: '#ff4d5a', swatch: ['#fdf7ea', '#ff4d5a', '#ffc72c'], art: stickerBomb },
  sakura: { name: _('Sakura night'), rarity: 1, metal: 'rose', etch: '#ffe6f1', accent: '#ff86b9', swatch: ['#2a0f3d', '#ffb0d2', '#ffeaf3'], art: sakura },
  koi: { name: _('Koi pond'), rarity: 1, metal: 'gold', etch: '#e9fbff', accent: '#ff7a3d', swatch: ['#0b4d78', '#ff7a3d', '#fff4e4'], art: koi },
  chrome: { name: _('Liquid chrome'), rarity: 2, metal: 'silver', etch: '#0f1c4a', accent: '#6f8fd1', swatch: ['#b3d0ff', '#3d68cc', '#e5a85f'], art: chrome },
  cosmos: { name: _('Cosmos'), rarity: 2, metal: 'silver', etch: '#ffffff', accent: '#8a5cff', swatch: ['#1a0f4d', '#ff8a5c', '#35d0ff'], art: cosmos },
  gold: { name: _('Gold scales'), rarity: 3, metal: 'gold', etch: '#4a3000', accent: '#c99a1c', swatch: ['#f6d867', '#b98410', '#6b4500'], art: gold },
  holo: { name: _('Aurora holo'), rarity: 3, metal: 'silver', etch: '#33205f', accent: '#b9a2ff', swatch: ['#ff9ed2', '#7ad8ff', '#fff1a0'], art: holo },
};
export const SKIN_IDS = Object.keys(SKINS);

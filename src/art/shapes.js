// Urn silhouettes. Each build() returns the layers of one urn on a 400x560 canvas:
//   defs    gradients specific to the shape
//   clip    elements that make up the body outline (skin art is clipped to this)
//   behind  parts drawn before the body (handles, antenna, base slab)
//   shade   lighting overlay, clipped to the body
//   front   parts drawn over the body (rims, lids, feet, speakers)
// plus anchor points for the engraving plaque, QR tile, floor shadow and LED.
import { _ } from '../lib/i18n.js';

const mrect = (c, x, y, w, h, rx = 0, fill) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="${fill || c.M}"/><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rx}" fill="url(#${c.id}mo)" stroke="#000" stroke-opacity=".38" stroke-width="1.2"/>`;
const mpath = (c, d, fill) =>
  `<path d="${d}" fill="${fill || c.M}"/><path d="${d}" fill="url(#${c.id}mo)" stroke="#000" stroke-opacity=".38" stroke-width="1.2" stroke-linejoin="round"/>`;

const cyl = (id, x0, x1, g = 1) =>
  `<linearGradient id="${id}s" gradientUnits="userSpaceOnUse" x1="${x0}" y1="0" x2="${x1}" y2="0">
<stop offset="0" stop-color="#000" stop-opacity=".66"/><stop offset=".1" stop-color="#000" stop-opacity=".3"/>
<stop offset=".24" stop-color="#fff" stop-opacity="${.1 * g}"/><stop offset=".34" stop-color="#fff" stop-opacity="${.36 * g}"/><stop offset=".43" stop-color="#fff" stop-opacity="${.05 * g}"/>
<stop offset=".62" stop-color="#000" stop-opacity="0"/><stop offset=".86" stop-color="#000" stop-opacity=".32"/><stop offset="1" stop-color="#000" stop-opacity=".7"/></linearGradient>`;
const vshade = (id, a = .4, b = .5) =>
  `<linearGradient id="${id}v" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity="${a}"/><stop offset=".22" stop-color="#000" stop-opacity="0"/><stop offset=".78" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity="${b}"/></linearGradient>`;
const streak = (c, d, w = 9, o = .5) => `<path d="${d}" fill="none" stroke="#fff" stroke-opacity="${n(o * c.gloss)}" stroke-width="${w}" stroke-linecap="round" filter="url(#${c.id}b)"/>`;
const n = (v) => Math.round(v * 100) / 100;

export const SHAPES = {
  amphora: {
    name: _('Amphora'), price: 0, note: _('The timeless one. Handles included.'),
    build(c) {
      const id = c.id;
      const body = 'M168,126 C166,152 112,168 98,226 C86,274 92,330 120,388 C138,424 158,448 160,476 L240,476 C242,448 262,424 280,388 C308,330 314,274 302,226 C288,168 234,152 232,126 Z';
      const handle = (sx) => {
        const d = `M${200 + sx * 30},144 C${200 + sx * 88},124 ${200 + sx * 126},178 ${200 + sx * 100},234`;
        return `<path d="${d}" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="18" stroke-linecap="round"/><path d="${d}" fill="none" stroke="${c.M}" stroke-width="13" stroke-linecap="round"/><path d="${d}" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round" transform="translate(${-sx * 2} -2)"/>`;
      };
      return {
        defs: cyl(id, 92, 308, c.gloss) + vshade(id),
        clip: `<path d="${body}"/>`,
        behind: handle(-1) + handle(1),
        shade: `<rect width="400" height="560" fill="url(#${id}s)"/><rect x="80" y="110" width="240" height="380" fill="url(#${id}v)"/>` +
          streak(c, 'M126,238 C120,292 130,346 152,390', 9, .55) + `<ellipse cx="141" cy="212" rx="7" ry="13" transform="rotate(24 141 212)" fill="#fff" opacity="${n(.6 * c.gloss)}" filter="url(#${id}b)"/>`,
        front: mrect(c, 152, 114, 96, 20, 8) + mrect(c, 162, 130, 76, 9, 4) + mpath(c, 'M168,114 C168,76 232,76 232,114Z') + mrect(c, 191, 66, 18, 18, 9) +
          mrect(c, 140, 474, 120, 20, 7) + mrect(c, 124, 492, 152, 16, 6),
        plaque: { cx: 200, cy: 340, w: 124, h: 70 }, qr: { cx: 200, cy: 436, s: 42 },
        floor: { cx: 200, cy: 511, rx: 98 }, ledBar: { x: 128, y: 508, w: 144 }, speaker: { cx: 200, cy: 150 },
      };
    },
  },

  capsule: {
    name: _('Capsule'), price: 20, note: _('A glossy pill. Very 2077.'),
    build(c) {
      const id = c.id;
      const body = 'M118,160 A82,82 0 0 1 282,160 V402 A82,82 0 0 1 118,402 Z';
      return {
        defs: cyl(id, 118, 282, c.gloss) + vshade(id, .35, .45),
        clip: `<path d="${body}"/>`, behind: '',
        shade: `<rect width="400" height="560" fill="url(#${id}s)"/><rect x="100" y="70" width="200" height="420" fill="url(#${id}v)"/>` +
          streak(c, 'M146,150 C140,230 140,330 148,430', 10, .6) + `<path d="M150,122 C158,100 178,92 196,92" fill="none" stroke="#fff" stroke-opacity="${n(.6 * c.gloss)}" stroke-width="8" stroke-linecap="round" filter="url(#${id}b)"/>`,
        front: mrect(c, 108, 258, 184, 16, 8) + mrect(c, 172, 88, 56, 14, 7) + mrect(c, 140, 482, 120, 18, 7) + mrect(c, 122, 498, 156, 14, 6),
        plaque: { cx: 200, cy: 350, w: 118, h: 72 }, qr: { cx: 200, cy: 190, s: 48 },
        floor: { cx: 200, cy: 514, rx: 100 }, ledBar: { x: 122, y: 510, w: 156 }, speaker: { cx: 200, cy: 440 },
      };
    },
  },

  orb: {
    name: _('Orb'), price: 40, note: _('A crystal ball for the afterlife.'),
    build(c) {
      const id = c.id;
      return {
        defs: `<radialGradient id="${id}s" cx=".36" cy=".3" r=".9"><stop offset="0" stop-color="#fff" stop-opacity="${n(.5 * c.gloss)}"/><stop offset=".22" stop-color="#fff" stop-opacity="${n(.08 * c.gloss)}"/><stop offset=".5" stop-color="#000" stop-opacity="0"/><stop offset=".8" stop-color="#000" stop-opacity=".36"/><stop offset="1" stop-color="#000" stop-opacity=".74"/></radialGradient>`,
        clip: '<circle cx="200" cy="268" r="148"/>', behind: '',
        shade: `<circle cx="200" cy="268" r="148" fill="url(#${id}s)"/>` + streak(c, 'M112,214 C118,166 160,132 212,130', 11, .65) +
          `<ellipse cx="150" cy="184" rx="10" ry="16" transform="rotate(38 150 184)" fill="#fff" opacity="${n(.75 * c.gloss)}" filter="url(#${id}b)"/>` +
          `<path d="M270,372 C300,350 318,318 322,284" fill="none" stroke="#fff" stroke-opacity="${n(.22 * c.gloss)}" stroke-width="6" stroke-linecap="round" filter="url(#${id}b)"/>`,
        front: mrect(c, 168, 112, 64, 16, 7) + mrect(c, 190, 98, 20, 18, 7) + mrect(c, 146, 406, 108, 24, 10) + mpath(c, 'M164,430 L236,430 L250,484 L150,484Z') + mrect(c, 128, 482, 144, 16, 6) + mrect(c, 108, 496, 184, 14, 6),
        plaque: { cx: 200, cy: 276, w: 132, h: 74 }, qr: { cx: 200, cy: 364, s: 44 },
        floor: { cx: 200, cy: 512, rx: 110 }, ledBar: { x: 112, y: 508, w: 176 }, speaker: { cx: 200, cy: 457 },
      };
    },
  },

  monolith: {
    name: _('Monolith'), price: 30, note: _('Clean lines, loud skin.'),
    build(c) {
      const id = c.id;
      const front = 'M128,478 L256,478 L246,118 L138,118Z', side = 'M256,478 L296,462 L286,104 L246,118Z', top = 'M138,118 L246,118 L286,104 L178,104Z';
      return {
        defs: `<linearGradient id="${id}s" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${n(.3 * c.gloss)}"/><stop offset=".4" stop-color="#fff" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".4"/></linearGradient>
<linearGradient id="${id}t" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#000" stop-opacity=".28"/><stop offset="1" stop-color="#000" stop-opacity=".62"/></linearGradient>`,
        clip: `<path d="${front}"/><path d="${side}"/><path d="${top}"/>`,
        behind: mpath(c, 'M104,478 L282,478 L322,462 L144,462Z') + mpath(c, 'M104,478 L282,478 L282,502 L104,502Z') +
          mpath(c, 'M282,478 L322,462 L322,486 L282,502Z') + '<path d="M282,478 L322,462 L322,486 L282,502Z" fill="#000" opacity=".3"/>',
        shade: `<path d="${front}" fill="url(#${id}s)"/><path d="${side}" fill="url(#${id}t)"/><path d="${top}" fill="#fff" opacity=".3"/>` +
          `<path d="M150,132 L190,132 L172,468 L138,468Z" fill="#fff" opacity="${n(.13 * c.gloss)}" filter="url(#${id}b)"/>` +
          '<path d="M138,118 L246,118 L286,104 M246,118 L256,478" fill="none" stroke="#fff" stroke-opacity=".6" stroke-width="1.6"/><path d="M138,118 L128,478" fill="none" stroke="#fff" stroke-opacity=".3" stroke-width="1.2"/>',
        front: '',
        plaque: { cx: 192, cy: 334, w: 100, h: 68 }, qr: { cx: 192, cy: 214, s: 46 },
        floor: { cx: 214, cy: 512, rx: 122 }, ledBar: { x: 108, y: 500, w: 170 }, speaker: { cx: 192, cy: 440 },
      };
    },
  },

  boombox: {
    name: _('Boombox'), price: 120, note: _('Plays their voice message. Obviously.'),
    build(c) {
      const id = c.id, A = c.accent;
      const sp = (cx) => `<g transform="translate(${cx} 372)"><circle r="59" fill="${c.M}"/><circle r="59" fill="url(#${id}mo)" stroke="#000" stroke-opacity=".4" stroke-width="1.2"/><circle r="51" fill="url(#${id}sp)"/>
<circle r="41" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/><circle r="31" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/><circle r="21" fill="none" stroke="#fff" stroke-opacity=".12" stroke-width="2"/>
<circle r="13" fill="url(#${id}sd)"/><path d="M-40,-18 A44,44 0 0 1 -12,-42" fill="none" stroke="#fff" stroke-opacity=".28" stroke-width="3" stroke-linecap="round"/></g>`;
      const reel = (cx) => `<circle cx="${cx}" cy="270" r="15" fill="#ece6f8"/><circle cx="${cx}" cy="270" r="6" fill="#120f1e"/><path d="M${cx},256 V264 M${cx - 13},277 L${cx - 6},273 M${cx + 13},277 L${cx + 6},273" stroke="#120f1e" stroke-width="3" stroke-linecap="round"/>`;
      let eq = '';
      [20, 34, 26, 40, 18, 30].forEach((h, i) => { eq += `<rect class="dc-eq" style="--i:${i}" x="${284 + i * 10}" y="${296 - h}" width="7" height="${h}" rx="2" fill="${c.led}"/>`; });
      return {
        defs: `<radialGradient id="${id}sp"><stop offset="0" stop-color="#3b3652"/><stop offset=".55" stop-color="#14111f"/><stop offset="1" stop-color="#0a0812"/></radialGradient><radialGradient id="${id}sd" cx=".35" cy=".3"><stop offset="0" stop-color="#fff"/><stop offset="1" stop-color="#8a8498"/></radialGradient>
<linearGradient id="${id}s" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff" stop-opacity="${n(.4 * c.gloss)}"/><stop offset=".2" stop-color="#fff" stop-opacity="0"/><stop offset=".75" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".5"/></linearGradient>
<linearGradient id="${id}v" x1="28" y1="0" x2="372" y2="0" gradientUnits="userSpaceOnUse"><stop offset="0" stop-color="#000" stop-opacity=".5"/><stop offset=".07" stop-color="#000" stop-opacity="0"/><stop offset=".93" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#000" stop-opacity=".55"/></linearGradient>`,
        clip: '<rect x="28" y="222" width="344" height="240" rx="28"/>',
        behind: `<path d="M96,228 V178 Q96,152 122,152 H278 Q304,152 304,178 V228" fill="none" stroke="#000" stroke-opacity=".4" stroke-width="22" stroke-linecap="round" stroke-linejoin="round"/><path d="M96,228 V178 Q96,152 122,152 H278 Q304,152 304,178 V228" fill="none" stroke="${c.M}" stroke-width="16" stroke-linecap="round" stroke-linejoin="round"/><path d="M104,226 V178 Q104,160 122,160 H278" fill="none" stroke="#fff" stroke-opacity=".5" stroke-width="3" stroke-linecap="round"/>` +
          `<path d="M338,226 L374,122" stroke="#000" stroke-opacity=".4" stroke-width="8" stroke-linecap="round"/><path d="M338,226 L374,122" stroke="${c.M}" stroke-width="5" stroke-linecap="round"/><circle cx="374" cy="120" r="8" fill="${A}" stroke="#000" stroke-opacity=".4" stroke-width="1.2"/>` +
          '<rect x="62" y="458" width="46" height="16" rx="6" fill="#15131d"/><rect x="292" y="458" width="46" height="16" rx="6" fill="#15131d"/>',
        shade: `<rect x="28" y="222" width="344" height="240" fill="url(#${id}s)"/><rect x="28" y="222" width="344" height="240" fill="url(#${id}v)"/><path d="M48,226 H352" stroke="#fff" stroke-opacity=".6" stroke-width="2.2" stroke-linecap="round"/>` +
          '<path d="M40,310 H360" stroke="#000" stroke-opacity=".18" stroke-width="2"/>',
        front: sp(92) + sp(308) + mrect(c, 138, 234, 124, 68, 12) + '<rect x="146" y="242" width="108" height="52" rx="8" fill="#120f1e"/><path d="M152,248 H200" stroke="#fff" stroke-opacity=".22" stroke-width="3" stroke-linecap="round"/>' +
          reel(176) + reel(224) + '<path d="M176,285 Q200,291 224,285" stroke="#7a6350" stroke-width="3" fill="none"/>' +
          [150, 178, 206].map((x) => mrect(c, x, 312, 22, 14, 4)).join('') + mrect(c, 234, 312, 22, 14, 4, A) + eq,
        plaque: { cx: 200, cy: 372, w: 92, h: 64 }, qr: { cx: 84, cy: 268, s: 52 },
        floor: { cx: 200, cy: 476, rx: 160 }, ledBar: { x: 70, y: 452, w: 260, inside: true }, speaker: null,
      };
    },
  },

  rocket: {
    name: _('Rocket'), price: 90, note: _('One-way ticket. Flame follows your LED color.'),
    build(c) {
      const id = c.id, A = c.accent, L = c.ledHex;
      const body = 'M200,70 C240,108 264,172 264,240 L264,422 L136,422 L136,240 C136,172 160,108 200,70Z';
      const fin = (sx) => { const x = (v) => 200 + sx * (v - 200); return `<path d="M${x(136)},326 C${x(100)},350 ${x(88)},400 ${x(84)},456 L${x(136)},420Z" fill="${A}"/><path d="M${x(136)},326 C${x(100)},350 ${x(88)},400 ${x(84)},456 L${x(136)},420Z" fill="url(#${id}mo)" stroke="#000" stroke-opacity=".4" stroke-width="1.4" stroke-linejoin="round"/>`; };
      return {
        defs: cyl(id, 136, 264, c.gloss) + vshade(id, .3, .25) +
          `<linearGradient id="${id}fl" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff"/><stop offset=".25" stop-color="${L}"/><stop offset="1" stop-color="${L}" stop-opacity="0"/></linearGradient>
<radialGradient id="${id}gl" cx=".35" cy=".3"><stop offset="0" stop-color="#e9fbff"/><stop offset=".5" stop-color="#6cc7ff"/><stop offset="1" stop-color="#17407a"/></radialGradient>`,
        clip: `<path d="${body}"/>`,
        behind: fin(-1) + fin(1) +
          `<path d="M172,456 C158,500 184,512 200,548 C216,512 242,500 228,456Z" fill="url(#${id}fl)" opacity=".5" filter="url(#${id}b2)"/>`,
        shade: `<rect width="400" height="560" fill="url(#${id}s)"/><rect x="120" y="60" width="160" height="370" fill="url(#${id}v)"/>` + streak(c, 'M158,236 C154,290 154,350 158,400', 8, .55) +
          `<path d="M170,120 C178,100 190,88 198,82" fill="none" stroke="#fff" stroke-opacity="${n(.6 * c.gloss)}" stroke-width="7" stroke-linecap="round" filter="url(#${id}b)"/>`,
        front: mpath(c, 'M158,420 L242,420 L232,456 L168,456Z') + mrect(c, 134, 398, 132, 12, 6, A) +
          `<path d="M174,456 C160,498 186,510 200,546 C214,510 240,498 226,456Z" fill="url(#${id}fl)"/><path d="M186,456 C182,484 194,494 200,516 C206,494 218,484 214,456Z" fill="#fff" opacity=".9"/>` +
          `<circle cx="200" cy="186" r="37" fill="${c.M}"/><circle cx="200" cy="186" r="37" fill="url(#${id}mo)" stroke="#000" stroke-opacity=".4" stroke-width="1.2"/><circle cx="200" cy="186" r="29" fill="url(#${id}gl)" stroke="#000" stroke-opacity=".5" stroke-width="1.4"/><path d="M180,172 A26,26 0 0 1 206,160" fill="none" stroke="#fff" stroke-opacity=".8" stroke-width="4" stroke-linecap="round"/>`,
        plaque: { cx: 200, cy: 288, w: 92, h: 56 }, qr: { cx: 200, cy: 362, s: 38 },
        floor: { cx: 200, cy: 552, rx: 92 }, ledBar: null, speaker: { cx: 200, cy: 428 }, flame: true,
      };
    },
  },
};
export const SHAPE_IDS = Object.keys(SHAPES);

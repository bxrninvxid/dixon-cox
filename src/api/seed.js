// Deterministic demo data. Every name, tribute and number here is invented.
import { makeRng } from '../art/rng.js';
import { SKIN_IDS } from '../art/skins.js';
import { SHAPE_IDS } from '../art/shapes.js';
import { REMIXES } from '../data/catalog.js';

const PEOPLE = [
  ['Marcus “Tank” Reyes', 'human', 'Lived at full volume. Left the same way.'], ['Lucy Park', 'human', 'Net-runner, tea snob, best aunt alive.'],
  ['Big Dee', 'human', 'Pressed his own last record. Track one is a burp.'], ['Grandma Rosa', 'human', 'Ninety-one years. Zero regrets. Hot sauce in everything.'],
  ['Kenji “Zero” Mori', 'human', 'Gamer to the end. Final boss: us.'], ['Pixel', 'pet', 'Best boy. Fetched every stick in the county.'],
  ['Olena Kovalenko', 'human', 'Borscht champion, karaoke menace, unstoppable.'], ['Sir Biscuit', 'pet', 'Three-legged legend. Bossed the whole street.'],
  ['Andriy Melnyk', 'human', 'Drove a rusty van to every festival there was.'], ['Mabel Okafor', 'human', 'Taught half the town to dance. The other half learned anyway.'],
  ['Dmytro “DJ Zhuk” Hrytsenko', 'human', 'Left the dance floor in better shape than he found it.'], ['Noodle', 'pet', 'Fastest cat on the block. Slowest at coming home.'],
  ['Ivy Chen', 'human', 'Plant whisperer. Her jungle is now ours to water.'], ['Captain Joe Barlow', 'human', 'Sailed everywhere, arrived on time nowhere.'],
  ['Sofiia Bondar', 'human', 'Cartoonist. Drew a smile on every receipt.'], ['Rex', 'pet', 'Guard dog who greeted burglars with a lick.'],
  ['Hana Takeda', 'human', 'Ramen alchemist. Closed the shop at 3 a.m. daily.'], ['Old Pete', 'human', 'Told the same joke for fifty years. Still funny.'],
  ['Zoya Marchenko', 'human', 'Rode a motorbike into her eighties.'], ['Mochi', 'pet', 'Sleeps in the sun forever now.'],
  ['Viktor Lysenko', 'human', 'Bad at chess, great at friends.'], ['Dana Whitfield', 'human', 'Punk drummer. Never once on the beat. Always right.'],
  ['Taras Boiko', 'human', 'Built a treehouse bigger than his flat.'], ['Gizmo', 'pet', 'Chaos hamster. Legend of the kitchen.'],
];
const COMMENTS = ['Rest loud, legend.', 'We played your song on repeat all night.', 'Thank you for everything. The fireworks were perfect.', 'Lit a candle and a cigar. Both for you.', 'Best send-off I have ever seen.', 'You are missed and also very loud in our heads.'];

export function seedSendoffs(now = Date.now(), count = PEOPLE.length) {
  const r = makeRng(77);
  const out = [];
  for (let i = 0; i < count; i++) {
    const [name, kind, tribute] = PEOPLE[i % PEOPLE.length];
    const remix = [];
    const n = r.chance(0.55) ? (r.chance(0.3) ? 2 : 1) : 0;
    for (let k = 0; k < n; k++) { const id = r.pick(REMIXES.filter((x) => x.price < 2000)).id; if (!remix.includes(id)) remix.push(id); }
    const skin = SKIN_IDS[(i * 5 + r.i(0, 3)) % SKIN_IDS.length];
    const shape = SHAPE_IDS[(i * 3 + r.i(0, 2)) % SHAPE_IDS.length];
    out.push({
      id: 'sd' + (1000 + i * 37), name, kind, tribute, remix, ts: now - Math.round((i * 3.1 + r.f(0.1, 2)) * 3600e3), minutes: r.i(47, 190),
      design: { shape, skin, seed: r.i(1, 9999), text: name.split(' ')[0].replace(/[“”"]/g, ''), line2: '', font: r.pick(['loud', 'classic', 'deco', 'hand', 'tech']), symbol: kind === 'pet' ? 'paw' : r.pick(['star', 'bolt', 'heart', 'note', 'flame', 'crown']), engrave: r.chance(0.8) ? 'plaque' : 'etch', led: r.pick(['cyan', 'magenta', 'amber', 'lime', 'violet', 'rainbow']), finish: 'gloss', qr: true, speaker: false },
      reactions: { flame: r.i(20, 400), heart: r.i(20, 300), star: r.i(5, 200) },
      comments: r.chance(0.7) ? [{ id: 'c' + i, name: r.pick(['Anya', 'Mike', 'Jo', 'Sam', 'Ira', 'Leo']), text: r.pick(COMMENTS), ts: now - r.i(1, 20) * 3600e3 }] : [],
      candles: r.i(12, 260), playlist: [{ title: 'Dancing Queen', artist: 'ABBA' }, { title: 'Bohemian Rhapsody', artist: 'Queen' }].slice(0, r.i(1, 2)), public: true, live: false,
    });
  }
  return out;
}

// 30-day send-off counts and a weekday x hour heat grid, shaped like real life (evenings busier).
export function seedSeries(now = Date.now()) {
  const r = makeRng(404), days = [];
  for (let i = 29; i >= 0; i--) days.push({ ts: now - i * 86400e3, count: Math.round(310 + i * -1.2 + Math.sin(i / 2.3) * 40 + r.f(-25, 25)) });
  const heat = [];
  for (let d = 0; d < 7; d++) { const row = []; for (let h = 0; h < 24; h++) row.push(Math.max(0, Math.round(6 + 34 * Math.exp(-Math.pow((h - 21) / 4.2, 2)) + 14 * Math.exp(-Math.pow((h - 10) / 3, 2)) + (d >= 5 ? 8 : 0) + r.f(-3, 3)))); heat.push(row); }
  const turnaround = [[47, 90, 138], [90, 120, 360], [120, 180, 520], [180, 240, 410], [240, 360, 190], [360, 600, 60]].map(([a, b, c]) => ({ from: a, to: b, count: c }));
  return { days, heat, turnaround };
}

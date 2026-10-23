import { test } from 'node:test';
import assert from 'node:assert/strict';
import { renderUrn, normalizeDesign, rollDesign, SHAPE_IDS, SKIN_IDS, FONTS } from '../src/art/urn.js';
import { makeRng } from '../src/art/rng.js';

test('rendering is deterministic for the same design', () => {
  const d = { shape: 'orb', skin: 'cosmos', seed: 42, text: 'Nova' };
  assert.equal(renderUrn(d, { id: 'x' }), renderUrn(d, { id: 'x' }));
});
test('seed changes the artwork', () => {
  assert.notEqual(renderUrn({ skin: 'koi', seed: 1 }, { id: 'x' }), renderUrn({ skin: 'koi', seed: 2 }, { id: 'x' }));
});
test('every shape x skin renders valid-looking, id-scoped SVG', () => {
  for (const shape of SHAPE_IDS) for (const skin of SKIN_IDS) {
    const svg = renderUrn({ shape, skin, text: 'Test', symbol: 'star' }, { id: 'q1' });
    assert.ok(svg.startsWith('<svg') && svg.endsWith('</svg>'), `${shape}/${skin}`);
    assert.ok(!/NaN|undefined/.test(svg), `${shape}/${skin} has NaN/undefined`);
    for (const m of svg.matchAll(/url\(#([^)]+)\)/g)) assert.ok(m[1].startsWith('q1'), `unscoped id ${m[1]}`);
  }
});
test('user text is escaped', () => {
  const svg = renderUrn({ text: '<script>alert(1)</script>' }, { id: 'x' });
  assert.ok(!svg.includes('<script>'));
});
test('normalizeDesign repairs junk input', () => {
  const d = normalizeDesign({ shape: 'nope', skin: 7, font: 'x', led: 'x', seed: 'abc', text: 'a'.repeat(99) });
  assert.ok(SHAPE_IDS.includes(d.shape) && SKIN_IDS.includes(d.skin) && FONTS[d.font]);
  assert.equal(d.text.length, 28);
  assert.equal(Number.isFinite(d.seed), true);
});
test('the dice roll is seeded and tier-weighted', () => {
  const r = makeRng(5), tiers = [0, 0, 0, 0];
  for (let i = 0; i < 2000; i++) tiers[{ tora: 0, bubblegum: 0, arcade: 0, dunes: 0, stars: 1, sticker: 1, sakura: 1, koi: 1, chrome: 2, cosmos: 2, gold: 3, holo: 3 }[rollDesign(r.next).skin]]++;
  assert.ok(tiers[0] > tiers[1] && tiers[1] > tiers[2] && tiers[2] > tiers[3], tiers.join(','));
});

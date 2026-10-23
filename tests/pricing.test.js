import { test } from 'node:test';
import assert from 'node:assert/strict';
import { quote, designPrice, remixPrice } from '../src/lib/pricing.js';
import { emptyBooking } from '../src/lib/store.js';

const design = { shape: 'amphora', skin: 'tora', text: '', line2: '', symbol: 'none', led: 'cyan' };

test('a plain amphora in a common skin is free', () => { assert.equal(designPrice(design), 0); });
test('rarity and shape change the price', () => {
  assert.equal(designPrice({ ...design, skin: 'gold' }), 149);
  assert.equal(designPrice({ ...design, shape: 'boombox' }), 120);
});
test('engraving, rainbow LED and art each add a fee', () => {
  assert.equal(designPrice({ ...design, text: 'Hi' }), 29);
  assert.equal(designPrice({ ...design, led: 'rainbow' }), 25);
  assert.equal(designPrice({ ...design, art: 'data:image/png;base64,AA' }), 15);
});
test('boombox includes its speaker for free', () => { assert.equal(designPrice({ ...design, shape: 'boombox', speaker: true }), 120); });
test('remix variants add to the base price', () => {
  assert.equal(remixPrice('vinyl', '7'), 249);
  assert.equal(remixPrice('vinyl', '12'), 339);
  assert.equal(remixPrice('nope', 'x'), 0);
});
test('a full booking quote adds up', () => {
  const b = { ...emptyBooking(), pick: 'courier', vehicle: 'van', slot: 'express', remix: { keychain: { variant: 'gold' } }, livestream: true };
  const q = quote(b, design);
  assert.equal(q.total, 299 + 99 + 49 + 59 + 30 + 39);
  assert.equal(q.points, Math.floor(q.total / 10));
});
test('gift codes: percent, flat and pet-only', () => {
  const base = { ...emptyBooking(), pick: 'courier', slot: 'tonight' };
  const full = quote(base, design).subtotal;
  assert.equal(quote({ ...base, code: 'loud10' }, design).discount, Math.round(full * 10) / 100);
  assert.equal(quote({ ...base, code: 'LEGEND25' }, design).discount, 25);
  assert.equal(quote({ ...base, code: 'GOODBOY' }, design).codeInvalid, true);
  assert.equal(quote({ ...base, kind: 'pet', code: 'GOODBOY' }, design).codeInvalid, false);
  assert.equal(quote({ ...base, code: 'NOPE' }, design).codeInvalid, true);
});
test('pre-plan has no base price, pick-up or express fee', () => {
  const q = quote({ ...emptyBooking(), mode: 'plan', slot: 'express' }, design);
  assert.equal(q.total, 0);
  assert.equal(q.plan, true);
});
test('installments split the total', () => {
  const q = quote({ ...emptyBooking(), pick: 'cell' }, design);
  assert.ok(Math.abs(q.installments[3] * 3 - q.total) < 0.02);
});

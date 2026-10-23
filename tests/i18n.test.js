import { test } from 'node:test';
import assert from 'node:assert/strict';
import { t, setLang, registerLocale } from '../src/lib/i18n.js';
import { uk } from '../src/locales/uk.js';
import { extract } from '../scripts/check-i18n.mjs';

registerLocale('uk', uk);
test('every source string has a Ukrainian translation', () => {
  const missing = extract().filter((s) => !(s in uk));
  assert.deepEqual(missing, []);
});
test('placeholders survive translation', () => {
  for (const [en, ua] of Object.entries(uk)) {
    const a = (en.match(/\{\w+\}/g) || []).sort().join(), b = (ua.match(/\{\w+\}/g) || []).sort().join();
    assert.equal(b, a, `placeholders differ for "${en}"`);
  }
});
test('t() interpolates and falls back to English', () => {
  setLang('en'); assert.equal(t('{n} min', { n: 5 }), '5 min');
  setLang('uk'); assert.equal(t('{n} min', { n: 5 }), '5 хв');
  assert.equal(t('Not in the dictionary'), 'Not in the dictionary');
  setLang('en');
});
test('no Russian-only letters slipped into the Ukrainian dictionary', () => {
  for (const [en, ua] of Object.entries(uk)) assert.ok(!/[ыэёъ]/i.test(ua), `Russian letter in "${en}"`);
});

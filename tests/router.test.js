import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseHash, matchRoute } from '../src/lib/router.js';
import { encodeDesign, decodeDesign } from '../src/lib/share.js';

const TABLE = [['/', 'home'], ['/m/:id', 'memorial'], ['/vote/:id', 'vote']];
test('parseHash splits path and query', () => {
  assert.deepEqual(parseHash('#/track?code=DX-1'), { path: '/track', query: { code: 'DX-1' } });
  assert.deepEqual(parseHash(''), { path: '/', query: {} });
  assert.equal(parseHash('#//a//b/').path, '/a/b');
});
test('matchRoute extracts params and rejects strangers', () => {
  assert.deepEqual(matchRoute(TABLE, '/m/sd9'), { name: 'memorial', params: { id: 'sd9' } });
  assert.deepEqual(matchRoute(TABLE, '/m/a%20b').params, { id: 'a b' });
  assert.equal(matchRoute(TABLE, '/nope'), null);
  assert.equal(matchRoute(TABLE, '/m'), null);
});
test('share links round-trip a design, including unicode, without the artwork', () => {
  const d = { shape: 'rocket', skin: 'holo', seed: 77, text: 'Олена ☆', line2: '', art: 'data:xx' };
  const back = decodeDesign(encodeDesign(d));
  assert.equal(back.text, 'Олена ☆'); assert.equal(back.shape, 'rocket'); assert.equal(back.art, null);
  assert.equal(decodeDesign('%%%garbage'), null);
});

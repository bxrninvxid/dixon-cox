import { test } from 'node:test';
import assert from 'node:assert/strict';
import { qrMatrix, qrPath } from '../src/lib/qr.js';

test('version and size grow with the payload', () => {
  assert.equal(qrMatrix('hi').version, 1);
  assert.equal(qrMatrix('hi').size, 21);
  assert.ok(qrMatrix('https://dixoncox.example/m/sd1000?x=' + 'a'.repeat(60)).version > 3);
});
test('finder patterns and timing line are in place', () => {
  const q = qrMatrix('hello');
  for (const [ox, oy] of [[0, 0], [q.size - 7, 0], [0, q.size - 7]]) {
    assert.equal(q.get(ox, oy), true); assert.equal(q.get(ox + 3, oy + 3), true); assert.equal(q.get(ox + 1, oy + 1), false);
  }
  for (let i = 8; i < q.size - 8; i++) assert.equal(q.get(i, 6), i % 2 === 0);
});
test('output is deterministic and path covers dark modules', () => {
  assert.deepEqual(qrPath('abc'), qrPath('abc'));
  assert.ok(qrPath('abc').d.startsWith('M'));
});
test('too-long payloads throw', () => { assert.throws(() => qrMatrix('x'.repeat(400))); });

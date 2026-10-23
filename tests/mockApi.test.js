import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as api from '../src/api/mockApi.js';
import { stageOf, STAGE_OFFSETS } from '../src/api/mockApi.js';
import { writeTribute } from '../src/lib/tribute.js';

api.setLatency(0);
const order = (o = {}) => api.createOrder({ name: 'Test Legend', kind: 'human', pick: 'courier', design: {}, total: 100, ...o });

test('stages advance with the demo clock', () => {
  const o = { createdAt: 1000, pick: 'courier' };
  STAGE_OFFSETS.forEach((s, i) => assert.equal(stageOf(o, 1000 + s * 1000 + 1), i));
  assert.equal(stageOf({ plan: true, createdAt: 0 }), -1);
});
test('cell orders wait in the cell until collected', () => {
  const o = { createdAt: 0, pick: 'cell', collected: false };
  assert.equal(stageOf(o, 1e9), 3);
  assert.equal(stageOf({ ...o, collected: true }, 1e9), 4);
});
test('orders need a name', async () => { await assert.rejects(api.createOrder({ name: '  ' })); });
test('the locker flow: not ready, wrong pin, right pin', async () => {
  const { order: o } = await order({ pick: 'cell', point: 'nm', cell: 'A1' });
  assert.match(o.pin, /^\d{6}$/);
  assert.equal((await api.unlockCell(o.code, o.pin)).reason, 'not-ready');
  await api.skipOrder(o.code); await api.skipOrder(o.code); await api.skipOrder(o.code);
  assert.equal((await api.unlockCell(o.code, '000000')).reason === 'bad-pin' || o.pin === '000000', true);
  const r = await api.unlockCell(o.code, o.pin);
  assert.equal(r.ok, true);
  assert.equal((await api.getOrder(o.code)).stage, 4);
});
test('booked cells disappear from the free list', async () => {
  const before = (await api.getPoints()).find((p) => p.id === 'hg').free.length;
  const { order: o } = await order({ pick: 'cell', point: 'hg', cell: (await api.getPoints()).find((p) => p.id === 'hg').free[0] });
  assert.equal((await api.getPoints()).find((p) => p.id === 'hg').free.length, before - 1);
  assert.ok(o.code.startsWith('DX-'));
});
test('pre-plans have no pin and no stage', async () => {
  const { order: o } = await order({ mode: 'plan' });
  assert.equal(o.plan, true); assert.equal(o.pin, null); assert.equal(o.stage, -1);
});
test('feed: filters, reactions, candles, comments', async () => {
  const pets = await api.listSendoffs({ kind: 'pet' });
  assert.ok(pets.length > 0 && pets.every((s) => s.kind === 'pet'));
  const id = pets[0].id, flame = pets[0].reactions.flame;
  assert.equal((await api.react(id, 'flame')).flame, flame + 1);
  assert.equal((await api.unreact(id, 'flame')).flame, flame);
  const c = (await api.getSendoff(id)).candles;
  assert.equal(await api.lightCandle(id), c + 1);
  const cs = await api.addComment(id, { name: 'T', text: ' hello ' });
  assert.equal(cs[0].text, 'hello');
  await assert.rejects(api.addComment(id, { text: '   ' }));
});
test('private send-offs stay out of the feed', async () => {
  const { sendoff } = await order({ publicFeed: false, name: 'Hidden One' });
  assert.ok(!(await api.listSendoffs({ limit: 200 })).some((s) => s.id === sendoff.id));
  assert.equal((await api.getSendoff(sendoff.id)).name, 'Hidden One');
});
test('stats are consistent', async () => {
  const s = await api.getStats();
  assert.ok(s.total >= api.BASE_TOTAL); assert.equal(s.days.length, 30); assert.equal(s.heat.length, 7); assert.equal(s.fastest, 47);
});
test('polls count votes', async () => {
  const p = await api.createPoll({ title: 'x', options: [{ label: 'a', design: {} }, { label: 'b', design: {} }] });
  await api.votePoll(p.id, 1); const after = await api.votePoll(p.id, 1);
  assert.equal(after.options[1].votes, 2); assert.equal(await api.votePoll(p.id, 9), null);
});
test('tribute writer is bilingual and uses the name', () => {
  const en = writeTribute({ name: 'Ada Lane', traits: ['karaoke'], lang: 'en' }), uk = writeTribute({ name: 'Ада Лейн', traits: ['karaoke'], lang: 'uk' });
  assert.match(en, /Ada/); assert.match(uk, /Ада/); assert.match(uk, /[а-яі]/);
  assert.notEqual(writeTribute({ name: 'A', pick: 0 }), writeTribute({ name: 'A', pick: 1 }));
});

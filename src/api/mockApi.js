// The "backend". Everything the UI needs is an async function here, so swapping in a real
// server means re-implementing this one file. State lives in localStorage (db) so orders,
// candles and votes survive reloads. Latency is simulated; nothing leaves the browser.
import { SKIN_IDS } from '../art/skins.js';
import { normalizeDesign } from '../art/urn.js';
import { DROP_POINTS, CELL_IDS, REMIXES } from '../data/catalog.js';
import { seedSendoffs, seedSeries } from './seed.js';

const KEY = 'dixoncox.db.v1';
export const BASE_TOTAL = 12847;
export const STAGE_OFFSETS = [0, 20, 55, 90, 150]; // seconds; the demo clock runs fast on purpose
export const STAGES = ['received', 'processing', 'ready', 'transit', 'done'];
let latency = [120, 320];
export const setLatency = (a, b = a) => { latency = [a, b]; };
const wait = () => new Promise((r) => setTimeout(r, latency[0] + Math.random() * (latency[1] - latency[0])));

let mem = null;
let storage = null;
try { storage = typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { storage = null; }

function fresh() { return { sendoffs: [], orders: [], polls: [], plans: [], seeded: Date.now() }; }
function db() {
  if (mem) return mem;
  try { const raw = storage && storage.getItem(KEY); if (raw) mem = JSON.parse(raw); } catch (e) { mem = null; }
  if (!mem) mem = fresh();
  return mem;
}
function save() { try { if (storage) storage.setItem(KEY, JSON.stringify(mem, (k, v) => (k === 'art' ? null : v))); } catch (e) { /* ignore quota */ } }
const seeded = () => seedSendoffs(db().seeded);
const allSendoffs = () => { const own = db().sendoffs, ids = new Set(own.map((s) => s.id)); return [...own, ...seeded().filter((s) => !ids.has(s.id))]; };
const uid = (p) => p + Math.random().toString(36).slice(2, 8);
const code = () => 'DX-' + Math.random().toString(36).slice(2, 6).toUpperCase() + Math.floor(100 + Math.random() * 900);
const pin = () => String(Math.floor(100000 + Math.random() * 900000));

export function stageOf(order, now = Date.now()) {
  if (order.plan) return -1;
  const el = (now - order.createdAt) / 1000;
  let s = 0;
  STAGE_OFFSETS.forEach((o, i) => { if (el >= o) s = i; });
  if (order.pick === 'cell' && !order.collected) s = Math.min(s, 3);
  if (order.pick === 'cell' && order.collected) s = 4;
  return s;
}
const view = (o) => ({ ...o, stage: stageOf(o), stageName: STAGES[Math.max(0, stageOf(o))] });

export async function getStats() {
  await wait();
  const all = allSendoffs(), own = db().orders.filter((o) => !o.plan).length, series = seedSeries(db().seeded);
  const skinCount = Object.fromEntries(SKIN_IDS.map((id) => [id, 0]));
  const remixCount = Object.fromEntries(REMIXES.map((r) => [r.id, 0]));
  // scale seeded feed counts up to believable totals, then add real activity
  all.forEach((s) => { skinCount[s.design.skin] += 1; s.remix.forEach((r) => { remixCount[r] += 1; }); });
  const base = { tora: 1820, bubblegum: 1210, arcade: 1560, dunes: 1380, stars: 980, sticker: 1130, sakura: 1740, koi: 1990, chrome: 760, cosmos: 1210, gold: 520, holo: 470 };
  const rbase = { vinyl: 3100, keychain: 2400, figurine: 1800, diamond: 420, ink: 1250, fireworks: 2750, orb: 1100, nature: 640, space: 95, pendant: 1500 };
  const skins = SKIN_IDS.map((id) => ({ id, count: base[id] + skinCount[id] * 6 })).sort((a, b) => b.count - a.count);
  const remix = REMIXES.map((r) => ({ id: r.id, count: rbase[r.id] + remixCount[r.id] * 5 })).sort((a, b) => b.count - a.count);
  const fastest = Math.min(47, ...db().sendoffs.map((s) => s.minutes || 999));
  const top = allSendoffs().sort((a, b) => b.reactions.flame + b.reactions.star * 2 - (a.reactions.flame + a.reactions.star * 2))[0];
  return { total: BASE_TOTAL + db().sendoffs.length + own, fastest, skins, remix, ...series, top: { id: top.id, name: top.name, reactions: top.reactions } };
}
export async function listSendoffs({ kind = 'all', remix = 'all', sort = 'new', limit = 40 } = {}) {
  await wait();
  let l = allSendoffs().filter((s) => s.public);
  if (kind !== 'all') l = l.filter((s) => s.kind === kind);
  if (remix !== 'all') l = l.filter((s) => s.remix.includes(remix));
  l.sort(sort === 'hot' ? (a, b) => b.reactions.flame + b.reactions.star * 2 + b.reactions.heart - (a.reactions.flame + a.reactions.star * 2 + a.reactions.heart) : (a, b) => b.ts - a.ts);
  return l.slice(0, limit);
}
export async function getSendoff(id) { await wait(); return allSendoffs().find((s) => s.id === id) || null; }

function findMutable(id) {
  const own = db().sendoffs.find((s) => s.id === id);
  if (own) return own;
  const s = seeded().find((x) => x.id === id);
  if (!s) return null;
  db().sendoffs.push({ ...s, seedClone: true, ts: s.ts }); // clone a seeded one so it can be mutated, then hide the original
  return db().sendoffs[db().sendoffs.length - 1];
}
function dedupe() { const seen = new Set(); db().sendoffs = db().sendoffs.filter((s) => (seen.has(s.id) ? false : seen.add(s.id))); }
function mutate(id, fn) {
  const s = findMutable(id);
  if (!s) return null;
  fn(s); dedupe(); save(); return s;
}
export async function react(id, kind) { await wait(); const s = mutate(id, (x) => { x.reactions[kind] = (x.reactions[kind] || 0) + 1; }); return s && s.reactions; }
export async function unreact(id, kind) { await wait(); const s = mutate(id, (x) => { x.reactions[kind] = Math.max(0, (x.reactions[kind] || 0) - 1); }); return s && s.reactions; }
export async function lightCandle(id) { await wait(); const s = mutate(id, (x) => { x.candles += 1; }); return s && s.candles; }
export async function addComment(id, { name, text }) {
  await wait();
  const clean = String(text || '').trim().slice(0, 240);
  if (!clean) throw new Error('empty');
  const s = mutate(id, (x) => { x.comments.unshift({ id: uid('c'), name: String(name || 'Anon').slice(0, 30) || 'Anon', text: clean, ts: Date.now() }); });
  return s && s.comments;
}

export async function createOrder(p) {
  await wait();
  if (!p || !String(p.name || '').trim()) throw new Error('A name is required');
  const plan = p.mode === 'plan';
  const sendoff = {
    id: uid('sd'), name: p.name.trim().slice(0, 60), kind: p.kind === 'pet' ? 'pet' : 'human', tribute: String(p.tribute || '').slice(0, 280), years: p.years || '',
    remix: Object.keys(p.remix || {}), design: normalizeDesign(p.design), ts: Date.now(), minutes: null, reactions: { flame: 0, heart: 0, star: 0 }, comments: [], candles: 1,
    playlist: (p.playlist || []).slice(0, 30), public: !!p.publicFeed && !plan, live: !!p.livestream, plan,
  };
  db().sendoffs.unshift(sendoff);
  const order = {
    code: code(), sendoffId: sendoff.id, plan, createdAt: Date.now(), pick: plan ? null : p.pick, vehicle: p.vehicle, address: p.address, point: p.point, cell: p.cell,
    pin: !plan && p.pick === 'cell' ? pin() : null, slot: p.slot, total: p.total, lines: p.lines || [], name: sendoff.name, collected: false,
  };
  db().orders.unshift(order);
  save();
  return { order: view(order), sendoff };
}
export async function getOrder(c) {
  await wait();
  const o = db().orders.find((x) => x.code === String(c || '').trim().toUpperCase());
  return o ? view(o) : null;
}
export async function skipOrder(c) {
  await wait();
  const o = db().orders.find((x) => x.code === c);
  if (!o) return null;
  const el = (Date.now() - o.createdAt) / 1000, next = STAGE_OFFSETS.find((s) => s > el);
  if (next !== undefined) o.createdAt -= (next - el + 0.5) * 1000;
  save(); return view(o);
}
export async function unlockCell(c, attempt) {
  await wait();
  const o = db().orders.find((x) => x.code === c);
  if (!o || o.pick !== 'cell') return { ok: false, reason: 'no-order' };
  if (stageOf(o) < 3) return { ok: false, reason: 'not-ready' };
  if (String(attempt).trim() !== o.pin) return { ok: false, reason: 'bad-pin' };
  o.collected = true; save();
  return { ok: true, order: view(o) };
}
export async function listOrders(codes) { await wait(); return db().orders.filter((o) => codes.includes(o.code)).map(view); }

export async function getPoints() {
  await wait();
  const used = {};
  db().orders.forEach((o) => { if (o.pick === 'cell' && o.cell && !o.collected) (used[o.point] = used[o.point] || []).push(o.cell); });
  return DROP_POINTS.map((p) => {
    const taken = [...new Set([...(p.taken || []), ...(used[p.id] || [])])];
    return { ...p, taken, free: CELL_IDS.filter((c) => !taken.includes(c)), total: CELL_IDS.length };
  });
}

export async function createPoll({ title, options }) {
  await wait();
  const poll = { id: uid('vt'), title: String(title || '').slice(0, 80), options: options.slice(0, 4).map((o) => ({ label: o.label, design: normalizeDesign(o.design), votes: 0 })), created: Date.now() };
  db().polls.unshift(poll); save();
  return poll;
}
export async function getPoll(id) { await wait(); return db().polls.find((p) => p.id === id) || null; }
export async function votePoll(id, idx) { await wait(); const p = db().polls.find((x) => x.id === id); if (!p || !p.options[idx]) return null; p.options[idx].votes += 1; save(); return p; }

export function resetDb() { mem = fresh(); save(); }

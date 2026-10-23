// App state: one tiny observable store, persisted to localStorage.
import { DEFAULT_DESIGN } from '../art/urn.js';

const KEY = 'dixoncox.state.v1';

export const emptyBooking = () => ({
  step: 0, mode: 'now', kind: 'human', name: '', years: '', tribute: '', contact: '', publicFeed: false,
  design: null, remix: {}, // remix: { vinyl: { variant: '7', note: '' } }
  livestream: false, fireworksAt: '', guests: 12, playlist: [], partners: {},
  pick: 'courier', vehicle: 'van', address: '', point: 'nm', cell: null,
  slot: 'tonight', day: 0, signature: '', signedName: '', agree: false,
  code: '', pay: 'full',
});
const defaults = () => ({
  lang: 'en', design: { ...DEFAULT_DESIGN, text: '', line2: '' }, garage: [], booking: emptyBooking(),
  bag: [], orders: [], points: 0, mine: [], voted: {}, reacted: {}, lit: {}, name: '', refCode: '',
});

let state = defaults();
const subs = new Set();
let storage = null;
try { storage = typeof localStorage !== 'undefined' ? localStorage : null; } catch (e) { storage = null; }

// Uploaded art (data URLs) is never persisted: it can exceed the storage quota.
function serialize() {
  const s = JSON.parse(JSON.stringify(state, (k, v) => (k === 'art' ? null : v)));
  return JSON.stringify(s);
}
export function load() {
  try {
    const raw = storage && storage.getItem(KEY);
    if (raw) state = { ...defaults(), ...JSON.parse(raw) };
    state.booking = { ...emptyBooking(), ...state.booking };
  } catch (e) { state = defaults(); }
  if (!state.refCode) state.refCode = 'DX-' + Math.random().toString(36).slice(2, 6).toUpperCase();
  return state;
}
export const getState = () => state;
export function setState(patch) {
  const p = typeof patch === 'function' ? patch(state) : patch;
  state = { ...state, ...p };
  try { if (storage) storage.setItem(KEY, serialize()); } catch (e) { /* quota or private mode: ignore */ }
  subs.forEach((f) => f(state));
}
export function subscribe(fn) { subs.add(fn); return () => subs.delete(fn); }
export function resetState() { state = defaults(); try { if (storage) storage.removeItem(KEY); } catch (e) { /* ignore */ } subs.forEach((f) => f(state)); }
export function patchBooking(p) { setState({ booking: { ...state.booking, ...p } }); }
export function patchDesign(p) { setState({ design: { ...state.design, ...p } }); }

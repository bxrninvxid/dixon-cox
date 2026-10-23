// Share links: a design is a tiny JSON object, so it travels fine inside the URL hash.
import { normalizeDesign } from '../art/urn.js';

const KEYS = ['shape', 'skin', 'seed', 'text', 'line2', 'font', 'symbol', 'engrave', 'led', 'finish', 'qr', 'speaker'];
const b64 = (s) => btoa(unescape(encodeURIComponent(s))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
const unb64 = (s) => decodeURIComponent(escape(atob(s.replace(/-/g, '+').replace(/_/g, '/'))));

export function encodeDesign(design) {
  const d = normalizeDesign(design), o = {};
  KEYS.forEach((k) => { o[k] = d[k]; });
  return b64(JSON.stringify(o));
}
export function decodeDesign(str) {
  try { return normalizeDesign(JSON.parse(unb64(String(str)))); } catch (e) { return null; }
}
export const studioLink = (design) => `#/studio?d=${encodeDesign(design)}`;
export const shareUrl = (design) => `${location.origin}${location.pathname}${studioLink(design)}`;

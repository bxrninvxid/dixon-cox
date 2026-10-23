// Pure pricing: given a booking, produce itemised lines and totals. Nothing is ever charged.
import { t } from './i18n.js';
import { SHAPES } from '../art/shapes.js';
import { SKINS, RARITY } from '../art/skins.js';
import { normalizeDesign } from '../art/urn.js';
import {
  BASE_PRICE, EXPRESS_FEE, LIVESTREAM_FEE, ENGRAVING_FEE, SPEAKER_FEE, ART_FEE, RAINBOW_FEE,
  REMIXES, PARTNERS, VEHICLES, SLOTS, GIFT_CODES, remixById,
} from '../data/catalog.js';

export function designLines(design) {
  const d = normalizeDesign(design), lines = [];
  const shape = SHAPES[d.shape], skin = SKINS[d.skin], rar = RARITY[skin.rarity];
  lines.push({ key: 'shape', label: t('Urn: {name}', { name: t(shape.name) }), amount: shape.price });
  lines.push({ key: 'skin', label: t('Skin: {name} ({tier})', { name: t(skin.name), tier: t(rar.name) }), amount: rar.price });
  if (d.engrave !== 'none' && (d.text.trim() || d.line2.trim() || d.symbol !== 'none')) lines.push({ key: 'engrave', label: t('Engraving'), amount: ENGRAVING_FEE });
  if (d.led === 'rainbow') lines.push({ key: 'led', label: t('Rainbow LED base'), amount: RAINBOW_FEE });
  if (d.speaker && d.shape !== 'boombox') lines.push({ key: 'speaker', label: t('Speaker chip'), amount: SPEAKER_FEE });
  if (d.art) lines.push({ key: 'art', label: t('Your own artwork'), amount: ART_FEE });
  return lines;
}
export const designPrice = (design) => designLines(design).reduce((a, l) => a + l.amount, 0);

export function remixPrice(id, variantId) {
  const r = remixById(id);
  if (!r) return 0;
  const v = r.variants.find((x) => x.id === variantId) || r.variants[0];
  return r.price + v.price;
}

export function quote(b, design) {
  const plan = b.mode === 'plan';
  const lines = [];
  if (!plan) {
    lines.push({ key: 'base', label: b.kind === 'pet' ? t('Fast pet cremation') : t('Fast cremation'), amount: BASE_PRICE[b.kind] || BASE_PRICE.human });
    const slot = SLOTS.find((s) => s.id === b.slot);
    if (slot && slot.fee) lines.push({ key: 'express', label: t('Express slot'), amount: EXPRESS_FEE });
  }
  designLines(design || b.design || {}).forEach((l) => lines.push(l));
  for (const [id, v] of Object.entries(b.remix || {})) {
    const r = remixById(id);
    if (!r) continue;
    const variant = r.variants.find((x) => x.id === v.variant) || r.variants[0];
    lines.push({ key: 'remix-' + id, label: `${t(r.name)} (${t(variant.label)})`, amount: r.price + variant.price });
  }
  if (b.livestream) lines.push({ key: 'live', label: t('Livestream with chat'), amount: LIVESTREAM_FEE });
  for (const p of PARTNERS) if (b.partners && b.partners[p.id]) lines.push({ key: 'partner-' + p.id, label: t(p.name), amount: p.price });
  if (!plan && b.pick === 'courier') {
    const v = VEHICLES.find((x) => x.id === b.vehicle) || VEHICLES[0];
    lines.push({ key: 'courier', label: `${t('Courier')}: ${t(v.name)}`, amount: v.price });
  }
  const subtotal = lines.reduce((a, l) => a + l.amount, 0);
  const code = GIFT_CODES[String(b.code || '').trim().toUpperCase()];
  let discount = 0, codeNote = '';
  if (code && !(code.petOnly && b.kind !== 'pet')) {
    discount = code.pct ? Math.round(subtotal * code.pct) / 100 : Math.min(code.flat, subtotal);
    codeNote = t(code.label);
  }
  const total = Math.max(0, Math.round((subtotal - discount) * 100) / 100);
  return {
    lines, subtotal, discount, codeNote, total, plan,
    points: Math.floor(total / 10),
    installments: { 3: Math.round((total / 3) * 100) / 100, 6: Math.round((total / 6) * 100) / 100 },
    codeInvalid: !!String(b.code || '').trim() && !(code && !(code.petOnly && b.kind !== 'pet')),
  };
}
export { REMIXES };

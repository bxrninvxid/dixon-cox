// Shared building blocks used by several pages.
import { html, raw, cls } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { renderUrn, normalizeDesign } from '../art/urn.js';
import { RARITY, SKINS } from '../art/skins.js';
import { hashStr } from '../art/rng.js';
import { money } from '../lib/format.js';
import { icon } from './icons.js';

let uidN = 0;
const cache = new Map();
// An urn as markup. data-static lets the morpher skip diffing the (large) SVG when nothing changed.
export function urnFig(design, { size = '', animate = false, label = '', cls: c = '' } = {}) {
  const d = normalizeDesign(design);
  const key = JSON.stringify({ ...d, art: d.art ? d.art.length + ':' + d.art.slice(-24) : null, a: animate, l: label });
  const h = hashStr(key).toString(36);
  let base = cache.get(key);
  if (!base) { base = renderUrn(d, { id: 'ZZ', animate, label: label || undefined }); if (cache.size > 160) cache.delete(cache.keys().next().value); cache.set(key, base); }
  const svg = base.split('ZZ').join('u' + h + (++uidN).toString(36));
  return html`<div class="urn-fig ${c}" data-static="${h}" ${size ? raw(`style="--urn-w:${size}"`) : ''}>${raw(svg)}</div>`;
}

export const rarityBadge = (skinId) => {
  const r = RARITY[SKINS[skinId].rarity];
  return html`<span class="rarity r-${r.id}">${t(r.name)}</span>`;
};
export const tierBadge = (i) => html`<span class="rarity r-${RARITY[i].id}">${t(RARITY[i].name)}</span>`;

export const priceTag = (n) => html`<span class="price">${n ? money(n) : t('Free')}</span>`;

export const btn = (label, { on = '', arg = '', ic = '', kind = 'coral', size = '', href = '', disabled = false, extra = '' } = {}) =>
  href
    ? html`<a class="btn btn-${kind} ${size ? 'btn-' + size : ''}" href="${href}">${ic ? icon(ic, 18) : ''}<span>${label}</span></a>`
    : html`<button type="button" class="btn btn-${kind} ${size ? 'btn-' + size : ''}" ${on ? raw(`data-on-click="${on}"`) : ''} ${arg !== '' ? raw(`data-arg="${String(arg).replace(/"/g, '&quot;')}"`) : ''} ${disabled ? raw('disabled') : ''} ${raw(extra)}>${ic ? icon(ic, 18) : ''}<span>${label}</span></button>`;

export const chip = (label, { on = '', arg = '', active = false, sub = '', cls: c = '', extra = '' } = {}) =>
  html`<button type="button" class="chip ${active ? 'on' : ''} ${c}" aria-pressed="${active ? 'true' : 'false'}" data-on-click="${on}" data-arg="${arg}" ${raw(extra)}><span>${label}</span>${sub ? html`<small>${sub}</small>` : ''}</button>`;

export const sectionHead = (title, sub = '', right = '') => html`<div class="sec-head"><div><h2>${title}</h2>${sub ? html`<p class="lede">${sub}</p>` : ''}</div>${right}</div>`;

export const stat = (value, label, color = 'violet') => html`<div class="stat stat-${color}"><b>${value}</b><span>${label}</span></div>`;

export const empty = (title, body, action = '') => html`<div class="empty"><h3>${title}</h3><p>${body}</p>${action}</div>`;

export const modal = (title, body, { close = 'closeModal', wide = false } = {}) => html`
<div class="modal-back" data-on-click="${close}" data-arg="back"><div class="modal ${wide ? 'wide' : ''}" role="dialog" aria-modal="true" aria-label="${title}" data-on-click="noop">
<div class="modal-head"><h3>${title}</h3><button type="button" class="icon-btn" data-on-click="${close}" aria-label="${t('Close')}">${icon('x')}</button></div>${body}</div></div>`;

export const field = (label, control, hint = '') => html`<label class="field"><span class="field-l">${label}</span>${control}${hint ? html`<small>${hint}</small>` : ''}</label>`;
export { cls };

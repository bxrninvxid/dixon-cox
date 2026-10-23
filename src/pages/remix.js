import { html, raw } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { money } from '../lib/format.js';
import { getState, patchBooking } from '../lib/store.js';
import { REMIXES } from '../data/catalog.js';
import { remixPrice } from '../lib/pricing.js';
import { remixArt } from '../art/remixArt.js';
import { btn, chip, field } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/fx.js';

const TONES = ['violet', 'coral', 'mint', 'sun', 'sky', 'pink'];
export function remixCards(booking, pick, { actions = true } = {}) {
  return REMIXES.map((r, i) => {
    const cur = booking.remix[r.id], vid = (pick[r.id] && pick[r.id].variant) || (cur && cur.variant) || r.variants[0].id;
    const note = (pick[r.id] && pick[r.id].note) ?? (cur && cur.note) ?? '';
    return html`<article class="card remix-card tone-${TONES[i % 6]} ${cur ? 'added' : ''}" data-key="${r.id}">
<div class="remix-art">${html`<span>${raw(remixArt(r.id))}</span>`}${cur ? html`<span class="added-badge">${icon('check', 14)} ${t('Added')}</span>` : ''}</div>
<div class="remix-body"><h3>${t(r.name)}</h3><p>${t(r.blurb)}</p>
<div class="chips">${r.variants.map((v) => chip(t(v.label), { on: 'variant', arg: `${r.id}:${v.id}`, active: vid === v.id, sub: v.price ? '+' + money(v.price) : '' }))}</div>
${r.field ? field(t(r.field.label), html`<input class="input" maxlength="60" value="${note}" data-on-input="note" data-arg="${r.id}" placeholder="${t(r.field.ph)}" autocomplete="off">`) : ''}
<div class="remix-foot"><span class="price big">${money(remixPrice(r.id, vid))}</span>${actions ? (cur ? btn(t('Remove'), { on: 'toggleRemix', arg: r.id, kind: 'ghost', size: 'sm', ic: 'minus' }) : btn(t('Add to booking'), { on: 'toggleRemix', arg: r.id, size: 'sm', ic: 'plus' })) : ''}</div></div></article>`;
  });
}
// Shared handlers so the booking wizard can reuse the same cards.
export function remixHandlers(pick, ctxUpdate) {
  return {
    variant(el) { const [id, v] = el.dataset.arg.split(':'); pick[id] = { ...(pick[id] || {}), variant: v }; const b = getState().booking; if (b.remix[id]) patchBooking({ remix: { ...b.remix, [id]: { ...b.remix[id], variant: v } } }); },
    note(el) { const id = el.dataset.arg; pick[id] = { ...(pick[id] || {}), note: el.value }; const b = getState().booking; if (b.remix[id]) patchBooking({ remix: { ...b.remix, [id]: { ...b.remix[id], note: el.value } } }); },
    toggleRemix(el) {
      const id = el.dataset.arg, b = getState().booking, r = { ...b.remix };
      if (r[id]) { delete r[id]; } else { const p = pick[id] || {}; r[id] = { variant: p.variant || REMIXES.find((x) => x.id === id).variants[0].id, note: p.note || '' }; toast(t('Added to your booking')); }
      patchBooking({ remix: r });
    },
  };
}
export function remixPage(ctx) {
  const pick = {};
  return {
    title: 'Remix', handlers: remixHandlers(pick),
    render() {
      const b = getState().booking, n = Object.keys(b.remix).length;
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Ash remixes')}</h1><p class="lede">${t('Ten ways to keep them around, or send them somewhere spectacular. Pick as many as you like.')}</p></div>
<div class="grid-cards remix-grid">${remixCards(b, pick)}</div>
<div class="sticky-bar ${n ? 'show' : ''}"><span>${t('{n} remix in your booking', { n })}</span>${btn(t('Continue booking'), { href: '#/book', ic: 'arrow' })}</div></div>`;
    },
  };
}

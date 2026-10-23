import { html, raw } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { money } from '../lib/format.js';
import { getState, setState } from '../lib/store.js';
import { MERCH } from '../data/catalog.js';
import { merchArt } from '../art/merch.js';
import { btn, empty } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast } from '../ui/fx.js';

export function shopPage(ctx) {
  const handlers = {
    add(el) { const id = el.dataset.arg, bag = getState().bag.map((x) => ({ ...x })), it = bag.find((x) => x.id === id); if (it) it.qty += 1; else bag.push({ id, qty: 1 }); setState({ bag }); toast(t('Added to bag')); },
    inc(el) { const [id, d] = el.dataset.arg.split(':'); setState({ bag: getState().bag.map((x) => (x.id === id ? { ...x, qty: Math.max(0, x.qty + +d) } : x)).filter((x) => x.qty > 0) }); },
    clear() { setState({ bag: [] }); },
    checkout() { toast(t('Checkout is disabled in this demo. No money moves here.'), 'info'); return false; },
  };
  return {
    title: 'Shop', handlers,
    render() {
      const bag = getState().bag, rows = bag.map((b) => ({ ...b, m: MERCH.find((x) => x.id === b.id) })).filter((r) => r.m), sum = rows.reduce((a, r) => a + r.m.price * r.qty, 0);
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Merch')}</h1><p class="lede">${t('Wear the brand. Be the brand.')}</p></div>
<div class="shop-grid"><div class="grid-cards merch">${MERCH.map((m) => html`<article class="card merch-card"><div class="merch-art">${raw(merchArt(m.id))}</div><h3>${t(m.name)}</h3><div class="remix-foot"><span class="price big">${money(m.price)}</span>${btn(t('Add'), { on: 'add', arg: m.id, size: 'sm', ic: 'plus' })}</div></article>`)}</div>
<aside class="card bag"><h3>${icon('bag', 20)} ${t('Your bag')}</h3>${rows.length ? html`<ul class="lines">${rows.map((r) => html`<li data-key="${r.id}"><span>${t(r.m.name)}</span><span class="qty"><button type="button" class="icon-btn" data-on-click="inc" data-arg="${r.id}:-1" aria-label="${t('Less')}">${icon('minus', 16)}</button><b>${r.qty}</b><button type="button" class="icon-btn" data-on-click="inc" data-arg="${r.id}:1" aria-label="${t('More')}">${icon('plus', 16)}</button></span><b>${money(r.m.price * r.qty)}</b></li>`)}<li class="total"><span>${t('Total')}</span><b>${money(sum)}</b></li></ul>
<div class="stack">${btn(t('Checkout (disabled in demo)'), { on: 'checkout', ic: 'lock' })}${btn(t('Empty bag'), { on: 'clear', kind: 'ghost', size: 'sm' })}</div>` : empty(t('Bag is empty'), t('Add a tee. Go out loud in style.'))}</aside></div></div>`;
    },
  };
}

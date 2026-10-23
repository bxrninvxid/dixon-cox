import { html, raw } from '../lib/view.js';
import { t, _ } from '../lib/i18n.js';
import { money, clock, dateLabel } from '../lib/format.js';
import { getState } from '../lib/store.js';
import { getOrder, getSendoff, skipOrder, unlockCell, listOrders, stageOf, STAGE_OFFSETS } from '../api/mockApi.js';
import { cityMap, buildRoute, pointAt } from '../art/cityMap.js';
import { DROP_POINTS } from '../data/catalog.js';
import { urnFig, btn, field, empty } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { confetti, toast, copyText } from '../ui/fx.js';

const ROUTE = buildRoute();
const LABELS = {
  courier: [[_('Order received'), _('We have it. A coordinator is on it.')], [_('In the flames'), _('The fast lane. No queue.')], [_('Ready'), _('Urn sealed, QR printed, LED tested.')], [_('Courier on the way'), _('Watch the map.')], [_('Delivered'), _('Handed over. Go out loud.')]],
  cell: [[_('Order received'), _('We have it. A coordinator is on it.')], [_('In the flames'), _('The fast lane. No queue.')], [_('Ready'), _('Urn sealed, QR printed, LED tested.')], [_('Waiting in your cell'), _('Punch your code to open the door.')], [_('Collected'), _('Door open, legend picked up.')]],
};

export function trackPage(ctx) {
  let order = null, sendoff = null, loading = false, notFound = false, pin = '', msg = '', recent = [], codeInput = ctx.query.code || '', timer = null, door = false;
  const load = async (code) => {
    loading = true; notFound = false; ctx.update();
    const o = await getOrder(code);
    if (!o) { order = null; notFound = true; loading = false; ctx.update(); return; }
    order = o; sendoff = await getSendoff(o.sendoffId); loading = false; ctx.update();
  };
  if (ctx.query.code) load(ctx.query.code);
  else listOrders(getState().orders).then((l) => { recent = l; ctx.update(); });
  timer = setInterval(() => { if (order) ctx.update(); }, 1000);

  const handlers = {
    codeField(el) { codeInput = el.value; },
    lookup() { const c = codeInput.trim().toUpperCase(); if (c) { ctx.navigate(`/track?code=${c}`); } return false; },
    open(el) { ctx.navigate(`/track?code=${el.dataset.arg}`); return false; },
    key(el) { const k = el.dataset.arg; msg = ''; if (k === 'del') pin = pin.slice(0, -1); else if (pin.length < 6) pin += k; },
    async go() {
      if (pin.length !== 6) { msg = t('Enter all 6 digits'); return; }
      const r = await unlockCell(order.code, pin);
      if (r.ok) { door = true; order = r.order; confetti(innerWidth / 2, innerHeight / 2, 170); msg = ''; pin = ''; }
      else msg = r.reason === 'bad-pin' ? t('Wrong code. Try again.') : t('Not ready yet. Hang tight.');
      ctx.update();
    },
    async skip() { const o = await skipOrder(order.code); if (o) order = o; toast(t('Demo clock skipped ahead')); ctx.update(); },
    async copy(el) { const ok = await copyText(el.dataset.arg); toast(ok ? t('Copied') : t('Could not copy'), ok ? 'ok' : 'warn'); return false; },
    showPin() { door = door; msg = order.pin ? `${t('Demo code')}: ${order.pin}` : ''; },
  };

  function view() {
    const stage = stageOf(order), kind = order.pick === 'cell' ? 'cell' : 'courier', labels = LABELS[kind];
    const el = (Date.now() - order.createdAt) / 1000;
    const prog = Math.min(1, Math.max(0, (el - STAGE_OFFSETS[3]) / (STAGE_OFFSETS[4] - STAGE_OFFSETS[3])));
    const courier = stage >= 3 ? pointAt(ROUTE, stage >= 4 ? 1 : prog) : null;
    const pt = DROP_POINTS.find((p) => p.id === order.point);
    const eta = Math.max(0, Math.ceil(STAGE_OFFSETS[4] - el));
    return html`<div class="track-grid"><section class="card"><div class="track-head"><div><small>${t('Order')}</small><h2>${order.code}</h2></div><button type="button" class="chip" data-on-click="copy" data-arg="${order.code}">${icon('copy', 14)}<span>${t('Copy')}</span></button></div>
<ol class="timeline">${labels.map(([l, s], i) => html`<li class="${i < stage || stage >= 4 ? 'done' : i === stage ? 'now' : ''}"><span class="tl-dot">${i < stage || stage >= 4 ? icon('check', 14) : i + 1}</span><div><b>${t(l)}</b><small>${t(s)}</small></div></li>`)}</ol>
${stage < 4 && kind === 'courier' ? html`<p class="eta">${icon('fast', 16)} ${t('Demo clock: delivery in about {n} s', { n: eta })}</p>` : ''}
<div class="row-gap">${stage < 4 || (kind === 'cell' && !order.collected) ? btn(t('Skip ahead (demo)'), { on: 'skip', kind: 'ghost', size: 'sm', ic: 'fast' }) : ''}${sendoff ? btn(t('Memorial page'), { href: `#/m/${sendoff.id}`, kind: 'ghost', size: 'sm', ic: 'candle' }) : ''}</div></section>
<section class="card">${kind === 'courier' ? html`<h3>${t('Courier tracker')}</h3><div class="map-box">${raw(cityMap({ home: true, depot: true, route: ROUTE, courier }))}</div><p class="muted">${order.address || ''}</p>`
: html`<h3>${t('Your cell')}</h3><p class="muted">${pt ? t(pt.name) + ' · ' + t(pt.addr) : ''}</p>
<div class="locker-door ${order.collected ? 'open' : ''} ${stage >= 3 ? 'ready' : ''}"><div class="door-in">${sendoff ? urnFig(sendoff.design, { size: '110px', animate: order.collected }) : ''}</div><div class="door"><b>${order.cell}</b><i class="cell-led"></i></div></div>
${order.collected ? html`<p class="ok-tag big">${icon('check', 16)} ${t('Door open. Enjoy your legend.')}</p>` : stage < 3 ? html`<p class="muted">${t('The keypad wakes up when your order is ready.')}</p>` : html`
<div class="pin-display" aria-live="polite">${[0, 1, 2, 3, 4, 5].map((i) => html`<span class="${pin[i] ? 'f' : ''}">${pin[i] ? '•' : ''}</span>`)}</div>
<div class="keypad">${['1', '2', '3', '4', '5', '6', '7', '8', '9', 'del', '0', 'go'].map((k) => html`<button type="button" class="key ${k === 'go' ? 'go' : ''}" data-on-click="${k === 'go' ? 'go' : 'key'}" data-arg="${k}" aria-label="${k === 'del' ? t('Delete') : k === 'go' ? t('Unlock') : k}">${k === 'del' ? icon('back', 18) : k === 'go' ? icon('unlock', 20) : k}</button>`)}</div>
${msg ? html`<p class="msg">${msg}</p>` : ''}<button type="button" class="link-sm" data-on-click="showPin">${t('Forgot the code? Show demo code')}</button>`}`}</section>
<section class="card span2"><h3>${t('Receipt')}</h3><ul class="lines">${order.lines.map((l) => html`<li><span>${l.label}</span><b>${money(l.amount)}</b></li>`)}<li class="total"><span>${t('Total')}</span><b>${money(order.total)}</b></li></ul><small class="muted">${t('Demo: nothing was charged.')} ${dateLabel(order.createdAt)} ${clock(order.createdAt)}</small></section></div>`;
  }
  function planView() {
    return html`<div class="card plan-done"><h2>${t('Your plan is on file')}</h2><p class="lede">${t('Nothing is scheduled and nothing was charged. Open the memorial to see how it will look.')}</p>${sendoff ? html`<div class="center">${urnFig(sendoff.design, { size: '160px', animate: true })}</div>` : ''}<div class="cta-row center">${sendoff ? btn(t('Open memorial'), { href: `#/m/${sendoff.id}`, ic: 'candle' }) : ''}${btn(t('Plan another'), { href: '#/book?mode=plan', kind: 'ghost' })}</div></div>`;
  }
  return {
    title: 'Track order', handlers,
    destroy() { clearInterval(timer); },
    render() {
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Track your order')}</h1></div>
<form class="lookup" data-on-submit="lookup"><label class="field"><span class="field-l">${t('Order code')}</span><input class="input" value="${codeInput}" data-on-input="codeField" placeholder="DX-AB12345" autocomplete="off" style="text-transform:uppercase"></label><button type="submit" class="btn btn-coral">${icon('arrow', 18)}<span>${t('Find')}</span></button></form>
${loading ? html`<div class="card skeleton tall"></div>` : notFound ? empty(t('No order with that code'), t('Check the code on your ticket. Demo orders live in this browser only.')) : order ? (order.plan ? planView() : view())
: recent.length ? html`<h3 class="mini-h">${t('Your orders')}</h3><div class="grid-cards">${recent.map((o) => html`<button type="button" class="card opt" data-on-click="open" data-arg="${o.code}"><b>${o.code}</b><span>${o.name}</span><i class="price">${o.plan ? t('Plan') : t([_('Received'), _('Processing'), _('Ready'), _('In transit'), _('Done')][o.stage])}</i></button>`)}</div>` : empty(t('No orders yet'), t('Book a send-off and it will show up here.'), btn(t('Book now'), { href: '#/book', ic: 'calendar' }))}</div>`;
    },
  };
}

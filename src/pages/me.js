import { html } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { dateLabel } from '../lib/format.js';
import { getState, resetState } from '../lib/store.js';
import { listOrders, createPoll, resetDb } from '../api/mockApi.js';
import { POINT_TIERS, PERKS } from '../data/catalog.js';
import { SKINS, SHAPES } from '../art/urn.js';
import { urnFig, btn } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast, copyText } from '../ui/fx.js';

export function mePage(ctx) {
  let orders = [], sel = [], link = '', confirmReset = false;
  listOrders(getState().orders).then((l) => { orders = l; ctx.update(); });
  const handlers = {
    pickG(el) { const id = el.dataset.arg; sel = sel.includes(id) ? sel.filter((x) => x !== id) : sel.length < 4 ? [...sel, id] : sel; },
    async poll() {
      const g = getState().garage.filter((x) => sel.includes(x.id));
      if (g.length < 2) { toast(t('Pick at least two designs'), 'warn'); return false; }
      const p = await createPoll({ title: t('Which urn should we pick?'), options: g.map((x) => ({ label: x.text || t(SKINS[x.skin].name), design: x })) });
      link = `${location.origin}${location.pathname}#/vote/${p.id}`; await copyText(link); toast(t('Vote link copied')); ctx.update(); return false;
    },
    async copyRef() { await copyText(getState().refCode); toast(t('Copied')); return false; },
    askReset() { confirmReset = true; },
    cancelReset() { confirmReset = false; },
    doReset() { resetDb(); resetState(); confirmReset = false; toast(t('Demo data wiped')); },
  };
  return {
    title: 'Legacy', handlers,
    render() {
      const st = getState(), pts = st.points, ti = POINT_TIERS.reduce((a, x, i) => (pts >= x.min ? i : a), 0), nxt = POINT_TIERS[ti + 1];
      const pct = nxt ? Math.round(((pts - POINT_TIERS[ti].min) / (nxt.min - POINT_TIERS[ti].min)) * 100) : 100;
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Legacy points')}</h1><p class="lede">${t('Every send-off earns points. Spend them on perks. Climb the tiers.')}</p></div>
<div class="me-grid"><section class="card tier-card"><small>${t('Tier')}</small><h2>${t(POINT_TIERS[ti].name)}</h2><div class="pts"><b>${pts}</b> ${t('points')}</div>
<div class="bar" role="progressbar" aria-valuenow="${pct}" aria-valuemin="0" aria-valuemax="100"><i style="width:${pct}%"></i></div><small>${nxt ? t('{n} more to {tier}', { n: nxt.min - pts, tier: t(nxt.name) }) : t('Top tier. Immortal.')}</small>
<ul class="perks">${PERKS.map((p) => html`<li class="${pts >= p.points ? 'on' : ''}">${icon(pts >= p.points ? 'check' : 'lock', 16)}<span>${t(p.label)}</span><b>${p.points}</b></li>`)}</ul></section>
<section class="card"><h3>${t('Refer a friend')}</h3><p class="muted">${t('Share your code. Friends get 10% off, you get 50 points. (Demo: nothing is tracked.)')}</p><div class="ref"><code>${st.refCode}</code>${btn(t('Copy'), { on: 'copyRef', kind: 'ghost', size: 'sm', ic: 'copy' })}</div></section>
<section class="card span2"><h3>${t('Family vote')}</h3><p class="muted">${t('Pick 2 to 4 designs from your garage and send the family a voting link.')}</p>
${st.garage.length ? html`<div class="vote-pick">${st.garage.map((g) => html`<button type="button" class="pick ${sel.includes(g.id) ? 'on' : ''}" data-on-click="pickG" data-arg="${g.id}" aria-pressed="${sel.includes(g.id)}">${urnFig(g, { size: '70px' })}<b>${g.text || t(SKINS[g.skin].name)}</b><small>${t(SHAPES[g.shape].name)}</small></button>`)}</div><div class="row-gap">${btn(t('Create vote link'), { on: 'poll', ic: 'share' })}${link ? html`<a class="link-sm" href="${link.slice(link.indexOf('#'))}">${t('Open it')}</a>` : ''}</div>` : html`<p>${t('Save a few designs in the studio first.')} <a href="#/studio">${t('Open studio')}</a></p>`}</section>
<section class="card span2"><h3>${t('Your orders')}</h3>${orders.length ? html`<ul class="orders">${orders.map((o) => html`<li><a href="#/track?code=${o.code}"><b>${o.code}</b><span>${o.name}</span><small>${dateLabel(o.createdAt)}</small></a></li>`)}</ul>` : html`<p class="muted">${t('Nothing yet.')}</p>`}</section>
<section class="card span2"><h3>${t('Demo data')}</h3><p class="muted">${t('Everything lives in this browser. Wipe it to start fresh.')}</p>${confirmReset ? html`<div class="row-gap"><b>${t('Really wipe everything?')}</b>${btn(t('Yes, wipe'), { on: 'doReset', kind: 'coral', size: 'sm' })}${btn(t('Cancel'), { on: 'cancelReset', kind: 'ghost', size: 'sm' })}</div>` : btn(t('Reset demo'), { on: 'askReset', kind: 'ghost', size: 'sm', ic: 'trash' })}</section></div></div>`;
    },
  };
}

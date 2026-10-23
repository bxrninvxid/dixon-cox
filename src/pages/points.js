import { html, raw } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { getPoints } from '../api/mockApi.js';
import { patchBooking } from '../lib/store.js';
import { cityMap } from '../art/cityMap.js';
import { CELL_IDS } from '../data/catalog.js';
import { btn } from '../ui/components.js';

export function pointsPage(ctx) {
  let pts = [], sel = null;
  getPoints().then((p) => { pts = p; sel = sel || p[0].id; ctx.update(); });
  const handlers = {
    pickPoint(el) { sel = el.dataset.arg; },
    bookHere() { patchBooking({ pick: 'cell', point: sel, cell: null, mode: 'now' }); ctx.navigate('/book'); return false; },
  };
  return {
    title: 'Drop points', handlers,
    render() {
      const p = pts.find((x) => x.id === sel);
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Drop points')}</h1><p class="lede">${t('Self-service cells across the city, open 24/7. Book one, get a code, walk up, punch it in.')}</p></div>
<div class="points-grid"><div class="card map-card"><div class="map-box">${pts.length ? raw(cityMap({ points: pts, selected: sel })) : html`<div class="skeleton tall"></div>`}</div></div>
<div class="stack">${pts.map((x) => html`<button type="button" class="card opt pt ${x.id === sel ? 'on' : ''}" data-on-click="pickPoint" data-arg="${x.id}" aria-pressed="${x.id === sel}"><b>${t(x.name)}</b><span>${t(x.addr)}</span><i class="price">${t('{n} of {m} free', { n: x.free.length, m: x.total })}</i></button>`)}
${p ? html`<div class="card"><h3>${t(p.name)}</h3><div class="cells view" role="img" aria-label="${t('Cell availability')}">${CELL_IDS.map((c) => html`<div class="cell ${p.free.includes(c) ? '' : 'taken'}"><span class="cell-id">${c}</span><i class="cell-led"></i></div>`)}</div><div class="row-gap">${btn(t('Book a cell here'), { on: 'bookHere', ic: 'unlock' })}</div></div>` : ''}</div></div></div>`;
    },
  };
}

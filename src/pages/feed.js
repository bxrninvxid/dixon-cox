import { html, raw } from '../lib/view.js';
import { t, getLang, _ } from '../lib/i18n.js';
import { num, dateLabel } from '../lib/format.js';
import { getState, setState } from '../lib/store.js';
import { getStats, listSendoffs, react, unreact } from '../api/mockApi.js';
import { areaChart, donut, heatmap, histogram, SERIES } from '../art/charts.js';
import { REMIXES } from '../data/catalog.js';
import { SKINS, RARITY } from '../art/skins.js';
import { urnFig, chip, stat, sectionHead } from '../ui/components.js';
import { sendoffCard } from '../ui/cards.js';

export function feedPage(ctx) {
  let stats = null, list = [], kind = 'all', remix = 'all', sort = 'new', loading = true;
  getStats().then((s) => { stats = s; ctx.update(); });
  const fetchList = () => { loading = true; listSendoffs({ kind, remix, sort, limit: 24 }).then((l) => { list = l; loading = false; ctx.update(); }); };
  fetchList();
  const handlers = {
    kind(el) { kind = el.dataset.arg; fetchList(); },
    remix(el) { remix = el.dataset.arg; fetchList(); },
    sort(el) { sort = el.dataset.arg; fetchList(); },
    async react(el) {
      const [id, k] = el.dataset.arg.split(':'), key = id + k, on = getState().reacted[key];
      const rx = { ...getState().reacted }; if (on) delete rx[key]; else rx[key] = 1; setState({ reacted: rx });
      const s = list.find((x) => x.id === id); if (s) s.reactions[k] += on ? -1 : 1;
      ctx.update(); await (on ? unreact(id, k) : react(id, k)); return false;
    },
  };
  const days = [_('Mon'), _('Tue'), _('Wed'), _('Thu'), _('Fri'), _('Sat'), _('Sun')];
  return {
    title: 'Feed', handlers,
    render() {
      const st = getState(), uk = getLang() === 'uk';
      const rem = stats ? stats.remix.slice(0, 5).map((r, i) => ({ label: t(REMIXES.find((x) => x.id === r.id).name), value: r.count, color: SERIES[i] })) : [];
      const dn = days.map((d) => t(d));
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${t('Live feed and stats')}</h1><p class="lede">${t('Everything we have done, with the receipts. Names in this demo are made up.')}</p></div>
<div class="stat-row">${stat(stats ? num(stats.total) : '…', t('send-offs'), 'violet')}${stat(stats ? t('{n} min', { n: stats.fastest }) : '…', t('fastest'), 'coral')}${stat(stats ? t('{n}/day', { n: stats.days[29].count }) : '…', t('today'), 'mint')}${stat(stats ? t(SKINS[stats.skins[0].id].name) : '…', t('top skin'), 'sun')}</div>
${stats ? html`<div class="chart-grid">
<section class="card chart span2"><h3>${t('Send-offs per day, last 30 days')}</h3>${raw(areaChart(stats.days, { label: (d) => dateLabel(d.ts, { day: 'numeric', month: 'short' }), fmt: num, today: t('Today') }))}</section>
<section class="card chart"><h3>${t('Most used skins')}</h3><ol class="leader">${stats.skins.slice(0, 5).map((s, i) => html`<li><span class="lb-n">${i + 1}</span>${urnFig({ shape: 'amphora', skin: s.id, seed: 3, text: '', qr: false, symbol: 'none' }, { size: '34px' })}<span class="lb-name">${t(SKINS[s.id].name)}<small class="rarity r-${RARITY[SKINS[s.id].rarity].id}">${t(RARITY[SKINS[s.id].rarity].name)}</small></span><b>${num(s.count)}</b></li>`)}</ol></section>
<section class="card chart"><h3>${t('What people do with the ashes')}</h3><div class="donut-row">${raw(donut(rem, { totalLabel: t('top 5') }))}<ul class="legend">${rem.map((r) => html`<li><i style="background:${r.color}"></i>${r.label}</li>`)}</ul></div></section>
<section class="card chart span2"><h3>${t('Busiest hours')}</h3>${raw(heatmap(stats.heat, { dayNames: dn }))}</section>
<section class="card chart span2"><h3>${t('How fast we are (minutes)')}</h3>${raw(histogram(stats.turnaround, { unit: t('min'), hi: 0 }))}</section></div>` : html`<div class="card skeleton tall"></div>`}
${sectionHead(t('Latest send-offs'))}
<div class="filters"><div class="chips">${[['all', _('Everyone')], ['human', _('People')], ['pet', _('Pets')]].map(([id, l]) => chip(t(l), { on: 'kind', arg: id, active: kind === id }))}</div>
<div class="chips">${chip(t('Any remix'), { on: 'remix', arg: 'all', active: remix === 'all' })}${REMIXES.slice(0, 6).map((r) => chip(t(r.name), { on: 'remix', arg: r.id, active: remix === r.id }))}</div>
<div class="chips">${[['new', _('Newest')], ['hot', _('Hottest')]].map(([id, l]) => chip(t(l), { on: 'sort', arg: id, active: sort === id }))}</div></div>
${loading ? html`<div class="grid-cards">${[0, 1, 2, 3, 4, 5].map(() => html`<div class="card skeleton"></div>`)}</div>` : list.length ? html`<div class="grid-cards">${list.map((s) => sendoffCard(s, { reacted: st.reacted }))}</div>` : html`<div class="empty"><h3>${t('Nothing here yet')}</h3><p>${t('Try another filter.')}</p></div>`}</div>`;
    },
  };
}

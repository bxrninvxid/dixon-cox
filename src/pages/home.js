import { html, raw } from '../lib/view.js';
import { t, _ } from '../lib/i18n.js';
import { num } from '../lib/format.js';
import { getStats, listSendoffs } from '../api/mockApi.js';
import { getState } from '../lib/store.js';
import { urnFig, btn, sectionHead, stat } from '../ui/components.js';
import { sendoffCard } from '../ui/cards.js';
import { icon } from '../ui/icons.js';
import { confetti } from '../ui/fx.js';
import { remixArt } from '../art/remixArt.js';
import { REMIXES, FAQ, CELL_IDS } from '../data/catalog.js';
import { studioLink } from '../lib/share.js';

const HERO = [
  { shape: 'rocket', skin: 'holo', seed: 11, text: 'ZERO', symbol: 'bolt', led: 'magenta' },
  { shape: 'amphora', skin: 'gold', seed: 4, text: 'LEGEND', symbol: 'crown', led: 'amber' },
  { shape: 'boombox', skin: 'sticker', seed: 3, text: 'DJ ZHUK', symbol: 'note', led: 'lime' },
];
const SHOWCASE = [
  { shape: 'capsule', skin: 'koi', seed: 5, text: 'Koi Kenji', symbol: 'flower' },
  { shape: 'orb', skin: 'cosmos', seed: 9, text: 'Nova', symbol: 'star', led: 'violet' },
  { shape: 'monolith', skin: 'chrome', seed: 2, text: 'Mr. Chrome', symbol: 'skull', led: 'white' },
  { shape: 'amphora', skin: 'sakura', seed: 8, text: 'Sakura', symbol: 'heart', led: 'magenta' },
];
const TAPE = [_('Go out loud'), _('Fast as a pizza'), _('Zero mourning voice'), _('Rarity tiers'), _('Self-unlocking cells'), _('Fireworks included'), _('Roll the urn dice')];
const STEPS = [
  { ic: 'calendar', title: _('Book in 5 minutes'), body: _('Tell us who, pick an urn, choose a slot. Pre-plan mode skips the pick-up.') },
  { ic: 'truck', title: _('We collect'), body: _('A courier comes to you, or you drop at a city cell and walk away.') },
  { ic: 'flame', title: _('We do it fast'), body: _('Most send-offs are ready in a few hours. The record is 47 minutes.') },
  { ic: 'unlock', title: _('Pick up the legend'), body: _('Courier delivery, or punch your code into a cell and the door pops open.') },
];

export function homePage(ctx) {
  let stats = null, feed = [], cellOpen = null, loading = true;
  Promise.all([getStats(), listSendoffs({ sort: 'hot', limit: 6 })]).then(([s, f]) => { stats = s; feed = f; loading = false; ctx.update(); });
  const handlers = {
    roll(el, ev) { confetti(ev.clientX, ev.clientY, 70); return false; },
    cell(el) { cellOpen = cellOpen === el.dataset.arg ? null : el.dataset.arg; },
    react() { return false; },
  };
  return {
    title: _('Go out loud'), handlers,
    render() {
      const st = getState();
      return html`
<section class="hero"><div class="wrap hero-in">
  <div class="hero-copy">
    <span class="kicker">${icon('sparkle', 16)} ${t('Fast cremation. Loud urns. Zero mourning voice.')}</span>
    <h1 class="display">${t('Go out')}<br><span class="hl">${t('loud.')}</span></h1>
    <p class="lede big">${t('Dixon Cox turns the hardest day into the fastest, flashiest send-off in town. Pick up in hours, design the urn like a collectible, remix the ashes into something wild.')}</p>
    <div class="cta-row">${btn(t('Book a send-off'), { href: '#/book', ic: 'calendar', size: 'lg' })}${btn(t('Design an urn'), { href: '#/studio', kind: 'ink', ic: 'urn', size: 'lg' })}</div>
    <ul class="proof"><li>${icon('fast', 18)}<b>${stats ? stats.fastest : 47}</b> ${t('min record')}</li><li>${icon('flame', 18)}<b>${stats ? num(stats.total) : '12,847'}</b> ${t('send-offs')}</li><li>${icon('star', 18)}<b>12</b> ${t('skins in 4 tiers')}</li></ul>
  </div>
  <div class="hero-stage" aria-hidden="false">
    <div class="stage-bg"></div>
    ${HERO.map((d, i) => html`<button type="button" class="hero-urn hu-${i}" data-on-click="roll" aria-label="${t('Celebrate')}">${urnFig(d, { size: i === 1 ? '250px' : '200px', animate: true })}</button>`)}
    <span class="sticker s1">${t('Legendary drop')}</span><span class="sticker s2">${t('47 min')}</span><span class="sticker s3">${t('LED included')}</span>
  </div>
</div></section>

<div class="tape" aria-hidden="true"><div class="tape-in">${[0, 1].map(() => TAPE.map((x) => html`<span>${t(x)}</span><i>${icon('star', 16)}</i>`))}</div></div>

<section class="wrap block"><div class="stat-row">
  ${stat(stats ? num(stats.total) : '…', t('send-offs and counting'), 'violet')}${stat(stats ? t('{n} min', { n: stats.fastest }) : '…', t('fastest turnaround'), 'coral')}${stat('4', t('city drop points, open 24/7'), 'mint')}${stat('10', t('ways to remix the ashes'), 'sun')}
</div></section>

<section class="wrap block">
  ${sectionHead(t('How it works'), t('Four steps. No small talk required.'))}
  <ol class="steps">${STEPS.map((s, i) => html`<li class="card step"><span class="step-n">${i + 1}</span><span class="step-ic">${icon(s.ic, 28)}</span><h3>${t(s.title)}</h3><p>${t(s.body)}</p></li>`)}</ol>
</section>

<section class="wrap block">
  ${sectionHead(t('Urns that look like loot drops'), t('Six shapes, twelve skins, engraving, LED, QR memorials. Common to Legendary.'), btn(t('Open the studio'), { href: '#/studio', kind: 'ghost', ic: 'arrow' }))}
  <div class="showcase">${SHOWCASE.map((d) => html`<a class="card show-card" href="${studioLink(d)}">${urnFig(d, { size: '100%' })}<span class="show-name">${d.text}</span></a>`)}</div>
</section>

<section class="wrap block band band-ink"><div class="band-in">
  <div><span class="kicker kicker-sun">${icon('unlock', 16)} ${t('Drop points')}</span><h2>${t('Pick up like it is the future')}</h2>
  <p class="lede">${t('Skip the conversation. Book a cell, get a 6-digit code, tap it in and the door opens. Try one:')}</p>${btn(t('See drop points'), { href: '#/points', kind: 'sun', ic: 'pin' })}</div>
  <div class="locker" role="group" aria-label="${t('Demo locker')}">${CELL_IDS.map((c) => html`<button type="button" class="cell ${cellOpen === c ? 'open' : ''}" data-on-click="cell" data-arg="${c}" aria-pressed="${cellOpen === c ? 'true' : 'false'}"><span class="cell-id">${c}</span><span class="cell-in">${cellOpen === c ? urnFig({ shape: 'capsule', skin: 'arcade', seed: c.charCodeAt(1), text: '', qr: false }, { size: '34px' }) : ''}</span><i class="cell-led"></i></button>`)}</div>
</div></section>

<section class="wrap block">
  ${sectionHead(t('Ash remixes'), t('Because a jar on the mantel is not the only option.'), btn(t('All ten'), { href: '#/remix', kind: 'ghost', ic: 'arrow' }))}
  <div class="remix-strip">${REMIXES.slice(0, 6).map((r) => html`<a class="card remix-mini" href="#/remix">${html`<span class="rm-art">${raw(remixArt(r.id))}</span>`}<b>${t(r.name)}</b></a>`)}</div>
</section>

<section class="wrap block">
  ${sectionHead(t('Latest send-offs'), t('What people are using right now.'), btn(t('Full feed'), { href: '#/feed', kind: 'ghost', ic: 'arrow' }))}
  ${loading ? html`<div class="grid-cards">${[0, 1, 2].map(() => html`<div class="card skeleton"></div>`)}</div>` : html`<div class="grid-cards">${feed.slice(0, 3).map((s) => sendoffCard(s, { reacted: st.reacted, react: false }))}</div>`}
</section>

<section class="wrap block narrow">
  ${sectionHead(t('Quick answers'))}
  ${FAQ.slice(0, 3).map((f) => html`<details class="acc"><summary>${t(f.q)}</summary><p>${t(f.a)}</p></details>`)}
  <p class="center">${btn(t('More questions'), { href: '#/faq', kind: 'ghost' })}</p>
</section>

<section class="wrap block"><div class="cta-big"><h2 class="display">${t('Ready when you are.')}</h2><p class="lede">${t('Or ready before: pre-plan your own send-off and keep it on file.')}</p>
  <div class="cta-row center">${btn(t('Book now'), { href: '#/book', ic: 'calendar', size: 'lg' })}${btn(t('Pre-plan mine'), { href: '#/book?mode=plan', kind: 'ink', ic: 'star', size: 'lg' })}</div></div></section>`;
    },
  };
}

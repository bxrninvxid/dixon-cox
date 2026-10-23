// App chrome: top bar, mobile tab bar, footer.
import { html, raw } from '../lib/view.js';
import { t, _ } from '../lib/i18n.js';
import { icon } from './icons.js';

export const NAV = [
  { path: '/', label: 'Home', ic: 'home' }, { path: '/studio', label: 'Urn studio', ic: 'urn' }, { path: '/remix', label: 'Remix', ic: 'flame' },
  { path: '/book', label: 'Book', ic: 'calendar' }, { path: '/points', label: 'Drop points', ic: 'pin' }, { path: '/feed', label: 'Feed', ic: 'chart' }, { path: '/shop', label: 'Shop', ic: 'bag' },
];
const TABS = ['/', '/studio', '/book', '/feed'];
const isOn = (cur, p) => (p === '/' ? cur === '/' : cur === p || cur.startsWith(p + '/'));

export function shell(cur, state, menuOpen) {
  const bag = state.bag.reduce((a, b) => a + b.qty, 0);
  const logo = html`<a class="logo" href="#/" aria-label="Dixon Cox"><span class="logo-mark">${icon('urn', 20)}</span><span class="logo-t">Dixon Cox</span></a>`;
  const top = html`<header class="topbar"><div class="wrap topbar-in">${logo}
<nav class="nav" aria-label="${t('Main')}">${NAV.map((n) => html`<a href="#${n.path}" class="${isOn(cur, n.path) ? 'on' : ''}" ${isOn(cur, n.path) ? raw('aria-current="page"') : ''}>${t(n.label)}</a>`)}</nav>
<div class="topbar-r"><button type="button" class="pill-btn" data-on-click="toggleLang" aria-label="${t('Switch language')}">${icon('globe', 16)}<span>${state.lang === 'uk' ? 'УК' : 'EN'}</span></button>
<a class="pill-btn" href="#/me" aria-label="${t('Legacy points')}">${icon('star', 16)}<span>${state.points}</span></a>
<a class="pill-btn" href="#/shop" aria-label="${t('Bag')}">${icon('bag', 16)}${bag ? html`<span class="dot">${bag}</span>` : ''}</a></div></div></header>`;
  const tabs = html`<nav class="tabbar" aria-label="${t('Main')}">${TABS.map((p) => { const n = NAV.find((x) => x.path === p); return html`<a href="#${p}" class="${isOn(cur, p) ? 'on' : ''} ${p === '/book' ? 'tab-main' : ''}"><span class="tab-ic">${icon(n.ic, 22)}</span><span>${t(n.label)}</span></a>`; })}
<button type="button" class="${menuOpen ? 'on' : ''}" data-on-click="toggleMenu"><span class="tab-ic">${icon('menu', 22)}</span><span>${t('More')}</span></button></nav>`;
  const sheet = menuOpen ? html`<div class="sheet-back" data-on-click="toggleMenu"><div class="sheet" data-on-click="noop"><h3>${t('More')}</h3><div class="sheet-grid">${[['/remix', _('Remix'), 'flame'], ['/points', _('Drop points'), 'pin'], ['/shop', _('Shop'), 'bag'], ['/me', _('Legacy'), 'star'], ['/track', _('Track order'), 'truck'], ['/faq', _('FAQ'), 'info']].map(([p, l, ic]) => html`<a href="#${p}" data-on-click="toggleMenu">${icon(ic, 22)}<span>${t(l)}</span></a>`)}</div>
<button type="button" class="btn btn-ghost" data-on-click="toggleLang">${icon('globe', 18)}<span>${state.lang === 'uk' ? 'English' : 'Українська'}</span></button></div></div>` : '';
  const foot = html`<footer class="footer"><div class="wrap foot-in"><div><div class="logo logo-foot"><span class="logo-mark">${icon('urn', 20)}</span><span class="logo-t">Dixon Cox</span></div><p>${t('Fast cremation, loud urns, zero mourning voice.')}</p><p class="demo-note">${t('Demo project: no payments, no real services, every name in the feed is made up.')}</p></div>
<div class="foot-links"><a href="#/studio">${t('Urn studio')}</a><a href="#/remix">${t('Remix')}</a><a href="#/book">${t('Book')}</a><a href="#/points">${t('Drop points')}</a><a href="#/feed">${t('Feed')}</a><a href="#/shop">${t('Shop')}</a><a href="#/faq">${t('FAQ')}</a></div></div></footer>`;
  return { top: html`<button type="button" class="skip" data-on-click="skip">${t('Skip to content')}</button>${top}${tabs}${sheet}`, foot };
}

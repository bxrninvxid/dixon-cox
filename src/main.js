import { load, getState, setState, subscribe } from './lib/store.js';
import { registerLocale, setLang, t } from './lib/i18n.js';
import { uk } from './locales/uk.js';
import { parseHash, matchRoute, navigate } from './lib/router.js';
import { mountView } from './lib/view.js';
import { shell } from './ui/shell.js';
import { installTooltip } from './ui/fx.js';
import { homePage } from './pages/home.js';
import { studioPage } from './pages/studio.js';
import { remixPage } from './pages/remix.js';
import { bookPage } from './pages/book.js';
import { trackPage } from './pages/track.js';
import { pointsPage } from './pages/points.js';
import { feedPage } from './pages/feed.js';
import { memorialPage } from './pages/memorial.js';
import { shopPage } from './pages/shop.js';
import { mePage } from './pages/me.js';
import { votePage } from './pages/vote.js';
import { faqPage, notFoundPage } from './pages/faq.js';

const TABLE = [['/', 'home'], ['/studio', 'studio'], ['/remix', 'remix'], ['/book', 'book'], ['/track', 'track'], ['/points', 'points'], ['/feed', 'feed'], ['/m/:id', 'memorial'], ['/shop', 'shop'], ['/me', 'me'], ['/vote/:id', 'vote'], ['/faq', 'faq']];
const PAGES = { home: homePage, studio: studioPage, remix: remixPage, book: bookPage, track: trackPage, points: pointsPage, feed: feedPage, memorial: memorialPage, shop: shopPage, me: mePage, vote: votePage, faq: faqPage, notfound: notFoundPage };

registerLocale('uk', uk);
load();
setLang(getState().lang);
installTooltip();

let view = null, curPath = '/', menuOpen = false;
const $ = (id) => document.getElementById(id);

const topView = mountView($('top'), {
  render: () => shell(curPath, getState(), menuOpen).top,
  handlers: {
    toggleLang() { const l = getState().lang === 'en' ? 'uk' : 'en'; setLang(l); setState({ lang: l }); menuOpen = false; },
    toggleMenu() { menuOpen = !menuOpen; },
    noop() {},
    skip() { $('main').focus(); },
  },
});
const bottomView = mountView($('bottom'), { render: () => shell(curPath, getState(), false).foot, handlers: {} });

function route() {
  const { path, query } = parseHash(location.hash);
  const m = matchRoute(TABLE, path) || { name: 'notfound', params: {} };
  if (view) view.destroy();
  curPath = path; menuOpen = false;
  $('main').innerHTML = '';
  const page = PAGES[m.name]({ params: m.params, query, update: () => view && view.update(), navigate });
  view = mountView($('main'), page);
  document.title = `${t(page.title || 'Dixon Cox')} | Dixon Cox`;
  document.body.dataset.page = m.name;
  scrollTo(0, 0);
  topView.update(); bottomView.update();
}
subscribe(() => { topView.update(); bottomView.update(); if (view) view.update(); });
addEventListener('hashchange', route);
route();

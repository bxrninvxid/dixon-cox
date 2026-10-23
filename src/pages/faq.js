import { html } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { FAQ } from '../data/catalog.js';
import { btn } from '../ui/components.js';

export function faqPage() {
  return {
    title: 'FAQ', handlers: {},
    render() {
      return html`<div class="wrap page narrow"><div class="page-head"><h1 class="display sm">${t('Questions, answered fast')}</h1></div>
${FAQ.map((f) => html`<details class="acc"><summary>${t(f.q)}</summary><p>${t(f.a)}</p></details>`)}
<p class="note">${t('Dixon Cox is a fan-made homage project inspired by a scene in an animated series. It is not affiliated with any studio or brand.')}</p></div>`;
    },
  };
}
export function notFoundPage() {
  return {
    title: 'Not found', handlers: {},
    render() { return html`<div class="wrap page center"><h1 class="display">404</h1><p class="lede">${t('This page went out loud and did not come back.')}</p>${btn(t('Home'), { href: '#/', ic: 'home' })}</div>`; },
  };
}

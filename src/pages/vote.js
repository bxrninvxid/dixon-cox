import { html } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { getState, setState } from '../lib/store.js';
import { getPoll, votePoll } from '../api/mockApi.js';
import { urnFig, btn, empty } from '../ui/components.js';
import { confetti } from '../ui/fx.js';
import { studioLink } from '../lib/share.js';

export function votePage(ctx) {
  let poll = null, loading = true;
  const id = ctx.params.id;
  getPoll(id).then((p) => { poll = p; loading = false; ctx.update(); });
  return {
    title: 'Family vote',
    handlers: {
      async vote(el, ev) {
        if (getState().voted[id] !== undefined) return false;
        const i = +el.dataset.arg; setState({ voted: { ...getState().voted, [id]: i } }); poll = await votePoll(id, i) || poll; confetti(ev.clientX, ev.clientY, 60); ctx.update(); return false;
      },
    },
    render() {
      if (loading) return html`<div class="wrap page"><div class="card skeleton tall"></div></div>`;
      if (!poll) return html`<div class="wrap page">${empty(t('Vote not found'), t('Demo votes live in the browser that created them.'), btn(t('Home'), { href: '#/' }))}</div>`;
      const mine = getState().voted[id], total = poll.options.reduce((a, o) => a + o.votes, 0) || 1, win = Math.max(...poll.options.map((o) => o.votes));
      return html`<div class="wrap page"><div class="page-head"><h1 class="display sm">${poll.title}</h1><p class="lede">${mine === undefined ? t('Tap the one you love. One vote each.') : t('Thanks, vote counted.')}</p></div>
<div class="vote-grid">${poll.options.map((o, i) => html`<div class="card vote-card ${mine === i ? 'mine' : ''}" data-key="${i}">${urnFig(o.design, { size: '140px' })}<h3>${o.label}</h3>
${mine === undefined ? btn(t('Vote'), { on: 'vote', arg: i, ic: 'heart' }) : html`<div class="bar"><i style="width:${Math.round((o.votes / total) * 100)}%"></i></div><b>${o.votes} · ${Math.round((o.votes / total) * 100)}%${o.votes === win && win > 0 ? ' ★' : ''}</b>`}
<a class="link-sm" href="${studioLink(o.design)}">${t('Open in studio')}</a></div>`)}</div></div>`;
    },
  };
}

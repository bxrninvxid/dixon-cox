import { html, raw } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { ago } from '../lib/format.js';
import { getState, setState } from '../lib/store.js';
import { getSendoff, lightCandle, addComment, react, unreact } from '../api/mockApi.js';
import { qrPath } from '../lib/qr.js';
import { remixById } from '../data/catalog.js';
import { urnFig, rarityBadge, btn, empty, field } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast, copyText, confetti } from '../ui/fx.js';
import { studioLink } from '../lib/share.js';

export function memorialPage(ctx) {
  let s = null, loading = true, text = '', name = getState().name || '', busy = false;
  const id = ctx.params.id;
  getSendoff(id).then((x) => { s = x; loading = false; ctx.update(); });
  const url = () => `${location.origin}${location.pathname}#/m/${id}`;
  const handlers = {
    async candle(el, ev) {
      if (getState().lit[id]) { toast(t('You already lit one here. Thank you.')); return false; }
      setState({ lit: { ...getState().lit, [id]: 1 } }); s.candles += 1; confetti(ev.clientX, ev.clientY, 30); ctx.update();
      await lightCandle(id); return false;
    },
    f(el) { if (el.dataset.field === 'name') { name = el.value; setState({ name }); } else text = el.value; },
    async post() {
      if (!text.trim() || busy) return false;
      busy = true; ctx.update();
      try { s.comments = await addComment(id, { name, text }); text = ''; toast(t('Posted')); } catch (e) { toast(t('Write something first'), 'warn'); }
      busy = false; ctx.update(); return false;
    },
    async react(el) {
      const k = el.dataset.arg, key = id + k, on = getState().reacted[key], rx = { ...getState().reacted };
      if (on) delete rx[key]; else rx[key] = 1;
      setState({ reacted: rx }); s.reactions[k] += on ? -1 : 1; ctx.update(); await (on ? unreact(id, k) : react(id, k)); return false;
    },
    async share() { const ok = await copyText(url()); toast(ok ? t('Link copied') : t('Could not copy'), ok ? 'ok' : 'warn'); return false; },
  };
  return {
    title: 'Memorial', handlers,
    render() {
      if (loading) return html`<div class="wrap page"><div class="card skeleton tall"></div></div>`;
      if (!s) return html`<div class="wrap page">${empty(t('Memorial not found'), t('This link may be from another browser. Demo data lives locally.'), btn(t('Back to the feed'), { href: '#/feed' }))}</div>`;
      const st = getState(), q = qrPath(url());
      return html`<div class="wrap page memorial">
<section class="mem-hero"><div class="mem-fig">${urnFig(s.design, { size: 'min(320px, 68vw)', animate: true })}</div>
<div class="mem-info">${rarityBadge(s.design.skin)}${s.live ? html`<span class="live-tag">${icon('video', 14)} ${t('Live')}</span>` : ''}<h1 class="display sm">${s.name}</h1>${s.years ? html`<p class="muted">${s.years}</p>` : ''}
<blockquote class="tribute">${s.tribute || t('A legend. No further notes.')}</blockquote>
${s.remix.length ? html`<p class="sd-meta">${s.remix.map((r) => html`<span class="tag">${t(remixById(r).name)}</span>`)}</p>` : ''}
<div class="row-gap"><button type="button" class="btn btn-sun" data-on-click="candle">${icon('candle', 18)}<span>${st.lit[id] ? t('Candle lit') : t('Light a candle')}</span></button><span class="candle-count"><b>${s.candles}</b> ${t('candles')}</span></div>
<div class="candles" aria-hidden="true">${Array.from({ length: Math.min(24, s.candles) }, (_, i) => html`<i style="--d:${(i * 0.37) % 2}s"></i>`)}</div>
<div class="sd-foot">${['flame', 'heart', 'star'].map((k) => html`<button type="button" class="react ${st.reacted[id + k] ? 'on' : ''}" data-on-click="react" data-arg="${k}" aria-pressed="${!!st.reacted[id + k]}" aria-label="${k}">${icon(k, 16)}<b>${s.reactions[k]}</b></button>`)}${btn(t('Share'), { on: 'share', kind: 'ghost', size: 'sm', ic: 'share' })}<a class="link-sm" href="${studioLink(s.design)}">${t('Use this design')}</a></div></div></section>
<div class="mem-grid"><section class="card"><h3>${t('Messages')}</h3>
<form class="comment-form" data-on-submit="post"><div class="field-row">${field(t('Your name'), html`<input class="input" maxlength="30" value="${name}" data-field="name" data-on-input="f" autocomplete="off">`)}</div>
${field(t('Say something'), html`<textarea class="input" rows="3" maxlength="240" data-field="text" data-on-input="f" placeholder="${t('A memory, a joke, a thank you')}">${text}</textarea>`)}
<button type="submit" class="btn btn-coral" ${busy ? raw('disabled') : ''}>${icon('arrow', 18)}<span>${t('Post')}</span></button></form>
<ul class="comments">${s.comments.length ? s.comments.map((c) => html`<li data-key="${c.id}"><b>${c.name}</b><small>${ago(c.ts)}</small><p>${c.text}</p></li>`) : html`<li class="muted">${t('No messages yet. Be first.')}</li>`}</ul></section>
<aside class="stack"><section class="card"><h3>${t('Playlist')}</h3>${s.playlist.length ? html`<ol class="playlist">${s.playlist.map((p, i) => html`<li><span class="pl-n">${i + 1}</span><span><b>${p.title}</b> <small>${p.artist || ''}</small></span></li>`)}</ol>` : html`<p class="muted">${t('House mix.')}</p>`}</section>
<section class="card center"><h3>${t('Memorial code')}</h3><svg class="qr-big" viewBox="-2 -2 ${q.size + 4} ${q.size + 4}" role="img" aria-label="QR"><rect x="-2" y="-2" width="${q.size + 4}" height="${q.size + 4}" fill="#fff"/><path d="${q.d}" fill="#1a1033"/></svg><p class="muted">${t('Scan to open this page.')}</p></section></aside></div></div>`;
    },
  };
}

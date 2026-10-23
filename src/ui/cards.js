// Cards that show up on several pages.
import { html } from '../lib/view.js';
import { t } from '../lib/i18n.js';
import { ago } from '../lib/format.js';
import { remixById } from '../data/catalog.js';
import { SKINS } from '../art/skins.js';
import { urnFig, rarityBadge } from './components.js';
import { icon } from './icons.js';
import { studioLink } from '../lib/share.js';

export function sendoffCard(s, { reacted = {}, react = true } = {}) {
  const sum = s.reactions.flame + s.reactions.heart + s.reactions.star;
  return html`<article class="card sd-card" data-key="${s.id}">
<a class="sd-fig" href="#/m/${s.id}" aria-label="${t('Open memorial for {name}', { name: s.name })}">${urnFig(s.design, { size: '100%', label: s.name })}</a>
<div class="sd-body"><div class="sd-top">${rarityBadge(s.design.skin)}<span class="muted">${ago(s.ts)}</span></div>
<h3 class="sd-name"><a href="#/m/${s.id}">${s.name}</a></h3>
<p class="sd-meta">${s.kind === 'pet' ? t('Good one') : ''}${s.minutes ? html`<span>${icon('fast', 14)} ${t('{n} min', { n: s.minutes })}</span>` : ''}${s.remix.map((r) => html`<span class="tag">${t(remixById(r).name)}</span>`)}</p>
<div class="sd-foot">${react ? ['flame', 'heart', 'star'].map((k) => html`<button type="button" class="react ${reacted[s.id + k] ? 'on' : ''}" data-on-click="react" data-arg="${s.id}:${k}" aria-pressed="${reacted[s.id + k] ? 'true' : 'false'}" aria-label="${k}">${icon(k, 16)}<b>${s.reactions[k]}</b></button>`) : html`<span class="muted">${sum}</span>`}
<a class="link-sm" href="${studioLink(s.design)}">${t('Use this design')}</a></div></div></article>`;
}

export const skinName = (id) => t(SKINS[id].name);

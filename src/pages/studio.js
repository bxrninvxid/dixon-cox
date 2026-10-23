import { html, raw } from '../lib/view.js';
import { t, _ } from '../lib/i18n.js';
import { money } from '../lib/format.js';
import { getState, setState, patchDesign, patchBooking } from '../lib/store.js';
import { normalizeDesign, rollDesign, LEDS, FONTS, FINISHES, ENGRAVE_MODES, SKINS, SKIN_IDS, SHAPES, SHAPE_IDS, SYMBOLS, SYMBOL_IDS, RARITY } from '../art/urn.js';
import { designLines, designPrice } from '../lib/pricing.js';
import { urnFig, rarityBadge, btn, chip, field } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { toast, copyText, confetti } from '../ui/fx.js';
import { exportPng, exportSvg } from '../ui/exporter.js';
import { decodeDesign, shareUrl } from '../lib/share.js';

const TABS = [['shape', _('Shape'), 'urn'], ['skin', _('Skin'), 'sparkle'], ['engrave', _('Engraving'), 'edit'], ['extras', _('Extras'), 'bolt'], ['garage', _('Garage'), 'star']];

function downscale(file, max = 800) {
  return new Promise((res, rej) => {
    const img = new Image(), url = URL.createObjectURL(file);
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height)), c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url); res(c.toDataURL('image/jpeg', 0.85));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error('bad image')); };
    img.src = url;
  });
}
const thumb = (d, size = '64px') => urnFig({ ...d, text: '', line2: '', symbol: 'none', qr: false, art: null }, { size });

export function studioPage(ctx) {
  let tab = 'shape', busy = false;
  if (ctx.query.d) { const d = decodeDesign(ctx.query.d); if (d) { setState({ design: d }); toast(t('Design loaded from link')); } }
  const D = () => normalizeDesign(getState().design);
  const handlers = {
    tab(el) { tab = el.dataset.arg; },
    setShape(el) { patchDesign({ shape: el.dataset.arg }); },
    setSkin(el) { patchDesign({ skin: el.dataset.arg }); },
    setFont(el) { patchDesign({ font: el.dataset.arg }); },
    setSymbol(el) { patchDesign({ symbol: el.dataset.arg }); },
    setEngrave(el) { patchDesign({ engrave: el.dataset.arg }); },
    setLed(el) { patchDesign({ led: el.dataset.arg }); },
    setFinish(el) { patchDesign({ finish: el.dataset.arg }); },
    text(el) { patchDesign({ [el.dataset.field]: el.value }); },
    toggle(el) { patchDesign({ [el.dataset.arg]: !D()[el.dataset.arg] }); },
    vary() { patchDesign({ seed: (D().seed * 7919 + 13) % 99991 + 1 }); },
    legend() { const n = getState().booking.name; if (n) patchDesign({ text: n.slice(0, 28) }); else toast(t('Add a name in Book first'), 'warn'); },
    roll(el, ev) {
      const base = D(); setState({ design: rollDesign(Math.random, { text: base.text, line2: base.line2, font: base.font, engrave: base.engrave }) });
      const r = SKINS[D().skin].rarity; if (r >= 2) confetti(ev.clientX, ev.clientY, r === 3 ? 160 : 90);
      toast(t('Rolled: {tier}', { tier: t(RARITY[r].name) }), r >= 2 ? 'ok' : 'info');
    },
    save() { const d = D(); setState((s) => ({ garage: [{ ...d, art: null, id: Date.now().toString(36) }, ...s.garage].slice(0, 24) })); toast(t('Saved to your garage')); },
    loadG(el) { const g = getState().garage.find((x) => x.id === el.dataset.arg); if (g) setState({ design: normalizeDesign(g) }); },
    delG(el) { setState((s) => ({ garage: s.garage.filter((x) => x.id !== el.dataset.arg) })); },
    async share() { const ok = await copyText(shareUrl(D())); toast(ok ? t('Link copied') : t('Could not copy'), ok ? 'ok' : 'warn'); return false; },
    async png() { busy = true; ctx.update(); try { await exportPng(D()); } catch (e) { toast(t('Export failed'), 'warn'); } busy = false; },
    async svg() { try { await exportSvg(D()); } catch (e) { toast(t('Export failed'), 'warn'); } return false; },
    async upload(el) {
      const f = el.files && el.files[0]; if (!f) return false;
      try { patchDesign({ art: await downscale(f) }); toast(t('Artwork added')); } catch (e) { toast(t('That image would not load'), 'warn'); }
      el.value = '';
    },
    clearArt() { patchDesign({ art: null }); },
    use() { patchBooking({ design: D() }); ctx.navigate('/book'); return false; },
    clear() { patchDesign({ text: '', line2: '' }); },
  };

  const panelShape = (d) => html`<div class="pick-grid">${SHAPE_IDS.map((id) => html`<button type="button" class="pick ${d.shape === id ? 'on' : ''}" data-on-click="setShape" data-arg="${id}" aria-pressed="${d.shape === id}">${urnFig({ ...d, shape: id, text: '', line2: '', symbol: 'none', qr: false }, { size: '78px' })}<b>${t(SHAPES[id].name)}</b><small>${SHAPES[id].price ? money(SHAPES[id].price) : t('Free')}</small></button>`)}</div>`;
  const panelSkin = (d) => html`<div class="tiers">${RARITY.map((r, ri) => html`<div class="tier"><h4><span class="rarity r-${r.id}">${t(r.name)}</span><small>${r.price ? '+' + money(r.price) : t('Free')}</small></h4>
<div class="pick-grid">${SKIN_IDS.filter((id) => SKINS[id].rarity === ri).map((id) => html`<button type="button" class="pick ${d.skin === id ? 'on' : ''}" data-on-click="setSkin" data-arg="${id}" aria-pressed="${d.skin === id}">${urnFig({ ...d, skin: id, text: '', line2: '', symbol: 'none', qr: false, art: null }, { size: '78px' })}<b>${t(SKINS[id].name)}</b></button>`)}</div></div>`)}</div>`;
  const panelEngrave = (d) => html`<div class="stack">
<div class="chips">${Object.keys(ENGRAVE_MODES).map((m) => chip(t(ENGRAVE_MODES[m]), { on: 'setEngrave', arg: m, active: d.engrave === m }))}</div>
${d.engrave === 'none' ? html`<p class="muted">${t('Skin stays clean. QR code and LED still work.')}</p>` : html`
<div class="field-row">${field(t('Main line'), html`<input class="input" maxlength="28" value="${d.text}" data-field="text" data-on-input="text" placeholder="${t('A name, a motto, a legend')}" autocomplete="off">`, `${d.text.length}/28`)}
${field(t('Second line'), html`<input class="input" maxlength="24" value="${d.line2}" data-field="line2" data-on-input="text" placeholder="${t('1961 - 2026, or a one-liner')}" autocomplete="off">`, `${d.line2.length}/24`)}</div>
<div class="row-gap">${btn(t('Use the legend name'), { on: 'legend', kind: 'ghost', size: 'sm', ic: 'user' })}${btn(t('Clear'), { on: 'clear', kind: 'ghost', size: 'sm' })}</div>
<h4 class="mini-h">${t('Typeface')}</h4><div class="chips">${Object.entries(FONTS).map(([id, f]) => html`<button type="button" class="chip font-chip ${d.font === id ? 'on' : ''}" data-on-click="setFont" data-arg="${id}" style="font-family:'${f.family}',serif;font-weight:${f.weight}">${t(f.label)}</button>`)}</div>
<h4 class="mini-h">${t('Symbol')}</h4><div class="symbols">${SYMBOL_IDS.map((id) => html`<button type="button" class="sym ${d.symbol === id ? 'on' : ''}" data-on-click="setSymbol" data-arg="${id}" aria-label="${t(SYMBOLS[id].label)}" aria-pressed="${d.symbol === id}">${id === 'none' ? icon('x', 18) : raw(`<svg viewBox="0 0 24 24" width="22" height="22">${SYMBOLS[id].svg}</svg>`)}</button>`)}</div>`}</div>`;
  const panelExtras = (d) => html`<div class="stack">
<h4 class="mini-h">${t('LED base')}</h4><div class="leds">${Object.entries(LEDS).map(([id, l]) => html`<button type="button" class="led-dot ${d.led === id ? 'on' : ''}" data-on-click="setLed" data-arg="${id}" aria-label="${t(l.name)}" aria-pressed="${d.led === id}" style="--c:${l.rainbow ? 'conic-gradient(#ff4d5a,#ffc72c,#4be3a5,#3bb6ff,#9a7bff,#ff4d5a)' : l.hex}"></button>`)}</div>
<h4 class="mini-h">${t('Finish')}</h4><div class="chips">${Object.entries(FINISHES).map(([id, f]) => chip(t(f.name), { on: 'setFinish', arg: id, active: d.finish === id }))}</div>
<label class="switch"><input type="checkbox" ${d.qr ? raw('checked') : ''} data-on-change="toggle" data-arg="qr"><span class="sw"></span><span><b>${t('QR memorial code')}</b><small>${t('A real, scannable code that opens the memorial page.')}</small></span></label>
<label class="switch ${d.shape === 'boombox' ? 'dis' : ''}"><input type="checkbox" ${d.speaker || d.shape === 'boombox' ? raw('checked') : ''} ${d.shape === 'boombox' ? raw('disabled') : ''} data-on-change="toggle" data-arg="speaker"><span class="sw"></span><span><b>${t('Speaker chip')}</b><small>${d.shape === 'boombox' ? t('The boombox already has one.') : t('Plays their favorite track on tap. +$35')}</small></span></label>
<h4 class="mini-h">${t('Your own artwork')}</h4>
<div class="upload"><label class="btn btn-ghost btn-sm" tabindex="0">${icon('upload', 18)}<span>${d.art ? t('Replace image') : t('Upload image')}</span><input type="file" accept="image/*" data-on-change="upload" class="sr"></label>${d.art ? btn(t('Remove'), { on: 'clearArt', kind: 'ghost', size: 'sm', ic: 'trash' }) : ''}<small class="muted">${t('Replaces the skin. Stays on your device. +$15')}</small></div></div>`;
  const panelGarage = (st) => st.garage.length ? html`<div class="garage">${st.garage.map((g) => html`<div class="card garage-i" data-key="${g.id}">${thumb(g, '70px')}<div><b>${g.text || t(SKINS[g.skin].name)}</b><small>${t(SHAPES[g.shape].name)} · ${t(SKINS[g.skin].name)}</small></div>${btn(t('Load'), { on: 'loadG', arg: g.id, kind: 'ghost', size: 'sm' })}<button type="button" class="icon-btn" data-on-click="delG" data-arg="${g.id}" aria-label="${t('Delete')}">${icon('trash')}</button></div>`)}</div>` : html`<div class="empty"><h3>${t('Your garage is empty')}</h3><p>${t('Save designs here to compare them later.')}</p></div>`;

  return {
    title: 'Urn studio', handlers,
    render() {
      const st = getState(), d = D(), lines = designLines(d), price = designPrice(d);
      return html`<div class="wrap page studio">
<div class="page-head"><h1 class="display sm">${t('Urn studio')}</h1><p class="lede">${t('Build it like a collectible. Every change is live.')}</p></div>
<div class="studio-grid">
<aside class="studio-prev"><div class="card prev-card"><div class="prev-top">${rarityBadge(d.skin)}<span class="muted">${t(SHAPES[d.shape].name)}</span></div>
<div class="prev-stage">${urnFig(d, { size: 'min(300px, 62vw)', animate: true })}</div>
<div class="prev-actions">${btn(t('Roll the dice'), { on: 'roll', ic: 'dice' })}${btn(t('Variation'), { on: 'vary', kind: 'ghost', ic: 'sparkle' })}</div>
<ul class="lines">${lines.map((l) => html`<li><span>${l.label}</span><b>${l.amount ? money(l.amount) : t('Free')}</b></li>`)}<li class="total"><span>${t('Urn total')}</span><b>${money(price)}</b></li></ul>
<div class="prev-actions">${btn(t('Use in booking'), { on: 'use', ic: 'calendar' })}</div>
<div class="prev-tools">${btn(t('Save'), { on: 'save', kind: 'ghost', size: 'sm', ic: 'star' })}${btn(t('Share link'), { on: 'share', kind: 'ghost', size: 'sm', ic: 'share' })}${btn(busy ? t('Working…') : 'PNG', { on: 'png', kind: 'ghost', size: 'sm', ic: 'download', disabled: busy })}${btn('SVG', { on: 'svg', kind: 'ghost', size: 'sm', ic: 'download' })}</div></div></aside>
<section class="studio-ctl"><div class="tabs" role="tablist">${TABS.map(([id, l, ic]) => html`<button type="button" role="tab" class="tab ${tab === id ? 'on' : ''}" aria-selected="${tab === id}" data-on-click="tab" data-arg="${id}">${icon(ic, 18)}<span>${t(l)}</span>${id === 'garage' && st.garage.length ? html`<i class="count">${st.garage.length}</i>` : ''}</button>`)}</div>
<div class="card ctl-panel" role="tabpanel">${tab === 'shape' ? panelShape(d) : tab === 'skin' ? panelSkin(d) : tab === 'engrave' ? panelEngrave(d) : tab === 'extras' ? panelExtras(d) : panelGarage(st)}</div></section>
</div></div>`;
    },
  };
}

import { html, raw } from '../lib/view.js';
import { t, getLang, _ } from '../lib/i18n.js';
import { money, dateLabel } from '../lib/format.js';
import { getState, setState, patchBooking, patchDesign, emptyBooking } from '../lib/store.js';
import { createOrder, getPoints } from '../api/mockApi.js';
import { quote } from '../lib/pricing.js';
import { writeTribute } from '../lib/tribute.js';
import { normalizeDesign, rollDesign, SHAPES, SHAPE_IDS, SKINS, SKIN_IDS } from '../art/urn.js';
import { VEHICLES, SLOTS, PARTNERS, TRAITS, VIBES, DROP_POINTS, CELL_IDS } from '../data/catalog.js';
import { cityMap, buildRoute } from '../art/cityMap.js';
import { urnFig, btn, chip, field, rarityBadge } from '../ui/components.js';
import { icon } from '../ui/icons.js';
import { confetti, toast } from '../ui/fx.js';
import { remixCards, remixHandlers } from './remix.js';

const STEP_META = {
  legend: [_('Legend'), 'user'], urn: [_('Urn'), 'urn'], remix: [_('Remix'), 'flame'], ceremony: [_('Ceremony'), 'music'],
  pickup: [_('Pick-up'), 'truck'], sign: [_('Sign'), 'edit'], review: [_('Review'), 'check'],
};
const stepsFor = (mode) => (mode === 'plan' ? ['legend', 'urn', 'remix', 'ceremony', 'sign', 'review'] : ['legend', 'urn', 'remix', 'ceremony', 'pickup', 'sign', 'review']);

export function bookPage(ctx) {
  const pick = {}, tmp = { vibe: 'legend', traits: [], n: 0, song: '', artist: '', busy: false, points: [], err: '' };
  if (ctx.query.mode === 'plan') patchBooking({ mode: 'plan' });
  getPoints().then((p) => { tmp.points = p; ctx.update(); });
  const B = () => getState().booking;
  const steps = () => stepsFor(B().mode);
  const cur = () => Math.min(B().step, steps().length - 1);
  const D = () => normalizeDesign(getState().design);

  function valid(id) {
    const b = B();
    if (id === 'legend') return !!b.name.trim();
    if (id === 'pickup') return b.pick === 'courier' ? b.address.trim().length > 3 : !!b.cell;
    if (id === 'sign') return !!b.signature && !!b.signedName.trim();
    return true;
  }
  const hint = (id) => ({ legend: t('Add a name to continue'), pickup: B().pick === 'courier' ? t('Add a pick-up address') : t('Choose a free cell'), sign: t('Sign and type your name') }[id] || '');
  const go = (n) => { patchBooking({ step: Math.max(0, Math.min(steps().length - 1, n)) }); scrollTo({ top: 0, behavior: 'smooth' }); };

  const handlers = {
    ...remixHandlers(pick),
    mode(el) { patchBooking({ mode: el.dataset.arg, step: 0 }); },
    kind(el) { patchBooking({ kind: el.dataset.arg }); },
    field(el) { patchBooking({ [el.dataset.field]: el.value }); },
    check(el) { patchBooking({ [el.dataset.field]: el.checked }); },
    vibe(el) { tmp.vibe = el.dataset.arg; },
    trait(el) { const id = el.dataset.arg; tmp.traits = tmp.traits.includes(id) ? tmp.traits.filter((x) => x !== id) : [...tmp.traits, id]; },
    write() { const b = B(); patchBooking({ tribute: writeTribute({ name: b.name, vibe: tmp.vibe, traits: tmp.traits, kind: b.kind, lang: getLang(), pick: tmp.n++ }) }); },
    next() { const id = steps()[cur()]; if (!valid(id)) { toast(hint(id), 'warn'); return false; } if (id === 'legend' && !getState().design.text) patchDesign({ text: B().name.slice(0, 28) }); go(cur() + 1); return false; },
    back() { go(cur() - 1); return false; },
    jump(el) { const i = +el.dataset.arg; if (i < cur()) go(i); return false; },
    setShape(el) { patchDesign({ shape: el.dataset.arg }); },
    setSkin(el) { patchDesign({ skin: el.dataset.arg }); },
    dtext(el) { patchDesign({ text: el.value }); },
    roll() { const d = D(); setState({ design: rollDesign(Math.random, { text: d.text, line2: d.line2, font: d.font }) }); },
    live() { patchBooking({ livestream: !B().livestream }); },
    guests(el) { patchBooking({ guests: Math.max(0, Math.min(500, +el.value || 0)) }); },
    songField(el) { tmp[el.dataset.field] = el.value; },
    addSong() { if (!tmp.song.trim()) return false; patchBooking({ playlist: [...B().playlist, { title: tmp.song.trim().slice(0, 60), artist: tmp.artist.trim().slice(0, 40) }].slice(0, 30) }); tmp.song = ''; tmp.artist = ''; },
    delSong(el) { patchBooking({ playlist: B().playlist.filter((_, i) => i !== +el.dataset.arg) }); },
    partner(el) { patchBooking({ partners: { ...B().partners, [el.dataset.arg]: !B().partners[el.dataset.arg] } }); },
    pickKind(el) { patchBooking({ pick: el.dataset.arg, cell: null }); },
    vehicle(el) { patchBooking({ vehicle: el.dataset.arg }); },
    pickPoint(el) { patchBooking({ point: el.dataset.arg, cell: null }); },
    pickCell(el) { patchBooking({ cell: el.dataset.arg }); },
    day(el) { patchBooking({ day: +el.dataset.arg }); },
    slot(el) { patchBooking({ slot: el.dataset.arg }); },
    pay(el) { patchBooking({ pay: el.dataset.arg }); },
    sigDown(el, ev) { const c = el.getContext('2d'), r = el.getBoundingClientRect(); el.setPointerCapture(ev.pointerId); el._d = true; c.lineWidth = 3; c.lineCap = 'round'; c.lineJoin = 'round'; c.strokeStyle = '#1a1033'; c.beginPath(); c.moveTo((ev.clientX - r.left) * el.width / r.width, (ev.clientY - r.top) * el.height / r.height); return false; },
    sigMove(el, ev) { if (!el._d) return false; const c = el.getContext('2d'), r = el.getBoundingClientRect(); c.lineTo((ev.clientX - r.left) * el.width / r.width, (ev.clientY - r.top) * el.height / r.height); c.stroke(); return false; },
    sigUp(el) { if (!el._d) return false; el._d = false; patchBooking({ signature: el.toDataURL('image/png') }); return false; },
    sigClear() { const c = document.getElementById('sig'); if (c) c.getContext('2d').clearRect(0, 0, c.width, c.height); patchBooking({ signature: '' }); },
    applyCode(el) { patchBooking({ code: el.value }); },
    async confirm(el, ev) {
      const b = B();
      if (!b.agree) { toast(t('Tick the box to confirm'), 'warn'); return false; }
      if (!b.signedName.trim() || !b.signature) { toast(t('Signature missing'), 'warn'); return false; }
      if (tmp.busy) return false;
      tmp.busy = true; ctx.update();
      const design = D(), q = quote(b, design);
      try {
        const { order } = await createOrder({ ...b, design, total: q.total, lines: q.lines.map((l) => ({ label: l.label, amount: l.amount })) });
        setState((s) => ({ orders: [order.code, ...s.orders], points: s.points + (b.mode === 'plan' ? 0 : q.points), booking: emptyBooking() }));
        confetti(ev.clientX, ev.clientY, 160); tmp.busy = false;
        ctx.navigate(`/track?code=${order.code}`);
      } catch (e) { tmp.busy = false; toast(e.message || t('Something went wrong'), 'warn'); ctx.update(); }
      return false;
    },
  };

  /* ------------- step bodies ------------- */
  const sLegend = (b) => html`<div class="stack">
<div class="seg" role="group">${[['now', _('Book now')], ['plan', _('Pre-plan')]].map(([id, l]) => html`<button type="button" class="${b.mode === id ? 'on' : ''}" data-on-click="mode" data-arg="${id}" aria-pressed="${b.mode === id}">${t(l)}</button>`)}</div>
${b.mode === 'plan' ? html`<p class="note">${icon('info', 16)} ${t('Pre-plan keeps everything on file. No pick-up is scheduled and nothing is charged.')}</p>` : ''}
<div class="seg" role="group">${[['human', _('A person')], ['pet', _('A good pet')]].map(([id, l]) => html`<button type="button" class="${b.kind === id ? 'on' : ''}" data-on-click="kind" data-arg="${id}" aria-pressed="${b.kind === id}">${t(l)}</button>`)}</div>
<div class="field-row">${field(t('Name'), html`<input class="input" maxlength="60" value="${b.name}" data-field="name" data-on-input="field" autocomplete="off" placeholder="${b.kind === 'pet' ? t('Sir Biscuit') : t('Marcus “Tank” Reyes')}">`)}
${field(t('Years'), html`<input class="input" maxlength="20" value="${b.years}" data-field="years" data-on-input="field" autocomplete="off" placeholder="1961 - 2026">`)}</div>
<h4 class="mini-h">${t('Tribute writer')}</h4><p class="muted">${t('Pick a vibe and a few traits. We draft it, you edit it. (A template, not an AI.)')}</p>
<div class="chips">${VIBES.map((v) => chip(t(v.label), { on: 'vibe', arg: v.id, active: tmp.vibe === v.id }))}</div>
<div class="chips">${TRAITS.map((x) => chip(t(x.label), { on: 'trait', arg: x.id, active: tmp.traits.includes(x.id) }))}</div>
<div>${btn(t('Write a tribute'), { on: 'write', ic: 'sparkle', kind: 'ink', size: 'sm' })}</div>
${field(t('Tribute'), html`<textarea class="input" rows="4" maxlength="280" data-field="tribute" data-on-input="field" placeholder="${t('One or two lines, shown on the memorial page')}">${b.tribute}</textarea>`, `${b.tribute.length}/280`)}
${field(t('Contact (email or phone)'), html`<input class="input" value="${b.contact}" data-field="contact" data-on-input="field" autocomplete="off" placeholder="you@example.com">`, t('Demo: never sent anywhere.'))}
<label class="switch"><input type="checkbox" ${b.publicFeed ? raw('checked') : ''} data-field="publicFeed" data-on-change="check"><span class="sw"></span><span><b>${t('Show in the public feed')}</b><small>${t('Opt-in. Shows the urn design and first name only.')}</small></span></label></div>`;
  const sUrn = (b) => { const d = D(); return html`<div class="urn-step"><div class="urn-step-fig">${urnFig(d, { size: 'min(240px, 60vw)', animate: true })}<div>${rarityBadge(d.skin)}</div></div>
<div class="stack"><h4 class="mini-h">${t('Shape')}</h4><div class="mini-row">${SHAPE_IDS.map((id) => html`<button type="button" class="pick sm ${d.shape === id ? 'on' : ''}" data-on-click="setShape" data-arg="${id}" aria-label="${t(SHAPES[id].name)}" aria-pressed="${d.shape === id}">${urnFig({ ...d, shape: id, text: '', line2: '', symbol: 'none', qr: false }, { size: '48px' })}</button>`)}</div>
<h4 class="mini-h">${t('Skin')}</h4><div class="mini-row">${SKIN_IDS.map((id) => html`<button type="button" class="pick sm ${d.skin === id ? 'on' : ''}" data-on-click="setSkin" data-arg="${id}" aria-label="${t(SKINS[id].name)}" aria-pressed="${d.skin === id}">${urnFig({ ...d, skin: id, text: '', line2: '', symbol: 'none', qr: false, art: null }, { size: '48px' })}</button>`)}</div>
${field(t('Engraving'), html`<input class="input" maxlength="28" value="${d.text}" data-on-input="dtext" autocomplete="off">`)}
<div class="row-gap">${btn(t('Roll the dice'), { on: 'roll', ic: 'dice', kind: 'ghost', size: 'sm' })}${btn(t('Full studio'), { href: '#/studio', ic: 'arrow', kind: 'ghost', size: 'sm' })}</div></div></div>`; };
  const sRemix = (b) => html`<p class="muted">${t('Optional. Pick any, or none.')}</p><div class="grid-cards remix-grid tight">${remixCards(b, pick)}</div>`;
  const sCeremony = (b) => html`<div class="stack">
<label class="switch"><input type="checkbox" ${b.livestream ? raw('checked') : ''} data-on-change="live"><span class="sw"></span><span><b>${t('Livestream with chat')}</b><small>${t('For everyone who cannot be there. +$39')}</small></span></label>
<div class="field-row">${field(t('Guests'), html`<input class="input" type="number" min="0" max="500" value="${b.guests}" data-on-input="guests">`)}
${b.remix.fireworks ? field(t('Fireworks time'), html`<input class="input" type="time" value="${b.fireworksAt}" data-field="fireworksAt" data-on-input="field">`) : ''}</div>
<h4 class="mini-h">${t('Playlist')}</h4>
<div class="song-add"><input class="input" maxlength="60" placeholder="${t('Song')}" value="${tmp.song}" data-field="song" data-on-input="songField" aria-label="${t('Song')}"><input class="input" maxlength="40" placeholder="${t('Artist')}" value="${tmp.artist}" data-field="artist" data-on-input="songField" aria-label="${t('Artist')}">${btn(t('Add'), { on: 'addSong', ic: 'plus', size: 'sm' })}</div>
${b.playlist.length ? html`<ol class="playlist">${b.playlist.map((s, i) => html`<li data-key="${i}-${s.title}"><span class="pl-n">${i + 1}</span><span><b>${s.title}</b>${s.artist ? html` <small>${s.artist}</small>` : ''}</span><button type="button" class="icon-btn" data-on-click="delSong" data-arg="${i}" aria-label="${t('Remove')}">${icon('x', 16)}</button></li>`)}</ol>` : html`<p class="muted">${t('Empty. The room will fall back to our house mix.')}</p>`}
<h4 class="mini-h">${t('Partner add-ons')}</h4><div class="grid-2">${PARTNERS.map((p) => html`<button type="button" class="card opt ${b.partners[p.id] ? 'on' : ''}" data-on-click="partner" data-arg="${p.id}" aria-pressed="${!!b.partners[p.id]}"><b>${t(p.name)}</b><span>${t(p.blurb)}</span><i class="price">${money(p.price)}</i></button>`)}</div></div>`;
  const sPickup = (b) => {
    const pts = tmp.points.length ? tmp.points : DROP_POINTS.map((p) => ({ ...p, free: CELL_IDS.filter((c) => !p.taken.includes(c)), total: 12 }));
    const sel = pts.find((p) => p.id === b.point) || pts[0];
    const names = Object.fromEntries(pts.map((p) => [p.id, t(p.name)]));
    return html`<div class="stack"><div class="seg" role="group">${[['courier', _('Courier comes to you')], ['cell', _('Drop-point cell')]].map(([id, l]) => html`<button type="button" class="${b.pick === id ? 'on' : ''}" data-on-click="pickKind" data-arg="${id}" aria-pressed="${b.pick === id}">${t(l)}</button>`)}</div>
${b.pick === 'courier' ? html`
${field(t('Pick-up address'), html`<input class="input" value="${b.address}" data-field="address" data-on-input="field" autocomplete="off" placeholder="${t('Street, number, floor')}">`)}
<div class="grid-2">${VEHICLES.map((v) => html`<button type="button" class="card opt ${b.vehicle === v.id ? 'on' : ''}" data-on-click="vehicle" data-arg="${v.id}" aria-pressed="${b.vehicle === v.id}"><b>${t(v.name)}</b><span>${t(v.blurb)}</span><i class="price">${money(v.price)}</i></button>`)}</div>
<div class="map-box" data-static="route">${raw(cityMap({ home: true, depot: true, route: buildRoute() }))}</div>`
: html`<p class="muted">${t('Tap a pin, then choose a free cell. After the cremation you get a 6-digit code for the door.')}</p>
<div class="map-box">${raw(cityMap({ points: pts, selected: sel.id, names }))}</div>
<div class="card pt-card"><div><b>${t(sel.name)}</b><small>${t(sel.addr)} · ${t('{n} free', { n: sel.free.length })}</small></div></div>
<div class="cells" role="group" aria-label="${t('Cells')}">${CELL_IDS.map((c) => { const free = sel.free.includes(c); return html`<button type="button" class="cell sel ${b.cell === c ? 'open' : ''} ${free ? '' : 'taken'}" ${free ? raw('') : raw('disabled')} data-on-click="pickCell" data-arg="${c}" aria-pressed="${b.cell === c}"><span class="cell-id">${c}</span><i class="cell-led"></i></button>`; })}</div>`}
<h4 class="mini-h">${t('When')}</h4>
<div class="chips">${[0, 1, 2].map((d) => chip(d === 0 ? t('Today') : d === 1 ? t('Tomorrow') : dateLabel(Date.now() + d * 864e5), { on: 'day', arg: d, active: b.day === d }))}</div>
<div class="grid-2">${SLOTS.map((s) => html`<button type="button" class="card opt ${b.slot === s.id ? 'on' : ''}" data-on-click="slot" data-arg="${s.id}" aria-pressed="${b.slot === s.id}"><b>${t(s.name)}</b><span>${t(s.hint)}</span><i class="price">${s.fee ? '+' + money(s.fee) : t('Free')}</i></button>`)}</div></div>`;
  };
  const sSign = (b) => html`<div class="stack"><p class="muted">${t('Draw your signature with a finger or mouse. It stays in this demo.')}</p>
<div class="sig-wrap" data-static="sig"><canvas id="sig" width="640" height="220" class="sig" data-on-pointerdown="sigDown" data-on-pointermove="sigMove" data-on-pointerup="sigUp" data-on-pointercancel="sigUp" aria-label="${t('Signature pad')}"></canvas></div>
<div class="row-gap">${btn(t('Clear'), { on: 'sigClear', kind: 'ghost', size: 'sm', ic: 'trash' })}${b.signature ? html`<span class="ok-tag">${icon('check', 14)} ${t('Captured')}</span>` : ''}</div>
${field(t('Type your full name'), html`<input class="input" value="${b.signedName}" data-field="signedName" data-on-input="field" autocomplete="off">`)}</div>`;
  const sReview = (b) => {
    const q = quote(b, D()), d = D(), plan = b.mode === 'plan';
    return html`<div class="review"><div class="ticket"><div class="ticket-top"><div>${urnFig(d, { size: '90px' })}</div><div><small>${plan ? t('Pre-plan') : t('Send-off ticket')}</small><h3>${b.name}</h3><span class="muted">${b.years}</span></div></div>
<ul class="lines">${q.lines.map((l) => html`<li><span>${l.label}</span><b>${money(l.amount)}</b></li>`)}${q.discount ? html`<li class="disc"><span>${q.codeNote}</span><b>-${money(q.discount)}</b></li>` : ''}<li class="total"><span>${t('Total')}</span><b>${money(q.total)}</b></li></ul>
<div class="ticket-cut"></div>
<div class="ticket-meta">${plan ? html`<span>${t('Nothing scheduled')}</span>` : html`<span>${b.pick === 'cell' ? `${t('Cell')} ${b.cell}` : t('Courier')}</span><span>${t(SLOTS.find((s) => s.id === b.slot).name)}</span>`}<span>+${q.points} ${t('legacy points')}</span></div></div>
<div class="stack">${field(t('Gift code'), html`<input class="input" value="${b.code}" data-field="code" data-on-input="field" autocomplete="off" placeholder="LOUD10" style="text-transform:uppercase">`, q.codeInvalid ? t('Code not recognised. Try LOUD10, LEGEND25 or GOODBOY.') : q.codeNote)}
${plan ? '' : html`<h4 class="mini-h">${t('Payment plan (display only)')}</h4><div class="chips">${[['full', t('Pay in full: {a}', { a: money(q.total) })], ['3', t('3 parts of {a}', { a: money(q.installments[3]) })], ['6', t('6 parts of {a}', { a: money(q.installments[6]) })]].map(([id, l]) => chip(l, { on: 'pay', arg: id, active: b.pay === id }))}</div><p class="note">${icon('info', 16)} ${t('Demo: no payment is taken, whatever you choose.')}</p>`}
<label class="switch"><input type="checkbox" ${b.agree ? raw('checked') : ''} data-field="agree" data-on-change="check"><span class="sw"></span><span><b>${t('I confirm the details and understand this is a demo')}</b></span></label>
${btn(tmp.busy ? t('Booking…') : plan ? t('Save my plan') : t('Confirm send-off'), { on: 'confirm', ic: 'flame', size: 'lg', disabled: tmp.busy })}</div></div>`;
  };
  const BODY = { legend: sLegend, urn: sUrn, remix: sRemix, ceremony: sCeremony, pickup: sPickup, sign: sSign, review: sReview };

  return {
    title: 'Book', handlers,
    after(root) {
      const c = root.querySelector('#sig');
      if (c && !c.dataset.init) { c.dataset.init = '1'; const s = B().signature; if (s) { const im = new Image(); im.onload = () => c.getContext('2d').drawImage(im, 0, 0); im.src = s; } }
    },
    render() {
      const b = B(), list = steps(), i = cur(), id = list[i], q = quote(b, D());
      return html`<div class="wrap page book">
<div class="page-head"><h1 class="display sm">${b.mode === 'plan' ? t('Pre-plan a send-off') : t('Book a send-off')}</h1></div>
<ol class="progress" aria-label="${t('Steps')}">${list.map((s, k) => html`<li class="${k === i ? 'on' : k < i ? 'done' : ''}"><button type="button" ${k < i ? '' : raw('tabindex="-1"')} data-on-click="jump" data-arg="${k}" ${k === i ? raw('aria-current="step"') : ''}><span class="pg-n">${k < i ? icon('check', 14) : k + 1}</span><span class="pg-l">${t(STEP_META[s][0])}</span></button></li>`)}</ol>
<div class="book-grid"><section class="card step-card"><h2>${t(STEP_META[id][0])}</h2>${BODY[id](b)}
<div class="step-nav">${i > 0 ? btn(t('Back'), { on: 'back', kind: 'ghost', ic: 'back' }) : html`<span></span>`}${id !== 'review' ? btn(t('Next'), { on: 'next', ic: 'arrow', disabled: false }) : ''}</div></section>
<aside class="book-side"><div class="card side-card">${urnFig(D(), { size: '110px' })}<div><b>${b.name || t('Your legend')}</b><small>${t(SHAPES[D().shape].name)} · ${t(SKINS[D().skin].name)}</small></div></div>
<div class="card side-total"><span>${t('Running total')}</span><b>${money(q.total)}</b><small>${q.lines.length} ${t('items')}</small></div></aside></div></div>`;
    },
  };
}

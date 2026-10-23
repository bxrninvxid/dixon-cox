// A tiny view layer: escaped html`` templates, a DOM morpher (keeps focus, scroll and
// input state while re-rendering) and delegated events via data-on-* attributes.
const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };
export const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ESC[c]);

class Safe { constructor(s) { this.s = s; } toString() { return this.s; } }
export const raw = (s) => new Safe(String(s));
const val = (v) => {
  if (v == null || v === false || v === true) return '';
  if (v instanceof Safe) return v.s;
  if (Array.isArray(v)) return v.map(val).join('');
  return esc(v);
};
export function html(strings, ...vals) {
  let o = strings[0];
  for (let i = 0; i < vals.length; i++) o += val(vals[i]) + strings[i + 1];
  return new Safe(o);
}
export const cls = (...a) => a.filter(Boolean).join(' ');

/* ---------------- morph ---------------- */
const keyOf = (n) => (n.nodeType === 1 ? n.getAttribute('data-key') : null);
const same = (o, n) => o.nodeType === n.nodeType && (o.nodeType !== 1 || (o.nodeName === n.nodeName && o.namespaceURI === n.namespaceURI));

function patchAttrs(o, n) {
  for (const a of Array.from(o.attributes)) if (!n.hasAttribute(a.name)) o.removeAttribute(a.name);
  for (const a of Array.from(n.attributes)) if (o.getAttribute(a.name) !== a.value) o.setAttribute(a.name, a.value);
}
function patch(o, n) {
  if (o.nodeType !== 1) { if (o.nodeValue !== n.nodeValue) o.nodeValue = n.nodeValue; return; }
  const st = o.getAttribute('data-static');
  if (st && st === n.getAttribute('data-static')) return;
  patchAttrs(o, n);
  const tag = o.nodeName;
  if (tag === 'TEXTAREA') { if (document.activeElement !== o && o.value !== n.textContent) o.value = n.textContent; return; }
  patchChildren(o, n);
  if (tag === 'INPUT') {
    if (o.type === 'checkbox' || o.type === 'radio') o.checked = n.hasAttribute('checked');
    else if (o.type !== 'file') { const v = n.getAttribute('value') ?? ''; if (o.value !== v && document.activeElement !== o) o.value = v; }
  } else if (tag === 'SELECT') {
    const sel = n.querySelector('option[selected]');
    if (sel) o.value = sel.getAttribute('value') ?? sel.textContent;
  }
}
function patchChildren(parent, src) {
  const olds = Array.from(parent.childNodes), news = Array.from(src.childNodes);
  const keyed = new Map();
  for (const o of olds) { const k = keyOf(o); if (k != null) keyed.set(k, o); }
  const used = new Set();
  let cursor = 0;
  const nextPlain = () => { while (cursor < olds.length) { const o = olds[cursor++]; if (!used.has(o) && keyOf(o) == null) return o; } return null; };
  const result = [];
  for (const n of news) {
    const k = keyOf(n);
    let m = null;
    if (k != null) { m = keyed.get(k) || null; if (m && used.has(m)) m = null; }
    else {
      // look ahead one plain node; if tags differ, treat as insertion
      const save = cursor; const cand = nextPlain();
      if (cand && same(cand, n)) m = cand; else cursor = save;
    }
    if (m && same(m, n)) { used.add(m); patch(m, n); result.push(m); }
    else result.push(document.importNode(n, true));
  }
  result.forEach((node, i) => { if (parent.childNodes[i] !== node) parent.insertBefore(node, parent.childNodes[i] || null); });
  while (parent.childNodes.length > result.length) parent.removeChild(parent.lastChild);
}
export function morph(root, markup) {
  const tpl = document.createElement('template');
  tpl.innerHTML = markup instanceof Safe ? markup.s : String(markup);
  patchChildren(root, tpl.content);
}

/* ---------------- mounting + events ---------------- */
const EVENTS = ['click', 'input', 'change', 'submit', 'keydown', 'pointerdown', 'pointermove', 'pointerup', 'pointercancel', 'dragover', 'drop'];

// page = { render(): Safe, handlers: {name(el, ev)}, after?(root), destroy?() }
export function mountView(root, page) {
  let scheduled = false, dead = false;
  const run = () => { scheduled = false; if (dead) return; morph(root, page.render()); if (page.after) page.after(root); };
  const update = () => { if (!scheduled && !dead) { scheduled = true; queueMicrotask(run); } };
  const listeners = EVENTS.map((type) => {
    const attr = `data-on-${type}`;
    const fn = (ev) => {
      const el = ev.target && ev.target.closest ? ev.target.closest(`[${attr}]`) : null;
      if (!el || !root.contains(el)) return;
      const name = el.getAttribute(attr), h = page.handlers && page.handlers[name];
      if (!h) return;
      if (type === 'submit' || type === 'dragover' || type === 'drop') ev.preventDefault();
      const r = h(el, ev);
      if (r !== false) update();
    };
    root.addEventListener(type, fn);
    return [type, fn];
  });
  run();
  return {
    update, updateNow: run,
    destroy() { dead = true; listeners.forEach(([t, f]) => root.removeEventListener(t, f)); if (page.destroy) page.destroy(); },
  };
}

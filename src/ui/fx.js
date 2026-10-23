// Tiny effects: confetti, toast and the chart tooltip. All respect prefers-reduced-motion.
const reduce = () => typeof matchMedia !== 'undefined' && matchMedia('(prefers-reduced-motion: reduce)').matches;
const COLORS = ['#ff4d5a', '#ffc72c', '#1fd1a0', '#6a3df0', '#3bb6ff', '#ff8ac9'];

export function confetti(x = innerWidth / 2, y = innerHeight / 3, count = 90) {
  if (reduce()) return;
  const c = document.createElement('canvas');
  c.className = 'fx-confetti'; c.width = innerWidth; c.height = innerHeight;
  document.body.appendChild(c);
  const g = c.getContext('2d');
  const ps = Array.from({ length: count }, () => ({ x, y, vx: (Math.random() - 0.5) * 14, vy: -Math.random() * 14 - 4, s: 5 + Math.random() * 6, r: Math.random() * 6, vr: (Math.random() - 0.5) * 0.4, col: COLORS[(Math.random() * COLORS.length) | 0], shape: Math.random() < 0.3 }));
  let t = 0;
  (function tick() {
    g.clearRect(0, 0, c.width, c.height);
    ps.forEach((p) => { p.vy += 0.38; p.x += p.vx; p.y += p.vy; p.vx *= 0.99; p.r += p.vr; g.save(); g.translate(p.x, p.y); g.rotate(p.r); g.fillStyle = p.col; if (p.shape) { g.beginPath(); g.arc(0, 0, p.s / 2, 0, 7); g.fill(); } else g.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); g.restore(); });
    if (++t < 120) requestAnimationFrame(tick); else c.remove();
  })();
}

export function toast(msg, kind = 'ok') {
  let host = document.getElementById('toasts');
  if (!host) { host = document.createElement('div'); host.id = 'toasts'; host.setAttribute('role', 'status'); host.setAttribute('aria-live', 'polite'); document.body.appendChild(host); }
  const el = document.createElement('div');
  el.className = 'toast toast-' + kind; el.textContent = msg;
  host.appendChild(el);
  setTimeout(() => { el.classList.add('out'); setTimeout(() => el.remove(), 250); }, 2800);
}

export function installTooltip() {
  const tip = document.createElement('div');
  tip.className = 'tip'; tip.hidden = true; document.body.appendChild(tip);
  const show = (e) => {
    const el = e.target.closest && e.target.closest('[data-tip]');
    if (!el) { tip.hidden = true; return; }
    tip.textContent = el.getAttribute('data-tip'); tip.hidden = false;
    const r = tip.getBoundingClientRect();
    tip.style.left = Math.min(innerWidth - r.width - 8, Math.max(8, e.clientX + 14)) + 'px';
    tip.style.top = Math.max(8, e.clientY - r.height - 12) + 'px';
  };
  document.addEventListener('pointermove', show); document.addEventListener('pointerleave', () => { tip.hidden = true; }, true);
}

export async function copyText(s) {
  try { await navigator.clipboard.writeText(s); return true; } catch (e) {
    const ta = document.createElement('textarea'); ta.value = s; document.body.appendChild(ta); ta.select();
    let ok = false; try { ok = document.execCommand('copy'); } catch (er) { ok = false; } ta.remove(); return ok;
  }
}

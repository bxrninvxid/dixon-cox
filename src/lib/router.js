// Hash router: '#/m/abc123?x=1' -> { name:'memorial', params:{id:'abc123'}, query:{x:'1'} }
export function parseHash(hash) {
  const h = String(hash || '').replace(/^#/, '') || '/';
  const [p, qs] = h.split('?');
  const path = '/' + p.split('/').filter(Boolean).join('/');
  return { path, query: Object.fromEntries(new URLSearchParams(qs || '')) };
}
export function matchRoute(table, path) {
  const b = path.split('/').filter(Boolean);
  for (const [pattern, name] of table) {
    const a = pattern.split('/').filter(Boolean);
    if (a.length !== b.length) continue;
    const params = {};
    let ok = true;
    for (let i = 0; i < a.length; i++) {
      if (a[i][0] === ':') params[a[i].slice(1)] = decodeURIComponent(b[i]);
      else if (a[i] !== b[i]) { ok = false; break; }
    }
    if (ok) return { name, params };
  }
  return null;
}
export const href = (path) => '#' + path;
export function navigate(path) { if (typeof location !== 'undefined') location.hash = path; }

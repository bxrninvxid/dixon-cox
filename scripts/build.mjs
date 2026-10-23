// Zero-dependency build. Produces:
//   dist/                      a static site (index.html + one JS file + CSS + fonts), ready for any host
//   dist/dixon-cox-demo.html   the whole app in ONE file (JS, CSS and fonts inlined), double-click to run
// The source uses native ES modules, so GitHub Pages can also serve the repo root as-is.
// This mini-bundler needs a constrained syntax: named imports/exports only, no default exports,
// no dynamic import(), no import cycles. scripts/build.mjs fails loudly if a rule is broken.
import { mkdir, readFile, writeFile, rm, cp } from 'node:fs/promises';
import { dirname, join, relative, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)));
const dist = join(root, 'dist');
const IMPORT = /import\s*\{([^}]*)\}\s*from\s*(['"])([^'"]+)\2\s*;?/g;

const mods = new Map(); // abs path -> { id, deps, code, exports }
const order = [];
const idOf = (p) => '__m_' + relative(join(root, 'src'), p).replace(/\.js$/, '').replace(/[^A-Za-z0-9]/g, '_');

async function load(file, stack = []) {
  if (mods.has(file)) { if (stack.includes(file)) throw new Error('Import cycle: ' + [...stack, file].map((f) => relative(root, f)).join(' -> ')); return; }
  const rec = { id: idOf(file), exports: [] };
  mods.set(file, rec);
  let src = await readFile(file, 'utf8');
  if (/\bexport\s+default\b/.test(src)) throw new Error('default export not supported: ' + file);
  if (/(^|[^.\w])import\s*\(/.test(src)) throw new Error('dynamic import not supported: ' + file);
  if (/^\s*import\s+(?!\{)[^\n]*from/m.test(src) || /^\s*export\s+\*/m.test(src)) throw new Error('only named imports/exports are supported: ' + file);
  const deps = [];
  src = src.replace(IMPORT, (m, names, q, spec) => {
    const dep = resolve(dirname(file), spec);
    deps.push(dep);
    const binds = names.split(',').map((s) => s.trim()).filter(Boolean).map((s) => s.replace(/\s+as\s+/, ': '));
    return `const { ${binds.join(', ')} } = DEP(${JSON.stringify(dep)});`;
  });
  for (const d of deps) await load(d, [...stack, file]);
  src = src.replace(/^export\s+(const|let|var|function\*?|async function|class)\s+([A-Za-z_$][\w$]*)/gm, (m, kw, name) => { rec.exports.push([name, name]); return `${kw} ${name}`; });
  src = src.replace(/^export\s*\{([^}]*)\}\s*;?/gm, (m, names) => {
    names.split(',').map((s) => s.trim()).filter(Boolean).forEach((n) => { const [a, b] = n.split(/\s+as\s+/); rec.exports.push([b || a, a]); });
    return '';
  });
  rec.code = src; rec.deps = deps;
  order.push(file);
}

async function bundle() {
  await load(join(root, 'src/main.js'));
  let out = '(function () {\n"use strict";\nconst __mods = {};\nconst DEP = (p) => __mods[p];\n';
  for (const f of order) {
    const m = mods.get(f);
    out += `__mods[${JSON.stringify(f)}] = (function () {\n${m.code}\nreturn { ${m.exports.map(([k, v]) => (k === v ? k : `${k}: ${v}`)).join(', ')} };\n})();\n`;
  }
  // main.js has no exports; it ran on definition
  return out.split(root).join('') + '})();\n';
}
const minify = (js) => js.replace(/^\s*\/\/(?!#).*$/gm, '').replace(/\n{2,}/g, '\n');

async function main() {
  const t0 = Date.now();
  await rm(dist, { recursive: true, force: true });
  await mkdir(join(dist, 'assets'), { recursive: true });
  const js = minify(await bundle());
  const cssSrc = await readFile(join(root, 'src/styles/main.css'), 'utf8');
  const fonts = {};
  for (const m of cssSrc.matchAll(/url\('\.\.\/\.\.\/fonts\/([^']+)'\)/g)) fonts[m[1]] = null;
  const html = await readFile(join(root, 'index.html'), 'utf8');

  // 1) static site
  await cp(join(root, 'fonts'), join(dist, 'fonts'), { recursive: true });
  await cp(join(root, 'favicon.svg'), join(dist, 'favicon.svg'));
  try { await cp(join(root, 'docs/social.png'), join(dist, 'docs/social.png')); } catch (e) { /* optional */ }
  await writeFile(join(dist, 'assets/app.js'), js);
  await writeFile(join(dist, 'assets/main.css'), cssSrc.split("url('../../fonts/").join("url('../fonts/"));
  await writeFile(join(dist, 'index.html'), html.replace('src/styles/main.css', 'assets/main.css').replace('<script type="module" src="src/main.js"></script>', '<script src="assets/app.js" defer></script>'));
  await writeFile(join(dist, '.nojekyll'), '');

  // 2) single file
  let css = cssSrc;
  const map = {};
  for (const f of Object.keys(fonts)) {
    const b64 = (await readFile(join(root, 'fonts', f))).toString('base64');
    map[f] = `data:font/woff;base64,${b64}`;
    css = css.split(`url('../../fonts/${f}')`).join(`url(${map[f]})`);
  }
  const fav = 'data:image/svg+xml;base64,' + (await readFile(join(root, 'favicon.svg'))).toString('base64');
  const one = html
    .replace(/<meta property="og:image"[^>]*>\n?/, '')
    .replace('<link rel="icon" href="favicon.svg" type="image/svg+xml">', `<link rel="icon" href="${fav}" type="image/svg+xml">`)
    .replace('<link rel="stylesheet" href="src/styles/main.css">', () => `<style>\n${css}</style>`)
    .replace('<script type="module" src="src/main.js"></script>', () => `<script>window.__DX_FONTS=${JSON.stringify(map)};</script>\n<script>\n${js.replace(/<\/script/gi, '<\\/script')}</script>`);
  await writeFile(join(dist, 'dixon-cox-demo.html'), one);
  console.log(`built in ${Date.now() - t0} ms: dist/index.html (${(js.length / 1024).toFixed(0)} KB js), dist/dixon-cox-demo.html (${(one.length / 1024).toFixed(0)} KB)`);
}
main().catch((e) => { console.error('Build failed:', e.message); process.exit(1); });

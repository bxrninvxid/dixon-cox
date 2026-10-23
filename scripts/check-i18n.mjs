// Extracts every t('..') / _('..') string from src and checks the Ukrainian dictionary covers it.
// Usage: node scripts/check-i18n.mjs [--list]   (exit code 1 when strings are missing)
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = resolve(fileURLToPath(new URL('..', import.meta.url)), 'src');
export function extract() {
  const found = new Set();
  const walk = (d) => {
    for (const f of readdirSync(d)) {
      const p = join(d, f);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      if (!p.endsWith('.js') || p.includes(join('src', 'locales'))) continue;
      const src = readFileSync(p, 'utf8');
      for (const m of src.matchAll(/(?<![A-Za-z0-9_$.])(?:t|_)\(\s*(['"`])((?:\\.|(?!\1)[^\\])*)\1/g)) {
        const s = m[2].replace(/\\'/g, "'").replace(/\\"/g, '"').replace(/\\n/g, '\n');
        if (!s.includes('${') && s.trim()) found.add(s);
      }
    }
  };
  walk(root);
  return [...found].sort();
}
if (process.argv[1] && resolve(process.argv[1]) === resolve(fileURLToPath(import.meta.url))) {
  const { uk } = await import('../src/locales/uk.js');
  const all = extract(), missing = all.filter((s) => !(s in uk)), unused = Object.keys(uk).filter((k) => !all.includes(k));
  if (process.argv.includes('--list')) console.log(JSON.stringify(missing, null, 1));
  console.log(`${all.length} strings, ${all.length - missing.length} translated, ${missing.length} missing, ${unused.length} unused`);
  if (unused.length) console.log('unused:', unused.slice(0, 10));
  process.exit(missing.length ? 1 : 0);
}

// Gettext-style i18n: the English source string is the key.
// `_()` marks strings in data files so scripts/check-i18n.mjs can find them.
let lang = 'en';
const dicts = {};

export const _ = (s) => s;
export function registerLocale(code, dict) { dicts[code] = dict; }
export function locales() { return ['en', ...Object.keys(dicts)]; }
export function setLang(l) {
  lang = l === 'en' || dicts[l] ? l : 'en';
  if (typeof document !== 'undefined') document.documentElement.lang = lang;
  return lang;
}
export function getLang() { return lang; }

export function t(s, vars) {
  let out = (lang !== 'en' && dicts[lang] && dicts[lang][s]) || s;
  if (vars) out = out.replace(/\{(\w+)\}/g, (m, k) => (vars[k] !== undefined ? vars[k] : m));
  return out;
}

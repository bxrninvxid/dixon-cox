import { getLang } from './i18n.js';

export const money = (n) => {
  const v = Math.round(n * 100) / 100;
  return (v < 0 ? '-$' : '$') + Math.abs(v).toLocaleString('en-US', { minimumFractionDigits: Number.isInteger(v) ? 0 : 2, maximumFractionDigits: 2 });
};
export const num = (n) => Number(n).toLocaleString(getLang() === 'uk' ? 'uk-UA' : 'en-US');
export function ago(ts, now = Date.now()) {
  const s = Math.max(1, Math.round((now - ts) / 1000));
  const rtf = new Intl.RelativeTimeFormat(getLang() === 'uk' ? 'uk' : 'en', { numeric: 'auto' });
  if (s < 60) return rtf.format(-s, 'second');
  if (s < 3600) return rtf.format(-Math.round(s / 60), 'minute');
  if (s < 86400) return rtf.format(-Math.round(s / 3600), 'hour');
  return rtf.format(-Math.round(s / 86400), 'day');
}
export function dateLabel(ts, opts = { weekday: 'short', day: 'numeric', month: 'short' }) {
  return new Intl.DateTimeFormat(getLang() === 'uk' ? 'uk-UA' : 'en-US', opts).format(new Date(ts));
}
export function clock(ts) { return new Intl.DateTimeFormat(getLang() === 'uk' ? 'uk-UA' : 'en-US', { hour: '2-digit', minute: '2-digit' }).format(new Date(ts)); }
export const slug = (s) => String(s).toLowerCase().replace(/[^a-z0-9а-яіїєґ]+/gi, '-').replace(/^-|-$/g, '');
export const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

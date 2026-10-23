// Engraving symbols: 24x24 glyphs drawn with currentColor.
import { _ } from '../lib/i18n.js';

export const SYMBOLS = {
  none: { label: _('None'), svg: '' },
  star: { label: _('Star'), svg: '<path fill="currentColor" d="M12 2.2l2.9 6.6 7.1.7-5.4 4.7 1.6 7-6.2-3.7-6.2 3.7 1.6-7L2 9.5l7.1-.7z"/>' },
  bolt: { label: _('Bolt'), svg: '<path fill="currentColor" d="M13.5 2L4.5 13.6h6L9 22l10.5-12.6h-6.3z"/>' },
  heart: { label: _('Heart'), svg: '<path fill="currentColor" d="M12 21.2C6 17 2.6 13.4 2.6 9.2A4.9 4.9 0 0 1 12 7.1a4.9 4.9 0 0 1 9.4 2.1c0 4.2-3.4 7.8-9.4 12z"/>' },
  skull: { label: _('Skull'), svg: '<path fill="currentColor" fill-rule="evenodd" d="M12 2.4c-4.6 0-8 3.2-8 7.6 0 2.6 1.2 4.4 3 5.4v3.2c0 .8.6 1.4 1.4 1.4H9v-2h2v2h2v-2h2v2h.6c.8 0 1.4-.6 1.4-1.4v-3.2c1.8-1 3-2.8 3-5.4 0-4.4-3.4-7.6-8-7.6zM8.6 12.6a2 2 0 1 1 0-4 2 2 0 0 1 0 4zm6.8 0a2 2 0 1 1 0-4 2 2 0 0 1 0 4z"/>' },
  note: { label: _('Music'), svg: '<g fill="currentColor"><ellipse cx="7" cy="18" rx="3.6" ry="2.8"/><ellipse cx="17" cy="16" rx="3.6" ry="2.8"/><path d="M9.6 18V5.4l10.2-2V16h-2.4V6.7L12 7.9V18z"/></g>' },
  infinity: { label: _('Infinity'), svg: '<path fill="none" stroke="currentColor" stroke-width="2.6" stroke-linejoin="round" d="M12 12c-2-3-3.8-4.6-6-4.6a4.6 4.6 0 1 0 0 9.2c2.2 0 4-1.6 6-4.6zm0 0c2 3 3.8 4.6 6 4.6a4.6 4.6 0 1 0 0-9.2c-2.2 0-4 1.6-6 4.6z"/>' },
  flame: { label: _('Flame'), svg: '<path fill="currentColor" d="M12.4 2.2c.6 3.6 5.8 5.8 5.8 11.4a6.2 6.2 0 0 1-12.4 0c0-2.8 1.4-4.4 2.6-6 .4 1.6 1.2 2.6 2.2 3 .8-1.8.6-5.4 1.8-8.4z"/>' },
  paw: { label: _('Paw'), svg: '<g fill="currentColor"><ellipse cx="5.6" cy="11" rx="2.2" ry="3"/><ellipse cx="9.6" cy="5.8" rx="2.2" ry="3"/><ellipse cx="14.4" cy="5.8" rx="2.2" ry="3"/><ellipse cx="18.4" cy="11" rx="2.2" ry="3"/><path d="M12 11.4c-3 0-6 3.4-6 6.2 0 2 1.6 2.7 3 2.7 1.1 0 1.9-.5 3-.5s1.9.5 3 .5c1.4 0 3-.7 3-2.7 0-2.8-3-6.2-6-6.2z"/></g>' },
  crown: { label: _('Crown'), svg: '<path fill="currentColor" d="M3 19.4h18v2.2H3zM3.4 6.6l4.6 4.2L12 4l4 6.8 4.6-4.2-1.8 11H5.2z"/>' },
  flower: { label: _('Flower'), svg: '<g fill="currentColor"><ellipse cx="12" cy="6.2" rx="3.2" ry="4.4"/><ellipse cx="12" cy="6.2" rx="3.2" ry="4.4" transform="rotate(72 12 12)"/><ellipse cx="12" cy="6.2" rx="3.2" ry="4.4" transform="rotate(144 12 12)"/><ellipse cx="12" cy="6.2" rx="3.2" ry="4.4" transform="rotate(216 12 12)"/><ellipse cx="12" cy="6.2" rx="3.2" ry="4.4" transform="rotate(288 12 12)"/></g><circle cx="12" cy="12" r="2.4" fill="#000" fill-opacity=".35"/>' },
};
export const SYMBOL_IDS = Object.keys(SYMBOLS);

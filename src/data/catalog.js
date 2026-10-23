// Static catalog: everything you can buy, pick up from, or read about.
import { _ } from '../lib/i18n.js';

export const BASE_PRICE = { human: 299, pet: 199 };
export const EXPRESS_FEE = 99;
export const LIVESTREAM_FEE = 39;
export const ENGRAVING_FEE = 29;
export const SPEAKER_FEE = 35;
export const ART_FEE = 15;
export const RAINBOW_FEE = 25;

export const REMIXES = [
  { id: 'vinyl', name: _('Vinyl record'), price: 249, blurb: _('Pressed with a pinch of ashes. The groove holds a song, a voicemail or a story.'),
    variants: [{ id: '7', label: _('7" single'), price: 0 }, { id: '12', label: _('12" LP'), price: 90 }], field: { label: _('Track or message title'), ph: _('e.g. Voicemail from the lake house') } },
  { id: 'keychain', name: _('Keychain'), price: 59, blurb: _('A sealed capsule that rides in your pocket and survives your keys.'),
    variants: [{ id: 'steel', label: _('Steel'), price: 0 }, { id: 'gold', label: _('Gold-plated'), price: 30 }] },
  { id: 'figurine', name: _('Figurine'), price: 189, blurb: _('A hand-finished designer-toy statue of the legend, on its own plinth.'),
    variants: [{ id: 's', label: _('10 cm'), price: 0 }, { id: 'l', label: _('18 cm'), price: 110 }] },
  { id: 'diamond', name: _('Memorial diamond'), price: 1299, blurb: _('Carbon from the ashes, grown into a gem and set in a ring or pendant.'),
    variants: [{ id: '03', label: _('0.3 ct'), price: 0 }, { id: '05', label: _('0.5 ct'), price: 900 }, { id: '10', label: _('1.0 ct'), price: 3200 }] },
  { id: 'ink', name: _('Tattoo ink'), price: 89, blurb: _('A drop of them in your next piece. Studio-ready bottle, sterile-sealed.'),
    variants: [{ id: '15', label: _('15 ml'), price: 0 }, { id: '30', label: _('30 ml'), price: 40 }] },
  { id: 'fireworks', name: _('Fireworks launch'), price: 399, blurb: _('A send-off show with a livestream link for everyone who cannot be there.'),
    variants: [{ id: '3', label: _('3-minute show'), price: 0 }, { id: '8', label: _('8-minute finale'), price: 350 }] },
  { id: 'orb', name: _('Glass orb'), price: 149, blurb: _('Swirled into hand-blown glass. Looks great on a shelf, glows in sunlight.'),
    variants: [{ id: 'aurora', label: _('Aurora'), price: 0 }, { id: 'ember', label: _('Ember'), price: 0 }, { id: 'ocean', label: _('Ocean'), price: 0 }] },
  { id: 'nature', name: _('Reef ball or tree pod'), price: 499, blurb: _('Return to nature, still loudly: a reef ball for the sea or a pod that grows a tree.'),
    variants: [{ id: 'reef', label: _('Reef ball'), price: 0 }, { id: 'tree', label: _('Tree pod'), price: 0 }] },
  { id: 'space', name: _('Space send-off'), price: 2999, blurb: _('A partner flight to orbit or the moon. The top shelf of going out loud.'),
    variants: [{ id: 'orbit', label: _('Low orbit'), price: 0 }, { id: 'moon', label: _('Lunar flyby'), price: 4000 }] },
  { id: 'pendant', name: _('Vial pendant'), price: 79, blurb: _('A tiny glass vial on a chain. Close to the heart, easy to wear.'),
    variants: [{ id: 'silver', label: _('Silver'), price: 0 }, { id: 'gold', label: _('Gold'), price: 40 }] },
];
export const remixById = (id) => REMIXES.find((r) => r.id === id);

export const PARTNERS = [
  { id: 'flowers', name: _('Petal Riot florists'), price: 79, blurb: _('Loud bouquets, zero lilies.') },
  { id: 'catering', name: _('Last Supper Co.'), price: 299, blurb: _('Street food for the whole crew.') },
  { id: 'venue', name: _('Afterparty Hall'), price: 450, blurb: _('A room with a stage and a great sound system.') },
];

export const VEHICLES = [
  { id: 'van', name: _('Discreet van'), price: 49, blurb: _('Unmarked, quiet, on time.') },
  { id: 'bike', name: _('Flashy hearse-bike'), price: 79, blurb: _('Chrome, banners and a very loud horn.') },
];

export const SLOTS = [
  { id: 'express', name: _('Within the hour'), fee: EXPRESS_FEE, hint: _('Express, we run'), offsetMin: 25 },
  { id: 'tonight', name: _('Tonight'), fee: 0, hint: _('Around 22:00'), hour: 22 },
  { id: 'morning', name: _('Morning'), fee: 0, hint: _('Around 09:00'), hour: 9 },
  { id: 'afternoon', name: _('Afternoon'), fee: 0, hint: _('Around 15:00'), hour: 15 },
];

export const GIFT_CODES = {
  LOUD10: { pct: 10, label: _('10% off, thanks for being loud') },
  LEGEND25: { flat: 25, label: _('$25 off a legend') },
  GOODBOY: { pct: 15, label: _('15% off a pet send-off'), petOnly: true },
};

// City map: 800 x 520. Streets run on this grid; markers sit on intersections.
export const MAP = {
  w: 800, h: 520, xs: [60, 170, 280, 390, 500, 610, 720], ys: [70, 155, 240, 325, 410, 490],
  depot: { x: 390, y: 70 }, home: { x: 610, y: 410 },
};
export const DROP_POINTS = [
  { id: 'nm', name: _('Night Market lockers'), addr: _('12 Lantern Row'), x: 280, y: 155, taken: ['A2', 'B1', 'B4', 'C3'] },
  { id: 'cs', name: _('Central Station cells'), addr: _('Platform 4, east hall'), x: 500, y: 325, taken: ['A1', 'A3', 'B2', 'B3', 'C1', 'C4'] },
  { id: 'hg', name: _('Harbor Gate cells'), addr: _('Pier 9 gatehouse'), x: 170, y: 410, taken: ['A4', 'C2'] },
  { id: 'ot', name: _('Old Town Arcade'), addr: _('3 Clocktower Passage'), x: 610, y: 155, taken: ['B2', 'B3', 'C1'] },
];
export const CELL_IDS = ['A1', 'A2', 'A3', 'A4', 'B1', 'B2', 'B3', 'B4', 'C1', 'C2', 'C3', 'C4'];

export const TRAITS = [
  { id: 'karaoke', label: _('karaoke all-star'), line: _('never met a microphone they did not like') },
  { id: 'hotsauce', label: _('hot sauce on everything'), line: _('put hot sauce on things that did not ask for it') },
  { id: 'late', label: _('always fashionably late'), line: _('arrived late to everything except this one') },
  { id: 'hugs', label: _('world-class hugger'), line: _('gave hugs that fixed Tuesdays') },
  { id: 'gamer', label: _('gamer'), line: _('finished the final boss and then did it again on hard') },
  { id: 'nightowl', label: _('night owl'), line: _('did their best work after midnight') },
  { id: 'laugh', label: _('made everyone laugh'), line: _('could make a funeral director snort') },
  { id: 'driver', label: _('terrible driver, great friend'), line: _('took the scenic route every single time') },
];
export const VIBES = [
  { id: 'legend', label: _('Legendary') }, { id: 'wholesome', label: _('Wholesome') },
  { id: 'chaos', label: _('Chaotic') }, { id: 'cool', label: _('Cool and calm') },
];

export const REACTIONS = [{ id: 'flame', label: _('Fire') }, { id: 'heart', label: _('Love') }, { id: 'star', label: _('Legend') }];

export const FAQ = [
  { q: _('How fast is fast?'), a: _('Our fastest send-off took 47 minutes from pick-up to ready. Most land in a few hours. Express slots jump the queue.') },
  { q: _('What is a drop-point cell?'), a: _('A self-service locker bank in the city. Book a cell, get a 6-digit code, and the door unlocks when you punch it in. No small talk, no waiting.') },
  { q: _('Can I design the urn myself?'), a: _('Yes. Pick a shape and a skin, add engraving, LED, a QR memorial code and even your own artwork. Roll the dice if you want a surprise.') },
  { q: _('What are the rarity tiers?'), a: _('Skins come as Common, Rare, Epic or Legendary. Rarer skins cost more and look wilder. Legends deserve loot drops.') },
  { q: _('Is the public feed private?'), a: _('Posting is opt-in, always. You choose whether a send-off appears, and you can take it down any time.') },
  { q: _('Can we plan ahead?'), a: _('Pre-plan mode lets you design the whole send-off now and keep it on file. Nothing is scheduled until you say so.') },
  { q: _('Is this real?'), a: _('This is a demo. No payments are taken, nobody is cremated, and every name in the feed is made up. The code is yours to read.') },
];

export const MERCH = [
  { id: 'tee', name: _('Go out loud tee'), price: 32 }, { id: 'cap', name: _('Chrome-stitch cap'), price: 28 },
  { id: 'tote', name: _('Legend tote bag'), price: 22 }, { id: 'mug', name: _('Ashes to ashes mug'), price: 18 },
  { id: 'pin', name: _('Enamel urn pin'), price: 12 }, { id: 'stickers', name: _('Sticker sheet'), price: 8 },
  { id: 'poster', name: _('Rarity chart poster'), price: 24 },
];

export const POINT_TIERS = [
  { id: 'rookie', name: _('Rookie'), min: 0 }, { id: 'regular', name: _('Regular'), min: 100 },
  { id: 'legend', name: _('Legend'), min: 500 }, { id: 'immortal', name: _('Immortal'), min: 2000 },
];
export const PERKS = [
  { points: 50, label: _('Free sticker sheet with any order') }, { points: 150, label: _('One free skin re-roll') },
  { points: 400, label: _('Engraving on the house') }, { points: 1000, label: _('Free express slot') },
];

// "Tribute writer": a playful template generator (not a real AI), bilingual. Pure function.
import { TRAITS } from '../data/catalog.js';

const T = {
  en: {
    legend: ['{name} did not live a life, they hosted an event. {traits}. Now the whole room is on its feet. Go out loud, {first}.', 'Let the record show: {first} was a legend. {traits}. The encore is on us.'],
    wholesome: ['{name} made the world a little softer. {traits}. We will keep the porch light on, {first}.', 'Gentle, generous and always there. {traits}. Thank you, {first}, for all of it.'],
    chaos: ['{name} was chaos in a good jacket. {traits}. Nobody had a boring day around {first}, and we are not starting now.', 'Plan? What plan. {traits}. {first} improvised until the very last scene.'],
    cool: ['{name} never rushed, never panicked. {traits}. Quiet legends leave the loudest silence, {first}.', 'Calm as a lake at dawn. {traits}. Rest easy, {first}.'],
    pet: '{name}: the best friend anyone could have. {traits}. Good {kind}.', join: ', and ', none: 'No notes. Pure legend.', kind: 'one',
  },
  uk: {
    legend: ['{name} не прожив життя, а влаштував подію. {traits}. Тепер зала аплодує стоячи. Іди гучно, {first}.', 'Занесіть до протоколу: {first} був легендою. {traits}. Біс за наш рахунок.'],
    wholesome: ['{name} робив світ трохи м’якшим. {traits}. Ми лишимо світло на ґанку, {first}.', 'Лагідний, щедрий і завжди поруч. {traits}. Дякуємо тобі, {first}, за все.'],
    chaos: ['{name} був хаосом у гарній куртці. {traits}. З {first} не було нудних днів, і ми не збираємося починати.', 'План? Який план. {traits}. {first} імпровізував до останньої сцени.'],
    cool: ['{name} ніколи не поспішав і не панікував. {traits}. Тихі легенди залишають найгучнішу тишу, {first}.', 'Спокійний, як озеро на світанку. {traits}. Спи спокійно, {first}.'],
    pet: '{name}: найкращий друг, якого можна мати. {traits}. Хороший {kind}.', join: ', а ще ', none: 'Без зауважень. Чиста легенда.', kind: 'хлопчик',
  },
};
const TR_UK = {
  karaoke: 'не знав мікрофона, який би йому не сподобався', hotsauce: 'додавав гострий соус туди, де його не просили', late: 'запізнювався всюди, крім цього разу',
  hugs: 'обіймав так, що вівторки ставали кращими', gamer: 'проходив фінального боса, а потім ще раз на складному', nightowl: 'найкраще працював після опівночі',
  laugh: 'міг розсмішити навіть ритуального агента', driver: 'кожного разу їхав мальовничим шляхом',
};

export function writeTribute({ name = '', vibe = 'legend', traits = [], kind = 'human', lang = 'en', pick = 0 } = {}) {
  const L = T[lang] || T.en, nm = String(name).trim() || (lang === 'uk' ? 'Наш друг' : 'Our friend'), first = nm.split(/\s+/)[0].replace(/[“”"]/g, '');
  const lines = traits.map((id) => { const tr = TRAITS.find((x) => x.id === id); if (!tr) return ''; return lang === 'uk' ? TR_UK[id] : tr.line; }).filter(Boolean);
  const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
  const tx = lines.length ? cap(lines.slice(0, 3).join(L.join)) : L.none;
  const tpl = kind === 'pet' ? L.pet : (L[vibe] || L.legend)[pick % 2];
  return tpl.replace(/\{name\}/g, nm).replace(/\{first\}/g, first).replace(/\{traits\}/g, tx).replace(/\{kind\}/g, L.kind);
}

// European domestic league tiers used to classify clubs from the project's 2024/25 source snapshot.
// This maps competition names to tiers; it does not claim that every European club
// or every national division exists in the underlying source dataset.
const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const rules = [
  // England is supplemented separately by english-lower-leagues.js.
  ['spain', 1, [/^la liga$/, /^primera division$/]],
  ['spain', 2, [/^la liga 2$/, /^segunda division$/, /^laliga hyermotion$/]],
  ['spain', 3, [/^primera federacion/]],
  ['spain', 4, [/^segunda federacion/]],
  ['italy', 1, [/^serie a$/]], ['italy', 2, [/^serie b$/]], ['italy', 3, [/^serie c/]], ['italy', 4, [/^serie d$/]],
  ['germany', 1, [/^bundesliga$/]], ['germany', 2, [/^2 bundesliga$/]], ['germany', 3, [/^3 liga$/]], ['germany', 4, [/^regionalliga/]],
  ['france', 1, [/^ligue 1$/]], ['france', 2, [/^ligue 2$/]], ['france', 3, [/^national$/]], ['france', 4, [/^national 2$/]],
  ['netherlands', 1, [/^eredivisie$/]], ['netherlands', 2, [/^eerste divisie$/, /^keuken kampioen divisie$/]], ['netherlands', 3, [/^tweede divisie$/]], ['netherlands', 4, [/^derde divisie/]],
  ['portugal', 1, [/^primeira liga$/, /^liga portugal$/]], ['portugal', 2, [/^liga portugal 2$/, /^segunda liga$/]], ['portugal', 3, [/^liga 3$/]], ['portugal', 4, [/^campeonato de portugal$/]],
  ['turkey', 1, [/^super lig$/]], ['turkey', 2, [/^1 lig$/, /^1 league$/]], ['turkey', 3, [/^2 lig/]], ['turkey', 4, [/^3 lig/]],
  ['belgium', 1, [/^jupiler pro league$/, /^pro league$/]], ['belgium', 2, [/^challenger pro league$/, /^first division b$/]], ['belgium', 3, [/^national division 1$/, /^first amateur division$/]], ['belgium', 4, [/^division 2 amateur$/, /^national division 2$/]],
  ['scotland', 1, [/^premiership$/]], ['scotland', 2, [/^championship$/]], ['scotland', 3, [/^league one$/]], ['scotland', 4, [/^league two$/]],
  ['ireland', 1, [/^premier division$/, /^league of ireland premier division$/]], ['ireland', 2, [/^first division$/, /^league of ireland first division$/]],
  ['austria', 1, [/^bundesliga$/]], ['austria', 2, [/^2 liga$/, /^2 bundesliga$/]], ['austria', 3, [/^regionalliga/]],
  ['switzerland', 1, [/^super league$/]], ['switzerland', 2, [/^challenge league$/]], ['switzerland', 3, [/^promotion league$/]], ['switzerland', 4, [/^1 liga classic$/]],
  ['denmark', 1, [/^superliga$/]], ['denmark', 2, [/^1 division$/, /^1st division$/]], ['denmark', 3, [/^2 division$/, /^2nd division$/]], ['denmark', 4, [/^3 division$/, /^3rd division$/]],
  ['norway', 1, [/^eliteserien$/]], ['norway', 2, [/^1 divisjon$/, /^obos ligaen$/]], ['norway', 3, [/^2 divisjon$/]], ['norway', 4, [/^3 divisjon$/]],
  ['sweden', 1, [/^allsvenskan$/]], ['sweden', 2, [/^superettan$/]], ['sweden', 3, [/^ettan/]], ['sweden', 4, [/^division 2$/]],
  ['poland', 1, [/^ekstraklasa$/]], ['poland', 2, [/^i liga$/]], ['poland', 3, [/^ii liga$/]], ['poland', 4, [/^iii liga$/]],
  ['greece', 1, [/^super league$/, /^super league 1$/]], ['greece', 2, [/^super league 2$/]], ['greece', 3, [/^gamma ethniki$/]],
  ['ukraine', 1, [/^premier league$/]], ['ukraine', 2, [/^first league$/]], ['ukraine', 3, [/^second league$/]],
  ['romania', 1, [/^liga i$/, /^liga 1$/]], ['romania', 2, [/^liga ii$/, /^liga 2$/]], ['romania', 3, [/^liga iii$/, /^liga 3$/]], ['romania', 4, [/^liga iv$/, /^liga 4$/]],
  ['czech republic', 1, [/^first league$/, /^fortuna liga$/]], ['czech republic', 2, [/^national football league$/, /^second league$/]], ['czech republic', 3, [/^cfl$/, /^msfl$/]], ['czech republic', 4, [/^divize/]],
  ['croatia', 1, [/^hnl$/, /^1 hnl$/]], ['croatia', 2, [/^first nl$/, /^2 hnl$/]], ['croatia', 3, [/^second nl$/, /^3 hnl$/]],
  ['serbia', 1, [/^super liga$/, /^superliga$/]], ['serbia', 2, [/^prva liga$/]], ['serbia', 3, [/^srpska liga/]],
  ['russia', 1, [/^premier league$/]], ['russia', 2, [/^first league$/, /^first division$/]], ['russia', 3, [/^second league/]],
  ['finland', 1, [/^veikkausliiga$/]], ['finland', 2, [/^ykkosliiga$/, /^ykkonen$/]], ['finland', 3, [/^kakkonen$/]],
  ['iceland', 1, [/^urvalsdeild/]], ['iceland', 2, [/^1 deild$/]], ['iceland', 3, [/^2 deild$/]],
  ['wales', 1, [/^cymru premier$/]], ['wales', 2, [/^cymru north$/, /^cymru south$/]],
  ['northern ireland', 1, [/^premiership$/]], ['northern ireland', 2, [/^championship$/]], ['northern ireland', 3, [/^premier intermediate league$/]],
  ['slovakia', 1, [/^super liga$/]], ['slovakia', 2, [/^2 liga$/]], ['slovakia', 3, [/^3 liga/]],
  ['slovenia', 1, [/^1 snl$/, /^prva liga$/]], ['slovenia', 2, [/^2 snl$/, /^second league$/]], ['slovenia', 3, [/^3 snl$/]],
  ['bulgaria', 1, [/^first league$/, /^parva liga$/]], ['bulgaria', 2, [/^second league$/]], ['bulgaria', 3, [/^third league$/]],
  ['hungary', 1, [/^nb i$/]], ['hungary', 2, [/^nb ii$/]], ['hungary', 3, [/^nb iii$/]],
  ['cyprus', 1, [/^first division$/]], ['cyprus', 2, [/^second division$/]], ['cyprus', 3, [/^third division$/]],
  ['israel', 1, [/^premier league$/]], ['israel', 2, [/^liga leumit$/]], ['israel', 3, [/^liga alef$/]],
  ['bosnia and herzegovina', 1, [/^premier league$/]], ['bosnia and herzegovina', 2, [/^first league/]],
  ['albania', 1, [/^superliga$/]], ['albania', 2, [/^first division$/]],
  ['north macedonia', 1, [/^first league$/]], ['north macedonia', 2, [/^second league$/]],
  ['montenegro', 1, [/^first league$/]], ['montenegro', 2, [/^second league$/]],
  ['luxembourg', 1, [/^national division$/]], ['malta', 1, [/^premier league$/]], ['faroe islands', 1, [/^premier league$/]],
  ['estonia', 1, [/^meistriliiga$/]], ['estonia', 2, [/^esiliiga$/]], ['estonia', 3, [/^esiliiga b$/]],
  ['latvia', 1, [/^virsliga$/]], ['latvia', 2, [/^1 liga$/]], ['lithuania', 1, [/^a lyga$/]], ['lithuania', 2, [/^i lyga$/]],
  ['moldova', 1, [/^super liga$/]], ['moldova', 2, [/^liga 1$/]], ['georgia', 1, [/^erოვნული liga$/i, /^erოვნuli liga$/i, /^erovnuli liga$/]],
  ['armenia', 1, [/^premier league$/]], ['azerbaijan', 1, [/^premier league$/]], ['kazakhstan', 1, [/^premier league$/]],
  ['kosovo', 1, [/^superleague$/]], ['gibraltar', 1, [/^premier division$/]], ['andorra', 1, [/^primera divisio$/]], ['san marino', 1, [/^campionato sammarinese$/]],
];

export function getEuropeanDivision(country, competition) {
  const normalizedCountry = normalize(country);
  const normalizedCompetition = normalize(competition);
  const match = rules.find(([ruleCountry, , patterns]) =>
    normalize(ruleCountry) === normalizedCountry && patterns.some((pattern) => pattern.test(normalizedCompetition)),
  );
  return match?.[1] ?? null;
}

export const europeanDivisionMetadata = {
  maximumSelectableDivision: 4,
  note: 'Competition-name tier mapping for European leagues represented in the source snapshot; coverage varies by country and does not guarantee every club or division.',
};

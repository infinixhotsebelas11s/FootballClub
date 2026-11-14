// Additional national-league aliases and lower-tier names not covered by the
// primary European competition map. These labels classify only competitions
// present in the selected season data; they do not create missing clubs.
const normalize = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, ' ')
  .trim();

const rows = [
  ['spain', 1, ['laliga']], ['spain', 2, ['segunda division', 'laliga hyermotion']],
  ['italy', 2, ['serie b']], ['italy', 3, ['serie c', 'lega pro']], ['italy', 4, ['serie d']],
  ['germany', 2, ['2 bundesliga', '2 liga']], ['germany', 3, ['3 liga']], ['germany', 4, ['regionalliga nord', 'regionalliga nordost', 'regionalliga west', 'regionalliga sudwest', 'regionalliga bayern']],
  ['france', 2, ['ligue 2']], ['france', 3, ['national 1', 'championnat national']], ['france', 4, ['national 2']],
  ['netherlands', 2, ['eerste divisie', 'keuken kampioen divisie']], ['netherlands', 3, ['tweede divisie']], ['netherlands', 4, ['derde divisie']],
  ['portugal', 2, ['segunda liga', 'liga portugal 2']], ['portugal', 3, ['liga 3']], ['portugal', 4, ['campeonato de portugal']],
  ['turkey', 2, ['1 lig', 'tff 1 lig']], ['turkey', 3, ['2 lig', 'tff 2 lig']], ['turkey', 4, ['3 lig', 'tff 3 lig']],
  ['belgium', 2, ['challenger pro league', 'first division b']], ['belgium', 3, ['national division 1', 'first amateur division']], ['belgium', 4, ['national division 2', 'second amateur division']],
  ['scotland', 2, ['championship']], ['scotland', 3, ['league one']], ['scotland', 4, ['league two']],
  ['ireland', 2, ['first division']],
  ['austria', 2, ['2 liga']], ['austria', 3, ['regionalliga east', 'regionalliga mitte', 'regionalliga west']],
  ['switzerland', 2, ['challenge league']], ['switzerland', 3, ['promotion league']], ['switzerland', 4, ['1 liga classic']],
  ['denmark', 2, ['1 division']], ['denmark', 3, ['2 division']], ['denmark', 4, ['3 division']],
  ['norway', 2, ['1 divisjon', 'obos ligaen']], ['norway', 3, ['2 divisjon']], ['norway', 4, ['3 divisjon']],
  ['sweden', 2, ['superettan']], ['sweden', 3, ['ettan']], ['sweden', 4, ['division 2']],
  ['poland', 2, ['i liga']], ['poland', 3, ['ii liga']], ['poland', 4, ['iii liga']],
  ['greece', 2, ['super league 2']], ['greece', 3, ['gamma ethniki']],
  ['ukraine', 2, ['first league']], ['ukraine', 3, ['second league']],
  ['romania', 2, ['liga ii', 'liga 2']], ['romania', 3, ['liga iii', 'liga 3']], ['romania', 4, ['liga iv', 'liga 4']],
  ['czech republic', 2, ['national football league', 'second league']], ['czech republic', 3, ['cfl', 'msfl']], ['czech republic', 4, ['divize']],
  ['croatia', 2, ['first nl', '2 hnl']], ['croatia', 3, ['second nl', '3 hnl']],
  ['serbia', 2, ['prva liga']], ['serbia', 3, ['srpska liga']],
  ['russia', 2, ['first league', 'first division']], ['russia', 3, ['second league']],
  ['finland', 2, ['ykkosliiga', 'ykkonen']], ['finland', 3, ['kakkonen']],
  ['iceland', 2, ['1 deild']], ['iceland', 3, ['2 deild']],
  ['wales', 2, ['cymru north', 'cymru south']],
  ['northern ireland', 2, ['championship']], ['northern ireland', 3, ['premier intermediate league']],
  ['slovakia', 2, ['2 liga']], ['slovakia', 3, ['3 liga']],
  ['slovenia', 2, ['2 snl', 'second league']], ['slovenia', 3, ['3 snl']],
  ['bulgaria', 2, ['second league']], ['bulgaria', 3, ['third league']],
  ['hungary', 2, ['nb ii']], ['hungary', 3, ['nb iii']],
  ['cyprus', 2, ['second division']], ['cyprus', 3, ['third division']],
  ['israel', 2, ['liga leumit']], ['israel', 3, ['liga alef']],
  ['bosnia and herzegovina', 2, ['first league']],
  ['albania', 2, ['first division']], ['north macedonia', 2, ['second league']], ['montenegro', 2, ['second league']],
  ['estonia', 2, ['esiliiga']], ['estonia', 3, ['esiliiga b']],
  ['latvia', 2, ['1 liga']], ['lithuania', 2, ['i lyga']], ['moldova', 2, ['liga 1']],
];

export function getEuropeanDivisionExtra(country, competition) {
  const countryKey = normalize(country);
  const competitionKey = normalize(competition);
  const row = rows.find(([name, , aliases]) => normalize(name) === countryKey && aliases.includes(competitionKey));
  return row ? row[1] : null;
}

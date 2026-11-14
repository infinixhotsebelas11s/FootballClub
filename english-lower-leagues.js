// England EFL clubs for the 2024/25 season, organized by domestic tier.
// This supplements the upstream snapshot when it omits lower-tier competitions.
const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

const rows = [
  [2, 'EFL Championship', [
    'Blackburn Rovers', 'Bristol City', 'Burnley', 'Cardiff City', 'Coventry City',
    'Derby County', 'Hull City', 'Leeds United', 'Luton Town', 'Middlesbrough',
    'Millwall', 'Norwich City', 'Oxford United', 'Plymouth Argyle', 'Portsmouth',
    'Preston North End', 'Queens Park Rangers', 'Sheffield United', 'Sheffield Wednesday',
    'Stoke City', 'Sunderland', 'Swansea City', 'Watford', 'West Bromwich Albion',
  ]],
  [3, 'EFL League One', [
    'Barnsley', 'Birmingham City', 'Blackpool', 'Bolton Wanderers', 'Bristol Rovers',
    'Burton Albion', 'Cambridge United', 'Charlton Athletic', 'Crawley Town', 'Exeter City',
    'Huddersfield Town', 'Leyton Orient', 'Lincoln City', 'Mansfield Town', 'Northampton Town',
    'Peterborough United', 'Reading', 'Rotherham United', 'Shrewsbury Town', 'Stevenage',
    'Stockport County', 'Wigan Athletic', 'Wrexham', 'Wycombe Wanderers',
  ]],
  [4, 'EFL League Two', [
    'Accrington Stanley', 'AFC Wimbledon', 'Barrow', 'Bradford City', 'Bromley',
    'Carlisle United', 'Cheltenham Town', 'Chesterfield', 'Colchester United', 'Crewe Alexandra',
    'Doncaster Rovers', 'Fleetwood Town', 'Gillingham', 'Grimsby Town', 'Harrogate Town',
    'Milton Keynes Dons', 'Morecambe', 'Newport County', 'Notts County', 'Port Vale',
    'Salford City', 'Swindon Town', 'Tranmere Rovers', 'Walsall',
  ]],
];

export const englishLowerLeagues = rows.map(([division, league, names]) => ({
  division,
  league,
  clubs: names.map((name) => ({
    id: slug(name),
    name,
    country: 'England',
    continent: 'Europe',
    league,
    division,
    divisionSource: 'Curated 2024/25 EFL club list',
    stadium: 'Data belum tersedia',
    capacity: 0,
    primaryKit: null,
    transferBudgetEUR: 0,
    dataSource: '2024/25 EFL participation list; club details not included in source',
  })),
}));

export const englishLowerLeagueClubs = englishLowerLeagues.flatMap(({ clubs: entries }) => entries);
export const englishLowerLeagueCompetitions = englishLowerLeagues.map(({ division, league }) => ({
  name: league,
  country: 'England',
  continent: 'Europe',
  division,
  divisions: division,
  dataSource: '2024/25 English Football League competition list',
}));

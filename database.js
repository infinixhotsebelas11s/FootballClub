/*
 * Real-world 2024/25 season data plus historical FIFA Club World Cup participants.
 * Generated season records come from scripts/build_database.py; the tournament
 * add-on supplies historical participant clubs missing from that snapshot.
 * It is not a census of every club worldwide.
 */
import {
  generatedClubs,
  generatedPlayers,
  generatedLeagues,
  generatedMetadata,
} from './database.generated.js';
import {
  fifaClubWorldCupClubs,
  fifaClubWorldCupLeagues,
  fifaClubWorldCupMetadata,
} from './fifa-club-world-cup.js';

const slug = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const curatedLeagueRows = [
  ['Premier League','England'], ['La Liga','Spain'], ['Serie A','Italy'],
  ['Bundesliga','Germany'], ['Ligue 1','France'], ['Eredivisie','Netherlands'],
  ['Primeira Liga','Portugal'], ['Süper Lig','Turkey'],
  ['Russian Premier League','Russia'], ['Jupiler Pro League','Belgium'],
  ['League of Ireland','Ireland'], ['Scottish Premiership','Scotland'],
  ['J1 League','Japan'], ['K League 1','South Korea'],
  ['Chinese Super League','China'], ['Saudi Pro League','Saudi Arabia'],
  ['A-League Men','Australia'], ['Thai League 1','Thailand'],
  ['V.League 1','Vietnam'], ['Cambodian League','Cambodia'],
  ['Malaysia Super League','Malaysia'], ['Singapore Premier League','Singapore'],
  ['Philippines Football League','Philippines'], ['Liga 1','Indonesia'],
  ['Major League Soccer','United States'], ['Brasileirão Série A','Brazil'],
  ['Primera División','Argentina'], ['Premier Soccer League','South Africa'],
  ['Nigeria Premier League','Nigeria'], ['Ligue 1 Côte d’Ivoire','Ivory Coast'],
  ['Botola Pro','Morocco'], ['Egyptian Premier League','Egypt'],
].map(([name, country]) => ({ name, country, divisions: 1 }));

const leagueMap = new Map();
for (const league of [...curatedLeagueRows, ...generatedLeagues, ...fifaClubWorldCupLeagues]) {
  const key = `${String(league.country || '').toLowerCase()}|${String(league.name || '').toLowerCase()}`;
  if (key !== '|') leagueMap.set(key, { ...(leagueMap.get(key) || {}), ...league });
}
export const leagues = [...leagueMap.values()];
export const allLeagues = leagues;

// Combine the season source and historic tournament entrants, keeping real
// season metadata when available and adding the FIFA editions as provenance.
const clubMap = new Map();
for (const club of [...generatedClubs, ...fifaClubWorldCupClubs]) {
  const id = club.id || slug(club.name);
  const previous = clubMap.get(id) || {};
  clubMap.set(id, {
    ...previous,
    ...club,
    id,
    fifaClubWorldCupEditions: [
      ...new Set([
        ...(previous.fifaClubWorldCupEditions || []),
        ...(club.fifaClubWorldCupEditions || []),
      ]),
    ].sort((a, b) => a - b),
  });
}
export const clubs = [...clubMap.values()].sort((a, b) =>
  `${a.country || ''}|${a.league || ''}|${a.name || ''}`.localeCompare(
    `${b.country || ''}|${b.league || ''}|${b.name || ''}`,
  ),
);

export const players = generatedPlayers;
export const dataStatus = {
  season: '2024/25',
  completeness: generatedPlayers.length ? 'generated real season sample plus historic FIFA Club World Cup entrants' : 'historic FIFA Club World Cup entrants plus curated league list; run npm run database:build for season players and clubs',
  source: generatedMetadata.source || 'curated FIFA Club World Cup participant records and generated season dataset',
  generatedClubCount: generatedClubs.length,
  fifaClubWorldCupClubCount: fifaClubWorldCupClubs.length,
  fifaClubWorldCupEditions: fifaClubWorldCupMetadata.editions,
  coverageNote: fifaClubWorldCupMetadata.note,
};

export const findClub = (name) => clubs.find(
  (club) => String(club.name || '').toLowerCase() === String(name || '').toLowerCase(),
);
export const clubForPlayer = (player) => findClub(player?.club);
export const formatEUR = (value) => new Intl.NumberFormat('en-GB', {
  style: 'currency', currency: 'EUR', maximumFractionDigits: 0,
}).format(value || 0);
export const searchPlayers = ({ name = '', club = '', league = '' } = {}) => players.filter((player) =>
  String(player.name || '').toLowerCase().includes(name.toLowerCase())
  && String(player.club || '').toLowerCase().includes(club.toLowerCase())
  && (!league || clubForPlayer(player)?.league === league),
);
export const clubById = (id) => clubs.find((club) => club.id === id);
export const playerById = (id) => players.find((player) => player.id === id);
export const databaseSummary = {
  totalClubs: clubs.length,
  totalPlayers: players.length,
  totalLeagues: leagues.length,
  season: '2024/25',
  sampleMode: true,
  notes: 'Season coverage is limited to the upstream dataset; FIFA Club World Cup entrants cover editions 2015–2023 and 2025, not every club worldwide.',
};

export default {
  clubs,
  players,
  leagues,
  allLeagues,
  dataStatus,
  findClub,
  clubForPlayer,
  formatEUR,
  searchPlayers,
  clubById,
  playerById,
  databaseSummary,
};

// Historical FIFA Club World Cup participants (2015–2023 and 2025 editions).
// FIFA did not hold an edition in 2024. The 2025 tournament used the expanded
// 32-team format. Historical participation is not a claim that every club in
// each country's football pyramid is included. Clubs without curated metadata
// use neutral placeholders for stadium/capacity/budget, not invented facts.
const slug = (value) => value.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

// name, country, domestic competition, editions played
const rows = [
  ['Barcelona','Spain','La Liga',[2015]],
  ['River Plate','Argentina','Primera División',[2015,2018,2025]],
  ['Sanfrecce Hiroshima','Japan','J1 League',[2015]],
  ['Guangzhou Evergrande','China','Chinese Super League',[2015]],
  ['TP Mazembe','DR Congo','Linafoot Ligue 1',[2015]],
  ['Club América','Mexico','Liga MX',[2015,2016]],
  ['Auckland City','New Zealand','New Zealand National League',[2015,2016,2017,2018,2020,2022,2023,2025]],
  ['Real Madrid','Spain','La Liga',[2016,2017,2018,2022,2025]],
  ['Kashima Antlers','Japan','J1 League',[2016,2018]],
  ['Atlético Nacional','Colombia','Categoría Primera A',[2016]],
  ['Mamelodi Sundowns','South Africa','South African Premiership',[2016,2025]],
  ['Jeonbuk Hyundai Motors','South Korea','K League 1',[2016]],
  ['Grêmio','Brazil','Campeonato Brasileiro Série A',[2017]],
  ['Al Jazira','United Arab Emirates','UAE Pro League',[2017,2021]],
  ['Pachuca','Mexico','Liga MX',[2017,2025]],
  ['Wydad Casablanca','Morocco','Botola Pro',[2017,2022,2025]],
  ['Urawa Red Diamonds','Japan','J1 League',[2017,2023,2025]],
  ['Al Ain','United Arab Emirates','UAE Pro League',[2018,2025]],
  ['Espérance de Tunis','Tunisia','Tunisian Ligue Professionnelle 1',[2018,2019,2025]],
  ['Guadalajara','Mexico','Liga MX',[2018]],
  ['Team Wellington','New Zealand','New Zealand National League',[2018]],
  ['Liverpool','England','Premier League',[2019]],
  ['Flamengo','Brazil','Campeonato Brasileiro Série A',[2019,2022,2025]],
  ['Monterrey','Mexico','Liga MX',[2019,2021,2025]],
  ['Al Hilal','Saudi Arabia','Saudi Pro League',[2019,2021,2022,2025]],
  ['Hienghène Sport','New Caledonia','New Caledonia Super Ligue',[2019]],
  ['Al Sadd','Qatar','Qatar Stars League',[2019]],
  ['Bayern Munich','Germany','Bundesliga',[2020,2025]],
  ['Tigres UANL','Mexico','Liga MX',[2020]],
  ['Palmeiras','Brazil','Campeonato Brasileiro Série A',[2020,2021,2025]],
  ['Al Ahly','Egypt','Egyptian Premier League',[2020,2021,2022,2023,2025]],
  ['Al-Duhail','Qatar','Qatar Stars League',[2020]],
  ['Ulsan Hyundai','South Korea','K League 1',[2020,2022]],
  ['Chelsea','England','Premier League',[2021,2025]],
  ['AS Pirae','French Polynesia','Tahiti Ligue 1',[2021]],
  ['Seattle Sounders FC','United States','Major League Soccer',[2022,2025]],
  ['Manchester City','England','Premier League',[2023,2025]],
  ['Fluminense','Brazil','Campeonato Brasileiro Série A',[2023,2025]],
  ['Club León','Mexico','Liga MX',[2023]],
  ['Al Ittihad','Saudi Arabia','Saudi Pro League',[2023]],
  ['Paris Saint-Germain','France','Ligue 1',[2025]],
  ['Atlético de Madrid','Spain','La Liga',[2025]],
  ['Botafogo','Brazil','Campeonato Brasileiro Série A',[2025]],
  ['Boca Juniors','Argentina','Primera División',[2025]],
  ['Benfica','Portugal','Primeira Liga',[2025]],
  ['LAFC','United States','Major League Soccer',[2025]],
  ['Inter','Italy','Serie A',[2025]],
  ['Ulsan HD','South Korea','K League 1',[2025]],
  ['FC Porto','Portugal','Primeira Liga',[2025]],
  ['Borussia Dortmund','Germany','Bundesliga',[2025]],
  ['Juventus','Italy','Serie A',[2025]],
  ['FC Salzburg','Austria','Austrian Bundesliga',[2025]]
];

export const fifaClubWorldCupLeagues = [...new Map(rows.map(([, country, name]) => [`${country}|${name}`, { country, name, divisions: 1, dataSource: 'Domestic league represented by FIFA Club World Cup participant records, editions 2015–2025' }])).values()];

export const fifaClubWorldCupClubs = rows.map(([name, country, league, editions]) => ({
  id: slug(name),
  name,
  country,
  league,
  stadium: 'Data belum tersedia',
  capacity: 0,
  primaryKit: null,
  transferBudgetEUR: 0,
  fifaClubWorldCupEditions: editions,
  dataSource: 'FIFA Club World Cup participant record, ' + editions.join(', '),
}));

export const fifaClubWorldCupMetadata = {
  editions: '2015–2023 and 2025',
  note: 'FIFA Club World Cup was not held in 2024. The historic participant list is a focused add-on, not a complete worldwide club census. Validate historical edition records before commercial use.',
  participantCount: fifaClubWorldCupClubs.length,
  leagueCount: fifaClubWorldCupLeagues.length,
};

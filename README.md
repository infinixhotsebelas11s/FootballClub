/*
 * Curated starter database for Football Manager Text.
 * This file uses real club and player names, with season references for 2024/25 and 2025/26.
 * It intentionally does NOT claim to be a complete licensed 100+ league / 500+ player dataset.
 * All OVR values are gameplay estimates for the project and should be independently verified before any commercial or public release.
 */
export const dataStatus = {
  season: '2024/25',
  season2025: '2025/26',
  completeness: 'curated starter sample',
  note: 'Real club and player names are used for the active sample. This is not a full 500-player licensed database.'
};

export const leagues = [
  { name: 'Premier League', country: 'England', divisions: 3 },
  { name: 'La Liga', country: 'Spain', divisions: 3 },
  { name: 'Serie A', country: 'Italy', divisions: 3 },
  { name: 'Bundesliga', country: 'Germany', divisions: 3 },
  { name: 'Ligue 1', country: 'France', divisions: 3 },
  { name: 'Eredivisie', country: 'Netherlands', divisions: 3 },
  { name: 'Primeira Liga', country: 'Portugal', divisions: 3 },
  { name: 'Süper Lig', country: 'Turkey', divisions: 3 },
  { name: 'Russian Premier League', country: 'Russia', divisions: 3 },
  { name: 'Jupiler Pro League', country: 'Belgium', divisions: 3 },
  { name: 'League of Ireland', country: 'Ireland', divisions: 3 },
  { name: 'Scottish Premiership', country: 'Scotland', divisions: 3 },
  { name: 'J1 League', country: 'Japan', divisions: 3 },
  { name: 'K League 1', country: 'South Korea', divisions: 3 },
  { name: 'Chinese Super League', country: 'China', divisions: 3 },
  { name: 'Saudi Pro League', country: 'Saudi Arabia', divisions: 3 },
  { name: 'A-League Men', country: 'Australia', divisions: 3 },
  { name: 'Thai League 1', country: 'Thailand', divisions: 3 },
  { name: 'V.League 1', country: 'Vietnam', divisions: 3 },
  { name: 'Cambodian League', country: 'Cambodia', divisions: 3 },
  { name: 'Malaysia Super League', country: 'Malaysia', divisions: 3 },
  { name: 'Singapore Premier League', country: 'Singapore', divisions: 3 },
  { name: 'Philippines Football League', country: 'Philippines', divisions: 3 },
  { name: 'Liga 1', country: 'Indonesia', divisions: 3 },
  { name: 'Major League Soccer', country: 'United States', divisions: 3 },
  { name: 'Brasileirão Série A', country: 'Brazil', divisions: 3 },
  { name: 'Primera División', country: 'Argentina', divisions: 3 },
  { name: 'Premier Soccer League', country: 'South Africa', divisions: 3 },
  { name: 'Nigeria Premier League', country: 'Nigeria', divisions: 3 },
  { name: 'Ligue 1 Côte d’Ivoire', country: 'Ivory Coast', divisions: 3 },
  { name: 'Botola Pro', country: 'Morocco', divisions: 3 },
  { name: 'Egyptian Premier League', country: 'Egypt', divisions: 3 }
];

const clubRows = [
  ['Manchester City', 'England', 'Premier League', 'Etihad Stadium', 53400, '#6caddf', 150],
  ['Arsenal', 'England', 'Premier League', 'Emirates Stadium', 60704, '#ef0107', 120],
  ['Liverpool', 'England', 'Premier League', 'Anfield', 61276, '#c8102e', 110],
  ['Manchester United', 'England', 'Premier League', 'Old Trafford', 74310, '#da291c', 95],
  ['Chelsea', 'England', 'Premier League', 'Stamford Bridge', 40343, '#034694', 90],
  ['Tottenham Hotspur', 'England', 'Premier League', 'Tottenham Hotspur Stadium', 62850, '#132257', 80],
  ['Everton', 'England', 'Premier League', 'Goodison Park', 39571, '#003399', 40],
  ['Newcastle United', 'England', 'Premier League', 'St James\' Park', 52354, '#000000', 65],

  ['Real Madrid', 'Spain', 'La Liga', 'Santiago Bernabéu', 81044, '#ffffff', 120],
  ['Barcelona', 'Spain', 'La Liga', 'Camp Nou', 99354, '#a50044', 90],
  ['Atlético de Madrid', 'Spain', 'La Liga', 'Estadio Metropolitano', 68456, '#ce252b', 70],
  ['Sevilla', 'Spain', 'La Liga', 'Estadio Ramón Sánchez Pizjuán', 43883, '#ffffff', 45],
  ['Girona', 'Spain', 'La Liga', 'Estadi Montilivi', 13500, '#e31d3a', 25],
  ['Valencia', 'Spain', 'La Liga', 'Mestalla', 55000, '#ff6600', 30],

  ['Inter', 'Italy', 'Serie A', 'San Siro', 75817, '#0066b3', 60],
  ['AC Milan', 'Italy', 'Serie A', 'San Siro', 75817, '#e3001b', 65],
  ['Juventus', 'Italy', 'Serie A', 'Allianz Stadium', 41507, '#000000', 55],
  ['Napoli', 'Italy', 'Serie A', 'Stadio Diego Armando Maradona', 54726, '#17a0db', 52],
  ['AS Roma', 'Italy', 'Serie A', 'Stadio Olimpico', 70634, '#a50d2f', 45],
  ['Lazio', 'Italy', 'Serie A', 'Stadio Olimpico', 70634, '#87b2e6', 35],

  ['Bayern Munich', 'Germany', 'Bundesliga', 'Allianz Arena', 75024, '#dc052d', 80],
  ['Borussia Dortmund', 'Germany', 'Bundesliga', 'Signal Iduna Park', 81365, '#fde100', 60],
  ['Bayer Leverkusen', 'Germany', 'Bundesliga', 'BayArena', 30210, '#e4002b', 55],
  ['RB Leipzig', 'Germany', 'Bundesliga', 'Red Bull Arena', 42558, '#e1001c', 50],
  ['VfL Wolfsburg', 'Germany', 'Bundesliga', 'Volkswagen Arena', 30000, '#65b32e', 30],
  ['Borussia Mönchengladbach', 'Germany', 'Bundesliga', 'Borussia-Park', 54042, '#1f4f9d', 30],

  ['Paris Saint-Germain', 'France', 'Ligue 1', 'Parc des Princes', 47929, '#004170', 80],
  ['Olympique Marseille', 'France', 'Ligue 1', 'Orange Vélodrome', 67394, '#ffffff', 30],
  ['AS Monaco', 'France', 'Ligue 1', 'Stade Louis II', 18000, '#f5ac1a', 35],
  ['Lille OSC', 'France', 'Ligue 1', 'Stade Pierre-Mauroy', 50000, '#d50030', 25],
  ['Olympique Lyonnais', 'France', 'Ligue 1', 'Groupama Stadium', 59186, '#e1002a', 30],
  ['Rennes', 'France', 'Ligue 1', 'Roazhon Park', 29400, '#e2001a', 20],

  ['Ajax', 'Netherlands', 'Eredivisie', 'Johan Cruyff Arena', 55500, '#d2122e', 35],
  ['PSV Eindhoven', 'Netherlands', 'Eredivisie', 'Philips Stadion', 35000, '#ed1c24', 28],
  ['Feyenoord', 'Netherlands', 'Eredivisie', 'De Kuip', 47523, '#ffffff', 22],
  ['AZ Alkmaar', 'Netherlands', 'Eredivisie', 'AFAS Stadion', 17023, '#e32029', 18],
  ['Twente', 'Netherlands', 'Eredivisie', 'De Grolsch Veste', 30024, '#d71a23', 16],

  ['Benfica', 'Portugal', 'Primeira Liga', 'Estádio da Luz', 65647, '#e83030', 35],
  ['FC Porto', 'Portugal', 'Primeira Liga', 'Estádio do Dragão', 50399, '#00205b', 30],
  ['Sporting CP', 'Portugal', 'Primeira Liga', 'Estádio José Alvalade', 50095, '#006633', 28],
  ['Braga', 'Portugal', 'Primeira Liga', 'Estádio Municipal de Braga', 30600, '#1a4d9b', 18],
  ['Guimarães', 'Portugal', 'Primeira Liga', 'Estádio D. Afonso Henriques', 30132, '#0085ca', 18],

  ['Galatasaray', 'Turkey', 'Süper Lig', 'Rams Park', 52280, '#a90432', 35],
  ['Fenerbahçe', 'Turkey', 'Süper Lig', 'Şükrü Saracoğlu Stadium', 47834, '#163e88', 30],
  ['Beşiktaş', 'Turkey', 'Süper Lig', 'Vodafone Park', 42590, '#000000', 25],
  ['Trabzonspor', 'Turkey', 'Süper Lig', 'Medical Park Stadyumu', 40611, '#8a1b20', 18],
  ['Başakşehir', 'Turkey', 'Süper Lig', 'Başakşehir Fatih Terim Stadium', 17110, '#1f4ea5', 18],

  ['Al Nassr', 'Saudi Arabia', 'Saudi Pro League', 'Al-Awwal Park', 25000, '#fedd00', 50],
  ['Al Hilal', 'Saudi Arabia', 'Saudi Pro League', 'Kingdom Arena', 27000, '#00529f', 60],
  ['Al Ittihad', 'Saudi Arabia', 'Saudi Pro League', 'King Abdullah Sports City', 58810, '#002d62', 40],
  ['Al Ahli', 'Saudi Arabia', 'Saudi Pro League', 'King Abdullah Sports City', 58810, '#b5d9ef', 28],
  ['Al Fateh', 'Saudi Arabia', 'Saudi Pro League', 'Al-Fateh Stadium', 11000, '#ffb703', 14],

  ['Celtic', 'Scotland', 'Scottish Premiership', 'Celtic Park', 60411, '#008a4b', 15],
  ['Rangers', 'Scotland', 'Scottish Premiership', 'Ibrox Stadium', 50817, '#163a70', 15],

  ['Persib Bandung', 'Indonesia', 'Liga 1', 'Gelora Bandung Lautan Api', 38000, '#1d4ed8', 2],
  ['Persija Jakarta', 'Indonesia', 'Liga 1', 'Jakarta International Stadium', 82000, '#dc2626', 2],
  ['Arema FC', 'Indonesia', 'Liga 1', 'Stadion Kanjuruhan', 42000, '#f59e0b', 2],
  ['Persebaya Surabaya', 'Indonesia', 'Liga 1', 'Gelora Bung Tomo', 50000, '#0f766e', 2],
  ['Bali United', 'Indonesia', 'Liga 1', 'Stadion Kapten I Wayan Dipta', 25000, '#f97316', 2],
  ['Borneo FC', 'Indonesia', 'Liga 1', 'Stadion Segiri', 25000, '#1b4332', 2],
  ['PSM Makassar', 'Indonesia', 'Liga 1', 'Stadion Andi Mattalatta', 25000, '#c2410c', 2],
  ['Madura United', 'Indonesia', 'Liga 1', 'Stadion Gelora Bangkalan', 25000, '#0f172a', 2],

  ['Inter Miami CF', 'United States', 'Major League Soccer', 'Chase Stadium', 21550, '#f7b5cd', 25],
  ['Los Angeles FC', 'United States', 'Major League Soccer', 'BMO Stadium', 22140, '#c8102e', 20],
  ['Seattle Sounders FC', 'United States', 'Major League Soccer', 'Lumen Field', 37500, '#2b6cb0', 18],

  ['Flamengo', 'Brazil', 'Brasileirão Série A', 'Maracanã', 78838, '#c8102e', 35],
  ['Palmeiras', 'Brazil', 'Brasileirão Série A', 'Allianz Parque', 43713, '#013d84', 32],
  ['São Paulo', 'Brazil', 'Brasileirão Série A', 'Estádio do Morumbi', 72039, '#d71920', 24],
  ['Cruzeiro', 'Brazil', 'Brasileirão Série A', 'Mineirão', 61846, '#1a2d5d', 18],

  ['River Plate', 'Argentina', 'Primera División', 'Estadio Monumental', 84922, '#d7b764', 28],
  ['Boca Juniors', 'Argentina', 'Primera División', 'La Bombonera', 49000, '#1d4ed8', 22],
  ['Independiente', 'Argentina', 'Primera División', 'Estadio Libertadores de América', 49000, '#d91d2a', 18],

  ['Mamelodi Sundowns', 'South Africa', 'Premier Soccer League', 'Loftus Versfeld', 51000, '#31a648', 8],
  ['Kaizer Chiefs', 'South Africa', 'Premier Soccer League', 'FNB Stadium', 94700, '#d9a441', 7],

  ['Enyimba', 'Nigeria', 'Nigeria Premier League', 'Enyimba International Stadium', 20000, '#0d9488', 6],
  ['Rangers International', 'Nigeria', 'Nigeria Premier League', 'Nnamdi Azikiwe Stadium', 22000, '#ef4444', 5],

  ['ASEC Mimosas', 'Ivory Coast', 'Ligue 1 Côte d’Ivoire', 'Stade Félix Houphouët-Boigny', 45000, '#f59e0b', 4],
  ['San-Pédro', 'Ivory Coast', 'Ligue 1 Côte d’Ivoire', 'Stade de San-Pédro', 12000, '#0ea5e9', 3],

  ['Wydad AC', 'Morocco', 'Botola Pro', 'Stade Mohamed V', 45000, '#d9a441', 9],
  ['Raja Casablanca', 'Morocco', 'Botola Pro', 'Stade Mohammed V', 45000, '#ff8a00', 8],

  ['Al Ahly', 'Egypt', 'Egyptian Premier League', 'Cairo International Stadium', 75000, '#facc15', 12],
  ['Zamalek', 'Egypt', 'Egyptian Premier League', 'Cairo International Stadium', 75000, '#1d4ed8', 10]
];

export const clubs = clubRows.map(([name, country, league, stadium, capacity, primaryKit, budgetEURm]) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name,
  country,
  league,
  stadium,
  capacity,
  primaryKit,
  transferBudgetEUR: Math.round((budgetEURm || 0) * 1_000_000)
}));

const rawPlayers = [
  ['Erling Haaland', 24, 'ST', 'Manchester City', 'Norway', 91, 93, 180000000, 300000],
  ['Kevin De Bruyne', 33, 'CM', 'Manchester City', 'Belgium', 90, 90, 35000000, 400000],
  ['Bukayo Saka', 23, 'RW', 'Arsenal', 'England', 89, 92, 150000000, 200000],
  ['Martin Ødegaard', 25, 'CAM', 'Arsenal', 'Norway', 88, 90, 85000000, 180000],
  ['Mohamed Salah', 32, 'RW', 'Liverpool', 'Egypt', 89, 89, 55000000, 350000],
  ['Virgil Van Dijk', 33, 'CB', 'Liverpool', 'Netherlands', 89, 89, 30000000, 220000],
  ['Luis Díaz', 27, 'LW', 'Liverpool', 'Colombia', 84, 88, 65000000, 130000],
  ['Marcus Rashford', 27, 'LW', 'Manchester United', 'England', 84, 87, 50000000, 130000],
  ['Rasmus Højlund', 21, 'ST', 'Manchester United', 'Denmark', 81, 89, 50000000, 100000],
  ['Cole Palmer', 22, 'CAM', 'Chelsea', 'England', 84, 90, 70000000, 120000],
  ['Pedro Neto', 24, 'LW', 'Chelsea', 'Portugal', 81, 88, 42000000, 100000],
  ['Son Heung-min', 32, 'LW', 'Tottenham Hotspur', 'South Korea', 86, 86, 42000000, 180000],
  ['James Maddison', 27, 'CAM', 'Tottenham Hotspur', 'England', 84, 86, 55000000, 120000],
  ['Kylian Mbappé', 25, 'ST', 'Real Madrid', 'France', 91, 95, 180000000, 300000],
  ['Jude Bellingham', 21, 'CAM', 'Real Madrid', 'England', 90, 94, 180000000, 250000],
  ['Vinícius Júnior', 24, 'LW', 'Real Madrid', 'Brazil', 90, 94, 200000000, 250000],
  ['Rodrygo', 23, 'RW', 'Real Madrid', 'Brazil', 87, 92, 120000000, 150000],
  ['Lamine Yamal', 17, 'RW', 'Barcelona', 'Spain', 89, 96, 180000000, 100000],
  ['Pedri', 21, 'CM', 'Barcelona', 'Spain', 88, 92, 120000000, 120000],
  ['Robert Lewandowski', 36, 'ST', 'Barcelona', 'Poland', 88, 88, 15000000, 200000],
  ['Antoine Griezmann', 33, 'ST', 'Atlético de Madrid', 'France', 88, 88, 25000000, 200000],
  ['Julian Alvarez', 24, 'CF', 'Atlético de Madrid', 'Argentina', 88, 92, 85000000, 150000],
  ['Lautaro Martínez', 27, 'ST', 'Inter', 'Argentina', 89, 90, 95000000, 180000],
  ['Nicolò Barella', 27, 'CM', 'Inter', 'Italy', 87, 89, 80000000, 120000],
  ['Rafael Leão', 25, 'LW', 'AC Milan', 'Portugal', 86, 91, 90000000, 120000],
  ['Christian Pulisic', 25, 'LW', 'AC Milan', 'United States', 84, 88, 40000000, 100000],
  ['Dusan Vlahović', 25, 'ST', 'Juventus', 'Serbia', 83, 90, 55000000, 110000],
  ['Khvicha Kvaratskhelia', 23, 'LW', 'Napoli', 'Georgia', 87, 92, 100000000, 130000],
  ['Romelu Lukaku', 31, 'ST', 'AS Roma', 'Belgium', 84, 85, 30000000, 120000],
  ['Harry Kane', 31, 'ST', 'Bayern Munich', 'England', 90, 90, 100000000, 400000],
  ['Jamal Musiala', 21, 'CAM', 'Bayern Munich', 'Germany', 87, 93, 140000000, 150000],
  ['Florian Wirtz', 21, 'CAM', 'Bayer Leverkusen', 'Germany', 88, 92, 140000000, 100000],
  ['Ousmane Dembélé', 27, 'RW', 'Paris Saint-Germain', 'France', 86, 87, 60000000, 200000],
  ['Kylian Mbappe', 25, 'ST', 'Paris Saint-Germain', 'France', 91, 95, 180000000, 300000],
  ['Marquinhos', 30, 'CB', 'Paris Saint-Germain', 'Brazil', 88, 88, 60000000, 170000],
  ['Mason Greenwood', 23, 'ST', 'Olympique Marseille', 'England', 81, 86, 55000000, 80000],
  ['Aleksandr Golovin', 29, 'AM', 'Monaco', 'Russia', 81, 82, 20000000, 70000],
  ['Brian Brobbey', 22, 'ST', 'Ajax', 'Netherlands', 80, 88, 35000000, 65000],
  ['Luuk de Jong', 35, 'ST', 'PSV Eindhoven', 'Netherlands', 79, 79, 6000000, 55000],
  ['Santiago Giménez', 23, 'ST', 'Feyenoord', 'Mexico', 81, 88, 35000000, 65000],
  ['João Mário', 31, 'CM', 'Benfica', 'Portugal', 80, 80, 12000000, 60000],
  ['Ángel Di María', 36, 'RW', 'Benfica', 'Argentina', 78, 78, 5000000, 80000],
  ['Fábio Vieira', 24, 'AM', 'FC Porto', 'Portugal', 77, 84, 20000000, 50000],
  ['Cody Gakpo', 25, 'LW', 'Liverpool', 'Netherlands', 84, 89, 70000000, 110000],
  ['Gonçalo Ramos', 23, 'ST', 'Benfica', 'Portugal', 82, 88, 42000000, 65000],
  ['Cristiano Ronaldo', 39, 'ST', 'Al Nassr', 'Portugal', 86, 86, 12000000, 400000],
  ['Sadio Mané', 32, 'LW', 'Al Nassr', 'Senegal', 82, 82, 20000000, 180000],
  ['Aleksandar Mitrović', 30, 'ST', 'Al Hilal', 'Serbia', 82, 83, 25000000, 150000],
  ['Sergej Milinković-Savić', 29, 'CM', 'Al Hilal', 'Serbia', 85, 86, 25000000, 150000],
  ['Marc Klok', 31, 'CM', 'Persib Bandung', 'Indonesia', 72, 72, 400000, 2500],
  ['Rizky Ridho', 23, 'CB', 'Persija Jakarta', 'Indonesia', 71, 78, 600000, 2000],
  ['Marselino Ferdinan', 20, 'CAM', 'Oxford United', 'Indonesia', 68, 80, 300000, 3000],
  ['Thom Haye', 29, 'CM', 'Almere City', 'Netherlands / Indonesia', 71, 71, 700000, 5000],
  ['Ciro Alves', 35, 'LW', 'Persib Bandung', 'Brazil / Indonesia', 69, 69, 250000, 3000],
  ['David da Silva', 34, 'ST', 'Persib Bandung', 'Brazil', 70, 70, 300000, 3000],
  ['Rizky Dwi Febrianto', 27, 'RB', 'Borneo FC', 'Indonesia', 65, 67, 200000, 1500],
  ['Bruno Moreira', 25, 'LW', 'Persebaya Surabaya', 'Brazil', 67, 70, 350000, 2000],
  ['Irfan Jaya', 32, 'LW', 'Persebaya Surabaya', 'Indonesia', 71, 71, 300000, 2000],
  ['Andritany Ardhiyasa', 31, 'GK', 'Bali United', 'Indonesia', 72, 73, 500000, 2000],
  ['Sandy Walsh', 29, 'CB', 'Bali United', 'Indonesia', 73, 74, 700000, 2500],
  ['M. Ridwan', 30, 'CB', 'Borneo FC', 'Indonesia', 68, 69, 250000, 1500],
  ['Muhammad Ferrari', 25, 'RW', 'Persija Jakarta', 'Indonesia', 70, 75, 500000, 2000],
  ['Hizkia Arthur', 25, 'CM', 'PSM Makassar', 'Indonesia', 69, 74, 400000, 1700],
  ['Yakob Sayuri', 29, 'CB', 'Madura United', 'Indonesia', 68, 69, 300000, 1800],
  ['Leonard Tupamahu', 29, 'CB', 'Bali United', 'Indonesia', 72, 73, 600000, 2500],
  ['Rafael Struick', 22, 'ST', 'Borneo FC', 'South Africa', 70, 78, 500000, 1800],
  ['Mitchell Duke', 34, 'ST', 'Machida Zelvia', 'Australia', 74, 74, 1000000, 25000],
  ['Neymar', 32, 'LW', 'Al Hilal', 'Brazil', 85, 87, 35000000, 230000],
  ['Karim Benzema', 36, 'ST', 'Al Ittihad', 'France', 82, 82, 18000000, 180000],
  ['Sergio Busquets', 36, 'DM', 'Inter Miami CF', 'Spain', 79, 79, 3000000, 80000],
  ['Lionel Messi', 37, 'RW', 'Inter Miami CF', 'Argentina', 88, 88, 20000000, 200000],
  ['Luis Suárez', 37, 'ST', 'Inter Miami CF', 'Uruguay', 82, 82, 10000000, 140000],
  ['Javier Mascherano', 41, 'DM', 'Inter Miami CF', 'Argentina', 73, 73, 200000, 30000],
  ['Gonzalo Montiel', 27, 'RB', 'River Plate', 'Argentina', 81, 87, 28000000, 70000],
  ['Enzo Fernández', 23, 'CM', 'Chelsea', 'Argentina', 84, 90, 70000000, 110000],
  ['Jorginho', 32, 'DM', 'Arsenal', 'Italy', 82, 82, 18000000, 70000],
  ['Declan Rice', 25, 'CM', 'Arsenal', 'England', 87, 92, 115000000, 180000],
  ['William Saliba', 23, 'CB', 'Arsenal', 'France', 87, 92, 95000000, 120000],
  ['Mikel Arteta', 42, 'CM', 'Arsenal', 'Spain', 75, 75, 0, 35000],
  ['Emiliano Martínez', 31, 'GK', 'Aston Villa', 'Argentina', 87, 88, 55000000, 100000],
  ['Alisson Becker', 31, 'GK', 'Liverpool', 'Brazil', 89, 89, 55000000, 160000],
  ['Trent Alexander-Arnold', 25, 'RB', 'Liverpool', 'England', 86, 90, 70000000, 180000],
  ['Frenkie de Jong', 27, 'CM', 'Barcelona', 'Netherlands', 84, 88, 70000000, 120000],
  ['Jules Koundé', 25, 'RB', 'Barcelona', 'France', 84, 88, 55000000, 100000],
  ['Memphis Depay', 30, 'ST', 'Atletico Madrid', 'Netherlands', 82, 83, 18000000, 100000],
  ['Gianluigi Donnarumma', 25, 'GK', 'Paris Saint-Germain', 'Italy', 88, 91, 70000000, 180000],
  ['Kolo Muani', 25, 'ST', 'Paris Saint-Germain', 'France', 83, 89, 60000000, 120000],
  ['Achraf Hakimi', 25, 'RB', 'Paris Saint-Germain', 'Morocco', 86, 90, 70000000, 170000],
  ['Diogo Costa', 25, 'GK', 'FC Porto', 'Portugal', 84, 88, 32000000, 65000],
  ['João Cancelo', 30, 'RB', 'Al Hilal', 'Portugal', 83, 84, 22000000, 140000],
  ['Mikel Merino', 28, 'CM', 'Arsenal', 'Spain', 82, 85, 35000000, 100000],
  ['Khephren Thuram', 23, 'CM', 'Juventus', 'France', 80, 89, 43000000, 75000],
  ['Dani Olmo', 26, 'AM', 'Barcelona', 'Spain', 84, 89, 60000000, 100000],
  ['Raphinha', 27, 'RW', 'Barcelona', 'Brazil', 85, 89, 75000000, 120000],
  ['Alexandre Lacazette', 33, 'ST', 'Lyon', 'France', 80, 80, 7000000, 45000],
  ['Jonathan David', 24, 'ST', 'Lille OSC', 'Canada', 82, 88, 33000000, 70000],
  ['Moussa Diaby', 25, 'LW', 'Al Ittihad', 'France', 82, 88, 32000000, 95000],
  ['İsmail Köybaşı', 34, 'LB', 'Beşiktaş', 'Turkey', 74, 74, 1500000, 25000]
];

export const players = rawPlayers.map(([name, age, position, club, country, ovr, potential, marketValueEUR, weeklyWageEUR]) => ({
  id: name.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, ''),
  name,
  age,
  position,
  club,
  country,
  ovr,
  potential,
  marketValueEUR,
  weeklyWageEUR,
  wonderkid: age <= 21 && potential >= 80
}));

export const findClub = (name) => clubs.find(c => c.name.toLowerCase() === String(name || '').toLowerCase());
export const clubForPlayer = (player) => findClub(player?.club);
export const formatEUR = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(value || 0);
export const searchPlayers = ({ name = '', club = '', league = '' } = {}) => players.filter(p =>
  p.name.toLowerCase().includes(name.toLowerCase()) &&
  p.club.toLowerCase().includes(club.toLowerCase()) &&
  (!league || clubForPlayer(p)?.league === league)
);

export const clubById = (id) => clubs.find(c => c.id === id);
export const playerById = (id) => players.find(p => p.id === id);

export const databaseSummary = {
  totalClubs: clubs.length,
  totalPlayers: players.length,
  season: '2024/25',
  sampleMode: true,
  notes: 'Curated real-name sample. Not a complete licensed database.'
};

export default { clubs, players, leagues, dataStatus, findClub, clubForPlayer, formatEUR, searchPlayers, databaseSummary };

"""""





















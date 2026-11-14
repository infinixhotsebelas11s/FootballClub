import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players, leagues, dataStatus } from '../database.js';
import { fifaClubWorldCupClubs, fifaClubWorldCupEditions, fifaClubWorldCupMetadata } from '../fifa-club-world-cup.js';

const ROLES = ['Asisten Pelatih', 'Manajer', 'Direktur Teknik', 'Direktur Olahraga', 'CEO', 'Presiden Klub', 'Pemilik Klub'];
const CONTINENTS = ['Asia', 'Afrika', 'Eropa', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];
const INITIAL = {
  role: 'Manajer', managerName: 'Manajer', club: 'Persib Bandung', cash: 2000000,
  reputation: 42, week: 1, played: 0, wins: 0, draws: 0, losses: 0, points: 0,
  squad: [], selectedContinent: '', selectedCountry: '', selectedDivision: 1,
};

const CONTINENT_BY_COUNTRY = {
  'China': 'Asia', 'Japan': 'Asia', 'South Korea': 'Asia', 'Saudi Arabia': 'Asia',
  'United Arab Emirates': 'Asia', 'Qatar': 'Asia', 'Indonesia': 'Asia', 'Thailand': 'Asia',
  'Vietnam': 'Asia', 'Cambodia': 'Asia', 'Malaysia': 'Asia', 'Singapore': 'Asia',
  'Philippines': 'Asia', 'Australia': 'Oseania', 'New Zealand': 'Oseania',
  'England': 'Eropa', 'Spain': 'Eropa', 'Italy': 'Eropa', 'Germany': 'Eropa',
  'France': 'Eropa', 'Netherlands': 'Eropa', 'Portugal': 'Eropa', 'Turkey': 'Eropa',
  'Russia': 'Eropa', 'Belgium': 'Eropa', 'Ireland': 'Eropa', 'Scotland': 'Eropa',
  'Austria': 'Eropa', 'Brazil': 'Amerika Selatan', 'Argentina': 'Amerika Selatan',
  'Colombia': 'Amerika Selatan', 'Mexico': 'Amerika Utara', 'United States': 'Amerika Utara',
  'Canada': 'Amerika Utara', 'South Africa': 'Afrika', 'Nigeria': 'Afrika',
  'Ivory Coast': 'Afrika', 'Morocco': 'Afrika', 'Egypt': 'Afrika', 'Tunisia': 'Afrika',
  'DR Congo': 'Afrika', 'New Caledonia': 'Oseania', 'French Polynesia': 'Oseania',
};

// Assign a tier only when the league name explicitly identifies it. Unmarked
// competitions are treated as the top listed level; missing divisions aren't invented.
const TIER_PATTERNS = [
  [/\b(2|ii|second|championship|segunda|serie b|2\. bundesliga|ligue 2|segunda división|segunda division)\b/i, 2],
  [/\b(3|iii|third|league one|league 1|serie c|3\. liga|ligue 3|tercera|division 2|j2 league|k league 2)\b/i, 3],
  [/\b(4|iv|fourth|league two|serie d|division 3|j3 league|k league 3)\b/i, 4],
];
function tierOf(league) {
  const name = String(league || '');
  for (const [pattern, tier] of TIER_PATTERNS) if (pattern.test(name)) return tier;
  return 1;
}
function readGame() {
  try { return { ...INITIAL, ...JSON.parse(localStorage.getItem('touchline-save') || '{}') }; }
  catch { return { ...INITIAL }; }
}
const selectClass = 'mt-2 w-full rounded-xl border border-white/10 bg-[#0b100c] px-3 py-3 text-white focus:border-lime-300 focus:outline-none';
const cardClass = 'rounded-2xl border border-white/[.08] bg-[#111713] p-5';
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function App() {
  const [game, setGame] = useState(readGame);
  const [page, setPage] = useState('Ringkasan');
  const [continent, setContinent] = useState(game.selectedContinent || CONTINENT_BY_COUNTRY[clubs.find((c) => c.name === game.club)?.country] || 'Asia');
  const [country, setCountry] = useState(game.selectedCountry || clubs.find((c) => c.name === game.club)?.country || '');
  const [division, setDivision] = useState(Number(game.selectedDivision) || 1);
  const [search, setSearch] = useState('');
  const [toast, setToast] = useState('');
  const [match, setMatch] = useState(null);

  useEffect(() => {
    try { localStorage.setItem('touchline-save', JSON.stringify(game)); } catch { /* local save unavailable */ }
  }, [game]);

  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);
  const currentClub = allClubs.find((club) => club.name === game.club) || allClubs[0];
  const continentsInData = useMemo(() => CONTINENTS.filter((item) => allClubs.some((club) => CONTINENT_BY_COUNTRY[club.country] === item)), [allClubs]);
  const countries = useMemo(() => [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent).map((club) => club.country))].sort(), [allClubs, continent]);
  const countryClubs = useMemo(() => allClubs.filter((club) => club.country === country), [allClubs, country]);
  const divisions = useMemo(() => [...new Set(countryClubs.map((club) => tierOf(club.league)).filter((tier) => tier >= 1 && tier <= 4))].sort(), [countryClubs]);
  const availableClubs = useMemo(() => countryClubs.filter((club) => tierOf(club.league) === Number(division)).sort((a, b) => a.name.localeCompare(b.name)), [countryClubs, division]);
  const squad = useMemo(() => {
    if (!currentClub) return [];
    const selected = game.squad.length ? players.filter((player) => game.squad.includes(player.id)) : [];
    return selected.length ? selected : players.filter((player) => player.club === currentClub.name);
  }, [currentClub, game.squad]);
  const filteredPlayers = useMemo(() => players.filter((player) => `${player.name} ${player.club} ${player.country}`.toLowerCase().includes(search.toLowerCase())).slice(0, 60), [search]);

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2600);
  }
  function selectContinent(value) {
    setContinent(value);
    const nextCountries = [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === value).map((club) => club.country))].sort();
    const nextCountry = nextCountries[0] || '';
    setCountry(nextCountry);
    setDivision(1);
    setGame((previous) => ({ ...previous, selectedContinent: value, selectedCountry: nextCountry, selectedDivision: 1 }));
  }
  function selectCountry(value) {
    setCountry(value);
    setDivision(1);
    setGame((previous) => ({ ...previous, selectedCountry: value, selectedDivision: 1 }));
  }
  function selectDivision(value) {
    const next = Number(value);
    setDivision(next);
    setGame((previous) => ({ ...previous, selectedDivision: next }));
  }
  function chooseClub(chosen) {
    const newSquad = players.filter((player) => player.club === chosen.name).map((player) => player.id);
    setGame((previous) => ({ ...previous, club: chosen.name, squad: newSquad, selectedContinent: continent, selectedCountry: country, selectedDivision: division }));
    notify(`${chosen.name} dipilih sebagai klub kamu.`);
  }
  function playMatch() {
    const opponents = allClubs.filter((item) => item.league === currentClub?.league && item.id !== currentClub?.id);
    if (!opponents.length) { notify('Belum ada lawan di liga ini dalam dataset.'); return; }
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const ownPower = squad.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(1, squad.length) || 62;
    const rivalPlayers = players.filter((player) => player.club === opponent.name);
    const rivalPower = rivalPlayers.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(1, rivalPlayers.length) || 62;
    const ownGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (ownPower - rivalPower) / 18)));
    const opponentGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (rivalPower - ownPower) / 18)));
    const won = ownGoals > opponentGoals;
    const draw = ownGoals === opponentGoals;
    setGame((previous) => ({ ...previous, week: previous.week + 1, played: previous.played + 1, wins: previous.wins + (won ? 1 : 0), draws: previous.draws + (draw ? 1 : 0), losses: previous.losses + (!won && !draw ? 1 : 0), points: previous.points + (won ? 3 : draw ? 1 : 0), reputation: Math.max(0, Math.min(100, previous.reputation + (won ? 3 : draw ? 1 : 0))) }));
    setMatch({ ownGoals, opponentGoals, opponent: opponent.name });
  }
  function resetSave() {
    const fresh = { ...INITIAL, club: currentClub?.name || INITIAL.club, squad: players.filter((player) => player.club === currentClub?.name).map((player) => player.id) };
    setGame(fresh);
    notify('Save permainan direset.');
  }

  return (
    <div className="min-h-screen bg-[#090c0a] text-white">
      <header className="sticky top-0 z-10 flex items-center justify-between border-b border-white/10 bg-[#090c0a]/95 px-4 py-4 backdrop-blur">
        <div><p className="text-xs uppercase tracking-[.2em] text-lime-300">Football Club Manager</p><h1 className="text-xl font-bold">{currentClub?.name || 'Pilih klub'}</h1></div>
        <div className="text-right text-xs text-white/65"><div>{game.role} · Rep {game.reputation}</div><div>Kas {new Intl.NumberFormat('id-ID').format(game.cash)} · Pekan {game.week}</div></div>
      </header>
      <nav className="sticky top-[72px] z-10 flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0b100c] p-3">
        {['Ringkasan', 'Pilih Klub', 'Piala Dunia Antarklub', 'Skuad', 'Database'].map((item) => <button key={item} onClick={() => setPage(item)} className={`shrink-0 rounded-lg px-3 py-2 text-sm ${page === item ? 'bg-lime-300 text-black' : 'bg-white/5 text-white/75'}`}>{item}</button>)}
      </nav>
      <main className="mx-auto max-w-6xl space-y-5 p-4 sm:p-8">
        {page === 'Pilih Klub' && <section className={cardClass}>
          <h2 className="text-2xl font-bold">Pilih klub</h2>
          <p className="mb-5 mt-1 text-sm text-white/55">Pilih benua, negara, divisi, lalu klub. Hanya klub yang ada dalam dataset yang ditampilkan.</p>
          <div className="grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-white/75">1. Benua<select className={selectClass} value={continent} onChange={(event) => selectContinent(event.target.value)}>{continentsInData.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-sm text-white/75">2. Negara<select className={selectClass} value={country} onChange={(event) => selectCountry(event.target.value)}>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-sm text-white/75">3. Divisi (maksimal 4)<select className={selectClass} value={division} onChange={(event) => selectDivision(event.target.value)}>{divisions.map((tier) => <option key={tier} value={tier}>Divisi {tier}</option>)}</select></label>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-between gap-2"><h3 className="text-lg font-semibold">4. Pilih klub · {availableClubs.length} tersedia</h3><span className="text-xs text-white/45">Klub saat ini: {game.club}</span></div>
          {availableClubs.length ? <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{availableClubs.map((item) => <button key={item.id || item.name} onClick={() => chooseClub(item)} className={`rounded-xl border p-4 text-left ${item.name === game.club ? 'border-lime-300/50 bg-lime-300/10' : 'border-white/10 bg-[#0b100c] hover:border-lime-300/30'}`}><span className="block font-semibold">{item.name}</span><span className="mt-1 block text-xs text-white/55">{item.league} · {item.country}</span><span className="mt-2 block text-[11px] text-white/35">{item.fifaClubWorldCupEditions?.length ? `Peserta CWC: ${item.fifaClubWorldCupEditions.join(', ')}` : item.dataSource || 'Data klub tersedia'}</span></button>)}</div> : <p className="mt-4 rounded-xl border border-amber-300/20 bg-amber-300/5 p-4 text-sm text-amber-100">Belum ada klub di divisi ini dalam dataset. Pilih divisi lain atau negara lain. Data divisi yang tidak tersedia tidak dibuat-buat.</p>}
          <p className="mt-4 text-xs text-white/40">Catatan: pembagian divisi hanya berdasarkan nama kompetisi yang tercatat. Negara yang datanya belum tersedia mungkin hanya memiliki Divisi 1.</p>
        </section>}
        {page === 'Ringkasan' && <section className={cardClass}><p className="text-xs uppercase tracking-widest text-lime-300">Musim 2024/25 · Pekan {game.week}</p><h2 className="mt-1 text-3xl font-bold">{currentClub?.name}</h2><p className="mt-1 text-sm text-white/55">{currentClub?.league} · {currentClub?.country}</p><div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">{[['Kas', new Intl.NumberFormat('id-ID').format(game.cash)], ['Poin', game.points], ['Menang', game.wins], ['Reputasi', game.reputation]].map(([label, value]) => <div key={label} className="rounded-xl bg-[#0b100c] p-4"><div className="text-xs text-white/45">{label}</div><div className="mt-1 text-xl font-bold">{value}</div></div>)}</div><div className="mt-5 flex flex-wrap gap-2"><button className="rounded-xl bg-lime-300 px-4 py-3 font-semibold text-black" onClick={playMatch}>Mainkan pertandingan</button><button className="rounded-xl border border-white/10 px-4 py-3" onClick={() => setPage('Pilih Klub')}>Ganti klub</button><button className="rounded-xl border border-white/10 px-4 py-3" onClick={resetSave}>Reset save</button></div></section>}
        {page === 'Piala Dunia Antarklub' && <section className={cardClass}><h2 className="text-2xl font-bold">Piala Dunia Antarklub</h2><p className="mt-2 text-sm text-white/55">Peserta historis terdata: {fifaClubWorldCupMetadata.participantCount}. Edisi: {fifaClubWorldCupEditions.join(', ')}.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{fifaClubWorldCupClubs.map((item) => <div key={`${item.id}-${item.name}`} className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="font-semibold">{item.name}</div><div className="text-xs text-white/50">{item.country} · {item.league}</div><div className="mt-1 text-xs text-lime-200">Edisi: {item.fifaClubWorldCupEditions.join(', ')}</div></div>)}</div><p className="mt-4 text-xs text-white/40">Ini daftar peserta yang dirangkum, bukan semua klub dunia. Turnamen otomatis grup dan knockout belum disimulasikan.</p></section>}
        {page === 'Skuad' && <section className={cardClass}><h2 className="text-2xl font-bold">Skuad {currentClub?.name}</h2>{squad.length ? <div className="mt-4 divide-y divide-white/10">{squad.map((player) => <div key={player.id} className="flex justify-between py-3"><div><div className="font-medium">{player.name}</div><div className="text-xs text-white/50">{player.position} · {player.country}</div></div><b className="text-lime-200">{player.ovr || '—'}</b></div>)}</div> : <p className="mt-3 text-sm text-white/50">Tidak ada profil pemain untuk klub pilihan di dataset.</p>}</section>}
        {page === 'Database' && <section className={cardClass}><h2 className="text-2xl font-bold">Database pemain</h2><p className="mt-1 text-xs text-white/50">{players.length} pemain dalam dataset.</p><input className={selectClass} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari pemain, klub, atau negara"/><div className="mt-4 divide-y divide-white/10">{filteredPlayers.map((player) => <div key={player.id} className="flex justify-between py-3"><div><div className="font-medium">{player.name}</div><div className="text-xs text-white/50">{player.club} · {player.country} · {player.position}</div></div><span className="text-lime-200">{player.ovr || '—'}</span></div>)}</div></section>}
        <p className="text-xs text-white/35">{dataStatus.coverageNote || dataStatus.completeness} · daftar klub dan divisi mengikuti data sumber yang tersedia.</p>
      </main>
      {match && <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4"><div className={`${cardClass} w-full max-w-md text-center`}><p className="text-xs uppercase tracking-widest text-lime-300">Hasil pertandingan</p><h2 className="mt-3 text-xl font-bold">{currentClub?.name} {match.ownGoals}–{match.opponentGoals} {match.opponent}</h2><button className="mt-5 rounded-xl bg-lime-300 px-4 py-2 font-semibold text-black" onClick={() => setMatch(null)}>Tutup</button></div></div>}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-lime-300/20 bg-[#111713] px-4 py-3 text-sm shadow-xl">{toast}</div>}
      <footer className="mx-auto max-w-6xl px-4 pb-8 text-[10px] text-white/25">Touchline Career · data seed musim 2024/25 · save otomatis di perangkat ini</footer>
    </div>
  );
}

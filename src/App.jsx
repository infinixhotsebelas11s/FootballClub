import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players, leagues, dataStatus } from '../database.js';
import { fifaClubWorldCupClubs, fifaClubWorldCupEditions, fifaClubWorldCupMetadata } from '../fifa-club-world-cup.js';

const ROLES = ['Asisten Pelatih', 'Manajer', 'Direktur Teknik', 'Direktur Olahraga', 'CEO', 'Presiden Klub', 'Pemilik Klub'];
const CONTINENTS = ['Asia', 'Afrika', 'Eropa', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];
const INITIAL = {
  role: 'Manajer', managerName: 'Manajer', club: 'Persib Bandung', cash: 2000000,
  reputation: 42, week: 1, played: 0, wins: 0, draws: 0, losses: 0, points: 0,
  squad: [], selectedContinent: 'Asia', selectedCountry: 'Indonesia', selectedDivision: 1,
};
const selectClass = 'mt-1 w-full rounded-xl border border-white/10 bg-[#0b100c] px-3 py-2 text-sm text-white outline-none focus:border-lime-300/50';
const cardClass = 'rounded-2xl border border-white/10 bg-[#101810]/80 p-5 shadow-[0_0_0_1px_rgba(255,255,255,0.02)]';
const CONTINENT_BY_COUNTRY = {
  'Indonesia': 'Asia', 'Japan': 'Asia', 'Saudi Arabia': 'Asia', 'South Korea': 'Asia', 'Qatar': 'Asia', 'United Arab Emirates': 'Asia', 'China': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia', 'Australia': 'Oseania', 'New Zealand': 'Oseania', 'South Africa': 'Afrika', 'Morocco': 'Afrika', 'Egypt': 'Afrika', 'Tunisia': 'Afrika', 'DR Congo': 'Afrika', 'Mali': 'Afrika', 'Nigeria': 'Afrika', 'Senegal': 'Afrika', 'Algeria': 'Afrika', 'Ghana': 'Afrika', 'Cameroon': 'Afrika', 'Côte d’Ivoire': 'Afrika', 'Uganda': 'Afrika', 'Kenya': 'Afrika', 'United States': 'Amerika Utara', 'Mexico': 'Amerika Utara', 'Canada': 'Amerika Utara', 'Costa Rica': 'Amerika Utara', 'Honduras': 'Amerika Utara', 'Belize': 'Amerika Utara', 'England': 'Eropa', 'Germany': 'Eropa', 'Spain': 'Eropa', 'France': 'Eropa', 'Italy': 'Eropa', 'Portugal': 'Eropa', 'Netherlands': 'Eropa', 'Belgium': 'Eropa', 'Argentina': 'Amerika Selatan', 'Brazil': 'Amerika Selatan', 'Colombia': 'Amerika Selatan', 'Uruguay': 'Amerika Selatan', 'Chile': 'Amerika Selatan', 'Peru': 'Amerika Selatan', 'Paraguay': 'Amerika Selatan', 'Ecuador': 'Amerika Selatan', 'Bolivia': 'Amerika Selatan', 'Venezuela': 'Amerika Selatan', 'France': 'Eropa', 'Scotland': 'Eropa', 'Greece': 'Eropa', 'Switzerland': 'Eropa', 'Austria': 'Eropa', 'Croatia': 'Eropa', 'Serbia': 'Eropa', 'Poland': 'Eropa', 'Norway': 'Eropa', 'Sweden': 'Eropa', 'Denmark': 'Eropa', 'Ukraine': 'Eropa', 'Czech Republic': 'Eropa', 'Turkey': 'Eropa', 'Russia': 'Eropa', 'Belgium': 'Eropa', 'Ireland': 'Eropa', 'Romania': 'Eropa', 'Slovenia': 'Eropa', 'Finland': 'Eropa', 'Hungary': 'Eropa', 'Israel': 'Eropa', 'Cyprus': 'Eropa', 'Northern Ireland': 'Eropa', 'Wales': 'Eropa', 'Portugal': 'Eropa', 'Brazil': 'Amerika Selatan', 'Argentina': 'Amerika Selatan', 'United States': 'Amerika Utara', 'Mexico': 'Amerika Utara', 'New Caledonia': 'Oseania', 'French Polynesia': 'Oseania', 'Tahiti': 'Oseania'
};
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function App() {
  const [page, setPage] = useState('Pilih Klub');
  const [continent, setContinent] = useState(INITIAL.selectedContinent);
  const [country, setCountry] = useState(INITIAL.selectedCountry);
  const [division, setDivision] = useState(INITIAL.selectedDivision);
  const [game, setGame] = useState(() => {
    const saved = localStorage.getItem('football-club-manager-save');
    if (!saved) return INITIAL;
    try {
      return { ...INITIAL, ...JSON.parse(saved) };
    } catch {
      return INITIAL;
    }
  });
  const [match, setMatch] = useState(null);
  const [notifyText, setNotifyText] = useState('');
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    localStorage.setItem('football-club-manager-save', JSON.stringify(game));
  }, [game]);

  useEffect(() => {
    const timer = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(timer);
  }, []);

  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);
  const currentClub = allClubs.find((club) => club.name === game.club) || allClubs[0];
  const continentsInData = useMemo(() => CONTINENTS.filter((item) => allClubs.some((club) => CONTINENT_BY_COUNTRY[club.country] === item)), [allClubs]);
  const countries = useMemo(() => [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent).map((club) => club.country))].sort(), [allClubs, continent]);
  const divisions = useMemo(() => [...new Set(allClubs.filter((club) => club.country === country).map((club) => Number(club.division || 1)))].sort((a, b) => a - b).slice(0, 4), [allClubs, country]);
  const availableClubs = useMemo(() => allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent && club.country === country && Number(club.division || 1) === Number(division)).sort((a, b) => a.name.localeCompare(b.name)), [allClubs, continent, country, division]);
  const currentSquad = useMemo(() => players.filter((player) => player.club === game.club), [game.club]);
  const transferWindow = useMemo(() => {
    const start = new Date('2024-08-01T00:00:00Z');
    const end = new Date('2024-09-30T23:59:59Z');
    const current = new Date(now);
    const total = end.getTime() - start.getTime();
    const remaining = Math.max(0, end.getTime() - current.getTime());

    if (current < start) {
      const diff = start.getTime() - current.getTime();
      const days = Math.floor(diff / 86400000);
      const hours = Math.floor((diff % 86400000) / 3600000);
      const minutes = Math.floor((diff % 3600000) / 60000);
      return { open: false, status: 'Belum dibuka', countdown: `${days}d ${hours}j ${minutes}m`, percent: 0, deadline: '1 Aug 2024' };
    }
    if (current > end) {
      return { open: false, status: 'Tutup', countdown: 'Transfer window selesai', percent: 100, deadline: '30 Sep 2024' };
    }
    const pct = (remaining / total) * 100;
    const days = Math.floor(remaining / 86400000);
    const hours = Math.floor((remaining % 86400000) / 3600000);
    const minutes = Math.floor((remaining % 3600000) / 60000);
    return { open: true, status: 'Buka', countdown: `${days}d ${hours}j ${minutes}m`, percent: 100 - pct, deadline: '30 Sep 2024' };
  }, [now]);
  const transferTargets = useMemo(() => {
    if (!transferWindow.open) return [];
    return players.filter((player) => player.club !== game.club).slice(0, 8);
  }, [game.club, transferWindow.open]);

  function notify(message) {
    setNotifyText(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = setTimeout(() => setNotifyText(''), 2500);
  }

  function selectContinent(value) {
    setContinent(value);
    const nextCountries = [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === value).map((club) => club.country))].sort();
    const nextCountry = nextCountries[0] || '';
    setCountry(nextCountry);
    const nextDivisions = [...new Set(allClubs.filter((club) => club.country === nextCountry).map((club) => Number(club.division || 1)))].sort((a, b) => a - b).slice(0, 4);
    setDivision(nextDivisions[0] || 1);
    setGame((previous) => ({ ...previous, selectedContinent: value, selectedCountry: nextCountry, selectedDivision: nextDivisions[0] || 1 }));
  }

  function selectCountry(value) {
    setCountry(value);
    const nextDivisions = [...new Set(allClubs.filter((club) => club.country === value).map((club) => Number(club.division || 1)))].sort((a, b) => a - b).slice(0, 4);
    const nextDivision = nextDivisions[0] || 1;
    setDivision(nextDivision);
    setGame((previous) => ({ ...previous, selectedCountry: value, selectedDivision: nextDivision }));
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

  function buyPlayer(player) {
    if (!transferWindow.open) {
      notify('Jendela transfer ditutup. Tunggu membuka lagi pada periode berikutnya.');
      return;
    }
    const price = Number(player.marketValueEUR || 500000);
    if (game.squad.includes(player.id)) {
      notify('Pemain sudah berada di skuad.');
      return;
    }
    if (price > game.cash) {
      notify('Kas klub tidak cukup untuk membeli pemain ini.');
      return;
    }
    setGame((previous) => ({
      ...previous,
      cash: previous.cash - price,
      squad: [...previous.squad, player.id],
    }));
    notify(`${player.name} berhasil didatangkan.`);
  }

  function playMatch() {
    const opponents = allClubs.filter((item) => item.league === currentClub?.league && item.id !== currentClub?.id);
    if (!opponents.length) { notify('Belum ada lawan di liga ini dalam dataset.'); return; }
    const opponent = opponents[Math.floor(Math.random() * opponents.length)];
    const ownPower = currentSquad.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(1, currentSquad.length) || 62;
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
        <nav className="flex flex-wrap items-center gap-2 text-sm text-white/70">
          {['Pilih Klub', 'Jadwal', 'Piala Dunia Antarklub', 'Data'].map((tab) => <button key={tab} onClick={() => setPage(tab)} className={`rounded-full px-3 py-1.5 transition ${page === tab ? 'bg-lime-300 text-[#0a120d]' : 'bg-white/5 hover:bg-white/10'}`}>{tab}</button>)}
        </nav>
      </header>

      <main className="mx-auto max-w-7xl px-4 py-6">
        <div className="mb-5 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/5 p-4 text-sm">
          <div>
            <div className="text-[10px] uppercase tracking-[.2em] text-lime-200/80">Transfer Window</div>
            <div className="mt-1 flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transferWindow.open ? 'bg-lime-300 text-[#07130b]' : 'bg-amber-300 text-[#231805]'}`}>{transferWindow.status}</span><span className="text-white/70">{transferWindow.countdown}</span></div>
          </div>
          <div className="w-full max-w-xs">
            <div className="mb-1 flex justify-between text-[10px] uppercase tracking-[.25em] text-white/55"><span>Deadline</span><span>{transferWindow.deadline}</span></div>
            <div className="h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime-300" style={{ width: `${Math.min(100, Math.max(0, transferWindow.percent))}%` }} /></div>
          </div>
        </div>

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
        </section>}

        {page === 'Jadwal' && <section className={cardClass}>
          <div className="mb-4 flex items-center justify-between gap-2"><h2 className="text-2xl font-bold">Jadwal musim</h2><button onClick={resetSave} className="rounded-xl border border-white/10 bg-white/5 px-3 py-1.5 text-sm hover:bg-white/10">Reset save</button></div>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="text-xs uppercase tracking-[.2em] text-white/40">Klub</div><div className="mt-2 text-xl font-semibold">{game.club}</div></div>
            <div className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="text-xs uppercase tracking-[.2em] text-white/40">Minggu</div><div className="mt-2 text-xl font-semibold">{game.week}</div></div>
            <div className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="text-xs uppercase tracking-[.2em] text-white/40">Reputasi</div><div className="mt-2 text-xl font-semibold">{game.reputation}</div></div>
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-[#0b100c] p-4">
            <div className="mb-3 flex items-center justify-between"><h3 className="text-lg font-semibold">Hasil pertandingan</h3><button onClick={playMatch} className="rounded-xl bg-lime-300 px-3 py-2 text-sm font-semibold text-[#08140d]">Mainkan satu laga</button></div>
            {match ? <div className="grid gap-2 sm:grid-cols-3"><div className="rounded-xl bg-white/5 p-3"><div className="text-xs uppercase tracking-[.2em] text-white/40">Skor</div><div className="mt-2 text-2xl font-bold">{match.ownGoals} - {match.opponentGoals}</div></div><div className="rounded-xl bg-white/5 p-3"><div className="text-xs uppercase tracking-[.2em] text-white/40">Lawan</div><div className="mt-2 text-lg font-semibold">{match.opponent}</div></div><div className="rounded-xl bg-white/5 p-3"><div className="text-xs uppercase tracking-[.2em] text-white/40">Status</div><div className="mt-2 text-lg font-semibold">{match.ownGoals > match.opponentGoals ? 'Menang' : match.ownGoals === match.opponentGoals ? 'Seri' : 'Kalah'}</div></div></div> : <p className="text-white/55">Belum ada hasil pertandingan. Mainkan satu laga untuk mulai musim.</p>}
          </div>
          <div className="mt-5 rounded-xl border border-white/10 bg-[#0b100c] p-4">
            <h3 className="text-lg font-semibold">Transfer window</h3>
            <div className="mt-3 rounded-xl border border-lime-300/20 bg-lime-300/5 p-3 text-sm">
              <div className="flex items-center justify-between gap-3"><span className="font-medium">Status</span><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transferWindow.open ? 'bg-lime-300 text-[#07130b]' : 'bg-amber-300 text-[#231805]'}`}>{transferWindow.status}</span></div>
              <div className="mt-2 flex items-center justify-between gap-3"><span className="font-medium">Sisa waktu</span><span>{transferWindow.countdown}</span></div>
              <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-lime-300" style={{ width: `${Math.min(100, Math.max(0, transferWindow.percent))}%` }} /></div>
            </div>
            <div className="mt-4 grid gap-2">
              {transferWindow.open ? transferTargets.length ? transferTargets.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b100c] p-3"><div><div className="font-medium">{player.name}</div><div className="text-xs text-white/45">{player.club} · {player.position} · OVR {player.ovr}</div></div><div className="flex items-center gap-2"><span className="text-xs text-lime-200">€{Number(player.marketValueEUR || 500000).toLocaleString('en-US')}</span><button onClick={() => buyPlayer(player)} className="rounded-lg bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-900">Beli</button></div></div>) : <p className="text-sm text-white/55">Tidak ada pemain yang tersedia saat ini.</p> : <p className="text-sm text-amber-100">Window transfer sedang tutup. Pembelian tidak bisa dilakukan.</p>}
            </div>
          </div>
        </section>}

        {page === 'Piala Dunia Antarklub' && <section className={cardClass}><h2 className="text-2xl font-bold">Piala Dunia Antarklub</h2><p className="mt-2 text-sm text-white/55">Peserta historis terdata: {fifaClubWorldCupMetadata.participantCount}. Edisi: {fifaClubWorldCupEditions.join(', ')}.</p><div className="mt-4 grid gap-2 sm:grid-cols-2">{fifaClubWorldCupClubs.map((item) => <div key={`${item.id}-${item.name}`} className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="font-semibold">{item.name}</div><div className="text-xs text-white/50">{item.country} · {item.league}</div><div className="mt-1 text-xs text-lime-200">Edisi: {item.fifaClubWorldCupEditions.join(', ')}</div></div>)}</div><p className="mt-4 text-xs text-white/40">Ini daftar peserta yang dirangkum, bukan semua klub dunia. Turnamen otomatis grup dan knockout belum disimulasikan.</p></section>}

        {page === 'Data' && <section className={cardClass}><h2 className="text-2xl font-bold">Data</h2><div className="mt-4 grid gap-3 sm:grid-cols-3">{Object.entries(dataStatus).map(([key, value]) => <div key={key} className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="text-xs uppercase tracking-[.2em] text-white/40">{key}</div><div className="mt-2 text-sm font-medium text-white/80">{String(value)}</div></div>)}</div></section>}

        <div className="mt-6 flex items-center justify-between gap-2 text-xs text-white/45"><span>Data: {players.length} pemain · {clubs.length} klub · {leagues.length} liga</span><span>{dataStatus.source}</span></div>
      </main>

      {notifyText && <div className="fixed bottom-5 right-5 rounded-xl border border-lime-300/30 bg-[#0d1a14] px-4 py-2 text-sm text-lime-100 shadow-lg">{notifyText}</div>}
    </div>
  );
}

export default App;
import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players, leagues, dataStatus } from '../database.js';
import { fifaClubWorldCupClubs, fifaClubWorldCupEditions, fifaClubWorldCupMetadata } from '../fifa-club-world-cup.js';

const CONTINENTS = ['Asia', 'Afrika', 'Eropa', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];
const CONTINENT_BY_COUNTRY = {
  Indonesia: 'Asia', Japan: 'Asia', 'Saudi Arabia': 'Asia', 'South Korea': 'Asia', Qatar: 'Asia',
  'United Arab Emirates': 'Asia', China: 'Asia', Iran: 'Asia', Iraq: 'Asia', Thailand: 'Asia',
  Vietnam: 'Asia', Malaysia: 'Asia', Singapore: 'Asia', Philippines: 'Asia', Australia: 'Oseania',
  'New Zealand': 'Oseania', 'New Caledonia': 'Oseania', 'French Polynesia': 'Oseania', England: 'Eropa',
  Germany: 'Eropa', Spain: 'Eropa', France: 'Eropa', Italy: 'Eropa', Portugal: 'Eropa', Netherlands: 'Eropa',
  Belgium: 'Eropa', Scotland: 'Eropa', Ireland: 'Eropa', Austria: 'Eropa', Greece: 'Eropa', Turkey: 'Eropa',
  Russia: 'Eropa', Switzerland: 'Eropa', Croatia: 'Eropa', Serbia: 'Eropa', Poland: 'Eropa', Norway: 'Eropa',
  Sweden: 'Eropa', Denmark: 'Eropa', Ukraine: 'Eropa', Wales: 'Eropa', Argentina: 'Amerika Selatan',
  Brazil: 'Amerika Selatan', Colombia: 'Amerika Selatan', Chile: 'Amerika Selatan', Uruguay: 'Amerika Selatan',
  Peru: 'Amerika Selatan', Paraguay: 'Amerika Selatan', Ecuador: 'Amerika Selatan', Mexico: 'Amerika Utara',
  'United States': 'Amerika Utara', Canada: 'Amerika Utara', 'Costa Rica': 'Amerika Utara', Honduras: 'Amerika Utara',
  Panama: 'Amerika Utara', Jamaica: 'Amerika Utara', 'South Africa': 'Afrika', Morocco: 'Afrika', Egypt: 'Afrika',
  Tunisia: 'Afrika', 'DR Congo': 'Afrika', Nigeria: 'Afrika', Senegal: 'Afrika', Ghana: 'Afrika',
  'Ivory Coast': 'Afrika', Algeria: 'Afrika', Cameroon: 'Afrika', Mali: 'Afrika', Kenya: 'Afrika', Uganda: 'Afrika',
};
const INITIAL = {
  club: 'Persib Bandung', role: 'Manajer', cash: 2000000, reputation: 42, week: 1,
  played: 0, wins: 0, draws: 0, losses: 0, points: 0, squad: [],
  selectedContinent: 'Asia', selectedCountry: 'Indonesia', selectedDivision: 1,
  playerWatch: [], transferHistory: [],
};
const cardClass = 'rounded-2xl border border-white/10 bg-[#101810]/80 p-5';
const inputClass = 'w-full rounded-xl border border-white/10 bg-[#0b100c] px-3 py-2 text-sm text-white placeholder:text-white/35 outline-none focus:border-lime-300/50';
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const euro = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value) || 0);

function readSave() {
  try {
    const saved = typeof window !== 'undefined' ? window.localStorage.getItem('football-club-manager-save') : null;
    return saved ? { ...INITIAL, ...JSON.parse(saved) } : { ...INITIAL };
  } catch {
    return { ...INITIAL };
  }
}

function App() {
  const [page, setPage] = useState('Pilih Klub');
  const [game, setGame] = useState(readSave);
  const [continent, setContinent] = useState(game.selectedContinent || 'Asia');
  const [country, setCountry] = useState(game.selectedCountry || 'Indonesia');
  const [division, setDivision] = useState(Number(game.selectedDivision) || 1);
  const [query, setQuery] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [toast, setToast] = useState('');
  const [match, setMatch] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    try { window.localStorage.setItem('football-club-manager-save', JSON.stringify(game)); } catch { /* storage may be unavailable */ }
  }, [game]);
  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(timer);
  }, []);

  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);
  const currentClub = allClubs.find((club) => club.name === game.club) || allClubs[0];
  const continentsInData = useMemo(() => CONTINENTS.filter((item) => allClubs.some((club) => CONTINENT_BY_COUNTRY[club.country] === item)), [allClubs]);
  const countries = useMemo(() => [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent).map((club) => club.country))].sort(), [allClubs, continent]);
  const countryClubs = useMemo(() => allClubs.filter((club) => club.country === country), [allClubs, country]);
  const divisions = useMemo(() => [...new Set(countryClubs.map((club) => Number(club.division || 1)).filter((tier) => tier >= 1 && tier <= 4))].sort((a, b) => a - b), [countryClubs]);
  const availableClubs = useMemo(() => countryClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent && Number(club.division || 1) === Number(division)).sort((a, b) => a.name.localeCompare(b.name)), [countryClubs, continent, division]);
  const team = useMemo(() => players.filter((player) => game.squad.includes(player.id)), [game.squad]);
  const watchIds = useMemo(() => new Set((game.playerWatch || []).map((entry) => entry.playerId)), [game.playerWatch]);
  const filteredPlayers = useMemo(() => players.filter((player) => {
    const matchesText = `${player.name} ${player.club} ${player.country || ''}`.toLowerCase().includes(query.toLowerCase());
    const matchesPosition = !positionFilter || player.position === positionFilter;
    return matchesText && matchesPosition;
  }).slice(0, 100), [query, positionFilter]);
  const watchedPlayers = useMemo(() => (game.playerWatch || []).map((entry) => ({
    ...entry,
    player: players.find((player) => player.id === entry.playerId),
  })).filter((entry) => entry.player), [game.playerWatch]);

  const transferWindow = useMemo(() => {
    // Calendar dates are a reference window for the included 2024/25 data.
    const start = new Date('2024-08-01T00:00:00Z');
    const end = new Date('2024-09-30T23:59:59Z');
    const current = new Date(now);
    if (current < start) {
      const diff = start.getTime() - current.getTime();
      return { open: false, status: 'Belum dibuka', countdown: `${Math.floor(diff / 86400000)} hari lagi`, deadline: '1 Agu 2024' };
    }
    if (current > end) return { open: false, status: 'Tutup', countdown: 'Periode selesai', deadline: '30 Sep 2024' };
    const diff = end.getTime() - current.getTime();
    return { open: true, status: 'Buka', countdown: `${Math.floor(diff / 86400000)} hari tersisa`, deadline: '30 Sep 2024' };
  }, [now]);

  function notify(message) {
    setToast(message);
    window.clearTimeout(notify.timeout);
    notify.timeout = window.setTimeout(() => setToast(''), 2800);
  }

  function chooseClub(chosen) {
    const squad = players.filter((player) => player.club === chosen.name).map((player) => player.id);
    setGame((previous) => ({ ...previous, club: chosen.name, squad, selectedContinent: continent, selectedCountry: country, selectedDivision: division }));
    notify(`Klub ${chosen.name} dipilih.`);
  }

  function addToWatch(player) {
    if (watchIds.has(player.id)) {
      notify(`${player.name} sudah ada di Player Watch.`);
      return;
    }
    const price = Number(player.marketValueEUR) || 0;
    setGame((previous) => ({
      ...previous,
      playerWatch: [...(previous.playerWatch || []), {
        playerId: player.id,
        targetPrice: price ? Math.round(price * 0.9) : 0,
        note: '',
        addedAt: new Date().toISOString(),
        lastObservedValue: price,
      }],
    }));
    notify(`${player.name} ditambahkan ke Player Watch.`);
  }

  function removeFromWatch(playerId) {
    setGame((previous) => ({ ...previous, playerWatch: (previous.playerWatch || []).filter((entry) => entry.playerId !== playerId) }));
    notify('Pemain dihapus dari pantauan.');
  }

  function updateWatch(playerId, changes) {
    setGame((previous) => ({
      ...previous,
      playerWatch: (previous.playerWatch || []).map((entry) => entry.playerId === playerId ? { ...entry, ...changes } : entry),
    }));
  }

  function buyPlayer(player) {
    if (!transferWindow.open) { notify('Transfer window sedang tutup.'); return; }
    const price = Number(player.marketValueEUR) || 500000;
    if (game.squad.includes(player.id)) { notify('Pemain sudah berada di skuad.'); return; }
    if (price > game.cash) { notify('Kas klub tidak cukup.'); return; }
    setGame((previous) => ({
      ...previous,
      cash: previous.cash - price,
      squad: [...previous.squad, player.id],
      transferHistory: [{ type: 'Masuk', playerId: player.id, playerName: player.name, fee: price, week: previous.week }, ...(previous.transferHistory || [])],
    }));
    notify(`${player.name} berhasil didatangkan.`);
  }

  function sellPlayer(player) {
    const price = Math.round((Number(player.marketValueEUR) || 500000) * 0.8);
    setGame((previous) => ({
      ...previous,
      cash: previous.cash + price,
      squad: previous.squad.filter((id) => id !== player.id),
      transferHistory: [{ type: 'Keluar', playerId: player.id, playerName: player.name, fee: price, week: previous.week }, ...(previous.transferHistory || [])],
    }));
    notify(`${player.name} dilepas dengan nilai ${euro(price)}.`);
  }

  function playMatch() {
    const opponents = allClubs.filter((club) => club.league === currentClub?.league && club.name !== currentClub?.name);
    if (!opponents.length) { notify('Belum ada lawan liga di dataset.'); return; }
    const rival = opponents[Math.floor(Math.random() * opponents.length)];
    const ownRating = team.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(team.length, 1) || 60;
    const rivalPlayers = players.filter((player) => player.club === rival.name);
    const rivalRating = rivalPlayers.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(rivalPlayers.length, 1) || 60;
    const ownGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (ownRating - rivalRating) / 18)));
    const rivalGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (rivalRating - ownRating) / 18)));
    const won = ownGoals > rivalGoals;
    const draw = ownGoals === rivalGoals;
    setGame((previous) => ({ ...previous, week: previous.week + 1, played: previous.played + 1, wins: previous.wins + (won ? 1 : 0), draws: previous.draws + (draw ? 1 : 0), losses: previous.losses + (!won && !draw ? 1 : 0), points: previous.points + (won ? 3 : draw ? 1 : 0), reputation: Math.min(100, previous.reputation + (won ? 3 : draw ? 1 : 0)) }));
    setMatch({ ownGoals, rivalGoals, rival: rival.name });
  }

  function resetSave() {
    const fresh = { ...INITIAL, club: currentClub?.name || INITIAL.club, squad: players.filter((player) => player.club === currentClub?.name).map((player) => player.id) };
    setGame(fresh);
    notify('Save permainan direset.');
  }

  const tabNames = ['Pilih Klub', 'Jadwal', 'Player Watch', 'Piala Dunia Antarklub', 'Data'];
  const positions = [...new Set(players.map((player) => player.position).filter(Boolean))].sort();

  return (
    <div className="min-h-screen bg-[#090c0a] text-white">
      <header className="sticky top-0 z-10 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#090c0a]/95 px-4 py-4 backdrop-blur">
        <div><p className="text-xs uppercase tracking-[.2em] text-lime-300">Football Club Manager</p><h1 className="text-xl font-bold">{currentClub?.name || 'Pilih klub'}</h1></div>
        <div className="flex flex-wrap gap-2">{tabNames.map((tab) => <button key={tab} onClick={() => setPage(tab)} className={`rounded-full px-3 py-1.5 text-sm transition ${page === tab ? 'bg-lime-300 text-[#0a120d]' : 'bg-white/5 text-white/75 hover:bg-white/10'}`}>{tab}{tab === 'Player Watch' && watchIds.size > 0 ? ` (${watchIds.size})` : ''}</button>)}</div>
      </header>

      <main className="mx-auto max-w-7xl space-y-5 px-4 py-6">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-lime-300/20 bg-lime-300/5 p-4 text-sm">
          <div><div className="text-[10px] uppercase tracking-[.2em] text-lime-200/80">Transfer Window</div><div className="mt-1 flex items-center gap-3"><span className={`rounded-full px-2.5 py-1 text-xs font-semibold ${transferWindow.open ? 'bg-lime-300 text-[#07130b]' : 'bg-amber-300 text-[#231805]'}`}>{transferWindow.status}</span><span className="text-white/70">{transferWindow.countdown}</span></div></div>
          <div className="text-xs text-white/55">Deadline: {transferWindow.deadline}</div>
        </div>

        {page === 'Pilih Klub' && <section className={cardClass}>
          <h2 className="text-2xl font-bold">Pilih klub</h2><p className="mt-1 text-sm text-white/55">Pilih benua → negara → divisi → klub. Data klub yang tidak tersedia tidak dibuat-buat.</p>
          <div className="mt-5 grid gap-3 sm:grid-cols-3">
            <label className="text-sm text-white/75">1. Benua<select className={inputClass} value={continent} onChange={(event) => { const value = event.target.value; setContinent(value); const next = [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === value).map((club) => club.country))].sort(); setCountry(next[0] || ''); setDivision(1); }}>{continentsInData.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-sm text-white/75">2. Negara<select className={inputClass} value={country} onChange={(event) => { setCountry(event.target.value); setDivision(1); }}>{countries.map((item) => <option key={item} value={item}>{item}</option>)}</select></label>
            <label className="text-sm text-white/75">3. Divisi (maksimal 4)<select className={inputClass} value={division} onChange={(event) => setDivision(Number(event.target.value))}>{divisions.map((tier) => <option key={tier} value={tier}>Divisi {tier}</option>)}</select></label>
          </div>
          <h3 className="mt-5 text-lg font-semibold">4. Pilih klub · {availableClubs.length} tersedia</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{availableClubs.map((club) => <button key={club.id || club.name} onClick={() => chooseClub(club)} className={`rounded-xl border p-4 text-left ${club.name === game.club ? 'border-lime-300/50 bg-lime-300/10' : 'border-white/10 bg-[#0b100c] hover:border-lime-300/30'}`}><span className="block font-semibold">{club.name}</span><span className="mt-1 block text-xs text-white/55">{club.league} · {club.country}</span></button>)}</div>
          {!availableClubs.length && <p className="mt-3 text-sm text-amber-100">Belum ada klub di divisi ini dalam dataset.</p>}
        </section>}

        {page === 'Jadwal' && <section className={cardClass}>
          <div className="mb-4 flex flex-wrap items-center justify-between gap-2"><h2 className="text-2xl font-bold">Jadwal & musim</h2><button onClick={resetSave} className="rounded-xl border border-white/10 bg-white/5 px-3 py-2 text-sm">Reset save</button></div>
          <div className="grid gap-3 sm:grid-cols-4">{[['Kas klub', euro(game.cash)], ['Poin', game.points], ['Menang', game.wins], ['Reputasi', game.reputation]].map(([label, value]) => <div key={label} className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="text-xs text-white/45">{label}</div><div className="mt-2 text-xl font-bold">{value}</div></div>)}</div>
          <div className="mt-4 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b100c] p-4"><div><div className="text-xs uppercase tracking-widest text-white/45">Pekan {game.week}</div><div className="mt-1 font-semibold">{currentClub?.league || 'Liga belum tersedia'}</div></div><button onClick={playMatch} className="rounded-xl bg-lime-300 px-4 py-2 font-semibold text-black">Mainkan pertandingan</button></div>
          {match && <div className="mt-3 rounded-xl border border-lime-300/20 bg-lime-300/5 p-4">Hasil: {currentClub?.name} {match.ownGoals}–{match.rivalGoals} {match.rival}</div>}
          <div className="mt-5"><h3 className="mb-3 text-lg font-semibold">Skuad · {team.length} pemain</h3><div className="space-y-2">{team.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b100c] p-3"><div><div className="font-medium">{player.name}</div><div className="text-xs text-white/45">{player.position} · OVR {player.ovr ?? '—'}</div></div><button onClick={() => sellPlayer(player)} className="rounded-lg border border-rose-300/20 px-3 py-1.5 text-xs text-rose-200">Jual · {euro((Number(player.marketValueEUR) || 500000) * 0.8)}</button></div>)}</div></div>
          <div className="mt-6 border-t border-white/10 pt-5"><div className="mb-3 flex flex-wrap items-end justify-between gap-2"><div><h3 className="text-lg font-semibold">Bursa transfer</h3><p className="text-xs text-white/45">Pembelian hanya aktif saat transfer window buka.</p></div><span className={`rounded-full px-3 py-1 text-xs ${transferWindow.open ? 'bg-lime-300/15 text-lime-200' : 'bg-amber-300/15 text-amber-100'}`}>{transferWindow.status}</span></div>{transferWindow.open ? <div className="space-y-2">{players.filter((player) => player.club !== game.club).slice(0, 8).map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-[#0b100c] p-3"><div><div className="font-medium">{player.name}</div><div className="text-xs text-white/45">{player.club} · {player.position} · OVR {player.ovr ?? '—'}</div></div><div className="flex items-center gap-2"><span className="text-xs text-lime-200">{euro(player.marketValueEUR)}</span><button onClick={() => buyPlayer(player)} className="rounded-lg bg-sky-400 px-3 py-1.5 text-xs font-semibold text-slate-950">Tawar</button></div></div>)}</div> : <p className="rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-sm text-amber-100">Transfer window tutup. Pemain yang dipantau tetap tersimpan; pembelian akan tersedia saat window terbuka.</p>}</div>
          {(game.transferHistory || []).length > 0 && <div className="mt-6 border-t border-white/10 pt-5"><h3 className="mb-3 text-lg font-semibold">Riwayat transfer</h3><div className="space-y-2">{game.transferHistory.map((item, index) => <div key={`${item.playerId}-${item.week}-${index}`} className="flex justify-between rounded-xl border border-white/10 bg-[#0b100c] p-3 text-sm"><span>{item.type}: {item.playerName} · Pekan {item.week}</span><span>{euro(item.fee)}</span></div>)}</div></div>}
        </section>}

        {page === 'Player Watch' && <section className={cardClass}>
          <div className="flex flex-wrap items-start justify-between gap-3"><div><div className="text-xs uppercase tracking-[.2em] text-lime-200/70">Scouting desk</div><h2 className="mt-1 text-2xl font-bold">Player Watch</h2><p className="mt-1 text-sm text-white/55">Pantau pemain, catat target harga, dan cek perubahan harga saat data pemain diperbarui.</p></div><div className="rounded-xl border border-lime-300/20 bg-lime-300/5 px-4 py-3 text-right"><div className="text-xs text-white/45">Pemain dipantau</div><div className="text-2xl font-bold text-lime-200">{watchedPlayers.length}</div></div></div>
          <div className="mt-5 grid gap-3 md:grid-cols-[1fr_200px]"><label className="text-xs text-white/55">Cari pemain / klub / negara<input className={`${inputClass} mt-1`} value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Contoh: pemain, klub, atau negara" /></label><label className="text-xs text-white/55">Posisi<select className={`${inputClass} mt-1`} value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}><option value="">Semua posisi</option>{positions.map((position) => <option key={position} value={position}>{position}</option>)}</select></label></div>
          <div className="mt-5 grid gap-5 lg:grid-cols-2">
            <div className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Database pemain</h3><span className="text-xs text-white/40">Maks. 60 hasil</span></div><div className="max-h-[560px] space-y-2 overflow-auto pr-1">{filteredPlayers.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/[.07] bg-white/[.02] p-3"><div className="min-w-0"><div className="truncate font-medium">{player.name}</div><div className="truncate text-xs text-white/45">{player.club} · {player.position} · {player.country || 'Negara tidak tersedia'}</div><div className="mt-1 text-xs text-lime-200/80">OVR {player.ovr ?? '—'} · Nilai {euro(player.marketValueEUR)}</div></div><button onClick={() => addToWatch(player)} disabled={watchIds.has(player.id)} className="shrink-0 rounded-lg border border-lime-300/20 px-3 py-1.5 text-xs text-lime-100 disabled:cursor-not-allowed disabled:opacity-40">{watchIds.has(player.id) ? 'Dipantau' : '+ Pantau'}</button></div>)}{!filteredPlayers.length && <p className="py-5 text-center text-sm text-white/45">Pemain tidak ditemukan.</p>}</div></div>
            <div className="rounded-xl border border-white/10 bg-[#0b100c] p-4"><div className="mb-3 flex items-center justify-between"><h3 className="font-semibold">Daftar pantauan</h3><span className="text-xs text-white/40">Tersimpan otomatis</span></div>{watchedPlayers.length ? <div className="max-h-[560px] space-y-3 overflow-auto pr-1">{watchedPlayers.map(({ player, targetPrice, note, lastObservedValue }) => { const value = Number(player.marketValueEUR) || 0; const targetReached = Number(targetPrice) > 0 && value > 0 && value <= Number(targetPrice); const previousValue = Number(lastObservedValue) || value; const changed = value - previousValue; return <article key={player.id} className="rounded-xl border border-white/[.08] bg-white/[.025] p-3"><div className="flex items-start justify-between gap-2"><div><h4 className="font-semibold">{player.name}</h4><p className="text-xs text-white/45">{player.club} · {player.position} · {player.country || 'Negara tidak tersedia'}</p></div><button onClick={() => removeFromWatch(player.id)} className="rounded-lg px-2 py-1 text-xs text-rose-200 hover:bg-rose-300/10">Hapus</button></div><div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-lg bg-[#0b100c] p-2"><div className="text-[10px] uppercase text-white/40">Rating / OVR</div><div className="mt-1 font-semibold">{player.ovr ?? '—'}{player.potential ? <span className="ml-2 text-xs text-white/40">Pot {player.potential}</span> : null}</div></div><div className="rounded-lg bg-[#0b100c] p-2"><div className="text-[10px] uppercase text-white/40">Nilai pasar</div><div className="mt-1 font-semibold">{euro(value)}</div></div></div><div className="mt-2 flex items-center justify-between text-xs"><span className="text-white/45">Pantauan harga</span><span className={targetReached ? 'font-semibold text-lime-200' : changed < 0 ? 'text-rose-200' : changed > 0 ? 'text-amber-100' : 'text-white/50'}>{targetReached ? 'Target tercapai · pertimbangkan tawaran' : changed < 0 ? `Turun ${euro(Math.abs(changed))} sejak ditambahkan` : changed > 0 ? `Naik ${euro(changed)} sejak ditambahkan` : 'Belum ada perubahan data'}</span></div><label className="mt-3 block text-xs text-white/50">Target harga (EUR)<input type="number" min="0" className={`${inputClass} mt-1`} value={targetPrice ?? ''} onChange={(event) => updateWatch(player.id, { targetPrice: Number(event.target.value) || 0 })} placeholder="0 = tanpa target" /></label><label className="mt-2 block text-xs text-white/50">Catatan scouting<textarea className={`${inputClass} mt-1 resize-y`} rows="2" value={note || ''} onChange={(event) => updateWatch(player.id, { note: event.target.value })} placeholder="Contoh: cocok untuk posisi gelandang bertahan" /></label><div className="mt-3 flex items-center justify-between gap-2"><span className="text-[10px] text-white/35">Nilai dibandingkan dengan snapshot saat ditambahkan.</span>{game.squad.includes(player.id) ? <span className="rounded-full bg-lime-300/10 px-2 py-1 text-[10px] text-lime-200">Pemain skuad</span> : <button disabled={!transferWindow.open} onClick={() => buyPlayer(player)} className="rounded-lg bg-lime-300 px-3 py-1.5 text-xs font-semibold text-[#07130b] disabled:cursor-not-allowed disabled:opacity-40">{transferWindow.open ? 'Beli pemain' : 'Window tutup'}</button>}</div></article>; })}</div> : <div className="rounded-xl border border-dashed border-white/15 p-8 text-center"><div className="text-lg font-semibold">Belum ada pemain dipantau</div><p className="mt-1 text-sm text-white/45">Cari pemain di panel kiri, lalu tekan “+ Pantau” untuk menambahkannya.</p></div>}</div>
          </div>
          <p className="mt-4 text-xs text-white/35">Harga dan rating mengikuti snapshot database game; fitur ini tidak mengambil pembaruan live dari sumber eksternal.</p>
        </section>}

        {page === 'Piala Dunia Antarklub' && <section className={cardClass}><h2 className="text-2xl font-bold">Piala Dunia Antarklub</h2><p className="mt-2 text-sm text-white/55">Peserta historis terdata: {fifaClubWorldCupMetadata.participantCount}. Edisi: {fifaClubWorldCupEditions.join(', ')}.</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{fifaClubWorldCupClubs.map((club) => <div key={`${club.id}-${club.name}`} className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="font-semibold">{club.name}</div><div className="text-xs text-white/50">{club.country} · {club.league}</div><div className="mt-1 text-xs text-lime-200">Edisi: {club.fifaClubWorldCupEditions.join(', ')}</div></div>)}</div><p className="mt-4 text-xs text-white/40">Daftar historis terkurasi, bukan sensus seluruh klub dunia.</p></section>}

        {page === 'Data' && <section className={cardClass}><h2 className="text-2xl font-bold">Status database</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(dataStatus).map(([key, value]) => <div key={key} className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">{key}</div><div className="mt-2 break-words text-sm text-white/75">{String(value)}</div></div>)}<div className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Pemain</div><div className="mt-2 text-sm text-white/75">{players.length}</div></div><div className="rounded-xl border border-white/10 bg-[#0b100c] p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">Klub / liga</div><div className="mt-2 text-sm text-white/75">{clubs.length} / {leagues.length}</div></div></div><div className="mt-5"><h3 className="mb-2 font-semibold">Riwayat transfer klub</h3>{(game.transferHistory || []).length ? <div className="space-y-2">{game.transferHistory.map((item, index) => <div key={`${item.playerId}-${index}`} className="flex justify-between rounded-xl border border-white/10 bg-[#0b100c] p-3 text-sm"><span>{item.type}: {item.playerName} · Pekan {item.week}</span><span>{euro(item.fee)}</span></div>)}</div> : <p className="text-sm text-white/45">Belum ada transaksi.</p>}</div></section>}
      </main>

      {match && <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4"><div className={`${cardClass} w-full max-w-md text-center`}><div className="text-xs uppercase tracking-widest text-lime-300">Hasil pertandingan</div><h2 className="mt-3 text-2xl font-bold">{currentClub?.name} {match.ownGoals}–{match.rivalGoals} {match.rival}</h2><button className="mt-5 rounded-xl bg-lime-300 px-4 py-2 font-semibold text-black" onClick={() => setMatch(null)}>Tutup</button></div></div>}
      {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-lime-300/20 bg-[#111713] px-4 py-3 text-sm shadow-xl">{toast}</div>}
      <footer className="mx-auto max-w-7xl px-4 pb-8 text-[10px] text-white/25">Data musim 2024/25 · Save tersimpan otomatis di browser.</footer>
    </div>
  );
}

export default App;

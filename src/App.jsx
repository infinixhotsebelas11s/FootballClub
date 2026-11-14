import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players, leagues, dataStatus } from '../database.js';
import { fifaClubWorldCupClubs, fifaClubWorldCupEditions, fifaClubWorldCupMetadata } from '../fifa-club-world-cup.js';

const CONTINENTS = ['Asia', 'Afrika', 'Eropa', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];
const CONTINENT_BY_COUNTRY = {
  Indonesia: 'Asia', Japan: 'Asia', 'Saudi Arabia': 'Asia', 'South Korea': 'Asia', Qatar: 'Asia', 'United Arab Emirates': 'Asia', China: 'Asia', Thailand: 'Asia', Vietnam: 'Asia', Malaysia: 'Asia', Singapore: 'Asia', Philippines: 'Asia', Iran: 'Asia', Iraq: 'Asia',
  Australia: 'Oseania', 'New Zealand': 'Oseania', 'New Caledonia': 'Oseania', 'French Polynesia': 'Oseania',
  England: 'Eropa', Germany: 'Eropa', Spain: 'Eropa', France: 'Eropa', Italy: 'Eropa', Portugal: 'Eropa', Netherlands: 'Eropa', Belgium: 'Eropa', Scotland: 'Eropa', Ireland: 'Eropa', Austria: 'Eropa', Greece: 'Eropa', Turkey: 'Eropa', Russia: 'Eropa', Switzerland: 'Eropa', Croatia: 'Eropa', Serbia: 'Eropa', Poland: 'Eropa', Norway: 'Eropa', Sweden: 'Eropa', Denmark: 'Eropa', Ukraine: 'Eropa', Wales: 'Eropa',
  Argentina: 'Amerika Selatan', Brazil: 'Amerika Selatan', Colombia: 'Amerika Selatan', Chile: 'Amerika Selatan', Uruguay: 'Amerika Selatan', Peru: 'Amerika Selatan', Paraguay: 'Amerika Selatan', Ecuador: 'Amerika Selatan', Mexico: 'Amerika Utara', 'United States': 'Amerika Utara', Canada: 'Amerika Utara', 'Costa Rica': 'Amerika Utara', Honduras: 'Amerika Utara', Panama: 'Amerika Utara', Jamaica: 'Amerika Utara',
  'South Africa': 'Afrika', Morocco: 'Afrika', Egypt: 'Afrika', Tunisia: 'Afrika', 'DR Congo': 'Afrika', Nigeria: 'Afrika', Senegal: 'Afrika', Ghana: 'Afrika', 'Ivory Coast': 'Afrika', Algeria: 'Afrika', Cameroon: 'Afrika', Mali: 'Afrika', Kenya: 'Afrika', Uganda: 'Afrika',
};
const INITIAL = { club: 'Persib Bandung', role: 'Manajer', cash: 2000000, reputation: 42, week: 1, played: 0, wins: 0, draws: 0, losses: 0, points: 0, squad: [], selectedContinent: 'Asia', selectedCountry: 'Indonesia', selectedDivision: 1, playerWatch: [], transferHistory: [], clubChosen: false };
const panel = 'rounded-2xl border border-white/10 bg-[#101721]/90 p-5 shadow-xl';
const field = 'mt-1 w-full rounded-xl border border-white/10 bg-[#080d14] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60';
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const euro = (value) => new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value) || 0);

function readSave() {
  try {
    const raw = localStorage.getItem('football-club-manager-save');
    if (!raw) return { ...INITIAL };
    const saved = JSON.parse(raw);
    // Existing saves already had a selected club; migrate them into the main hub.
    return { ...INITIAL, ...saved, clubChosen: saved.clubChosen ?? Boolean(saved.club) };
  } catch { return { ...INITIAL }; }
}

export default function App() {
  const [game, setGame] = useState(readSave);
  const [page, setPage] = useState(() => readSave().clubChosen ? 'Ringkasan' : 'Pilih Klub');
  const [continent, setContinent] = useState(game.selectedContinent || 'Asia');
  const [country, setCountry] = useState(game.selectedCountry || 'Indonesia');
  const [division, setDivision] = useState(Number(game.selectedDivision) || 1);
  const [search, setSearch] = useState('');
  const [positionFilter, setPositionFilter] = useState('');
  const [toast, setToast] = useState('');
  const [match, setMatch] = useState(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => { try { localStorage.setItem('football-club-manager-save', JSON.stringify(game)); } catch { /* local save unavailable */ } }, [game]);
  useEffect(() => { const timer = window.setInterval(() => setNow(Date.now()), 1000); return () => window.clearInterval(timer); }, []);

  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);
  const currentClub = allClubs.find((club) => club.name === game.club) || allClubs[0];
  const continentsInData = CONTINENTS.filter((item) => allClubs.some((club) => CONTINENT_BY_COUNTRY[club.country] === item));
  const countries = [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent).map((club) => club.country))].sort();
  const countryClubs = allClubs.filter((club) => club.country === country);
  const divisions = [...new Set(countryClubs.map((club) => Number(club.division || 1)).filter((tier) => tier >= 1 && tier <= 4))].sort((a, b) => a - b);
  const availableClubs = countryClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === continent && Number(club.division || 1) === Number(division)).sort((a, b) => a.name.localeCompare(b.name));
  const team = players.filter((player) => game.squad.includes(player.id));
  const watchIds = new Set((game.playerWatch || []).map((item) => item.playerId));
  const positions = [...new Set(players.map((player) => player.position).filter(Boolean))].sort();
  const filteredPlayers = players.filter((player) => `${player.name} ${player.club} ${player.country || ''}`.toLowerCase().includes(search.toLowerCase()) && (!positionFilter || player.position === positionFilter)).slice(0, 60);
  const watchedPlayers = (game.playerWatch || []).map((entry) => ({ ...entry, player: players.find((player) => player.id === entry.playerId) })).filter((entry) => entry.player);
  const transferWindow = useMemo(() => {
    const start = new Date('2024-08-01T00:00:00Z'); const end = new Date('2024-09-30T23:59:59Z'); const current = new Date(now);
    if (current < start) return { open: false, status: 'Belum dibuka', countdown: `${Math.ceil((start - current) / 86400000)} hari lagi`, deadline: '1 Agu 2024' };
    if (current > end) return { open: false, status: 'Tutup', countdown: 'Periode selesai', deadline: '30 Sep 2024' };
    return { open: true, status: 'Buka', countdown: `${Math.floor((end - current) / 86400000)} hari tersisa`, deadline: '30 Sep 2024' };
  }, [now]);

  function notify(message) { setToast(message); window.clearTimeout(notify.timeout); notify.timeout = window.setTimeout(() => setToast(''), 2600); }
  function chooseClub(chosen) {
    const squad = players.filter((player) => player.club === chosen.name).map((player) => player.id);
    setGame((previous) => ({ ...previous, club: chosen.name, squad, clubChosen: true, selectedContinent: continent, selectedCountry: country, selectedDivision: Number(division) }));
    setPage('Ringkasan');
    notify(`${chosen.name} dipilih. Selamat datang di hub klub!`);
  }
  function addToWatch(player) {
    if (watchIds.has(player.id)) return notify('Pemain sudah dipantau.');
    const value = Number(player.marketValueEUR) || 0;
    setGame((previous) => ({ ...previous, playerWatch: [...(previous.playerWatch || []), { playerId: player.id, targetPrice: value ? Math.round(value * .9) : 0, note: '', lastObservedValue: value }] }));
    notify(`${player.name} ditambahkan ke Player Watch.`);
  }
  function removeFromWatch(playerId) { setGame((previous) => ({ ...previous, playerWatch: (previous.playerWatch || []).filter((entry) => entry.playerId !== playerId) })); }
  function editWatch(playerId, changes) { setGame((previous) => ({ ...previous, playerWatch: (previous.playerWatch || []).map((entry) => entry.playerId === playerId ? { ...entry, ...changes } : entry) })); }
  function buyPlayer(player) {
    if (!transferWindow.open) return notify('Transfer window sedang tutup.');
    const fee = Number(player.marketValueEUR) || 500000;
    if (game.squad.includes(player.id)) return notify('Pemain sudah berada di skuad.');
    if (fee > game.cash) return notify('Kas klub tidak cukup.');
    setGame((previous) => ({ ...previous, cash: previous.cash - fee, squad: [...previous.squad, player.id], transferHistory: [{ type: 'Masuk', playerId: player.id, playerName: player.name, fee, week: previous.week }, ...(previous.transferHistory || [])] }));
    notify(`${player.name} berhasil direkrut.`);
  }
  function sellPlayer(player) {
    const fee = Math.round((Number(player.marketValueEUR) || 500000) * .8);
    setGame((previous) => ({ ...previous, cash: previous.cash + fee, squad: previous.squad.filter((id) => id !== player.id), transferHistory: [{ type: 'Keluar', playerId: player.id, playerName: player.name, fee, week: previous.week }, ...(previous.transferHistory || [])] }));
    notify(`${player.name} dilepas seharga ${euro(fee)}.`);
  }
  function playMatch() {
    const opponents = allClubs.filter((item) => item.league === currentClub?.league && item.name !== currentClub?.name);
    if (!opponents.length) return notify('Belum ada lawan liga di dataset.');
    const rival = opponents[Math.floor(Math.random() * opponents.length)];
    const own = team.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(team.length, 1) || 60;
    const rivalPlayers = players.filter((player) => player.club === rival.name);
    const other = rivalPlayers.reduce((sum, player) => sum + (player.ovr || 60), 0) / Math.max(rivalPlayers.length, 1) || 60;
    const ownGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (own - other) / 18)));
    const rivalGoals = Math.max(0, Math.min(5, Math.round(Math.random() * 2 + (other - own) / 18)));
    const won = ownGoals > rivalGoals; const draw = ownGoals === rivalGoals;
    setGame((previous) => ({ ...previous, week: previous.week + 1, played: previous.played + 1, wins: previous.wins + Number(won), draws: previous.draws + Number(draw), losses: previous.losses + Number(!won && !draw), points: previous.points + (won ? 3 : draw ? 1 : 0), reputation: Math.min(100, previous.reputation + (won ? 3 : draw ? 1 : 0)) }));
    setMatch({ ownGoals, rivalGoals, rival: rival.name });
  }
  function resetSave() { setGame({ ...INITIAL, club: currentClub?.name || INITIAL.club, clubChosen: true, squad: players.filter((player) => player.club === currentClub?.name).map((player) => player.id) }); notify('Save direset.'); }

  const nav = ['Ringkasan', 'Jadwal', 'Player Watch', 'Piala Dunia Antarklub', 'Data'];
  return <div className="min-h-screen bg-[#080c12] text-white">
    <header className="sticky top-0 z-20 flex flex-wrap items-center justify-between gap-3 border-b border-white/10 bg-[#080c12]/90 px-4 py-4 backdrop-blur-xl sm:px-7">
      <div><p className="text-[10px] font-bold uppercase tracking-[.24em] text-lime-300">Club Career · Manager Hub</p><h1 className="mt-1 text-xl font-black tracking-tight sm:text-2xl">{currentClub?.name || 'Pilih klub'}</h1></div>
      <div className="flex flex-wrap items-center gap-2"><span className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/70">Kas <b className="ml-1 text-white">{euro(game.cash)}</b></span><span className="rounded-lg border border-white/10 bg-white/[.04] px-3 py-2 text-xs text-white/70">REP <b className="ml-1 text-lime-200">{game.reputation}</b></span>{game.clubChosen && <button onClick={() => setPage('Pilih Klub')} className="rounded-lg border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-xs font-bold text-lime-100 hover:bg-lime-300/20">Ganti klub</button>}</div>
    </header>
    {game.clubChosen && <nav className="sticky top-[73px] z-10 flex gap-2 overflow-x-auto border-b border-white/10 bg-[#0b1018]/95 px-4 py-3 backdrop-blur sm:px-7">{nav.map((tab) => <button key={tab} onClick={() => setPage(tab)} className={`shrink-0 rounded-lg px-3 py-2 text-xs font-bold transition sm:text-sm ${page === tab ? 'bg-lime-300 text-[#0b1012]' : 'border border-white/10 bg-white/[.03] text-white/65 hover:text-white'}`}>{tab}{tab === 'Player Watch' && watchIds.size ? ` (${watchIds.size})` : ''}</button>)}</nav>}
    <main className="mx-auto max-w-7xl space-y-5 px-4 py-6 sm:px-7">
      {game.clubChosen && <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-lime-300/20 bg-lime-300/[.045] px-4 py-3 text-sm"><div><span className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200/75">Transfer Window</span><div className="mt-1 flex items-center gap-2"><span className={`rounded-full px-2 py-1 text-[10px] font-bold ${transferWindow.open ? 'bg-lime-300 text-black' : 'bg-amber-300 text-black'}`}>{transferWindow.status}</span><span className="text-xs text-white/60">{transferWindow.countdown}</span></div></div><span className="text-xs text-white/45">Deadline · {transferWindow.deadline}</span></div>}

      {page === 'Pilih Klub' && <section className={panel}><div className="text-[10px] font-bold uppercase tracking-[.24em] text-lime-200">Karier baru</div><h2 className="mt-1 text-3xl font-black tracking-tight">Pilih klub</h2><p className="mt-2 text-sm text-white/55">Tentukan tantanganmu: benua, negara, divisi, lalu klub.</p><div className="mt-5 grid gap-3 sm:grid-cols-3"><label className="text-xs font-semibold text-white/65">1 · Benua<select className={field} value={continent} onChange={(event) => { const value = event.target.value; setContinent(value); const options = [...new Set(allClubs.filter((item) => CONTINENT_BY_COUNTRY[item.country] === value).map((item) => item.country))].sort(); setCountry(options[0] || ''); setDivision(1); }}>{continentsInData.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-semibold text-white/65">2 · Negara<select className={field} value={country} onChange={(event) => { setCountry(event.target.value); setDivision(1); }}>{countries.map((item) => <option key={item}>{item}</option>)}</select></label><label className="text-xs font-semibold text-white/65">3 · Divisi<select className={field} value={division} onChange={(event) => setDivision(Number(event.target.value))}>{divisions.map((tier) => <option key={tier} value={tier}>Divisi {tier}</option>)}</select></label></div><div className="mt-6 flex items-end justify-between gap-3"><div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-white/40">Langkah 4</div><h3 className="mt-1 text-xl font-bold">Pilih klub <span className="text-sm font-normal text-white/40">· {availableClubs.length} tersedia</span></h3></div></div><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{availableClubs.map((item) => <button key={item.id || item.name} onClick={() => chooseClub(item)} className="group rounded-xl border border-white/10 bg-white/[.025] p-4 text-left transition hover:border-lime-300/40 hover:bg-lime-300/[.06]"><span className="block font-bold group-hover:text-lime-100">{item.name}</span><span className="mt-1 block text-xs text-white/50">{item.league} · {item.country}</span></button>)}</div>{!availableClubs.length && <p className="mt-3 rounded-xl border border-amber-300/15 bg-amber-300/5 p-3 text-sm text-amber-100">Belum ada klub di divisi ini.</p>}</section>}

      {page === 'Ringkasan' && <section className={panel}><div className="grid gap-6 lg:grid-cols-[1.4fr_.6fr]"><div className="flex min-h-[260px] flex-col justify-end rounded-xl border border-white/10 bg-[radial-gradient(ellipse_at_75%_5%,rgba(215,255,63,.18),transparent_35%),linear-gradient(125deg,#182332,#0a1018_70%)] p-6"><div className="text-[10px] font-bold uppercase tracking-[.25em] text-lime-200">Manager Career · Musim 2024/25</div><h2 className="mt-3 text-4xl font-black tracking-[-.05em] sm:text-5xl">{currentClub?.name}</h2><p className="mt-2 text-sm text-white/55">{currentClub?.league} · {currentClub?.country} · Pekan {game.week}</p><div className="mt-6 flex flex-wrap gap-2"><button onClick={playMatch} className="rounded-lg bg-lime-300 px-4 py-3 text-sm font-black text-[#10140a]">Mainkan pertandingan</button><button onClick={() => setPage('Jadwal')} className="rounded-lg border border-white/15 bg-white/5 px-4 py-3 text-sm font-bold">Kelola klub</button></div></div><div className="grid grid-cols-2 gap-3">{[['Poin', game.points], ['Menang', game.wins], ['Dimainkan', game.played], ['Reputasi', `${game.reputation}/100`]].map(([label, value]) => <div key={label} className="flex flex-col justify-between rounded-xl border border-white/10 bg-white/[.025] p-4"><span className="text-xs text-white/45">{label}</span><strong className="mt-4 text-2xl font-black">{value}</strong></div>)}</div></div>{match && <div className="mt-4 rounded-xl border border-lime-300/20 bg-lime-300/5 p-4 font-bold">Hasil laga: {currentClub?.name} {match.ownGoals}–{match.rivalGoals} {match.rival}</div>}<div className="mt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 pt-4"><div><div className="text-xs font-bold uppercase tracking-widest text-white/40">Skuad utama</div><div className="mt-1 text-sm text-white/65">{team.length} pemain dalam database untuk klub ini</div></div><button onClick={() => setPage('Jadwal')} className="rounded-lg border border-white/10 px-3 py-2 text-xs font-bold">Lihat skuad →</button></div></section>}

      {page === 'Jadwal' && <section className={panel}><div className="flex flex-wrap items-center justify-between gap-2"><div><div className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Squad & market</div><h2 className="mt-1 text-2xl font-black">Skuad · {team.length}</h2></div><button onClick={resetSave} className="rounded-lg border border-white/10 px-3 py-2 text-xs">Reset save</button></div><div className="mt-4 space-y-2">{team.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"><div><div className="font-bold">{player.name}</div><div className="text-xs text-white/45">{player.position} · OVR {player.ovr ?? '—'}</div></div><button onClick={() => sellPlayer(player)} className="rounded-lg border border-rose-300/20 px-3 py-2 text-xs text-rose-100">Jual · {euro((Number(player.marketValueEUR) || 500000) * .8)}</button></div>)}{!team.length && <p className="text-sm text-white/50">Profil skuad tidak tersedia di sumber data.</p>}</div><div className="mt-6 border-t border-white/10 pt-5"><h3 className="font-bold">Bursa transfer {transferWindow.open ? '· Buka' : '· Tutup'}</h3>{transferWindow.open ? <div className="mt-3 space-y-2">{players.filter((player) => player.club !== game.club).slice(0, 12).map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"><div><b className="text-sm">{player.name}</b><div className="text-xs text-white/45">{player.club} · {player.position} · {euro(player.marketValueEUR)}</div></div><button onClick={() => buyPlayer(player)} className="rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-black">Rekrut</button></div>)}</div> : <p className="mt-2 text-sm text-white/50">Pembelian hanya tersedia selama transfer window dibuka.</p>}</div>{(game.transferHistory || []).length > 0 && <div className="mt-5 border-t border-white/10 pt-4"><h3 className="font-bold">Riwayat transfer</h3>{game.transferHistory.map((item, index) => <div key={`${item.playerId}-${index}`} className="mt-2 flex justify-between rounded-lg bg-white/[.025] p-3 text-xs"><span>{item.type} · {item.playerName}</span><span>{euro(item.fee)}</span></div>)}</div>}</section>}

      {page === 'Player Watch' && <section className={panel}><div className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Scouting desk</div><h2 className="mt-1 text-3xl font-black">Player Watch</h2><div className="mt-4 grid gap-3 sm:grid-cols-[1fr_200px]"><input className={field} value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Cari pemain, klub, negara"/><select className={field} value={positionFilter} onChange={(event) => setPositionFilter(event.target.value)}><option value="">Semua posisi</option>{positions.map((position) => <option key={position}>{position}</option>)}</select></div><div className="mt-4 grid gap-4 lg:grid-cols-2"><div className="max-h-[560px] space-y-2 overflow-auto">{filteredPlayers.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-xl border border-white/10 bg-white/[.025] p-3"><div><b className="text-sm">{player.name}</b><div className="text-xs text-white/45">{player.club} · {player.position} · OVR {player.ovr ?? '—'}</div></div><button disabled={watchIds.has(player.id)} onClick={() => addToWatch(player)} className="rounded-lg border border-lime-300/25 px-3 py-2 text-xs text-lime-100 disabled:opacity-40">{watchIds.has(player.id) ? 'Dipantau' : '+ Pantau'}</button></div>)}</div><div className="space-y-2">{watchedPlayers.map(({ player, targetPrice, note }) => <article key={player.id} className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="flex justify-between"><div><b>{player.name}</b><p className="text-xs text-white/45">{player.club} · {player.position} · {euro(player.marketValueEUR)}</p></div><button onClick={() => removeFromWatch(player.id)} className="text-xs text-rose-200">Hapus</button></div><label className="mt-3 block text-xs text-white/45">Target harga (EUR)<input className={field} type="number" value={targetPrice || ''} onChange={(event) => editWatch(player.id, { targetPrice: Number(event.target.value) || 0 })}/></label><label className="mt-2 block text-xs text-white/45">Catatan<textarea className={field} rows="2" value={note || ''} onChange={(event) => editWatch(player.id, { note: event.target.value })}/></label>{!game.squad.includes(player.id) && <button disabled={!transferWindow.open} onClick={() => buyPlayer(player)} className="mt-3 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-black disabled:opacity-40">{transferWindow.open ? 'Rekrut' : 'Window tutup'}</button>}</article>)}{!watchedPlayers.length && <p className="rounded-xl border border-dashed border-white/15 p-5 text-sm text-white/45">Belum ada pemain yang dipantau.</p>}</div></div></section>}

      {page === 'Piala Dunia Antarklub' && <section className={panel}><div className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Tournament archive</div><h2 className="mt-1 text-3xl font-black">Piala Dunia Antarklub</h2><p className="mt-2 text-sm text-white/50">{fifaClubWorldCupMetadata.participantCount} klub · Edisi {fifaClubWorldCupEditions.join(', ')}</p><div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">{fifaClubWorldCupClubs.map((club) => <div key={club.id} className="rounded-xl border border-white/10 bg-white/[.025] p-3"><b>{club.name}</b><div className="mt-1 text-xs text-white/45">{club.country} · {club.league}</div><div className="mt-1 text-xs text-lime-200">{club.fifaClubWorldCupEditions.join(', ')}</div></div>)}</div></section>}
      {page === 'Data' && <section className={panel}><div className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Database status</div><h2 className="mt-1 text-3xl font-black">Data permainan</h2><div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">{Object.entries(dataStatus).map(([key, value]) => <div key={key} className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="text-[10px] uppercase tracking-widest text-white/40">{key}</div><div className="mt-2 break-words text-sm text-white/75">{String(value)}</div></div>)}<div className="rounded-xl border border-white/10 bg-white/[.025] p-3"><div className="text-xs text-white/40">Cakupan</div><div className="mt-2 text-sm">{clubs.length} klub · {players.length} pemain · {leagues.length} liga</div></div></div></section>}
    </main>
    {match && <div className="fixed inset-0 z-30 grid place-items-center bg-black/70 p-4"><div className={`${panel} w-full max-w-md text-center`}><div className="text-xs uppercase tracking-widest text-lime-300">Hasil pertandingan</div><h2 className="mt-3 text-2xl font-black">{currentClub?.name} {match.ownGoals}–{match.rivalGoals} {match.rival}</h2><button className="mt-5 rounded-lg bg-lime-300 px-4 py-2 font-bold text-black" onClick={() => setMatch(null)}>Tutup</button></div></div>}
    {toast && <div role="status" className="fixed bottom-5 left-1/2 z-40 -translate-x-1/2 rounded-xl border border-lime-300/20 bg-[#111713] px-4 py-3 text-sm shadow-xl">{toast}</div>}
    <footer className="mx-auto max-w-7xl px-4 pb-8 text-[10px] text-white/25 sm:px-7">Data musim 2024/25 · save tersimpan otomatis di browser.</footer>
  </div>;
}

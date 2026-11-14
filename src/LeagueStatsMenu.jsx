import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players } from '../database.js';
import { fifaClubWorldCupClubs } from '../fifa-club-world-cup.js';

const SAVE_KEY = 'football-club-manager-save';
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
const readSave = () => { try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; } };
const hash = (value) => [...String(value)].reduce((result, char) => ((result * 31) + char.charCodeAt(0)) >>> 0, 7);
const clamp = (value, min, max) => Math.max(min, Math.min(max, value));

function getLeagueTables(save, clubsInLeague, leaguePlayers) {
  const roundsPlayed = Math.max(0, Number(save.played) || (Number(save.week) || 1) - 1);
  return clubsInLeague.map((club) => {
    if (club.name === save.club) {
      const played = roundsPlayed;
      const wins = clamp(Number(save.wins) || 0, 0, played);
      const draws = clamp(Number(save.draws) || 0, 0, played - wins);
      const losses = Math.max(0, played - wins - draws);
      return { club, played, wins, draws, losses, goalsFor: wins * 2 + draws, goalsAgainst: losses * 2 + draws, points: Number(save.points) || wins * 3 + draws };
    }
    const seed = hash(`${club.id || club.name}-${save.club}-${save.week}`);
    const played = roundsPlayed;
    const squad = leaguePlayers.filter((player) => player.club === club.name);
    const strength = squad.length ? squad.reduce((sum, player) => sum + (Number(player.ovr) || 60), 0) / squad.length : 60;
    const wins = played ? clamp(Math.round(played * (0.32 + (strength - 60) / 100) + ((seed % 5) - 2) / 2), 0, played) : 0;
    const draws = played ? clamp(Math.round(played * 0.24 + ((seed >>> 4) % 3) - 1), 0, played - wins) : 0;
    const losses = played - wins - draws;
    const goalsFor = wins * 2 + draws + (seed % (played + 1 || 1));
    const goalsAgainst = losses * 2 + draws + ((seed >>> 5) % (played + 1 || 1));
    return { club, played, wins, draws, losses, goalsFor, goalsAgainst, points: wins * 3 + draws };
  }).sort((a, b) => b.points - a.points || (b.goalsFor - b.goalsAgainst) - (a.goalsFor - a.goalsAgainst) || b.goalsFor - a.goalsFor || a.club.name.localeCompare(b.club.name));
}

function makePlayerLeaders(squad, save, stat) {
  const roundsPlayed = Math.max(0, Number(save.played) || (Number(save.week) || 1) - 1);
  return squad.map((player) => {
    const seed = hash(`${player.id}-${save.club}-${stat}`);
    const rating = Number(player.ovr) || 60;
    const rate = stat === 'goals' ? Math.max(0.035, (rating - 47) / 450) : Math.max(0.025, (rating - 45) / 570);
    const total = roundsPlayed ? Math.max(0, Math.round(roundsPlayed * rate + (seed % 4) - 1)) : 0;
    return { player, total };
  }).sort((a, b) => b.total - a.total || (Number(b.player.ovr) || 0) - (Number(a.player.ovr) || 0) || a.player.name.localeCompare(b.player.name)).slice(0, 20);
}

export default function LeagueStatsMenu() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('Klasemen');
  const [save, setSave] = useState(readSave);
  const [notice, setNotice] = useState('');
  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);

  useEffect(() => {
    const refresh = () => setSave(readSave());
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 1200);
    return () => { window.removeEventListener('storage', refresh); window.removeEventListener('focus', refresh); window.clearInterval(timer); };
  }, []);

  const club = allClubs.find((item) => item.name === save.club);
  const clubsInLeague = useMemo(() => club ? allClubs.filter((item) => item.league === club.league && item.country === club.country) : [], [allClubs, club]);
  const leaguePlayers = useMemo(() => {
    const names = new Set(clubsInLeague.map((item) => item.name));
    return players.filter((player) => names.has(player.club));
  }, [clubsInLeague]);
  const standings = useMemo(() => getLeagueTables(save, clubsInLeague, leaguePlayers), [save, clubsInLeague, leaguePlayers]);
  const scorerList = useMemo(() => makePlayerLeaders(leaguePlayers, save, 'goals'), [leaguePlayers, save]);
  const assistList = useMemo(() => makePlayerLeaders(leaguePlayers, save, 'assists'), [leaguePlayers, save]);
  const tabs = ['Klasemen', 'Top skor', 'Top assist'];

  function openMenu(nextTab = 'Klasemen') {
    setSave(readSave());
    setTab(nextTab);
    setOpen(true);
    setNotice('');
  }

  return <>
    <div className="fixed bottom-5 left-4 z-40 flex max-w-[calc(100vw-2rem)] gap-2 overflow-x-auto sm:left-7">
      {tabs.map((item) => <button key={item} type="button" onClick={() => openMenu(item)} className="shrink-0 rounded-full border border-cyan-200/25 bg-[#111b24] px-3 py-2.5 text-xs font-bold text-cyan-100 shadow-lg shadow-black/30 transition hover:bg-cyan-200 hover:text-[#081114]">{item}</button>)}
    </div>
    {open && <div className="fixed inset-0 z-[80] grid place-items-center bg-black/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Klasemen dan statistik liga" className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] text-white shadow-2xl shadow-black/60">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-cyan-300/[.12] via-[#111a23] to-lime-300/[.07] p-5 sm:p-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-200">Pusat kompetisi</p><h2 className="mt-1 text-2xl font-black">{club?.league || 'Statistik liga'}</h2><p className="mt-1 text-xs text-white/50">{club ? `${club.country} · Pekan ${Math.max(1, Number(save.week) || 1)}` : 'Pilih klub terlebih dahulu untuk melihat liga.'}</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup statistik liga" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">Tutup</button>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 pt-2" role="tablist" aria-label="Statistik kompetisi">{tabs.map((item) => <button key={item} type="button" role="tab" aria-selected={tab === item} onClick={() => { setTab(item); setNotice(''); }} className={`shrink-0 rounded-t-xl px-4 py-2.5 text-xs font-bold ${tab === item ? 'bg-cyan-300/10 text-cyan-100' : 'text-white/45 hover:text-white/80'}`}>{item}</button>)}</div>
        <div className="max-h-[65vh] overflow-auto p-4 sm:p-6">
          {!save.clubChosen || !club ? <p className="rounded-xl border border-amber-200/15 bg-amber-200/[.05] p-4 text-sm text-amber-100/80">Pilih klub terlebih dahulu untuk melihat data liga.</p> : <>
            {tab === 'Klasemen' && <><div className="mb-3 flex flex-wrap items-center justify-between gap-2"><h3 className="text-sm font-bold">Klasemen sementara</h3><span className="text-[9px] text-white/40">Klub Anda: hasil aktual · klub lain: simulasi</span></div>{standings.length ? <div className="overflow-x-auto rounded-xl border border-white/[.07]"><table className="w-full min-w-[560px] text-left text-xs"><thead className="bg-white/[.04] text-[9px] uppercase tracking-wider text-white/45"><tr><th className="px-3 py-3">#</th><th className="px-3 py-3">Klub</th><th className="px-2 py-3 text-center">Main</th><th className="px-2 py-3 text-center">M</th><th className="px-2 py-3 text-center">S</th><th className="px-2 py-3 text-center">K</th><th className="px-2 py-3 text-center">GM-GK</th><th className="px-3 py-3 text-right">Poin</th></tr></thead><tbody>{standings.map((row, index) => <tr key={row.club.id || row.club.name} className={`border-t border-white/[.05] ${row.club.name === save.club ? 'bg-lime-300/[.07] text-lime-50' : 'text-white/75'}`}><td className="px-3 py-3 font-bold">{index + 1}</td><td className="max-w-[200px] truncate px-3 py-3 font-semibold">{row.club.name}{row.club.name === save.club && <span className="ml-2 text-[9px] text-lime-200">Anda</span>}</td><td className="px-2 py-3 text-center">{row.played}</td><td className="px-2 py-3 text-center">{row.wins}</td><td className="px-2 py-3 text-center">{row.draws}</td><td className="px-2 py-3 text-center">{row.losses}</td><td className="px-2 py-3 text-center">{row.goalsFor}-{row.goalsAgainst}</td><td className="px-3 py-3 text-right font-black">{row.points}</td></tr>)}</tbody></table></div> : <p className="text-sm text-white/50">Data klub liga belum tersedia.</p>}</>}
            {(tab === 'Top skor' || tab === 'Top assist') && <><div className="mb-3 flex items-center justify-between gap-2"><h3 className="text-sm font-bold">{tab} · {club.league}</h3><span className="text-[9px] text-white/40">Pemain klub di liga ini</span></div>{notice && <p role="status" className="mb-3 rounded-lg border border-amber-200/15 bg-amber-200/[.05] p-3 text-xs text-amber-100/80">{notice}</p>}{(tab === 'Top skor' ? scorerList : assistList).length ? <div className="space-y-2">{(tab === 'Top skor' ? scorerList : assistList).map((row, index) => <div key={row.player.id} className={`flex items-center gap-3 rounded-xl border px-3 py-3 ${row.player.club === save.club ? 'border-lime-300/15 bg-lime-300/[.04]' : 'border-white/[.06] bg-white/[.02]'}`}><span className="w-6 text-center text-xs font-black text-cyan-200">{index + 1}</span><div className="min-w-0 flex-1"><p className="truncate text-xs font-bold">{row.player.name}</p><p className="truncate text-[9px] text-white/40">{row.player.club} · {row.player.position || 'Pemain'}</p></div><div className="text-right"><p className="text-lg font-black">{row.total}</p><p className="text-[9px] text-white/40">{tab === 'Top skor' ? 'gol' : 'assist'}</p></div></div>)}</div> : <p className="text-sm text-white/50">Belum ada data pemain di liga ini.</p>}<p className="mt-3 text-[9px] leading-relaxed text-white/35">Statistik pemain merupakan simulasi berdasarkan rating dan pekan berjalan; data gol/assist individu belum dicatat dari setiap laga.</p></>}
          </>}
        </div>
        <footer className="border-t border-white/10 px-4 py-3 text-[9px] text-white/35">Klasemen dan pemimpin statistik diperbarui mengikuti save permainan.</footer>
      </section>
    </div>}
  </>;
}

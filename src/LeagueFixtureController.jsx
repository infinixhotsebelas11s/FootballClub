import React, { useEffect, useMemo, useState } from 'react';
import { clubs } from '../database.js';
import { fifaClubWorldCupClubs } from '../fifa-club-world-cup.js';

const SAVE_KEY = 'football-club-manager-save';
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

function readSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; }
}

// Circle-method double round robin: every pair meets once per leg, then venues reverse.
export function buildDoubleRoundRobin(leagueClubs) {
  const teams = [...new Map(leagueClubs.map((club) => [club.id || slug(club.name), club])).values()]
    .sort((a, b) => a.name.localeCompare(b.name));
  if (teams.length < 2) return [];
  const rotation = [...teams];
  if (rotation.length % 2) rotation.push(null);
  const roundsPerLeg = rotation.length - 1;
  const firstLeg = [];

  for (let round = 0; round < roundsPerLeg; round += 1) {
    const fixtures = [];
    for (let index = 0; index < rotation.length / 2; index += 1) {
      const left = rotation[index];
      const right = rotation[rotation.length - 1 - index];
      if (!left || !right) continue;
      const swapVenue = (round + index) % 2 === 1;
      fixtures.push({ round: round + 1, home: swapVenue ? right : left, away: swapVenue ? left : right });
    }
    firstLeg.push(...fixtures);
    rotation.splice(1, 0, rotation.pop());
  }

  const secondLeg = firstLeg.map((fixture) => ({
    round: fixture.round + roundsPerLeg,
    home: fixture.away,
    away: fixture.home,
  }));
  return [...firstLeg, ...secondLeg];
}

function getClubFixtures(save) {
  if (!save?.clubChosen || !save.club) return { fixtures: [], fixture: null, opponents: [], gameIndex: 0 };
  const allClubs = [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()];
  const currentClub = allClubs.find((club) => club.name === save.club);
  if (!currentClub?.league) return { fixtures: [], fixture: null, opponents: [], gameIndex: 0 };
  const leagueClubs = allClubs.filter((club) => club.league === currentClub.league && club.country === currentClub.country);
  if (!leagueClubs.some((club) => club.name === currentClub.name)) leagueClubs.push(currentClub);
  const fixtures = buildDoubleRoundRobin(leagueClubs).filter((item) => item.home.name === currentClub.name || item.away.name === currentClub.name);
  const gameIndex = Math.max(0, Number(save.week || 1) - 1);
  const fixture = fixtures[gameIndex] || null;
  // Match the exact opponent ordering used by App.jsx when feeding its random selection.
  const opponents = allClubs.filter((club) => club.league === currentClub.league && club.name !== currentClub.name);
  return { fixtures, fixture, opponents, gameIndex, currentClub };
}

function fixtureForClub(fixture, clubName) {
  return {
    opponent: fixture.home.name === clubName ? fixture.away.name : fixture.home.name,
    venue: fixture.home.name === clubName ? 'Kandang' : 'Tandang',
  };
}

export default function LeagueFixtureController() {
  const [save, setSave] = useState(readSave);
  const [expanded, setExpanded] = useState(false);
  const status = useMemo(() => getClubFixtures(save), [save]);

  useEffect(() => {
    const onClickCapture = (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !button.textContent?.includes('Mainkan pertandingan')) return;

      const latestSave = readSave();
      const { fixture, opponents } = getClubFixtures(latestSave);
      if (!fixture) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        setSave(latestSave);
        return;
      }

      const opponent = fixture.home.name === latestSave.club ? fixture.away : fixture.home;
      const candidateIndex = opponents.findIndex((club) => club.name === opponent.name);
      if (candidateIndex < 0 || !opponents.length) return;

      // App's existing match action chooses its opponent with the first Math.random call.
      // Supply that one draw from the generated fixture; restore randomness immediately.
      const originalRandom = Math.random;
      const scheduledDraw = (candidateIndex + 0.25) / opponents.length;
      Math.random = () => {
        Math.random = originalRandom;
        return scheduledDraw;
      };
      window.setTimeout(() => {
        if (Math.random !== originalRandom) Math.random = originalRandom;
      }, 0);
      window.setTimeout(() => setSave(readSave()), 100);
    };

    document.addEventListener('click', onClickCapture, true);
    const onStorage = (event) => { if (!event.key || event.key === SAVE_KEY) setSave(readSave()); };
    const refresh = () => setSave(readSave());
    window.addEventListener('storage', onStorage);
    window.addEventListener('focus', refresh);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('focus', refresh);
    };
  }, []);

  if (!save?.clubChosen || !save.club) return null;
  const { fixture, fixtures, gameIndex } = status;
  const totalMatches = fixtures.length;
  const roundCount = new Set(fixtures.map((item) => item.round)).size;
  const upcoming = fixtures.slice(gameIndex, gameIndex + 6);
  const previous = fixtures.slice(Math.max(0, gameIndex - 2), gameIndex);
  const progress = totalMatches ? Math.min(100, (gameIndex / totalMatches) * 100) : 0;

  return <aside aria-label="Jadwal pertandingan liga" className="fixed right-4 top-28 z-20 w-[min(340px,calc(100vw-2rem))] text-white sm:right-6">
    {expanded && <section className="mb-2 overflow-hidden rounded-2xl border border-white/10 bg-[#101721]/95 shadow-2xl shadow-black/50 backdrop-blur-xl">
      <header className="border-b border-white/10 p-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0"><p className="text-[9px] font-bold uppercase tracking-[.2em] text-cyan-200">Jadwal liga</p><h2 className="mt-1 truncate text-sm font-bold">{status.currentClub?.league || 'Kompetisi klub'}</h2><p className="mt-1 truncate text-[10px] text-white/45">{save.club} · kandang & tandang</p></div>
          <span className="shrink-0 rounded-full border border-white/10 px-2 py-1 text-[9px] text-white/55">{Math.min(gameIndex, totalMatches)}/{totalMatches} laga</span>
        </div>
        <div className="mt-3 h-1 overflow-hidden rounded-full bg-white/10"><div className="h-full rounded-full bg-cyan-300 transition-all" style={{ width: `${progress}%` }} /></div>
      </header>
      <div className="max-h-[min(58vh,430px)] space-y-3 overflow-y-auto p-3">
        {fixture ? <div className="rounded-xl border border-lime-300/25 bg-lime-300/[.07] p-3">
          <div className="flex items-center justify-between text-[9px] font-bold uppercase tracking-wide"><span className="text-lime-200">Berikutnya · Putaran {fixture.round}</span><span className="text-white/45">{fixtureForClub(fixture, save.club).venue}</span></div>
          <p className="mt-2 text-sm font-bold">{fixture.home.name} <span className="px-1 text-white/30">vs</span> {fixture.away.name}</p>
          <p className="mt-1 text-[10px] text-white/45">Mainkan pertandingan untuk menyelesaikan fixture ini.</p>
        </div> : <div className="rounded-xl border border-white/10 bg-white/[.03] p-3 text-xs text-white/55">Semua pertandingan liga musim ini selesai. Reset save untuk memulai musim baru.</div>}

        {upcoming.length > 1 && <div><h3 className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[.16em] text-white/40">Laga mendatang</h3><ul className="space-y-1">{upcoming.slice(1).map((item) => <li key={`${item.round}-${item.home.id}-${item.away.id}`} className="flex items-center justify-between gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-2.5 py-2"><span className="min-w-0 truncate text-[10px] text-white/75">{item.home.name} <span className="text-white/30">vs</span> {item.away.name}</span><span className="shrink-0 text-[9px] text-white/40">P{item.round} · {fixtureForClub(item, save.club).venue}</span></li>)}</ul></div>}
        {previous.length > 0 && <div><h3 className="mb-1.5 px-1 text-[9px] font-bold uppercase tracking-[.16em] text-white/40">Fixture sebelumnya</h3><ul className="space-y-1">{previous.map((item) => <li key={`${item.round}-${item.home.id}-${item.away.id}`} className="flex items-center justify-between gap-2 rounded-lg px-2.5 py-1.5 text-[10px] text-white/40"><span className="min-w-0 truncate">{item.home.name} vs {item.away.name}</span><span className="shrink-0">P{item.round} · Selesai</span></li>)}</ul></div>}
        <p className="px-1 text-[9px] leading-relaxed text-white/30">Jadwal dibuat round-robin dari klub yang tersedia pada liga dan negara klub Anda. Tanggal pertandingan belum ditentukan.</p>
      </div>
    </section>}
    <button type="button" aria-expanded={expanded} onClick={() => setExpanded((value) => !value)} className="ml-auto flex items-center gap-2 rounded-full border border-cyan-200/20 bg-[#101721]/95 px-3 py-2 text-[10px] font-bold text-white shadow-lg shadow-black/30 backdrop-blur transition hover:border-cyan-200/45">
      <span aria-hidden="true">▤</span> {expanded ? 'Tutup jadwal' : 'Jadwal liga'} <span className="rounded-full bg-cyan-300/10 px-1.5 py-0.5 text-[9px] text-cyan-200">{Math.min(gameIndex, totalMatches)}/{totalMatches}</span>
    </button>
  </aside>;
}

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
      fixtures.push({
        round: round + 1,
        home: swapVenue ? right : left,
        away: swapVenue ? left : right,
      });
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
  if (!save?.clubChosen || !save.club) return { fixtures: [], fixture: null, opponents: [] };
  const allClubs = [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()];
  const currentClub = allClubs.find((club) => club.name === save.club);
  if (!currentClub?.league) return { fixtures: [], fixture: null, opponents: [] };
  const leagueClubs = allClubs.filter((club) => club.league === currentClub.league && club.country === currentClub.country);
  if (!leagueClubs.some((club) => club.name === currentClub.name)) leagueClubs.push(currentClub);
  const fixtures = buildDoubleRoundRobin(leagueClubs).filter((fixture) =>
    fixture.home.name === currentClub.name || fixture.away.name === currentClub.name,
  );
  const gameIndex = Math.max(0, Number(save.week || 1) - 1);
  const fixture = fixtures[gameIndex] || null;
  const opponents = leagueClubs.filter((club) => club.name !== currentClub.name);
  return { fixtures, fixture, opponents, currentClub };
}

export default function LeagueFixtureController() {
  const [save, setSave] = useState(readSave);
  const status = useMemo(() => getClubFixtures(save), [save]);

  useEffect(() => {
    const onClickCapture = (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !button.textContent?.includes('Mainkan pertandingan')) return;

      const latestSave = readSave();
      const { fixture, fixtures, opponents } = getClubFixtures(latestSave);
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
    window.addEventListener('storage', onStorage);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  if (!save?.clubChosen || !save.club) return null;
  const { fixture, fixtures } = status;
  const roundCount = new Set(fixtures.map((item) => item.round)).size;
  const venue = fixture ? (fixture.home.name === save.club ? 'Kandang' : 'Tandang') : 'Musim selesai';
  const opponentName = fixture ? (fixture.home.name === save.club ? fixture.away.name : fixture.home.name) : 'Semua laga liga selesai';

  return <div role="status" aria-live="polite" className="fixed bottom-[5.25rem] left-5 z-20 max-w-[min(320px,calc(100vw-2.5rem))] rounded-xl border border-cyan-200/15 bg-[#101721]/95 px-3 py-2 text-[10px] text-white/75 shadow-xl backdrop-blur">
    <span className="font-bold text-cyan-200">Liga · Putaran {fixture?.round || roundCount}/{roundCount || 0}</span>
    <span className="mx-1 text-white/30">·</span>{venue}
    <span className="mx-1 text-white/30">·</span>{opponentName}
    {!fixture && <span className="mt-1 block text-white/45">Reset save untuk memulai musim baru.</span>}
  </div>;
}

import React, { useEffect, useMemo, useState } from 'react';
import { getClubLeagueSchedule, readGameSave } from './leagueSchedule.js';

const SAVE_KEY = 'football-club-manager-save';

export default function LeagueFixtureController() {
  const [save, setSave] = useState(readGameSave);
  const status = useMemo(() => getClubLeagueSchedule(save), [save]);

  useEffect(() => {
    const refresh = () => setSave(readGameSave());
    const onClickCapture = (event) => {
      const button = event.target instanceof Element ? event.target.closest('button') : null;
      if (!button || !button.textContent?.includes('Mainkan pertandingan')) return;
      const latestSave = readGameSave();
      const { club, fixtures, currentIndex } = getClubLeagueSchedule(latestSave);
      const fixture = fixtures[currentIndex];
      if (!fixture || !club) {
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation();
        refresh();
        return;
      }
      const opponent = fixture.home.name === club.name ? fixture.away : fixture.home;
      // Match the exact opponent ordering used by App.jsx for its random choice.
      const allClubs = [...new Map([...clubs, ...fifaClubWorldCupClubs].map((item) => [item.id || slug(item.name), item])).values()];
      const opponents = allClubs.filter((item) => item.league === club.league && item.name !== club.name);
      const candidateIndex = opponents.findIndex((item) => item.name === opponent.name);
      if (candidateIndex < 0 || !opponents.length) return;
      const originalRandom = Math.random;
      const scheduledDraw = (candidateIndex + 0.25) / opponents.length;
      Math.random = () => { Math.random = originalRandom; return scheduledDraw; };
      window.setTimeout(() => { if (Math.random !== originalRandom) Math.random = originalRandom; }, 0);
      window.setTimeout(refresh, 120);
    };

    // Import data for the exact ordering of the existing game's opponent list.
    document.addEventListener('click', onClickCapture, true);
    window.addEventListener('storage', refresh);
    window.addEventListener('focus', refresh);
    const timer = window.setInterval(refresh, 1000);
    return () => {
      document.removeEventListener('click', onClickCapture, true);
      window.removeEventListener('storage', refresh);
      window.removeEventListener('focus', refresh);
      window.clearInterval(timer);
    };
  }, []);

  if (!save?.clubChosen || !save.club) return null;
  const { club, fixtures, currentIndex } = status;
  const fixture = fixtures[currentIndex];
  const total = fixtures.length;
  const venue = fixture ? (fixture.home.name === save.club ? 'Kandang' : 'Tandang') : 'Musim selesai';
  const opponentName = fixture ? (fixture.home.name === save.club ? fixture.away.name : fixture.home.name) : 'Semua laga liga selesai';

  return <div role="status" aria-live="polite" className="fixed bottom-[5.25rem] left-5 z-20 max-w-[min(320px,calc(100vw-2.5rem))] rounded-xl border border-cyan-200/15 bg-[#101721]/95 px-3 py-2 text-[10px] text-white/75 shadow-xl">
    <span className="font-bold text-cyan-200">Liga · Putaran {fixture?.round || total}/{total || 0}</span>
    <span className="mx-1 text-white/30">·</span>{venue}<span className="mx-1 text-white/30">·</span>{opponentName}
  </div>;
}

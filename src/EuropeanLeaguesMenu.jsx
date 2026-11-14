import React, { useMemo, useState } from 'react';
import { clubs } from '../database.js';

const EUROPE_COUNTRIES = new Set([
  'Albania', 'Andorra', 'Armenia', 'Austria', 'Azerbaijan', 'Belarus', 'Belgium',
  'Bosnia and Herzegovina', 'Bulgaria', 'Croatia', 'Cyprus', 'Czech Republic',
  'Denmark', 'England', 'Estonia', 'Faroe Islands', 'Finland', 'France', 'Georgia',
  'Germany', 'Gibraltar', 'Greece', 'Hungary', 'Iceland', 'Ireland', 'Israel', 'Italy',
  'Kazakhstan', 'Kosovo', 'Latvia', 'Liechtenstein', 'Lithuania', 'Luxembourg', 'Malta',
  'Moldova', 'Montenegro', 'Netherlands', 'North Macedonia', 'Northern Ireland', 'Norway',
  'Poland', 'Portugal', 'Romania', 'Russia', 'San Marino', 'Scotland', 'Serbia',
  'Slovakia', 'Slovenia', 'Spain', 'Sweden', 'Switzerland', 'Turkey', 'Ukraine', 'Wales',
]);

export default function EuropeanLeaguesMenu() {
  const [open, setOpen] = useState(false);
  const [country, setCountry] = useState('Semua negara');
  const [division, setDivision] = useState('Semua divisi');
  const [query, setQuery] = useState('');

  const europeanClubs = useMemo(() => clubs.filter((club) =>
    club.continent === 'Europe' || EUROPE_COUNTRIES.has(club.country),
  ), []);
  const countries = useMemo(() => [...new Set(europeanClubs.map((club) => club.country).filter(Boolean))].sort((a, b) => a.localeCompare(b)), [europeanClubs]);
  const divisions = useMemo(() => [...new Set(europeanClubs.map((club) => Number(club.division)).filter((tier) => tier >= 1 && tier <= 4))].sort((a, b) => a - b), [europeanClubs]);
  const visibleClubs = europeanClubs.filter((club) =>
    (country === 'Semua negara' || club.country === country)
    && (division === 'Semua divisi' || Number(club.division) === Number(division))
    && `${club.name} ${club.league} ${club.country}`.toLowerCase().includes(query.toLowerCase()),
  );
  const grouped = visibleClubs.reduce((groups, club) => {
    const key = `${club.country} · Divisi ${club.division || '—'} · ${club.league || 'Kompetisi belum diketahui'}`;
    (groups[key] ||= []).push(club);
    return groups;
  }, {});

  return <div className="fixed bottom-5 left-5 z-30">
    {open && <section aria-label="Jelajah liga Eropa" className="mb-3 max-h-[min(70vh,620px)] w-[min(430px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#101721]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex items-start justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Database Eropa</p><h2 className="mt-1 text-lg font-bold">Liga & klub</h2></div>
        <span className="rounded-full border border-white/10 px-2 py-1 text-[10px] text-white/55">{visibleClubs.length} klub</span>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <label className="text-[10px] text-white/50">Negara<select value={country} onChange={(event) => setCountry(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white"><option>Semua negara</option>{countries.map((item) => <option key={item}>{item}</option>)}</select></label>
        <label className="text-[10px] text-white/50">Divisi<select value={division} onChange={(event) => setDivision(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white"><option>Semua divisi</option>{divisions.map((item) => <option key={item} value={item}>Divisi {item}</option>)}</select></label>
      </div>
      <input aria-label="Cari liga atau klub Eropa" value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari liga atau klub..." className="mt-2 w-full rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs text-white outline-none focus:border-lime-300/60" />
      <div className="mt-3 max-h-[min(42vh,360px)] space-y-3 overflow-y-auto pr-1">
        {Object.entries(grouped).map(([label, entries]) => <div key={label}>
          <h3 className="sticky top-0 rounded-md bg-[#101721] py-1 text-[10px] font-bold uppercase tracking-wide text-lime-200">{label}</h3>
          <p className="text-[10px] leading-relaxed text-white/55">{entries.map((club) => club.name).sort((a, b) => a.localeCompare(b)).join(' · ')}</p>
        </div>)}
        {!Object.keys(grouped).length && <p className="rounded-xl border border-dashed border-white/15 p-4 text-xs text-white/45">Belum ada klub Eropa yang cocok di data sumber. Jalankan pembaruan database untuk memuat kompetisi yang tersedia.</p>}
      </div>
      <p className="mt-3 border-t border-white/10 pt-2 text-[9px] leading-relaxed text-white/35">Daftar mengikuti klub yang tersedia dalam snapshot 2024/25. Tingkat divisi dapat berbeda cakupannya per negara; ini bukan daftar lengkap semua klub Eropa.</p>
    </section>}
    <button type="button" aria-expanded={open} aria-label={open ? 'Tutup jelajah liga Eropa' : 'Buka jelajah liga Eropa'} onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-cyan-200/25 bg-[#111a22] px-4 py-3 text-sm font-bold text-white shadow-lg shadow-black/30 transition hover:-translate-y-0.5 hover:border-cyan-200/50">
      <span aria-hidden="true">◉</span> Liga Eropa
    </button>
  </div>;
}

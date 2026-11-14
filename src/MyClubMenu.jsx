import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players } from '../database.js';
import { fifaClubWorldCupClubs } from '../fifa-club-world-cup.js';

const SAVE_KEY = 'football-club-manager-save';
const money = (amount) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(amount) || 0);
const slug = (value) => String(value || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

export default function MyClubMenu() {
  const [open, setOpen] = useState(false);
  const [save, setSave] = useState(() => {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; }
  });
  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || slug(club.name), club])).values()], []);

  useEffect(() => {
    const syncSave = () => {
      try { setSave(JSON.parse(localStorage.getItem(SAVE_KEY) || '{}')); } catch { setSave({}); }
    };
    window.addEventListener('storage', syncSave);
    const timer = window.setInterval(syncSave, 1000);
    return () => { window.removeEventListener('storage', syncSave); window.clearInterval(timer); };
  }, []);

  const club = allClubs.find((item) => item.name === save.club);
  const squad = (Array.isArray(save.squad) ? save.squad : []).map((id) => players.find((player) => player.id === id)).filter(Boolean);
  const roster = squad.length ? squad : players.filter((player) => player.club === save.club);
  const rating = roster.length ? Math.round(roster.reduce((sum, player) => sum + (Number(player.ovr) || 60), 0) / roster.length) : 0;

  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-4 z-40 rounded-full border border-lime-200/30 bg-[#141d19] px-4 py-3 text-sm font-black text-lime-100 shadow-xl shadow-black/40 transition hover:bg-lime-300 hover:text-[#10140a] sm:right-7" aria-haspopup="dialog" aria-expanded={open}>
      My Klub
    </button>
    {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-3 backdrop-blur-sm sm:p-5" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Menu My Klub" className="w-full max-w-2xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] text-white shadow-2xl shadow-black/60">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-lime-300/[.12] via-[#111a23] to-cyan-300/[.07] p-5 sm:p-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-lime-200">Pusat klub</p><h2 className="mt-1 text-2xl font-black">My Klub</h2><p className="mt-1 text-sm text-white/55">Ringkasan klub dan skuad yang sedang Anda kelola.</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup My Klub" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">Tutup</button>
        </header>
        <div className="max-h-[70vh] space-y-4 overflow-y-auto p-4 sm:p-6">
          {!save.clubChosen && <div className="rounded-xl border border-amber-200/15 bg-amber-200/[.05] p-4 text-sm text-amber-100/80">Pilih klub terlebih dahulu untuk melihat halaman My Klub.</div>}
          {save.clubChosen && <>
            <section className="rounded-xl border border-white/10 bg-white/[.025] p-4">
              <div className="flex flex-wrap items-start justify-between gap-3"><div><h3 className="text-xl font-black">{save.club || 'Klub saya'}</h3><p className="mt-1 text-sm text-white/55">{club ? `${club.league} · ${club.country}` : 'Informasi liga belum tersedia'}</p></div><span className="rounded-lg border border-lime-300/20 bg-lime-300/[.06] px-3 py-2 text-xs font-bold text-lime-100">{save.role || 'Manajer'}</span></div>
              {club?.stadium && <p className="mt-3 text-xs text-white/45">Stadion · {club.stadium}</p>}
            </section>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
              {[
                ['Kas klub', money(save.cash)],
                ['Reputasi', `${Number(save.reputation) || 0}/100`],
                ['Rating skuad', rating || '—'],
                ['Pemain', roster.length],
              ].map(([label, value]) => <div key={label} className="rounded-xl border border-white/[.07] bg-white/[.025] p-3"><p className="text-[10px] text-white/40">{label}</p><p className="mt-1 break-words text-sm font-bold">{value}</p></div>)}
            </div>
            <section className="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
              <div className="flex items-center justify-between gap-3"><h3 className="text-sm font-bold">Performa musim ini</h3><span className="text-[10px] text-white/40">Pekan {Number(save.week) || 1}</span></div>
              <div className="mt-3 grid grid-cols-4 gap-2 text-center">{[['Main', save.played], ['Menang', save.wins], ['Seri', save.draws], ['Kalah', save.losses]].map(([label, value]) => <div key={label} className="rounded-lg bg-black/20 p-2"><div className="text-lg font-black">{Number(value) || 0}</div><div className="text-[9px] text-white/45">{label}</div></div>)}</div>
              <p className="mt-3 text-xs text-white/55">Poin liga <b className="text-white">{Number(save.points) || 0}</b></p>
            </section>
            <section className="rounded-xl border border-white/[.07] bg-white/[.025] p-4">
              <div className="mb-3 flex items-center justify-between"><h3 className="text-sm font-bold">Skuad utama</h3><span className="text-[10px] text-white/40">{roster.length} pemain</span></div>
              {roster.length ? <div className="grid gap-2 sm:grid-cols-2">{roster.map((player) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[.05] bg-black/15 px-3 py-2"><div className="min-w-0"><p className="truncate text-xs font-semibold">{player.name}</p><p className="mt-0.5 text-[10px] text-white/40">{player.position || 'Pemain'}</p></div><span className="rounded-md bg-lime-300/10 px-2 py-1 text-xs font-black text-lime-100">{player.ovr ?? '—'}</span></div>)}</div> : <p className="text-xs text-white/45">Belum ada data pemain untuk skuad klub ini.</p>}
            </section>
          </>}
        </div>
      </section>
    </div>}
  </>;
}

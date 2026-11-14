import React, { useEffect, useMemo, useState } from 'react';
import { players } from '../database.js';

const SAVE_KEY = 'football-club-manager-save';
const tabs = ['Media TV', 'Berita', 'Gosip & rumor', 'Lainnya', "Ballon d'Or"];

function loadSave() {
  try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; }
}

function makeHeadlines(save) {
  const club = save.club || 'Klub Anda';
  const week = Number(save.week) || 1;
  const squad = (Array.isArray(save.squad) ? save.squad : []).map((id) => players.find((player) => player.id === id)).filter(Boolean);
  const star = [...squad].sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0))[0];
  const name = star?.name || 'pemain andalan';
  return [
    { category: 'Sorotan klub', title: `${club} jadi bahan pembicaraan pekan ini`, text: `Memasuki pekan ${week}, perhatian tertuju pada persiapan tim dan peluang mereka di kompetisi. Pendukung berharap ${name} mampu tampil menentukan.`, source: 'Football Club TV' },
    { category: 'Analisis', title: 'Persaingan papan klasemen makin menarik', text: `Para analis menilai konsistensi akan menjadi kunci. Setiap hasil pertandingan dapat mengubah momentum dan posisi klub di klasemen.`, source: 'Studio Sepak Bola' },
    { category: 'Bursa transfer', title: 'Rumor transfer mulai ramai diperbincangkan', text: `Pengamat mengaitkan beberapa pemain dengan klub-klub yang sedang mencari tambahan kekuatan. Belum ada kesepakatan resmi; rumor ini hanya bagian dari simulasi dunia game.`, source: 'Bursa 24' },
    { category: 'Ruang ganti', title: 'Pemain muda berusaha mencuri perhatian', text: `Pemain muda di berbagai klub terus bekerja keras untuk mendapat menit bermain dan membuktikan kualitas mereka kepada manajer.`, source: 'Jurnal Liga' },
  ];
}

export default function EntertainmentMenu() {
  const [open, setOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('Media TV');
  const [save, setSave] = useState(loadSave);
  const [winner, setWinner] = useState(null);

  useEffect(() => {
    const refresh = () => setSave(loadSave());
    window.addEventListener('storage', refresh);
    const timer = window.setInterval(refresh, 1200);
    return () => { window.removeEventListener('storage', refresh); window.clearInterval(timer); };
  }, []);

  const headlines = useMemo(() => makeHeadlines(save), [save]);
  const nominees = useMemo(() => [...players]
    .filter((player) => player.position !== 'GK')
    .sort((a, b) => (Number(b.ovr) || 0) - (Number(a.ovr) || 0) || a.name.localeCompare(b.name))
    .slice(0, 10), []);
  const awardYear = 2024 + Math.max(0, Math.floor(((Number(save.week) || 1) - 1) / 38));

  function runCeremony() {
    if (!nominees.length) return;
    const topCandidates = nominees.slice(0, Math.min(5, nominees.length));
    const weightedPool = topCandidates.flatMap((player) => Array.from({ length: Math.max(1, Number(player.ovr) || 1) }, () => player));
    setWinner(weightedPool[Math.floor(Math.random() * weightedPool.length)]);
  }

  return <>
    <button type="button" onClick={() => setOpen(true)} className="fixed bottom-5 right-[112px] z-40 rounded-full border border-cyan-200/30 bg-[#121b24] px-4 py-3 text-sm font-black text-cyan-100 shadow-xl shadow-black/40 transition hover:bg-cyan-200 hover:text-[#081114] sm:right-[130px]" aria-haspopup="dialog" aria-expanded={open}>
      Entertainment
    </button>
    {open && <div className="fixed inset-0 z-[70] grid place-items-center bg-black/75 p-3 backdrop-blur-sm" onMouseDown={(event) => { if (event.target === event.currentTarget) setOpen(false); }}>
      <section role="dialog" aria-modal="true" aria-label="Menu Entertainment" className="w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 bg-[#0d131c] text-white shadow-2xl shadow-black/60">
        <header className="flex items-start justify-between gap-4 border-b border-white/10 bg-gradient-to-br from-cyan-300/[.12] via-[#111a23] to-lime-300/[.07] p-5 sm:p-6">
          <div><p className="text-[10px] font-bold uppercase tracking-[.22em] text-cyan-200">Dunia sepak bola</p><h2 className="mt-1 text-2xl font-black">Entertainment</h2><p className="mt-1 text-sm text-white/55">Siaran, kabar, rumor, dan acara penghargaan dalam simulasi game.</p></div>
          <button type="button" onClick={() => setOpen(false)} aria-label="Tutup Entertainment" className="rounded-full border border-white/10 px-3 py-1.5 text-xs text-white/70 hover:bg-white/10">Tutup</button>
        </header>
        <div className="flex gap-1 overflow-x-auto border-b border-white/10 px-3 pt-2" role="tablist" aria-label="Kategori Entertainment">
          {tabs.map((tab) => <button key={tab} type="button" role="tab" aria-selected={activeTab === tab} onClick={() => { setActiveTab(tab); if (tab !== "Ballon d'Or") setWinner(null); }} className={`shrink-0 rounded-t-xl px-3 py-2.5 text-[10px] font-bold ${activeTab === tab ? 'bg-cyan-300/10 text-cyan-100' : 'text-white/45 hover:text-white/80'}`}>{tab}</button>)}
        </div>
        <div className="max-h-[65vh] space-y-3 overflow-y-auto p-4 sm:p-6">
          {activeTab === 'Media TV' && <>
            <div className="rounded-xl border border-cyan-200/15 bg-cyan-200/[.045] p-4"><p className="text-[10px] font-bold uppercase tracking-widest text-cyan-200">Football Club TV · Siaran utama</p><h3 className="mt-2 text-lg font-black">Jelang laga: {save.club || 'kompetisi pekan ini'}</h3><p className="mt-2 text-sm leading-relaxed text-white/65">Panel analis membahas performa tim, pilihan taktik, dan pemain yang patut diperhatikan. Pekan kompetisi saat ini: {Number(save.week) || 1}.</p></div>
            <div className="grid gap-3 sm:grid-cols-2">{['Ruang Taktik', 'Flashback Liga', 'Wawancara Pasca-Laga', 'Bursa Malam Ini'].map((show, index) => <article key={show} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><p className="text-[9px] font-bold uppercase tracking-widest text-lime-200">Program {index + 1}</p><h3 className="mt-1 text-sm font-bold">{show}</h3><p className="mt-2 text-xs leading-relaxed text-white/50">{['Ulasan strategi dan bentuk permainan klub.', 'Momen-momen penting dari perjalanan musim.', 'Suasana ruang ganti dan tanggapan setelah pertandingan.', 'Kabar rumor transfer yang masih perlu dikonfirmasi.'][index]}</p></article>)}</div>
          </>}
          {(activeTab === 'Berita' || activeTab === 'Gosip & rumor') && <div className="space-y-3">{headlines.filter((item) => activeTab === 'Berita' ? item.category !== 'Bursa transfer' : item.category === 'Bursa transfer' || item.category === 'Ruang ganti').map((item) => <article key={item.title} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><div className="flex flex-wrap items-center justify-between gap-2"><span className="rounded-md bg-lime-300/10 px-2 py-1 text-[9px] font-bold text-lime-100">{item.category}</span><span className="text-[9px] text-white/35">{item.source}</span></div><h3 className="mt-2 text-sm font-bold">{item.title}</h3><p className="mt-1 text-xs leading-relaxed text-white/55">{item.text}</p></article>)}<p className="text-[9px] text-white/30">Semua berita dan rumor di sini dibuat sebagai konten fiksi untuk simulasi game.</p></div>}
          {activeTab === 'Lainnya' && <div className="grid gap-3 sm:grid-cols-2">{[
            ['Podcast Tribun', 'Diskusi santai tentang drama liga dan cerita di balik pertandingan.'],
            ['Prediksi Pekan Ini', `Panel membuat prediksi untuk perjalanan ${save.club || 'klub Anda'} di pekan berikutnya.`],
            ['Fan Zone', 'Reaksi pendukung, chant, dan suasana komunitas klub.'],
            ['Dokumenter Musim', 'Ikuti perjalanan klub dari awal musim hingga perebutan gelar.'],
          ].map(([title, text]) => <article key={title} className="rounded-xl border border-white/[.07] bg-white/[.025] p-4"><h3 className="text-sm font-bold">{title}</h3><p className="mt-2 text-xs leading-relaxed text-white/55">{text}</p></article>)}</div>}
          {activeTab === "Ballon d'Or" && <section className="rounded-xl border border-amber-200/15 bg-gradient-to-br from-amber-200/[.08] to-white/[.02] p-4 sm:p-5">
            <p className="text-[10px] font-bold uppercase tracking-[.22em] text-amber-200">Malam penghargaan · {awardYear}</p><h3 className="mt-2 text-xl font-black">Ballon d'Or</h3><p className="mt-2 text-xs leading-relaxed text-white/55">Sepuluh nominasi ditentukan dari rating pemain di database. Pemenang acara ini dipilih secara simulasi dan bukan hasil penghargaan resmi dunia nyata.</p>
            {winner ? <div className="my-5 rounded-xl border border-amber-200/20 bg-black/20 p-5 text-center"><div className="text-3xl" aria-hidden="true">🏆</div><p className="mt-2 text-[9px] font-bold uppercase tracking-widest text-amber-200">Pemenang Ballon d'Or {awardYear}</p><h4 className="mt-1 text-2xl font-black">{winner.name}</h4><p className="mt-1 text-xs text-white/50">{winner.club} · rating {winner.ovr ?? '—'}</p></div> : <button type="button" onClick={runCeremony} className="my-4 w-full rounded-lg bg-amber-200 px-4 py-3 text-sm font-black text-[#1c1608] hover:bg-amber-100">Mulai malam penghargaan</button>}
            <h4 className="mb-2 text-xs font-bold text-white/70">Daftar nominasi</h4><div className="grid gap-2 sm:grid-cols-2">{nominees.map((player, index) => <div key={player.id} className="flex items-center justify-between gap-3 rounded-lg border border-white/[.06] bg-black/15 px-3 py-2"><div className="flex min-w-0 items-center gap-2"><span className="text-[10px] font-black text-amber-200">{index + 1}</span><div className="min-w-0"><p className="truncate text-xs font-semibold">{player.name}</p><p className="truncate text-[9px] text-white/40">{player.club}</p></div></div><span className="text-xs font-black text-white/75">{player.ovr ?? '—'}</span></div>)}</div>
          </section>}
        </div>
        <footer className="border-t border-white/10 px-4 py-3 text-[9px] text-white/35">Konten Entertainment dan acara Ballon d'Or adalah simulasi fiksi di dalam game.</footer>
      </section>
    </div>}
  </>;
}

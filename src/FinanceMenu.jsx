import React, { useEffect, useMemo, useState } from 'react';

const SAVE_KEY = 'football-club-manager-save';
const FINANCE_KEY = 'football-club-finance-data';
const euro = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value) || 0);

function readJson(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; }
}
function saveFinance(value) {
  try { localStorage.setItem(FINANCE_KEY, JSON.stringify(value)); } catch { /* local save unavailable */ }
}

export default function FinanceMenu() {
  const [open, setOpen] = useState(false);
  const [gameSave, setGameSave] = useState(() => readJson(SAVE_KEY, {}));
  const [finance, setFinance] = useState(() => readJson(FINANCE_KEY, { sponsors: [], entries: [] }));
  const [sponsorName, setSponsorName] = useState('');
  const [weeklyValue, setWeeklyValue] = useState('');
  const [contractMatches, setContractMatches] = useState('10');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryType, setEntryType] = useState('Pemasukan');

  useEffect(() => {
    const refresh = () => {
      setGameSave(readJson(SAVE_KEY, {}));
      setFinance(readJson(FINANCE_KEY, { sponsors: [], entries: [] }));
    };
    const timer = window.setInterval(refresh, 1200);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  useEffect(() => { saveFinance(finance); }, [finance]);

  const completedMatches = Math.max(0, Number(gameSave.played) || 0);
  const sponsorRows = (finance.sponsors || []).map((sponsor) => {
    const dueMatches = Math.max(0, Math.min(Number(sponsor.durationMatches) || 0, completedMatches - (Number(sponsor.startAfterPlayed) || 0)));
    return { ...sponsor, paidMatches: dueMatches, earned: dueMatches * (Number(sponsor.weeklyValue) || 0), remaining: Math.max(0, (Number(sponsor.durationMatches) || 0) - dueMatches) };
  });
  const sponsorEarnings = sponsorRows.reduce((sum, item) => sum + item.earned, 0);
  const manualNet = (finance.entries || []).reduce((sum, item) => sum + (item.type === 'Pemasukan' ? 1 : -1) * Number(item.amount || 0), 0);
  const gameCash = Number(gameSave.cash) || 0;
  const recordedBalance = gameCash + sponsorEarnings + manualNet;
  const activeSponsors = sponsorRows.filter((item) => item.remaining > 0);

  function addSponsor(event) {
    event.preventDefault();
    const name = sponsorName.trim();
    const weekly = Number(weeklyValue);
    const duration = Math.floor(Number(contractMatches));
    if (!name || !Number.isFinite(weekly) || weekly <= 0 || !Number.isFinite(duration) || duration < 1) return;
    setFinance((current) => ({
      ...current,
      sponsors: [...(current.sponsors || []), {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        weeklyValue: weekly,
        durationMatches: duration,
        startAfterPlayed: completedMatches,
        createdAt: new Date().toISOString(),
      }],
    }));
    setSponsorName(''); setWeeklyValue('');
  }
  function endSponsor(id) {
    setFinance((current) => ({ ...current, sponsors: (current.sponsors || []).filter((item) => item.id !== id) }));
  }
  function addEntry(event) {
    event.preventDefault();
    const title = entryTitle.trim();
    const amount = Number(entryAmount);
    if (!title || !Number.isFinite(amount) || amount <= 0) return;
    setFinance((current) => ({
      ...current,
      entries: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, amount, type: entryType, createdAt: new Date().toISOString() }, ...(current.entries || [])],
    }));
    setEntryTitle(''); setEntryAmount('');
  }

  return <div className="fixed bottom-5 left-5 z-30">
    {open && <section aria-label="Keuangan klub dan sponsor" className="mb-3 max-h-[min(75vh,680px)] w-[min(410px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#101721]/95 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <header className="border-b border-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Manajemen klub</p><h2 className="mt-1 text-lg font-bold">Keuangan & sponsor</h2>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/[.07] bg-white/[.03] p-3"><p className="text-[9px] uppercase tracking-wide text-white/45">Kas game</p><strong className="mt-1 block text-sm">{euro(gameCash)}</strong></div><div className="rounded-xl border border-lime-200/15 bg-lime-200/[.04] p-3"><p className="text-[9px] uppercase tracking-wide text-white/45">Kas + catatan</p><strong className="mt-1 block text-sm text-lime-100">{euro(recordedBalance)}</strong></div></div>
        <div className="mt-2 flex justify-between text-[10px] text-white/45"><span>Pendapatan sponsor tercatat</span><b className="text-cyan-200">{euro(sponsorEarnings)}</b></div>
      </header>
      <div className="max-h-[min(55vh,490px)] space-y-4 overflow-y-auto p-4">
        <section><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Kontrak sponsor</h3><span className="text-[9px] text-white/40">{activeSponsors.length} aktif</span></div>
          <form onSubmit={addSponsor} className="mt-2 grid grid-cols-2 gap-2">
            <input aria-label="Nama sponsor" value={sponsorName} onChange={(event) => setSponsorName(event.target.value)} placeholder="Nama sponsor" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs outline-none focus:border-lime-300/60" />
            <label className="text-[9px] text-white/45">Bayaran per laga<input aria-label="Bayaran sponsor per laga" type="number" min="1" value={weeklyValue} onChange={(event) => setWeeklyValue(event.target.value)} placeholder="EUR" className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label>
            <label className="text-[9px] text-white/45">Durasi (laga)<input aria-label="Durasi kontrak dalam laga" type="number" min="1" step="1" value={contractMatches} onChange={(event) => setContractMatches(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label>
            <button type="submit" className="col-span-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Tambah sponsor</button>
          </form>
          <ul className="mt-2 space-y-1.5">{sponsorRows.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-2.5 py-2"><div className="min-w-0"><p className="truncate text-xs font-semibold">{item.name}</p><p className="mt-0.5 text-[9px] text-white/45">{euro(item.weeklyValue)}/laga · {item.paidMatches}/{item.durationMatches} laga · tercatat {euro(item.earned)}</p></div><button type="button" onClick={() => endSponsor(item.id)} className="shrink-0 text-[10px] text-rose-200/70 hover:text-rose-200">Akhiri</button></li>)}
            {!sponsorRows.length && <li className="rounded-lg border border-dashed border-white/10 p-3 text-[10px] text-white/40">Belum ada kontrak. Sponsor akan dicatat berdasarkan laga yang dimainkan.</li>}
          </ul>
        </section>
        <section className="border-t border-white/10 pt-3"><h3 className="text-xs font-bold">Catat pemasukan / pengeluaran</h3>
          <form onSubmit={addEntry} className="mt-2 grid grid-cols-2 gap-2">
            <input aria-label="Keterangan transaksi" value={entryTitle} onChange={(event) => setEntryTitle(event.target.value)} placeholder="Keterangan" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs outline-none focus:border-lime-300/60" />
            <select aria-label="Jenis transaksi" value={entryType} onChange={(event) => setEntryType(event.target.value)} className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white"><option>Pemasukan</option><option>Pengeluaran</option></select>
            <input aria-label="Jumlah transaksi" type="number" min="1" value={entryAmount} onChange={(event) => setEntryAmount(event.target.value)} placeholder="Jumlah EUR" className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs outline-none focus:border-lime-300/60" />
            <button type="submit" className="col-span-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/[.05]">Simpan transaksi</button>
          </form>
          <ul className="mt-2 max-h-28 space-y-1 overflow-y-auto">{(finance.entries || []).slice(0, 12).map((item) => <li key={item.id} className="flex justify-between gap-2 text-[10px]"><span className="truncate text-white/55">{item.title}</span><span className={item.type === 'Pemasukan' ? 'shrink-0 text-lime-200' : 'shrink-0 text-rose-200'}>{item.type === 'Pemasukan' ? '+' : '−'}{euro(item.amount)}</span></li>)}
            {!finance.entries?.length && <li className="text-[10px] text-white/35">Belum ada transaksi manual.</li>}
          </ul>
        </section>
        <p className="text-[9px] leading-relaxed text-white/35">Kontrak dan transaksi disimpan sebagai buku kas lokal browser. Saldo kas game adalah saldo yang dipakai oleh fitur transfer; catatan sponsor/transaksi belum mengubah saldo tersebut.</p>
      </div>
    </section>}
    <button type="button" aria-expanded={open} aria-label={open ? 'Tutup keuangan klub' : 'Buka keuangan klub'} onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-[#17150f] px-4 py-3 text-sm font-bold text-amber-100 shadow-lg shadow-black/30 transition hover:-translate-y-0.5"><span aria-hidden="true">€</span> Keuangan</button>
  </div>;
}

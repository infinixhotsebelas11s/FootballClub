import React, { useEffect, useMemo, useState } from 'react';
import { clubs } from '../database.js';
import { fifaClubWorldCupClubs } from '../fifa-club-world-cup.js';

const SAVE_KEY = 'football-club-manager-save';
const FINANCE_KEY = 'football-club-finance-data';
const euro = (value) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }).format(Number(value) || 0);
const PRODUCTS = [
  { id: 'jersey', name: 'Jersey', price: 65 },
  { id: 'shirt', name: 'Kaos', price: 28 },
  { id: 'socks', name: 'Kaos kaki', price: 12 },
  { id: 'gloves', name: 'Sarung tangan', price: 24 },
  { id: 'cap', name: 'Topi', price: 18 },
  { id: 'beanie', name: 'Kupluk', price: 16 },
];
const SPONSOR_CATEGORIES = [
  'Sponsor umum',
  'Sponsor jersey',
  'Sponsor stadion',
  'Sponsor baju latihan tim',
  'Sponsor minuman latihan',
  'Sponsor gym',
  'Sponsor merek alat gym',
];
const EMPTY_FINANCE = { sponsors: [], entries: [], seasonTicketsSold: 0, matchTicketsSold: {} };

function readJson(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; }
}
function saveFinance(value) {
  try { localStorage.setItem(FINANCE_KEY, JSON.stringify(value)); } catch { /* local save unavailable */ }
}
function saveGameCash(amount) {
  const save = readJson(SAVE_KEY, {});
  if (!save.clubChosen) return null;
  const updated = { ...save, cash: (Number(save.cash) || 0) + amount };
  try { localStorage.setItem(SAVE_KEY, JSON.stringify(updated)); } catch { /* local save unavailable */ }
  return updated;
}

export default function FinanceMenu() {
  const [open, setOpen] = useState(false);
  const [gameSave, setGameSave] = useState(() => readJson(SAVE_KEY, {}));
  const [finance, setFinance] = useState(() => ({ ...EMPTY_FINANCE, ...readJson(FINANCE_KEY, {}) }));
  const [sponsorName, setSponsorName] = useState('');
  const [sponsorCategory, setSponsorCategory] = useState(SPONSOR_CATEGORIES[0]);
  const [weeklyValue, setWeeklyValue] = useState('');
  const [contractMatches, setContractMatches] = useState('10');
  const [productId, setProductId] = useState(PRODUCTS[0].id);
  const [productQty, setProductQty] = useState('1');
  const [productPrice, setProductPrice] = useState(String(PRODUCTS[0].price));
  const [ticketQty, setTicketQty] = useState('1');
  const [ticketPrice, setTicketPrice] = useState('25');
  const [seasonQty, setSeasonQty] = useState('1');
  const [seasonPrice, setSeasonPrice] = useState('180');
  const [entryTitle, setEntryTitle] = useState('');
  const [entryAmount, setEntryAmount] = useState('');
  const [entryType, setEntryType] = useState('Pemasukan');
  const [notice, setNotice] = useState('');

  useEffect(() => {
    const refresh = () => {
      setGameSave(readJson(SAVE_KEY, {}));
      setFinance((current) => ({ ...EMPTY_FINANCE, ...readJson(FINANCE_KEY, current) }));
    };
    const timer = window.setInterval(refresh, 1200);
    window.addEventListener('focus', refresh);
    window.addEventListener('storage', refresh);
    return () => { window.clearInterval(timer); window.removeEventListener('focus', refresh); window.removeEventListener('storage', refresh); };
  }, []);
  useEffect(() => { saveFinance(finance); }, [finance]);

  const allClubs = useMemo(() => [...new Map([...clubs, ...fifaClubWorldCupClubs].map((club) => [club.id || club.name, club])).values()], []);
  const currentClub = allClubs.find((club) => club.name === gameSave.club);
  const capacity = Math.max(1, Number(currentClub?.capacity) || 25000);
  const completedMatches = Math.max(0, Number(gameSave.played) || 0);
  const sponsorRows = (finance.sponsors || []).map((sponsor) => {
    const dueMatches = Math.max(0, Math.min(Number(sponsor.durationMatches) || 0, completedMatches - (Number(sponsor.startAfterPlayed) || 0)));
    return { ...sponsor, paidMatches: dueMatches, earned: dueMatches * (Number(sponsor.weeklyValue) || 0), remaining: Math.max(0, (Number(sponsor.durationMatches) || 0) - dueMatches) };
  });
  const sponsorEarnings = sponsorRows.reduce((sum, item) => sum + item.earned, 0);
  const manualNet = (finance.entries || []).filter((item) => !item.cashPosted).reduce((sum, item) => sum + (item.type === 'Pemasukan' ? 1 : -1) * Number(item.amount || 0), 0);
  const gameCash = Number(gameSave.cash) || 0;
  const recordedBalance = gameCash + manualNet;
  const activeSponsors = sponsorRows.filter((item) => item.remaining > 0);
  const seasonSeats = Math.max(0, Number(finance.seasonTicketsSold) || 0);
  const matchTicketKey = `${gameSave.club || 'club'}-${Number(gameSave.week) || 1}`;
  const matchSeats = Math.max(0, Number(finance.matchTicketsSold?.[matchTicketKey]) || 0);
  const remainingMatchCapacity = Math.max(0, capacity - seasonSeats - matchSeats);
  const currentProduct = PRODUCTS.find((item) => item.id === productId) || PRODUCTS[0];
  const merchandiseIncome = (finance.entries || []).filter((item) => item.category === 'Merchandise').reduce((sum, item) => sum + Number(item.amount || 0), 0);
  const ticketIncome = (finance.entries || []).filter((item) => item.category === 'Tiket' || item.category === 'Tiket Musiman').reduce((sum, item) => sum + Number(item.amount || 0), 0);

  function recordSale(title, category, amount, quantity, additionalFinance = {}) {
    if (!gameSave.clubChosen) return setNotice('Pilih klub terlebih dahulu.');
    const updatedSave = saveGameCash(amount);
    if (!updatedSave) return setNotice('Saldo kas game tidak dapat diperbarui.');
    const entry = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      title,
      category,
      amount,
      quantity,
      type: 'Pemasukan',
      cashPosted: true,
      club: gameSave.club,
      matchWeek: Number(gameSave.week) || 1,
      createdAt: new Date().toISOString(),
    };
    setGameSave(updatedSave);
    setFinance((current) => ({ ...current, ...additionalFinance, entries: [entry, ...(current.entries || [])] }));
    setNotice(`${title}: ${euro(amount)} masuk ke kas klub.`);
    window.setTimeout(() => setNotice(''), 3000);
  }

  function addSponsor(event) {
    event.preventDefault();
    const name = sponsorName.trim();
    const amount = Number(weeklyValue);
    const duration = Math.floor(Number(contractMatches));
    if (!name || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(duration) || duration < 1) return;
    setFinance((current) => ({
      ...current,
      sponsors: [...(current.sponsors || []), {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name,
        category: sponsorCategory,
        weeklyValue: amount,
        durationMatches: duration,
        startAfterPlayed: completedMatches,
        createdAt: new Date().toISOString(),
      }],
    }));
    setSponsorName(''); setWeeklyValue('');
  }
  function endSponsor(id) { setFinance((current) => ({ ...current, sponsors: (current.sponsors || []).filter((item) => item.id !== id) })); }

  function sellMerchandise(event) {
    event.preventDefault();
    const quantity = Math.floor(Number(productQty));
    const price = Number(productPrice);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga merchandise dengan benar.');
    recordSale(`Penjualan ${currentProduct.name} × ${quantity}`, 'Merchandise', quantity * price, quantity);
    setProductQty('1');
  }
  function sellMatchTickets(event) {
    event.preventDefault();
    const quantity = Math.floor(Number(ticketQty));
    const price = Number(ticketPrice);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga tiket dengan benar.');
    if (quantity > remainingMatchCapacity) return setNotice(`Kapasitas tersisa untuk laga ini ${remainingMatchCapacity.toLocaleString('id-ID')} kursi.`);
    recordSale(`Penjualan tiket pertandingan × ${quantity}`, 'Tiket', quantity * price, quantity, {
      matchTicketsSold: { ...(finance.matchTicketsSold || {}), [matchTicketKey]: matchSeats + quantity },
    });
    setTicketQty('1');
  }
  function sellSeasonTickets(event) {
    event.preventDefault();
    const quantity = Math.floor(Number(seasonQty));
    const price = Number(seasonPrice);
    const remaining = Math.max(0, capacity - seasonSeats);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga tiket musiman dengan benar.');
    if (quantity > remaining) return setNotice(`Kapasitas langganan tiket musiman tersisa ${remaining.toLocaleString('id-ID')} kursi.`);
    recordSale(`Langganan tiket musiman × ${quantity}`, 'Tiket Musiman', quantity * price, quantity, { seasonTicketsSold: seasonSeats + quantity });
    setSeasonQty('1');
  }
  function addEntry(event) {
    event.preventDefault();
    const title = entryTitle.trim();
    const amount = Number(entryAmount);
    if (!title || !Number.isFinite(amount) || amount <= 0) return;
    setFinance((current) => ({ ...current, entries: [{ id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, amount, type: entryType, cashPosted: false, createdAt: new Date().toISOString() }, ...(current.entries || [])] }));
    setEntryTitle(''); setEntryAmount('');
  }

  return <div className="fixed bottom-5 left-5 z-30">
    {open && <section aria-label="Keuangan klub dan sponsor" className="mb-3 max-h-[min(78vh,740px)] w-[min(430px,calc(100vw-2.5rem))] overflow-hidden rounded-2xl border border-white/10 bg-[#101721]/95 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <header className="border-b border-white/10 p-4"><p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Manajemen klub · {gameSave.club || 'Pilih klub'}</p><h2 className="mt-1 text-lg font-bold">Keuangan & pendapatan</h2>
        <div className="mt-3 grid grid-cols-2 gap-2"><div className="rounded-xl border border-white/[.07] bg-white/[.03] p-3"><p className="text-[9px] uppercase tracking-wide text-white/45">Kas game</p><strong className="mt-1 block text-sm">{euro(gameCash)}</strong></div><div className="rounded-xl border border-lime-200/15 bg-lime-200/[.04] p-3"><p className="text-[9px] uppercase tracking-wide text-white/45">Kas + catatan</p><strong className="mt-1 block text-sm text-lime-100">{euro(recordedBalance)}</strong></div></div>
        <div className="mt-2 grid grid-cols-3 gap-1 text-center text-[9px]"><div className="rounded-lg bg-white/[.03] p-2 text-white/45">Sponsor <b className="mt-0.5 block text-cyan-200">{euro(sponsorEarnings)}</b></div><div className="rounded-lg bg-white/[.03] p-2 text-white/45">Merchandise <b className="mt-0.5 block text-lime-200">{euro(merchandiseIncome)}</b></div><div className="rounded-lg bg-white/[.03] p-2 text-white/45">Tiket <b className="mt-0.5 block text-amber-100">{euro(ticketIncome)}</b></div></div>
      </header>
      <div className="max-h-[min(58vh,540px)] space-y-4 overflow-y-auto p-4">
        <section><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Penjualan merchandise</h3><span className="text-[9px] text-white/40">Jersey, kaos & aksesori</span></div>
          <form onSubmit={sellMerchandise} className="mt-2 grid grid-cols-2 gap-2">
            <label className="text-[9px] text-white/45">Produk<select aria-label="Produk merchandise" value={productId} onChange={(event) => { const selected = PRODUCTS.find((item) => item.id === event.target.value); setProductId(event.target.value); if (selected) setProductPrice(String(selected.price)); }} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white">{PRODUCTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label>
            <label className="text-[9px] text-white/45">Harga per item<input aria-label="Harga merchandise per item" type="number" min="1" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label>
            <label className="col-span-2 text-[9px] text-white/45">Jumlah terjual<input aria-label="Jumlah produk terjual" type="number" min="1" step="1" value={productQty} onChange={(event) => setProductQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label>
            <button type="submit" className="col-span-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Catat penjualan · {euro((Number(productQty) || 0) * (Number(productPrice) || 0))}</button>
          </form>
        </section>
        <section className="border-t border-white/10 pt-3"><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Tiket pertandingan</h3><span className="text-[9px] text-white/40">Kapasitas {capacity.toLocaleString('id-ID')} · tersedia {remainingMatchCapacity.toLocaleString('id-ID')}</span></div>
          <form onSubmit={sellMatchTickets} className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/45">Harga tiket<input aria-label="Harga tiket pertandingan" type="number" min="1" value={ticketPrice} onChange={(event) => setTicketPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label><label className="text-[9px] text-white/45">Jumlah tiket<input aria-label="Jumlah tiket pertandingan" type="number" min="1" step="1" value={ticketQty} onChange={(event) => setTicketQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label><button type="submit" className="col-span-2 rounded-lg border border-amber-200/15 bg-amber-100/[.06] px-3 py-2 text-xs font-bold text-amber-100">Catat tiket · {euro((Number(ticketQty) || 0) * (Number(ticketPrice) || 0))}</button></form>
          <div className="mt-3 rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="flex items-center justify-between"><h4 className="text-[11px] font-semibold">Langganan tiket musiman</h4><span className="text-[9px] text-white/40">{seasonSeats.toLocaleString('id-ID')} kursi terjual</span></div><form onSubmit={sellSeasonTickets} className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/45">Harga per musim<input aria-label="Harga langganan tiket musiman" type="number" min="1" value={seasonPrice} onChange={(event) => setSeasonPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label><label className="text-[9px] text-white/45">Jumlah langganan<input aria-label="Jumlah langganan tiket musiman" type="number" min="1" step="1" value={seasonQty} onChange={(event) => setSeasonQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white outline-none focus:border-lime-300/60" /></label><button type="submit" className="col-span-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/[.05]">Catat langganan · {euro((Number(seasonQty) || 0) * (Number(seasonPrice) || 0))}</button></form></div>
        </section>
        <section className="border-t border-white/10 pt-3"><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Kontrak sponsor</h3><span className="text-[9px] text-white/40">{activeSponsors.length} aktif</span></div>
          <form onSubmit={addSponsor} className="mt-2 grid grid-cols-2 gap-2"><label className="col-span-2 text-[9px] text-white/45">Kategori sponsor<select aria-label="Kategori sponsor" value={sponsorCategory} onChange={(event) => setSponsorCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white">{SPONSOR_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><input aria-label="Nama sponsor" value={sponsorName} onChange={(event) => setSponsorName(event.target.value)} placeholder="Nama perusahaan / merek" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs outline-none focus:border-lime-300/60" /><label className="text-[9px] text-white/45">Bayaran per laga<input aria-label="Bayaran sponsor per laga" type="number" min="1" value={weeklyValue} onChange={(event) => setWeeklyValue(event.target.value)} placeholder="EUR" className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><label className="text-[9px] text-white/45">Durasi (laga)<input aria-label="Durasi kontrak dalam laga" type="number" min="1" step="1" value={contractMatches} onChange={(event) => setContractMatches(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><button type="submit" className="col-span-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Tambah sponsor</button></form>
          <ul className="mt-2 space-y-1.5">{sponsorRows.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-2.5 py-2"><div className="min-w-0"><span className="inline-block rounded-full bg-cyan-300/10 px-1.5 py-0.5 text-[8px] font-bold text-cyan-200">{item.category || 'Sponsor umum'}</span><p className="mt-1 truncate text-xs font-semibold">{item.name}</p><p className="mt-0.5 text-[9px] text-white/45">{euro(item.weeklyValue)}/laga · {item.paidMatches}/{item.durationMatches} laga · tercatat {euro(item.earned)}</p></div><button type="button" onClick={() => endSponsor(item.id)} className="shrink-0 text-[10px] text-rose-200/70 hover:text-rose-200">Akhiri</button></li>)}{!sponsorRows.length && <li className="rounded-lg border border-dashed border-white/10 p-3 text-[10px] text-white/40">Belum ada kontrak sponsor.</li>}</ul>
        </section>
        <section className="border-t border-white/10 pt-3"><h3 className="text-xs font-bold">Catatan keuangan manual</h3><form onSubmit={addEntry} className="mt-2 grid grid-cols-2 gap-2"><input aria-label="Keterangan transaksi" value={entryTitle} onChange={(event) => setEntryTitle(event.target.value)} placeholder="Keterangan" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs outline-none focus:border-lime-300/60" /><select aria-label="Jenis transaksi" value={entryType} onChange={(event) => setEntryType(event.target.value)} className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white"><option>Pemasukan</option><option>Pengeluaran</option></select><input aria-label="Jumlah transaksi" type="number" min="1" value={entryAmount} onChange={(event) => setEntryAmount(event.target.value)} placeholder="Jumlah EUR" className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs outline-none focus:border-lime-300/60" /><button type="submit" className="col-span-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold hover:bg-white/[.05]">Simpan catatan</button></form>
          <ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">{(finance.entries || []).slice(0, 15).map((item) => <li key={item.id} className="flex justify-between gap-2 text-[10px]"><span className="truncate text-white/55">{item.title}{item.quantity ? ` · ${item.quantity} unit` : ''}</span><span className={item.type === 'Pemasukan' ? 'shrink-0 text-lime-200' : 'shrink-0 text-rose-200'}>{item.type === 'Pemasukan' ? '+' : '−'}{euro(item.amount)}</span></li>)}</ul>
        </section>
        {notice && <p role="status" className="rounded-lg border border-lime-200/15 bg-lime-200/[.05] px-3 py-2 text-[10px] text-lime-100">{notice}</p>}
        <p className="text-[9px] leading-relaxed text-white/35">Penjualan merchandise dan tiket menambah kas game. Kapasitas tiket dibatasi kapasitas stadion; langganan musiman memakai kursi yang sama sepanjang musim. Sponsor dihitung berdasarkan laga selesai dan catatan manual tidak mengubah saldo kas game.</p>
      </div>
    </section>}
    <button type="button" aria-expanded={open} aria-label={open ? 'Tutup keuangan klub' : 'Buka keuangan klub'} onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-[#17150f] px-4 py-3 text-sm font-bold text-amber-100 shadow-lg shadow-black/30 transition hover:-translate-y-0.5"><span aria-hidden="true">€</span> Keuangan</button>
  </div>;
}

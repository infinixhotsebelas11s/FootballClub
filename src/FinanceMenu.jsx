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
  'Sponsor umum', 'Sponsor jersey', 'Sponsor stadion', 'Sponsor baju latihan tim',
  'Sponsor minuman latihan', 'Sponsor gym', 'Sponsor merek alat gym',
];
const TOUR_DESTINATIONS = [
  { id: 'domestic', name: 'Tour domestik', cost: 180000, income: 390000, reputation: 1, friendlies: 2, description: 'Biaya perjalanan rendah, lawan lokal, risiko kecil.' },
  { id: 'southeast-asia', name: 'Tour Asia Tenggara', cost: 520000, income: 1040000, reputation: 3, friendlies: 3, description: 'Jangkauan suporter dan sponsor regional lebih luas.' },
  { id: 'east-asia', name: 'Tour Asia Timur', cost: 950000, income: 1780000, reputation: 5, friendlies: 3, description: 'Pendapatan komersial tinggi dengan biaya perjalanan lebih besar.' },
  { id: 'europe', name: 'Tour Eropa', cost: 1500000, income: 2550000, reputation: 7, friendlies: 4, description: 'Paparan internasional dan potensi pendapatan tertinggi, tetapi investasinya besar.' },
];
const TOUR_FOCUSES = [
  { id: 'commercial', name: 'Fokus komersial', costFactor: 1.08, incomeFactor: 1.3, reputation: 1, description: 'Maksimalkan tiket, merchandise, dan eksposur sponsor.' },
  { id: 'balanced', name: 'Seimbang', costFactor: 1, incomeFactor: 1, reputation: 2, description: 'Menjaga keseimbangan biaya, pertandingan, dan promosi.' },
  { id: 'training', name: 'Fokus latihan', costFactor: 0.92, incomeFactor: 0.78, reputation: 4, description: 'Biaya lebih hemat dan persiapan tim lebih baik, pemasukan lebih rendah.' },
];
const EMPTY_FINANCE = { sponsors: [], entries: [], seasonTicketsSold: 0, matchTicketsSold: {}, preseasonTours: [] };

function readJson(key, fallback) {
  try { const value = JSON.parse(localStorage.getItem(key) || 'null'); return value ?? fallback; } catch { return fallback; }
}
function saveFinance(value) {
  try { localStorage.setItem(FINANCE_KEY, JSON.stringify(value)); } catch { /* local save unavailable */ }
}
function saveGameCash(amount, reputationDelta = 0) {
  const save = readJson(SAVE_KEY, {});
  if (!save.clubChosen) return null;
  const updated = {
    ...save,
    cash: (Number(save.cash) || 0) + amount,
    reputation: Math.max(0, Math.min(100, (Number(save.reputation) || 0) + reputationDelta)),
  };
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
  const [tourDestination, setTourDestination] = useState(TOUR_DESTINATIONS[0].id);
  const [tourFocus, setTourFocus] = useState(TOUR_FOCUSES[1].id);
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
  const seasonMatches = Math.max(10, (allClubs.filter((club) => club.league === currentClub?.league && club.country === currentClub?.country).length - 1) * 2);
  const seasonNumber = Math.floor(completedMatches / seasonMatches) + 1;
  const seasonTour = (finance.preseasonTours || []).find((tour) => tour.club === gameSave.club && tour.seasonNumber === seasonNumber);
  const destination = TOUR_DESTINATIONS.find((item) => item.id === tourDestination) || TOUR_DESTINATIONS[0];
  const focus = TOUR_FOCUSES.find((item) => item.id === tourFocus) || TOUR_FOCUSES[1];
  const projectedCost = Math.round(destination.cost * focus.costFactor);
  const projectedIncome = Math.round(destination.income * focus.incomeFactor);
  const projectedNet = projectedIncome - projectedCost;

  function recordSale(title, category, amount, quantity, additionalFinance = {}) {
    if (!gameSave.clubChosen) return setNotice('Pilih klub terlebih dahulu.');
    const updatedSave = saveGameCash(amount);
    if (!updatedSave) return setNotice('Saldo kas game tidak dapat diperbarui.');
    const entry = { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, title, category, amount, quantity, type: 'Pemasukan', cashPosted: true, club: gameSave.club, matchWeek: Number(gameSave.week) || 1, createdAt: new Date().toISOString() };
    setGameSave(updatedSave);
    setFinance((current) => ({ ...current, ...additionalFinance, entries: [entry, ...(current.entries || [])] }));
    setNotice(`${title}: ${euro(amount)} masuk ke kas klub.`);
    window.setTimeout(() => setNotice(''), 3000);
  }
  function addSponsor(event) {
    event.preventDefault();
    const name = sponsorName.trim(); const amount = Number(weeklyValue); const duration = Math.floor(Number(contractMatches));
    if (!name || !Number.isFinite(amount) || amount <= 0 || !Number.isFinite(duration) || duration < 1) return;
    setFinance((current) => ({ ...current, sponsors: [...(current.sponsors || []), { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, name, category: sponsorCategory, weeklyValue: amount, durationMatches: duration, startAfterPlayed: completedMatches, createdAt: new Date().toISOString() }] }));
    setSponsorName(''); setWeeklyValue('');
  }
  function endSponsor(id) { setFinance((current) => ({ ...current, sponsors: (current.sponsors || []).filter((item) => item.id !== id) })); }
  function sellMerchandise(event) {
    event.preventDefault(); const quantity = Math.floor(Number(productQty)); const price = Number(productPrice);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga merchandise dengan benar.');
    recordSale(`Penjualan ${currentProduct.name} × ${quantity}`, 'Merchandise', quantity * price, quantity); setProductQty('1');
  }
  function sellMatchTickets(event) {
    event.preventDefault(); const quantity = Math.floor(Number(ticketQty)); const price = Number(ticketPrice);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga tiket dengan benar.');
    if (quantity > remainingMatchCapacity) return setNotice(`Kapasitas tersisa untuk laga ini ${remainingMatchCapacity.toLocaleString('id-ID')} kursi.`);
    recordSale(`Penjualan tiket pertandingan × ${quantity}`, 'Tiket', quantity * price, quantity, { matchTicketsSold: { ...(finance.matchTicketsSold || {}), [matchTicketKey]: matchSeats + quantity } }); setTicketQty('1');
  }
  function sellSeasonTickets(event) {
    event.preventDefault(); const quantity = Math.floor(Number(seasonQty)); const price = Number(seasonPrice); const remaining = Math.max(0, capacity - seasonSeats);
    if (!Number.isFinite(quantity) || quantity < 1 || !Number.isFinite(price) || price <= 0) return setNotice('Isi jumlah dan harga tiket musiman dengan benar.');
    if (quantity > remaining) return setNotice(`Kapasitas langganan tiket musiman tersisa ${remaining.toLocaleString('id-ID')} kursi.`);
    recordSale(`Langganan tiket musiman × ${quantity}`, 'Tiket Musiman', quantity * price, quantity, { seasonTicketsSold: seasonSeats + quantity }); setSeasonQty('1');
  }
  function startPreseasonTour() {
    if (!gameSave.clubChosen || !gameSave.club) return setNotice('Pilih klub terlebih dahulu.');
    if (seasonTour) return setNotice(`Klub sudah melakukan tour pramusim musim ${seasonNumber}.`);
    if (gameCash < projectedCost) return setNotice('Kas klub tidak cukup untuk membiayai tour ini. Pilih opsi yang lebih hemat.');
    const performance = Math.random();
    const outcomeFactor = performance < 0.2 ? 0.82 : performance > 0.82 ? 1.18 : 1;
    const income = Math.round(projectedIncome * outcomeFactor);
    const net = income - projectedCost;
    const reputationDelta = Math.max(0, Math.round(destination.reputation + focus.reputation + (performance > 0.65 ? 1 : 0)));
    const updatedSave = saveGameCash(net, reputationDelta);
    if (!updatedSave) return setNotice('Tour gagal dicatat ke save klub.');
    const tour = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      club: gameSave.club,
      seasonNumber,
      destination: destination.name,
      focus: focus.name,
      friendlyMatches: destination.friendlies,
      cost: projectedCost,
      income,
      net,
      reputationDelta,
      completedAt: new Date().toISOString(),
    };
    const expense = { id: `${tour.id}-cost`, title: `Biaya ${destination.name}`, category: 'Tour pramusim', amount: projectedCost, type: 'Pengeluaran', cashPosted: true, club: gameSave.club, createdAt: tour.completedAt };
    const revenue = { id: `${tour.id}-income`, title: `Pendapatan ${destination.name} · ${focus.name}`, category: 'Tour pramusim', amount: income, type: 'Pemasukan', cashPosted: true, club: gameSave.club, createdAt: tour.completedAt };
    setGameSave(updatedSave);
    setFinance((current) => ({ ...current, preseasonTours: [...(current.preseasonTours || []), tour], entries: [revenue, expense, ...(current.entries || [])] }));
    setNotice(`Tour ${destination.name} selesai: net ${euro(net)}, reputasi +${reputationDelta}.`);
    window.setTimeout(() => setNotice(''), 4500);
  }
  function addEntry(event) {
    event.preventDefault(); const title = entryTitle.trim(); const amount = Number(entryAmount);
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
        <section className="rounded-xl border border-cyan-200/10 bg-cyan-200/[.035] p-3"><div className="flex items-center justify-between gap-2"><div><h3 className="text-xs font-bold">Tour pramusim</h3><p className="mt-1 text-[9px] text-white/45">Pilih tujuan dan strategi; hasil finansial serta reputasi langsung diterapkan.</p></div><span className="rounded-full border border-white/10 px-2 py-1 text-[9px] text-white/45">Musim {seasonNumber}</span></div>
          {seasonTour ? <div className="mt-3 rounded-lg border border-lime-200/15 bg-lime-200/[.04] p-3"><p className="text-[10px] font-bold text-lime-100">Tour selesai · {seasonTour.destination}</p><p className="mt-1 text-[9px] text-white/55">{seasonTour.focus} · {seasonTour.friendlyMatches} laga persahabatan</p><div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-[9px]"><span className="text-white/45">Biaya {euro(seasonTour.cost)}</span><span className="text-white/45">Pemasukan {euro(seasonTour.income)}</span><b className={seasonTour.net >= 0 ? 'text-lime-200' : 'text-rose-200'}>Net {euro(seasonTour.net)}</b><span className="text-cyan-200">Reputasi +{seasonTour.reputationDelta}</span></div></div> : <>
            <div className="mt-3 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/50">Tujuan<select aria-label="Tujuan tour pramusim" value={tourDestination} onChange={(event) => setTourDestination(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-[10px] text-white">{TOUR_DESTINATIONS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-[9px] text-white/50">Strategi<select aria-label="Strategi tour pramusim" value={tourFocus} onChange={(event) => setTourFocus(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-[10px] text-white">{TOUR_FOCUSES.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label></div>
            <p className="mt-2 text-[9px] leading-relaxed text-white/45">{destination.description} {focus.description}</p>
            <div className="mt-2 grid grid-cols-2 gap-1 text-[9px]"><span className="rounded-lg bg-white/[.03] p-2 text-white/55">Biaya {euro(projectedCost)}</span><span className="rounded-lg bg-white/[.03] p-2 text-white/55">Estimasi pemasukan {euro(projectedIncome)}</span><span className={`col-span-2 rounded-lg p-2 font-bold ${projectedNet >= 0 ? 'bg-lime-200/[.06] text-lime-200' : 'bg-rose-200/[.06] text-rose-200'}`}>Estimasi net {euro(projectedNet)} · {destination.friendlies} laga persahabatan · reputasi +{destination.reputation + focus.reputation}</span></div>
            <p className="mt-2 text-[9px] text-white/35">Hasil aktual dapat berubah sekitar ±18%. Satu tour per musim; musim simulasi mengikuti jumlah laga liga.</p>
            <button type="button" onClick={startPreseasonTour} className="mt-2 w-full rounded-lg bg-cyan-200 px-3 py-2 text-xs font-bold text-[#081114]">Jalankan tour pramusim · biaya {euro(projectedCost)}</button>
          </>}</section>
        <section><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Penjualan merchandise</h3><span className="text-[9px] text-white/40">Jersey, kaos & aksesori</span></div>
          <form onSubmit={sellMerchandise} className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/45">Produk<select aria-label="Produk merchandise" value={productId} onChange={(event) => { const selected = PRODUCTS.find((item) => item.id === event.target.value); setProductId(event.target.value); if (selected) setProductPrice(String(selected.price)); }} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white">{PRODUCTS.map((item) => <option key={item.id} value={item.id}>{item.name}</option>)}</select></label><label className="text-[9px] text-white/45">Harga per item<input aria-label="Harga merchandise per item" type="number" min="1" value={productPrice} onChange={(event) => setProductPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><label className="col-span-2 text-[9px] text-white/45">Jumlah terjual<input aria-label="Jumlah produk terjual" type="number" min="1" value={productQty} onChange={(event) => setProductQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><button type="submit" className="col-span-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Catat penjualan · {euro((Number(productQty) || 0) * (Number(productPrice) || 0))}</button></form>
        </section>
        <section className="border-t border-white/10 pt-3"><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Tiket pertandingan</h3><span className="text-[9px] text-white/40">Kapasitas {capacity.toLocaleString('id-ID')} · tersedia {remainingMatchCapacity.toLocaleString('id-ID')}</span></div><form onSubmit={sellMatchTickets} className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/45">Harga tiket<input aria-label="Harga tiket pertandingan" type="number" min="1" value={ticketPrice} onChange={(event) => setTicketPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><label className="text-[9px] text-white/45">Jumlah tiket<input aria-label="Jumlah tiket pertandingan" type="number" min="1" value={ticketQty} onChange={(event) => setTicketQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><button type="submit" className="col-span-2 rounded-lg border border-amber-200/15 bg-amber-100/[.06] px-3 py-2 text-xs font-bold text-amber-100">Catat tiket · {euro((Number(ticketQty) || 0) * (Number(ticketPrice) || 0))}</button></form>
          <div className="mt-3 rounded-xl border border-white/[.06] bg-white/[.025] p-3"><div className="flex items-center justify-between"><h4 className="text-[11px] font-semibold">Langganan tiket musiman</h4><span className="text-[9px] text-white/40">{seasonSeats.toLocaleString('id-ID')} kursi terjual</span></div><form onSubmit={sellSeasonTickets} className="mt-2 grid grid-cols-2 gap-2"><label className="text-[9px] text-white/45">Harga per musim<input aria-label="Harga langganan tiket musiman" type="number" min="1" value={seasonPrice} onChange={(event) => setSeasonPrice(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><label className="text-[9px] text-white/45">Jumlah langganan<input aria-label="Jumlah langganan tiket musiman" type="number" min="1" value={seasonQty} onChange={(event) => setSeasonQty(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><button type="submit" className="col-span-2 rounded-lg border border-white/10 px-3 py-2 text-xs font-semibold">Catat langganan · {euro((Number(seasonQty) || 0) * (Number(seasonPrice) || 0))}</button></form></div>
        </section>
        <section className="border-t border-white/10 pt-3"><div className="flex items-center justify-between"><h3 className="text-xs font-bold">Kontrak sponsor</h3><span className="text-[9px] text-white/40">{activeSponsors.length} aktif</span></div><form onSubmit={addSponsor} className="mt-2 grid grid-cols-2 gap-2"><label className="col-span-2 text-[9px] text-white/45">Kategori sponsor<select aria-label="Kategori sponsor" value={sponsorCategory} onChange={(event) => setSponsorCategory(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white">{SPONSOR_CATEGORIES.map((category) => <option key={category}>{category}</option>)}</select></label><input aria-label="Nama sponsor" value={sponsorName} onChange={(event) => setSponsorName(event.target.value)} placeholder="Nama perusahaan / merek" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs" /><label className="text-[9px] text-white/45">Bayaran per laga<input aria-label="Bayaran sponsor per laga" type="number" min="1" value={weeklyValue} onChange={(event) => setWeeklyValue(event.target.value)} placeholder="EUR" className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><label className="text-[9px] text-white/45">Durasi (laga)<input aria-label="Durasi kontrak dalam laga" type="number" min="1" value={contractMatches} onChange={(event) => setContractMatches(event.target.value)} className="mt-1 w-full rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white" /></label><button type="submit" className="col-span-2 rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Tambah sponsor</button></form>
          <ul className="mt-2 space-y-1.5">{sponsorRows.map((item) => <li key={item.id} className="flex items-center justify-between gap-2 rounded-lg border border-white/[.06] bg-white/[.025] px-2.5 py-2"><div className="min-w-0"><span className="inline-block rounded-full bg-cyan-300/10 px-1.5 py-0.5 text-[8px] font-bold text-cyan-200">{item.category || 'Sponsor umum'}</span><p className="mt-1 truncate text-xs font-semibold">{item.name}</p><p className="text-[9px] text-white/45">{euro(item.weeklyValue)}/laga · {item.paidMatches}/{item.durationMatches} laga · {euro(item.earned)}</p></div><button type="button" onClick={() => endSponsor(item.id)} className="text-[10px] text-rose-200/70">Akhiri</button></li>)}</ul>
        </section>
        <section className="border-t border-white/10 pt-3"><h3 className="text-xs font-bold">Catatan keuangan manual</h3><form onSubmit={addEntry} className="mt-2 grid grid-cols-2 gap-2"><input aria-label="Keterangan transaksi" value={entryTitle} onChange={(event) => setEntryTitle(event.target.value)} placeholder="Keterangan" className="col-span-2 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs" /><select aria-label="Jenis transaksi" value={entryType} onChange={(event) => setEntryType(event.target.value)} className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs text-white"><option>Pemasukan</option><option>Pengeluaran</option></select><input aria-label="Jumlah transaksi" type="number" min="1" value={entryAmount} onChange={(event) => setEntryAmount(event.target.value)} placeholder="Jumlah EUR" className="rounded-lg border border-white/10 bg-[#080d14] px-2 py-2 text-xs" /><button type="submit" className="col-span-2 rounded-lg border border-white/10 px-3 py-2 text-xs">Simpan catatan</button></form><ul className="mt-2 max-h-32 space-y-1 overflow-y-auto">{(finance.entries || []).slice(0, 15).map((item) => <li key={item.id} className="flex justify-between gap-2 text-[10px]"><span className="truncate text-white/55">{item.title}</span><span className={item.type === 'Pemasukan' ? 'text-lime-200' : 'text-rose-200'}>{item.type === 'Pemasukan' ? '+' : '−'}{euro(item.amount)}</span></li>)}</ul></section>
        {notice && <p role="status" className="rounded-lg border border-lime-200/15 bg-lime-200/[.05] px-3 py-2 text-[10px] text-lime-100">{notice}</p>}
        <p className="text-[9px] leading-relaxed text-white/35">Tour pramusim dapat dilakukan satu kali per musim simulasi. Biaya, pemasukan, reputasi, dan riwayat dicatat; hasil dapat bervariasi.</p>
      </div>
    </section>}
    <button type="button" aria-expanded={open} aria-label={open ? 'Tutup keuangan klub' : 'Buka keuangan klub'} onClick={() => setOpen((value) => !value)} className="flex items-center gap-2 rounded-full border border-amber-200/20 bg-[#17150f] px-4 py-3 text-sm font-bold text-amber-100 shadow-lg shadow-black/30 transition hover:-translate-y-0.5"><span aria-hidden="true">€</span> Keuangan</button>
  </div>;
}

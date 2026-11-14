import React, { useEffect, useMemo, useState } from 'react';
import { fifaCalendarEvents } from '../fifa-calendar.js';

const WEEKDAYS = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const STORAGE_KEY = 'football-club-calendar-events';
const dateKey = (date) => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
const readableDate = (key) => new Date(`${key}T12:00:00`).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

function loadEvents() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
    return saved && typeof saved === 'object' && !Array.isArray(saved) ? saved : {};
  } catch {
    return {};
  }
}

function occursOn(event, key) {
  return key >= event.startDate && key <= event.endDate;
}

export default function CalendarMenu() {
  const today = new Date();
  const [open, setOpen] = useState(false);
  const [month, setMonth] = useState(() => new Date(today.getFullYear(), today.getMonth(), 1));
  const [selectedDate, setSelectedDate] = useState(() => dateKey(today));
  const [events, setEvents] = useState(loadEvents);
  const [eventTitle, setEventTitle] = useState('');
  const [filter, setFilter] = useState('Semua');

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(events)); } catch { /* local save unavailable */ }
  }, [events]);

  const days = useMemo(() => {
    const firstWeekday = (new Date(month.getFullYear(), month.getMonth(), 1).getDay() + 6) % 7;
    const dayCount = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
    return [...Array(firstWeekday).fill(null), ...Array.from({ length: dayCount }, (_, index) => index + 1)];
  }, [month]);
  const monthLabel = month.toLocaleDateString('id-ID', { month: 'long', year: 'numeric' });
  const personalEvents = (events[selectedDate] || []).map((item) => ({ ...item, category: 'Agenda saya', personal: true }));
  const fifaEvents = fifaCalendarEvents.filter((item) => occursOn(item, selectedDate));
  const selectedEvents = [...fifaEvents, ...personalEvents].filter((item) => filter === 'Semua' || item.category === filter);
  const filters = ['Semua', 'Agenda saya', 'Turnamen FIFA', 'FIFA Matchday'];

  function changeMonth(offset) {
    setMonth((current) => new Date(current.getFullYear(), current.getMonth() + offset, 1));
  }
  function goToToday() {
    const now = new Date();
    setMonth(new Date(now.getFullYear(), now.getMonth(), 1));
    setSelectedDate(dateKey(now));
  }
  function addEvent(event) {
    event.preventDefault();
    const title = eventTitle.trim();
    if (!title) return;
    setEvents((current) => ({ ...current, [selectedDate]: [...(current[selectedDate] || []), { id: `${Date.now()}-${Math.random()}`, title }] }));
    setEventTitle('');
  }
  function removeEvent(id) {
    setEvents((current) => {
      const remaining = (current[selectedDate] || []).filter((item) => item.id !== id);
      const next = { ...current };
      if (remaining.length) next[selectedDate] = remaining;
      else delete next[selectedDate];
      return next;
    });
  }

  return <div className="fixed bottom-5 right-5 z-30">
    {open && <section aria-label="Kalender klub dan FIFA" className="mb-3 w-[min(390px,calc(100vw-2.5rem))] rounded-2xl border border-white/10 bg-[#101721]/95 p-4 text-white shadow-2xl shadow-black/50 backdrop-blur-xl">
      <div className="flex items-center justify-between gap-3">
        <div><p className="text-[10px] font-bold uppercase tracking-[.2em] text-lime-200">Jadwal klub & FIFA</p><h2 className="mt-1 text-lg font-bold capitalize">{monthLabel}</h2></div>
        <div className="flex gap-1">
          <button type="button" aria-label="Bulan sebelumnya" onClick={() => changeMonth(-1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/10">‹</button>
          <button type="button" aria-label="Bulan berikutnya" onClick={() => changeMonth(1)} className="grid h-9 w-9 place-items-center rounded-lg border border-white/10 hover:bg-white/10">›</button>
        </div>
      </div>
      <div className="mt-4 grid grid-cols-7 gap-1 text-center">
        {WEEKDAYS.map((day) => <span key={day} className="py-1 text-[10px] font-semibold text-white/40">{day}</span>)}
        {days.map((day, index) => {
          if (!day) return <span key={`blank-${index}`} />;
          const key = dateKey(new Date(month.getFullYear(), month.getMonth(), day));
          const isToday = key === dateKey(new Date());
          const isSelected = key === selectedDate;
          const hasFifa = fifaCalendarEvents.some((item) => occursOn(item, key));
          const hasPersonal = Boolean(events[key]?.length);
          return <button type="button" key={key} aria-label={`${day} ${monthLabel}${hasFifa ? ', ada jadwal FIFA' : ''}${hasPersonal ? ', ada agenda klub' : ''}`} aria-pressed={isSelected} onClick={() => setSelectedDate(key)} className={`relative grid h-9 place-items-center rounded-lg text-xs transition ${isSelected ? 'bg-lime-300 font-bold text-[#10150a]' : 'text-white/75 hover:bg-white/10'} ${isToday && !isSelected ? 'ring-1 ring-lime-300/70' : ''}`}>
            {day}{(hasFifa || hasPersonal) && <span className={`absolute bottom-1 h-1 w-1 rounded-full ${isSelected ? 'bg-[#10150a]' : hasFifa ? 'bg-cyan-300' : 'bg-lime-300'}`} />}
          </button>;
        })}
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex flex-wrap gap-1" role="group" aria-label="Filter kalender">
          {filters.map((item) => <button key={item} type="button" aria-pressed={filter === item} onClick={() => setFilter(item)} className={`rounded-full px-2 py-1 text-[10px] font-semibold ${filter === item ? 'bg-white/15 text-white' : 'text-white/45 hover:text-white/80'}`}>{item}</button>)}
        </div>
        <button type="button" onClick={goToToday} className="shrink-0 rounded-lg border border-white/10 px-2 py-1 text-[10px] text-white/65 hover:bg-white/10">Hari ini</button>
      </div>
      <div className="mt-3 border-t border-white/10 pt-3">
        <h3 className="text-xs font-bold capitalize text-white/80">{readableDate(selectedDate)}</h3>
        <ul className="mt-2 max-h-36 space-y-1.5 overflow-y-auto">
          {selectedEvents.map((item) => <li key={item.id} className="rounded-lg border border-white/[.06] bg-white/[.035] px-2.5 py-2 text-xs">
            <div className="flex items-start justify-between gap-2"><div className="min-w-0"><span className={`mb-1 inline-block rounded-full px-1.5 py-0.5 text-[9px] font-bold ${item.personal ? 'bg-lime-300/10 text-lime-200' : item.category === 'FIFA Matchday' ? 'bg-cyan-300/10 text-cyan-200' : 'bg-sky-300/10 text-sky-200'}`}>{item.category}</span><p className="break-words font-semibold">{item.title}</p>{item.detail && <p className="mt-1 text-[10px] leading-relaxed text-white/45">{item.detail}</p>}</div>
              {item.personal && <button type="button" aria-label={`Hapus agenda ${item.title}`} onClick={() => removeEvent(item.id)} className="shrink-0 text-white/40 hover:text-rose-300">×</button>}
            </div>
            {item.source && <a href={item.source} target="_blank" rel="noreferrer" className="mt-1 inline-block text-[10px] text-cyan-200/70 underline decoration-white/20 underline-offset-2 hover:text-cyan-100">Sumber FIFA</a>}
          </li>)}
          {!selectedEvents.length && <li className="text-xs text-white/40">Tidak ada jadwal dalam filter ini.</li>}
        </ul>
        <form onSubmit={addEvent} className="mt-3 flex gap-2">
          <input aria-label="Agenda klub baru" value={eventTitle} onChange={(event) => setEventTitle(event.target.value)} placeholder="Tambah agenda klub..." className="min-w-0 flex-1 rounded-lg border border-white/10 bg-[#080d14] px-3 py-2 text-xs text-white outline-none focus:border-lime-300/60" />
          <button type="submit" className="rounded-lg bg-lime-300 px-3 py-2 text-xs font-bold text-[#10150a]">Tambah</button>
        </form>
      </div>
      <p className="mt-2 text-[9px] text-white/30">Jadwal FIFA menampilkan rentang turnamen dan Matchday, bukan waktu kickoff tiap laga.</p>
    </section>}
    <button type="button" aria-expanded={open} aria-label={open ? 'Tutup kalender' : 'Buka kalender'} onClick={() => setOpen((value) => !value)} className="ml-auto flex items-center gap-2 rounded-full border border-lime-200/30 bg-lime-300 px-4 py-3 text-sm font-bold text-[#10150a] shadow-lg shadow-black/30 transition hover:-translate-y-0.5">
      <span aria-hidden="true">▦</span> Kalender
    </button>
  </div>;
}

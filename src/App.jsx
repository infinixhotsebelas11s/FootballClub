import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players, leagues, dataStatus } from '../database.js';
import { fifaClubWorldCupClubs, fifaClubWorldCupEditions, fifaClubWorldCupMetadata } from '../fifa-club-world-cup.js';

const ROLES = ['Asisten Pelatih', 'Manajer', 'Direktur Teknik', 'Direktur Olahraga', 'CEO', 'Presiden Klub', 'Pemilik Klub'];
const CONTINENTS = ['Asia', 'Afrika', 'Eropa', 'Amerika Utara', 'Amerika Selatan', 'Oseania'];
const CONTINENT_BY_COUNTRY = {
  'England': 'Eropa', 'Spain': 'Eropa', 'Italy': 'Eropa', 'Germany': 'Eropa', 'France': 'Eropa', 'Netherlands': 'Eropa',
  'Portugal': 'Eropa', 'Belgium': 'Eropa', 'Turkey': 'Eropa', 'Scotland': 'Eropa', 'Ireland': 'Eropa', 'Austria': 'Eropa',
  'Greece': 'Eropa', 'Poland': 'Eropa', 'Croatia': 'Eropa', 'Sweden': 'Eropa', 'Norway': 'Eropa', 'Denmark': 'Eropa',
  'Czech Republic': 'Eropa', 'Switzerland': 'Eropa', 'Serbia': 'Eropa', 'Ukraine': 'Eropa', 'Wales': 'Eropa',
  'Brazil': 'Amerika Selatan', 'Argentina': 'Amerika Selatan', 'Colombia': 'Amerika Selatan', 'Chile': 'Amerika Selatan',
  'Uruguay': 'Amerika Selatan', 'Peru': 'Amerika Selatan', 'Paraguay': 'Amerika Selatan', 'Ecuador': 'Amerika Selatan',
  'Venezuela': 'Amerika Selatan', 'Bolivia': 'Amerika Selatan', 'Mexico': 'Amerika Utara', 'United States': 'Amerika Utara',
  'Canada': 'Amerika Utara', 'Costa Rica': 'Amerika Utara', 'Honduras': 'Amerika Utara', 'Panama': 'Amerika Utara',
  'Guatemala': 'Amerika Utara', 'Jamaica': 'Amerika Utara', 'Japan': 'Asia', 'South Korea': 'Asia', 'China': 'Asia',
  'Saudi Arabia': 'Asia', 'United Arab Emirates': 'Asia', 'Qatar': 'Asia', 'Indonesia': 'Asia', 'Thailand': 'Asia',
  'Vietnam': 'Asia', 'Malaysia': 'Asia', 'Singapore': 'Asia', 'India': 'Asia', 'Iran': 'Asia', 'Iraq': 'Asia',
  'Jordan': 'Asia', 'Lebanon': 'Asia', 'Oman': 'Asia', 'Uzbekistan': 'Asia', 'Kazakhstan': 'Asia', 'Philippines': 'Asia',
  'Australia': 'Oseania', 'New Zealand': 'Oseania', 'South Africa': 'Afrika', 'Morocco': 'Afrika', 'Egypt': 'Afrika',
  'Tunisia': 'Afrika', 'Algeria': 'Afrika', 'Nigeria': 'Afrika', 'Senegal': 'Afrika', 'Ghana': 'Afrika',
  'Ivory Coast': 'Afrika', 'Cameroon': 'Afrika', 'Angola': 'Afrika', 'DR Congo': 'Afrika', 'Tanzania': 'Afrika',
  'Kenya': 'Afrika', 'Zambia': 'Afrika', 'Mali': 'Afrika', 'Guinea': 'Afrika', 'Uganda': 'Afrika', 'Sudan': 'Afrika',
  'New Caledonia': 'Oseania', 'French Polynesia': 'Oseania', 'Fiji': 'Oseania', 'Papua New Guinea': 'Oseania',
};

const INITIAL = {
  role: 'Manajer',
  managerName: 'Manajer',
  club: 'Persib Bandung',
  cash: 2000000,
  reputation: 42,
  week: 1,
  played: 0,
  wins: 0,
  draws: 0,
  losses: 0,
  points: 0,
  squad: [],
  selectedContinent: '',
  selectedCountry: '',
  selectedDivision: 1,
};

const slug = (value) => String(value || '')
  .toLowerCase()
  .normalize('NFD')
  .replace(/[\u0300-\u036f]/g, '')
  .replace(/[^a-z0-9]+/g, '-')
  .replace(/(^-|-$)/g, '');

const selectClass = 'w-full rounded-xl border border-white/10 bg-[#0b100c] px-3 py-2.5 text-sm text-white outline-none focus:border-lime-300/60';
const cardClass = 'rounded-2xl border border-white/10 bg-[#0b100c] p-4';

function readGame() {
  try {
    const saved = JSON.parse(localStorage.getItem('touchline-save') || '{}');
    return { ...INITIAL, ...saved };
  } catch {
    return { ...INITIAL };
  }
}

export default function App() {
  const [game, setGame] = useState(() => readGame());
  const [page, setPage] = useState('Pilih Klub');
  const [continent, setContinent] = useState(game.selectedContinent || '');
  const [country, setCountry] = useState(game.selectedCountry || '');
  const [division, setDivision] = useState(String(game.selectedDivision || 1));
  const [notice, setNotice] = useState('');

  const allClubs = useMemo(() => {
    const map = new Map();
    for (const club of [...clubs, ...fifaClubWorldCupClubs]) {
      const id = slug(club.id || club.name);
      map.set(id, { ...map.get(id), ...club, id });
    }
    return [...map.values()].sort((a, b) => `${a.country || ''}|${a.league || ''}|${a.name || ''}`.localeCompare(`${b.country || ''}|${b.league || ''}|${b.name || ''}`));
  }, []);

  const continentsInData = useMemo(
    () => CONTINENTS.filter((item) => allClubs.some((club) => CONTINENT_BY_COUNTRY[club.country] === item)),
    [allClubs],
  );

  useEffect(() => {
    if (!continent && continentsInData[0]) {
      setContinent(continentsInData[0]);
    }
  }, [continent, continentsInData]);

  const selectedContinent = continent || continentsInData[0] || '';

  const countries = useMemo(
    () => [...new Set(allClubs.filter((club) => CONTINENT_BY_COUNTRY[club.country] === selectedContinent).map((club) => club.country))].sort(),
    [allClubs, selectedContinent],
  );

  useEffect(() => {
    if (!country && countries[0]) {
      setCountry(countries[0]);
    }
  }, [country, countries]);

  const selectedCountry = country || countries[0] || '';

  const divisions = useMemo(() => {
    const values = allClubs
      .filter((club) => club.country === selectedCountry)
      .map((club) => Number(club.division ?? 1))
      .filter((item) => Number.isFinite(item) && item > 0)
      .sort((a, b) => a - b);
    return [...new Set(values)].slice(0, 4);
  }, [allClubs, selectedCountry]);

  useEffect(() => {
    if (!division && divisions[0]) {
      setDivision(String(divisions[0]));
    }
  }, [division, divisions]);

  const selectedDivision = Number(division || divisions[0] || 1);

  const availableClubs = useMemo(
    () => allClubs
      .filter((club) => {
        if (selectedContinent && CONTINENT_BY_COUNTRY[club.country] !== selectedContinent) return false;
        if (selectedCountry && club.country !== selectedCountry) return false;
        const clubDivision = Number(club.division ?? 1);
        if (selectedDivision && clubDivision !== selectedDivision) return false;
        return true;
      })
      .sort((a, b) => a.name.localeCompare(b.name)),
    [allClubs, selectedContinent, selectedCountry, selectedDivision],
  );

  const currentClub = allClubs.find((club) => club.name === game.club) || allClubs[0];
  const squadPlayers = players.filter((player) => player.club === game.club || player.club === currentClub?.name);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('touchline-save', JSON.stringify(game));
    }
  }, [game]);

  function selectContinent(value) {
    setContinent(value);
    setCountry('');
    setDivision('1');
  }

  function selectCountry(value) {
    setCountry(value);
    setDivision('1');
  }

  function selectDivision(value) {
    setDivision(String(value));
  }

  function chooseClub(chosen) {
    const newSquad = players.filter((player) => player.club === chosen.name).map((player) => player.id);
    setGame((previous) => ({
      ...previous,
      club: chosen.name,
      squad: newSquad,
      selectedContinent: selectedContinent,
      selectedCountry: selectedCountry,
      selectedDivision: selectedDivision,
    }));
    setNotice(`${chosen.name} dipilih sebagai klub kamu.`);
  }

  function playMatch() {
    setGame((previous) => ({
      ...previous,
      week: previous.week + 1,
      played: previous.played + 1,
      points: previous.points + 3,
      wins: previous.wins + 1,
      reputation: Math.min(100, previous.reputation + 2),
    }));
    setNotice('Simulasi pertandingan selesai. Kamu menang dan reputasi naik.');
  }

  function resetSave() {
    localStorage.removeItem('touchline-save');
    setGame({ ...INITIAL });
    setNotice('Data game berhasil direset.');
  }

  return (
    <div className="min-h-screen bg-[#090c0a] text-white">
      <header className="sticky top-0 z-10 border-b border-white/10 bg-[#090c0a]/95 px-4 py-4 backdrop-blur">
        <div className="mx-auto flex max-w-6xl items-center justify-between gap-4">
          <div>
            <p className="text-[10px] uppercase tracking-[0.2em] text-lime-300">Football Club Manager</p>
            <h1 className="text-xl font-bold">{currentClub?.name || 'Pilih klub'}</h1>
          </div>
          <div className="text-right text-sm text-white/70">
            <div>Cash: €{Number(game.cash || 0).toLocaleString('en-US')}</div>
            <div>Reputasi: {game.reputation}</div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <nav className="mb-6 flex flex-wrap gap-2">
          {['Pilih Klub', 'Piala Dunia Antarklub', 'Status Liga', 'Taktik'].map((item) => (
            <button
              key={item}
              type="button"
              onClick={() => setPage(item)}
              className={`rounded-full border px-3 py-2 text-sm ${page === item ? 'border-lime-300/60 bg-lime-300/15 text-lime-200' : 'border-white/10 bg-[#0b100c] text-white/75'}`}
            >
              {item}
            </button>
          ))}
        </nav>

        {notice && (
          <div className="mb-4 rounded-xl border border-lime-300/30 bg-lime-300/10 px-3 py-2 text-sm text-lime-100">
            {notice}
          </div>
        )}

        {page === 'Pilih Klub' && (
          <section className={cardClass}>
            <h2 className="text-2xl font-bold">Pilih klub</h2>
            <p className="mt-1 text-sm text-white/60">Pilih benua, negara, divisi, lalu klub. Hanya klub yang ada dalam dataset yang ditampilkan.</p>

            <div className="mt-5 grid gap-3 md:grid-cols-3">
              <label className="text-sm text-white/75">
                1. Benua
                <select className={selectClass} value={selectedContinent} onChange={(event) => selectContinent(event.target.value)}>
                  {continentsInData.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/75">
                2. Negara
                <select className={selectClass} value={selectedCountry} onChange={(event) => selectCountry(event.target.value)}>
                  {countries.map((item) => (
                    <option key={item} value={item}>{item}</option>
                  ))}
                </select>
              </label>

              <label className="text-sm text-white/75">
                3. Divisi (maksimal 4)
                <select className={selectClass} value={selectedDivision} onChange={(event) => selectDivision(event.target.value)}>
                  {divisions.map((tier) => (
                    <option key={tier} value={tier}>Divisi {tier}</option>
                  ))}
                </select>
              </label>
            </div>

            <div className="mt-6 flex items-center justify-between gap-3">
              <h3 className="text-lg font-semibold">4. Pilih klub · {availableClubs.length} tersedia</h3>
              <span className="text-xs text-white/45">Klub saat ini: {game.club}</span>
            </div>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
              {availableClubs.length ? (
                availableClubs.map((item) => (
                  <button
                    key={item.id || item.name}
                    type="button"
                    onClick={() => chooseClub(item)}
                    className={`rounded-xl border p-4 text-left ${item.name === game.club ? 'border-lime-300/50 bg-lime-300/10' : 'border-white/10 bg-[#0b100c] hover:border-lime-300/30'}`}
                  >
                    <span className="block font-semibold">{item.name}</span>
                    <span className="mt-1 block text-xs text-white/60">{item.league} · {item.country}</span>
                    <span className="mt-2 block text-[11px] text-white/45">
                      {item.fifaClubWorldCupEditions?.length ? `Peserta CWC: ${item.fifaClubWorldCupEditions.join(', ')}` : item.dataSource || 'Data klub tersedia'}
                    </span>
                  </button>
                ))
              ) : (
                <p className="text-sm text-white/50">Tidak ada klub yang cocok dengan filter saat ini.</p>
              )}
            </div>
          </section>
        )}

        {page === 'Piala Dunia Antarklub' && (
          <section className={cardClass}>
            <h2 className="text-2xl font-bold">Piala Dunia Antarklub</h2>
            <p className="mt-2 text-sm text-white/55">
              Peserta historis terdata: {fifaClubWorldCupMetadata.participantCount}. Edisi: {fifaClubWorldCupEditions.join(', ')}.
            </p>

            <div className="mt-4 grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {fifaClubWorldCupClubs.map((item) => (
                <div key={`${item.id}-${item.name}`} className="rounded-xl border border-white/10 bg-[#0b100c] p-3">
                  <div className="font-semibold">{item.name}</div>
                  <div className="text-xs text-white/50">{item.country} · {item.league}</div>
                  <div className="mt-2 text-xs text-lime-200">Edisi: {item.fifaClubWorldCupEditions.join(', ')}</div>
                </div>
              ))}
            </div>
          </section>
        )}

        {page === 'Status Liga' && (
          <section className="grid gap-4 md:grid-cols-2">
            <div className={cardClass}>
              <h3 className="text-lg font-bold">Status data</h3>
              <ul className="mt-3 space-y-2 text-sm text-white/70">
                <li>Season: {dataStatus.season}</li>
                <li>Source: {dataStatus.source}</li>
                <li>Clubs generated: {dataStatus.generatedClubCount || clubs.length}</li>
                <li>Players generated: {dataStatus.generatedPlayerCount || players.length}</li>
              </ul>
            </div>

            <div className={cardClass}>
              <h3 className="text-lg font-bold">Ringkasan musim</h3>
              <div className="mt-3 space-y-2 text-sm text-white/75">
                <div>Poin: {game.points}</div>
                <div>Menang: {game.wins}</div>
                <div>Seri: {game.draws}</div>
                <div>Kalah: {game.losses}</div>
                <div>Minggu: {game.week}</div>
              </div>
            </div>
          </section>
        )}

        {page === 'Taktik' && (
          <section className={cardClass}>
            <h2 className="text-2xl font-bold">Taktik</h2>
            <div className="mt-4 flex flex-wrap gap-3">
              <button type="button" onClick={playMatch} className="rounded-xl bg-lime-300 px-4 py-2 text-sm font-semibold text-black">Mainkan pertandingan</button>
              <button type="button" onClick={resetSave} className="rounded-xl border border-white/10 bg-[#111814] px-4 py-2 text-sm text-white/80">Reset save</button>
            </div>
            <div className="mt-5 rounded-xl border border-white/10 bg-[#0b100c] p-4 text-sm text-white/70">
              <div>Klub aktif: {game.club}</div>
              <div>Skuad terdaftar: {squadPlayers.length} pemain</div>
              <div>Posisi: {game.role}</div>
            </div>
          </section>
        )}
      </main>
    </div>
  );
}

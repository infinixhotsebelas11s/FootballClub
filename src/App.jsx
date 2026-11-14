import React, { useEffect, useMemo, useState } from 'react';
import { clubs, players } from '../database.js';

const roles = [
  'Asisten Pelatih',
  'Manajer',
  'Direktur Teknik',
  'Direktur Olahraga',
  'CEO',
  'Presiden Klub',
  'Pemilik Klub'
];

const initialSave = {
  club: 'Persib Bandung',
  role: 'Manajer',
  cash: 2000000,
  rep: 42,
  season: 2024,
  week: 1,
  squad: ['marc-klok', 'rizky-ridho', 'sandy-walsh', 'muhammad-ferrari', 'hizkia-arthur']
};

function readSave() {
  try {
    const saved = JSON.parse(localStorage.getItem('footballclub-save') || '{}');
    return { ...initialSave, ...saved };
  } catch {
    return { ...initialSave };
  }
}

function formatMoney(value) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0
  }).format(value || 0);
}

const controlStyle = {
  width: '100%',
  marginTop: 8,
  background: '#0d1a14',
  color: '#f5f7f5',
  border: '1px solid #31513e',
  borderRadius: 10,
  padding: '12px',
  fontSize: 15
};

export default function App() {
  const [game, setGame] = useState(readSave);
  const [toast, setToast] = useState('');

  useEffect(() => {
    try {
      localStorage.setItem('footballclub-save', JSON.stringify(game));
    } catch {
      // The game remains playable if browser storage is unavailable.
    }
  }, [game]);

  const club = clubs.find((c) => c.name === game.club) || clubs[0];
  const team = useMemo(
    () => players.filter((p) => game.squad.includes(p.id)),
    [game.squad]
  );

  const leagueClubs = useMemo(
    () => clubs.filter((c) => c.league === club.league),
    [club.league]
  );

  const transferList = useMemo(
    () => players.filter((p) => p.club !== club.name).slice(0, 8),
    [club.name]
  );

  function notify(message) {
    setToast(message);
    window.setTimeout(() => setToast(''), 2500);
  }

  function changeClub(name) {
    const selectedClub = clubs.find((item) => item.name === name);
    if (!selectedClub) return;
    const newSquad = players.filter((player) => player.club === selectedClub.name).map((player) => player.id);
    setGame((previous) => ({ ...previous, club: selectedClub.name, squad: newSquad }));
    notify(`Klub dipilih: ${selectedClub.name}`);
  }

  function playMatch() {
    const rivals = leagueClubs.filter((c) => c.name !== club.name);
    const rival = rivals[Math.floor(Math.random() * rivals.length)] || club;

    const myRating = team.reduce((sum, player) => sum + (player.ovr || 70), 0) / Math.max(team.length, 1);
    const rivalPlayers = players.filter((p) => p.club === rival.name);
    const rivalRating = rivalPlayers.reduce((sum, player) => sum + (player.ovr || 70), 0) / Math.max(rivalPlayers.length, 1);
    const myGoals = Math.random() < Math.max(0.2, (myRating - rivalRating + 20) / 120) ? 1 + Math.floor(Math.random() * 3) : 0;
    const oppGoals = Math.random() < Math.max(0.2, (rivalRating - myRating + 20) / 120) ? 1 + Math.floor(Math.random() * 2) : 0;

    setGame((previous) => ({
      ...previous,
      week: previous.week + 1,
      cash: previous.cash + (myGoals > oppGoals ? 250000 : 50000),
      rep: Math.min(100, previous.rep + (myGoals > oppGoals ? 5 : 1))
    }));
    notify(`${club.name} ${myGoals}-${oppGoals} ${rival.name} (${myGoals > oppGoals ? 'Menang' : myGoals === oppGoals ? 'Seri' : 'Kalah'})`);
  }

  function buyPlayer(player) {
    const price = player.marketValueEUR || 500000;
    if (game.squad.includes(player.id)) {
      notify('Pemain sudah berada di skuad.');
      return;
    }
    if (price > game.cash) {
      notify('Kas klub tidak cukup.');
      return;
    }
    setGame((previous) => ({
      ...previous,
      cash: previous.cash - price,
      squad: [...previous.squad, player.id]
    }));
    notify(`${player.name} berhasil ditambahkan ke skuad.`);
  }

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(180deg, #07120b 0%, #0d1d16 100%)',
      color: '#f5f7f5',
      fontFamily: 'system-ui, sans-serif',
      padding: '24px'
    }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <div>
              <div style={{ fontSize: 12, letterSpacing: 1, textTransform: 'uppercase', color: '#9ae6b4' }}>
                Football Club Manager
              </div>
              <h1 style={{ margin: 0, fontSize: '2rem' }}>{club.name}</h1>
            </div>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', fontSize: 14 }}>
              <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}><strong>Kas:</strong> {formatMoney(game.cash)}</div>
              <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}><strong>Reputasi:</strong> {game.rep}</div>
              <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}><strong>Minggu:</strong> {game.week}</div>
            </div>
          </div>

          <section style={{
            marginTop: 20,
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
            gap: 16,
            background: 'rgba(15, 23, 20, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: 16,
            padding: 18
          }}>
            <label style={{ fontSize: 13, color: '#b7c9bd' }}>
              Pilih jabatan / mau jadi apa?
              <select value={game.role} onChange={(event) => setGame((previous) => ({ ...previous, role: event.target.value }))} style={controlStyle}>
                {roles.map((role) => <option key={role} value={role}>{role}</option>)}
              </select>
            </label>
            <label style={{ fontSize: 13, color: '#b7c9bd' }}>
              Pilih klub
              <select value={club.name} onChange={(event) => changeClub(event.target.value)} style={controlStyle}>
                {clubs.map((item) => <option key={item.id} value={item.name}>{item.name} — {item.league}</option>)}
              </select>
            </label>
            <div style={{ alignSelf: 'end', color: '#9fb3a6', fontSize: 13, lineHeight: 1.5 }}>
              Pilihan tersimpan otomatis di browser ini. Mengganti klub akan mengganti skuad dengan pemain klub tersebut.
            </div>
          </section>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))', gap: 24 }}>
          <section style={{ background: 'rgba(15, 23, 20, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Ringkasan</h2>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: 16 }}>
              <div style={{ background: '#0d1a14', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#95a5a6', fontSize: 12 }}>Jabatan</div>
                <div style={{ fontSize: 20, fontWeight: 700 }}>{game.role}</div>
              </div>
              <div style={{ background: '#0d1a14', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#95a5a6', fontSize: 12 }}>Liga</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{club.league}</div>
              </div>
              <div style={{ background: '#0d1a14', borderRadius: 12, padding: 16 }}>
                <div style={{ color: '#95a5a6', fontSize: 12 }}>Stadion</div>
                <div style={{ fontSize: 20, fontWeight: 700, overflowWrap: 'anywhere' }}>{club.stadium}</div>
              </div>
            </div>
            <button onClick={playMatch} style={{ marginTop: 20, width: '100%', border: 'none', borderRadius: 12, background: '#22c55e', color: '#04130a', fontWeight: 700, fontSize: 16, padding: 14, cursor: 'pointer' }}>
              Mainkan Pertandingan
            </button>
          </section>

          <section style={{ background: 'rgba(15, 23, 20, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 20, padding: 24 }}>
            <h2 style={{ marginTop: 0 }}>Skuad {club.name}</h2>
            {team.length ? <div style={{ display: 'grid', gap: 10 }}>
              {team.map((player) => <div key={player.id} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12, background: '#0d1a14', borderRadius: 12, padding: '10px 12px' }}>
                <div><div style={{ fontWeight: 700 }}>{player.name}</div><div style={{ color: '#a3b8af', fontSize: 12 }}>{player.position} • {player.club}</div></div>
                <div style={{ fontWeight: 700, color: '#d9f99d' }}>{player.ovr}</div>
              </div>)}
            </div> : <p style={{ color: '#a3b8af' }}>Belum ada profil pemain untuk klub ini di dataset.</p>}
          </section>
        </div>

        <section style={{ marginTop: 24, background: 'rgba(15, 23, 20, 0.9)', border: '1px solid rgba(148, 163, 184, 0.2)', borderRadius: 20, padding: 24 }}>
          <h2 style={{ marginTop: 0 }}>Transfer</h2>
          <div style={{ display: 'grid', gap: 12 }}>
            {transferList.map((player) => <div key={player.id} style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr) auto auto', alignItems: 'center', gap: 12, background: '#0d1a14', borderRadius: 12, padding: 12 }}>
              <div><div style={{ fontWeight: 700 }}>{player.name}</div><div style={{ color: '#a3b8af', fontSize: 12 }}>{player.club}</div></div>
              <div style={{ textAlign: 'right' }}><div style={{ fontWeight: 700 }}>{player.ovr}</div><div style={{ color: '#a3b8af', fontSize: 12 }}>{formatMoney(player.marketValueEUR || 0)}</div></div>
              <button onClick={() => buyPlayer(player)} style={{ border: 0, borderRadius: 8, background: '#38bdf8', color: '#06141a', fontWeight: 700, padding: '8px 12px', cursor: 'pointer' }}>Beli</button>
            </div>)}
          </div>
        </section>

        <footer style={{ marginTop: 16, color: '#82958a', fontSize: 12 }}>Data pemain: {players.length} profil • Perubahan permainan tersimpan otomatis di perangkat ini.</footer>
        <div role="status" aria-live="polite" style={{ position: 'fixed', bottom: 20, right: 20, maxWidth: 'calc(100vw - 40px)', background: '#0f172a', border: '1px solid rgba(148, 163, 184, 0.3)', color: '#fff', borderRadius: 12, padding: '10px 14px', opacity: toast ? 1 : 0, transition: 'opacity 0.2s ease', pointerEvents: toast ? 'auto' : 'none' }}>
          {toast}
        </div>
      </div>
    </div>
  );
}

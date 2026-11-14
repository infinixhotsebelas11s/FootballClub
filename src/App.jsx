import React, { useMemo, useState } from 'react';
import { clubs, players, dataStatus } from '../database.js';

const initialSave = {
  club: 'Persib Bandung',
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

export default function App() {
  const [game, setGame] = useState(readSave);
  const [toast, setToast] = useState('');

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
    setTimeout(() => setToast(''), 2200);
  }

  function playMatch() {
    const rivals = leagueClubs.filter((c) => c.name !== club.name);
    const rival = rivals[Math.floor(Math.random() * rivals.length)] || club;

    const myRating = team.reduce((sum, player) => sum + (player.ovr || 70), 0) / Math.max(team.length, 1);
    const rivalRating = players
      .filter((p) => p.club === rival.name)
      .reduce((sum, player) => sum + (player.ovr || 70), 0) / Math.max(players.filter((p) => p.club === rival.name).length, 1);

    const myGoals = Math.random() < Math.max(0.2, (myRating - rivalRating + 20) / 120) ? 1 + Math.floor(Math.random() * 3) : 0;
    const oppGoals = Math.random() < Math.max(0.2, (rivalRating - myRating + 20) / 120) ? 1 + Math.floor(Math.random() * 2) : 0;

    setGame((prev) => ({
      ...prev,
      week: prev.week + 1,
      cash: prev.cash + (myGoals > oppGoals ? 250000 : 50000),
      rep: Math.min(100, prev.rep + (myGoals > oppGoals ? 5 : 1))
    }));

    notify(
      `${club.name} ${myGoals}-${oppGoals} ${rival.name} (${myGoals > oppGoals ? 'Menang' : myGoals === oppGoals ? 'Seri' : 'Kalah'})`
    );
  }

  function buyPlayer(player) {
    const price = player.marketValueEUR || 500000;
    if (price > game.cash) {
      notify('Kas klub tidak cukup.');
      return;
    }

    setGame((prev) => ({
      ...prev,
      cash: prev.cash - price,
      squad: prev.squad.includes(player.id) ? prev.squad : [...prev.squad, player.id]
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
        <header style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          gap: '16px',
          marginBottom: '24px',
          flexWrap: 'wrap'
        }}>
          <div>
            <div style={{ fontSize: 12, letterSpacing: '1px', textTransform: 'uppercase', color: '#9ae6b4' }}>
              Football Club Manager
            </div>
            <h1 style={{ margin: 0, fontSize: '2rem' }}>{club.name}</h1>
          </div>

          <div style={{
            display: 'flex',
            gap: '12px',
            flexWrap: 'wrap',
            fontSize: '14px'
          }}>
            <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}>
              <strong>Kas:</strong> {formatMoney(game.cash)}
            </div>
            <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}>
              <strong>Reputasi:</strong> {game.rep}
            </div>
            <div style={{ background: '#112517', padding: '10px 14px', borderRadius: 12, border: '1px solid #1f3a2d' }}>
              <strong>Minggu:</strong> {game.week}
            </div>
          </div>
        </header>

        <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '24px' }}>
          <section style={{
            background: 'rgba(15, 23, 20, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <h2 style={{ marginTop: 0 }}>Ringkasan</h2>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, minmax(0, 1fr))', gap: '16px' }}>
              <div style={{ background: '#0d1a14', borderRadius: 12, padding: '16px' }}>
                <div style={{ color: '#95a5a6', fontSize: 12 }}>Liga</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{club.league}</div>
              </div>
              <div style={{ background: '#0d1a14', borderRadius: 12, padding: '16px' }}>
                <div style={{ color: '#95a5a6', fontSize: 12 }}>Stadion</div>
                <div style={{ fontSize: 22, fontWeight: 700 }}>{club.stadium}</div>
              </div>
            </div>

            <button
              onClick={playMatch}
              style={{
                marginTop: '20px',
                width: '100%',
                border: 'none',
                borderRadius: '12px',
                background: '#22c55e',
                color: '#04130a',
                fontWeight: 700,
                fontSize: '16px',
                padding: '14px',
                cursor: 'pointer'
              }}
            >
              Mainkan Pertandingan
            </button>
          </section>

          <section style={{
            background: 'rgba(15, 23, 20, 0.9)',
            border: '1px solid rgba(148, 163, 184, 0.2)',
            borderRadius: '20px',
            padding: '24px'
          }}>
            <h2 style={{ marginTop: 0 }}>Skuad</h2>
            <div style={{ display: 'grid', gap: '10px' }}>
              {team.map((player) => (
                <div key={player.id} style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  background: '#0d1a14',
                  borderRadius: 12,
                  padding: '10px 12px'
                }}>
                  <div>
                    <div style={{ fontWeight: 700 }}>{player.name}</div>
                    <div style={{ color: '#a3b8af', fontSize: 12 }}>{player.position} • {player.club}</div>
                  </div>
                  <div style={{ fontWeight: 700, color: '#d9f99d' }}>{player.ovr}</div>
                </div>
              ))}
            </div>
          </section>
        </div>

        <section style={{
          marginTop: '24px',
          background: 'rgba(15, 23, 20, 0.9)',
          border: '1px solid rgba(148, 163, 184, 0.2)',
          borderRadius: '20px',
          padding: '24px'
        }}>
          <h2 style={{ marginTop: 0 }}>Transfer</h2>
          <div style={{ display: 'grid', gap: '12px' }}>
            {transferList.map((player) => (
              <div key={player.id} style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                background: '#0d1a14',
                borderRadius: '12px',
                padding: '12px'
              }}>
                <div>
                  <div style={{ fontWeight: 700 }}>{player.name}</div>
                  <div style={{ color: '#a3b8af', fontSize: 12 }}>{player.club}</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontWeight: 700 }}>{player.ovr}</div>
                  <div style={{ color: '#a3b8af', fontSize: 12 }}>{player.marketValueEUR ? player.marketValueEUR.toLocaleString() : '0'}</div>
                </div>
                <button
                  onClick={() => buyPlayer(player)}
                  style={{
                    border: 'none',
                    borderRadius: 8,
                    background: '#38bdf8',
                    color: '#06141a',
                    fontWeight: 700,
                    padding: '8px 12px',
                    cursor: 'pointer'
                  }}
                >
                  Beli
                </button>
              </div>
            ))}
          </div>
        </section>

        <div style={{
          position: 'fixed',
          bottom: '20px',
          right: '20px',
          background: '#0f172a',
          border: '1px solid rgba(148, 163, 184, 0.3)',
          color: '#fff',
          borderRadius: 12,
          padding: '10px 14px',
          opacity: toast ? 1 : 0,
          transition: 'opacity 0.2s ease',
          pointerEvents: toast ? 'auto' : 'none'
        }}>
          {toast}
        </div>
      </div>
    </div>
  );
           }

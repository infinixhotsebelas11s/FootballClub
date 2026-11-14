import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import MatchStatsOverlay from './MatchStatsOverlay.jsx';
import MyClubMenu from './MyClubMenu.jsx';
import EntertainmentMenu from './EntertainmentMenu.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <>
      <App />
      <MyClubMenu />
      <EntertainmentMenu />
      <MatchStatsOverlay />
    </>
  </React.StrictMode>,
);

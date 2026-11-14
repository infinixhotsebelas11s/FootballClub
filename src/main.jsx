import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
import CalendarMenu from './CalendarMenu.jsx';
import EuropeanLeaguesMenu from './EuropeanLeaguesMenu.jsx';
import LeagueFixtureController from './LeagueFixtureController.jsx';
import './index.css';

createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <><App /><CalendarMenu /><EuropeanLeaguesMenu /><LeagueFixtureController /></>
  </React.StrictMode>,
);

export const APP_VERSION = 'v3.0.0';
export const BUILD_DATE = 'November 2026';
export const GITHUB_REPO_URL = 'https://github.com/gmascagni/RC_Wind_Weather';

export const CHANGELOG = [
  {
    version: 'v3.0.0',
    date: 'November 2026',
    title: 'Pilot Profiles, Calculation Modes & Android Client App',
    highlights: [
      '⚡ 4 Pilot Skill Levels: Beginner, Intermediate, Advanced & Extreme with pilot-scaled wind envelopes.',
      '💨 Wind Calculation Basis Toggle: Choose between Peak Gusts (Conservative) vs Sustained Wind (Steady Airflow).',
      '🧭 Inverted Compass Red Arrow: Now points directly into/against the wind (facing wind source).',
      '📱 Google Play Client App: Native Android project (Capacitor 8) with GPS permissions & offline assets.',
      '🚸 Dual Audience Profiles: 1-click toggle between Comedic Adult flight-line humor and 100% Kid-Friendly Cadet mode.',
      '📅 Tomorrow Weather Outlook: 24h preview button to check ahead before heading to the field.',
      '🎨 Curtiss P-40 Warhawk artwork & high-res Flying Tigers icons across all badges and favicons.',
      '📐 Collapsible Wind Condition Scale & Recommended Aircraft sections for compact cockpit view.',
    ],
  },
  {
    version: 'v2.0.0',
    date: 'October 2026',
    title: 'WWII Warbird Cockpit & Live Magnetometer Compass',
    highlights: [
      'Cockpit avionics theme with brushed metal panels, stamped serials, and brass rivet fasteners.',
      'Live Hardware Compass: Rotates dial in real time via phone magnetometer & gyro.',
      'Crosswind calculation engine with active into-the-wind runway selection.',
      'Offline PWA caching and service worker with 3-minute weather API freshness window.',
      'Multi-unit wind speed selection (MPH, Knots, KM/H).',
    ],
  },
  {
    version: 'v1.0.0',
    date: 'October 2026',
    title: 'Initial Flight Deck Release',
    highlights: [
      'Hyper-local Open-Meteo weather API integration with 24h hourly forecast.',
      'GPS field locator and worldwide city/ZIP search with offline favorites.',
      'Go / No-Go flight status evaluation and aircraft class suitability recommendations.',
    ],
  },
];

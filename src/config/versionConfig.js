export const APP_VERSION = 'v3.2.0';
export const BUILD_DATE = 'November 2026';
export const GITHUB_REPO_URL = 'https://github.com/gmascagni/RC_Wind_Weather';

export const CHANGELOG = [
  {
    version: 'v3.2.0',
    date: 'November 2026',
    title: '4-Expert Aviation Audit: Cockpit Flow, Density Altitude & Touch Drag HSI',
    highlights: [
      '✈️ Logical Cockpit Flow (Panels 01–07): Promoted Wind Vector & HSI Compass (02) and 24h Envelope Chart (03) directly below the Primary Flight Deck (01) for instant field reference.',
      '🌡️ Density Altitude (DA) Telemetry: Computes live ISA Density Altitude from field elevation and ambient temperature to warn of thin air, longer takeoff rolls, and reduced prop/EDF thrust.',
      '👆 Smooth 360° Touch & Mouse Drag Compass: Drag your finger or mouse continuously around the compass bezel to calibrate local wind direction in real time.',
      '🛑 Severe Crosswind NO-GO Protection: Extreme runway crosswinds (>135% of pilot-scaled limit) now trigger a red NO-GO alert instead of only a yellow caution.',
      '📱 Mobile Viewport & PC Optimization: Unpinned bulky mobile header while scrolling, softened screen vignette, removed duplicate controls, and fixed 24h chart click-to-hour syncing.',
      '🛡️ Google Play Store Policy Compliance: Sanitized default stop-verdict copy while preserving comedic adult flight-line humor.',
    ],
  },
  {
    version: 'v3.1.0',
    date: 'November 2026',
    title: 'Local Field Wind Direction Calibration & Microclimate Override',
    highlights: [
      '🧭 Local Wind Field Calibration: Option to manually align the wind indicator when local airfield conditions differ from the regional weather station forecast.',
      '🔄 Auto vs Calibrated Wind Mode: Uses live weather forecast by default with a seamless 1-click [RESET TO LIVE] button to revert at any time.',
      '👆 Interactive Compass Dial: Tap or click anywhere around the compass face to immediately point the red arrow into the incoming wind.',
      '🎯 Phone Aim Wind Alignment: Point your phone directly into the wind and tap to calibrate the wind vector to your phone’s live compass heading.',
      '🛩️ Dynamic Aerodynamics Update: Headwind, crosswind, and Go/No-Go flight status instantly recalculate based on calibrated field conditions.',
      '👻 Ghost Station Vector: Faint reference needle displays original weather station forecast alongside your calibrated local field heading.',
    ],
  },
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

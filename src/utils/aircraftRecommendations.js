export const WIND_CONDITION_TIERS = [
  {
    id: 'calm',
    minMph: 0,
    maxMph: 6.9,
    rangeLabel: '0–6 MPH',
    title: 'Glass / Calm Air',
    detail: 'Prime for UMX ultra-micros, maidens & trimming',
    level: 'good',
  },
  {
    id: 'micro-breeze',
    minMph: 7,
    maxMph: 10.9,
    rangeLabel: '7–10 MPH',
    title: 'Light Breeze',
    detail: 'Sweet spot for Micro (2S–3S) & park scale',
    level: 'good',
  },
  {
    id: 'sport-breeze',
    minMph: 11,
    maxMph: 14.9,
    rangeLabel: '11–14 MPH',
    title: 'Moderate Wind',
    detail: 'Sport / Trainers (3S–4S) & 60-class warbirds',
    level: 'marginal',
  },
  {
    id: 'heavy-air',
    minMph: 15,
    maxMph: 19.9,
    rangeLabel: '15–19 MPH',
    title: 'Heavy Metal Only',
    detail: 'Experienced pilots: 6S Warbirds, EDFs & Giant Scale',
    level: 'marginal',
  },
  {
    id: 'ca-glue',
    minMph: 20,
    maxMph: 24.9,
    rangeLabel: '20+ MPH',
    title: 'CA Glue Required',
    detail: 'Pack kicker & spare props — rough landings ahead',
    level: 'stop',
  },
  {
    id: 'credit-card',
    minMph: 25,
    maxMph: 29.9,
    rangeLabel: '25+ MPH',
    title: 'BRING YOUR CREDIT CARD',
    detail: 'Horizon Hobby cart ready — airframe carnage zone',
    level: 'stop',
  },
  {
    id: 'spank',
    minMph: 30,
    maxMph: Infinity,
    rangeLabel: '30+ MPH',
    title: 'JUST STAY HOME AND SPANK!',
    detail: 'Zero business at the flying field — stay indoors',
    level: 'stop',
  },
];

export function getAircraftRecommendations(obs, crosswindMph = 0) {
  const speed = Number(obs?.windSpeed) || 0;
  const gusts = Math.max(speed, Number(obs?.windGusts) || speed);
  const spread = Math.max(0, Math.round((gusts - speed) * 10) / 10);
  const precipIn = Number(obs?.precipIn) || 0;
  const wmo = Number(obs?.weatherCode) || 0;
  const isWet = precipIn >= 0.01 || wmo >= 51;

  const classes = [
    {
      id: 'umx',
      name: 'UMX / Ultra-Micro (<150g, 1S–2S)',
      examples: 'UMX Timber X, Night Vapor, Sport Cub S2, UMX Radian',
      wingLoading: '3 – 6 oz/sq ft',
      sustainedMax: 7,
      gustMax: 10,
      crosswindMax: 4,
      tip: 'Fly early morning or sunset calm; keep ultra-light airframes upwind of the flight line.',
    },
    {
      id: 'micro',
      name: 'Micro Park Flyers (250g–750g, 2S–3S)',
      examples: '800mm Warbirds (T-28, P-51, F4U), Habu SS 50mm, Mini Timber',
      wingLoading: '8 – 13 oz/sq ft',
      sustainedMax: 10,
      gustMax: 14,
      crosswindMax: 6,
      tip: 'Heavier than UMX so 3S power penetrates a light breeze, but small wheels & short tail moments get twitchy past 10 mph.',
    },
    {
      id: 'trainer',
      name: 'Sport & High-Wing Trainers (1.1m–1.5m, 3S–4S)',
      examples: 'AeroScout 1.1m, Apprentice STS 1.5m, Timber 1.5m, Valiant 1.3m',
      wingLoading: '12 – 16 oz/sq ft',
      sustainedMax: 14,
      gustMax: 19,
      crosswindMax: 8,
      tip: 'Use normal rate 3-axis gyro (AS3X/Reflex); avoid SAFE self-leveling in crosswind flares.',
    },
    {
      id: 'warbird60',
      name: '60-Class Electric Warbirds (1.4m–1.6m, 6S)',
      examples: '1.4m–1.6m P-51D, Corsair, Spitfire, P-47 (6S LiPo w/ Retracts)',
      wingLoading: '20 – 28 oz/sq ft',
      sustainedMax: 16,
      gustMax: 22,
      crosswindMax: 9,
      tip: 'Wheel-land with 15% power and half-flaps in gusts; watch narrow-gear ground-loop in crosswinds.',
    },
    {
      id: 'edf',
      name: '70mm–90mm Electric Ducted Fan (EDF) Jets',
      examples: 'Viper 70mm/90mm, F-16 80mm, Avanti S, L-39 Albatros (6S–8S)',
      wingLoading: '25 – 36 oz/sq ft',
      sustainedMax: 18,
      gustMax: 24,
      crosswindMax: 11,
      tip: 'High wing loading penetrates steady wind smoothly, but headwind shortens landing roll dramatically.',
    },
    {
      id: 'giant',
      name: 'Giant Scale Balsa / Composite & 3D (50cc+)',
      examples: '85"–105" Extra 330, Edge 540, Carbon Cub SS, 50cc–120cc Gas / 12S',
      wingLoading: '24 – 38+ oz/sq ft',
      sustainedMax: 20,
      gustMax: 26,
      crosswindMax: 13,
      tip: 'Strong rudder authority handles crosswind slips; past 20 mph pack CA glue and spare props.',
    },
  ];

  return classes.map((cls) => {
    if (isWet) {
      return { ...cls, status: 'stop', statusLabel: 'GROUNDED (PRECIP)' };
    }
    if (speed >= 30) {
      return { ...cls, status: 'stop', statusLabel: 'STAY HOME & SPANK!' };
    }
    if (speed >= 25) {
      return { ...cls, status: 'stop', statusLabel: 'BRING CREDIT CARD' };
    }
    if (speed >= 20) {
      return { ...cls, status: 'stop', statusLabel: 'CA GLUE REQUIRED' };
    }
    if (speed > cls.sustainedMax || gusts > cls.gustMax) {
      return { ...cls, status: 'stop', statusLabel: 'DONT BE A RETARD!' };
    }
    if (
      speed > cls.sustainedMax * 0.72 ||
      gusts > cls.gustMax * 0.78 ||
      spread >= 8 ||
      crosswindMph > cls.crosswindMax
    ) {
      return { ...cls, status: 'marginal', statusLabel: 'EXPERIENCED / CAUTION' };
    }
    return { ...cls, status: 'good', statusLabel: 'IDEAL MATCH' };
  });
}

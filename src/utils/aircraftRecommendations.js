export function getAircraftRecommendations(obs, crosswindMph = 0) {
  const speed = Number(obs?.windSpeed) || 0;
  const gusts = Math.max(speed, Number(obs?.windGusts) || speed);
  const spread = Math.max(0, Math.round((gusts - speed) * 10) / 10);
  const precipIn = Number(obs?.precipIn) || 0;
  const wmo = Number(obs?.weatherCode) || 0;
  const isWet = precipIn >= 0.01 || wmo >= 51;

  const classes = [
    {
      id: 'micro',
      name: 'UMX & Sub-250g Micro Park Flyers',
      examples: 'UMX Timber X, Night Vapor, Sport Cub S2, Slow Ultra-Micros',
      wingLoading: '4 – 8 oz/sq ft',
      sustainedMax: 7,
      gustMax: 11,
      crosswindMax: 5,
      tip: 'Fly early morning or sunset calm; keep airframe upwind of pilot box.',
    },
    {
      id: 'trainer',
      name: '1.1m–1.5m Sport & High-Wing Trainers',
      examples: 'AeroScout 1.1m, Apprentice STS 1.5m, Timber, Valiant 1.3m',
      wingLoading: '11 – 16 oz/sq ft',
      sustainedMax: 13,
      gustMax: 18,
      crosswindMax: 8,
      tip: 'Use normal rate 3-axis gyro (AS3X/Reflex); avoid SAFE self-leveling in crosswind flares.',
    },
    {
      id: 'warbird60',
      name: '60-Class Electric Warbirds & Low-Wing Scale',
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
      sustainedMax: 22,
      gustMax: 28,
      crosswindMax: 14,
      tip: 'Strong rudder authority handles crosswind slips; avoid low-altitude 3D hovers if Δ gust spread > 9 mph.',
    },
  ];

  return classes.map((cls) => {
    if (isWet) {
      return { ...cls, status: 'stop', statusLabel: 'GROUNDED (PRECIP)' };
    }
    if (speed > cls.sustainedMax || gusts > cls.gustMax) {
      return { ...cls, status: 'stop', statusLabel: 'EXCEEDS LIMIT' };
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

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

export function getWindConditionTiers(contentProfile = 'adult', pilotProfile = 'intermediate', _calcBasis = 'gust') {
  const isKid = contentProfile === 'kid';

  if (pilotProfile === 'beginner') {
    return [
      {
        id: 'calm',
        minMph: 0,
        maxMph: 4.9,
        rangeLabel: '0–4 MPH',
        title: 'Glass / Calm Air',
        detail: 'Absolute prime conditions for student pilots, maidens & UMX',
        level: 'good',
      },
      {
        id: 'micro-breeze',
        minMph: 5,
        maxMph: 8.9,
        rangeLabel: '5–8 MPH',
        title: 'Gentle Breeze',
        detail: 'Sweet spot for beginner trainers (AeroScout, Apprentice) & park flyers',
        level: 'good',
      },
      {
        id: 'sport-breeze',
        minMph: 9,
        maxMph: 11.9,
        rangeLabel: '9–11 MPH',
        title: 'Moderate Wind',
        detail: 'Beginner ceiling — fly with instructor or flight-stabilization gyro',
        level: 'marginal',
      },
      {
        id: 'ca-glue',
        minMph: 12,
        maxMph: 14.9,
        rangeLabel: '12–14 MPH',
        title: isKid ? 'High Wind Caution' : 'CA Glue Required (Rookie Risk)',
        detail: isKid ? 'Turbulent for beginners — rough landings likely' : 'Rough landings ahead for new pilots — pack kicker & spare props',
        level: 'stop',
      },
      {
        id: 'credit-card',
        minMph: 15,
        maxMph: 17.9,
        rangeLabel: '15+ MPH',
        title: isKid ? 'Hazardous for Beginners' : 'BRING YOUR CREDIT CARD',
        detail: isKid ? 'Exceeds student envelope — wait for calm weather' : 'Rookie airframe carnage zone — keep trainers grounded',
        level: 'stop',
      },
      {
        id: 'spank',
        minMph: 18,
        maxMph: Infinity,
        rangeLabel: '18+ MPH',
        title: isKid ? 'Stay In The Hangar!' : 'JUST STAY HOME AND SPANK!',
        detail: 'Zero beginner business at the airfield — stay indoors',
        level: 'stop',
      },
    ];
  }

  if (pilotProfile === 'extreme') {
    return [
      {
        id: 'calm',
        minMph: 0,
        maxMph: 9.9,
        rangeLabel: '0–9 MPH',
        title: 'Calm / Warmup Air',
        detail: 'Trivial air for 3D balsa beasts & giant scale',
        level: 'good',
      },
      {
        id: 'sport-breeze',
        minMph: 10,
        maxMph: 19.9,
        rangeLabel: '10–19 MPH',
        title: 'Standard 3D Flight',
        detail: 'Prime performance: 60-Class warbirds, EDFs & 50cc+ 3D aerobatics',
        level: 'good',
      },
      {
        id: 'heavy-air',
        minMph: 20,
        maxMph: 29.9,
        rangeLabel: '20–29 MPH',
        title: 'Heavy Wind Action',
        detail: 'High rudder authority: harriers, slips & high-penetration warbirds',
        level: 'marginal',
      },
      {
        id: 'ca-glue',
        minMph: 30,
        maxMph: 34.9,
        rangeLabel: '30+ MPH',
        title: isKid ? 'Extreme Wind Caution' : 'CA Glue Required (3D Pro)',
        detail: isKid ? 'Severe winds — advanced rudder authority required' : 'High wind hovering & knife-edge passes — pack spare props',
        level: 'stop',
      },
      {
        id: 'credit-card',
        minMph: 35,
        maxMph: 39.9,
        rangeLabel: '35+ MPH',
        title: isKid ? 'Gale Warning / Severe' : 'BRING YOUR CREDIT CARD',
        detail: isKid ? 'Near hurricane force — extreme risk for all aircraft' : 'Horizon Hobby cart ready — extreme airframe destruction zone',
        level: 'stop',
      },
      {
        id: 'spank',
        minMph: 40,
        maxMph: Infinity,
        rangeLabel: '40+ MPH',
        title: isKid ? 'Stay In The Hangar!' : 'JUST STAY HOME AND SPANK!',
        detail: 'Zero flying business in gale storm — stay indoors',
        level: 'stop',
      },
    ];
  }

  if (pilotProfile === 'advanced') {
    return [
      {
        id: 'calm',
        minMph: 0,
        maxMph: 7.9,
        rangeLabel: '0–7 MPH',
        title: 'Glass / Calm Air',
        detail: 'Maidens, scale trimming & ultra-micros',
        level: 'good',
      },
      {
        id: 'sport-breeze',
        minMph: 8,
        maxMph: 15.9,
        rangeLabel: '8–15 MPH',
        title: 'Moderate Wind',
        detail: 'Standard warbird & sport flight line comfort zone',
        level: 'good',
      },
      {
        id: 'heavy-air',
        minMph: 16,
        maxMph: 24.9,
        rangeLabel: '16–24 MPH',
        title: 'Warbird & Jet Air',
        detail: 'Experienced warbird wheels landings, crabs & EDF penetration',
        level: 'marginal',
      },
      {
        id: 'ca-glue',
        minMph: 25,
        maxMph: 29.9,
        rangeLabel: '25+ MPH',
        title: isKid ? 'Too Windy / High Risk' : 'CA Glue Required',
        detail: isKid ? 'Strong turbulence — rough landings & damage risk' : 'Pack kicker & spare props — rough landings ahead',
        level: 'stop',
      },
      {
        id: 'credit-card',
        minMph: 30,
        maxMph: 34.9,
        rangeLabel: '30+ MPH',
        title: isKid ? 'Hazardous Winds / Severe' : 'BRING YOUR CREDIT CARD',
        detail: isKid ? 'Hazardous conditions — grounded for all airframes' : 'Horizon Hobby cart ready — airframe carnage zone',
        level: 'stop',
      },
      {
        id: 'spank',
        minMph: 35,
        maxMph: Infinity,
        rangeLabel: '35+ MPH',
        title: isKid ? 'Stay In The Hangar!' : 'JUST STAY HOME AND SPANK!',
        detail: 'Zero business at the flying field — stay indoors',
        level: 'stop',
      },
    ];
  }

  // Standard Intermediate profile
  return WIND_CONDITION_TIERS.map((tier) => {
    if (!isKid) return tier;
    if (tier.id === 'ca-glue') {
      return {
        ...tier,
        title: 'Too Windy / High Risk',
        detail: 'Strong turbulence — rough landings & high damage risk',
      };
    }
    if (tier.id === 'credit-card') {
      return {
        ...tier,
        title: 'Hazardous Winds / Severe',
        detail: 'Hazardous conditions — grounded for all RC airframes',
      };
    }
    if (tier.id === 'spank') {
      return {
        ...tier,
        title: 'Stay In The Hangar!',
        detail: 'Gale danger — zero flying, stay indoors',
      };
    }
    return tier;
  });
}

export function getAircraftRecommendations(
  obs,
  crosswindMph = 0,
  contentProfile = 'adult',
  pilotProfile = 'intermediate',
  calcBasis = 'gust'
) {
  const isKid = contentProfile === 'kid';
  const speed = Number(obs?.windSpeed) || 0;
  const gusts = Math.max(speed, Number(obs?.windGusts) || speed);
  const spread = Math.max(0, Math.round((gusts - speed) * 10) / 10);
  const precipIn = Number(obs?.precipIn) || 0;
  const wmo = Number(obs?.weatherCode) || 0;
  const isWet = precipIn >= 0.01 || wmo >= 51;

  const pilotFactors = {
    beginner: 0.70,
    intermediate: 1.0,
    advanced: 1.30,
    extreme: 1.65,
  };
  const pFactor = pilotFactors[pilotProfile] ?? 1.0;

  const pilotTierLimits = {
    beginner: { tier1: 10, tier2: 13, tier3: 16 },
    intermediate: { tier1: 20, tier2: 25, tier3: 30 },
    advanced: { tier1: 25, tier2: 30, tier3: 35 },
    extreme: { tier1: 30, tier2: 35, tier3: 40 },
  };
  const tiers = pilotTierLimits[pilotProfile] || pilotTierLimits.intermediate;
  const primaryWind = calcBasis === 'sustained' ? speed : Math.max(speed, Math.round(gusts * 0.9));

  const classes = [
    {
      id: 'umx',
      name: 'UMX / Ultra-Micro (<150g, 1S–2S)',
      examples: 'UMX Timber X, Night Vapor, Sport Cub S2, UMX Radian',
      wingLoading: '3 – 6 oz/sq ft',
      sustainedMax: Math.round(7 * pFactor),
      gustMax: Math.round(10 * pFactor),
      crosswindMax: Math.round(4 * pFactor),
      tip: 'Fly early morning or sunset calm; keep ultra-light airframes upwind of the flight line.',
    },
    {
      id: 'micro',
      name: 'Micro Park Flyers (250g–750g, 2S–3S)',
      examples: '800mm Warbirds (T-28, P-51, F4U), Habu SS 50mm, Mini Timber',
      wingLoading: '8 – 13 oz/sq ft',
      sustainedMax: Math.round(10 * pFactor),
      gustMax: Math.round(14 * pFactor),
      crosswindMax: Math.round(6 * pFactor),
      tip: 'Heavier than UMX so 3S power penetrates a light breeze, but small wheels & short tail moments get twitchy past 10 mph.',
    },
    {
      id: 'trainer',
      name: 'Sport & High-Wing Trainers (1.1m–1.5m, 3S–4S)',
      examples: 'AeroScout 1.1m, Apprentice STS 1.5m, Timber 1.5m, Valiant 1.3m',
      wingLoading: '12 – 16 oz/sq ft',
      sustainedMax: Math.round(14 * pFactor),
      gustMax: Math.round(19 * pFactor),
      crosswindMax: Math.round(8 * pFactor),
      tip: 'Use normal rate 3-axis gyro (AS3X/Reflex); avoid SAFE self-leveling in crosswind flares.',
    },
    {
      id: 'warbird60',
      name: '60-Class Electric Warbirds (1.4m–1.6m, 6S)',
      examples: '1.4m–1.6m P-51D, Corsair, Spitfire, P-47 (6S LiPo w/ Retracts)',
      wingLoading: '20 – 28 oz/sq ft',
      sustainedMax: Math.round(16 * pFactor),
      gustMax: Math.round(22 * pFactor),
      crosswindMax: Math.round(9 * pFactor),
      tip: 'Wheel-land with 15% power and half-flaps in gusts; watch narrow-gear ground-loop in crosswinds.',
    },
    {
      id: 'edf',
      name: '70mm–90mm Electric Ducted Fan (EDF) Jets',
      examples: 'Viper 70mm/90mm, F-16 80mm, Avanti S, L-39 Albatros (6S–8S)',
      wingLoading: '25 – 36 oz/sq ft',
      sustainedMax: Math.round(18 * pFactor),
      gustMax: Math.round(24 * pFactor),
      crosswindMax: Math.round(11 * pFactor),
      tip: 'High wing loading penetrates steady wind smoothly, but headwind shortens landing roll dramatically.',
    },
    {
      id: 'giant',
      name: 'Giant Scale Balsa / Composite & 3D (50cc+)',
      examples: '85"–105" Extra 330, Edge 540, Carbon Cub SS, 50cc–120cc Gas / 12S',
      wingLoading: '24 – 38+ oz/sq ft',
      sustainedMax: Math.round(20 * pFactor),
      gustMax: Math.round(26 * pFactor),
      crosswindMax: Math.round(13 * pFactor),
      tip: 'Strong rudder authority handles crosswind slips; past 20 mph pack CA glue and spare props.',
    },
  ];

  return classes.map((cls) => {
    if (isWet) {
      return { ...cls, status: 'stop', statusLabel: 'GROUNDED (PRECIP)' };
    }
    if (primaryWind >= tiers.tier3) {
      return {
        ...cls,
        status: 'stop',
        statusLabel: isKid ? 'STAY IN HANGAR' : 'STAY HOME & SPANK!',
      };
    }
    if (primaryWind >= tiers.tier2) {
      return {
        ...cls,
        status: 'stop',
        statusLabel: isKid ? 'HAZARDOUS WINDS' : 'BRING CREDIT CARD',
      };
    }
    if (primaryWind >= tiers.tier1) {
      return {
        ...cls,
        status: 'stop',
        statusLabel: isKid ? 'TOO WINDY TO FLY' : 'CA GLUE REQUIRED',
      };
    }

    // Check sustained limit
    if (speed > cls.sustainedMax) {
      return {
        ...cls,
        status: 'stop',
        statusLabel: isKid ? 'EXCEEDS LIMITS' : 'DONT BE A RETARD!',
      };
    }

    // Check gusts depending on calculation basis
    if (calcBasis === 'sustained') {
      if (gusts > cls.gustMax) {
        return {
          ...cls,
          status: 'marginal',
          statusLabel: isKid ? 'GUST CAUTION' : 'WATCH THE GUSTS',
        };
      }
    } else {
      if (gusts > cls.gustMax) {
        return {
          ...cls,
          status: 'stop',
          statusLabel: isKid ? 'EXCEEDS GUST LIMIT' : 'DONT BE A RETARD!',
        };
      }
    }

    if (
      speed > cls.sustainedMax * 0.72 ||
      gusts > cls.gustMax * 0.78 ||
      spread >= 8 ||
      crosswindMph > cls.crosswindMax
    ) {
      return {
        ...cls,
        status: 'marginal',
        statusLabel: isKid ? 'PILOT CAUTION' : 'EXPERIENCED / CAUTION',
      };
    }

    return {
      ...cls,
      status: 'good',
      statusLabel: isKid ? 'READY FOR FLIGHT' : 'IDEAL MATCH',
    };
  });
}

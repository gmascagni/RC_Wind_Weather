export const FLYING_LOCATIONS = [
  {
    id: 'alpharetta',
    name: 'Alpharetta, GA',
    shortName: 'Alpharetta',
    sectorCode: 'KALP-RC // SEC-01',
    lat: 34.0754,
    lon: -84.2941,
    coordsDisplay: '34.0754° N, 84.2941° W',
    elevationFt: 1135,
    fieldType: 'North Fulton Open Turf & Park Sectors',
    notes: 'Watch for tree-line mechanical rotor turbulence when winds exceed 10 mph from the NW.',
  },
  {
    id: 'roswell',
    name: 'Roswell, GA',
    shortName: 'Roswell',
    sectorCode: 'KROS-RC // SEC-02',
    lat: 34.0232,
    lon: -84.3616,
    coordsDisplay: '34.0232° N, 84.3616° W',
    elevationFt: 1056,
    fieldType: 'Chattahoochee Basin & Park Flyers Zone',
    notes: 'River valley thermal lift in afternoon sun; light morning valley drainage breeze.',
  },
  {
    id: 'woodstock',
    name: 'Woodstock, GA',
    shortName: 'Woodstock',
    sectorCode: 'KWDS-RC // SEC-03',
    lat: 34.1014,
    lon: -84.5194,
    coordsDisplay: '34.1014° N, 84.5194° W',
    elevationFt: 988,
    fieldType: 'Cherokee County RC Airfield & Open Pastures',
    notes: 'Wide unobstructed approaches; gust fronts from the west arrive 15–20 mins before Alpharetta.',
  },
];

export function degreesToCardinal(deg) {
  if (deg === null || deg === undefined || Number.isNaN(Number(deg))) return 'N/A';
  const directions = [
    'N', 'NNE', 'NE', 'ENE',
    'E', 'ESE', 'SE', 'SSE',
    'S', 'SSW', 'SW', 'WSW',
    'W', 'WNW', 'NW', 'NNW',
  ];
  const normalized = ((Number(deg) % 360) + 360) % 360;
  const index = Math.round(normalized / 22.5) % 16;
  return directions[index];
}

/**
 * Evaluates RC flying condition based on sustained wind speed (mph) and wind gusts (mph).
 * Thresholds:
 *  - Green (< 8 mph): "🟢 Excellent for Flying"
 *  - Yellow (8-15 mph): "🟡 Moderate Winds - Exercise Caution"
 *  - Red (> 15 mph): "🔴 Too Windy"
 */
export function getWindStatus(windSpeedMph, windGustsMph = 0) {
  const speed = Number(windSpeedMph) || 0;
  const gusts = Number(windGustsMph) || speed;
  const gustSpread = Math.max(0, Math.round((gusts - speed) * 10) / 10);

  if (speed < 8 && gusts <= 14) {
    return {
      level: 'excellent',
      badgeText: '🟢 Excellent for Flying',
      shortLabel: 'CALM // GO FLY',
      code: 'COND-GREEN',
      summary: 'Ideal laminar air for micro foamies, park flyers, BNF trainers, and giant scale.',
      recommendedCrafts: 'All Classes (Micro, Park Flyer, Sport, Scale)',
      accentHex: '#10b981',
      bgClass: 'bg-emerald-500/15',
      borderClass: 'border-emerald-400/50',
      textClass: 'text-emerald-300',
      pillClass: 'bg-emerald-500/20 text-emerald-200 border-emerald-400/60',
      barClass: 'bg-emerald-400',
      dotClass: 'bg-emerald-400 shadow-[0_0_12px_#10b981]',
      gustSpread,
    };
  }

  if (speed <= 15 && gusts <= 22) {
    return {
      level: 'moderate',
      badgeText: '🟡 Moderate Winds - Exercise Caution',
      shortLabel: 'CAUTION // 8-15 MPH',
      code: 'COND-YELLOW',
      summary:
        speed < 8 && gusts > 14
          ? 'Sustained breeze is light, but elevated gusts require active throttle management on landing.'
          : 'Park flyers & lightweight foamies will weathercock; suitable for AS3X/gyro-stabilized sport & scale models.',
      recommendedCrafts: '3S–6S Sport, Warbirds (w/ Gyro), 60"+ Scale & EDFs',
      accentHex: '#f59e0b',
      bgClass: 'bg-amber-500/15',
      borderClass: 'border-amber-400/50',
      textClass: 'text-amber-300',
      pillClass: 'bg-amber-500/20 text-amber-200 border-amber-400/60',
      barClass: 'bg-amber-400',
      dotClass: 'bg-amber-400 shadow-[0_0_12px_#f59e0b]',
      gustSpread,
    };
  }

  return {
    level: 'high',
    badgeText: '🔴 Too Windy',
    shortLabel: 'NO-GO // >15 MPH',
    code: 'COND-RED',
    summary: 'High sustained winds or severe gust shear. Ground lightweight models; experienced heavy-wing-loading pilots only.',
    recommendedCrafts: 'Grounded / Heavy Slope Soarers & Giant Scale Only',
    accentHex: '#f43f5e',
    bgClass: 'bg-rose-500/15',
    borderClass: 'border-rose-500/60',
    textClass: 'text-rose-300',
    pillClass: 'bg-rose-500/20 text-rose-200 border-rose-500/60',
    barClass: 'bg-rose-500',
    dotClass: 'bg-rose-500 shadow-[0_0_12px_#f43f5e]',
    gustSpread,
  };
}

/**
 * Generates realistic fallback weather data in case the device is temporarily offline at the flying field.
 */
export function buildOfflineFallbackWeather(location) {
  const now = new Date();
  const currentHour = new Date(now.getFullYear(), now.getMonth(), now.getDate(), now.getHours(), 0, 0);
  const seedOffset = location.id === 'alpharetta' ? 0 : location.id === 'roswell' ? 1.2 : 2.6;

  const hourly = Array.from({ length: 24 }, (_, idx) => {
    const slotTime = new Date(currentHour.getTime() + idx * 3600 * 1000);
    const hourOfDay = slotTime.getHours();
    const isDaytime = hourOfDay >= 8 && hourOfDay <= 19;
    const diurnalFactor = isDaytime ? Math.sin(((hourOfDay - 7) / 13) * Math.PI) : 0.15;

    const baseWind = Math.round((4.2 + diurnalFactor * 9.5 + seedOffset + (idx % 3) * 0.7) * 10) / 10;
    const gusts = Math.round((baseWind * 1.42 + (isDaytime ? 2.5 : 1.1)) * 10) / 10;
    const temp = Math.round(56 + diurnalFactor * 17 - seedOffset * 0.5);
    const dir = (285 + idx * 6 + Math.round(seedOffset * 10)) % 360;

    return {
      isoTime: slotTime.toISOString(),
      timeLabel: idx === 0
        ? 'NOW'
        : slotTime.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' }),
      hourShort: slotTime.toLocaleTimeString('en-US', { hour: 'numeric' }),
      dayLabel: slotTime.getDate() === now.getDate() ? 'Today' : 'Tomorrow',
      temperature: temp,
      windSpeed: baseWind,
      windGusts: gusts,
      windDirection: dir,
      cardinal: degreesToCardinal(dir),
      precipProb: isDaytime ? 5 : 0,
      isCurrentHour: idx === 0,
    };
  });

  const first = hourly[0];
  return {
    current: {
      temperature: first.temperature,
      apparentTemperature: first.temperature - 1,
      humidity: 54,
      windSpeed: first.windSpeed,
      windGusts: first.windGusts,
      windDirection: first.windDirection,
      cardinal: first.cardinal,
      fetchedAt: now.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit', second: '2-digit' }),
      isFallback: true,
    },
    hourly,
  };
}

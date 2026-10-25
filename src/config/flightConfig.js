export const FLYING_LOCATIONS = [
  {
    id: 'alpharetta',
    name: 'Alpharetta, GA',
    shortName: 'Alpharetta',
    sectorCode: 'KALP-RC',
    lat: 34.0754,
    lon: -84.2941,
    coordsDisplay: '34.0754° N, 84.2941° W',
    elevationFt: 1135,
    defaultRunwayDeg: 290,
    fieldType: 'North Fulton Turf & Park Sector',
    notes: 'Tall pine tree-line creates mechanical rotor curl when NW winds exceed 10 mph.',
  },
  {
    id: 'roswell',
    name: 'Roswell, GA',
    shortName: 'Roswell',
    sectorCode: 'KROS-RC',
    lat: 34.0232,
    lon: -84.3616,
    coordsDisplay: '34.0232° N, 84.3616° W',
    elevationFt: 1056,
    defaultRunwayDeg: 270,
    fieldType: 'Chattahoochee Basin Flyer Zone',
    notes: 'Afternoon thermal lift over river basin; calmest air typically sunrise to 10:30 AM.',
  },
  {
    id: 'woodstock',
    name: 'Woodstock, GA',
    shortName: 'Woodstock',
    sectorCode: 'KWDS-RC',
    lat: 34.1014,
    lon: -84.5194,
    coordsDisplay: '34.1014° N, 84.5194° W',
    elevationFt: 988,
    defaultRunwayDeg: 280,
    fieldType: 'Cherokee Open Airfield Sector',
    notes: 'Wide approaches; westerly gust fronts arrive 15–20 min earlier than Alpharetta.',
  },
];

// Sensible defaults for 60-Class Electric Warbirds (1.4m–1.6m / 60–70" 6S w/ retracts & flaps)
export const DEFAULT_THRESHOLDS = {
  presetId: 'warbird60',
  cautionWindMph: 10,
  maxSustainedWindMph: 16,
  cautionGustMph: 15,
  maxGustMph: 22,
  maxGustSpreadMph: 9,
  maxCrosswindMph: 9,
  maxPrecipProbPct: 45,
  maxPrecipIn: 0.01,
  minVisibilityMi: 3,
  minTempF: 40,
  maxTempF: 95,
};

export const AIRCRAFT_PRESETS = [
  {
    id: 'micro',
    label: 'UMX / Park Flyer (<250g)',
    thresholds: {
      presetId: 'micro',
      cautionWindMph: 5,
      maxSustainedWindMph: 8,
      cautionGustMph: 8,
      maxGustMph: 12,
      maxGustSpreadMph: 5,
      maxCrosswindMph: 5,
      maxPrecipProbPct: 35,
      maxPrecipIn: 0.01,
      minVisibilityMi: 3,
      minTempF: 45,
      maxTempF: 95,
    },
  },
  {
    id: 'sport',
    label: 'Sport / Trainer (3S–4S)',
    thresholds: {
      presetId: 'sport',
      cautionWindMph: 8,
      maxSustainedWindMph: 14,
      cautionGustMph: 13,
      maxGustMph: 19,
      maxGustSpreadMph: 8,
      maxCrosswindMph: 8,
      maxPrecipProbPct: 45,
      maxPrecipIn: 0.01,
      minVisibilityMi: 3,
      minTempF: 40,
      maxTempF: 95,
    },
  },
  {
    id: 'warbird60',
    label: '60-Class Electric Warbird (Default)',
    thresholds: DEFAULT_THRESHOLDS,
  },
  {
    id: 'giant',
    label: 'Giant Scale / 3D (50cc+ / 8S–12S)',
    thresholds: {
      presetId: 'giant',
      cautionWindMph: 14,
      maxSustainedWindMph: 22,
      cautionGustMph: 20,
      maxGustMph: 28,
      maxGustSpreadMph: 12,
      maxCrosswindMph: 13,
      maxPrecipProbPct: 50,
      maxPrecipIn: 0.01,
      minVisibilityMi: 3,
      minTempF: 36,
      maxTempF: 98,
    },
  },
];

export const WIND_UNITS = {
  mph: { id: 'mph', label: 'mph', factor: 1 },
  kt: { id: 'kt', label: 'kt', factor: 0.868976 },
  kmh: { id: 'kmh', label: 'km/h', factor: 1.609344 },
};

export function convertWind(mphValue, unitId = 'mph') {
  const safeVal = Number.isFinite(Number(mphValue)) ? Number(mphValue) : 0;
  const factor = WIND_UNITS[unitId]?.factor ?? 1;
  return Math.round(safeVal * factor * 10) / 10;
}

export function getUnitLabel(unitId = 'mph') {
  return WIND_UNITS[unitId]?.label ?? 'mph';
}

export const STALE_AFTER_MS = 15 * 60 * 1000; // 15 minutes
export const AUTO_REFRESH_MS = 5 * 60 * 1000; // 5 minutes

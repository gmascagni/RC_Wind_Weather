function formatCoordPair(lat, lon) {
  const ns = lat >= 0 ? 'N' : 'S';
  const ew = lon >= 0 ? 'E' : 'W';
  return `${Math.abs(lat).toFixed(4)}° ${ns}, ${Math.abs(lon).toFixed(4)}° ${ew}`;
}

export function createLocationRecord({
  id,
  name,
  shortName,
  region = '',
  countryCode = '',
  lat,
  lon,
  elevationFt = null,
  timezone = 'auto',
  defaultRunwayDeg = 270,
  isGps = false,
}) {
  const cleanLat = Math.round(Number(lat) * 10000) / 10000;
  const cleanLon = Math.round(Number(lon) * 10000) / 10000;
  const stableId = id || `loc_${cleanLat.toFixed(3)}_${cleanLon.toFixed(3)}`;

  return {
    id: stableId,
    name: name || shortName || 'Flying Field',
    shortName: shortName || name || 'Field',
    region,
    countryCode,
    lat: cleanLat,
    lon: cleanLon,
    coordsDisplay: formatCoordPair(cleanLat, cleanLon),
    elevationFt,
    timezone,
    defaultRunwayDeg,
    isGps: Boolean(isGps),
    notes: isGps
      ? 'Live GPS coordinates — align runway strip heading below or tap Live Compass to snap.'
      : '10m AGL wind & gust forecast — set your field runway alignment below for crosswind math.',
  };
}

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
    id: 'umx',
    label: 'UMX / Ultra-Micro (<150g)',
    thresholds: {
      presetId: 'umx',
      cautionWindMph: 4,
      maxSustainedWindMph: 7,
      cautionGustMph: 7,
      maxGustMph: 10,
      maxGustSpreadMph: 4,
      maxCrosswindMph: 4,
      maxPrecipProbPct: 30,
      maxPrecipIn: 0.01,
      minVisibilityMi: 3,
      minTempF: 45,
      maxTempF: 95,
    },
  },
  {
    id: 'micro',
    label: 'Micro (250g–750g / 2S–3S)',
    thresholds: {
      presetId: 'micro',
      cautionWindMph: 7,
      maxSustainedWindMph: 10,
      cautionGustMph: 10,
      maxGustMph: 14,
      maxGustSpreadMph: 6,
      maxCrosswindMph: 6,
      maxPrecipProbPct: 35,
      maxPrecipIn: 0.01,
      minVisibilityMi: 3,
      minTempF: 42,
      maxTempF: 95,
    },
  },
  {
    id: 'sport',
    label: 'Sport / Trainer (3S–4S)',
    thresholds: {
      presetId: 'sport',
      cautionWindMph: 9,
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
      maxSustainedWindMph: 20,
      cautionGustMph: 19,
      maxGustMph: 26,
      maxGustSpreadMph: 11,
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

export const STALE_AFTER_MS = 15 * 60 * 1000;
export const AUTO_REFRESH_MS = 5 * 60 * 1000;

export const STATUS_THEME = {
  good: {
    text: 'text-good',
    ink: 'text-good-ink',
    bg: 'bg-good-surface',
    border: 'border-good-line',
    bar: 'bg-good',
    glow: 'shadow-glow-good',
    hex: '#34d399',
  },
  marginal: {
    text: 'text-caution',
    ink: 'text-caution-ink',
    bg: 'bg-caution-surface',
    border: 'border-caution-line',
    bar: 'bg-caution',
    glow: 'shadow-glow-caution',
    hex: '#fbbf24',
  },
  stop: {
    text: 'text-stop',
    ink: 'text-stop-ink',
    bg: 'bg-stop-surface',
    border: 'border-stop-line',
    bar: 'bg-stop',
    glow: 'shadow-glow-stop',
    hex: '#fb7185',
  },
};

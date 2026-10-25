import { degreesToCardinal, normalizeDegrees } from '../utils/aerodynamics';

const FALLBACK_TZ = 'America/New_York';
const REQUEST_TIMEOUT_MS = 8500;
const MAX_RETRIES = 2;

const formatterCache = new Map();

function getFormattersForTz(tzInput) {
  const tz = tzInput && tzInput !== 'auto' ? tzInput : FALLBACK_TZ;
  if (formatterCache.has(tz)) return formatterCache.get(tz);

  let validTz = tz;
  try {
    new Intl.DateTimeFormat('en-US', { timeZone: tz });
  } catch {
    validTz = FALLBACK_TZ;
  }

  const bundle = {
    tz: validTz,
    time: new Intl.DateTimeFormat('en-US', { timeZone: validTz, hour: 'numeric', minute: '2-digit' }),
    shortHour: new Intl.DateTimeFormat('en-US', { timeZone: validTz, hour: 'numeric' }),
    hour24: new Intl.DateTimeFormat('en-US', { timeZone: validTz, hour: '2-digit', hourCycle: 'h23' }),
    dateKey: new Intl.DateTimeFormat('en-CA', { timeZone: validTz, year: 'numeric', month: '2-digit', day: '2-digit' }),
  };
  formatterCache.set(tz, bundle);
  return bundle;
}

function safeNum(val, fallback = 0) {
  const n = Number(val);
  return Number.isFinite(n) ? n : fallback;
}

async function fetchWithTimeoutAndRetry(url, externalSignal) {
  let attempt = 0;
  let lastError = null;

  while (attempt <= MAX_RETRIES) {
    if (externalSignal?.aborted) {
      throw new DOMException('Aborted', 'AbortError');
    }

    const controller = new AbortController();
    const onExternalAbort = () => controller.abort();
    externalSignal?.addEventListener('abort', onExternalAbort, { once: true });
    const timer = setTimeout(() => controller.abort(new Error('Request timed out')), REQUEST_TIMEOUT_MS);

    try {
      const res = await fetch(url, { signal: controller.signal });
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);

      if (!res.ok) {
        if (res.status >= 500 || res.status === 429) {
          throw new Error(`Open-Meteo HTTP ${res.status}`);
        }
        throw new Error(`Weather API error (${res.status})`);
      }
      return await res.json();
    } catch (err) {
      clearTimeout(timer);
      externalSignal?.removeEventListener('abort', onExternalAbort);
      if (externalSignal?.aborted) {
        throw new DOMException('Aborted', 'AbortError');
      }
      lastError = err;
      attempt += 1;
      if (attempt <= MAX_RETRIES) {
        await new Promise((r) => setTimeout(r, 500 * Math.pow(2, attempt - 1)));
      }
    }
  }
  throw lastError || new Error('Failed to load weather data');
}

export async function fetchOpenMeteoForLocation(location, signal) {
  const requestedTz = location.timezone && location.timezone !== 'auto' ? location.timezone : 'auto';
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'precipitation',
      'weather_code',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    hourly: [
      'temperature_2m',
      'precipitation_probability',
      'precipitation',
      'weather_code',
      'visibility',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    precipitation_unit: 'inch',
    timeformat: 'unixtime',
    timezone: requestedTz,
    forecast_days: '2',
  });

  const data = await fetchWithTimeoutAndRetry(
    `https://api.open-meteo.com/v1/forecast?${params.toString()}`,
    signal
  );

  const fmt = getFormattersForTz(data?.timezone || location.timezone || FALLBACK_TZ);
  const apiElevFt = Number.isFinite(Number(data?.elevation))
    ? Math.round(Number(data.elevation) * 3.28084)
    : null;

  const cur = data?.current || {};
  const currentWind = Math.round(safeNum(cur.wind_speed_10m, 0) * 10) / 10;
  const currentGusts = Math.max(currentWind, Math.round(safeNum(cur.wind_gusts_10m, currentWind) * 10) / 10);
  const currentDir = normalizeDegrees(cur.wind_direction_10m);
  const currentTemp = Math.round(safeNum(cur.temperature_2m, 68));
  const currentVisMi = Math.round((safeNum(cur.visibility, 16093) / 1609.344) * 10) / 10;

  const nowEpochSec = safeNum(cur.time, Math.floor(Date.now() / 1000));
  const currentHourFloorSec = Math.floor(nowEpochSec / 3600) * 3600;
  const todayKey = fmt.dateKey.format(new Date(nowEpochSec * 1000));

  const hTimes = Array.isArray(data?.hourly?.time) ? data.hourly.time : [];
  let startIdx = hTimes.findIndex((epochSec) => safeNum(epochSec) >= currentHourFloorSec);
  if (startIdx === -1) startIdx = 0;

  const hourly = [];
  for (let offset = 0; offset < 24; offset++) {
    const i = startIdx + offset;
    if (i >= hTimes.length) break;
    const epochSec = safeNum(hTimes[i]);
    const dateObj = new Date(epochSec * 1000);
    const isNow = offset === 0;

    const wSpeed = isNow ? currentWind : Math.round(safeNum(data.hourly.wind_speed_10m?.[i], 0) * 10) / 10;
    const wGust = isNow
      ? currentGusts
      : Math.max(wSpeed, Math.round(safeNum(data.hourly.wind_gusts_10m?.[i], wSpeed) * 10) / 10);
    const wDir = isNow ? currentDir : normalizeDegrees(data.hourly.wind_direction_10m?.[i]);

    hourly.push({
      epochSec,
      isoTime: dateObj.toISOString(),
      timeLabel: isNow ? 'NOW' : fmt.time.format(dateObj),
      hourShort: isNow ? 'NOW' : fmt.shortHour.format(dateObj),
      hour24: Number(fmt.hour24.format(dateObj)) || 0,
      dayLabel: fmt.dateKey.format(dateObj) === todayKey ? 'Today' : 'Tomorrow',
      temperature: isNow ? currentTemp : Math.round(safeNum(data.hourly.temperature_2m?.[i], currentTemp)),
      windSpeed: wSpeed,
      windGusts: wGust,
      windDirection: wDir,
      cardinal: degreesToCardinal(wDir),
      precipProb: Math.round(safeNum(data.hourly.precipitation_probability?.[i], 0)),
      precipIn: Math.round(safeNum(data.hourly.precipitation?.[i], 0) * 100) / 100,
      visibilityMi: isNow
        ? currentVisMi
        : Math.round((safeNum(data.hourly.visibility?.[i], 16093) / 1609.344) * 10) / 10,
      weatherCode: Math.round(safeNum(data.hourly.weather_code?.[i], 0)),
      isCurrentHour: isNow,
    });
  }

  return {
    fetchedAtMs: Date.now(),
    timezone: fmt.tz,
    elevationFt: apiElevFt,
    current: {
      temperature: currentTemp,
      apparentTemperature: Math.round(safeNum(cur.apparent_temperature, currentTemp)),
      humidity: Math.round(safeNum(cur.relative_humidity_2m, 50)),
      precipIn: Math.round(safeNum(cur.precipitation, 0) * 100) / 100,
      precipProb: hourly[0]?.precipProb ?? 0,
      visibilityMi: currentVisMi,
      weatherCode: Math.round(safeNum(cur.weather_code, 0)),
      windSpeed: currentWind,
      windGusts: currentGusts,
      windDirection: currentDir,
      cardinal: degreesToCardinal(currentDir),
    },
    hourly,
  };
}

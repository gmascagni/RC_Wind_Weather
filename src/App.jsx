import React, { useState, useEffect, useCallback } from 'react';
import {
  Wind,
  Thermometer,
  Gauge,
  MapPin,
  RefreshCw,
  Radio,
  Droplets,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Sun,
} from 'lucide-react';
import {
  FLYING_LOCATIONS,
  degreesToCardinal,
  getWindStatus,
  buildOfflineFallbackWeather,
} from './data/locations';
import TacticalCompass from './components/TacticalCompass';
import HourlyForecast from './components/HourlyForecast';
import RulesOfThumbCard from './components/RulesOfThumbCard';

async function fetchLocationWeather(location) {
  const params = new URLSearchParams({
    latitude: String(location.lat),
    longitude: String(location.lon),
    current: [
      'temperature_2m',
      'apparent_temperature',
      'relative_humidity_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'weather_code',
    ].join(','),
    hourly: [
      'temperature_2m',
      'wind_speed_10m',
      'wind_direction_10m',
      'wind_gusts_10m',
      'precipitation_probability',
    ].join(','),
    temperature_unit: 'fahrenheit',
    wind_speed_unit: 'mph',
    timezone: 'America/New_York',
    forecast_days: '2',
  });

  const url = `https://api.open-meteo.com/v1/forecast?${params.toString()}`;
  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Open-Meteo HTTP ${res.status}`);
  }
  const data = await res.json();

  const currentTemp = Math.round(Number(data.current?.temperature_2m ?? 68));
  const apparentTemp = Math.round(Number(data.current?.apparent_temperature ?? currentTemp));
  const humidity = Math.round(Number(data.current?.relative_humidity_2m ?? 50));
  const currentWind = Math.round(Number(data.current?.wind_speed_10m ?? 0) * 10) / 10;
  const currentGusts = Math.round(Number(data.current?.wind_gusts_10m ?? currentWind) * 10) / 10;
  const currentDir = Math.round(Number(data.current?.wind_direction_10m ?? 0));

  const times = data.hourly?.time || [];
  const temps = data.hourly?.temperature_2m || [];
  const winds = data.hourly?.wind_speed_10m || [];
  const gusts = data.hourly?.wind_gusts_10m || [];
  const dirs = data.hourly?.wind_direction_10m || [];
  const precips = data.hourly?.precipitation_probability || [];

  const currentIsoPrefix = data.current?.time ? data.current.time.slice(0, 13) : null;
  let startIndex = 0;
  if (currentIsoPrefix) {
    const foundIdx = times.findIndex((t) => t.slice(0, 13) === currentIsoPrefix);
    if (foundIdx !== -1) {
      startIndex = foundIdx;
    }
  } else {
    const nowMs = Date.now();
    const foundIdx = times.findIndex((t) => new Date(t).getTime() >= nowMs - 3600 * 1000);
    if (foundIdx !== -1) startIndex = foundIdx;
  }

  const nowDateStr = times[startIndex]?.slice(0, 10);

  const hourlySlice = [];
  for (let i = 0; i < 24; i++) {
    const idx = startIndex + i;
    if (idx >= times.length) break;
    const rawTime = times[idx];
    const parsedDate = new Date(rawTime);
    const isNow = i === 0;
    const wSpeed = isNow ? currentWind : Math.round(Number(winds[idx] ?? 0) * 10) / 10;
    const wGust = isNow ? currentGusts : Math.round(Number(gusts[idx] ?? wSpeed) * 10) / 10;
    const wDir = isNow ? currentDir : Math.round(Number(dirs[idx] ?? 0));
    const tVal = isNow ? currentTemp : Math.round(Number(temps[idx] ?? currentTemp));

    hourlySlice.push({
      isoTime: rawTime,
      timeLabel: isNow
        ? 'NOW'
        : parsedDate.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
          }),
      hourShort: parsedDate.toLocaleTimeString('en-US', { hour: 'numeric' }),
      dayLabel: rawTime.slice(0, 10) === nowDateStr ? 'Today' : 'Tomorrow',
      temperature: tVal,
      windSpeed: wSpeed,
      windGusts: wGust,
      windDirection: wDir,
      cardinal: degreesToCardinal(wDir),
      precipProb: Number(precips[idx] ?? 0),
      isCurrentHour: isNow,
    });
  }

  return {
    current: {
      temperature: currentTemp,
      apparentTemperature: apparentTemp,
      humidity,
      windSpeed: currentWind,
      windGusts: currentGusts,
      windDirection: currentDir,
      cardinal: degreesToCardinal(currentDir),
      fetchedAt: new Date().toLocaleTimeString('en-US', {
        hour: 'numeric',
        minute: '2-digit',
      }),
      isFallback: false,
    },
    hourly: hourlySlice,
  };
}

export default function App() {
  const [selectedId, setSelectedId] = useState(FLYING_LOCATIONS[0].id);
  const [weatherById, setWeatherById] = useState({});
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorNote, setErrorNote] = useState(null);
  const [daylightBoost, setDaylightBoost] = useState(false);

  useEffect(() => {
    document.body.classList.toggle('daylight-boost', daylightBoost);
  }, [daylightBoost]);

  const loadAllLocations = useCallback(async (isManualRefresh = false) => {
    if (isManualRefresh) {
      setRefreshing(true);
    } else {
      setLoading(true);
    }
    setErrorNote(null);

    const nextMap = {};
    let anyFailed = false;

    await Promise.all(
      FLYING_LOCATIONS.map(async (loc) => {
        try {
          const result = await fetchLocationWeather(loc);
          nextMap[loc.id] = result;
        } catch {
          anyFailed = true;
          nextMap[loc.id] = buildOfflineFallbackWeather(loc);
        }
      })
    );

    if (anyFailed) {
      setErrorNote(
        'Live Open-Meteo feed unreachable — displaying simulated North GA telemetry fallback.'
      );
    }

    setWeatherById(nextMap);
    setLoading(false);
    setRefreshing(false);
  }, []);

  useEffect(() => {
    loadAllLocations(false);
  }, [loadAllLocations]);

  const activeLocation =
    FLYING_LOCATIONS.find((l) => l.id === selectedId) || FLYING_LOCATIONS[0];
  const activeWeather =
    weatherById[activeLocation.id] || buildOfflineFallbackWeather(activeLocation);
  const current = activeWeather.current;
  const hourly = activeWeather.hourly;
  const status = getWindStatus(current.windSpeed, current.windGusts);

  return (
    <div className="min-h-dvh flex flex-col justify-between pb-20 md:pb-0 text-slate-100">
      {/* Skip Link for Keyboard Accessibility */}
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-lg bg-sky-500 px-4 py-2 font-mono-tech text-xs font-bold text-slate-950 shadow-lg"
      >
        Skip to flight telemetry
      </a>

      {/* Shared Inline SVG Symbol for RC Airplane App Emblem (reused via <use href="#rc-airplane-symbol" />) */}
      <svg aria-hidden="true" className="hidden" width="0" height="0">
        <symbol id="rc-airplane-symbol" viewBox="0 0 512 512">
          <rect width="512" height="512" rx="112" fill="#0b1324" />
          <circle
            cx="256"
            cy="256"
            r="196"
            fill="none"
            stroke="#0ea5e9"
            strokeOpacity="0.28"
            strokeWidth="8"
            strokeDasharray="16 12"
          />
          <path
            d="M98 146 A 70 70 0 0 1 146 98"
            fill="none"
            stroke="#38bdf8"
            strokeWidth="14"
            strokeLinecap="round"
          />
          <path
            d="M70 174 A 110 110 0 0 1 174 70"
            fill="none"
            stroke="#38bdf8"
            strokeOpacity="0.7"
            strokeWidth="11"
            strokeLinecap="round"
          />
          <g transform="translate(256 262) rotate(-45) translate(-256 -256)">
            <ellipse
              cx="256"
              cy="68"
              rx="62"
              ry="12"
              fill="#38bdf8"
              fillOpacity="0.45"
              stroke="#7dd3fc"
              strokeWidth="4"
            />
            <path
              d="M64 218 L226 178 L286 178 L448 218 L436 254 L284 240 L228 240 L76 254 Z"
              fill="#10b981"
              stroke="#ecfdf5"
              strokeWidth="8"
              strokeLinejoin="round"
            />
            <path
              d="M168 386 L236 364 L276 364 L344 386 L336 410 L274 402 L238 402 L176 410 Z"
              fill="#0ea5e9"
              stroke="#e0f2fe"
              strokeWidth="7"
              strokeLinejoin="round"
            />
            <path
              d="M256 82 C276 82 288 128 286 210 L274 416 C272 432 264 440 256 440 C248 440 240 432 238 416 L226 210 C224 128 236 82 256 82 Z"
              fill="#f8fafc"
              stroke="#0f172a"
              strokeWidth="8"
            />
            <ellipse
              cx="256"
              cy="176"
              rx="18"
              ry="38"
              fill="#0284c7"
              stroke="#e0f2fe"
              strokeWidth="4"
            />
            <path
              d="M236 92 C242 60 270 60 276 92 Z"
              fill="#f43f5e"
              stroke="#ffe4e6"
              strokeWidth="4"
            />
            <path
              d="M256 352 L256 428"
              stroke="#f43f5e"
              strokeWidth="12"
              strokeLinecap="round"
            />
          </g>
        </symbol>
      </svg>

      {/* Top Tactical Header & Location Pill Selector */}
      <header className="safe-top-header sticky top-0 z-30 border-b border-slate-800/90 bg-[#070b12]/95 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-6 sm:py-3">
          <div className="flex flex-col gap-2.5 md:flex-row md:items-center md:justify-between">
            {/* Brand & Mobile Quick Actions */}
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2.5 min-w-0">
                <div className="flex h-10 w-10 sm:h-11 sm:w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/50 bg-[#0b1324] shadow-[0_0_16px_rgba(16,185,129,0.28)]">
                  <svg width="40" height="40" aria-hidden="true" className="block">
                    <use href="#rc-airplane-symbol" />
                  </svg>
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className="font-mono-tech text-[10px] sm:text-[11px] font-semibold uppercase tracking-widest text-emerald-400 truncate">
                      NORTH GA RC MET
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-1.5 py-0.2 font-mono-tech text-[9px] sm:text-[10px] text-emerald-300 shrink-0">
                      <Radio className="h-2.5 w-2.5 animate-pulse" aria-hidden="true" />
                      LIVE
                    </span>
                  </div>
                  <h1 className="font-display text-base sm:text-xl font-bold tracking-tight text-white truncate">
                    RC Flight Deck // Wind
                  </h1>
                </div>
              </div>

              {/* Action Buttons: Daylight Sun Boost + Sync */}
              <div className="flex items-center gap-1.5 shrink-0">
                <button
                  type="button"
                  onClick={() => setDaylightBoost((prev) => !prev)}
                  aria-pressed={daylightBoost}
                  title="Toggle high-contrast outdoor daylight mode"
                  className={`touch-target inline-flex items-center gap-1.5 rounded-xl border px-2.5 py-2 font-mono-tech text-xs font-semibold transition active:scale-95 ${
                    daylightBoost
                      ? 'border-amber-400 bg-amber-400/20 text-amber-200'
                      : 'border-slate-700/80 bg-slate-900/90 text-slate-300 hover:text-white'
                  }`}
                >
                  <Sun className="h-3.5 w-3.5 text-amber-400 shrink-0" aria-hidden="true" />
                  <span className="hidden xs:inline sm:inline">SUN</span>
                </button>

                <button
                  type="button"
                  onClick={() => loadAllLocations(true)}
                  disabled={refreshing}
                  aria-label="Refresh weather telemetry"
                  className="touch-target inline-flex md:hidden items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-2.5 py-2 font-mono-tech text-xs font-semibold text-slate-200 active:scale-95"
                >
                  <RefreshCw
                    className={`h-3.5 w-3.5 text-sky-400 ${refreshing ? 'animate-spin' : ''}`}
                    aria-hidden="true"
                  />
                  <span>SYNC</span>
                </button>
              </div>
            </div>

            {/* 1. LOCATION SELECTOR / TABS (Top Bar) */}
            <nav
              aria-label="Flying field locations"
              className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-800 bg-[#0b1220] p-1 shadow-inner"
            >
              {FLYING_LOCATIONS.map((loc) => {
                const isSelected = loc.id === activeLocation.id;
                const locData = weatherById[loc.id];
                const locStatus = locData
                  ? getWindStatus(locData.current.windSpeed, locData.current.windGusts)
                  : null;

                return (
                  <button
                    key={loc.id}
                    type="button"
                    onClick={() => setSelectedId(loc.id)}
                    aria-pressed={isSelected}
                    className={`touch-target group relative flex flex-col items-center justify-center rounded-xl px-2 py-1.5 text-center transition sm:flex-row sm:justify-between sm:px-3 sm:py-2 sm:text-left ${
                      isSelected
                        ? 'bg-slate-800/95 text-white shadow-md ring-1 ring-sky-400/60'
                        : 'text-slate-400 hover:bg-slate-900/70 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-1.5">
                      <span
                        className={`h-2 w-2 rounded-full shrink-0 ${
                          locStatus ? locStatus.dotClass : 'bg-slate-600'
                        }`}
                        aria-hidden="true"
                      />
                      <span className="font-display text-xs sm:text-sm font-bold tracking-tight">
                        {loc.shortName}
                      </span>
                    </div>

                    {locData && (
                      <span
                        className={`font-mono-tech text-[11px] font-semibold ${
                          isSelected ? locStatus.textClass : 'text-slate-400'
                        }`}
                      >
                        {locData.current.windSpeed} mph
                      </span>
                    )}
                  </button>
                );
              })}
            </nav>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 space-y-4 sm:space-y-5 px-3 py-3 sm:px-6 sm:py-6 focus:outline-none"
      >
        {errorNote && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-3.5 py-2 text-xs font-mono-tech text-amber-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{errorNote}</span>
          </div>
        )}

        {/* 2. CURRENT CONDITIONS BANNER (Mobile-Optimized 2x2 Cockpit Layout) */}
        <section
          aria-labelledby="current-conditions-heading"
          className={`tactical-card relative overflow-hidden rounded-2xl border ${status.borderClass} bg-[#0b111e]/95 p-3.5 sm:p-6 shadow-2xl`}
        >
          {/* Top Location Telemetry Strip + Flight Status Badge */}
          <div className="flex flex-col gap-3 border-b border-slate-800/90 pb-3.5 sm:pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1">
              <div className="pill-wrap-balance gap-1.5 text-[11px] sm:text-xs font-mono-tech text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 font-semibold text-sky-300">
                  <MapPin className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-sky-400" aria-hidden="true" />
                  {activeLocation.coordsDisplay}
                </span>
                <span className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-300">
                  ELEV {activeLocation.elevationFt} FT
                </span>
                <span className="hidden sm:inline-block rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-400">
                  {activeLocation.sectorCode}
                </span>
              </div>

              <div className="flex flex-wrap items-baseline justify-between gap-2">
                <h2
                  id="current-conditions-heading"
                  className="font-display text-xl sm:text-3xl font-bold tracking-tight text-white"
                >
                  {activeLocation.name}
                </h2>
                <span className="text-xs sm:text-sm text-slate-400">
                  {activeLocation.fieldType}
                </span>
              </div>
            </div>

            {/* Primary Flight Status Badge + Desktop Refresh */}
            <div className="flex items-center justify-between sm:justify-start gap-2.5">
              <div
                role="status"
                aria-live="polite"
                className={`status-pill flex flex-1 sm:flex-initial items-center justify-center gap-2 rounded-xl sm:rounded-2xl border px-3.5 py-2 sm:px-4 sm:py-2.5 font-display text-sm sm:text-base font-bold tracking-tight shadow-lg ${status.pillClass}`}
              >
                {status.level === 'excellent' && (
                  <CheckCircle2 className="h-5 w-5 text-emerald-400 shrink-0" aria-hidden="true" />
                )}
                {status.level === 'moderate' && (
                  <AlertTriangle className="h-5 w-5 text-amber-400 shrink-0" aria-hidden="true" />
                )}
                {status.level === 'high' && (
                  <OctagonAlert className="h-5 w-5 text-rose-400 shrink-0" aria-hidden="true" />
                )}
                <span>{status.badgeText}</span>
              </div>

              <button
                type="button"
                onClick={() => loadAllLocations(true)}
                disabled={refreshing || loading}
                className="touch-target hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 font-mono-tech text-xs font-semibold text-slate-200 hover:border-sky-500/50 hover:text-white transition cursor-pointer"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-sky-400 ${
                    refreshing || loading ? 'animate-spin' : ''
                  }`}
                  aria-hidden="true"
                />
                <span>REFRESH</span>
              </button>
            </div>
          </div>

          {/* 2x2 Mobile Cockpit Grid (All 4 primary instruments visible above the fold on phones!) */}
          <div className="mt-3.5 sm:mt-5 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
            {/* Metric 1: Sustained Wind Speed */}
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Wind className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-emerald-400" aria-hidden="true" />
                  <span className="truncate">WIND SPEED</span>
                </span>
              </div>

              <div className="my-2.5 sm:my-4">
                <div className="flex items-baseline gap-1.5">
                  <span
                    className={`font-mono-tech text-3xl sm:text-5xl font-extrabold tracking-tight ${status.textClass}`}
                  >
                    {current.windSpeed}
                  </span>
                  <span className="font-mono-tech text-sm sm:text-lg font-semibold text-slate-400">
                    mph
                  </span>
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                  10m AGL sustained
                </p>
              </div>

              {/* Scale Meter */}
              <div className="space-y-1 border-t border-slate-800/80 pt-2 sm:pt-3">
                <div className="flex justify-between font-mono-tech text-[9px] sm:text-[10px] text-slate-400">
                  <span>0</span>
                  <span>8</span>
                  <span>15+ mph</span>
                </div>
                <div className="h-1.5 sm:h-2 w-full overflow-hidden rounded-full bg-slate-800">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${status.barClass}`}
                    style={{
                      width: `${Math.min(100, Math.round((current.windSpeed / 22) * 100))}%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Metric 2: Wind Gusts & Shear Spread */}
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Gauge className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-amber-400" aria-hidden="true" />
                  <span className="truncate">GUSTS</span>
                </span>
                <span className="shrink-0 rounded bg-slate-800 px-1.5 py-0.5 text-[10px] font-semibold text-amber-300">
                  +{status.gustSpread}
                </span>
              </div>

              <div className="my-2.5 sm:my-4">
                <div className="flex items-baseline gap-1.5">
                  <span className="font-mono-tech text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {current.windGusts}
                  </span>
                  <span className="font-mono-tech text-sm sm:text-lg font-semibold text-slate-400">
                    mph
                  </span>
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                  {status.gustSpread >= 7
                    ? 'Elevated gust shear'
                    : 'Low gust variance'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 sm:pt-3 font-mono-tech text-[10px] sm:text-xs">
                <span className="text-slate-400">AIR</span>
                <span
                  className={`font-bold ${
                    status.gustSpread >= 7 ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {status.gustSpread >= 7 ? 'CHOPPY' : 'SMOOTH'}
                </span>
              </div>
            </div>

            {/* Metric 3: Current Temperature & Air Density Info */}
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-3.5 sm:p-5">
              <div className="flex items-center justify-between gap-1 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1 truncate">
                  <Thermometer className="h-3.5 w-3.5 sm:h-4 sm:w-4 shrink-0 text-sky-400" aria-hidden="true" />
                  <span className="truncate">TEMP</span>
                </span>
                <span className="inline-flex items-center gap-0.5 text-[10px] sm:text-xs text-slate-300 shrink-0">
                  <Droplets className="h-3 w-3 text-sky-400" aria-hidden="true" />
                  {current.humidity}%
                </span>
              </div>

              <div className="my-2.5 sm:my-4">
                <div className="flex items-baseline gap-1">
                  <span className="font-mono-tech text-3xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {current.temperature}°
                  </span>
                  <span className="font-mono-tech text-sm sm:text-lg font-semibold text-slate-400">
                    F
                  </span>
                </div>
                <p className="mt-1 text-[11px] sm:text-xs text-slate-400">
                  Feels <strong className="text-slate-200">{current.apparentTemperature}°F</strong>
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 sm:pt-3 font-mono-tech text-[10px] sm:text-xs">
                <span className="text-slate-400">LIPO</span>
                <span className="font-bold text-sky-300">
                  {current.temperature < 50
                    ? 'WARM PACKS'
                    : current.temperature > 88
                    ? 'HOT / VENT'
                    : 'OPTIMAL'}
                </span>
              </div>
            </div>

            {/* Metric 4: Rotating Wind Direction Compass */}
            <TacticalCompass
              windDirection={current.windDirection}
              cardinal={current.cardinal}
              windSpeed={current.windSpeed}
              status={status}
            />
          </div>

          {/* Bottom Pilot Advisory Strip inside Banner */}
          <div className="mt-3 sm:mt-4 flex flex-col gap-1.5 sm:gap-2 rounded-xl border border-slate-800/90 bg-slate-950/75 px-3.5 py-2.5 sm:px-4 sm:py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="font-mono-tech font-bold uppercase tracking-wider text-slate-200">
                ADVISORY: <span className={status.textClass}>{status.summary}</span>
              </div>
              <div className="text-slate-400">
                <strong className="text-slate-300">Field Note:</strong> {activeLocation.notes}
              </div>
            </div>
            <div className="shrink-0 font-mono-tech text-[11px] text-slate-400 sm:text-right border-t border-slate-800/60 pt-1.5 sm:border-t-0 sm:pt-0">
              <span className="sm:block">RECOMMENDED AIRFRAMES: </span>
              <span className="font-bold text-sky-300">{status.recommendedCrafts}</span>
            </div>
          </div>
        </section>

        {/* 3. HOUR-BY-HOUR FORECAST (NEXT 24 HOURS) */}
        <HourlyForecast hourly={hourly} locationName={activeLocation.name} />

        {/* 4. EXTRA POLISH: COLLAPSIBLE "RULES OF THUMB" CARD */}
        <RulesOfThumbCard
          currentWindSpeed={current.windSpeed}
          currentGusts={current.windGusts}
        />
      </main>

      {/* One-Handed Mobile Bottom Location & Telemetry Dock (Thumb-Zone Optimized) */}
      <aside
        aria-label="Mobile quick field switcher"
        className="safe-bottom-dock fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/95 bg-[#070b12]/95 px-2.5 pt-2 backdrop-blur-lg md:hidden shadow-[0_-8px_25px_rgba(0,0,0,0.65)]"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1.5">
          {FLYING_LOCATIONS.map((loc) => {
            const isSelected = loc.id === activeLocation.id;
            const locData = weatherById[loc.id];
            const locStatus = locData
              ? getWindStatus(locData.current.windSpeed, locData.current.windGusts)
              : null;

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  setSelectedId(loc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-pressed={isSelected}
                className={`touch-target flex flex-col items-center justify-center rounded-xl border px-2 py-1.5 transition active:scale-95 ${
                  isSelected
                    ? `${locStatus ? locStatus.borderClass : 'border-sky-400'} bg-slate-800/95 text-white shadow`
                    : 'border-slate-800/80 bg-slate-900/70 text-slate-400'
                }`}
              >
                <div className="flex items-center gap-1.5">
                  <span
                    className={`h-2 w-2 rounded-full ${
                      locStatus ? locStatus.dotClass : 'bg-slate-600'
                    }`}
                    aria-hidden="true"
                  />
                  <span className="font-display text-xs font-bold tracking-tight">
                    {loc.shortName}
                  </span>
                </div>
                {locData && (
                  <div className="mt-0.5 flex items-center gap-1 font-mono-tech text-[10px]">
                    <span className={`font-bold ${locStatus.textClass}`}>
                      {locData.current.windSpeed} mph
                    </span>
                    <span className="text-slate-400">
                      • {locData.current.temperature}°
                    </span>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </aside>

      {/* Footer */}
      <footer className="mt-6 border-t border-slate-800/80 bg-[#05080e] py-5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 font-mono-tech text-center sm:text-left">
          <div>
            AERO-MET NORTH GEORGIA // ALPHARETTA • ROSWELL • WOODSTOCK RC PILOT DASHBOARD
          </div>
          <div>
            OPEN-METEO (10M AGL) • UPDATED {current.fetchedAt}
          </div>
        </div>
      </footer>
    </div>
  );
}

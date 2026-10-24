import React, { useState, useEffect, useCallback } from 'react';
import {
  Wind,
  Thermometer,
  Gauge,
  MapPin,
  RefreshCw,
  Radio,
  PlaneTakeoff,
  Droplets,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  Navigation2,
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

  // Parse next 24 hours starting from current hour in Open-Meteo's returned timeline
  const times = data.hourly?.time || [];
  const temps = data.hourly?.temperature_2m || [];
  const winds = data.hourly?.wind_speed_10m || [];
  const gusts = data.hourly?.wind_gusts_10m || [];
  const dirs = data.hourly?.wind_direction_10m || [];
  const precips = data.hourly?.precipitation_probability || [];

  // Find index matching current hour (or closest hour not in the past)
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
    const wSpeed = Math.round(Number(winds[idx] ?? 0) * 10) / 10;
    const wGust = Math.round(Number(gusts[idx] ?? wSpeed) * 10) / 10;
    const wDir = Math.round(Number(dirs[idx] ?? 0));
    const tVal = Math.round(Number(temps[idx] ?? currentTemp));

    hourlySlice.push({
      isoTime: rawTime,
      timeLabel:
        i === 0
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
      isCurrentHour: i === 0,
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
        second: '2-digit',
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
        } catch (err) {
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
    <div className="min-h-svh flex flex-col justify-between text-slate-100">
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

      {/* Top Tactical Header & Location Pill Navigation */}
      <header className="sticky top-0 z-30 border-b border-slate-800/90 bg-[#070b12]/90 backdrop-blur-md">
        <div className="mx-auto max-w-6xl px-3 py-3 sm:px-6">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            {/* Brand & Title */}
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-emerald-500/50 bg-[#0b1324] shadow-[0_0_16px_rgba(16,185,129,0.28)]">
                  <svg width="42" height="42" aria-hidden="true" className="block">
                    <use href="#rc-airplane-symbol" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono-tech text-[11px] font-semibold uppercase tracking-widest text-emerald-400">
                      NORTH GA RC METEOROLOGY
                    </span>
                    <span className="inline-flex items-center gap-1 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2 py-0.2 font-mono-tech text-[10px] text-emerald-300">
                      <Radio className="h-2.5 w-2.5 animate-pulse" aria-hidden="true" />
                      OPEN-METEO LIVE
                    </span>
                  </div>
                  <h1 className="font-display text-lg sm:text-xl font-bold tracking-tight text-white">
                    RC Flight Deck // Wind &amp; Telemetry
                  </h1>
                </div>
              </div>

              {/* Mobile Refresh Button */}
              <button
                type="button"
                onClick={() => loadAllLocations(true)}
                disabled={refreshing}
                aria-label="Refresh weather telemetry"
                className="inline-flex md:hidden items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3 py-2 font-mono-tech text-xs font-semibold text-slate-200 active:scale-95"
              >
                <RefreshCw
                  className={`h-3.5 w-3.5 text-sky-400 ${refreshing ? 'animate-spin' : ''}`}
                  aria-hidden="true"
                />
                <span>SYNC</span>
              </button>
            </div>

            {/* 1. LOCATION SELECTOR / TABS */}
            <nav
              aria-label="Flying field location selector"
              className="grid grid-cols-3 gap-1.5 rounded-2xl border border-slate-800 bg-[#0b1220] p-1.5 shadow-inner"
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
                    className={`group relative flex flex-col items-start justify-between rounded-xl px-3 py-2 text-left transition sm:flex-row sm:items-center sm:gap-2.5 ${
                      isSelected
                        ? 'bg-slate-800/95 text-white shadow-md ring-1 ring-sky-400/50'
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
                        className={`mt-0.5 sm:mt-0 font-mono-tech text-[11px] font-semibold ${
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
      <main className="mx-auto w-full max-w-6xl flex-1 space-y-5 px-3 py-4 sm:px-6 sm:py-6">
        {errorNote && (
          <div
            role="status"
            className="flex items-center gap-2 rounded-xl border border-amber-500/40 bg-amber-500/10 px-4 py-2.5 text-xs font-mono-tech text-amber-200"
          >
            <AlertCircle className="h-4 w-4 shrink-0 text-amber-400" aria-hidden="true" />
            <span>{errorNote}</span>
          </div>
        )}

        {/* 2. CURRENT CONDITIONS BANNER */}
        <section
          aria-labelledby="current-conditions-heading"
          className={`tactical-card relative overflow-hidden rounded-2xl border ${status.borderClass} bg-[#0b111e]/95 p-4 sm:p-6 shadow-2xl`}
        >
          {/* Top Location Telemetry Strip + Flight Status Badge */}
          <div className="flex flex-col gap-4 border-b border-slate-800/90 pb-5 lg:flex-row lg:items-center lg:justify-between">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2 text-xs font-mono-tech text-slate-400">
                <span className="inline-flex items-center gap-1 rounded-md border border-slate-700/80 bg-slate-900/90 px-2 py-0.5 font-semibold text-sky-300">
                  <MapPin className="h-3.5 w-3.5 text-sky-400" aria-hidden="true" />
                  {activeLocation.coordsDisplay}
                </span>
                <span className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-300">
                  {activeLocation.sectorCode}
                </span>
                <span className="rounded-md border border-slate-800 bg-slate-900/60 px-2 py-0.5 text-slate-400">
                  ELEV {activeLocation.elevationFt} FT MSL
                </span>
              </div>

              <div className="flex flex-wrap items-baseline gap-3">
                <h2
                  id="current-conditions-heading"
                  className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-white"
                >
                  {activeLocation.name}
                </h2>
                <span className="text-xs sm:text-sm text-slate-400">
                  {activeLocation.fieldType}
                </span>
              </div>
            </div>

            {/* Primary Flight Status Badge + Desktop Refresh */}
            <div className="flex flex-wrap items-center gap-3">
              <div
                role="status"
                aria-live="polite"
                className={`status-pill flex items-center gap-2.5 rounded-2xl border px-4 py-2.5 font-display text-sm sm:text-base font-bold tracking-tight shadow-lg ${status.pillClass}`}
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
                className="hidden md:inline-flex items-center gap-1.5 rounded-xl border border-slate-700/80 bg-slate-900/90 px-3.5 py-2.5 font-mono-tech text-xs font-semibold text-slate-200 hover:border-sky-500/50 hover:text-white transition cursor-pointer"
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

          {/* Main Telemetry Grid: Wind Speed, Wind Gusts, Temperature, & Rotating Compass */}
          <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {/* Metric 1: Sustained Wind Speed */}
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Wind className="h-4 w-4 text-emerald-400" aria-hidden="true" />
                  SUSTAINED WIND
                </span>
                <span className={`font-bold ${status.textClass}`}>{status.code}</span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span
                    className={`font-mono-tech text-4xl sm:text-5xl font-extrabold tracking-tight ${status.textClass}`}
                  >
                    {current.windSpeed}
                  </span>
                  <span className="font-mono-tech text-lg font-semibold text-slate-400">
                    mph
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  10m AGL surface wind speed
                </p>
              </div>

              {/* Scale Meter */}
              <div className="space-y-1.5 border-t border-slate-800/80 pt-3">
                <div className="flex justify-between font-mono-tech text-[10px] text-slate-400">
                  <span>0 MPH</span>
                  <span>8 MPH</span>
                  <span>15+ MPH</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-slate-800">
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
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Gauge className="h-4 w-4 text-amber-400" aria-hidden="true" />
                  PEAK WIND GUSTS
                </span>
                <span className="rounded bg-slate-800 px-2 py-0.5 text-[11px] font-semibold text-amber-300">
                  Δ +{status.gustSpread} MPH
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tech text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {current.windGusts}
                  </span>
                  <span className="font-mono-tech text-lg font-semibold text-slate-400">
                    mph
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  {status.gustSpread >= 7
                    ? 'Elevated gust shear — carry extra approach speed'
                    : 'Low gust variance — predictable approach air'}
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 font-mono-tech text-xs">
                <span className="text-slate-400">TURBULENCE FACTOR</span>
                <span
                  className={`font-bold ${
                    status.gustSpread >= 7 ? 'text-amber-300' : 'text-emerald-300'
                  }`}
                >
                  {status.gustSpread >= 7 ? 'MODERATE CHOP' : 'LAMINAR / LOW'}
                </span>
              </div>
            </div>

            {/* Metric 3: Current Temperature & Air Density Info */}
            <div className="tactical-card flex flex-col justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-4 sm:p-5">
              <div className="flex items-center justify-between text-xs font-mono-tech uppercase tracking-wider text-slate-400">
                <span className="flex items-center gap-1.5">
                  <Thermometer className="h-4 w-4 text-sky-400" aria-hidden="true" />
                  AMBIENT TEMP
                </span>
                <span className="inline-flex items-center gap-1 text-slate-300">
                  <Droplets className="h-3 w-3 text-sky-400" aria-hidden="true" />
                  {current.humidity}% RH
                </span>
              </div>

              <div className="my-4">
                <div className="flex items-baseline gap-2">
                  <span className="font-mono-tech text-4xl sm:text-5xl font-extrabold tracking-tight text-white">
                    {current.temperature}°
                  </span>
                  <span className="font-mono-tech text-lg font-semibold text-slate-400">
                    F
                  </span>
                </div>
                <p className="mt-1.5 text-xs text-slate-400">
                  Feels like <strong className="text-slate-200">{current.apparentTemperature}°F</strong> at field level
                </p>
              </div>

              <div className="flex items-center justify-between border-t border-slate-800/80 pt-3 font-mono-tech text-xs">
                <span className="text-slate-400">LIPO / AIR DENSITY</span>
                <span className="font-bold text-sky-300">
                  {current.temperature < 50
                    ? 'PRE-WARM LIPOS'
                    : current.temperature > 88
                    ? 'HIGH DENSITY ALT'
                    : 'OPTIMAL THRUST'}
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
          <div className="mt-4 flex flex-col gap-2 rounded-xl border border-slate-800/90 bg-slate-950/75 px-4 py-3 text-xs sm:flex-row sm:items-center sm:justify-between">
            <div className="space-y-0.5">
              <div className="font-mono-tech font-bold uppercase tracking-wider text-slate-200">
                ADVISORY: <span className={status.textClass}>{status.summary}</span>
              </div>
              <div className="text-slate-400">
                <strong className="text-slate-300">Local Sector Note:</strong> {activeLocation.notes}
              </div>
            </div>
            <div className="shrink-0 font-mono-tech text-[11px] text-slate-400 sm:text-right">
              <div>RECOMMENDED AIRFRAMES:</div>
              <div className="font-bold text-sky-300">{status.recommendedCrafts}</div>
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

      {/* Footer */}
      <footer className="mt-8 border-t border-slate-800/80 bg-[#05080e] py-5 text-xs text-slate-400">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-2 px-4 sm:flex-row sm:px-6 font-mono-tech">
          <div>
            AERO-MET NORTH GEORGIA // ALPHARETTA • ROSWELL • WOODSTOCK RC PILOT DASHBOARD
          </div>
          <div>
            TELEMETRY SOURCE: OPEN-METEO API (10M AGL) • UPDATED {current.fetchedAt}
          </div>
        </div>
      </footer>
    </div>
  );
}

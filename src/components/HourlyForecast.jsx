import React, { useState } from 'react';
import {
  Clock,
  Wind,
  Gauge,
  Thermometer,
  Navigation2,
  CheckCircle2,
  AlertTriangle,
  OctagonAlert,
  LayoutGrid,
  Table2,
  Sparkles,
} from 'lucide-react';
import { getWindStatus } from '../data/locations';

function StatusIcon({ level, className = 'h-3.5 w-3.5' }) {
  if (level === 'excellent') {
    return <CheckCircle2 className={`${className} text-emerald-400 shrink-0`} aria-hidden="true" />;
  }
  if (level === 'moderate') {
    return <AlertTriangle className={`${className} text-amber-400 shrink-0`} aria-hidden="true" />;
  }
  return <OctagonAlert className={`${className} text-rose-400 shrink-0`} aria-hidden="true" />;
}

export default function HourlyForecast({ hourly = [], locationName = '' }) {
  const [filterMode, setFilterMode] = useState('all'); // 'all' | 'flyable' | 'calm'
  const [layoutMode, setLayoutMode] = useState('both'); // 'both' | 'strip' | 'table'

  // Identify best flying windows (< 8 mph sustained, <= 14 mph gusts)
  const calmHoursCount = hourly.filter(
    (h) => getWindStatus(h.windSpeed, h.windGusts).level === 'excellent'
  ).length;
  const moderateHoursCount = hourly.filter(
    (h) => getWindStatus(h.windSpeed, h.windGusts).level === 'moderate'
  ).length;

  const filteredHours = hourly.filter((h) => {
    const st = getWindStatus(h.windSpeed, h.windGusts);
    if (filterMode === 'calm') return st.level === 'excellent';
    if (filterMode === 'flyable') return st.level === 'excellent' || st.level === 'moderate';
    return true;
  });

  // Find lowest wind hour in next 24h for quick pilot callout
  const bestHour =
    hourly.length > 0
      ? hourly.reduce((best, item) => (item.windSpeed < best.windSpeed ? item : best), hourly[0])
      : null;

  return (
    <section
      aria-labelledby="forecast-section-heading"
      className="space-y-4 rounded-2xl border border-slate-800/90 bg-[#0b111e]/95 p-4 sm:p-6 shadow-xl"
    >
      {/* Section Header + Legend + Controls */}
      <div className="flex flex-col gap-3 border-b border-slate-800/90 pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400" aria-hidden="true" />
            <h2
              id="forecast-section-heading"
              className="font-display text-lg sm:text-xl font-bold tracking-tight text-white"
            >
              24-Hour Tactical Flight Forecast
            </h2>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2.5 py-0.5 font-mono-tech text-xs font-semibold text-sky-300">
              NEXT 24 HRS
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Hourly surface telemetry (10m AGL) for <strong className="text-slate-200">{locationName}</strong>.
            {bestHour && (
              <span className="ml-1.5 inline-flex items-center gap-1 text-emerald-300 font-medium">
                <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
                Calmest window: {bestHour.timeLabel} ({bestHour.windSpeed} mph / gusts {bestHour.windGusts} mph)
              </span>
            )}
          </p>
        </div>

        {/* Filter & View Controls */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Intensity Filter Pills */}
          <div
            className="inline-flex rounded-xl border border-slate-800 bg-slate-950/90 p-1"
            role="group"
            aria-label="Filter forecast hours by wind limit"
          >
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                filterMode === 'all'
                  ? 'bg-sky-500/20 text-sky-200 border border-sky-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL (24)
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('calm')}
              className={`rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                filterMode === 'calm'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 &lt;8 MPH ({calmHoursCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('flyable')}
              className={`rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                filterMode === 'flyable'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ≤15 MPH ({calmHoursCount + moderateHoursCount})
            </button>
          </div>

          {/* View Mode Selector */}
          <div
            className="inline-flex rounded-xl border border-slate-800 bg-slate-950/90 p-1"
            role="group"
            aria-label="Forecast display mode"
          >
            <button
              type="button"
              onClick={() => setLayoutMode('both')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                layoutMode === 'both'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BOTH
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('strip')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                layoutMode === 'strip'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <LayoutGrid className="h-3.5 w-3.5" aria-hidden="true" />
              CARDS
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('table')}
              className={`flex items-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                layoutMode === 'table'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
              TABLE
            </button>
          </div>
        </div>
      </div>

      {/* Wind Intensity Legend Bar */}
      <div className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-slate-800/80 bg-slate-950/60 px-3.5 py-2 text-xs font-mono-tech">
        <span className="text-slate-400 uppercase tracking-wider">WIND INTENSITY KEY:</span>
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5 text-emerald-300">
            <span className="h-2.5 w-2.5 rounded-full bg-emerald-400 shadow-[0_0_8px_#10b981]" aria-hidden="true" />
            <span>&lt; 8 mph (Park Flyer / Optimal)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-amber-300">
            <span className="h-2.5 w-2.5 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" aria-hidden="true" />
            <span>8–15 mph (Moderate / Caution)</span>
          </span>
          <span className="inline-flex items-center gap-1.5 text-rose-300">
            <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" aria-hidden="true" />
            <span>&gt; 15 mph (Too Windy / No-Go)</span>
          </span>
        </div>
      </div>

      {filteredHours.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-8 text-center">
          <p className="font-mono-tech text-sm text-slate-300">
            No forecast hours match the selected wind filter ({filterMode.toUpperCase()}).
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="mt-3 rounded-lg border border-sky-500/40 bg-sky-500/15 px-3.5 py-1.5 font-mono-tech text-xs font-semibold text-sky-300 hover:bg-sky-500/25"
          >
            Show All 24 Hours
          </button>
        </div>
      ) : (
        <>
          {/* 1. HORIZONTAL TACTICAL SCROLL STRIP */}
          {(layoutMode === 'both' || layoutMode === 'strip') && (
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400">
                <span>QUICK-SCAN HORIZONTAL STRIP (SWIPE / SCROLL)</span>
                <span>{filteredHours.length} SLOTS SHOWN</span>
              </div>
              <div
                tabIndex={0}
                role="region"
                aria-label={`Horizontal 24-hour forecast strip for ${locationName}`}
                className="flex gap-3 overflow-x-auto pb-3 pt-1 scrollbar-thin focus:outline-none focus:ring-2 focus:ring-sky-500/60 rounded-xl"
              >
                {filteredHours.map((item) => {
                  const st = getWindStatus(item.windSpeed, item.windGusts);
                  const windBarPct = Math.min(100, Math.round((item.windSpeed / 24) * 100));
                  const gustBarPct = Math.min(100, Math.round((item.windGusts / 24) * 100));

                  return (
                    <article
                      key={item.isoTime}
                      className={`tactical-card relative flex min-w-[148px] sm:min-w-[156px] shrink-0 flex-col justify-between rounded-xl border p-3 transition hover:border-slate-600 ${
                        item.isCurrentHour
                          ? `${st.borderClass} bg-slate-900/95 ring-1 ring-sky-400/40`
                          : 'border-slate-800/90 bg-slate-950/80'
                      }`}
                    >
                      {/* Top Color Indicator Bar */}
                      <div
                        className={`-mx-3 -mt-3 mb-2.5 h-1.5 rounded-t-xl ${st.barClass}`}
                        aria-hidden="true"
                      />

                      {/* Time + Day + Status Icon */}
                      <div className="flex items-center justify-between gap-1">
                        <div>
                          <div className="font-mono-tech text-sm font-bold text-white">
                            {item.timeLabel}
                          </div>
                          <div className="font-mono-tech text-[10px] uppercase text-slate-400">
                            {item.dayLabel}
                          </div>
                        </div>
                        <span
                          className={`status-pill inline-flex items-center gap-1 rounded-md border px-1.5 py-0.5 font-mono-tech text-[10px] font-bold ${st.pillClass}`}
                        >
                          <StatusIcon level={st.level} className="h-3 w-3" />
                          {st.level === 'excellent'
                            ? 'GO'
                            : st.level === 'moderate'
                            ? 'MOD'
                            : 'HIGH'}
                        </span>
                      </div>

                      {/* Primary Sustained Wind + Gusts Readout */}
                      <div className="my-3 space-y-1.5">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-mono-tech text-slate-400">WIND</span>
                          <span className={`font-mono-tech text-lg font-extrabold ${st.textClass}`}>
                            {item.windSpeed}{' '}
                            <span className="text-xs font-normal text-slate-400">mph</span>
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-[11px] font-mono-tech text-slate-400">GUSTS</span>
                          <span className="font-mono-tech text-sm font-bold text-slate-200">
                            {item.windGusts}{' '}
                            <span className="text-[11px] font-normal text-slate-400">mph</span>
                          </span>
                        </div>

                        {/* Visual Wind + Gust Intensity Bar */}
                        <div
                          className="relative h-2 w-full overflow-hidden rounded-full bg-slate-800/90"
                          aria-hidden="true"
                        >
                          <div
                            className="absolute inset-y-0 left-0 rounded-full bg-slate-600/70"
                            style={{ width: `${gustBarPct}%` }}
                          />
                          <div
                            className={`absolute inset-y-0 left-0 rounded-full ${st.barClass}`}
                            style={{ width: `${windBarPct}%` }}
                          />
                        </div>
                      </div>

                      {/* Footer: Direction + Temp */}
                      <div className="flex items-center justify-between border-t border-slate-800/80 pt-2 text-xs font-mono-tech">
                        <div className="flex items-center gap-1 text-slate-200" title={`Wind from ${item.cardinal} (${item.windDirection}°)`}>
                          <Navigation2
                            className="wind-arrow-dynamic h-3.5 w-3.5 text-sky-400 shrink-0"
                            style={{ '--wind-deg': `${item.windDirection}deg` }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold">{item.cardinal}</span>
                          <span className="text-[11px] text-slate-400">{item.windDirection}°</span>
                        </div>
                        <div className="font-semibold text-amber-200">
                          {item.temperature}°F
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            </div>
          )}

          {/* 2. STRUCTURED RESPONSIVE TELEMETRY TABLE */}
          {(layoutMode === 'both' || layoutMode === 'table') && (
            <div className="space-y-2 pt-2">
              <div className="flex items-center justify-between text-xs font-mono-tech text-slate-400">
                <span>DETAILED TELEMETRY LOG (STICKY HEADERS // MOBILE CARD ADAPTIVE)</span>
                <span>10M AGL SENSOR GRID</span>
              </div>

              <div
                tabIndex={0}
                role="region"
                aria-labelledby="hourly-table-caption"
                className="table-wrapper rounded-xl border border-slate-800/90 bg-[#080d17]"
              >
                <table className="tactical-table text-left text-sm">
                  <caption id="hourly-table-caption" className="sr-only">
                    24-hour forecast table for {locationName} showing time, temperature, wind speed, wind gusts, direction, and flight status
                  </caption>
                  <thead className="bg-slate-900/95 font-mono-tech text-xs uppercase tracking-wider text-slate-300 border-b border-slate-800">
                    <tr>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Time (Local)
                      </th>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Temp (°F)
                      </th>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Wind Speed (mph)
                      </th>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Wind Gusts (mph)
                      </th>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Wind Direction
                      </th>
                      <th scope="col" className="px-4 py-3 border-b border-slate-800 bg-slate-900/95">
                        Flight Condition
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono-tech">
                    {filteredHours.map((item) => {
                      const st = getWindStatus(item.windSpeed, item.windGusts);
                      return (
                        <tr
                          key={item.isoTime}
                          className={`transition hover:bg-slate-900/70 ${
                            item.isCurrentHour ? 'bg-sky-950/25' : ''
                          }`}
                        >
                          {/* Sticky Row Header: Time */}
                          <th
                            scope="row"
                            className="px-4 py-3 font-bold text-white whitespace-nowrap"
                          >
                            <div className="flex items-center gap-2">
                              <span
                                className={`h-2.5 w-2.5 rounded-full shrink-0 ${st.dotClass}`}
                                aria-hidden="true"
                              />
                              <span>{item.timeLabel}</span>
                              <span className="rounded bg-slate-800/80 px-1.5 py-0.5 text-[10px] font-medium text-slate-400">
                                {item.dayLabel}
                              </span>
                            </div>
                          </th>

                          {/* Temperature */}
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                            <span className="inline-flex items-center gap-1 font-semibold">
                              <Thermometer className="h-3.5 w-3.5 text-amber-400" aria-hidden="true" />
                              {item.temperature}°F
                            </span>
                          </td>

                          {/* Wind Speed */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span className={`text-base font-extrabold ${st.textClass}`}>
                              {item.windSpeed} mph
                            </span>
                          </td>

                          {/* Wind Gusts */}
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                            <div className="inline-flex items-center gap-1.5">
                              <span className="font-bold">{item.windGusts} mph</span>
                              <span className="text-xs text-slate-400">
                                (Δ +{st.gustSpread})
                              </span>
                            </div>
                          </td>

                          {/* Wind Direction (Cardinal + Degrees + Rotating Arrow) */}
                          <td className="px-4 py-3 text-slate-200 whitespace-nowrap">
                            <div className="inline-flex items-center gap-2">
                              <span className="inline-flex h-6 w-6 items-center justify-center rounded-full border border-slate-700 bg-slate-900">
                                <Navigation2
                                  className="wind-arrow-dynamic h-3.5 w-3.5 text-sky-400"
                                  style={{ '--wind-deg': `${item.windDirection}deg` }}
                                  aria-hidden="true"
                                />
                              </span>
                              <span className="font-bold text-white">{item.cardinal}</span>
                              <span className="text-xs text-sky-400">
                                ({String(item.windDirection).padStart(3, '0')}°)
                              </span>
                            </div>
                          </td>

                          {/* Visual Color & Icon Indicator */}
                          <td className="px-4 py-3 whitespace-nowrap">
                            <span
                              className={`status-pill inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-bold ${st.pillClass}`}
                            >
                              <StatusIcon level={st.level} />
                              <span>{st.badgeText}</span>
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </section>
  );
}

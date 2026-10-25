import React, { useState, useRef } from 'react';
import {
  Clock,
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
  // Default to swipeable horizontal cards on mobile screens to avoid excessive vertical scrolling, and 'both' on desktop
  const [layoutMode, setLayoutMode] = useState(() =>
    typeof window !== 'undefined' && window.innerWidth < 768 ? 'strip' : 'both'
  );
  const stripRef = useRef(null);

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

  const bestHour =
    hourly.length > 0
      ? hourly.reduce((best, item) => (item.windSpeed < best.windSpeed ? item : best), hourly[0])
      : null;

  const scrollToHourCard = (isoTime) => {
    if (!stripRef.current) return;
    const target = stripRef.current.querySelector(`[data-hour-iso="${isoTime}"]`);
    if (target) {
      target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
    }
  };

  return (
    <section
      id="forecast-section"
      aria-labelledby="forecast-section-heading"
      className="tactical-card space-y-3.5 sm:space-y-4 rounded-2xl border border-slate-800/90 bg-[#0b111e]/95 p-3.5 sm:p-6 shadow-xl"
    >
      {/* Section Header + Controls */}
      <div className="flex flex-col gap-3 border-b border-slate-800/90 pb-3.5 sm:pb-4 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <Clock className="h-5 w-5 text-sky-400 shrink-0" aria-hidden="true" />
            <h2
              id="forecast-section-heading"
              className="font-display text-base sm:text-xl font-bold tracking-tight text-white"
            >
              24-Hour Flight Forecast
            </h2>
            <span className="rounded-full border border-sky-500/30 bg-sky-500/10 px-2 py-0.5 font-mono-tech text-[11px] font-semibold text-sky-300">
              NEXT 24H
            </span>
          </div>
          <p className="mt-1 text-xs sm:text-sm text-slate-400">
            Hourly 10m AGL wind &amp; gusts for <strong className="text-slate-200">{locationName}</strong>.
            {bestHour && (
              <span className="mt-1 sm:mt-0 sm:ml-1.5 inline-flex items-center gap-1 text-emerald-300 font-medium">
                <Sparkles className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                Calmest: {bestHour.timeLabel} ({bestHour.windSpeed} mph / gusts {bestHour.windGusts} mph)
              </span>
            )}
          </p>
        </div>

        {/* Mobile-friendly Filter & View Controls */}
        <div className="pill-wrap-balance gap-2">
          {/* Intensity Filter Pills */}
          <div
            className="inline-flex flex-1 sm:flex-initial rounded-xl border border-slate-800 bg-slate-950/90 p-1"
            role="group"
            aria-label="Filter forecast hours by wind limit"
          >
            <button
              type="button"
              onClick={() => setFilterMode('all')}
              className={`touch-target flex-1 sm:flex-initial rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
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
              className={`touch-target flex-1 sm:flex-initial rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                filterMode === 'calm'
                  ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              🟢 &lt;8 ({calmHoursCount})
            </button>
            <button
              type="button"
              onClick={() => setFilterMode('flyable')}
              className={`touch-target flex-1 sm:flex-initial rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                filterMode === 'flyable'
                  ? 'bg-amber-500/20 text-amber-200 border border-amber-400/40'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ≤15 ({calmHoursCount + moderateHoursCount})
            </button>
          </div>

          {/* View Mode Selector */}
          <div
            className="inline-flex flex-1 sm:flex-initial rounded-xl border border-slate-800 bg-slate-950/90 p-1"
            role="group"
            aria-label="Forecast display mode"
          >
            <button
              type="button"
              onClick={() => setLayoutMode('strip')}
              className={`touch-target flex-1 sm:flex-initial flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
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
              className={`touch-target flex-1 sm:flex-initial flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                layoutMode === 'table'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table2 className="h-3.5 w-3.5" aria-hidden="true" />
              TABLE
            </button>
            <button
              type="button"
              onClick={() => setLayoutMode('both')}
              className={`touch-target flex-1 sm:flex-initial flex items-center justify-center gap-1 rounded-lg px-2.5 py-1.5 font-mono-tech text-xs font-semibold transition ${
                layoutMode === 'both'
                  ? 'bg-slate-800 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              BOTH
            </button>
          </div>
        </div>
      </div>

      {/* 24-Hour Quick Flight Window Ribbon (Tap any hour bar to jump to it) */}
      {hourly.length > 0 && (
        <div className="rounded-xl border border-slate-800/80 bg-slate-950/75 p-2.5 sm:p-3">
          <div className="mb-1.5 flex items-center justify-between font-mono-tech text-[10px] sm:text-xs text-slate-400">
            <span>24H FLIGHT WINDOW RIBBON (TAP BAR TO JUMP)</span>
            <div className="flex items-center gap-2.5">
              <span className="inline-flex items-center gap-1 text-emerald-300">
                <span className="h-2 w-2 rounded-full bg-emerald-400" aria-hidden="true" />
                &lt;8
              </span>
              <span className="inline-flex items-center gap-1 text-amber-300">
                <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
                8–15
              </span>
              <span className="inline-flex items-center gap-1 text-rose-300">
                <span className="h-2 w-2 rounded-full bg-rose-500" aria-hidden="true" />
                &gt;15 mph
              </span>
            </div>
          </div>

          <div
            className="grid grid-cols-24 gap-0.5 sm:gap-1 items-end h-10 pt-1"
            role="group"
            aria-label="24-hour wind intensity overview bars"
          >
            {hourly.map((item) => {
              const st = getWindStatus(item.windSpeed, item.windGusts);
              const heightPct = Math.max(25, Math.min(100, Math.round((item.windSpeed / 20) * 100)));
              return (
                <button
                  key={item.isoTime}
                  type="button"
                  onClick={() => {
                    if (layoutMode === 'table') setLayoutMode('strip');
                    setFilterMode('all');
                    setTimeout(() => scrollToHourCard(item.isoTime), 50);
                  }}
                  aria-label={`${item.timeLabel}: ${item.windSpeed} mph wind, gusts ${item.windGusts} mph (${st.badgeText})`}
                  className="group relative flex h-full w-full flex-col justify-end rounded-sm focus:outline-none"
                >
                  <span
                    className={`w-full rounded-t-sm transition-all group-hover:opacity-100 ${st.barClass} ${
                      item.isCurrentHour ? 'ring-1 ring-white opacity-100' : 'opacity-85'
                    }`}
                    style={{ height: `${heightPct}%` }}
                  />
                </button>
              );
            })}
          </div>
          <div className="mt-1 flex justify-between font-mono-tech text-[10px] text-slate-400">
            <span>NOW</span>
            <span>+6H</span>
            <span>+12H</span>
            <span>+18H</span>
            <span>+23H</span>
          </div>
        </div>
      )}

      {filteredHours.length === 0 ? (
        <div className="rounded-xl border border-slate-800 bg-slate-900/50 p-6 text-center">
          <p className="font-mono-tech text-sm text-slate-300">
            No forecast hours match the selected wind filter ({filterMode.toUpperCase()}).
          </p>
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className="touch-target mt-3 rounded-lg border border-sky-500/40 bg-sky-500/15 px-4 py-2 font-mono-tech text-xs font-semibold text-sky-300 hover:bg-sky-500/25"
          >
            Show All 24 Hours
          </button>
        </div>
      ) : (
        <>
          {/* 1. HORIZONTAL TACTICAL SCROLL STRIP */}
          {(layoutMode === 'both' || layoutMode === 'strip') && (
            <div className="space-y-1.5">
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
                <span>SWIPE HORIZONTALLY FOR HOURLY TELEMETRY</span>
                <span>{filteredHours.length} HRS</span>
              </div>
              <div
                ref={stripRef}
                tabIndex={0}
                role="region"
                aria-label={`Horizontal 24-hour forecast strip for ${locationName}`}
                className="forecast-strip-scroller flex gap-2.5 sm:gap-3 pb-2.5 pt-1 rounded-xl"
              >
                {filteredHours.map((item) => {
                  const st = getWindStatus(item.windSpeed, item.windGusts);
                  const windBarPct = Math.min(100, Math.round((item.windSpeed / 24) * 100));
                  const gustBarPct = Math.min(100, Math.round((item.windGusts / 24) * 100));

                  return (
                    <article
                      key={item.isoTime}
                      data-hour-iso={item.isoTime}
                      className={`forecast-strip-card tactical-card relative flex min-w-[138px] sm:min-w-[154px] shrink-0 flex-col justify-between rounded-xl border p-3 transition hover:border-slate-600 ${
                        item.isCurrentHour
                          ? `${st.borderClass} bg-slate-900/95 ring-1 ring-sky-400/50`
                          : 'border-slate-800/90 bg-slate-950/85'
                      }`}
                    >
                      {/* Top Color Indicator Bar */}
                      <div
                        className={`-mx-3 -mt-3 mb-2 h-1.5 rounded-t-xl ${st.barClass}`}
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
                      <div className="my-2.5 space-y-1">
                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono-tech text-slate-400">WIND</span>
                          <span className={`font-mono-tech text-lg font-extrabold ${st.textClass}`}>
                            {item.windSpeed}{' '}
                            <span className="text-xs font-normal text-slate-400">mph</span>
                          </span>
                        </div>

                        <div className="flex items-baseline justify-between">
                          <span className="text-[10px] font-mono-tech text-slate-400">GUSTS</span>
                          <span
                            className={`font-mono-tech text-sm font-bold ${
                              item.windGusts > 20
                                ? 'text-rose-300'
                                : item.windGusts > 14
                                ? 'text-amber-200'
                                : 'text-slate-200'
                            }`}
                          >
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
                        <div className="flex items-center gap-1 text-slate-200">
                          <Navigation2
                            className="wind-arrow-dynamic h-3.5 w-3.5 text-sky-400 shrink-0"
                            style={{ '--wind-deg': `${item.windDirection}deg` }}
                            aria-hidden="true"
                          />
                          <span className="font-semibold">{item.cardinal}</span>
                          <span className="text-[10px] text-slate-400">{item.windDirection}°</span>
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
            <div className="space-y-2 pt-1">
              <div className="flex items-center justify-between text-[11px] font-mono-tech text-slate-400">
                <span>DETAILED TELEMETRY LOG (STICKY HEADERS)</span>
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

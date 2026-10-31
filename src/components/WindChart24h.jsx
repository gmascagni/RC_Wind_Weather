import { Sparkles, TrendingUp } from 'lucide-react';
import { convertWind, getUnitLabel } from '../config/flightConfig';

export default function WindChart24h({
  hourly = [],
  thresholds,
  bestWindow,
  windUnit = 'mph',
  onSelectHour,
  forecastDay = 'today',
  dayLabel = 'Next 24h',
}) {
  if (hourly.length < 2) return null;

  const unit = getUnitLabel(windUnit);
  const width = 680;
  const height = 210;
  const pad = { top: 22, right: 18, bottom: 32, left: 38 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;

  const maxRawMph = Math.max(
    thresholds.maxSustainedWindMph + 4,
    ...hourly.map((h) => h.windGusts),
    20
  );
  const maxVal = convertWind(maxRawMph, windUnit);
  const limitVal = convertWind(thresholds.maxSustainedWindMph, windUnit);

  const xFor = (i) => pad.left + (i / (hourly.length - 1)) * plotW;
  const yForMph = (mph) => {
    const val = convertWind(mph, windUnit);
    return pad.top + plotH - Math.min(1, Math.max(0, val / maxVal)) * plotH;
  };

  const windPoints = hourly.map((h, i) => `${xFor(i).toFixed(1)},${yForMph(h.windSpeed).toFixed(1)}`).join(' ');
  const gustPoints = hourly.map((h, i) => `${xFor(i).toFixed(1)},${yForMph(h.windGusts).toFixed(1)}`).join(' ');

  const areaPath = [
    `M ${xFor(0).toFixed(1)} ${(pad.top + plotH).toFixed(1)}`,
    ...hourly.map((h, i) => `L ${xFor(i).toFixed(1)} ${yForMph(h.windSpeed).toFixed(1)}`),
    `L ${xFor(hourly.length - 1).toFixed(1)} ${(pad.top + plotH).toFixed(1)} Z`,
  ].join(' ');

  const gustEnvelopePath = [
    `M ${xFor(0).toFixed(1)} ${yForMph(hourly[0].windGusts).toFixed(1)}`,
    ...hourly.map((h, i) => `L ${xFor(i).toFixed(1)} ${yForMph(h.windGusts).toFixed(1)}`),
    ...[...hourly].reverse().map((h, revIdx) => {
      const i = hourly.length - 1 - revIdx;
      return `L ${xFor(i).toFixed(1)} ${yForMph(h.windSpeed).toFixed(1)}`;
    }),
    'Z',
  ].join(' ');

  const limitY = yForMph(thresholds.maxSustainedWindMph);
  const winX1 = bestWindow ? xFor(bestWindow.startIdx) : 0;
  const winX2 = bestWindow ? xFor(bestWindow.endIdx) : 0;

  return (
    <section className="metal-panel avionics-panel relative overflow-hidden flex flex-col justify-between">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {/* WWII Cockpit Header */}
      <div className="panel-header flex-wrap justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="panel-badge" aria-hidden="true">04</span>
          <TrendingUp strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-ink truncate">
            24h Sustained vs. Gust Envelope • {dayLabel || (forecastDay === 'tomorrow' ? 'Tomorrow' : 'Next 24h')}
          </h2>
        </div>

        {bestWindow && (
          <div className="inline-flex items-center gap-1.5 rounded border border-good-line bg-good-surface px-2.5 py-0.5 font-instrument text-2xs font-bold text-good-ink">
            <Sparkles strokeWidth={2} className="h-3 w-3 text-good shrink-0" aria-hidden="true" />
            <span>
              Best Window: {bestWindow.startLabel}–{bestWindow.endLabel} ({convertWind(bestWindow.avgWindMph, windUnit)} {unit})
            </span>
          </div>
        )}
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-3">
        <div className="w-full overflow-x-auto rounded-control border border-line-strong bg-panel-inset p-2 shadow-inset">
          <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[18rem] block" role="img">
            <title>{`24-hour sustained wind and gust chart in ${unit}`}</title>
            <defs>
              <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.30" />
                <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
              </linearGradient>
            </defs>

            {/* Horizontal Y-Axis Gridlines */}
            {[0, 0.5, 1].map((frac) => {
              const y = pad.top + plotH * (1 - frac);
              const label = Math.round(maxVal * frac);
              return (
                <g key={frac}>
                  <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#3c4654" strokeWidth="1" strokeDasharray="3 3" />
                  <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#9faec0" fontSize="11" fontFamily="Share Tech Mono, monospace">
                    {label}
                  </text>
                </g>
              );
            })}

            {/* Best Window Highlight */}
            {bestWindow && (
              <g>
                <rect
                  x={winX1}
                  y={pad.top}
                  width={Math.max(8, winX2 - winX1)}
                  height={plotH}
                  fill="#4caf50"
                  fillOpacity="0.12"
                  rx="4"
                />
                <line x1={winX1} y1={pad.top} x2={winX1} y2={pad.top + plotH} stroke="#4caf50" strokeWidth="1.5" strokeDasharray="3 2" />
                <line x1={winX2} y1={pad.top} x2={winX2} y2={pad.top + plotH} stroke="#4caf50" strokeWidth="1.5" strokeDasharray="3 2" />
              </g>
            )}

            {/* Sustained Limit Threshold Line */}
            <line
              x1={pad.left}
              y1={limitY}
              x2={width - pad.right}
              y2={limitY}
              stroke="#d13535"
              strokeWidth="1.5"
              strokeDasharray="4 3"
            />
            <text
              x={width - pad.right}
              y={Math.max(pad.top + 10, limitY - 4)}
              textAnchor="end"
              fill="#d13535"
              fontSize="10"
              fontFamily="Share Tech Mono, monospace"
              fontWeight="bold"
            >
              LIMIT {limitVal} {unit}
            </text>

            {/* Gust Spread Envelope */}
            <path d={gustEnvelopePath} fill="#f59e0b" fillOpacity="0.12" />

            {/* Sustained Wind Fill */}
            <path d={areaPath} fill="url(#windFill)" />

            {/* Peak Gust Line (amber dashed) */}
            <polyline fill="none" stroke="#f59e0b" strokeWidth="1.75" strokeDasharray="3 2" points={gustPoints} />

            {/* Sustained Wind Line (cyan solid) */}
            <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={windPoints} />

            {/* Interactive / Clickable Hour Points */}
            {hourly.map((h, i) => {
              const cx = xFor(i);
              const cy = yForMph(h.windSpeed);
              return (
                <g key={h.time} className="cursor-pointer group" onClick={() => onSelectHour?.(h.time)}>
                  <circle
                    cx={cx}
                    cy={cy}
                    r="3.5"
                    fill="#38bdf8"
                    stroke="#121519"
                    strokeWidth="1.5"
                    className="transition group-hover:r-5 group-hover:fill-white"
                  />
                  {i % 4 === 0 && (
                    <text
                      x={cx}
                      y={pad.top + plotH + 18}
                      textAnchor="middle"
                      fill="#9faec0"
                      fontSize="10"
                      fontFamily="Share Tech Mono, monospace"
                    >
                      {h.displayTime}
                    </text>
                  )}
                </g>
              );
            })}
          </svg>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 font-instrument text-2xs text-ink-soft pt-1">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-2 w-4 rounded-full bg-avionics" />
              Sustained Wind
            </span>
            <span className="flex items-center gap-1.5 font-bold">
              <span className="h-0.5 w-4 border-b-2 border-dashed border-caution" />
              Peak Gusts
            </span>
            <span className="flex items-center gap-1.5 font-bold text-stop">
              <span className="h-0.5 w-4 border-b-2 border-dashed border-stop" />
              {limitVal} {unit} Limit
            </span>
          </div>
          <span className="text-ink-dim">Tap any node to jump to hour</span>
        </div>
      </div>
    </section>
  );
}

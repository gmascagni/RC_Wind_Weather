import { Sparkles, TrendingUp } from 'lucide-react';
import { convertWind, getUnitLabel } from '../config/flightConfig';

export default function WindChart24h({
  hourly = [],
  thresholds,
  bestWindow,
  windUnit = 'mph',
  onSelectHour,
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
    <section className="avionics-panel rounded-card border border-line bg-panel p-4 sm:p-5 shadow-panel flex flex-col justify-between gap-3">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <TrendingUp strokeWidth={2} className="h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-base sm:text-lg font-bold text-ink">
            24h Sustained vs. Gust Envelope
          </h2>
        </div>

        {bestWindow && (
          <div className="inline-flex items-center gap-1.5 rounded-pill border border-good-line bg-good-surface px-2.5 py-0.5 font-instrument text-2xs font-semibold text-good-ink">
            <Sparkles strokeWidth={2} className="h-3.5 w-3.5 text-good shrink-0" aria-hidden="true" />
            <span>
              Best Window: {bestWindow.startLabel}–{bestWindow.endLabel} ({convertWind(bestWindow.avgWindMph, windUnit)} {unit})
            </span>
          </div>
        )}
      </div>

      <div className="w-full overflow-x-auto">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto min-w-[18rem] block" role="img">
          <title>{`24-hour sustained wind and gust chart in ${unit}`}</title>
          <defs>
            <linearGradient id="windFill" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.32" />
              <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.02" />
            </linearGradient>
          </defs>

          {/* Horizontal Y-Axis Gridlines */}
          {[0, 0.5, 1].map((frac) => {
            const y = pad.top + plotH * (1 - frac);
            const label = Math.round(maxVal * frac);
            return (
              <g key={frac}>
                <line x1={pad.left} y1={y} x2={width - pad.right} y2={y} stroke="#1e2d47" strokeWidth="1" />
                <text x={pad.left - 6} y={y + 4} textAnchor="end" fill="#94a3b8" fontSize="11" fontFamily="monospace">
                  {label}
                </text>
              </g>
            );
          })}

          {/* Highlighted Best Flying Window Band */}
          {bestWindow && (
            <g>
              <rect
                x={winX1}
                y={pad.top}
                width={Math.max(12, winX2 - winX1)}
                height={plotH}
                fill="rgba(52, 211, 153, 0.14)"
                stroke="rgba(52, 211, 153, 0.45)"
                strokeDasharray="3 3"
              />
              <text x={(winX1 + winX2) / 2} y={pad.top + 12} textAnchor="middle" fill="#a7f3d0" fontSize="10" fontWeight="700" fontFamily="monospace">
                BEST WINDOW
              </text>
            </g>
          )}

          {/* Gust Spread Shaded Band + Sustained Fill */}
          <path d={gustEnvelopePath} fill="rgba(251, 191, 36, 0.14)" />
          <path d={areaPath} fill="url(#windFill)" />

          {/* Max Sustained Limit Line */}
          <line
            x1={pad.left}
            y1={limitY}
            x2={width - pad.right}
            y2={limitY}
            stroke="#fb7185"
            strokeWidth="1.5"
            strokeDasharray="5 4"
          />
          <text x={width - pad.right - 4} y={Math.max(14, limitY - 5)} textAnchor="end" fill="#fecdd3" fontSize="10" fontFamily="monospace">
            MAX LIMIT ({limitVal} {unit})
          </text>

          {/* Gust Polyline & Sustained Wind Polyline */}
          <polyline fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="4 3" points={gustPoints} />
          <polyline fill="none" stroke="#38bdf8" strokeWidth="2.5" points={windPoints} />

          {/* Data Nodes & X-Axis Labels every 4 hours */}
          {hourly.map((h, i) => {
            const cx = xFor(i);
            const cy = yForMph(h.windSpeed);
            return (
              <g key={h.epochSec} onClick={() => onSelectHour?.(h.isoTime)} className="cursor-pointer">
                <circle cx={cx} cy={cy} r={i === 0 ? '4' : '2.6'} fill={i === 0 ? '#34d399' : '#38bdf8'} />
                {i % 4 === 0 && (
                  <text x={cx} y={height - 8} textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
                    {h.hourShort}
                  </text>
                )}
              </g>
            );
          })}
        </svg>
      </div>

      {/* Chart Key */}
      <div className="flex flex-wrap items-center justify-between gap-2 font-instrument text-2xs text-ink-soft">
        <div className="flex flex-wrap items-center gap-4">
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 bg-avionics inline-block" aria-hidden="true" />
            Sustained ({unit})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-0.5 w-4 border-t-2 border-dashed border-caution inline-block" aria-hidden="true" />
            Gusts ({unit})
          </span>
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-xs bg-good-surface border border-good-line inline-block" aria-hidden="true" />
            Best Flying Window
          </span>
        </div>
        <span className="text-ink-dim">Tap forecast cards below for full hourly breakdown</span>
      </div>
    </section>
  );
}

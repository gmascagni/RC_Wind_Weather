import { Compass, PlaneTakeoff } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { normalizeDegrees, degreesToCardinal } from '../utils/aerodynamics';

export default function WindCompassCard({
  windDirection = 0,
  runwayHeadingDeg = 270,
  onChangeRunway,
  runwayInfo,
  statusLevel = 'good',
  windUnit = 'mph',
}) {
  const fromDeg = normalizeDegrees(windDirection);
  const blowsToDeg = (fromDeg + 180) % 360;
  const rwyDeg = normalizeDegrees(runwayHeadingDeg);
  const unit = getUnitLabel(windUnit);
  const accentHex = STATUS_THEME[statusLevel]?.hex || '#38bdf8';

  const stepRunway = (delta) => {
    onChangeRunway(normalizeDegrees(rwyDeg + delta));
  };

  return (
    <section className="avionics-panel rounded-card border border-line bg-panel p-4 sm:p-5 shadow-panel flex flex-col justify-between gap-4">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Compass strokeWidth={2} className="h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-base sm:text-lg font-bold text-ink">
            Wind Vector &amp; Runway Crosswind
          </h2>
        </div>
        <span className="rounded-pill border border-line-strong bg-panel-inset px-2.5 py-0.5 font-instrument text-2xs font-semibold text-avionics">
          ACTIVE {runwayInfo.rwyLabel} ({String(runwayInfo.activeHeadingDeg).padStart(3, '0')}°)
        </span>
      </div>

      <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
        <div className="flex flex-col items-center">
          <svg
            viewBox="0 0 200 200"
            className="h-48 w-48 sm:h-52 sm:w-52 block"
            role="img"
          >
            <title>{`Wind coming from ${fromDeg} degrees (${degreesToCardinal(fromDeg)}) and blowing toward ${blowsToDeg} degrees. Active runway heading ${runwayInfo.activeHeadingDeg} degrees.`}</title>
            <circle cx="100" cy="100" r="90" fill="#080e1a" stroke="#1e2d47" strokeWidth="2" />
            <circle cx="100" cy="100" r="68" fill="none" stroke="#1e2d47" strokeWidth="1" strokeDasharray="4 4" />

            {/* 36 compass ticks (every 10 deg) */}
            {Array.from({ length: 36 }, (_, i) => {
              const deg = i * 10;
              const major = deg % 90 === 0;
              const med = deg % 30 === 0;
              return (
                <line
                  key={deg}
                  x1="100"
                  y1="10"
                  x2="100"
                  y2={major ? '21' : med ? '17' : '14'}
                  stroke={major ? '#cbd5e1' : med ? '#64748b' : '#334155'}
                  strokeWidth={major ? '2.2' : '1.2'}
                  transform={`rotate(${deg} 100 100)`}
                />
              );
            })}

            {/* Cardinal Rose Labels */}
            <text x="100" y="34" textAnchor="middle" fill="#fb7185" fontSize="13" fontWeight="700" fontFamily="monospace">N</text>
            <text x="171" y="104" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="monospace">E</text>
            <text x="100" y="176" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="monospace">S</text>
            <text x="29" y="104" textAnchor="middle" fill="#cbd5e1" fontSize="12" fontWeight="600" fontFamily="monospace">W</text>

            {/* User Field Runway Strip */}
            <g transform={`rotate(${runwayInfo.activeHeadingDeg} 100 100)`}>
              <rect x="91" y="42" width="18" height="116" rx="3" fill="#18243d" stroke="#475569" strokeWidth="1.5" />
              <line x1="100" y1="50" x2="100" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 5" />
              {/* Launch nose triangle pointing UP along active runway heading */}
              <polygon points="100,45 95,55 105,55" fill="#38bdf8" />
            </g>

            {/* Meteorological Wind Vector: Origin badge at FROM deg, airflow arrow pointing TO blowsToDeg */}
            <g className="wind-vector-rotate" style={{ '--wind-deg': `${fromDeg}deg`, transformOrigin: '100px 100px' }}>
              {/* Origin puck on outer rim (WHERE WIND COMES FROM) */}
              <circle cx="100" cy="14" r="6" fill={accentHex} stroke="#070b12" strokeWidth="2" />
              {/* Airflow shaft blowing FROM top (14) THROUGH center TOWARD bottom (156) */}
              <line x1="100" y1="22" x2="100" y2="148" stroke={accentHex} strokeWidth="3" strokeLinecap="round" />
              {/* Arrowhead at bottom showing downwind airflow direction */}
              <polygon points="100,160 92,144 108,144" fill={accentHex} />
            </g>

            <circle cx="100" cy="100" r="4" fill="#f8fafc" stroke="#070b12" strokeWidth="1.5" />
          </svg>
          <p className="mt-1 text-center font-instrument text-2xs text-ink-dim">
            Rim dot = Wind <strong>FROM {String(fromDeg).padStart(3, '0')}°</strong> • Arrow = Airflow <strong>TO {String(blowsToDeg).padStart(3, '0')}°</strong>
          </p>
        </div>

        {/* Runway Heading Control & Crosswind Readout */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-control border border-line bg-panel-raised p-3">
              <div className="font-instrument text-2xs text-ink-dim">HEADWIND</div>
              <div className="mt-0.5 font-instrument text-xl font-bold text-good">
                {convertWind(runwayInfo.headwindMph, windUnit)} <span className="text-xs text-ink-soft">{unit}</span>
              </div>
              <div className="font-instrument text-2xs text-ink-soft">
                Off nose: {runwayInfo.angleOffNoseDeg}°
              </div>
            </div>

            <div className="rounded-control border border-line bg-panel-raised p-3">
              <div className="font-instrument text-2xs text-ink-dim">CROSSWIND</div>
              <div className={`mt-0.5 font-instrument text-xl font-bold ${runwayInfo.crosswindMph > 9 ? 'text-caution' : 'text-ink'}`}>
                {convertWind(runwayInfo.crosswindMph, windUnit)} <span className="text-xs text-ink-soft">{unit}</span>
              </div>
              <div className="font-instrument text-2xs text-ink-soft">
                Gust X-Wind: {convertWind(runwayInfo.gustCrosswindMph, windUnit)} ({runwayInfo.crosswindSide})
              </div>
            </div>
          </div>

          {/* Field Runway Heading Tuner */}
          <div className="rounded-control border border-line bg-panel-inset p-3 space-y-2">
            <div className="flex items-center justify-between">
              <label htmlFor="runway-heading-range" className="flex items-center gap-1.5 font-instrument text-2xs font-semibold text-ink-soft">
                <PlaneTakeoff strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
                FIELD STRIP ALIGNMENT
              </label>
              <span className="font-instrument text-xs font-bold text-avionics">
                {String(rwyDeg).padStart(3, '0')}° / {String((rwyDeg + 180) % 360).padStart(3, '0')}°
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => stepRunway(-10)}
                className="touch-target rounded-lg border border-line bg-panel px-2.5 font-instrument text-xs font-bold text-ink-soft hover:text-ink"
              >
                -10°
              </button>
              <input
                id="runway-heading-range"
                type="range"
                min="0"
                max="355"
                step="5"
                value={rwyDeg}
                onChange={(e) => onChangeRunway(Number(e.target.value))}
                className="w-full accent-sky-400 cursor-pointer"
              />
              <button
                type="button"
                onClick={() => stepRunway(10)}
                className="touch-target rounded-lg border border-line bg-panel px-2.5 font-instrument text-xs font-bold text-ink-soft hover:text-ink"
              >
                +10°
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

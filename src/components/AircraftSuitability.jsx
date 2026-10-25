import { Gauge, Compass, Wind } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { getAircraftRecommendations } from '../utils/aircraftRecommendations';
import { StatusIcon } from './StatusVisuals';

export default function AircraftSuitability({ currentObs, crosswindMph = 0, windUnit = 'mph' }) {
  const unit = getUnitLabel(windUnit);
  const recommendations = getAircraftRecommendations(currentObs, crosswindMph);
  const gustSpread = Math.max(
    0,
    Math.round(((currentObs?.windGusts || 0) - (currentObs?.windSpeed || 0)) * 10) / 10
  );

  return (
    <section className="space-y-4">
      <div className="avionics-panel rounded-card border border-line bg-panel p-4 sm:p-6 shadow-panel space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-control border border-line-strong bg-panel-inset">
              <svg width="32" height="32" aria-hidden="true" className="block">
                <use href="#rc-airplane-symbol" />
              </svg>
            </div>
            <div>
              <h2 className="font-display text-base sm:text-lg font-bold text-ink">
                Recommended RC Aircraft for Current Conditions
              </h2>
              <p className="text-xs text-ink-soft">
                Matched against live sustained wind, gust spread, precipitation, and runway crosswind
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
          {recommendations.map((rec) => {
            const theme = STATUS_THEME[rec.status];
            return (
              <article
                key={rec.id}
                className={`flex flex-col justify-between rounded-control border p-3.5 ${
                  rec.id === 'warbird60' ? 'border-avionics/50 bg-panel-raised' : 'border-line bg-panel-inset'
                }`}
              >
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center justify-between gap-1.5">
                    <span
                      className={`status-badge inline-flex items-center gap-1 rounded-pill border px-2.5 py-0.5 font-instrument text-2xs font-bold ${theme.border} ${theme.bg} ${theme.ink}`}
                    >
                      <StatusIcon level={rec.status} className="h-3.5 w-3.5" />
                      {rec.statusLabel}
                    </span>
                    <span className="font-instrument text-2xs text-ink-dim">{rec.wingLoading}</span>
                  </div>

                  <h3 className="font-display text-sm sm:text-base font-bold text-ink">{rec.name}</h3>
                  <p className="text-xs text-ink-soft">{rec.examples}</p>
                </div>

                <div className="mt-3 space-y-2 border-t border-line pt-2.5">
                  <div className="flex justify-between font-instrument text-2xs text-ink-soft">
                    <span>Envelope: ≤ {convertWind(rec.sustainedMax, windUnit)} {unit}</span>
                    <span>Gust: ≤ {convertWind(rec.gustMax, windUnit)} {unit}</span>
                  </div>
                  <p className="text-xs text-ink-dim">{rec.tip}</p>
                </div>
              </article>
            );
          })}
        </div>
      </div>

      {/* Collapsible Field Manual: Aerodynamic Rules of Thumb */}
      <details className="avionics-disclosure avionics-panel rounded-card border border-line bg-panel shadow-panel">
        <summary className="touch-target flex items-center justify-between gap-3 rounded-card p-4 sm:px-6">
          <span className="font-display text-sm sm:text-base font-bold text-ink">
            Field Manual: RC Wind &amp; Crosswind Rules of Thumb
          </span>
        </summary>

        <div className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:p-6 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-control border border-line bg-panel-inset p-3.5">
            <Gauge strokeWidth={2} className="mt-0.5 h-5 w-5 text-caution shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-caution-ink">
                50% Airspeed Gust Rule
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                Keep peak gusts below 50% of your model&apos;s top level airspeed. Current gust spread is{' '}
                <strong className="text-ink">+{convertWind(gustSpread, windUnit)} {unit}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-control border border-line bg-panel-inset p-3.5">
            <Compass strokeWidth={2} className="mt-0.5 h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-avionics">
                Warbird Taildragger Discipline
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                60-class warbirds (P-51, Spitfire, Corsair) have narrow main gear. Hold up-elevator during taxi, accelerate gradually, and wheel-land in crosswinds.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-control border border-line bg-panel-inset p-3.5">
            <Wind strokeWidth={2} className="mt-0.5 h-5 w-5 text-good shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-good-ink">
                North GA Pine Rotor Zone
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                Tall Georgia pines generate downwind mechanical curl extending 7× tree height. Carry 15% extra power through base-to-final turns.
              </p>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}

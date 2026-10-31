import { Gauge, Compass, Wind } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { getAircraftRecommendations } from '../utils/aircraftRecommendations';
import { StatusIcon } from './StatusVisuals';
import WindConditionScale from './WindConditionScale';

export default function AircraftSuitability({
  currentObs,
  crosswindMph = 0,
  windUnit = 'mph',
  forecastDay = 'today',
  dayLabel = 'Current Conditions',
}) {
  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const p40Src = `${baseUrl}p40-warhawk.jpg`.replace(/\/{2,}/g, '/');
  const unit = getUnitLabel(windUnit);
  const recommendations = getAircraftRecommendations(currentObs, crosswindMph);
  const gustSpread = Math.max(
    0,
    Math.round(((currentObs?.windGusts || 0) - (currentObs?.windSpeed || 0)) * 10) / 10
  );

  return (
    <section className="space-y-4">
      <WindConditionScale windSpeedMph={currentObs?.windSpeed} windUnit={windUnit} forecastDay={forecastDay} />

      {/* Collapsible Recommended Aircraft Section */}
      <details className="avionics-disclosure metal-panel avionics-panel relative overflow-hidden">
        <span className="rivet top-left" aria-hidden="true" />
        <span className="rivet top-right" aria-hidden="true" />
        <span className="rivet bottom-left" aria-hidden="true" />
        <span className="rivet bottom-right" aria-hidden="true" />

        <summary className="touch-target flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 cursor-pointer">
          <div className="flex flex-wrap items-center gap-2.5 min-w-0">
            <span className="panel-badge" aria-hidden="true">05</span>
            <div className="relative h-7 w-7 shrink-0 overflow-hidden rounded-full border border-stop/70 bg-panel-inset shadow-panel">
              <img
                src={p40Src}
                alt="Curtiss P-40 Warhawk"
                width={28}
                height={28}
                className="h-full w-full object-cover object-center block"
              />
            </div>
            <span className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-ink">
              Recommended RC Aircraft for {forecastDay === 'tomorrow' ? `Tomorrow (${dayLabel})` : 'Current Conditions'}
            </span>
            <span className="hidden sm:inline font-instrument text-2xs text-ink-dim uppercase">
              • Matched to wind, gusts &amp; crosswind
            </span>
          </div>
        </summary>

        <div className="border-t border-line p-4 sm:p-5">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
            {recommendations.map((rec) => {
              const theme = STATUS_THEME[rec.status];
              return (
                <article
                  key={rec.id}
                  className={`flex flex-col justify-between rounded-control border p-3.5 shadow-inset ${
                    rec.id === 'warbird60'
                      ? 'border-avionics/60 bg-panel-raised ring-1 ring-avionics/30'
                      : 'border-line-strong bg-panel-inset'
                  }`}
                >
                  <div className="space-y-2">
                    <div className="flex flex-wrap items-center justify-between gap-1.5">
                      <span
                        className={`status-badge inline-flex items-center gap-1 rounded border px-2 py-0.5 font-instrument text-2xs font-bold ${theme.border} ${theme.bg} ${theme.ink}`}
                      >
                        <StatusIcon level={rec.status} className="h-3.5 w-3.5" />
                        {rec.statusLabel}
                      </span>
                      <span className="font-instrument text-2xs text-ink-dim font-bold">{rec.wingLoading}</span>
                    </div>

                    <h3 className="font-display text-sm sm:text-base font-bold uppercase tracking-wide text-ink">{rec.name}</h3>
                    <p className="text-xs text-ink-soft">{rec.examples}</p>
                  </div>

                  <div className="mt-3 space-y-2 border-t border-line pt-2.5">
                    <div className="flex justify-between font-instrument text-2xs text-ink-soft font-bold">
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
      </details>

      {/* Collapsible Field Manual: Aerodynamic Rules of Thumb */}
      <details className="avionics-disclosure metal-panel avionics-panel relative overflow-hidden">
        <span className="rivet top-left" aria-hidden="true" />
        <span className="rivet top-right" aria-hidden="true" />
        <span className="rivet bottom-left" aria-hidden="true" />
        <span className="rivet bottom-right" aria-hidden="true" />

        <summary className="touch-target flex flex-col items-start gap-2.5 p-4 sm:px-5 cursor-pointer">
          <span className="font-display text-sm sm:text-base font-bold uppercase tracking-wide text-ink">
            ★ Field Manual: RC Wind &amp; Crosswind Rules of Thumb
          </span>
        </summary>

        <div className="grid grid-cols-1 gap-3 border-t border-line p-4 sm:p-5 sm:grid-cols-3">
          <div className="flex items-start gap-3 rounded-control border border-line-strong bg-panel-inset p-3.5 shadow-inset">
            <Gauge strokeWidth={2} className="mt-0.5 h-5 w-5 text-caution shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-caution-ink font-bold">
                50% Airspeed Gust Rule
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                Keep peak gusts below 50% of your model&apos;s top level airspeed. Current gust spread is{' '}
                <strong className="text-ink font-bold">+{convertWind(gustSpread, windUnit)} {unit}</strong>.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-control border border-line-strong bg-panel-inset p-3.5 shadow-inset">
            <Compass strokeWidth={2} className="mt-0.5 h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-avionics font-bold">
                Wing-Low vs. Crab
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                On final, crab into crosswind to track runway centerline. In ground effect, slip (bank into wind, opposite rudder) to align fuselage before touchdown.
              </p>
            </div>
          </div>

          <div className="flex items-start gap-3 rounded-control border border-line-strong bg-panel-inset p-3.5 shadow-inset">
            <Wind strokeWidth={2} className="mt-0.5 h-5 w-5 text-good shrink-0" aria-hidden="true" />
            <div>
              <strong className="block font-instrument text-xs uppercase text-good-ink font-bold">
                Downwind Turn Caution
              </strong>
              <p className="mt-1 text-xs text-ink-soft">
                Groundspeed skyrockets on the downwind leg. Don&apos;t pull elevator hard in panic when the model appears fast; keep nose slightly down to prevent stall.
              </p>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}

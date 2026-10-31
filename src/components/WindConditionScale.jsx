import { Wind } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { WIND_CONDITION_TIERS } from '../utils/aircraftRecommendations';
import { StatusIcon } from './StatusVisuals';

export default function WindConditionScale({ windSpeedMph = 0, windUnit = 'mph', forecastDay = 'today' }) {
  const speed = Number(windSpeedMph) || 0;
  const unit = getUnitLabel(windUnit).toUpperCase();
  const dayTag = forecastDay === 'tomorrow' ? 'TOMORROW' : 'NOW';

  const formatTierRange = (tier) => {
    if (!Number.isFinite(tier.maxMph) || tier.minMph >= 20) {
      return `${Math.round(convertWind(tier.minMph, windUnit))}+ ${unit}`;
    }
    const lo = Math.round(convertWind(tier.minMph, windUnit));
    const hi = Math.floor(convertWind(tier.maxMph, windUnit));
    return `${lo}–${hi} ${unit}`;
  };

  const currentTier =
    WIND_CONDITION_TIERS.find((tier) => speed >= tier.minMph && speed <= tier.maxMph) ||
    WIND_CONDITION_TIERS[0];
  const currentTheme = STATUS_THEME[currentTier.level];

  return (
    <details className="avionics-disclosure metal-panel avionics-panel relative overflow-hidden">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      <summary className="touch-target flex flex-wrap items-center justify-between gap-3 p-3.5 sm:px-5 cursor-pointer">
        <div className="flex flex-wrap items-center gap-2.5 min-w-0">
          <Wind strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
          <span className="font-display text-sm sm:text-base font-bold uppercase tracking-wide text-ink">
            Wind Condition Categories
          </span>
          <span
            className={`inline-flex items-center gap-1.5 rounded border px-2 py-0.5 font-instrument text-2xs font-bold ${currentTheme.border} ${currentTheme.bg} ${currentTheme.text}`}
          >
            <StatusIcon level={currentTier.level} className="h-3 w-3" />
            <span>
              {dayTag}: {convertWind(speed, windUnit)} {unit} ({formatTierRange(currentTier)} • {currentTier.title})
            </span>
          </span>
        </div>
      </summary>

      <div className="border-t border-line p-4 sm:p-5">
        {/* role="list" restores Safari list semantics when CSS Grid is applied */}
        <ul role="list" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
          {WIND_CONDITION_TIERS.map((tier) => {
            const isCurrent = speed >= tier.minMph && speed <= tier.maxMph;
            const theme = STATUS_THEME[tier.level];

            return (
              <li
                key={tier.id}
                className={`rounded-control border p-3 flex flex-col justify-between gap-1.5 transition shadow-inset ${
                  isCurrent
                    ? `${theme.border} ${theme.bg} ring-1 ${theme.border}`
                    : 'border-line-strong bg-panel-inset'
                }`}
              >
                <div className="flex items-center justify-between gap-1.5">
                  <span className={`inline-flex items-center gap-1 font-instrument text-2xs font-bold ${theme.text}`}>
                    <StatusIcon level={tier.level} className="h-3.5 w-3.5" />
                    {formatTierRange(tier)}
                  </span>
                  {isCurrent && (
                    <span className="rounded bg-avionics px-2 py-0.5 font-instrument text-2xs font-bold text-slate-950">
                      ACTIVE
                    </span>
                  )}
                </div>

                <div className={`font-display text-sm font-bold uppercase ${isCurrent ? theme.ink : 'text-ink'}`}>
                  {tier.title}
                </div>
                <p className="text-xs text-ink-soft">{tier.detail}</p>
              </li>
            );
          })}
        </ul>
      </div>
    </details>
  );
}

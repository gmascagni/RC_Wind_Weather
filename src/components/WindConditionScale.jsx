import { Wind } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { WIND_CONDITION_TIERS } from '../utils/aircraftRecommendations';
import { StatusIcon } from './StatusVisuals';

export default function WindConditionScale({ windSpeedMph = 0, windUnit = 'mph' }) {
  const speed = Number(windSpeedMph) || 0;
  const unit = getUnitLabel(windUnit).toUpperCase();

  const formatTierRange = (tier) => {
    if (!Number.isFinite(tier.maxMph) || tier.minMph >= 20) {
      return `${Math.round(convertWind(tier.minMph, windUnit))}+ ${unit}`;
    }
    const lo = Math.round(convertWind(tier.minMph, windUnit));
    const hi = Math.floor(convertWind(tier.maxMph, windUnit));
    return `${lo}–${hi} ${unit}`;
  };

  return (
    <div className="avionics-panel rounded-card border border-line bg-panel p-4 sm:p-6 shadow-panel space-y-3.5">
      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line pb-3">
        <div className="flex items-center gap-2">
          <Wind strokeWidth={2} className="h-5 w-5 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-base sm:text-lg font-bold text-ink">
            Wind Condition Categories
          </h2>
        </div>
        <span className="font-instrument text-2xs font-semibold text-avionics">
          CURRENT WIND: {convertWind(speed, windUnit)} {unit}
        </span>
      </div>

      {/* role="list" restores Safari list semantics when CSS Grid is applied */}
      <ul role="list" className="grid grid-cols-1 gap-2.5 sm:grid-cols-2 lg:grid-cols-4">
        {WIND_CONDITION_TIERS.map((tier) => {
          const isCurrent = speed >= tier.minMph && speed <= tier.maxMph;
          const theme = STATUS_THEME[tier.level];

          return (
            <li
              key={tier.id}
              className={`rounded-control border p-3 flex flex-col justify-between gap-1.5 transition ${
                isCurrent
                  ? `${theme.border} ${theme.bg} ${theme.glow}`
                  : 'border-line bg-panel-inset'
              }`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className={`inline-flex items-center gap-1 font-instrument text-2xs font-bold ${theme.text}`}>
                  <StatusIcon level={tier.level} className="h-3.5 w-3.5" />
                  {formatTierRange(tier)}
                </span>
                {isCurrent && (
                  <span className="rounded-pill bg-avionics px-2 py-0.5 font-instrument text-2xs font-bold text-slate-950">
                    NOW
                  </span>
                )}
              </div>

              <div className={`font-display text-sm font-bold ${isCurrent ? theme.ink : 'text-ink'}`}>
                {tier.title}
              </div>
              <p className="text-xs text-ink-soft">{tier.detail}</p>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

import { MapPin, AlertCircle, Clock, SlidersHorizontal, Star } from 'lucide-react';
import { AIRCRAFT_PRESETS, STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { StatusIcon } from './StatusVisuals';
import CockpitMetricsGrid from './CockpitMetricsGrid';

export default function HeroStatusBanner({
  location,
  isFavorite,
  onToggleFavorite,
  locState,
  status,
  runwayInfo,
  thresholds,
  windUnit,
  onOpenSettings,
}) {
  const current = locState.data.current;
  const theme = STATUS_THEME[status.level];
  const unit = getUnitLabel(windUnit);
  const elevFt = locState.data.elevationFt ?? location.elevationFt;
  const presetName =
    AIRCRAFT_PRESETS.find((p) => p.id === thresholds.presetId)?.label || 'Custom Aircraft Limits';

  return (
    <section
      className={`avionics-panel rounded-card border ${theme.border} ${theme.glow} bg-panel p-4 sm:p-6 shadow-panel`}
    >
      {(locState.error || locState.isStale) && (
        <div
          role="status"
          className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-control border border-caution-line bg-caution-surface px-3.5 py-2.5 text-xs text-caution-ink"
        >
          <span className="flex items-center gap-2 font-medium">
            <AlertCircle strokeWidth={2} className="h-4 w-4 text-caution shrink-0" aria-hidden="true" />
            {locState.error
              ? `Offline / feed error (${locState.error}) — showing last-good cached telemetry.`
              : 'Telemetry is older than 15 minutes — tap SYNC to refresh before launch.'}
          </span>
          <span className="font-instrument text-2xs font-bold uppercase">
            Updated {locState.ageLabel}
          </span>
        </div>
      )}

      <div className="flex flex-col gap-4 border-b border-line pb-5 lg:flex-row lg:items-center lg:justify-between">
        <div className="space-y-2 min-w-0">
          <div className="flex flex-wrap items-center gap-2 font-instrument text-2xs text-ink-soft">
            <span className="inline-flex items-center gap-1 rounded-md border border-line-strong bg-panel-inset px-2 py-0.5 text-avionics">
              <MapPin strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              {location.coordsDisplay}
            </span>
            {elevFt !== null && elevFt !== undefined && (
              <span className="rounded-md border border-line bg-panel-inset px-2 py-0.5">
                ELEV {elevFt} FT
              </span>
            )}
            <span className="inline-flex items-center gap-1 rounded-md border border-line bg-panel-inset px-2 py-0.5 text-ink-dim">
              <Clock strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              Updated {locState.ageLabel}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h2 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-ink">
              {location.name}
            </h2>
            <button
              type="button"
              onClick={() => onToggleFavorite(location)}
              aria-pressed={isFavorite}
              className={`touch-target inline-flex items-center gap-1.5 rounded-control border px-3 font-instrument text-2xs font-bold transition ${
                isFavorite
                  ? 'border-caution-line bg-caution-surface text-caution-ink'
                  : 'border-line bg-panel-inset text-ink-soft hover:border-line-strong hover:text-ink'
              }`}
            >
              <Star
                strokeWidth={2}
                className="h-4 w-4 text-caution shrink-0"
                fill={isFavorite ? 'currentColor' : 'none'}
                aria-hidden="true"
              />
              {isFavorite ? 'FAVORITED' : 'ADD FAVORITE'}
            </button>
          </div>
          <p className="text-xs sm:text-sm text-ink-soft">{location.notes}</p>
        </div>

        <div
          role="status"
          aria-live="polite"
          className={`status-badge flex flex-col items-start sm:items-end rounded-card border ${theme.border} ${theme.bg} px-4 py-3 sm:px-5 sm:py-3.5`}
        >
          <div className="flex items-center gap-2.5">
            <StatusIcon level={status.level} className="h-7 w-7 sm:h-8 sm:w-8" />
            <span className={`font-display font-bold tracking-tight hero-verdict-size ${theme.text}`}>
              {status.verdict}
            </span>
          </div>
          <button
            type="button"
            onClick={onOpenSettings}
            className="mt-1 inline-flex items-center gap-1.5 font-instrument text-2xs text-ink-soft hover:text-ink underline decoration-line-strong underline-offset-4"
          >
            <SlidersHorizontal strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
            <span>Profile: {presetName}</span>
          </button>
        </div>
      </div>

      <div className="mt-3.5 flex flex-wrap items-center justify-between gap-2 rounded-control border border-line bg-panel-inset px-3.5 py-2.5 text-xs">
        <div className="text-ink-soft">
          <strong className={`font-instrument uppercase ${theme.text}`}>{status.shortTag}: </strong>
          {status.reasons.join(' • ')}
        </div>
        <div className="font-instrument text-2xs text-avionics">
          {runwayInfo.rwyLabel} X-WIND: {convertWind(runwayInfo.crosswindMph, windUnit)} {unit}
        </div>
      </div>

      <CockpitMetricsGrid
        current={current}
        status={status}
        runwayInfo={runwayInfo}
        thresholds={thresholds}
        windUnit={windUnit}
      />
    </section>
  );
}

import { RefreshCw, SlidersHorizontal, Sun } from 'lucide-react';
import { STATUS_THEME, WIND_UNITS, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';

export default function TopBar({
  locations,
  selectedId,
  onSelectLocation,
  getLocationState,
  thresholds,
  windUnit,
  onChangeUnit,
  daylightBoost,
  onToggleDaylight,
  onOpenSettings,
  isRefreshing,
  onRefresh,
}) {
  const unitLabel = getUnitLabel(windUnit);

  return (
    <header className="safe-top-bar sticky top-0 z-30 border-b border-line bg-deck-bg/95 backdrop-blur-md">
      <div className="mx-auto max-w-6xl px-3 py-2.5 sm:px-6">
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          {/* Top Row: Emblem + Title + Utility Controls */}
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control border border-good-line bg-panel">
                <svg width="38" height="38" aria-hidden="true" className="block">
                  <use href="#rc-airplane-symbol" />
                </svg>
              </div>
              <div className="min-w-0">
                <div className="font-instrument text-2xs font-semibold uppercase tracking-wider text-avionics truncate">
                  NORTH GA RC AVIONICS
                </div>
                <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-ink truncate">
                  RC Wind Weather
                </h1>
              </div>
            </div>

            {/* Right Controls: Units, Limits, Sun Boost, Refresh */}
            <div className="flex flex-wrap items-center gap-1.5">
              {/* Units Segmented Control */}
              <div
                role="group"
                aria-label="Wind speed units"
                className="inline-flex rounded-control border border-line bg-panel-inset p-0.5"
              >
                {Object.values(WIND_UNITS).map((u) => {
                  const active = windUnit === u.id;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onChangeUnit(u.id)}
                      aria-pressed={active}
                      className={`touch-target rounded-lg px-2.5 font-instrument text-2xs font-bold transition ${
                        active
                          ? 'bg-panel-raised text-avionics border border-line-strong'
                          : 'text-ink-dim hover:text-ink'
                      }`}
                    >
                      {u.label}
                    </button>
                  );
                })}
              </div>

              <button
                type="button"
                onClick={onOpenSettings}
                aria-label="Configure aircraft wind limits"
                className="touch-target inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-2.5 font-instrument text-2xs font-semibold text-ink-soft hover:border-line-strong hover:text-ink"
              >
                <SlidersHorizontal strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">LIMITS</span>
              </button>

              <button
                type="button"
                onClick={onToggleDaylight}
                aria-pressed={daylightBoost}
                aria-label="Toggle outdoor sunlight contrast boost"
                className={`touch-target inline-flex items-center gap-1 rounded-control border px-2.5 font-instrument text-2xs font-semibold transition ${
                  daylightBoost
                    ? 'border-caution-line bg-caution-surface text-caution-ink'
                    : 'border-line bg-panel text-ink-soft hover:text-ink'
                }`}
              >
                <Sun strokeWidth={2} className="h-4 w-4 text-caution shrink-0" aria-hidden="true" />
                <span className="hidden sm:inline">SUN</span>
              </button>

              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh weather data"
                className="touch-target inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-2.5 font-instrument text-2xs font-semibold text-ink-soft hover:border-line-strong hover:text-ink"
              >
                <RefreshCw
                  strokeWidth={2}
                  className={`h-4 w-4 text-avionics shrink-0 ${isRefreshing ? 'spin-refresh' : ''}`}
                  aria-hidden="true"
                />
                <span className="hidden sm:inline">SYNC</span>
              </button>
            </div>
          </div>

          {/* Segmented Location Control */}
          <nav
            aria-label="Flying field locations"
            className="grid grid-cols-3 gap-1 rounded-card border border-line bg-panel-inset p-1"
          >
            {locations.map((loc) => {
              const isSelected = loc.id === selectedId;
              const locState = getLocationState(loc.id);
              const obs = locState.data?.current;
              const evalStatus = obs ? evaluateFlightStatus(obs, thresholds) : null;
              const theme = evalStatus ? STATUS_THEME[evalStatus.level] : null;

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => onSelectLocation(loc.id)}
                  aria-pressed={isSelected}
                  className={`touch-target flex flex-col items-center justify-center rounded-control px-2 py-1.5 transition sm:flex-row sm:justify-between sm:gap-2 sm:px-3 ${
                    isSelected
                      ? 'bg-panel-raised text-ink border border-line-strong shadow-sm'
                      : 'text-ink-dim hover:bg-panel hover:text-ink-soft'
                  }`}
                >
                  <span className="flex items-center gap-1.5 min-w-0">
                    {evalStatus && <StatusIcon level={evalStatus.level} className="h-3.5 w-3.5" />}
                    <span className="font-display text-xs sm:text-sm font-bold truncate">
                      {loc.shortName}
                    </span>
                  </span>
                  {obs && (
                    <span className={`font-instrument text-2xs font-semibold ${isSelected ? theme.text : 'text-ink-dim'}`}>
                      {convertWind(obs.windSpeed, windUnit)} {unitLabel}
                    </span>
                  )}
                </button>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}

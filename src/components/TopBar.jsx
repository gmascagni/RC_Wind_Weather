import { RefreshCw, SlidersHorizontal, Star, Sun, X } from 'lucide-react';
import { STATUS_THEME, WIND_UNITS, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';
import LocationSearchBar from './LocationSearchBar';

export default function TopBar({
  activeLocation,
  favorites,
  onSelectLocation,
  onToggleFavorite,
  onRemoveFavorite,
  onLocateGps,
  isLocatingGps,
  gpsError,
  onClearGpsError,
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
      <div className="mx-auto max-w-6xl space-y-2.5 px-3 py-2.5 sm:px-6">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-control border border-good-line bg-panel">
              <svg width="38" height="38" aria-hidden="true" className="block">
                <use href="#rc-airplane-symbol" />
              </svg>
            </div>
            <div className="min-w-0">
              <div className="font-instrument text-2xs font-semibold uppercase tracking-wider text-avionics truncate">
                RC FLIGHT TELEMETRY DECK
              </div>
              <h1 className="font-display text-base sm:text-lg font-bold tracking-tight text-ink truncate">
                RC Wind Weather
              </h1>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-1.5">
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

            {activeLocation && (
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
            )}
          </div>
        </div>

        <LocationSearchBar
          onSelectLocation={onSelectLocation}
          onLocateGps={onLocateGps}
          isLocatingGps={isLocatingGps}
          gpsError={gpsError}
          onClearGpsError={onClearGpsError}
          favorites={favorites}
          onToggleFavorite={onToggleFavorite}
        />

        {favorites.length > 0 && (
          <nav aria-label="Favorite flying locations" className="flex items-center gap-1.5 overflow-x-auto pb-0.5">
            <span className="inline-flex shrink-0 items-center gap-1 font-instrument text-2xs font-semibold uppercase text-caution">
              <Star strokeWidth={2} className="h-3.5 w-3.5" fill="currentColor" aria-hidden="true" />
              FAVS:
            </span>
            {favorites.map((fav) => {
              const isSelected = activeLocation?.id === fav.id;
              const obs = getLocationState(fav.id).data?.current;
              const evalStatus = obs ? evaluateFlightStatus(obs, thresholds) : null;
              const theme = evalStatus ? STATUS_THEME[evalStatus.level] : null;

              return (
                <div
                  key={fav.id}
                  className={`inline-flex shrink-0 items-center rounded-control border transition ${
                    isSelected
                      ? 'border-line-strong bg-panel-raised text-ink'
                      : 'border-line bg-panel-inset text-ink-soft hover:text-ink'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectLocation(fav)}
                    aria-pressed={isSelected}
                    className="touch-target inline-flex items-center gap-1.5 px-3 font-display text-xs font-bold"
                  >
                    {evalStatus && <StatusIcon level={evalStatus.level} className="h-3.5 w-3.5" />}
                    <span>{fav.shortName}</span>
                    {obs && (
                      <span className={`font-instrument text-2xs font-semibold ${theme.text}`}>
                        {convertWind(obs.windSpeed, windUnit)} {unitLabel}
                      </span>
                    )}
                  </button>
                  <button
                    type="button"
                    onClick={() => onRemoveFavorite(fav.id)}
                    aria-label={`Remove ${fav.name} from favorites`}
                    className="touch-target inline-flex items-center justify-center border-l border-line px-2 text-ink-dim hover:text-stop"
                  >
                    <X strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              );
            })}
          </nav>
        )}
      </div>
    </header>
  );
}

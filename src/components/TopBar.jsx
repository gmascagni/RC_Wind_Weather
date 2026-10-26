import { RefreshCw, SlidersHorizontal, Star, Sun, X } from 'lucide-react';
import { STATUS_THEME, WIND_UNITS, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon, UsaacWingedCrest } from './StatusVisuals';
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
  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const p40Src = `${baseUrl}p40-warhawk.jpg`.replace(/\/{2,}/g, '/');

  return (
    <header className="safe-top-bar sticky top-0 z-30 metal-panel rounded-none border-t-0 border-x-0 border-b-2 border-line-strong bg-panel/95 backdrop-blur-md">
      {/* Decorative Cockpit Screws & Top-Right Dog-Ear Badge (Matching rc-power-bench) */}
      <span className="screw top-2 left-2" aria-hidden="true" />
      <span className="screw bottom-2 left-2" aria-hidden="true" />
      <div
        className="pointer-events-none absolute top-0 right-0 z-20 h-0 w-0 border-solid border-t-0 border-r-[38px] border-b-[38px] border-l-0 border-r-stop border-transparent"
        aria-hidden="true"
      >
        <span className="absolute top-[3px] right-[-32px] block w-[35px] text-center font-instrument text-[7.5px] font-bold text-white rotate-45">
          v3.0.0
        </span>
      </div>

      <div className="mx-auto max-w-6xl space-y-2.5 px-3 py-2.5 sm:px-6">
        {/* Top Header Row with Winged USAAC Crest, Center Title, and Aviator Banner */}
        <div className="flex flex-col gap-2.5 lg:flex-row lg:items-center lg:justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <UsaacWingedCrest className="h-10 sm:h-12 w-auto" />
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="status-lamp green" aria-hidden="true" />
                <h1 className="font-display text-lg sm:text-2xl font-bold tracking-wider uppercase text-ink truncate">
                  ★ RC WIND WEATHER PRO ★
                </h1>
              </div>
              <div className="flex flex-wrap items-center gap-2 font-instrument text-2xs">
                <span className="font-bold text-avionics tracking-wider">
                  .60 CLASS WARBIRD FLIGHT DECK
                </span>
                <span className="text-line-strong hidden sm:inline">|</span>
                <span className="font-script text-base text-amber-200 hidden sm:inline">
                  Check the Wind. Keep &apos;Em Flying!
                </span>
              </div>
            </div>
          </div>

          {/* Right Aviator Banner + Cockpit Controls (Matching rc-power-bench) */}
          <div className="flex flex-wrap items-center justify-end gap-2">
            {/* Desktop Aviator Thumbnail Banner */}
            <div className="hidden xl:flex items-center gap-2.5 pl-2">
              <div className="relative h-[50px] w-[130px] overflow-hidden rounded-xs border border-line-strong bg-panel-inset shadow-panel">
                <img
                  src={p40Src}
                  alt="P-40 Warhawk"
                  width={130}
                  height={50}
                  className="h-full w-full object-cover object-center block"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#1b1712]/90 via-transparent to-transparent" />
                <span className="absolute top-0.5 right-1.5 font-script text-sm text-red-400 drop-shadow">
                  Flying Tigers
                </span>
                <span className="absolute bottom-0 right-1.5 font-script text-[11px] text-amber-200 drop-shadow">
                  No Gusts Too High
                </span>
              </div>
              <div className="relative h-11 w-11 overflow-hidden rounded-pill border-2 border-line-strong bg-panel-inset shadow-panel flex items-center justify-center p-0.5">
                <svg width="34" height="34" aria-hidden="true" className="block">
                  <use href="#usaac-star-symbol" />
                </svg>
              </div>
            </div>

            {/* Units Toggle Segmented Group */}
            <div
              role="group"
              aria-label="Wind speed units"
              className="inline-flex rounded-xs border border-line bg-panel-inset p-0.5"
            >
              {Object.values(WIND_UNITS).map((u) => {
                const active = windUnit === u.id;
                return (
                  <button
                    key={u.id}
                    type="button"
                    onClick={() => onChangeUnit(u.id)}
                    aria-pressed={active}
                    className={`touch-target rounded-xs px-2.5 font-instrument text-2xs font-bold transition ${
                      active ? 'btn-retro active' : 'text-ink-dim hover:text-ink'
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
              className="btn-retro touch-target inline-flex items-center gap-1.5 px-3 py-1.5 text-2xs font-bold"
            >
              <SlidersHorizontal strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
              <span className="hidden sm:inline">LIMITS</span>
            </button>

            <button
              type="button"
              onClick={onToggleDaylight}
              aria-pressed={daylightBoost}
              aria-label="Toggle outdoor sunlight contrast boost"
              className={`btn-retro touch-target inline-flex items-center gap-1 px-3 py-1.5 text-2xs font-bold ${
                daylightBoost ? 'active border-caution text-caution-ink' : ''
              }`}
            >
              <Sun strokeWidth={2} className="h-3.5 w-3.5 text-caution" aria-hidden="true" />
              <span className="hidden sm:inline">SUN</span>
            </button>

            {activeLocation && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                aria-label="Refresh weather data"
                className="btn-retro touch-target inline-flex items-center gap-1.5 px-3 py-1.5 text-2xs font-bold"
              >
                <RefreshCw
                  strokeWidth={2}
                  className={`h-3.5 w-3.5 text-avionics ${isRefreshing ? 'spin-refresh' : ''}`}
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
              FAVORITES:
            </span>
            {favorites.map((fav) => {
              const isSelected = activeLocation?.id === fav.id;
              const obs = getLocationState(fav.id).data?.current;
              const evalStatus = obs ? evaluateFlightStatus(obs, thresholds) : null;
              const theme = evalStatus ? STATUS_THEME[evalStatus.level] : null;

              return (
                <div
                  key={fav.id}
                  className={`inline-flex shrink-0 items-center rounded-xs border transition ${
                    isSelected
                      ? 'border-avionics bg-panel-raised text-ink'
                      : 'border-line bg-panel-inset text-ink-soft hover:text-ink'
                  }`}
                >
                  <button
                    type="button"
                    onClick={() => onSelectLocation(fav)}
                    aria-pressed={isSelected}
                    className="touch-target inline-flex items-center gap-1.5 px-3 font-display text-xs font-bold uppercase tracking-wider"
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

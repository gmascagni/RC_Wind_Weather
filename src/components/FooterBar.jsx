import { RefreshCw, Star, GitBranch } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { APP_VERSION } from '../config/versionConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';

export default function FooterBar({
  favorites,
  selectedId,
  onSelectLocation,
  getLocationState,
  thresholds,
  windUnit,
  timezoneLabel,
  ageLabel,
  hasActiveLocation,
  isRefreshing,
  onRefresh,
  onOpenVersion,
}) {
  const unit = getUnitLabel(windUnit);
  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const privacyUrl = `${baseUrl}privacy.html`.replace(/\/{2,}/g, '/');

  return (
    <>
      <footer className="mt-4 border-t border-line bg-deck-panel/90 py-2 text-[10px] text-ink-dim shadow-panel">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-center sm:justify-between gap-x-3 gap-y-1 px-3 sm:px-6 font-instrument">
          <div className="text-center sm:text-left">
            <span>
              SOURCE:{' '}
              <a
                href="https://open-meteo.com/"
                target="_blank"
                rel="noreferrer"
                className="text-ink-soft underline underline-offset-2 hover:text-ink"
              >
                OPEN-METEO (10M AGL)
              </a>
              {timezoneLabel ? ` • ${timezoneLabel.toUpperCase()}` : ''}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5 text-[10px]">
            <button
              type="button"
              onClick={onOpenVersion}
              className="inline-flex items-center gap-1 font-bold text-avionics hover:underline"
              title="Open Version Control & Changelog"
            >
              <GitBranch strokeWidth={2} className="h-2.5 w-2.5" aria-hidden="true" />
              <span>{APP_VERSION}</span>
            </button>

            <a
              href={privacyUrl}
              target="_blank"
              rel="noreferrer"
              className="text-ink-dim/70 hover:text-ink hover:underline text-[9px] tracking-normal font-normal"
            >
              Privacy
            </a>

            {hasActiveLocation && (
              <span className="text-ink-dim">UPDATED: {ageLabel.toUpperCase()}</span>
            )}

            {hasActiveLocation && (
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className="inline-flex items-center gap-1 rounded border border-line bg-panel-inset px-2 py-0.5 text-[9px] text-ink-soft hover:text-ink"
              >
                <RefreshCw
                  strokeWidth={2}
                  className={`h-2.5 w-2.5 text-avionics ${isRefreshing ? 'spin-refresh' : ''}`}
                  aria-hidden="true"
                />
                REFRESH
              </button>
            )}
          </div>
        </div>
      </footer>

      {favorites.length > 0 && (
        <nav
          aria-label="Mobile favorite fields switcher"
          className="safe-bottom-dock fixed inset-x-0 bottom-0 z-40 border-t border-line-strong bg-deck-bg/95 px-2.5 pt-2 backdrop-blur-md md:hidden"
        >
          <div className="mx-auto flex max-w-md items-center gap-1.5 overflow-x-auto pb-0.5">
            {favorites.map((loc) => {
              const active = loc.id === selectedId;
              const obs = getLocationState(loc.id).data?.current;
              const st = obs ? evaluateFlightStatus(obs, thresholds) : null;
              const theme = st ? STATUS_THEME[st.level] : null;

              return (
                <button
                  key={loc.id}
                  type="button"
                  onClick={() => {
                    onSelectLocation(loc);
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  aria-pressed={active}
                  className={`touch-target flex min-w-[6.5rem] flex-1 shrink-0 flex-col items-center justify-center rounded-control border px-2.5 py-1 transition ${
                    active
                      ? `${theme ? theme.border : 'border-line-strong'} bg-panel-raised text-ink ring-1 ring-avionics/40`
                      : 'border-line bg-panel text-ink-dim'
                  }`}
                >
                  <span className="flex items-center gap-1 font-display text-xs font-bold truncate max-w-full uppercase">
                    {st ? (
                      <StatusIcon level={st.level} className="h-3 w-3" />
                    ) : (
                      <Star strokeWidth={2} className="h-3 w-3 text-caution" fill="currentColor" aria-hidden="true" />
                    )}
                    <span className="truncate">{loc.shortName}</span>
                  </span>
                  {obs && (
                    <span className={`font-instrument text-2xs font-semibold ${theme.text}`}>
                      {convertWind(obs.windSpeed, windUnit)} {unit}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </>
  );
}

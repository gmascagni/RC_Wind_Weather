import { RefreshCw } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { evaluateFlightStatus } from '../utils/aerodynamics';
import { StatusIcon } from './StatusVisuals';

export default function FooterBar({
  locations,
  selectedId,
  onSelectLocation,
  getLocationState,
  thresholds,
  windUnit,
  ageLabel,
  isRefreshing,
  onRefresh,
}) {
  const unit = getUnitLabel(windUnit);

  return (
    <>
      <footer className="mt-8 border-t border-line bg-panel-inset py-5 text-xs text-ink-soft">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 sm:flex-row sm:px-6 font-instrument">
          <div className="text-center sm:text-left">
            SOURCE:{' '}
            <a
              href="https://open-meteo.com/"
              target="_blank"
              rel="noreferrer"
              className="text-avionics underline underline-offset-4 hover:text-ink"
            >
              OPEN-METEO NOAA HRRR / GFS (10M AGL)
            </a>{' '}
            • AMERICA/NEW_YORK
          </div>

          <div className="flex items-center gap-3">
            <span className="text-ink-dim">LAST UPDATED: {ageLabel.toUpperCase()}</span>
            <button
              type="button"
              onClick={onRefresh}
              disabled={isRefreshing}
              className="touch-target inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-3 font-instrument text-2xs font-bold text-ink hover:border-line-strong"
            >
              <RefreshCw
                strokeWidth={2}
                className={`h-3.5 w-3.5 text-avionics ${isRefreshing ? 'spin-refresh' : ''}`}
                aria-hidden="true"
              />
              REFRESH
            </button>
          </div>
        </div>
      </footer>

      {/* Mobile One-Handed Bottom Location Switcher (Safe-Area Aware) */}
      <nav
        aria-label="Quick field switcher"
        className="safe-bottom-dock fixed inset-x-0 bottom-0 z-40 border-t border-line bg-deck-bg/95 px-2.5 pt-2 backdrop-blur-md md:hidden"
      >
        <div className="mx-auto grid max-w-md grid-cols-3 gap-1.5">
          {locations.map((loc) => {
            const active = loc.id === selectedId;
            const obs = getLocationState(loc.id).data?.current;
            const st = obs ? evaluateFlightStatus(obs, thresholds) : null;
            const theme = st ? STATUS_THEME[st.level] : null;

            return (
              <button
                key={loc.id}
                type="button"
                onClick={() => {
                  onSelectLocation(loc.id);
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                aria-pressed={active}
                className={`touch-target flex flex-col items-center justify-center rounded-control border px-2 py-1 transition ${
                  active
                    ? `${theme ? theme.border : 'border-line-strong'} bg-panel-raised text-ink`
                    : 'border-line bg-panel text-ink-dim'
                }`}
              >
                <span className="flex items-center gap-1 font-display text-xs font-bold">
                  {st && <StatusIcon level={st.level} className="h-3 w-3" />}
                  {loc.shortName}
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
    </>
  );
}

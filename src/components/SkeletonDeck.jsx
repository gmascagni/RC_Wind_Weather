import { WifiOff, RefreshCw, LocateFixed, Search } from 'lucide-react';

export function SkeletonDeck() {
  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const p40Src = `${baseUrl}p40-warhawk.jpg`.replace(/\/{2,}/g, '/');

  return (
    <div aria-busy="true" aria-label="Loading flight telemetry" className="space-y-4">
      <div className="metal-panel overflow-hidden">
        <span className="rivet top-left" aria-hidden="true" />
        <span className="rivet top-right" aria-hidden="true" />
        <span className="rivet bottom-left" aria-hidden="true" />
        <span className="rivet bottom-right" aria-hidden="true" />

        <div className="panel-header justify-between">
          <div className="flex items-center gap-2">
            <span className="status-lamp amber pulse-live" aria-hidden="true" />
            <h2 className="font-display text-base font-bold uppercase tracking-wider text-ink">
              ★ SCRAMBLING P-40 WEATHER RECON ★
            </h2>
          </div>
          <span className="font-instrument text-2xs font-bold text-avionics uppercase">
            POLLING 10M TELEMETRY SENSORS…
          </span>
        </div>

        <div className="p-4 sm:p-5 space-y-4">
          {/* Featured P-40 Warhawk with Sharks Teeth Flying Through Clouds */}
          <div className="relative overflow-hidden rounded-xs border border-line-strong bg-panel-inset shadow-panel">
            <div className="aspect-[16/9] sm:aspect-[21/9] w-full max-h-72 overflow-hidden relative">
              <img
                src={p40Src}
                alt="Curtiss P-40 Warhawk with Flying Tigers shark teeth flying through sky"
                fetchPriority="high"
                width={800}
                height={343}
                className="h-full w-full object-cover object-center block"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-panel-inset via-transparent to-transparent opacity-80" />
              <div className="absolute bottom-3 left-3 right-3 flex flex-wrap items-end justify-between gap-2">
                <div>
                  <span className="font-script text-xl sm:text-2xl text-amber-200 drop-shadow-md">
                    Check the Wind. Keep &apos;Em Flying!
                  </span>
                  <div className="font-instrument text-2xs font-bold text-avionics tracking-wider">
                    CURTISS P-40 WARHAWK • FLYING TIGERS SQUADRON
                  </div>
                </div>
                <span className="rounded-xs border border-avionics bg-panel-inset/90 px-2 py-0.5 font-instrument text-2xs font-bold text-avionics">
                  ACQUIRING NO-GO ENVELOPE…
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
            {Array.from({ length: 4 }, (_, i) => (
              <div key={i} className="skeleton-shimmer h-24 rounded-xs border border-line" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

export function WelcomeFieldPrompt({ onLocateGps, isLocatingGps }) {
  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const p40Src = `${baseUrl}p40-warhawk.jpg`.replace(/\/{2,}/g, '/');

  return (
    <section className="metal-panel overflow-hidden shadow-panel">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <span className="status-lamp green" aria-hidden="true" />
          <h2 className="font-display text-base sm:text-lg font-bold uppercase tracking-wider text-ink">
            ★ SELECT YOUR RC FLYING FIELD ★
          </h2>
        </div>
        <span className="font-instrument text-2xs font-bold text-avionics uppercase">
          USAAC FLIGHT OPERATIONS
        </span>
      </div>

      <div className="p-4 sm:p-6 space-y-5">
        <div className="relative overflow-hidden rounded-xs border border-line-strong bg-panel-inset shadow-panel">
          <div className="aspect-[16/9] sm:aspect-[21/9] w-full max-h-80 overflow-hidden relative">
            <img
              src={p40Src}
              alt="Curtiss P-40 Warhawk with shark mouth nose art flying in sunlit clouds"
              fetchPriority="high"
              width={800}
              height={343}
              className="h-full w-full object-cover object-center block"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-panel-inset via-panel-inset/20 to-transparent" />
            <div className="absolute bottom-3 left-4 right-4 flex flex-wrap items-end justify-between gap-2">
              <div>
                <div className="font-script text-2xl sm:text-3xl text-amber-200 drop-shadow-md">
                  Keep &apos;Em Flying!
                </div>
                <p className="font-instrument text-2xs text-ink-soft">
                  WWII Warbird Avionics Cockpit &amp; Real-Time Crosswind Calculator
                </p>
              </div>
              <div className="flex items-center gap-2">
                <svg width="34" height="34" aria-hidden="true" className="block drop-shadow">
                  <use href="#usaac-star-symbol" />
                </svg>
              </div>
            </div>
          </div>
        </div>

        <p className="mx-auto max-w-xl text-center text-xs sm:text-sm text-ink-soft">
          Search any city or ZIP code above, or tap <strong>Locate by GPS</strong> right from the flight line to load 10m wind speed, peak gust spread, runway crosswind component, and aircraft suitability. Star your club fields to save them to your Favorites dock.
        </p>

        <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
          <button
            type="button"
            onClick={onLocateGps}
            disabled={isLocatingGps}
            className="btn-red-launcher touch-target inline-flex items-center gap-2 px-5 py-2.5"
          >
            <LocateFixed strokeWidth={2} className={`h-4 w-4 shrink-0 ${isLocatingGps ? 'spin-refresh' : ''}`} aria-hidden="true" />
            <span>{isLocatingGps ? 'ACQUIRING GPS LOCK…' : 'LOCATE FIELD BY GPS'}</span>
          </button>
          <label
            htmlFor="city-search-input"
            className="btn-retro touch-target inline-flex cursor-pointer items-center gap-2 px-5 py-2.5"
          >
            <Search strokeWidth={2} className="h-4 w-4 text-avionics" aria-hidden="true" />
            SEARCH CITY / ZIP
          </label>
        </div>
      </div>
    </section>
  );
}

export function OfflineEmptyState({ locationName, error, onRetry, isRefreshing }) {
  return (
    <section role="alert" className="metal-panel p-6 sm:p-8 text-center space-y-4 shadow-panel">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill border border-stop-line bg-stop-surface text-stop">
        <WifiOff strokeWidth={2} className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold uppercase text-ink">
          Telemetry Link Severed: {locationName}
        </h2>
        <p className="mx-auto max-w-md text-xs sm:text-sm text-ink-soft">
          {error || 'No live connection or cached weather snapshot is available yet.'} Never launch without verifying field wind conditions.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="btn-retro touch-target inline-flex items-center gap-2 px-4 py-2"
      >
        <RefreshCw strokeWidth={2} className={`h-4 w-4 ${isRefreshing ? 'spin-refresh' : ''}`} aria-hidden="true" />
        RETRY TELEMETRY LINK
      </button>
    </section>
  );
}

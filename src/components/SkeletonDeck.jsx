import { WifiOff, RefreshCw } from 'lucide-react';

export function SkeletonDeck() {
  return (
    <div aria-busy="true" aria-label="Loading flight telemetry" className="space-y-4">
      <div className="rounded-card border border-line bg-panel p-5 space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <div className="space-y-2">
            <div className="skeleton-shimmer h-5 w-44 rounded-md" />
            <div className="skeleton-shimmer h-8 w-56 rounded-md" />
          </div>
          <div className="skeleton-shimmer h-16 w-full sm:w-64 rounded-card" />
        </div>
        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton-shimmer h-28 rounded-card border border-line" />
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <div className="skeleton-shimmer h-64 rounded-card border border-line" />
        <div className="skeleton-shimmer h-64 rounded-card border border-line" />
      </div>
    </div>
  );
}

export function OfflineEmptyState({ locationName, error, onRetry, isRefreshing }) {
  return (
    <section
      role="alert"
      className="avionics-panel rounded-card border border-stop-line bg-panel p-6 sm:p-8 text-center space-y-4 shadow-panel"
    >
      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill border border-stop-line bg-stop-surface text-stop">
        <WifiOff strokeWidth={2} className="h-6 w-6" aria-hidden="true" />
      </div>
      <div className="space-y-1">
        <h2 className="font-display text-xl font-bold text-ink">
          Telemetry Unavailable for {locationName}
        </h2>
        <p className="mx-auto max-w-md text-sm text-ink-soft">
          {error || 'No live connection or cached weather snapshot is available yet.'} Never launch without verifying field wind conditions.
        </p>
      </div>
      <button
        type="button"
        onClick={onRetry}
        disabled={isRefreshing}
        className="touch-target inline-flex items-center gap-2 rounded-control border border-line-strong bg-panel-raised px-4 font-instrument text-xs font-bold text-avionics hover:text-ink"
      >
        <RefreshCw strokeWidth={2} className={`h-4 w-4 ${isRefreshing ? 'spin-refresh' : ''}`} aria-hidden="true" />
        Retry Telemetry Fetch
      </button>
    </section>
  );
}

import { useState, useEffect, useRef } from 'react';
import { Search, LocateFixed, Star, MapPin, AlertCircle, X } from 'lucide-react';
import { searchCities } from '../services/geocoding';

export default function LocationSearchBar({
  onSelectLocation,
  onLocateGps,
  isLocatingGps,
  gpsError,
  onClearGpsError,
  favorites,
  onToggleFavorite,
}) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState(null);
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef(null);

  useEffect(() => {
    const trimmed = query.trim();
    if (trimmed.length < 2) return undefined;

    const controller = new AbortController();
    const timer = window.setTimeout(async () => {
      setIsSearching(true);
      setSearchError(null);
      try {
        const matches = await searchCities(trimmed, controller.signal);
        setResults(matches);
        setOpen(true);
      } catch (err) {
        if (err?.name !== 'AbortError') {
          setSearchError('Unable to search cities — check network connection.');
        }
      } finally {
        if (!controller.signal.aborted) setIsSearching(false);
      }
    }, 260);

    return () => {
      window.clearTimeout(timer);
      controller.abort();
    };
  }, [query]);

  useEffect(() => {
    const onDocClick = (e) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    document.addEventListener('pointerdown', onDocClick);
    return () => document.removeEventListener('pointerdown', onDocClick);
  }, []);

  const chooseCity = (loc) => {
    onSelectLocation(loc);
    setQuery('');
    setResults([]);
    setOpen(false);
    onClearGpsError?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (results.length > 0) chooseCity(results[0]);
  };

  const showDropdown = open && query.trim().length >= 2;
  const favIds = new Set(favorites.map((f) => f.id));

  return (
    <div ref={wrapperRef} className="relative space-y-2">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end">
        <search className="flex-1 min-w-0">
          <form action="#" method="get" onSubmit={handleSubmit} className="space-y-1">
            <label
              htmlFor="city-search-input"
              className="block font-instrument text-2xs font-semibold uppercase tracking-wider text-ink-soft"
            >
              Find Flying Field by City or ZIP
            </label>
            <div className="relative flex items-center">
              <Search strokeWidth={2} className="pointer-events-none absolute left-3 h-4 w-4 text-ink-dim" aria-hidden="true" />
              <input
                id="city-search-input"
                name="city"
                type="search"
                value={query}
                onFocus={() => setOpen(true)}
                onChange={(e) => {
                  const next = e.target.value;
                  setQuery(next);
                  setSearchError(null);
                  if (next.trim().length < 2) {
                    setResults([]);
                    setIsSearching(false);
                  }
                }}
                onKeyDown={(e) => {
                  if (e.nativeEvent.isComposing) return;
                  if (e.key === 'Escape') setOpen(false);
                }}
                autoCorrect="off"
                autoCapitalize="off"
                spellCheck={false}
                enterKeyHint="search"
                aria-expanded={showDropdown}
                aria-controls="city-search-results"
                placeholder="e.g. Denver, Phoenix, Dallas, 85001…"
                className="touch-target w-full rounded-control border border-line bg-panel-inset pl-9 pr-9 text-base text-ink placeholder:text-ink-dim focus:border-avionics"
              />
              {query && (
                <button
                  type="button"
                  onClick={() => {
                    setQuery('');
                    setResults([]);
                    setOpen(false);
                  }}
                  aria-label="Clear search query"
                  className="absolute right-1.5 inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-dim hover:text-ink"
                >
                  <X strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
                </button>
              )}
            </div>
          </form>
        </search>

        <button
          type="button"
          onClick={onLocateGps}
          disabled={isLocatingGps}
          className="touch-target inline-flex shrink-0 items-center justify-center gap-2 rounded-control border border-avionics bg-avionics-soft px-4 font-instrument text-xs font-bold text-avionics hover:text-ink"
        >
          <LocateFixed strokeWidth={2} className={`h-4 w-4 shrink-0 ${isLocatingGps ? 'spin-refresh' : ''}`} aria-hidden="true" />
          <span>{isLocatingGps ? 'LOCATING GPS…' : 'LOCATE BY GPS'}</span>
        </button>
      </div>

      {(gpsError || searchError) && (
        <div role="alert" className="flex items-center gap-2 rounded-control border border-caution-line bg-caution-surface px-3 py-2 text-xs text-caution-ink">
          <AlertCircle strokeWidth={2} className="h-4 w-4 shrink-0 text-caution" aria-hidden="true" />
          <span>{gpsError || searchError}</span>
        </div>
      )}

      {showDropdown && (
        <div
          id="city-search-results"
          className="absolute inset-x-0 top-full z-50 mt-1 max-h-72 overflow-y-auto rounded-card border border-line-strong bg-panel shadow-panel"
        >
          {isSearching ? (
            <div className="px-4 py-3 font-instrument text-xs text-ink-soft">Searching airfields &amp; cities…</div>
          ) : results.length === 0 ? (
            <div className="px-4 py-3 font-instrument text-xs text-ink-dim">No matching cities found for &ldquo;{query.trim()}&rdquo;.</div>
          ) : (
            <ul role="list" className="divide-y divide-line">
              {results.map((loc) => {
                const starred = favIds.has(loc.id);
                return (
                  <li key={loc.id} className="flex items-center justify-between gap-2 px-2 py-1 hover:bg-panel-raised">
                    <button
                      type="button"
                      onClick={() => chooseCity(loc)}
                      className="touch-target flex flex-1 items-center gap-2.5 px-2 text-left min-w-0"
                    >
                      <MapPin strokeWidth={2} className="h-4 w-4 shrink-0 text-avionics" aria-hidden="true" />
                      <span className="min-w-0 flex-1">
                        <span className="block font-display text-sm font-bold text-ink truncate">{loc.name}</span>
                        <span className="block font-instrument text-2xs text-ink-dim truncate">
                          {loc.coordsDisplay}{loc.elevationFt !== null ? ` • ELEV ${loc.elevationFt} FT` : ''}
                        </span>
                      </span>
                    </button>
                    <button
                      type="button"
                      onClick={() => onToggleFavorite(loc)}
                      aria-pressed={starred}
                      aria-label={starred ? `Remove ${loc.name} from favorites` : `Save ${loc.name} to favorites`}
                      className="touch-target inline-flex items-center justify-center rounded-control px-2.5 text-caution hover:bg-panel-inset"
                    >
                      <Star strokeWidth={2} className="h-4 w-4" fill={starred ? 'currentColor' : 'none'} aria-hidden="true" />
                    </button>
                  </li>
                );
              })}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

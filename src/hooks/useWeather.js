import { useState, useEffect, useRef, useCallback } from 'react';
import { AUTO_REFRESH_MS, STALE_AFTER_MS } from '../config/flightConfig';
import { fetchOpenMeteoForLocation } from '../services/openMeteo';

const CACHE_KEY = 'rc_wind_weather_cache_v2';

function loadCachedTelemetry() {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    return raw ? JSON.parse(raw) : {};
  } catch {
    return {};
  }
}

function saveCachedTelemetry(map) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(map));
  } catch {
    // Ignore storage quota errors
  }
}

export function formatRelativeAge(fetchedAtMs, nowMs) {
  if (!fetchedAtMs) return 'Never updated';
  const diffSec = Math.max(0, Math.floor((nowMs - fetchedAtMs) / 1000));
  if (diffSec < 35) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const hrs = Math.floor(diffMin / 60);
  const remMin = diffMin % 60;
  return remMin > 0 ? `${hrs}h ${remMin}m ago` : `${hrs}h ago`;
}

export function useWeather(locations) {
  const [cacheById, setCacheById] = useState(loadCachedTelemetry);
  const [errorsById, setErrorsById] = useState({});
  const [isInitialLoading, setIsInitialLoading] = useState(() => Object.keys(loadCachedTelemetry()).length === 0);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const abortRef = useRef(null);
  const inFlightRef = useRef(false);

  const refreshAll = useCallback(
    async (manual = false) => {
      if (inFlightRef.current && !manual) return;
      if (abortRef.current) {
        abortRef.current.abort();
      }

      const controller = new AbortController();
      abortRef.current = controller;
      inFlightRef.current = true;
      setIsRefreshing(true);

      const results = await Promise.allSettled(
        locations.map(async (loc) => {
          const payload = await fetchOpenMeteoForLocation(loc, controller.signal);
          return { id: loc.id, payload };
        })
      );

      if (controller.signal.aborted) return;

      setCacheById((prev) => {
        const next = { ...prev };
        for (const res of results) {
          if (res.status === 'fulfilled') {
            next[res.value.id] = res.value.payload;
          }
        }
        saveCachedTelemetry(next);
        return next;
      });

      setErrorsById(() => {
        const nextErrs = {};
        results.forEach((res, idx) => {
          if (res.status === 'rejected' && res.reason?.name !== 'AbortError') {
            const locId = locations[idx].id;
            nextErrs[locId] = res.reason?.message || 'Unable to reach Open-Meteo weather feed';
          }
        });
        return nextErrs;
      });

      setNowMs(Date.now());
      setIsInitialLoading(false);
      setIsRefreshing(false);
      inFlightRef.current = false;
    },
    [locations]
  );

  // Initial fetch, auto-refresh interval, and relative-time ticker — paused when tab is hidden
  useEffect(() => {
    let refreshTimer = null;
    let ageTicker = null;

    const startTimers = () => {
      clearInterval(refreshTimer);
      clearInterval(ageTicker);
      refreshTimer = setInterval(() => {
        if (!document.hidden) refreshAll(false);
      }, AUTO_REFRESH_MS);
      ageTicker = setInterval(() => {
        if (!document.hidden) setNowMs(Date.now());
      }, 30000);
    };

    const handleVisibility = () => {
      if (document.hidden) {
        clearInterval(refreshTimer);
        clearInterval(ageTicker);
      } else {
        const currentNow = Date.now();
        setNowMs(currentNow);
        startTimers();
        refreshAll(false);
      }
    };

    // Defer async invocation onto microtask to avoid synchronous setState-in-effect warning and abort cleanly in StrictMode
    const initTimeout = setTimeout(() => {
      refreshAll(false);
    }, 0);

    startTimers();
    document.addEventListener('visibilitychange', handleVisibility);

    return () => {
      clearTimeout(initTimeout);
      clearInterval(refreshTimer);
      clearInterval(ageTicker);
      document.removeEventListener('visibilitychange', handleVisibility);
      if (abortRef.current) {
        abortRef.current.abort();
      }
      inFlightRef.current = false;
    };
  }, [refreshAll]);

  const getLocationState = useCallback(
    (locId) => {
      const entry = cacheById[locId] || null;
      const error = errorsById[locId] || null;
      const fetchedAtMs = entry?.fetchedAtMs || null;
      const ageMs = fetchedAtMs ? Math.max(0, nowMs - fetchedAtMs) : Infinity;
      const isStale = Boolean(entry && ageMs > STALE_AFTER_MS);
      return {
        data: entry,
        error,
        fetchedAtMs,
        ageLabel: formatRelativeAge(fetchedAtMs, nowMs),
        isStale,
        loading: isInitialLoading && !entry,
      };
    },
    [cacheById, errorsById, nowMs, isInitialLoading]
  );

  return {
    getLocationState,
    isRefreshing,
    refreshAll: () => refreshAll(true),
  };
}

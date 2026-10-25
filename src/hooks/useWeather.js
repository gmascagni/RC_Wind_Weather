import { useState, useEffect, useRef, useCallback } from 'react';
import { AUTO_REFRESH_MS, STALE_AFTER_MS } from '../config/flightConfig';
import { fetchOpenMeteoForLocation } from '../services/openMeteo';

const CACHE_KEY = 'rc_wind_weather_cache_v3';

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
  const [fetchingIds, setFetchingIds] = useState({});
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [nowMs, setNowMs] = useState(() => Date.now());

  const abortRef = useRef(null);
  const locationsRef = useRef(locations);

  useEffect(() => {
    locationsRef.current = locations;
  }, [locations]);

  const locationKey = locations.map((l) => l.id).join('|');

  const refreshAll = useCallback(async (forceAll = false) => {
    const currentLocations = locationsRef.current;
    if (!currentLocations || currentLocations.length === 0) {
      setIsRefreshing(false);
      return;
    }

    if (abortRef.current) {
      abortRef.current.abort();
    }

    const controller = new AbortController();
    abortRef.current = controller;
    setIsRefreshing(true);
    setFetchingIds((prev) => {
      const next = { ...prev };
      for (const loc of currentLocations) next[loc.id] = true;
      return next;
    });

    const targets = forceAll
      ? currentLocations
      : currentLocations;

    const results = await Promise.allSettled(
      targets.map(async (loc) => {
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

    setErrorsById((prev) => {
      const nextErrs = { ...prev };
      results.forEach((res, idx) => {
        const locId = targets[idx].id;
        if (res.status === 'fulfilled') {
          delete nextErrs[locId];
        } else if (res.reason?.name !== 'AbortError') {
          nextErrs[locId] = res.reason?.message || 'Unable to reach Open-Meteo weather feed';
        }
      });
      return nextErrs;
    });

    setFetchingIds({});
    setNowMs(Date.now());
    setIsRefreshing(false);
  }, []);

  useEffect(() => {
    if (!locationKey) return undefined;

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
        setNowMs(Date.now());
        startTimers();
        refreshAll(false);
      }
    };

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
      if (abortRef.current) abortRef.current.abort();
    };
  }, [locationKey, refreshAll]);

  const getLocationState = useCallback(
    (locId) => {
      if (!locId) {
        return { data: null, error: null, fetchedAtMs: null, ageLabel: 'Never updated', isStale: false, loading: false };
      }
      const entry = cacheById[locId] || null;
      const error = errorsById[locId] || null;
      const fetchedAtMs = entry?.fetchedAtMs || null;
      const ageMs = fetchedAtMs ? Math.max(0, nowMs - fetchedAtMs) : Infinity;
      const isStale = Boolean(entry && ageMs > STALE_AFTER_MS);
      const isTracked = locations.some((l) => l.id === locId);
      const loading = !entry && !error && (isTracked || Boolean(fetchingIds[locId]) || isRefreshing);
      return {
        data: entry,
        error,
        fetchedAtMs,
        ageLabel: formatRelativeAge(fetchedAtMs, nowMs),
        isStale,
        loading,
      };
    },
    [cacheById, errorsById, fetchingIds, isRefreshing, locations, nowMs]
  );

  return {
    getLocationState,
    isRefreshing,
    refreshAll: () => refreshAll(true),
  };
}

import { useState, useEffect, useMemo, useRef } from 'react';
import { DEFAULT_THRESHOLDS } from './config/flightConfig';
import {
  computeRunwayComponents,
  evaluateFlightStatus,
  findBestFlyingWindow,
} from './utils/aerodynamics';
import { locateUserViaGps } from './services/geocoding';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useWeather } from './hooks/useWeather';
import { RcAirplaneSymbolDef } from './components/StatusVisuals';
import TopBar from './components/TopBar';
import HeroStatusBanner from './components/HeroStatusBanner';
import WindCompassCard from './components/WindCompassCard';
import WindChart24h from './components/WindChart24h';
import HourlyForecast from './components/HourlyForecast';
import AircraftSuitability from './components/AircraftSuitability';
import ThresholdSettingsModal from './components/ThresholdSettingsModal';
import { SkeletonDeck, WelcomeFieldPrompt, OfflineEmptyState } from './components/SkeletonDeck';
import FooterBar from './components/FooterBar';

export default function App() {
  const [favorites, setFavorites] = useLocalStorageState('rc_wind_favorites_v1', []);
  const [activeLocation, setActiveLocation] = useLocalStorageState('rc_wind_active_location_v1', null);
  const [windUnit, setWindUnit] = useLocalStorageState('rc_wind_unit', 'mph');
  const [thresholds, setThresholds] = useLocalStorageState('rc_wind_thresholds_v2', DEFAULT_THRESHOLDS);
  const [runwayByField, setRunwayByField] = useLocalStorageState('rc_wind_runways_v2', {});
  const [daylightBoost, setDaylightBoost] = useLocalStorageState('rc_wind_daylight_boost', false);

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const forecastRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('daylight-boost', Boolean(daylightBoost));
  }, [daylightBoost]);

  const trackedLocations = useMemo(() => {
    const map = new Map();
    if (activeLocation?.id) map.set(activeLocation.id, activeLocation);
    for (const fav of favorites) {
      if (fav?.id && !map.has(fav.id)) map.set(fav.id, fav);
    }
    return Array.from(map.values());
  }, [activeLocation, favorites]);

  const { getLocationState, isRefreshing, refreshAll } = useWeather(trackedLocations);

  const locState = getLocationState(activeLocation?.id || null);
  const runwayDeg = activeLocation
    ? runwayByField[activeLocation.id] ?? activeLocation.defaultRunwayDeg ?? 270
    : 270;

  const isFavorite = Boolean(
    activeLocation && favorites.some((fav) => fav.id === activeLocation.id)
  );

  const handleToggleFavorite = (loc) => {
    if (!loc?.id) return;
    setFavorites((prev) => {
      const exists = prev.some((f) => f.id === loc.id);
      if (exists) return prev.filter((f) => f.id !== loc.id);
      return [...prev, { ...loc, isGps: false }];
    });
  };

  const handleRemoveFavorite = (locId) => {
    setFavorites((prev) => prev.filter((f) => f.id !== locId));
  };

  const handleLocateGps = async () => {
    setGpsError(null);
    setIsLocatingGps(true);
    try {
      const gpsLoc = await locateUserViaGps();
      setActiveLocation(gpsLoc);
    } catch (err) {
      setGpsError(err?.message || 'Unable to acquire GPS coordinates.');
    } finally {
      setIsLocatingGps(false);
    }
  };

  const runwayInfo = useMemo(() => {
    const cur = locState.data?.current;
    if (!cur) return null;
    return computeRunwayComponents(cur.windSpeed, cur.windGusts, cur.windDirection, runwayDeg);
  }, [locState.data, runwayDeg]);

  const status = useMemo(() => {
    const cur = locState.data?.current;
    if (!cur) return null;
    return evaluateFlightStatus(cur, thresholds, runwayInfo?.crosswindMph ?? null);
  }, [locState.data, thresholds, runwayInfo]);

  const bestWindow = useMemo(
    () => findBestFlyingWindow(locState.data?.hourly || [], thresholds),
    [locState.data, thresholds]
  );

  const handleRunwayChange = (deg) => {
    if (!activeLocation) return;
    setRunwayByField((prev) => ({ ...prev, [activeLocation.id]: deg }));
  };

  return (
    <div className={`min-h-dvh flex flex-col justify-between ${favorites.length > 0 ? 'pb-20 md:pb-0' : ''}`}>
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-control bg-avionics px-4 py-2 font-instrument text-xs font-bold text-slate-950"
      >
        Skip to flight telemetry
      </a>

      <RcAirplaneSymbolDef />

      <TopBar
        activeLocation={activeLocation}
        favorites={favorites}
        onSelectLocation={setActiveLocation}
        onToggleFavorite={handleToggleFavorite}
        onRemoveFavorite={handleRemoveFavorite}
        onLocateGps={handleLocateGps}
        isLocatingGps={isLocatingGps}
        gpsError={gpsError}
        onClearGpsError={() => setGpsError(null)}
        getLocationState={getLocationState}
        thresholds={thresholds}
        windUnit={windUnit}
        onChangeUnit={setWindUnit}
        daylightBoost={daylightBoost}
        onToggleDaylight={() => setDaylightBoost((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
        isRefreshing={isRefreshing}
        onRefresh={refreshAll}
      />

      <main
        id="main-content"
        tabIndex={-1}
        className="mx-auto w-full max-w-6xl flex-1 space-y-4 sm:space-y-5 px-3 py-4 sm:px-6 sm:py-6 focus:outline-none"
      >
        {!activeLocation ? (
          <WelcomeFieldPrompt onLocateGps={handleLocateGps} isLocatingGps={isLocatingGps} />
        ) : locState.loading ? (
          <SkeletonDeck />
        ) : !locState.data ? (
          <OfflineEmptyState
            locationName={activeLocation.name}
            error={locState.error}
            onRetry={refreshAll}
            isRefreshing={isRefreshing}
          />
        ) : (
          <>
            <HeroStatusBanner
              location={activeLocation}
              isFavorite={isFavorite}
              onToggleFavorite={handleToggleFavorite}
              locState={locState}
              status={status}
              runwayInfo={runwayInfo}
              thresholds={thresholds}
              windUnit={windUnit}
              onOpenSettings={() => setSettingsOpen(true)}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <WindCompassCard
                windDirection={locState.data.current.windDirection}
                runwayHeadingDeg={runwayDeg}
                onChangeRunway={handleRunwayChange}
                runwayInfo={runwayInfo}
                statusLevel={status.level}
                windUnit={windUnit}
              />

              <WindChart24h
                hourly={locState.data.hourly}
                thresholds={thresholds}
                bestWindow={bestWindow}
                windUnit={windUnit}
                onSelectHour={(iso) => forecastRef.current?.scrollToIso(iso)}
              />
            </div>

            <HourlyForecast
              ref={forecastRef}
              hourly={locState.data.hourly}
              locationName={activeLocation.name}
              thresholds={thresholds}
              windUnit={windUnit}
            />

            <AircraftSuitability
              currentObs={locState.data.current}
              crosswindMph={runwayInfo.crosswindMph}
              windUnit={windUnit}
            />
          </>
        )}
      </main>

      <FooterBar
        favorites={favorites}
        selectedId={activeLocation?.id || ''}
        onSelectLocation={setActiveLocation}
        getLocationState={getLocationState}
        thresholds={thresholds}
        windUnit={windUnit}
        timezoneLabel={locState.data?.timezone || activeLocation?.timezone || ''}
        ageLabel={locState.ageLabel}
        hasActiveLocation={Boolean(activeLocation)}
        isRefreshing={isRefreshing}
        onRefresh={refreshAll}
      />

      <ThresholdSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        thresholds={thresholds}
        onChangeThresholds={setThresholds}
        windUnit={windUnit}
      />
    </div>
  );
}

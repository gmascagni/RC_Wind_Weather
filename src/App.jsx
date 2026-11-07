import { useState, useEffect, useMemo, useRef } from 'react';
import { DEFAULT_THRESHOLDS } from './config/flightConfig';
import {
  computeRunwayComponents,
  evaluateFlightStatus,
  findBestFlyingWindow,
  degreesToCardinal,
  normalizeDegrees,
} from './utils/aerodynamics';
import { locateUserViaGps } from './services/geocoding';
import { useLocalStorageState } from './hooks/useLocalStorageState';
import { useWeather } from './hooks/useWeather';
import { UsaacStarSymbolDef } from './components/StatusVisuals';
import TopBar from './components/TopBar';
import HeroStatusBanner from './components/HeroStatusBanner';
import WindCompassCard from './components/WindCompassCard';
import WindChart24h from './components/WindChart24h';
import HourlyForecast from './components/HourlyForecast';
import AircraftSuitability from './components/AircraftSuitability';
import ThresholdSettingsModal from './components/ThresholdSettingsModal';
import VersionModal from './components/VersionModal';
import { SkeletonDeck, WelcomeFieldPrompt, OfflineEmptyState } from './components/SkeletonDeck';
import FooterBar from './components/FooterBar';

export default function App() {
  const [favorites, setFavorites] = useLocalStorageState('rc_wind_favorites_v1', []);
  const [activeLocation, setActiveLocation] = useLocalStorageState('rc_wind_active_location_v1', null);
  const [windUnit, setWindUnit] = useLocalStorageState('rc_wind_unit', 'mph');
  const [thresholds, setThresholds] = useLocalStorageState('rc_wind_thresholds_v2', DEFAULT_THRESHOLDS);
  const [contentProfile, setContentProfile] = useLocalStorageState('rc_wind_content_profile', 'adult');
  const [pilotProfile, setPilotProfile] = useLocalStorageState('rc_wind_pilot_profile', 'intermediate');
  const [calcBasis, setCalcBasis] = useLocalStorageState('rc_wind_calc_basis', 'gust');
  const [runwayByField, setRunwayByField] = useLocalStorageState('rc_wind_runways_v2', {});
  const [manualWindByField, setManualWindByField] = useLocalStorageState('rc_wind_manual_dir_v1', {});
  const [daylightBoost, setDaylightBoost] = useLocalStorageState('rc_wind_daylight_boost', false);
  const [forecastDay, setForecastDay] = useState('today');

  const [settingsOpen, setSettingsOpen] = useState(false);
  const [versionOpen, setVersionOpen] = useState(false);
  const [isLocatingGps, setIsLocatingGps] = useState(false);
  const [gpsError, setGpsError] = useState(null);
  const forecastRef = useRef(null);

  const effectiveThresholds = useMemo(() => ({
    ...thresholds,
    contentProfile: thresholds.contentProfile || contentProfile,
    pilotProfile: thresholds.pilotProfile || pilotProfile,
    calcBasis: thresholds.calcBasis || calcBasis,
  }), [thresholds, contentProfile, pilotProfile, calcBasis]);

  const handleToggleContentProfile = () => {
    const next = (thresholds.contentProfile || contentProfile) === 'adult' ? 'kid' : 'adult';
    setContentProfile(next);
    setThresholds((prev) => ({ ...prev, contentProfile: next }));
  };

  const handleSetContentProfile = (profileId) => {
    setContentProfile(profileId);
    setThresholds((prev) => ({ ...prev, contentProfile: profileId }));
  };

  const PILOT_ORDER = ['beginner', 'intermediate', 'advanced', 'extreme'];
  const handleCyclePilotProfile = () => {
    const curr = effectiveThresholds.pilotProfile || 'intermediate';
    const nextIdx = (PILOT_ORDER.indexOf(curr) + 1) % PILOT_ORDER.length;
    const next = PILOT_ORDER[nextIdx];
    setPilotProfile(next);
    setThresholds((prev) => ({ ...prev, pilotProfile: next }));
  };

  const handleSetPilotProfile = (id) => {
    setPilotProfile(id);
    setThresholds((prev) => ({ ...prev, pilotProfile: id }));
  };

  const handleToggleCalcBasis = () => {
    const curr = effectiveThresholds.calcBasis || 'gust';
    const next = curr === 'gust' ? 'sustained' : 'gust';
    setCalcBasis(next);
    setThresholds((prev) => ({ ...prev, calcBasis: next }));
  };

  const handleSetCalcBasis = (id) => {
    setCalcBasis(id);
    setThresholds((prev) => ({ ...prev, calcBasis: id }));
  };

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

  const isTomorrow = forecastDay === 'tomorrow' && Boolean(locState.data?.tomorrow);
  const rawActiveObs = useMemo(() => {
    if (isTomorrow) return locState.data?.tomorrow?.obs;
    return locState.data?.current || null;
  }, [isTomorrow, locState.data]);

  const manualWindDir = (activeLocation?.id && manualWindByField[activeLocation.id] !== undefined)
    ? manualWindByField[activeLocation.id]
    : null;

  const isWindManual = manualWindDir !== null;

  const activeObs = useMemo(() => {
    if (!rawActiveObs) return null;
    if (manualWindDir === null) return rawActiveObs;
    return {
      ...rawActiveObs,
      windDirection: manualWindDir,
      cardinal: degreesToCardinal(manualWindDir),
      isManualWind: true,
      stationWindDirection: rawActiveObs.windDirection,
      stationCardinal: rawActiveObs.cardinal || degreesToCardinal(rawActiveObs.windDirection),
    };
  }, [rawActiveObs, manualWindDir]);

  const activeHourly = useMemo(() => {
    if (isTomorrow) return locState.data?.tomorrow?.hourly || [];
    return locState.data?.hourly || [];
  }, [isTomorrow, locState.data]);

  const runwayInfo = useMemo(() => {
    if (!activeObs) return null;
    return computeRunwayComponents(activeObs.windSpeed, activeObs.windGusts, activeObs.windDirection, runwayDeg);
  }, [activeObs, runwayDeg]);

  const status = useMemo(() => {
    if (!activeObs) return null;
    return evaluateFlightStatus(activeObs, effectiveThresholds, runwayInfo?.crosswindMph ?? null);
  }, [activeObs, effectiveThresholds, runwayInfo]);

  const bestWindow = useMemo(
    () => findBestFlyingWindow(activeHourly, effectiveThresholds),
    [activeHourly, effectiveThresholds]
  );

  const handleRunwayChange = (deg) => {
    if (!activeLocation?.id) return;
    setRunwayByField((prev) => ({ ...prev, [activeLocation.id]: deg }));
  };

  const handleWindDirectionChange = (deg) => {
    if (!activeLocation?.id) return;
    const normalized = normalizeDegrees(Math.round(deg));
    setManualWindByField((prev) => ({
      ...prev,
      [activeLocation.id]: normalized,
    }));
  };

  const handleResetWindDirection = () => {
    if (!activeLocation?.id) return;
    setManualWindByField((prev) => {
      const next = { ...prev };
      delete next[activeLocation.id];
      return next;
    });
  };

  return (
    <div className={`min-h-dvh flex flex-col justify-between ${favorites.length > 0 ? 'pb-20 md:pb-0' : ''}`}>
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-control bg-avionics px-4 py-2 font-instrument text-xs font-bold text-slate-950"
      >
        Skip to flight telemetry
      </a>

      <UsaacStarSymbolDef />

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
        thresholds={effectiveThresholds}
        windUnit={windUnit}
        onChangeUnit={setWindUnit}
        daylightBoost={daylightBoost}
        onToggleDaylight={() => setDaylightBoost((v) => !v)}
        onOpenSettings={() => setSettingsOpen(true)}
        onOpenVersion={() => setVersionOpen(true)}
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
              activeObs={activeObs}
              status={status}
              runwayInfo={runwayInfo}
              thresholds={effectiveThresholds}
              windUnit={windUnit}
              onOpenSettings={() => setSettingsOpen(true)}
              forecastDay={forecastDay}
              onChangeForecastDay={setForecastDay}
              contentProfile={effectiveThresholds.contentProfile}
              onToggleContentProfile={handleToggleContentProfile}
              pilotProfile={effectiveThresholds.pilotProfile}
              onCyclePilotProfile={handleCyclePilotProfile}
              calcBasis={effectiveThresholds.calcBasis}
              onToggleCalcBasis={handleToggleCalcBasis}
            />

            <HourlyForecast
              ref={forecastRef}
              hourly={activeHourly}
              locationName={activeLocation.name}
              thresholds={effectiveThresholds}
              windUnit={windUnit}
              forecastDay={forecastDay}
              onChangeForecastDay={setForecastDay}
              tomorrowDateLabel={locState.data?.tomorrowDateLabel || 'Tomorrow'}
              tomorrowWeekday={locState.data?.tomorrowWeekday || 'Tomorrow'}
            />

            <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
              <WindCompassCard
                windDirection={activeObs?.windDirection ?? 0}
                stationWindDirection={rawActiveObs?.windDirection ?? 0}
                isManualWind={isWindManual}
                onChangeWindDirection={handleWindDirectionChange}
                onResetWindDirection={handleResetWindDirection}
                runwayHeadingDeg={runwayDeg}
                onChangeRunway={handleRunwayChange}
                runwayInfo={runwayInfo}
                statusLevel={status.level}
                windUnit={windUnit}
                forecastDay={forecastDay}
              />

              <WindChart24h
                hourly={activeHourly}
                thresholds={effectiveThresholds}
                bestWindow={bestWindow}
                windUnit={windUnit}
                onSelectHour={(iso) => forecastRef.current?.scrollToIso(iso)}
                forecastDay={forecastDay}
                dayLabel={isTomorrow ? (locState.data?.tomorrowDateLabel || 'Tomorrow') : 'Next 24h'}
              />
            </div>

            <AircraftSuitability
              currentObs={activeObs}
              crosswindMph={runwayInfo ? runwayInfo.crosswindMph : 0}
              windUnit={windUnit}
              forecastDay={forecastDay}
              dayLabel={isTomorrow ? (locState.data?.tomorrowDateLabel || 'Tomorrow') : 'Current Conditions'}
              contentProfile={effectiveThresholds.contentProfile}
              pilotProfile={effectiveThresholds.pilotProfile}
              calcBasis={effectiveThresholds.calcBasis}
            />
          </>
        )}
      </main>

      <FooterBar
        favorites={favorites}
        selectedId={activeLocation?.id || ''}
        onSelectLocation={setActiveLocation}
        getLocationState={getLocationState}
        thresholds={effectiveThresholds}
        windUnit={windUnit}
        timezoneLabel={locState.data?.timezone || activeLocation?.timezone || ''}
        ageLabel={locState.ageLabel}
        hasActiveLocation={Boolean(activeLocation)}
        isRefreshing={isRefreshing}
        onRefresh={refreshAll}
        onOpenVersion={() => setVersionOpen(true)}
      />

      <ThresholdSettingsModal
        open={settingsOpen}
        onClose={() => setSettingsOpen(false)}
        thresholds={effectiveThresholds}
        onChangeThresholds={setThresholds}
        windUnit={windUnit}
        contentProfile={effectiveThresholds.contentProfile}
        onChangeContentProfile={handleSetContentProfile}
        pilotProfile={effectiveThresholds.pilotProfile}
        onChangePilotProfile={handleSetPilotProfile}
        calcBasis={effectiveThresholds.calcBasis}
        onChangeCalcBasis={handleSetCalcBasis}
      />

      <VersionModal
        open={versionOpen}
        onClose={() => setVersionOpen(false)}
      />
    </div>
  );
}

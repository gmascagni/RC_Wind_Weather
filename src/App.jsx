import { useState, useEffect, useMemo, useRef } from 'react';
import {
  FLYING_LOCATIONS,
  DEFAULT_THRESHOLDS,
} from './config/flightConfig';
import {
  computeRunwayComponents,
  evaluateFlightStatus,
  findBestFlyingWindow,
} from './utils/aerodynamics';
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
import { SkeletonDeck, OfflineEmptyState } from './components/SkeletonDeck';
import FooterBar from './components/FooterBar';

const INITIAL_RUNWAYS = Object.fromEntries(
  FLYING_LOCATIONS.map((loc) => [loc.id, loc.defaultRunwayDeg])
);

export default function App() {
  const [selectedId, setSelectedId] = useLocalStorageState(
    'rc_wind_selected_field',
    FLYING_LOCATIONS[0].id
  );
  const [windUnit, setWindUnit] = useLocalStorageState('rc_wind_unit', 'mph');
  const [thresholds, setThresholds] = useLocalStorageState(
    'rc_wind_thresholds_v2',
    DEFAULT_THRESHOLDS
  );
  const [runwayByField, setRunwayByField] = useLocalStorageState(
    'rc_wind_runways_v1',
    INITIAL_RUNWAYS
  );
  const [daylightBoost, setDaylightBoost] = useLocalStorageState(
    'rc_wind_daylight_boost',
    false
  );
  const [settingsOpen, setSettingsOpen] = useState(false);
  const forecastRef = useRef(null);

  useEffect(() => {
    document.body.classList.toggle('daylight-boost', Boolean(daylightBoost));
  }, [daylightBoost]);

  const { getLocationState, isRefreshing, refreshAll } = useWeather(FLYING_LOCATIONS);

  const activeLocation = useMemo(
    () => FLYING_LOCATIONS.find((l) => l.id === selectedId) || FLYING_LOCATIONS[0],
    [selectedId]
  );

  const locState = getLocationState(activeLocation.id);
  const runwayDeg = runwayByField[activeLocation.id] ?? activeLocation.defaultRunwayDeg;

  const runwayInfo = useMemo(() => {
    const cur = locState.data?.current;
    if (!cur) return null;
    return computeRunwayComponents(
      cur.windSpeed,
      cur.windGusts,
      cur.windDirection,
      runwayDeg
    );
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
    setRunwayByField((prev) => ({ ...prev, [activeLocation.id]: deg }));
  };

  return (
    <div className="min-h-dvh flex flex-col justify-between pb-20 md:pb-0">
      <a
        href="#main-content"
        className="visually-hidden fixed top-2 left-2 z-50 rounded-control bg-avionics px-4 py-2 font-instrument text-xs font-bold text-slate-950"
      >
        Skip to flight telemetry
      </a>

      <RcAirplaneSymbolDef />

      <TopBar
        locations={FLYING_LOCATIONS}
        selectedId={activeLocation.id}
        onSelectLocation={setSelectedId}
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
        {locState.loading ? (
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
        locations={FLYING_LOCATIONS}
        selectedId={activeLocation.id}
        onSelectLocation={setSelectedId}
        getLocationState={getLocationState}
        thresholds={thresholds}
        windUnit={windUnit}
        ageLabel={locState.ageLabel}
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

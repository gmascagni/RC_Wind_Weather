import { Compass, Crosshair, Navigation, PlaneTakeoff, AlertCircle, Wind, RotateCcw } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';
import { normalizeDegrees, degreesToCardinal } from '../utils/aerodynamics';
import { useDeviceCompass } from '../hooks/useDeviceCompass';
import CompassDialSvg from './CompassDialSvg';

export default function WindCompassCard({
  windDirection = 0,
  stationWindDirection = 0,
  isManualWind = false,
  onChangeWindDirection,
  onResetWindDirection,
  runwayHeadingDeg = 270,
  onChangeRunway,
  runwayInfo,
  statusLevel = 'good',
  windUnit = 'mph',
  forecastDay = 'today',
}) {
  const {
    liveEnabled,
    isActivating,
    deviceHeading,
    unwrappedHeading,
    isAbsolute,
    needsCalibration,
    compassError,
    toggleCompass,
  } = useDeviceCompass();

  const fromDeg = normalizeDegrees(windDirection);
  const blowsToDeg = (fromDeg + 180) % 360;
  const rwyDeg = normalizeDegrees(runwayHeadingDeg);
  const unit = getUnitLabel(windUnit);
  const accentHex = STATUS_THEME[statusLevel]?.hex || '#e3edf7';
  const snappedPhoneDeg = deviceHeading !== null ? normalizeDegrees(Math.round(deviceHeading / 5) * 5) : 0;

  return (
    <section className="metal-panel avionics-panel relative overflow-hidden flex flex-col justify-between">
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {/* WWII Cockpit Header */}
      <div className="panel-header flex-wrap justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <span className="panel-badge" aria-hidden="true">02</span>
          <Compass strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
          <h2 className="font-display text-sm sm:text-base font-bold uppercase tracking-wider text-ink truncate">
            {forecastDay === 'tomorrow' ? 'Wind Vector & Crosswind (Tomorrow)' : 'Wind Vector & Crosswind'}
          </h2>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {liveEnabled && deviceHeading !== null && (
            <span
              aria-live="off"
              className="rounded border border-avionics bg-avionics-soft px-2 py-0.5 font-instrument text-2xs font-bold text-avionics"
            >
              {isAbsolute ? 'HDG' : 'GYRO'} {String(deviceHeading).padStart(3, '0')}° {degreesToCardinal(deviceHeading)}
            </span>
          )}

          <button
            type="button"
            onClick={toggleCompass}
            aria-pressed={liveEnabled || isActivating}
            className={`btn-retro text-2xs ${
              liveEnabled || isActivating
                ? 'border-avionics text-avionics bg-panel-inset'
                : 'text-ink-soft'
            }`}
          >
            <Navigation strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true" />
            {isActivating ? 'SENSING…' : liveEnabled ? 'LIVE COMPASS ON' : 'LIVE COMPASS'}
          </button>
        </div>
      </div>

      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between gap-4">
        {/* Local Field Calibration Notice */}
        {isManualWind && (
          <div
            role="status"
            className="flex items-center justify-between gap-2 rounded-control border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-xs text-amber-200 shadow-inset"
          >
            <div className="flex items-center gap-2 min-w-0">
              <span className="inline-block h-2 w-2 rounded-full bg-amber-400 animate-pulse shrink-0" aria-hidden="true" />
              <div className="truncate">
                <strong>Field Microclimate Calibration:</strong> Wind set to <strong>{String(fromDeg).padStart(3, '0')}° {degreesToCardinal(fromDeg)}</strong>
                <span className="text-amber-300/80 text-2xs ml-1.5 hidden sm:inline">(Station: {String(normalizeDegrees(stationWindDirection)).padStart(3, '0')}°)</span>
              </div>
            </div>
            <button
              type="button"
              onClick={onResetWindDirection}
              className="btn-retro text-2xs py-1 px-2.5 text-amber-300 hover:text-white border-amber-500/50 shrink-0"
              title="Reset wind direction to live weather station forecast"
            >
              <RotateCcw strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true" />
              RESET TO LIVE
            </button>
          </div>
        )}

        {(compassError || (liveEnabled && (!isAbsolute || needsCalibration))) && (
          <div
            role="status"
            className="flex items-start gap-2 rounded-control border border-caution-line bg-caution-surface px-3 py-2 text-xs text-caution-ink"
          >
            <AlertCircle strokeWidth={2} className="mt-0.5 h-4 w-4 text-caution shrink-0" aria-hidden="true" />
            <span>
              {compassError
                ? compassError
                : !isAbsolute
                  ? 'Relative gyro mode (no hardware magnetometer detected) — face North when enabling for true alignment.'
                  : 'Magnetic interference detected — move away from LiPos/motors and wave phone in a figure-8.'}
            </span>
          </div>
        )}

        <div className="grid grid-cols-1 items-center gap-4 sm:grid-cols-2">
          <div className="flex flex-col items-center">
            <CompassDialSvg
              fromDeg={fromDeg}
              stationWindDirection={stationWindDirection}
              isManualWind={isManualWind}
              onDialClick={onChangeWindDirection}
              blowsToDeg={blowsToDeg}
              activeRunwayDeg={runwayInfo.activeHeadingDeg}
              accentHex={accentHex}
              liveEnabled={liveEnabled}
              deviceHeading={deviceHeading}
              unwrappedHeading={unwrappedHeading}
            />
            <div className="mt-1 text-center font-instrument text-2xs text-ink-dim space-y-0.5">
              <p>
                <span className="text-red-400 font-bold">▲ Red Arrow</span> = Facing into wind (<strong>FROM {String(fromDeg).padStart(3, '0')}° {degreesToCardinal(fromDeg)}</strong>)
              </p>
              <p className="text-3xs">
                {isManualWind ? (
                  <span className="text-amber-400 font-semibold">● Local Field Calibrated (Tap dial or use slider to adjust)</span>
                ) : (
                  <span className="text-avionics font-semibold">● Auto Live Station (Tap dial or slide below to calibrate)</span>
                )}
              </p>
            </div>
          </div>

          <div className="space-y-2.5">
            {/* Field Strip Alignment Module (Placed FIRST right under dial so sliders & dial fit on phone screen together) */}
            <div className="rounded-control border border-line-strong bg-panel-inset p-2.5 space-y-1.5 shadow-inset">
              <div className="flex items-center justify-between">
                <label htmlFor="runway-heading-range" className="flex items-center gap-1.5 font-instrument text-2xs font-bold text-ink-soft">
                  <PlaneTakeoff strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
                  FIELD STRIP ALIGNMENT
                </label>
                <span className="font-instrument text-xs font-bold text-avionics">
                  {String(rwyDeg).padStart(3, '0')}° / {String((rwyDeg + 180) % 360).padStart(3, '0')}°
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangeRunway(normalizeDegrees(rwyDeg - 10))}
                  className="btn-retro text-2xs py-1 px-2"
                >
                  -10°
                </button>
                <input
                  id="runway-heading-range"
                  type="range"
                  min="0"
                  max="355"
                  step="5"
                  value={rwyDeg}
                  onChange={(e) => onChangeRunway(Number(e.target.value))}
                  className="w-full accent-sky-400 cursor-pointer"
                />
                <button
                  type="button"
                  onClick={() => onChangeRunway(normalizeDegrees(rwyDeg + 10))}
                  className="btn-retro text-2xs py-1 px-2"
                >
                  +10°
                </button>
              </div>

              {liveEnabled && deviceHeading !== null && (
                <button
                  type="button"
                  onClick={() => onChangeRunway(snappedPhoneDeg)}
                  className="btn-retro w-full justify-center text-avionics mt-0.5 text-2xs py-1"
                >
                  <Crosshair strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                  SNAP STRIP TO PHONE ({String(snappedPhoneDeg).padStart(3, '0')}°)
                </button>
              )}
            </div>

            {/* Local Wind Calibration Control Module */}
            <div className="rounded-control border border-line-strong bg-panel-inset p-2.5 space-y-1.5 shadow-inset">
              <div className="flex items-center justify-between">
                <label htmlFor="wind-heading-range" className="flex items-center gap-1.5 font-instrument text-2xs font-bold text-ink-soft">
                  <Wind strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
                  WIND DIRECTION (CALIBRATE)
                </label>
                <div className="flex items-center gap-1.5">
                  {isManualWind ? (
                    <span className="rounded border border-amber-500/50 bg-amber-500/20 px-1.5 py-0.5 font-instrument text-3xs font-bold text-amber-300">
                      CALIBRATED
                    </span>
                  ) : (
                    <span className="rounded border border-good/40 bg-good/10 px-1.5 py-0.5 font-instrument text-3xs font-bold text-good">
                      AUTO (STATION)
                    </span>
                  )}
                  <span className={`font-instrument text-xs font-bold ${isManualWind ? 'text-amber-300' : 'text-avionics'}`}>
                    {String(fromDeg).padStart(3, '0')}° {degreesToCardinal(fromDeg)}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onChangeWindDirection?.(normalizeDegrees(fromDeg - 10))}
                  className="btn-retro text-2xs py-1 px-2"
                  title="Shift wind direction 10° counter-clockwise"
                >
                  -10°
                </button>
                <input
                  id="wind-heading-range"
                  type="range"
                  min="0"
                  max="355"
                  step="5"
                  value={fromDeg}
                  onChange={(e) => onChangeWindDirection?.(Number(e.target.value))}
                  className="w-full accent-amber-400 cursor-pointer"
                  aria-label="Manually calibrate wind vector from heading in degrees"
                />
                <button
                  type="button"
                  onClick={() => onChangeWindDirection?.(normalizeDegrees(fromDeg + 10))}
                  className="btn-retro text-2xs py-1 px-2"
                  title="Shift wind direction 10° clockwise"
                >
                  +10°
                </button>
              </div>

              {( (liveEnabled && deviceHeading !== null) || isManualWind ) && (
                <div className="space-y-1 pt-0.5">
                  {liveEnabled && deviceHeading !== null && (
                    <button
                      type="button"
                      onClick={() => onChangeWindDirection?.(snappedPhoneDeg)}
                      className="btn-retro w-full justify-center text-amber-300 text-2xs py-1"
                      title="Aim top of phone directly into the wind and tap to calibrate"
                    >
                      <Crosshair strokeWidth={2} className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
                      ALIGN WIND TO PHONE AIM ({String(snappedPhoneDeg).padStart(3, '0')}°)
                    </button>
                  )}

                  {isManualWind && (
                    <button
                      type="button"
                      onClick={onResetWindDirection}
                      className="btn-retro w-full justify-center text-ink-soft hover:text-white border-dashed text-2xs py-1"
                      title="Clear field override and revert to live weather forecast"
                    >
                      <RotateCcw strokeWidth={2} className="h-3 w-3 shrink-0" aria-hidden="true" />
                      REVERT TO WEATHER STATION ({String(normalizeDegrees(stationWindDirection)).padStart(3, '0')}°)
                    </button>
                  )}
                </div>
              )}
            </div>

            {/* Calibrated Wind Direction, Active Runway, Headwind & Crosswind Readouts */}
            <div className="flex items-center justify-between font-instrument text-2xs text-ink-soft pt-0.5">
              <span className="font-bold">INTO-WIND RUNWAY</span>
              <span className="rounded border border-line-strong bg-panel-inset px-2.5 py-0.5 font-bold text-avionics">
                ACTIVE {runwayInfo.rwyLabel} ({String(runwayInfo.activeHeadingDeg).padStart(3, '0')}°)
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2.5">
              <div className="rounded-control border border-line-strong bg-panel-inset p-2.5 shadow-inset">
                <div className="font-instrument text-2xs text-ink-dim font-bold">HEADWIND</div>
                <div className="mt-0.5 font-instrument text-xl font-bold text-good">
                  {convertWind(runwayInfo.headwindMph, windUnit)} <span className="text-xs text-ink-soft">{unit}</span>
                </div>
                <div className="font-instrument text-2xs text-ink-soft">Off nose: {runwayInfo.angleOffNoseDeg}°</div>
              </div>

              <div className="rounded-control border border-line-strong bg-panel-inset p-2.5 shadow-inset">
                <div className="font-instrument text-2xs text-ink-dim font-bold">CROSSWIND</div>
                <div className={`mt-0.5 font-instrument text-xl font-bold ${runwayInfo.crosswindMph > 9 ? 'text-caution' : 'text-ink'}`}>
                  {convertWind(runwayInfo.crosswindMph, windUnit)} <span className="text-xs text-ink-soft">{unit}</span>
                </div>
                <div className="font-instrument text-2xs text-ink-soft">
                  Gust: {convertWind(runwayInfo.gustCrosswindMph, windUnit)} ({runwayInfo.crosswindSide})
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

import { Wind, Gauge, Compass, Thermometer } from 'lucide-react';
import { STATUS_THEME, convertWind, getUnitLabel } from '../config/flightConfig';

export default function CockpitMetricsGrid({
  current,
  status,
  runwayInfo,
  thresholds,
  windUnit,
}) {
  const theme = STATUS_THEME[status.level];
  const unit = getUnitLabel(windUnit);
  const windVal = convertWind(current.windSpeed, windUnit);
  const gustVal = convertWind(current.windGusts, windUnit);
  const spreadVal = convertWind(status.gustSpread, windUnit);
  const maxLimitVal = convertWind(thresholds.maxSustainedWindMph, windUnit);
  const windScale = Math.min(
    1,
    current.windSpeed / Math.max(18, thresholds.maxSustainedWindMph * 1.25)
  );

  return (
    <div aria-live="polite" className="mt-4 grid grid-cols-2 gap-2.5 sm:gap-4 lg:grid-cols-4">
      <div className="rounded-control border border-line-strong bg-panel-inset p-3.5 sm:p-4 flex flex-col justify-between shadow-inset">
        <div className="flex items-center justify-between font-instrument text-2xs uppercase text-ink-soft">
          <span className="flex items-center gap-1.5 font-bold">
            <Wind strokeWidth={2} className="h-4 w-4 text-good shrink-0" aria-hidden="true" />
            WIND SPEED
          </span>
          <span className="text-ink-dim">MAX {maxLimitVal}</span>
        </div>
        <div className="my-2">
          <span className={`font-instrument text-3xl sm:text-4xl font-bold ${theme.text}`}>{windVal}</span>
          <span className="ml-1.5 font-instrument text-sm text-ink-soft font-semibold">{unit}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-pill bg-panel border border-line">
          <div className={`meter-scale-bar h-full w-full rounded-pill ${theme.bar}`} style={{ '--meter-scale': windScale }} />
        </div>
      </div>

      <div className="rounded-control border border-line-strong bg-panel-inset p-3.5 sm:p-4 flex flex-col justify-between shadow-inset">
        <div className="flex items-center justify-between font-instrument text-2xs uppercase text-ink-soft">
          <span className="flex items-center gap-1.5 font-bold">
            <Gauge strokeWidth={2} className="h-4 w-4 text-caution shrink-0" aria-hidden="true" />
            PEAK GUSTS
          </span>
          <span className="text-caution-ink font-bold">Δ +{spreadVal}</span>
        </div>
        <div className="my-2">
          <span className="font-instrument text-3xl sm:text-4xl font-bold text-ink">{gustVal}</span>
          <span className="ml-1.5 font-instrument text-sm text-ink-soft font-semibold">{unit}</span>
        </div>
        <div className="font-instrument text-2xs text-ink-dim">
          {status.gustSpread > thresholds.maxGustSpreadMph ? 'TURBULENT SHEAR' : 'STEADY GRADIENT'}
        </div>
      </div>

      <div className="rounded-control border border-line-strong bg-panel-inset p-3.5 sm:p-4 flex flex-col justify-between shadow-inset">
        <div className="flex items-center justify-between font-instrument text-2xs uppercase text-ink-soft">
          <span className="flex items-center gap-1.5 font-bold">
            <Compass strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
            FROM VECTOR
          </span>
          <span className="text-avionics font-bold">{runwayInfo.rwyLabel}</span>
        </div>
        <div className="my-2">
          <span className="font-instrument text-3xl sm:text-4xl font-bold text-ink">{current.cardinal}</span>
          <span className="ml-1.5 font-instrument text-sm text-avionics font-bold">
            {String(current.windDirection).padStart(3, '0')}°
          </span>
        </div>
        <div className="font-instrument text-2xs text-ink-dim">
          Blows toward {String((current.windDirection + 180) % 360).padStart(3, '0')}°
        </div>
      </div>

      <div className="rounded-control border border-line-strong bg-panel-inset p-3.5 sm:p-4 flex flex-col justify-between shadow-inset">
        <div className="flex items-center justify-between font-instrument text-2xs uppercase text-ink-soft">
          <span className="flex items-center gap-1.5 font-bold">
            <Thermometer strokeWidth={2} className="h-4 w-4 text-avionics shrink-0" aria-hidden="true" />
            AMBIENT TEMP
          </span>
          <span className="text-ink-dim font-bold">VIS {current.visibilityMi} MI</span>
        </div>
        <div className="my-2">
          <span className="font-instrument text-3xl sm:text-4xl font-bold text-ink">{current.temperature}°</span>
          <span className="ml-1 font-instrument text-sm text-ink-soft font-semibold">F</span>
        </div>
        <div className="font-instrument text-2xs text-ink-dim">
          Feels {current.apparentTemperature}°F • Rain {current.precipProb}%
        </div>
      </div>
    </div>
  );
}

import { useEffect, useRef } from 'react';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import {
  AIRCRAFT_PRESETS,
  DEFAULT_THRESHOLDS,
  convertWind,
  getUnitLabel,
} from '../config/flightConfig';

const WIND_FIELDS = [
  { key: 'cautionWindMph', label: 'Calm / Ideal Wind Ceiling', min: 3, max: 20 },
  { key: 'maxSustainedWindMph', label: 'Max Sustained Wind (No-Go)', min: 6, max: 30 },
  { key: 'maxGustMph', label: 'Max Peak Gust (No-Go)', min: 8, max: 38 },
  { key: 'maxGustSpreadMph', label: 'Max Gust Spread (Δ Gust - Wind)', min: 4, max: 18 },
  { key: 'maxCrosswindMph', label: 'Max Runway Crosswind', min: 3, max: 20 },
];

const ENV_FIELDS = [
  { key: 'maxPrecipProbPct', label: 'Rain Caution Threshold', min: 15, max: 80, step: 5, suffix: '%' },
  { key: 'minVisibilityMi', label: 'Minimum Visibility', min: 1, max: 8, step: 0.5, suffix: ' mi' },
  { key: 'minTempF', label: 'Min Ambient Temp (LiPo Cold Alert)', min: 25, max: 60, step: 5, suffix: '°F' },
  { key: 'maxTempF', label: 'Max Ambient Temp (ESC Heat Alert)', min: 80, max: 105, step: 1, suffix: '°F' },
];

export default function ThresholdSettingsModal({
  open,
  onClose,
  thresholds,
  onChangeThresholds,
  windUnit = 'mph',
}) {
  const dialogRef = useRef(null);
  const unit = getUnitLabel(windUnit);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) dialog.showModal();
    else if (!open && dialog.open) dialog.close();
  }, [open]);

  const updateField = (key, rawVal) => {
    const num = Number(rawVal);
    onChangeThresholds((prev) => {
      const next = { ...prev, presetId: 'custom', [key]: num };
      if (key === 'maxGustMph') next.cautionGustMph = Math.max(6, Math.round(num * 0.7));
      return next;
    });
  };

  return (
    <dialog
      ref={dialogRef}
      onClose={onClose}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      {...{ closedby: 'any' }}
      aria-labelledby="limits-dialog-title"
      className="avionics-dialog m-auto w-[calc(100%-1.5rem)] max-w-lg rounded-card border border-line-strong bg-panel p-0 text-ink shadow-panel"
    >
      <div className="flex items-center justify-between border-b border-line px-4 py-3.5 sm:px-5">
        <div className="flex items-center gap-2">
          <SlidersHorizontal strokeWidth={2} className="h-5 w-5 text-avionics" aria-hidden="true" />
          <h2 id="limits-dialog-title" className="font-display text-base sm:text-lg font-bold">
            Aircraft Go / No-Go Limits
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close limits dialog"
          className="touch-target inline-flex items-center justify-center rounded-control border border-line bg-panel-inset text-ink-soft hover:text-ink"
        >
          <X strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[72dvh] overflow-y-auto p-4 sm:p-5 space-y-4">
        <div className="space-y-2">
          <span className="block font-instrument text-2xs font-semibold uppercase text-ink-soft">
            Quick Airframe Presets
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AIRCRAFT_PRESETS.map((preset) => {
              const active = thresholds.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => onChangeThresholds(preset.thresholds)}
                  aria-pressed={active}
                  className={`touch-target rounded-control border px-3 py-2 text-left font-instrument text-xs font-semibold transition ${
                    active ? 'border-avionics bg-avionics-soft text-ink' : 'border-line bg-panel-inset text-ink-soft hover:text-ink'
                  }`}
                >
                  {preset.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-3 border-t border-line pt-3">
          {WIND_FIELDS.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between font-instrument text-xs">
                <label htmlFor={`slider-${item.key}`} className="text-ink-soft">{item.label}</label>
                <span className="font-bold text-avionics">{convertWind(thresholds[item.key], windUnit)} {unit}</span>
              </div>
              <input
                id={`slider-${item.key}`}
                type="range"
                min={item.min}
                max={item.max}
                step="1"
                value={thresholds[item.key]}
                onChange={(e) => updateField(item.key, e.target.value)}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          ))}

          {ENV_FIELDS.map((item) => (
            <div key={item.key} className="space-y-1">
              <div className="flex justify-between font-instrument text-xs">
                <label htmlFor={`slider-${item.key}`} className="text-ink-soft">{item.label}</label>
                <span className="font-bold text-avionics">{thresholds[item.key]}{item.suffix}</span>
              </div>
              <input
                id={`slider-${item.key}`}
                type="range"
                min={item.min}
                max={item.max}
                step={item.step}
                value={thresholds[item.key]}
                onChange={(e) => updateField(item.key, e.target.value)}
                className="w-full accent-sky-400 cursor-pointer"
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between gap-2 border-t border-line bg-panel-inset px-4 py-3 sm:px-5">
        <button
          type="button"
          onClick={() => onChangeThresholds(DEFAULT_THRESHOLDS)}
          className="touch-target inline-flex items-center gap-1.5 rounded-control border border-line bg-panel px-3 font-instrument text-xs font-semibold text-ink-soft hover:text-ink"
        >
          <RotateCcw strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" />
          Reset 60-Class Defaults
        </button>
        <button
          type="button"
          onClick={onClose}
          className="touch-target rounded-control bg-avionics px-4 font-instrument text-xs font-bold text-slate-950"
        >
          Save &amp; Apply
        </button>
      </div>
    </dialog>
  );
}

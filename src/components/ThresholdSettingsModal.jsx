import { useEffect, useRef } from 'react';
import { SlidersHorizontal, RotateCcw, X } from 'lucide-react';
import {
  AIRCRAFT_PRESETS,
  CONTENT_PROFILES,
  PILOT_PROFILES,
  CALCULATION_BASES,
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
  contentProfile = 'adult',
  onChangeContentProfile,
  pilotProfile = 'intermediate',
  onChangePilotProfile,
  calcBasis = 'gust',
  onChangeCalcBasis,
}) {
  const dialogRef = useRef(null);
  const unit = getUnitLabel(windUnit);
  const activeProfile = thresholds.contentProfile || contentProfile || 'adult';
  const activePilot = thresholds.pilotProfile || pilotProfile || 'intermediate';
  const activeCalcBasis = thresholds.calcBasis || calcBasis || 'gust';

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

  const handleSelectPreset = (presetThresholds) => {
    onChangeThresholds({
      ...presetThresholds,
      contentProfile: activeProfile,
      pilotProfile: activePilot,
      calcBasis: activeCalcBasis,
    });
  };

  const handleSelectPilotProfile = (id) => {
    onChangePilotProfile?.(id);
    onChangeThresholds((prev) => ({ ...prev, pilotProfile: id }));
  };

  const handleSelectCalcBasis = (id) => {
    onChangeCalcBasis?.(id);
    onChangeThresholds((prev) => ({ ...prev, calcBasis: id }));
  };

  const handleResetDefaults = () => {
    onChangeThresholds({
      ...DEFAULT_THRESHOLDS,
      contentProfile: activeProfile,
      pilotProfile: activePilot,
      calcBasis: activeCalcBasis,
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
      className="avionics-dialog metal-panel relative overflow-hidden m-auto w-[calc(100%-1.5rem)] max-w-lg p-0 text-ink shadow-panel border border-line-strong"
    >
      <span className="rivet top-left" aria-hidden="true" />
      <span className="rivet top-right" aria-hidden="true" />
      <span className="rivet bottom-left" aria-hidden="true" />
      <span className="rivet bottom-right" aria-hidden="true" />

      {/* WWII Cockpit Panel Header */}
      <div className="panel-header justify-between">
        <div className="flex items-center gap-2">
          <span className="panel-badge" aria-hidden="true">CFG</span>
          <SlidersHorizontal strokeWidth={2} className="h-4 w-4 text-avionics" aria-hidden="true" />
          <h2 id="limits-dialog-title" className="font-display text-base font-bold uppercase tracking-wider text-ink">
            Pilot Profiles &amp; Flight Limits
          </h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          aria-label="Close limits dialog"
          className="btn-retro p-1.5 text-ink-soft hover:text-ink"
        >
          <X strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>

      <div className="max-h-[72dvh] overflow-y-auto p-4 sm:p-5 space-y-4">
        {/* Pilot Experience Profile Section */}
        <div className="space-y-2 rounded-card border border-line-strong bg-panel-inset p-3 shadow-inset">
          <div className="flex items-center justify-between gap-2">
            <span className="block font-instrument text-2xs font-bold uppercase tracking-wider text-avionics">
              Pilot Skill Level
            </span>
            <span className="font-instrument text-2xs text-ink-dim">
              Scales wind tolerance
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {PILOT_PROFILES.map((pilot) => {
              const active = activePilot === pilot.id;
              return (
                <button
                  key={pilot.id}
                  type="button"
                  onClick={() => handleSelectPilotProfile(pilot.id)}
                  aria-pressed={active}
                  className={`btn-retro flex flex-col items-start gap-1 p-2.5 text-left transition ${
                    active
                      ? 'border-avionics text-ink bg-panel-raised ring-1 ring-avionics/40'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-xs font-bold uppercase tracking-wide">
                      {pilot.icon} {pilot.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-instrument text-3xs font-bold ${
                        pilot.id === 'extreme'
                          ? 'border border-stop-line bg-stop-surface text-stop'
                          : pilot.id === 'advanced'
                            ? 'border border-caution-line bg-caution-surface text-caution-ink'
                            : pilot.id === 'beginner'
                              ? 'border border-sky-500/40 bg-sky-500/10 text-sky-400'
                              : 'border border-good-line bg-good-surface text-good'
                      }`}
                    >
                      {pilot.badge}
                    </span>
                  </div>
                  <span className="text-2xs text-ink-dim leading-tight">
                    {pilot.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Calculation Basis: Sustained vs Peak Gusts */}
        <div className="space-y-2 rounded-card border border-line-strong bg-panel-inset p-3 shadow-inset">
          <div className="flex items-center justify-between gap-2">
            <span className="block font-instrument text-2xs font-bold uppercase tracking-wider text-avionics">
              Wind Calculation Basis
            </span>
            <span className="font-instrument text-2xs text-ink-dim">
              Gusts vs Sustained Speed
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CALCULATION_BASES.map((basis) => {
              const active = activeCalcBasis === basis.id;
              return (
                <button
                  key={basis.id}
                  type="button"
                  onClick={() => handleSelectCalcBasis(basis.id)}
                  aria-pressed={active}
                  className={`btn-retro flex flex-col items-start gap-1 p-2.5 text-left transition ${
                    active
                      ? 'border-avionics text-ink bg-panel-raised ring-1 ring-avionics/40'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-xs font-bold uppercase tracking-wide">
                      {basis.icon} {basis.shortLabel}
                    </span>
                    <span className="rounded border border-line px-1.5 py-0.5 font-instrument text-3xs font-bold text-ink-soft">
                      {basis.badge}
                    </span>
                  </div>
                  <span className="text-2xs text-ink-dim leading-tight">
                    {basis.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Content & Language Profile Section */}
        <div className="space-y-2 rounded-card border border-line-strong bg-panel-inset p-3 shadow-inset">
          <div className="flex items-center justify-between gap-2">
            <span className="block font-instrument text-2xs font-bold uppercase tracking-wider text-avionics">
              Audience &amp; Language Profile
            </span>
            <span className="font-instrument text-2xs text-ink-dim">
              Controls Go / No-Go tone
            </span>
          </div>

          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {CONTENT_PROFILES.map((prof) => {
              const active = activeProfile === prof.id;
              return (
                <button
                  key={prof.id}
                  type="button"
                  onClick={() => {
                    onChangeContentProfile?.(prof.id);
                    onChangeThresholds((prev) => ({ ...prev, contentProfile: prof.id }));
                  }}
                  aria-pressed={active}
                  className={`btn-retro flex flex-col items-start gap-1 p-2.5 text-left transition ${
                    active
                      ? 'border-avionics text-ink bg-panel-raised ring-1 ring-avionics/40'
                      : 'text-ink-soft hover:text-ink'
                  }`}
                >
                  <div className="flex items-center justify-between w-full">
                    <span className="font-display text-xs font-bold uppercase tracking-wide">
                      {prof.name}
                    </span>
                    <span
                      className={`rounded px-1.5 py-0.5 font-instrument text-3xs font-bold ${
                        prof.id === 'adult'
                          ? 'border border-stop-line bg-stop-surface text-stop'
                          : 'border border-good-line bg-good-surface text-good'
                      }`}
                    >
                      {prof.badge}
                    </span>
                  </div>
                  <span className="text-2xs text-ink-dim leading-tight">
                    {prof.description}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="space-y-2">
          <span className="block font-instrument text-2xs font-bold uppercase text-ink-soft">
            Quick Airframe Presets
          </span>
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {AIRCRAFT_PRESETS.map((preset) => {
              const active = thresholds.presetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset.thresholds)}
                  aria-pressed={active}
                  className={`btn-retro text-left justify-start text-xs ${
                    active ? 'border-avionics text-avionics bg-panel-raised' : 'text-ink-soft'
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
                <label htmlFor={`slider-${item.key}`} className="text-ink-soft font-semibold">{item.label}</label>
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
                <label htmlFor={`slider-${item.key}`} className="text-ink-soft font-semibold">{item.label}</label>
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
          onClick={handleResetDefaults}
          className="btn-retro text-xs"
        >
          <RotateCcw strokeWidth={2} className="h-3.5 w-3.5" aria-hidden="true" />
          Reset Defaults
        </button>
        <button
          type="button"
          onClick={onClose}
          className="btn-red-launcher text-xs py-2 px-4 uppercase"
        >
          Save &amp; Apply
        </button>
      </div>
    </dialog>
  );
}

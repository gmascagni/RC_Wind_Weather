import { useState } from 'react';
import { Lock, ShieldCheck, KeyRound, Smartphone } from 'lucide-react';
import { APP_VERSION } from '../config/versionConfig';
import { UsaacStarEmblem } from './StatusVisuals';

const OWNER_PIN = '1940';
export const OWNER_UNLOCK_STORAGE_KEY = 'rc_wind_owner_unlocked_v1';

export function isNativeOrUnlockedWeb() {
  if (typeof window === 'undefined') return true;
  // Always unlocked inside the native Android APK / Google Play AAB build
  const isNativeAndroid =
    Boolean(window.Capacitor?.isNativePlatform?.()) ||
    import.meta.env.BASE_URL === './' ||
    /;\s*wv\)/i.test(window.navigator?.userAgent || '');

  if (isNativeAndroid) return true;

  try {
    return window.localStorage.getItem(OWNER_UNLOCK_STORAGE_KEY) === 'unlocked';
  } catch {
    return false;
  }
}

export default function WebOwnerGate({ onUnlock }) {
  const [pin, setPin] = useState('');
  const [error, setError] = useState('');

  const baseUrl = import.meta.env.BASE_URL || '/RC_Wind_Weather/';
  const p40Src = `${baseUrl}p40-warhawk.jpg`.replace(/\/{2,}/g, '/');
  const privacyUrl = `${baseUrl}privacy.html`.replace(/\/{2,}/g, '/');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (pin.trim() === OWNER_PIN) {
      try {
        window.localStorage.setItem(OWNER_UNLOCK_STORAGE_KEY, 'unlocked');
      } catch {
        // Ignore storage errors
      }
      setError('');
      onUnlock?.();
    } else {
      setError('INVALID FLIGHT DECK PIN — ACCESS DENIED');
      setPin('');
    }
  };

  return (
    <div className="min-h-dvh flex flex-col items-center justify-center p-4 text-ink">
      <div className="metal-panel relative w-full max-w-md overflow-hidden p-0 shadow-panel border-2 border-line-strong">
        <span className="rivet top-left" aria-hidden="true" />
        <span className="rivet top-right" aria-hidden="true" />
        <span className="rivet bottom-left" aria-hidden="true" />
        <span className="rivet bottom-right" aria-hidden="true" />

        {/* Cockpit Header */}
        <div className="panel-header justify-between">
          <div className="flex items-center gap-2">
            <span className="panel-badge" aria-hidden="true">SEC</span>
            <Lock strokeWidth={2} className="h-4 w-4 text-avionics" aria-hidden="true" />
            <span className="font-display text-sm font-bold uppercase tracking-wider text-ink">
              Flight Deck Security Gate
            </span>
          </div>
          <span className="font-instrument text-2xs font-bold text-avionics">{APP_VERSION}</span>
        </div>

        <div className="p-5 sm:p-6 space-y-5">
          {/* P-40 Flying Tigers Emblem & Title */}
          <div className="flex items-center gap-3.5">
            <UsaacStarEmblem className="h-14 w-14 shrink-0" />
            <div>
              <div className="flex items-center gap-1.5">
                <span className="status-lamp amber" aria-hidden="true" />
                <span className="font-instrument text-2xs font-bold uppercase tracking-widest text-avionics">
                  Commercial Avionics Edition
                </span>
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wider text-ink">
                ★ RC WIND WEATHER PRO ★
              </h1>
              <p className="font-script text-base text-amber-200">
                Check the Wind. Keep &apos;Em Flying!
              </p>
            </div>
          </div>

          {/* P-40 Warhawk Artwork Banner */}
          <div className="relative h-28 w-full overflow-hidden rounded-control border border-line-strong bg-panel-inset shadow-inset">
            <img
              src={p40Src}
              alt="Curtiss P-40 Warhawk Flying Tigers"
              className="h-full w-full object-cover object-center"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />
            <div className="absolute bottom-2 left-3 right-3 flex items-end justify-between">
              <div>
                <span className="block font-display text-xs font-bold uppercase tracking-wider text-ink">
                  RC Pilot Wind, Gust &amp; Crosswind Computer
                </span>
                <span className="font-instrument text-2xs text-ink-soft">
                  Live HSI Compass • Density Altitude • 4 Pilot Skill Profiles
                </span>
              </div>
            </div>
          </div>

          {/* Google Play Notice */}
          <div className="rounded-control border border-avionics/40 bg-avionics/10 p-3.5 space-y-1.5">
            <div className="flex items-center gap-2 font-display text-xs font-bold uppercase tracking-wider text-avionics">
              <Smartphone strokeWidth={2} className="h-4 w-4 shrink-0" aria-hidden="true" />
              <span>Available on Google Play Store</span>
            </div>
            <p className="font-instrument text-xs text-ink-soft leading-relaxed">
              The full mobile edition with live hardware magnetometer compass and offline airfield telemetry is distributed through the official <strong>Google Play Store</strong>.
            </p>
          </div>

          {/* Owner PC Web Access PIN Form */}
          <form onSubmit={handleSubmit} className="rounded-control border border-line-strong bg-panel-inset p-3.5 space-y-3 shadow-inset">
            <div className="flex items-center justify-between">
              <label htmlFor="owner-pin-input" className="flex items-center gap-1.5 font-instrument text-2xs font-bold uppercase text-ink-soft">
                <KeyRound strokeWidth={2} className="h-3.5 w-3.5 text-avionics" aria-hidden="true" />
                <span>Owner / Authorized PC Access PIN</span>
              </label>
              <span className="font-instrument text-3xs text-ink-dim uppercase">Authorized Crew Only</span>
            </div>

            <div className="flex items-center gap-2">
              <input
                id="owner-pin-input"
                type="password"
                inputMode="numeric"
                autoComplete="off"
                placeholder="Enter Flight Deck PIN…"
                value={pin}
                onChange={(e) => {
                  setPin(e.target.value);
                  if (error) setError('');
                }}
                className="w-full rounded-control border border-line-strong bg-deck-bg px-3 py-2 font-instrument text-sm font-bold tracking-widest text-ink placeholder:text-ink-dim/50 focus:border-avionics focus:outline-none"
              />
              <button
                type="submit"
                className="btn-retro shrink-0 px-4 py-2 text-xs font-bold text-avionics border-avionics/60"
              >
                <ShieldCheck strokeWidth={2} className="h-4 w-4" aria-hidden="true" />
                UNLOCK
              </button>
            </div>

            {error && (
              <p role="alert" className="font-instrument text-2xs font-bold text-stop">
                ▲ {error}
              </p>
            )}
          </form>

          {/* Footer Links */}
          <div className="flex items-center justify-between border-t border-line pt-3 font-instrument text-[10px] text-ink-dim">
            <span>PACKAGE: com.rcwind.weatherpro</span>
            <a
              href={privacyUrl}
              target="_blank"
              rel="noreferrer"
              className="hover:text-ink underline"
            >
              Privacy Policy
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

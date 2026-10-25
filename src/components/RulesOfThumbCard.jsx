import React, { useState } from 'react';
import {
  Wind,
  Gauge,
  Compass,
  CheckCircle2,
  OctagonAlert,
} from 'lucide-react';

export default function RulesOfThumbCard({ currentWindSpeed = 0, currentGusts = 0 }) {
  // Collapse by default on narrow mobile screens to keep the primary flight deck compact; open by default on tablet/desktop
  const [defaultOpen] = useState(() =>
    typeof window !== 'undefined' ? window.innerWidth >= 768 : true
  );
  const gustSpread = Math.max(0, Math.round((currentGusts - currentWindSpeed) * 10) / 10);

  const aircraftTiers = [
    {
      title: 'Micro & Ultra-Light Park Flyers',
      subtitle: 'UMX, Slow Stick, Sub-250g Foamies, Backyard Flyers',
      windLimit: '0 – 7 mph',
      maxGusts: '≤ 10 mph',
      badge: '🟢 < 8 mph Zone',
      badgeClass: 'border-emerald-400/50 bg-emerald-500/15 text-emerald-300',
      isCurrentlySafe: currentWindSpeed < 8 && currentGusts <= 12,
      guidance: [
        'Low wing loading (< 8 oz/sq ft) means gusts above 8 mph can exceed forward airspeed or stall the wing on base-to-final turns.',
        'Fly early morning (sunrise to 10:00 AM) or the "golden hour" before sunset when thermal mixing subsides.',
        'Always keep the model upwind of your pilot station so the breeze carries it back toward the runway if battery voltage sags.',
      ],
    },
    {
      title: 'Standard Sport, Trainers & 3S–4S Foamies',
      subtitle: '1.1m–1.5m Timber, Aeroscout, Apprentice, Warbirds & 64mm–70mm EDFs',
      windLimit: '8 – 15 mph',
      maxGusts: '≤ 20 mph',
      badge: '🟡 8–15 mph Zone',
      badgeClass: 'border-amber-400/50 bg-amber-500/15 text-amber-300',
      isCurrentlySafe: currentWindSpeed <= 15 && currentGusts <= 20,
      guidance: [
        'Engage 3-axis gyro stabilization (AS3X / Reflex / Aura) in normal rate mode; avoid Self-Leveling on gusty crosswind landings.',
        'Carry 15–20% extra throttle on final approach to maintain airspeed through tree-line wind shear and mechanical turbulence.',
        'Use half-flaps instead of full flaps when gusts exceed 12 mph to prevent ballooning and wing-tip stalls.',
      ],
    },
    {
      title: 'Larger Scale, 3D Balsa & Giant Scale Aircraft',
      subtitle: '60cc+ Gas, 6S–12S Balsa/Composite, 80mm–90mm EDFs & Heavy Warbirds',
      windLimit: '12 – 22+ mph',
      maxGusts: '≤ 26 mph',
      badge: '🔴 > 15 mph Caution',
      badgeClass: 'border-rose-400/50 bg-rose-500/15 text-rose-300',
      isCurrentlySafe: currentWindSpeed <= 22 && currentGusts <= 26,
      guidance: [
        'Higher wing loading (22–38+ oz/sq ft) and higher stall speeds handle 15–20 mph steady headwinds smoothly.',
        'Watch the Gust Spread (Gusts minus Sustained Wind): if Δ > 8 mph, expect abrupt sink on short final.',
        'Wheel-land taildraggers slightly above stall speed rather than forcing a 3-point flare in gusty crosswinds.',
      ],
    },
  ];

  return (
    <section id="rules-section" aria-labelledby="rules-section-heading" className="space-y-2">
      <h2 id="rules-section-heading" className="visually-hidden">
        RC Pilot Field Manual: Wind Rules of Thumb
      </h2>

      <details
        open={defaultOpen}
        className="tactical-details tactical-card group rounded-2xl border border-slate-800/90 bg-[#0b111e]/95 shadow-xl transition"
      >
        <summary className="touch-target flex flex-wrap items-center justify-between gap-2.5 rounded-2xl p-3.5 sm:p-6 hover:bg-slate-900/50">
          <div className="flex items-center gap-3 min-w-0 flex-1">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-xl border border-sky-500/40 bg-[#0b1324]">
              <svg width="36" height="36" aria-hidden="true" className="block">
                <use href="#rc-airplane-symbol" />
              </svg>
            </div>
            <div className="min-w-0">
              <span className="block font-display text-base sm:text-xl font-bold tracking-tight text-white truncate">
                RC Pilot Field Manual: Rules of Thumb
              </span>
              <span className="block text-xs sm:text-sm text-slate-400 truncate">
                Safe wind envelopes for Park Flyers vs. Sport vs. Scale Aircraft
              </span>
            </div>
          </div>
        </summary>

        <div className="space-y-4 sm:space-y-5 border-t border-slate-800/90 p-3.5 sm:p-6">
          {/* Three Aircraft Class Cards */}
          <div className="grid grid-cols-1 gap-3.5 sm:gap-4 lg:grid-cols-3">
            {aircraftTiers.map((tier) => (
              <article
                key={tier.title}
                className="flex flex-col justify-between rounded-xl border border-slate-800 bg-slate-950/85 p-3.5 sm:p-4"
              >
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span
                      className={`status-pill rounded-full border px-2.5 py-0.5 font-mono-tech text-xs font-bold ${tier.badgeClass}`}
                    >
                      {tier.badge}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 font-mono-tech text-[11px] font-semibold ${
                        tier.isCurrentlySafe
                          ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                          : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {tier.isCurrentlySafe ? (
                        <>
                          <CheckCircle2 className="h-3 w-3" aria-hidden="true" />
                          CURRENTLY GO
                        </>
                      ) : (
                        <>
                          <OctagonAlert className="h-3 w-3" aria-hidden="true" />
                          EXCEEDS LIMIT
                        </>
                      )}
                    </span>
                  </div>

                  <div className="mt-2.5 font-display text-base font-bold text-white">
                    {tier.title}
                  </div>
                  <p className="mt-0.5 text-xs text-slate-400">{tier.subtitle}</p>

                  {/* Metrics Box */}
                  <div className="my-3 grid grid-cols-2 gap-2 rounded-lg border border-slate-800/90 bg-slate-900/70 p-2.5 font-mono-tech">
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">
                        SUSTAINED LIMIT
                      </span>
                      <span className="text-sm font-bold text-white">{tier.windLimit}</span>
                    </div>
                    <div>
                      <span className="block text-[10px] uppercase text-slate-400">
                        MAX GUST CEILING
                      </span>
                      <span className="text-sm font-bold text-slate-200">{tier.maxGusts}</span>
                    </div>
                  </div>

                  {/* Bullet guidance */}
                  <ul className="space-y-1.5 text-xs leading-relaxed text-slate-300">
                    {tier.guidance.map((tip, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-sky-400" aria-hidden="true" />
                        <span>{tip}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </article>
            ))}
          </div>

          {/* Tactical Field Rules Footer Strip */}
          <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-800/80 bg-slate-900/60 p-3.5 sm:p-4 sm:grid-cols-3">
            <div className="flex items-start gap-3">
              <Gauge className="mt-0.5 h-5 w-5 shrink-0 text-amber-400" aria-hidden="true" />
              <div>
                <div className="font-mono-tech text-xs font-bold uppercase text-amber-300">
                  The 50% Groundspeed Rule
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  Never fly an aircraft when peak gusts exceed <strong>50% of its top level airspeed</strong>. Currently gust spread is{' '}
                  <strong className="text-white">+{gustSpread} mph</strong> over sustained wind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Compass className="mt-0.5 h-5 w-5 shrink-0 text-sky-400" aria-hidden="true" />
              <div>
                <div className="font-mono-tech text-xs font-bold uppercase text-sky-300">
                  Crosswind Vector Math
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  A <strong>30° crosswind</strong> equals 50% of total wind speed across the runway; a <strong>45° crosswind</strong> equals 70%; a <strong>60°+ angle</strong> equals ~90%+ full crosswind.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <Wind className="mt-0.5 h-5 w-5 shrink-0 text-emerald-400" aria-hidden="true" />
              <div>
                <div className="font-mono-tech text-xs font-bold uppercase text-emerald-300">
                  Tree-Line Rotor Zone
                </div>
                <p className="mt-1 text-xs text-slate-300">
                  At North Georgia fields (Alpharetta, Roswell, Woodstock), tall pines create mechanical curl turbulence extending <strong>7× tree height</strong> downwind.
                </p>
              </div>
            </div>
          </div>
        </div>
      </details>
    </section>
  );
}

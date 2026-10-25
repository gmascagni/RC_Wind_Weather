import React from 'react';
import { Navigation2, Compass } from 'lucide-react';

export default function TacticalCompass({
  windDirection = 0,
  cardinal = 'N',
  status,
}) {
  const normalizedDeg = ((Math.round(Number(windDirection)) % 360) + 360) % 360;
  // Runway number in aviation is nearest 10 degrees divided by 10 (01 to 36)
  const rwyNum = String(Math.round(normalizedDeg / 10) || 36).padStart(2, '0');

  return (
    <div className="tactical-card relative flex flex-col items-center justify-between rounded-2xl border border-slate-800/90 bg-[#0b1220]/90 p-3.5 sm:p-5 shadow-inner">
      {/* Top header */}
      <div className="flex w-full items-center justify-between gap-1 text-[11px] sm:text-xs font-mono-tech uppercase tracking-wider text-slate-400">
        <span className="flex items-center gap-1 truncate">
          <Compass className="h-3.5 w-3.5 shrink-0 text-sky-400" aria-hidden="true" />
          <span className="truncate">VECTOR</span>
        </span>
        <span className="shrink-0 rounded bg-slate-800/90 px-1.5 py-0.5 text-[10px] sm:text-[11px] font-semibold text-sky-300 border border-slate-700/70">
          RWY {rwyNum}
        </span>
      </div>

      {/* Compass Rose Dial + Rotating Arrow */}
      <div className="relative my-2 sm:my-3 flex h-24 w-24 sm:h-36 sm:w-36 items-center justify-center">
        {/* Outer tactical ring SVG */}
        <svg
          viewBox="0 0 120 120"
          className="absolute inset-0 h-full w-full block"
          aria-hidden="true"
        >
          <circle
            cx="60"
            cy="60"
            r="54"
            fill="none"
            stroke="rgba(51, 65, 85, 0.7)"
            strokeWidth="1.75"
          />
          <circle
            cx="60"
            cy="60"
            r="45"
            fill="none"
            stroke="rgba(56, 189, 248, 0.22)"
            strokeWidth="1"
            strokeDasharray="3 3"
          />
          <circle
            cx="60"
            cy="60"
            r="26"
            fill="rgba(15, 23, 42, 0.8)"
            stroke="rgba(51, 65, 85, 0.65)"
            strokeWidth="1"
          />

          {/* Degree ticks every 30 deg */}
          {Array.from({ length: 12 }, (_, i) => {
            const angle = i * 30;
            const isMajor = angle % 90 === 0;
            return (
              <line
                key={angle}
                x1="60"
                y1={isMajor ? '6' : '8'}
                x2="60"
                y2={isMajor ? '13' : '12'}
                stroke={isMajor ? '#94a3b8' : '#475569'}
                strokeWidth={isMajor ? '2' : '1.2'}
                transform={`rotate(${angle} 60 60)`}
              />
            );
          })}
        </svg>

        {/* Cardinal Labels */}
        <span
          className="absolute top-1 font-mono-tech text-[10px] sm:text-[11px] font-bold tracking-widest text-rose-400"
          aria-hidden="true"
        >
          N
        </span>
        <span
          className="absolute right-1.5 font-mono-tech text-[10px] sm:text-[11px] font-semibold text-slate-400"
          aria-hidden="true"
        >
          E
        </span>
        <span
          className="absolute bottom-1 font-mono-tech text-[10px] sm:text-[11px] font-semibold text-slate-400"
          aria-hidden="true"
        >
          S
        </span>
        <span
          className="absolute left-1.5 font-mono-tech text-[10px] sm:text-[11px] font-semibold text-slate-400"
          aria-hidden="true"
        >
          W
        </span>

        {/* Rotating Wind Compass Arrow driven by CSS custom property --wind-deg */}
        <div
          className="wind-arrow-dynamic relative flex h-16 w-16 sm:h-24 sm:w-24 items-center justify-center"
          style={{ '--wind-deg': `${normalizedDeg}deg` }}
          role="img"
          aria-label={`Compass arrow pointing ${normalizedDeg} degrees (${cardinal})`}
        >
          <div
            className="h-14 sm:h-20 w-0.5 rounded-full"
            style={{
              background: `linear-gradient(to top, transparent 0%, ${status?.accentHex || '#38bdf8'} 100%)`,
            }}
          />
          <Navigation2
            className="absolute -top-1.5 h-5 w-5 sm:h-6 sm:w-6 drop-shadow-[0_0_8px_rgba(56,189,248,0.65)]"
            style={{
              color: status?.accentHex || '#38bdf8',
              fill: status?.accentHex || '#38bdf8',
            }}
            aria-hidden="true"
          />
          <div className="absolute h-2 w-2 sm:h-2.5 sm:w-2.5 rounded-full border border-slate-950 bg-slate-200 shadow" />
        </div>
      </div>

      {/* Bottom readout */}
      <div className="flex w-full items-baseline justify-between border-t border-slate-800/80 pt-2 sm:pt-2.5">
        <div>
          <div className="text-[10px] font-mono-tech uppercase text-slate-400">
            FROM
          </div>
          <div className="font-mono-tech text-base sm:text-xl font-bold tracking-tight text-white">
            {cardinal}{' '}
            <span className="text-xs sm:text-base font-medium text-sky-400">
              {String(normalizedDeg).padStart(3, '0')}°
            </span>
          </div>
        </div>
        <div className="text-right">
          <div className="text-[10px] font-mono-tech uppercase text-slate-400">
            LAUNCH
          </div>
          <div className="font-mono-tech text-[11px] sm:text-xs font-semibold text-emerald-300">
            HDG {String(normalizedDeg).padStart(3, '0')}°
          </div>
        </div>
      </div>
    </div>
  );
}

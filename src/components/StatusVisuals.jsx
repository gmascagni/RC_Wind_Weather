import { CheckCircle2, AlertTriangle, OctagonAlert } from 'lucide-react';

export function StatusIcon({ level, className = 'w-5 h-5' }) {
  if (level === 'good') {
    return <CheckCircle2 strokeWidth={2.2} className={`${className} text-good shrink-0`} aria-hidden="true" />;
  }
  if (level === 'marginal') {
    return <AlertTriangle strokeWidth={2.2} className={`${className} text-caution shrink-0`} aria-hidden="true" />;
  }
  return <OctagonAlert strokeWidth={2.2} className={`${className} text-stop shrink-0`} aria-hidden="true" />;
}

export function StatusLamp({ level = 'good' }) {
  const lampClass = level === 'good' ? 'green' : level === 'marginal' ? 'amber' : 'red';
  return <span className={`status-lamp ${lampClass}`} aria-hidden="true" />;
}

export function UsaacStarSymbolDef() {
  return (
    <svg width="0" height="0" className="absolute pointer-events-none" aria-hidden="true">
      <defs>
        {/* Classic US Army Air Corps (USAAC) Star Roundel */}
        <symbol id="usaac-star-symbol" viewBox="0 0 100 100">
          <circle cx="50" cy="50" r="48" fill="#1b2028" stroke="#5a6778" strokeWidth="2" />
          <circle cx="50" cy="50" r="44" fill="#1b365d" stroke="#d8e2ec" strokeWidth="2.5" />
          <polygon
            points="50,8 59.4,37 90,37 65.3,55 74.7,84 50,66 25.3,84 34.7,55 10,37 40.6,37"
            fill="#ffffff"
          />
          <circle cx="50" cy="50" r="13" fill="#d13535" />
        </symbol>
      </defs>
    </svg>
  );
}

// Backward-compatibility alias
export const RcAirplaneSymbolDef = UsaacStarSymbolDef;

export function UsaacStarEmblem({ className = 'h-11 w-11 sm:h-13 sm:w-13' }) {
  return (
    <svg viewBox="0 0 100 100" className={`${className} block shrink-0 drop-shadow-md`} aria-hidden="true">
      {/* Outer Steel Beveled Rim */}
      <circle cx="50" cy="50" r="48" fill="#1b2028" stroke="#5a6778" strokeWidth="2" />
      {/* Classic US Army Air Corps Navy Roundel */}
      <circle cx="50" cy="50" r="44" fill="#1b365d" stroke="#d8e2ec" strokeWidth="2.5" />
      {/* Prominent White 5-Pointed Star */}
      <polygon
        points="50,8 59.4,37 90,37 65.3,55 74.7,84 50,66 25.3,84 34.7,55 10,37 40.6,37"
        fill="#ffffff"
      />
      {/* Central Red Dot */}
      <circle cx="50" cy="50" r="13" fill="#d13535" />
    </svg>
  );
}

// Backward-compatibility alias pointing to clean emblem
export const UsaacWingedCrest = UsaacStarEmblem;

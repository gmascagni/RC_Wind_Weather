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
          <circle cx="50" cy="50" r="46" fill="#1b365d" stroke="#d8e2ec" strokeWidth="3" />
          <polygon
            points="50,10 59.5,36.9 88,37.6 65.3,55 73.5,82.4 50,66 26.5,82.4 34.7,55 12,37.6 40.5,36.9"
            fill="#ffffff"
          />
          <circle cx="50" cy="50" r="12.5" fill="#d13535" />
        </symbol>
      </defs>
    </svg>
  );
}

export function UsaacWingedCrest({ className = 'h-12 w-auto' }) {
  return (
    <svg viewBox="0 0 180 52" className={`${className} block shrink-0`} aria-hidden="true">
      {/* Left & Right Crimson Warbird Wings */}
      <path
        d="M46,24 C24,12 12,15 3,20 C14,26 28,26 43,25 C32,29 20,31 9,31 C22,36 35,34 46,31 Z"
        fill="#731b1b"
        stroke="#7e8d9f"
        strokeWidth="1.2"
      />
      <path
        d="M134,24 C156,12 168,15 177,20 C166,26 152,26 137,25 C148,29 160,31 171,31 C158,36 145,34 134,31 Z"
        fill="#731b1b"
        stroke="#7e8d9f"
        strokeWidth="1.2"
      />
      {/* Central USAAC Star Roundel */}
      <circle cx="90" cy="24" r="19" fill="#1b365d" stroke="#d8e2ec" strokeWidth="2" />
      <polygon
        points="90,8.5 93.8,19 105,19.3 96.1,26.1 99.3,36.8 90,30.3 80.7,36.8 83.9,26.1 75,19.3 86.2,19"
        fill="#ffffff"
      />
      <circle cx="90" cy="24" r="5" fill="#d13535" />
      {/* Bottom Plate */}
      <rect x="70" y="40" width="40" height="10" rx="2" fill="#20262d" stroke="#7e8d9f" strokeWidth="1" />
      <text x="90" y="47.5" fill="#ffb347" fontSize="7" fontWeight="700" textAnchor="middle" fontFamily="monospace">
        AIR CORPS
      </text>
    </svg>
  );
}

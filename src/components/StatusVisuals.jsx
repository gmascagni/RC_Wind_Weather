import { CheckCircle2, AlertTriangle, OctagonAlert } from 'lucide-react';

export function StatusIcon({ level, className = 'h-4 w-4' }) {
  if (level === 'good') {
    return <CheckCircle2 strokeWidth={2} className={`${className} text-good shrink-0`} aria-hidden="true" />;
  }
  if (level === 'marginal') {
    return <AlertTriangle strokeWidth={2} className={`${className} text-caution shrink-0`} aria-hidden="true" />;
  }
  return <OctagonAlert strokeWidth={2} className={`${className} text-stop shrink-0`} aria-hidden="true" />;
}

export function RcAirplaneSymbolDef() {
  return (
    <svg aria-hidden="true" className="hidden" width="0" height="0">
      <symbol id="rc-airplane-symbol" viewBox="0 0 512 512">
        <rect width="512" height="512" rx="112" fill="#0b1324" />
        <circle cx="256" cy="256" r="196" fill="none" stroke="#0ea5e9" strokeOpacity="0.3" strokeWidth="8" strokeDasharray="16 12" />
        <path d="M98 146 A 70 70 0 0 1 146 98" fill="none" stroke="#38bdf8" strokeWidth="14" strokeLinecap="round" />
        <path d="M70 174 A 110 110 0 0 1 174 70" fill="none" stroke="#38bdf8" strokeOpacity="0.7" strokeWidth="11" strokeLinecap="round" />
        <g transform="translate(256 262) rotate(-45) translate(-256 -256)">
          <ellipse cx="256" cy="68" rx="62" ry="12" fill="#38bdf8" fillOpacity="0.45" stroke="#7dd3fc" strokeWidth="4" />
          <path d="M64 218 L226 178 L286 178 L448 218 L436 254 L284 240 L228 240 L76 254 Z" fill="#10b981" stroke="#ecfdf5" strokeWidth="8" strokeLinejoin="round" />
          <path d="M168 386 L236 364 L276 364 L344 386 L336 410 L274 402 L238 402 L176 410 Z" fill="#0ea5e9" stroke="#e0f2fe" strokeWidth="7" strokeLinejoin="round" />
          <path d="M256 82 C276 82 288 128 286 210 L274 416 C272 432 264 440 256 440 C248 440 240 432 238 416 L226 210 C224 128 236 82 256 82 Z" fill="#f8fafc" stroke="#0f172a" strokeWidth="8" />
          <ellipse cx="256" cy="176" rx="18" ry="38" fill="#0284c7" stroke="#e0f2fe" strokeWidth="4" />
          <path d="M236 92 C242 60 270 60 276 92 Z" fill="#f43f5e" stroke="#ffe4e6" strokeWidth="4" />
          <path d="M256 352 L256 428" stroke="#f43f5e" strokeWidth="12" strokeLinecap="round" />
        </g>
      </symbol>
    </svg>
  );
}

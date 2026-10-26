import { degreesToCardinal } from '../utils/aerodynamics';

const CARDINAL_LABELS = [
  { label: 'N', x: 100, y: 31, color: '#ff4d4d', weight: '700' },
  { label: 'E', x: 169, y: 100, color: '#e3edf7', weight: '600' },
  { label: 'S', x: 100, y: 169, color: '#e3edf7', weight: '600' },
  { label: 'W', x: 31, y: 100, color: '#e3edf7', weight: '600' },
];

export default function CompassDialSvg({
  fromDeg,
  blowsToDeg,
  activeRunwayDeg,
  accentHex,
  liveEnabled,
  deviceHeading,
  unwrappedHeading,
}) {
  const dialDeg = liveEnabled ? -unwrappedHeading : 0;
  const uprightDeg = liveEnabled && deviceHeading !== null ? deviceHeading : 0;

  return (
    <svg viewBox="0 0 200 200" className="h-48 w-48 sm:h-52 sm:w-52 block" role="img">
      <title>
        {`Wind coming from ${fromDeg} degrees (${degreesToCardinal(fromDeg)}) and blowing toward ${blowsToDeg} degrees. Active runway heading ${activeRunwayDeg} degrees.${
          liveEnabled && deviceHeading !== null ? ` Phone heading ${deviceHeading} degrees.` : ''
        }`}
      </title>

      <defs>
        {/* Machined Red Warbird Instrument Bezel Gradient */}
        <linearGradient id="redBezelGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#ff5a5a" />
          <stop offset="25%" stopColor="#d13535" />
          <stop offset="65%" stopColor="#961b1b" />
          <stop offset="100%" stopColor="#540a0a" />
        </linearGradient>
        <radialGradient id="compassFaceGrad" cx="50%" cy="50%" r="50%">
          <stop offset="65%" stopColor="#171b21" />
          <stop offset="100%" stopColor="#0d1014" />
        </radialGradient>
      </defs>

      {/* Outer Red Bezel Assembly */}
      <circle cx="100" cy="100" r="97.5" fill="none" stroke="#480c0c" strokeWidth="1" />
      <circle cx="100" cy="100" r="94.5" fill="none" stroke="url(#redBezelGrad)" strokeWidth="5" />
      <circle cx="100" cy="100" r="91.5" fill="none" stroke="#220404" strokeWidth="1.2" />

      {/* Compass Instrument Face */}
      <circle
        cx="100"
        cy="100"
        r="90"
        fill="url(#compassFaceGrad)"
        stroke={liveEnabled ? '#38bdf8' : '#3c4654'}
        strokeWidth="1.5"
      />
      <circle cx="100" cy="100" r="68" fill="none" stroke="#28323f" strokeWidth="1" strokeDasharray="4 4" />

      {/* Rotating HSI Compass Card (North-Up when 0deg, Heading-Up when liveEnabled) */}
      <g
        className="compass-dial-rotate"
        style={{ '--dial-deg': `${dialDeg}deg`, transformOrigin: '100px 100px' }}
      >
        {Array.from({ length: 36 }, (_, i) => {
          const deg = i * 10;
          const major = deg % 90 === 0;
          const med = deg % 30 === 0;
          return (
            <line
              key={deg}
              x1="100"
              y1="10"
              x2="100"
              y2={major ? '21' : med ? '17' : '14'}
              stroke={major ? '#e3edf7' : med ? '#7b8c9f' : '#3d4b5c'}
              strokeWidth={major ? '2.2' : '1.2'}
              transform={`rotate(${deg} 100 100)`}
            />
          );
        })}

        {CARDINAL_LABELS.map((c) => (
          <text
            key={c.label}
            x={c.x}
            y={c.y}
            textAnchor="middle"
            dominantBaseline="central"
            fill={c.color}
            fontSize="12.5"
            fontWeight={c.weight}
            fontFamily="Share Tech Mono, monospace"
            transform={`rotate(${uprightDeg} ${c.x} ${c.y})`}
          >
            {c.label}
          </text>
        ))}

        {/* Field Runway Strip */}
        <g transform={`rotate(${activeRunwayDeg} 100 100)`}>
          <rect x="91" y="42" width="18" height="116" rx="3" fill="#18243d" stroke="#5a6778" strokeWidth="1.5" />
          <line x1="100" y1="50" x2="100" y2="150" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="6 5" />
          <polygon points="100,45 95,55 105,55" fill="#38bdf8" />
        </g>

        {/* Meteorological Wind Vector: Rim dot = FROM, Arrowhead = Downwind TO */}
        <g className="wind-vector-rotate" style={{ '--wind-deg': `${fromDeg}deg`, transformOrigin: '100px 100px' }}>
          <circle cx="100" cy="14" r="6" fill={accentHex} stroke="#070b12" strokeWidth="2" />
          <line x1="100" y1="22" x2="100" y2="148" stroke={accentHex} strokeWidth="3" strokeLinecap="round" />
          <polygon points="100,160 92,144 108,144" fill={accentHex} />
        </g>
      </g>

      {/* Fixed 12-o'clock Lubber Line showing phone aim axis when Live Compass is active */}
      {liveEnabled && (
        <g>
          <polygon points="100,13 94,3 106,3" fill="#38bdf8" />
          <line x1="100" y1="13" x2="100" y2="25" stroke="#38bdf8" strokeWidth="2" />
        </g>
      )}

      {/* Central Instrument Hub */}
      <circle cx="100" cy="100" r="5" fill="#d13535" stroke="#070b12" strokeWidth="1.5" />
      <circle cx="100" cy="100" r="2" fill="#ffffff" />
    </svg>
  );
}

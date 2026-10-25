import { degreesToCardinal } from '../utils/aerodynamics';

const CARDINAL_LABELS = [
  { label: 'N', x: 100, y: 31, color: '#fb7185', weight: '700' },
  { label: 'E', x: 169, y: 100, color: '#cbd5e1', weight: '600' },
  { label: 'S', x: 100, y: 169, color: '#cbd5e1', weight: '600' },
  { label: 'W', x: 31, y: 100, color: '#cbd5e1', weight: '600' },
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

      <circle cx="100" cy="100" r="90" fill="#080e1a" stroke={liveEnabled ? '#38bdf8' : '#1e2d47'} strokeWidth="2" />
      <circle cx="100" cy="100" r="68" fill="none" stroke="#1e2d47" strokeWidth="1" strokeDasharray="4 4" />

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
              stroke={major ? '#cbd5e1' : med ? '#64748b' : '#334155'}
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
            fontFamily="monospace"
            transform={`rotate(${uprightDeg} ${c.x} ${c.y})`}
          >
            {c.label}
          </text>
        ))}

        {/* Field Runway Strip */}
        <g transform={`rotate(${activeRunwayDeg} 100 100)`}>
          <rect x="91" y="42" width="18" height="116" rx="3" fill="#18243d" stroke="#475569" strokeWidth="1.5" />
          <line x1="100" y1="50" x2="100" y2="150" stroke="#94a3b8" strokeWidth="1.5" strokeDasharray="6 5" />
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

      <circle cx="100" cy="100" r="4" fill="#f8fafc" stroke="#070b12" strokeWidth="1.5" />
    </svg>
  );
}

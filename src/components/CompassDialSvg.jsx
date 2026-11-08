import { useRef } from 'react';
import { degreesToCardinal, normalizeDegrees } from '../utils/aerodynamics';

const CARDINAL_LABELS = [
  { label: 'N', x: 100, y: 31, color: '#ff4d4d', weight: '700' },
  { label: 'E', x: 169, y: 100, color: '#e3edf7', weight: '600' },
  { label: 'S', x: 100, y: 169, color: '#e3edf7', weight: '600' },
  { label: 'W', x: 31, y: 100, color: '#e3edf7', weight: '600' },
];

export default function CompassDialSvg({
  fromDeg,
  _blowsToDeg,
  activeRunwayDeg,
  _accentHex,
  liveEnabled,
  deviceHeading,
  unwrappedHeading,
  stationWindDirection,
  isManualWind,
  onDialClick,
}) {
  const svgRef = useRef(null);
  const isDraggingRef = useRef(false);
  const dialDeg = liveEnabled ? -unwrappedHeading : 0;
  const uprightDeg = liveEnabled && deviceHeading !== null ? deviceHeading : 0;

  const updateAngleFromPointer = (e) => {
    if (!onDialClick) return;
    const svg = svgRef.current;
    if (!svg) return;
    const rect = svg.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;

    const clientX = e.clientX ?? e.touches?.[0]?.clientX;
    const clientY = e.clientY ?? e.touches?.[0]?.clientY;
    if (clientX === undefined || clientX === null || clientY === undefined || clientY === null) return;

    const dx = clientX - cx;
    const dy = clientY - cy;
    const dist = Math.hypot(dx, dy);
    // Ignore clicks too close to center hub (r < 16) to avoid accidental triggers
    if (dist < 16) return;

    // Calculate angle in degrees clockwise from North (12 o'clock)
    let rad = Math.atan2(dx, -dy);
    let deg = (rad * 180) / Math.PI;
    if (deg < 0) deg += 360;

    // Compensate for dial rotation if live compass is active
    if (liveEnabled && typeof unwrappedHeading === 'number') {
      deg = (deg + unwrappedHeading) % 360;
    }

    const snapped = normalizeDegrees(Math.round(deg / 5) * 5);
    onDialClick(snapped);
  };

  const handlePointerDown = (e) => {
    if (!onDialClick) return;
    isDraggingRef.current = true;
    try {
      e.currentTarget.setPointerCapture?.(e.pointerId);
    } catch {
      // Ignore if pointer capture is unsupported
    }
    updateAngleFromPointer(e);
  };

  const handlePointerMove = (e) => {
    if (!isDraggingRef.current) return;
    updateAngleFromPointer(e);
  };

  const handlePointerUp = (e) => {
    if (!isDraggingRef.current) return;
    isDraggingRef.current = false;
    try {
      e.currentTarget.releasePointerCapture?.(e.pointerId);
    } catch {
      // Ignore
    }
  };

  return (
    <svg
      ref={svgRef}
      viewBox="0 0 200 200"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      className={`h-44 w-44 sm:h-52 sm:w-52 block select-none touch-none ${onDialClick ? 'cursor-pointer' : ''}`}
      role="img"
    >
      <title>
        {`Wind coming from ${fromDeg} degrees (${degreesToCardinal(fromDeg)}). Red arrow points against/into the wind. Active runway heading ${activeRunwayDeg} degrees.${
          isManualWind ? ' Manually calibrated for local field.' : ' Sourced from live weather station.'
        }${
          liveEnabled && deviceHeading !== null ? ` Phone heading ${deviceHeading} degrees.` : ''
        } Tap anywhere around dial to align wind direction.`}
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

        {/* Ghost Weather Station Vector when manual calibration is active */}
        {isManualWind && stationWindDirection !== undefined && stationWindDirection !== null && (
          <g
            className="station-ghost-rotate"
            transform={`rotate(${normalizeDegrees(stationWindDirection)} 100 100)`}
            opacity="0.45"
          >
            <line x1="100" y1="34" x2="100" y2="134" stroke="#38bdf8" strokeWidth="2" strokeDasharray="4 3" strokeLinecap="round" />
            <polygon points="100,20 94,34 106,34" fill="#38bdf8" />
            <circle cx="100" cy="134" r="2.5" fill="#38bdf8" />
          </g>
        )}

        {/* Aeronautical Wind Vector: Bold Red Arrow pointing directly AGAINST / INTO the wind (FROM heading) */}
        <g className="wind-vector-rotate" style={{ '--wind-deg': `${fromDeg}deg`, transformOrigin: '100px 100px' }}>
          {/* Arrow Tail & Shaft */}
          <line x1="100" y1="32" x2="100" y2="136" stroke="#ef4444" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="100" y1="34" x2="100" y2="134" stroke="#fca5a5" strokeWidth="1.2" strokeLinecap="round" opacity="0.8" />
          {/* Tail fletching / counterweight */}
          <line x1="93" y1="130" x2="107" y2="130" stroke="#ef4444" strokeWidth="2.5" strokeLinecap="round" />
          <line x1="95" y1="136" x2="105" y2="136" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" />
          {/* Prominent Red Arrowhead pointing against/into the wind */}
          <polygon
            points="100,16 88,38 97,33 100,34 103,33 112,38"
            fill="#ef4444"
            stroke="#7f1d1d"
            strokeWidth="1.2"
            strokeLinejoin="round"
          />
          {/* Inner needle highlight */}
          <polygon
            points="100,20 92,36 99,32 100,33"
            fill="#fca5a5"
            opacity="0.75"
          />
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

import { DEFAULT_THRESHOLDS } from '../config/flightConfig';

const CARDINALS_16 = [
  'N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE',
  'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW',
];

export function normalizeDegrees(deg) {
  const num = Number(deg);
  if (!Number.isFinite(num)) return 0;
  return ((Math.round(num) % 360) + 360) % 360;
}

export function degreesToCardinal(deg) {
  const num = Number(deg);
  if (deg === null || deg === undefined || !Number.isFinite(num)) return 'VRB';
  const norm = ((num % 360) + 360) % 360;
  return CARDINALS_16[Math.round(norm / 22.5) % 16];
}

// Computes active runway end (into the wind) + headwind & crosswind components in mph
export function computeRunwayComponents(windMph, gustMph, windFromDeg, stripHeadingDeg) {
  const speed = Math.max(0, Number(windMph) || 0);
  const gusts = Math.max(speed, Number(gustMph) || speed);
  const windDeg = normalizeDegrees(windFromDeg);
  const hdgA = normalizeDegrees(stripHeadingDeg);
  const hdgB = (hdgA + 180) % 360;

  // Choose whichever end of the strip faces closer into the wind
  const diffA = ((windDeg - hdgA + 540) % 360) - 180;
  const diffB = ((windDeg - hdgB + 540) % 360) - 180;
  const useA = Math.abs(diffA) <= Math.abs(diffB);
  const activeHdg = useA ? hdgA : hdgB;
  const angleDeg = useA ? diffA : diffB;
  const rad = (angleDeg * Math.PI) / 180;

  const headwindMph = Math.round(speed * Math.cos(rad) * 10) / 10;
  const crosswindSigned = speed * Math.sin(rad);
  const crosswindMph = Math.round(Math.abs(crosswindSigned) * 10) / 10;
  const gustCrosswindMph = Math.round(Math.abs(gusts * Math.sin(rad)) * 10) / 10;
  const crosswindSide = crosswindMph < 0.4 ? 'NONE' : crosswindSigned > 0 ? 'RIGHT' : 'LEFT';
  const rwyNumber = String(Math.round(activeHdg / 10) || 36).padStart(2, '0');

  return {
    activeHeadingDeg: activeHdg,
    rwyLabel: `RWY ${rwyNumber}`,
    angleOffNoseDeg: Math.round(Math.abs(angleDeg)),
    headwindMph,
    crosswindMph,
    gustCrosswindMph,
    crosswindSide,
  };
}

export function evaluateFlightStatus(obs, userThresholds = DEFAULT_THRESHOLDS, crosswindMph = null) {
  const t = { ...DEFAULT_THRESHOLDS, ...userThresholds };
  const speed = Number(obs?.windSpeed) || 0;
  const gusts = Math.max(speed, Number(obs?.windGusts) || speed);
  const spread = Math.max(0, Math.round((gusts - speed) * 10) / 10);
  const precipIn = Number(obs?.precipIn) || 0;
  const precipProb = Number(obs?.precipProb) || 0;
  const visMi = Number.isFinite(Number(obs?.visibilityMi)) ? Number(obs.visibilityMi) : 10;
  const tempF = Number.isFinite(Number(obs?.temperature)) ? Number(obs.temperature) : 70;
  const wmo = Number(obs?.weatherCode) || 0;

  const stopReasons = [];
  const cautionReasons = [];

  if (wmo >= 95) stopReasons.push('Thunderstorm activity in sector');
  if (precipIn >= t.maxPrecipIn || (wmo >= 51 && wmo <= 86)) {
    stopReasons.push('Active precipitation — moisture risk to electronics');
  } else if (precipProb >= t.maxPrecipProbPct) {
    cautionReasons.push(`${precipProb}% rain probability`);
  }

  if (visMi < 1.5) stopReasons.push(`Low visibility (${visMi.toFixed(1)} mi)`);
  else if (visMi < t.minVisibilityMi) cautionReasons.push(`Reduced visibility (${visMi.toFixed(1)} mi)`);

  if (speed > t.maxSustainedWindMph) {
    stopReasons.push(`Sustained wind (${speed} mph) exceeds ${t.maxSustainedWindMph} mph limit`);
  } else if (speed > t.cautionWindMph) {
    cautionReasons.push(`Sustained wind ${speed} mph (above ${t.cautionWindMph} mph calm threshold)`);
  }

  if (gusts > t.maxGustMph) {
    stopReasons.push(`Peak gusts (${gusts} mph) exceed ${t.maxGustMph} mph limit`);
  } else if (gusts > t.cautionGustMph) {
    cautionReasons.push(`Gusts to ${gusts} mph`);
  }

  if (spread > t.maxGustSpreadMph + 4) {
    stopReasons.push(`Severe gust shear (Δ +${spread} mph)`);
  } else if (spread > t.maxGustSpreadMph) {
    cautionReasons.push(`Gust spread Δ +${spread} mph`);
  }

  if (crosswindMph !== null && crosswindMph > t.maxCrosswindMph) {
    cautionReasons.push(`Runway crosswind ${crosswindMph} mph (> ${t.maxCrosswindMph} mph)`);
  }

  if (tempF < 30 || tempF > 103) {
    stopReasons.push(`Extreme ambient temp (${tempF}°F)`);
  } else if (tempF < t.minTempF) {
    cautionReasons.push(`Cold pack alert (${tempF}°F — pre-warm LiPos)`);
  } else if (tempF > t.maxTempF) {
    cautionReasons.push(`High heat (${tempF}°F — monitor ESC/LiPo temps)`);
  }

  if (stopReasons.length > 0) {
    return { level: 'stop', verdict: 'STAY HOME', shortTag: 'NO-GO', gustSpread: spread, reasons: stopReasons };
  }
  if (cautionReasons.length > 0) {
    return { level: 'marginal', verdict: 'MARGINAL', shortTag: 'CAUTION', gustSpread: spread, reasons: cautionReasons };
  }
  return {
    level: 'good',
    verdict: 'GOOD TO FLY',
    shortTag: 'GO',
    gustSpread: spread,
    reasons: ['Wind, gusts, visibility, and temperature all within flight envelope'],
  };
}

export function findBestFlyingWindow(hourly = [], thresholds = DEFAULT_THRESHOLDS) {
  if (hourly.length < 2) return null;
  let best = null;

  for (let i = 0; i <= hourly.length - 2; i++) {
    const slice = hourly.slice(i, Math.min(hourly.length, i + 3));
    const daytimeBonus = slice.every((h) => h.hour24 >= 7 && h.hour24 <= 19) ? 0 : 12;
    const anyStop = slice.some((h) => evaluateFlightStatus(h, thresholds).level === 'stop');
    const avgWind = slice.reduce((s, h) => s + h.windSpeed, 0) / slice.length;
    const maxGust = Math.max(...slice.map((h) => h.windGusts));
    const score = avgWind + maxGust * 0.35 + daytimeBonus + (anyStop ? 50 : 0);

    if (!best || score < best.score) {
      best = {
        score,
        startIdx: i,
        endIdx: i + slice.length - 1,
        startLabel: slice[0].timeLabel,
        endLabel: slice[slice.length - 1].timeLabel,
        avgWindMph: Math.round(avgWind * 10) / 10,
        maxGustMph: Math.round(maxGust * 10) / 10,
      };
    }
  }
  return best;
}

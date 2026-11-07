import { DEFAULT_THRESHOLDS } from '../config/flightConfig.js';

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

export const PILOT_FACTORS = {
  beginner: 0.70,
  intermediate: 1.0,
  advanced: 1.30,
  extreme: 1.65,
};

// Computes standard ISA Density Altitude in feet from ambient temp (°F) and field elevation (ft)
export function computeDensityAltitudeFt(tempF = 70, elevationFt = 0) {
  const elev = Number.isFinite(Number(elevationFt)) ? Number(elevationFt) : 0;
  const tF = Number.isFinite(Number(tempF)) ? Number(tempF) : 70;
  const tempC = ((tF - 32) * 5) / 9;
  const isaTempC = 15 - (elev / 1000) * 1.98;
  return Math.round(elev + 118.8 * (tempC - isaTempC));
}

export function evaluateFlightStatus(obs, userThresholds = DEFAULT_THRESHOLDS, crosswindMph = null) {
  const t = { ...DEFAULT_THRESHOLDS, ...userThresholds };
  const isKid = (t.contentProfile || 'adult') === 'kid';
  const pilot = t.pilotProfile || 'intermediate';
  const calcBasis = t.calcBasis || 'gust';

  const speed = Number(obs?.windSpeed) || 0;
  const gusts = Math.max(speed, Number(obs?.windGusts) || speed);
  const spread = Math.max(0, Math.round((gusts - speed) * 10) / 10);
  const precipIn = Number(obs?.precipIn) || 0;
  const precipProb = Number(obs?.precipProb) || 0;
  const visMi = Number.isFinite(Number(obs?.visibilityMi)) ? Number(obs.visibilityMi) : 10;
  const tempF = Number.isFinite(Number(obs?.temperature)) ? Number(obs.temperature) : 70;
  const wmo = Number(obs?.weatherCode) || 0;

  const pFactor = PILOT_FACTORS[pilot] ?? 1.0;

  const effMaxSustained = Math.round(t.maxSustainedWindMph * pFactor);
  const effCautionWind = Math.round(t.cautionWindMph * pFactor);
  const effMaxGust = Math.round(t.maxGustMph * (calcBasis === 'sustained' ? pFactor * 1.15 : pFactor));
  const effCautionGust = Math.round(t.cautionGustMph * pFactor);
  const effMaxCrosswind = Math.round(t.maxCrosswindMph * pFactor * 10) / 10;

  // Calculation basis: sustained wind vs peak gusts
  const primaryWind = calcBasis === 'sustained' ? speed : Math.max(speed, Math.round(gusts * 0.9));

  // Pilot-scaled speed tiers for the verdicts:
  const pilotTierLimits = {
    beginner: { tier1: 10, tier2: 13, tier3: 16 },
    intermediate: { tier1: 20, tier2: 25, tier3: 30 },
    advanced: { tier1: 25, tier2: 30, tier3: 35 },
    extreme: { tier1: 30, tier2: 35, tier3: 40 },
  };
  const tiers = pilotTierLimits[pilot] || pilotTierLimits.intermediate;

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

  if (primaryWind >= tiers.tier3) {
    stopReasons.unshift(
      isKid
        ? `${tiers.tier3}+ MPH gale (${primaryWind} mph) — Stay in the hangar! Severe wind hazard.`
        : `${tiers.tier3}+ MPH gale (${primaryWind} mph) — JUST STAY HOME AND SPANK!`
    );
  } else if (primaryWind >= tiers.tier2) {
    stopReasons.unshift(
      isKid
        ? `${tiers.tier2}+ MPH winds (${primaryWind} mph) — Hazardous winds! High risk of damage.`
        : `${tiers.tier2}+ MPH winds (${primaryWind} mph) — BRING YOUR CREDIT CARD`
    );
  } else if (primaryWind >= tiers.tier1) {
    stopReasons.unshift(
      isKid
        ? `${tiers.tier1}+ MPH winds (${primaryWind} mph) — Strong winds! Rough landings likely.`
        : `${tiers.tier1}+ MPH winds (${primaryWind} mph) — CA Glue Required`
    );
  } else if (speed > effMaxSustained) {
    stopReasons.push(`Sustained wind (${speed} mph) exceeds ${effMaxSustained} mph limit (${pilot.toUpperCase()} PILOT)`);
  } else if (speed > effCautionWind) {
    cautionReasons.push(`Sustained wind ${speed} mph (above ${effCautionWind} mph calm ceiling for ${pilot.toUpperCase()})`);
  }

  if (calcBasis === 'sustained') {
    if (spread > 12) {
      stopReasons.push(`Dangerous gust shear (Δ +${spread} mph — sudden stalls likely)`);
    } else if (gusts > effMaxGust) {
      cautionReasons.push(`Peak gusts to ${gusts} mph (Sustained mode active — fly with caution)`);
    } else if (gusts > effCautionGust) {
      cautionReasons.push(`Gusts to ${gusts} mph`);
    }
  } else {
    if (gusts > effMaxGust) {
      stopReasons.push(`Peak gusts (${gusts} mph) exceed ${effMaxGust} mph limit (${pilot.toUpperCase()})`);
    } else if (gusts > effCautionGust) {
      cautionReasons.push(`Gusts to ${gusts} mph`);
    }

    if (spread > t.maxGustSpreadMph + 4) {
      stopReasons.push(`Severe gust shear (Δ +${spread} mph)`);
    } else if (spread > t.maxGustSpreadMph) {
      cautionReasons.push(`Gust spread Δ +${spread} mph`);
    }
  }

  if (crosswindMph !== null) {
    const hardCrosswindMax = Math.round(effMaxCrosswind * 1.35 * 10) / 10;
    if (crosswindMph > hardCrosswindMax) {
      stopReasons.push(`Severe runway crosswind ${crosswindMph} mph (> ${hardCrosswindMax} mph max for ${pilot.toUpperCase()})`);
    } else if (crosswindMph > effMaxCrosswind) {
      cautionReasons.push(`Runway crosswind ${crosswindMph} mph (> ${effMaxCrosswind} mph limit for ${pilot})`);
    }
  }

  if (tempF < 30 || tempF > 103) {
    stopReasons.push(`Extreme ambient temp (${tempF}°F)`);
  } else if (tempF < t.minTempF) {
    cautionReasons.push(`Cold pack alert (${tempF}°F — pre-warm LiPos)`);
  } else if (tempF > t.maxTempF) {
    cautionReasons.push(`High heat (${tempF}°F — monitor ESC/LiPo temps)`);
  }

  if (stopReasons.length > 0) {
    if (primaryWind >= tiers.tier3) {
      return {
        level: 'stop',
        verdict: isKid ? 'STAY IN THE HANGAR!' : 'JUST STAY HOME AND SPANK!',
        shortTag: isKid ? 'HANGAR BOUND' : `${tiers.tier3}+ SPANK`,
        gustSpread: spread,
        reasons: stopReasons,
        pilot,
        calcBasis,
      };
    }
    if (primaryWind >= tiers.tier2) {
      return {
        level: 'stop',
        verdict: isKid ? 'HAZARDOUS WINDS!' : 'BRING YOUR CREDIT CARD',
        shortTag: isKid ? 'HIGH RISK' : 'CREDIT CARD',
        gustSpread: spread,
        reasons: stopReasons,
        pilot,
        calcBasis,
      };
    }
    if (primaryWind >= tiers.tier1) {
      return {
        level: 'stop',
        verdict: isKid ? 'TOO WINDY TO FLY!' : 'CA GLUE REQUIRED',
        shortTag: isKid ? 'TOO WINDY' : 'CA GLUE',
        gustSpread: spread,
        reasons: stopReasons,
        pilot,
        calcBasis,
      };
    }
    return {
      level: 'stop',
      verdict: isKid ? 'GROUNDED / NO-GO' : 'HANGAR QUEEN DAY!',
      shortTag: 'NO-GO',
      gustSpread: spread,
      reasons: stopReasons,
      pilot,
      calcBasis,
    };
  }
  if (cautionReasons.length > 0) {
    return {
      level: 'marginal',
      verdict: isKid ? 'FLY WITH CAUTION' : 'YOU SURE?',
      shortTag: 'CAUTION',
      gustSpread: spread,
      reasons: cautionReasons,
      pilot,
      calcBasis,
    };
  }
  return {
    level: 'good',
    verdict: isKid ? 'ALL CLEAR TO FLY' : 'GOOD TO FLY',
    shortTag: 'GO',
    gustSpread: spread,
    reasons: [
      calcBasis === 'sustained'
        ? `Sustained wind (${speed} mph), visibility and temp all within ${pilot.toUpperCase()} pilot envelope`
        : `Wind, gusts, visibility, and temp all within ${pilot.toUpperCase()} pilot envelope`,
    ],
    pilot,
    calcBasis,
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

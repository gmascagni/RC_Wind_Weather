import { createLocationRecord } from '../config/flightConfig';

const GEOCODE_URL = 'https://geocoding-api.open-meteo.com/v1/search';
const REVERSE_URL = 'https://api.bigdatacloud.net/data/reverse-geocode-client';

export async function searchCities(query, signal) {
  const trimmed = String(query || '').trim();
  if (trimmed.length < 2) return [];

  const params = new URLSearchParams({
    name: trimmed,
    count: '7',
    language: 'en',
    format: 'json',
  });

  const res = await fetch(`${GEOCODE_URL}?${params.toString()}`, { signal });
  if (!res.ok) {
    throw new Error(`City search unavailable (${res.status})`);
  }

  const data = await res.json();
  const results = Array.isArray(data?.results) ? data.results : [];

  return results.map((item) => {
    const elevFt = Number.isFinite(Number(item.elevation))
      ? Math.round(Number(item.elevation) * 3.28084)
      : null;
    const region = item.admin1 || item.admin2 || '';
    const countryCode = item.country_code || '';
    const displayParts = [item.name, region, countryCode && countryCode !== 'US' ? countryCode : ''].filter(Boolean);

    return createLocationRecord({
      name: displayParts.join(', '),
      shortName: item.name,
      region,
      countryCode,
      lat: item.latitude,
      lon: item.longitude,
      elevationFt: elevFt,
      timezone: item.timezone || 'auto',
      isGps: false,
    });
  });
}

export function getBrowserCoordinates() {
  return new Promise((resolve, reject) => {
    if (typeof navigator === 'undefined' || !navigator.geolocation) {
      reject(new Error('GPS Geolocation is not supported on this device.'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (pos) => resolve(pos.coords),
      (err) => {
        if (err.code === 1) {
          reject(new Error('Location permission denied — allow location access in browser settings.'));
        } else if (err.code === 3) {
          reject(new Error('GPS lock timed out — step into open sky or search by city.'));
        } else {
          reject(new Error('Unable to acquire GPS fix — try searching by city or ZIP.'));
        }
      },
      { enableHighAccuracy: true, timeout: 12000, maximumAge: 60000 }
    );
  });
}

export async function locateUserViaGps() {
  const coords = await getBrowserCoordinates();
  const lat = coords.latitude;
  const lon = coords.longitude;
  const altFt = Number.isFinite(coords.altitude) ? Math.round(coords.altitude * 3.28084) : null;

  let city = '';
  let region = '';
  let countryCode = '';

  try {
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), 4500);
    const params = new URLSearchParams({
      latitude: String(lat),
      longitude: String(lon),
      localityLanguage: 'en',
    });
    const res = await fetch(`${REVERSE_URL}?${params.toString()}`, { signal: controller.signal });
    clearTimeout(timer);

    if (res.ok) {
      const geo = await res.json();
      city = geo.city || geo.locality || geo.principalSubdivision || '';
      const isoSub = String(geo.principalSubdivisionCode || '');
      region = isoSub.includes('-') ? isoSub.split('-')[1] : geo.principalSubdivision || '';
      countryCode = geo.countryCode || '';
    }
  } catch {
    // Graceful fallback to raw GPS coordinates if offline or reverse lookup times out
  }

  const shortName = city || 'GPS Field';
  const fullParts = [city, region, countryCode && countryCode !== 'US' ? countryCode : ''].filter(Boolean);
  const name = fullParts.length > 0 ? fullParts.join(', ') : `GPS Location (${lat.toFixed(3)}°, ${lon.toFixed(3)}°)`;

  return createLocationRecord({
    name,
    shortName,
    region,
    countryCode,
    lat,
    lon,
    elevationFt: altFt,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || 'auto',
    isGps: true,
  });
}

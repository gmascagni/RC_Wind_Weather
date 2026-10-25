import { useState, useEffect, useRef, useCallback } from 'react';

function getScreenAngle() {
  if (typeof window === 'undefined') return 0;
  const angle = window.screen?.orientation?.angle;
  return typeof angle === 'number' && Number.isFinite(angle) ? angle : 0;
}

// Tilt-compensated compass heading (0-360 clockwise from North) for Android/W3C Euler angles
function computeAndroidHeading(alpha, beta, gamma) {
  if (alpha === null || alpha === undefined || !Number.isFinite(alpha)) return null;
  const rad = Math.PI / 180;
  const a = alpha * rad;
  const b = (Number.isFinite(beta) ? beta : 0) * rad;
  const g = (Number.isFinite(gamma) ? gamma : 0) * rad;

  let east;
  let north;

  // Below 65 deg pitch, project top bezel (+y); when held steep like a camera, project rear (-z)
  if (Math.abs(beta || 0) <= 65) {
    east = -Math.sin(a) * Math.cos(b);
    north = Math.cos(a) * Math.cos(b);
  } else {
    east = -Math.cos(a) * Math.sin(g) - Math.sin(a) * Math.sin(b) * Math.cos(g);
    north = -Math.sin(a) * Math.sin(g) + Math.cos(a) * Math.sin(b) * Math.cos(g);
  }

  if (Math.hypot(east, north) < 1e-4) {
    return ((360 - alpha + getScreenAngle()) % 360 + 360) % 360;
  }

  const rawDeg = (Math.atan2(east, north) * 180) / Math.PI;
  return ((rawDeg + getScreenAngle()) % 360 + 360) % 360;
}

export function useDeviceCompass() {
  const [enabled, setEnabled] = useState(false);
  const [heading, setHeading] = useState(null);
  const [unwrappedHeading, setUnwrappedHeading] = useState(0);
  const [isAbsolute, setIsAbsolute] = useState(true);
  const [needsCalibration, setNeedsCalibration] = useState(false);
  const [error, setError] = useState(null);

  const smoothedRef = useRef(null);
  const unwrappedRef = useRef(0);
  const lastEmitMsRef = useRef(0);
  const receivedSampleRef = useRef(false);
  const hasAbsoluteStreamRef = useRef(false);

  useEffect(() => {
    if (!enabled || typeof window === 'undefined') return undefined;

    receivedSampleRef.current = false;
    hasAbsoluteStreamRef.current = false;
    const hasAbsoluteEvent = 'ondeviceorientationabsolute' in window;
    const mountedAt = performance.now();

    const handleOrientation = (event, fromAbsoluteListener) => {
      let rawHeading = null;
      let absolute = Boolean(fromAbsoluteListener || event.absolute);

      // 1. iOS Safari / Home-Screen WebKit PWA
      if (typeof event.webkitCompassHeading === 'number' && Number.isFinite(event.webkitCompassHeading)) {
        if (event.webkitCompassHeading < 0) return;
        rawHeading = event.webkitCompassHeading;
        absolute = true;
        hasAbsoluteStreamRef.current = true;
        const acc = event.webkitCompassAccuracy;
        setNeedsCalibration(typeof acc === 'number' && (acc < 0 || acc > 25));
      } else if (event.alpha !== null && Number.isFinite(event.alpha)) {
        // 2. Prefer Android deviceorientationabsolute; fall back to gyro if unavailable after 350ms
        if (absolute) {
          hasAbsoluteStreamRef.current = true;
        } else if (hasAbsoluteStreamRef.current || (hasAbsoluteEvent && performance.now() - mountedAt < 350)) {
          return;
        }
        rawHeading = computeAndroidHeading(event.alpha, event.beta, event.gamma);
      }

      if (rawHeading === null) return;
      receivedSampleRef.current = true;

      // Circular shortest-arc exponential smoothing to eliminate magnetometer jitter
      if (smoothedRef.current === null) {
        smoothedRef.current = rawHeading;
        unwrappedRef.current = rawHeading;
      } else {
        const delta = ((rawHeading - smoothedRef.current + 540) % 360) - 180;
        const step = delta * 0.24;
        smoothedRef.current = ((smoothedRef.current + step) % 360 + 360) % 360;
        unwrappedRef.current += step;
      }

      const now = performance.now();
      if (now - lastEmitMsRef.current >= 50) {
        lastEmitMsRef.current = now;
        setIsAbsolute(absolute);
        setHeading(Math.round(smoothedRef.current));
        setUnwrappedHeading(Math.round(unwrappedRef.current * 10) / 10);
      }
    };

    const onAbs = (e) => handleOrientation(e, true);
    const onStd = (e) => handleOrientation(e, false);

    const attach = () => {
      if (hasAbsoluteEvent) window.addEventListener('deviceorientationabsolute', onAbs, true);
      window.addEventListener('deviceorientation', onStd, true);
    };

    const detach = () => {
      if (hasAbsoluteEvent) window.removeEventListener('deviceorientationabsolute', onAbs, true);
      window.removeEventListener('deviceorientation', onStd, true);
    };

    attach();

    // Detect desktops/laptops without hardware orientation sensors
    const sensorTimeout = window.setTimeout(() => {
      if (!receivedSampleRef.current) {
        setEnabled(false);
        setHeading(null);
        setError('No compass sensor detected — open on an iOS or Android phone at the field.');
      }
    }, 2000);

    const onVisibility = () => {
      if (document.visibilityState === 'hidden') detach();
      else attach();
    };
    document.addEventListener('visibilitychange', onVisibility);

    return () => {
      window.clearTimeout(sensorTimeout);
      document.removeEventListener('visibilitychange', onVisibility);
      detach();
    };
  }, [enabled]);

  // Must run synchronously inside button click handler so iOS Safari preserves user gesture
  const toggleCompass = useCallback(async () => {
    setError(null);
    if (enabled) {
      setEnabled(false);
      setHeading(null);
      smoothedRef.current = null;
      return;
    }

    if (typeof window === 'undefined' || typeof window.DeviceOrientationEvent === 'undefined') {
      setError('Compass sensors are not supported in this browser.');
      return;
    }

    if (!window.isSecureContext) {
      setError('Live compass requires HTTPS (or localhost).');
      return;
    }

    if (typeof window.DeviceOrientationEvent.requestPermission === 'function') {
      try {
        const perm = await window.DeviceOrientationEvent.requestPermission();
        if (perm !== 'granted') {
          setError('Compass permission denied — allow Motion & Orientation access in browser settings.');
          return;
        }
      } catch {
        setError('Unable to request iOS compass permission — tap Live Compass again.');
        return;
      }
    }

    smoothedRef.current = null;
    setEnabled(true);
  }, [enabled]);

  return {
    liveEnabled: enabled && heading !== null,
    isActivating: enabled && heading === null,
    deviceHeading: heading,
    unwrappedHeading,
    isAbsolute,
    needsCalibration,
    compassError: error,
    toggleCompass,
  };
}

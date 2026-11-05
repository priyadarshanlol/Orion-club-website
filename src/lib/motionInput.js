/*
 * One source of "look direction" for the whole site.
 * Desktop: the mouse position across the window.
 * Phones and tablets: the gyroscope. Tilting the phone moves the sky and the
 * emblem the same way the cursor does on desktop.
 * Both produce x and y in the range -1..1 (0 = centre).
 *
 * The gyroscope reading is measured relative to how the phone was held when
 * the page started listening, and that rest position drifts slowly towards the
 * current grip, so the effect stays centred however the visitor holds the phone.
 */

const listeners = new Set();
const state = { x: 0, y: 0, source: 'none' };

let started = false;
let gyroActive = false;
let base = null; // { beta, gamma } rest pose
let lastEventAt = 0;

const clamp = (v) => Math.max(-1, Math.min(1, v));
const emit = () => listeners.forEach((fn) => fn(state));

const isTouchDevice = () =>
  typeof window !== 'undefined' &&
  (window.matchMedia?.('(pointer: coarse)').matches || 'ontouchstart' in window);

export const tiltNeedsPermission = () =>
  typeof window !== 'undefined' &&
  typeof window.DeviceOrientationEvent !== 'undefined' &&
  typeof window.DeviceOrientationEvent.requestPermission === 'function';

const onMouse = (e) => {
  if (gyroActive || e.sourceCapabilities?.firesTouchEvents) return;
  state.x = clamp((e.clientX / window.innerWidth - 0.5) * 2);
  state.y = clamp((e.clientY / window.innerHeight - 0.5) * 2);
  state.source = 'mouse';
  emit();
};

// Screen orientation decides which device axis is "left-right" on screen
const screenAngle = () => {
  const a = window.screen?.orientation?.angle ?? window.orientation ?? 0;
  return ((a % 360) + 360) % 360;
};

const RANGE = 22; // degrees of tilt for a full -1..1 swing

const onOrientation = (e) => {
  if (e.beta == null || e.gamma == null) return;
  const now = performance.now();
  let { beta, gamma } = e;

  // Map device axes to screen axes for landscape
  const angle = screenAngle();
  let lr = gamma;
  let fb = beta;
  if (angle === 90) { lr = beta; fb = -gamma; }
  else if (angle === 270) { lr = -beta; fb = gamma; }
  else if (angle === 180) { lr = -gamma; fb = -beta; }

  if (!base || now - lastEventAt > 1500) base = { lr, fb };
  // Rest pose follows the grip slowly (about a 4 s time constant)
  const dt = Math.min(0.1, (now - lastEventAt) / 1000 || 0.016);
  const k = 1 - Math.exp(-dt / 4);
  base.lr += (lr - base.lr) * k;
  base.fb += (fb - base.fb) * k;
  lastEventAt = now;

  gyroActive = true;
  state.x = clamp((lr - base.lr) / RANGE);
  state.y = clamp((fb - base.fb) / RANGE);
  state.source = 'gyro';
  emit();
};

let orientationAttached = false;
const attachOrientation = () => {
  if (orientationAttached || typeof window === 'undefined') return;
  orientationAttached = true;
  window.addEventListener('deviceorientation', onOrientation, { passive: true });
};

/*
 * iOS only delivers gyroscope data after the visitor allows it, and the
 * request has to come from a tap. Call this from any click or touch handler.
 */
export async function requestTilt() {
  if (!tiltNeedsPermission()) {
    attachOrientation();
    return true;
  }
  try {
    const result = await window.DeviceOrientationEvent.requestPermission();
    if (result === 'granted') {
      attachOrientation();
      return true;
    }
  } catch {
    // denied or not from a gesture
  }
  return false;
}

function start() {
  if (started || typeof window === 'undefined') return;
  started = true;
  window.addEventListener('mousemove', onMouse, { passive: true });
  if (isTouchDevice()) {
    // Android delivers tilt data straight away. iOS only does after the
    // visitor allows it, so on iOS ask on the first tap if nothing has arrived.
    attachOrientation();
    if (tiltNeedsPermission()) {
      const once = () => {
        window.removeEventListener('touchend', once);
        window.removeEventListener('click', once);
        if (!gyroActive) requestTilt();
      };
      window.addEventListener('touchend', once, { passive: true });
      window.addEventListener('click', once);
    }
  }
}

export function subscribeMotion(fn) {
  start();
  listeners.add(fn);
  fn(state);
  return () => listeners.delete(fn);
}

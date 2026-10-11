/**
 * Soft UI "tick" for tap feedback, synthesised with the Web Audio API.
 *
 * No audio files and no libraries: a ~50ms triangle blip with a fast decay
 * reads as a tap rather than a beep. Sound is progressive enhancement, so every
 * path here is guarded — an unsupported or suspended AudioContext stays silent
 * instead of throwing, which matters on iOS Safari.
 *
 * Browsers block audio until the user gestures, so the AudioContext is created
 * lazily on the first `tick()`. Call sites only ever make that call from an
 * interaction handler, so the context is always unlocked by a real tap.
 *
 * Reduced motion is a motion preference: it silences vibration (see
 * `@/lib/haptics`) and the press animation, but not an explicitly requested
 * sound. Sound is muted only through `setSfxEnabled`.
 */

const STORAGE_KEY = "sfx";

/** Long enough to hear, short enough to feel like a tap. */
const DURATION_MS = 50;
/** Quiet by design: feedback should register, not announce itself. */
const VOLUME = 0.05;
/** Rapid taps collapse into one sound instead of a stutter. */
const MIN_GAP_MS = 50;
/** Neutral pitch for call sites that do not care which element was tapped. */
const DEFAULT_PITCH = 720;
/** Jump straight to full volume without a click at the start of the ramp. */
const ATTACK_SECONDS = 0.004;
/** Exponential ramps cannot reach zero, so both ends sit just above it. */
const NEAR_ZERO = 0.0001;

type AudioContextConstructor = new () => AudioContext;

/** `AudioContext` is unprefixed in modern browsers; Safari needs the prefix. */
type AudioWindow = Window & {
  AudioContext?: AudioContextConstructor;
  webkitAudioContext?: AudioContextConstructor;
};

let context: AudioContext | null = null;
let lastPlayedAt = Number.NEGATIVE_INFINITY;

/** Resolved per call rather than cached, so a late polyfill still works. */
function audioContextConstructor(): AudioContextConstructor | null {
  if (typeof window === "undefined") return null;

  const candidate = (window as AudioWindow).AudioContext ?? (window as AudioWindow).webkitAudioContext;
  return typeof candidate === "function" ? candidate : null;
}

/** True when the browser can synthesise audio at all. */
export function sfxSupported(): boolean {
  return audioContextConstructor() !== null;
}

export function sfxEnabled(): boolean {
  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // Storage can throw in private browsing modes; treat that as "on".
    return true;
  }
}

export function setSfxEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Persisting the preference is best effort.
  }
}

/** Created on demand, then reused; resumed if the browser suspended it. */
function audioContext(Constructor: AudioContextConstructor): AudioContext | null {
  try {
    if (!context) context = new Constructor();

    if (context.state === "suspended") {
      // resume() can reject when the gesture has already been consumed. That is
      // not an error worth surfacing — the tick simply stays silent.
      void context.resume().catch(() => undefined);
    }

    return context;
  } catch {
    return null;
  }
}

export type TickOptions = {
  /** Hz. A distinct pitch per tap target is what makes the grid feel alive. */
  pitch?: number;
  durationMs?: number;
  volume?: number;
};

/**
 * Play the tick. Safe to call from any click/tap handler: it no-ops when sound
 * is switched off, when Web Audio is missing, and when taps arrive faster than
 * `MIN_GAP_MS`.
 */
export function tick({
  pitch = DEFAULT_PITCH,
  durationMs = DURATION_MS,
  volume = VOLUME,
}: TickOptions = {}): void {
  if (!sfxEnabled()) return;

  const Constructor = audioContextConstructor();
  if (!Constructor) return;

  const now = typeof performance !== "undefined" ? performance.now() : Date.now();
  if (now - lastPlayedAt < MIN_GAP_MS) return;
  lastPlayedAt = now;

  const ctx = audioContext(Constructor);
  if (!ctx) return;

  try {
    const start = ctx.currentTime;
    const seconds = Math.max(durationMs, 10) / 1000;

    const oscillator = ctx.createOscillator();
    const gain = ctx.createGain();

    oscillator.type = "triangle";
    oscillator.frequency.setValueAtTime(pitch, start);

    gain.gain.setValueAtTime(NEAR_ZERO, start);
    gain.gain.linearRampToValueAtTime(volume, start + ATTACK_SECONDS);
    gain.gain.exponentialRampToValueAtTime(NEAR_ZERO, start + seconds);

    oscillator.connect(gain);
    gain.connect(ctx.destination);

    oscillator.start(start);
    oscillator.stop(start + seconds + 0.02);
    oscillator.onended = () => {
      oscillator.disconnect();
      gain.disconnect();
    };
  } catch {
    // Audio is decoration: a synthesis failure must never break the tap.
  }
}

/**
 * Haptic feedback helper for tap-by-tap interaction feel.
 *
 * `navigator.vibrate` does not exist on iOS Safari, so every call site must stay
 * fully usable without it. This module is progressive enhancement only: it never
 * throws, and it stays silent when the user prefers reduced motion or has
 * switched haptics off.
 *
 * Only call `haptic()` from a real user gesture handler (pointerdown/click).
 */

const STORAGE_KEY = "haptics";

// Deliberately not `as const`: navigator.vibrate() takes a mutable number[],
// and a readonly tuple is not assignable to it.
const PATTERNS = {
  tap: 10,
  toggle: 15,
  success: [10, 30, 10],
  error: [30, 50, 30],
};

export type HapticPattern = keyof typeof PATTERNS;

/** Vibration patterns, in milliseconds. */
export const HAPTIC_PATTERNS: Record<HapticPattern, number | number[]> = PATTERNS;

function prefersReducedMotion(): boolean {
  return typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

/** True when the device can actually vibrate. */
export function hapticsSupported(): boolean {
  return typeof navigator !== "undefined" && "vibrate" in navigator;
}

export function hapticsEnabled(): boolean {
  if (!hapticsSupported()) return false;

  try {
    return window.localStorage.getItem(STORAGE_KEY) !== "off";
  } catch {
    // localStorage can throw in private browsing modes; treat that as "on".
    return true;
  }
}

export function setHapticsEnabled(enabled: boolean): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, enabled ? "on" : "off");
  } catch {
    // Persisting the preference is best effort.
  }
}

/**
 * Fire a vibration pattern. Safe to call anywhere: no-ops when the API is
 * missing, when the user opted out, or when reduced motion is preferred.
 */
export function haptic(pattern: HapticPattern = "tap"): void {
  if (!hapticsSupported() || !hapticsEnabled() || prefersReducedMotion()) return;

  try {
    navigator.vibrate(HAPTIC_PATTERNS[pattern]);
  } catch {
    // Some browsers reject vibrate() (e.g. without user activation).
  }
}

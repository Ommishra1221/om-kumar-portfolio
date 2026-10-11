import { useEffect, useState, useSyncExternalStore } from "react";
import { hapticsEnabled, hapticsSupported, setHapticsEnabled } from "@/lib/haptics";
import { setSfxEnabled, sfxEnabled } from "@/lib/sfx";

/** Tracks the `prefers-reduced-motion` media query so animation can opt out. */
export function usePrefersReducedMotion(): boolean {
  const [reduced, setReduced] = useState(
    () => typeof window !== "undefined" && window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(query.matches);

    update();
    query.addEventListener("change", update);
    return () => query.removeEventListener("change", update);
  }, []);

  return reduced;
}

/* -------------------------------------------------------------------------
   Tap feedback preference: one switch across two channels.

   The tick (Web Audio) and the vibration (`navigator.vibrate`) are stored under
   separate keys, but both toggles on the page — the header control and the
   Languages card — write the same pair, so they can never disagree. They share
   one store rather than one `useState` each, because two local states would
   drift the moment either control was used.
   ------------------------------------------------------------------------- */

const listeners = new Set<() => void>();

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}

function notify(): void {
  listeners.forEach((listener) => listener());
}

/**
 * Sound works everywhere; `navigator.vibrate` does not exist on iOS Safari.
 * A platform without vibration is not a muted one, so a missing API does not
 * drag the switch down.
 */
function feedbackEnabled(): boolean {
  return sfxEnabled() && (!hapticsSupported() || hapticsEnabled());
}

function setFeedbackEnabled(enabled: boolean): void {
  setSfxEnabled(enabled);
  setHapticsEnabled(enabled);
  notify();
}

/**
 * Persisted haptics preference with a toggle that confirms itself.
 *
 * Reads through the store rather than a private `useState`, so muting from the
 * Languages card updates this control too — and vice versa.
 */
export function useHapticPreference() {
  const enabled = useSyncExternalStore(subscribe, hapticsEnabled, () => true);

  const toggle = () => {
    setHapticsEnabled(!enabled);
    notify();
  };

  return { enabled, toggle };
}

/** Combined sound + vibration preference, shared by every toggle on the page. */
export function useFeedbackPreference() {
  const enabled = useSyncExternalStore(subscribe, feedbackEnabled, () => true);

  return { enabled, toggle: () => setFeedbackEnabled(!enabled) };
}

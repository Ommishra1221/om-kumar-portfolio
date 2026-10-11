import { useEffect } from "react";
import { haptic } from "@/lib/haptics";
import { tick } from "@/lib/sfx";

/**
 * Touch feedback for every control on the page, from one pair of listeners.
 *
 * Before this, each control carried its own `onPointerDown={() => haptic("tap")}`
 * and none of them made a sound. One delegated listener gives the whole page the
 * same treatment instead: a short vibration the moment a control is pressed, and
 * a tick when that press completes into a real activation.
 *
 * The sound waits for `click` on purpose. `pointerdown` also fires for a scroll
 * that merely begins on a control, and scrolling has to stay silent, so only a
 * completed activation is audible. `click` also covers Enter/Space, which means
 * the keyboard hears the same tick (without a vibration, since there was no
 * pointer).
 *
 * A subtree that manages its own, richer feedback opts out with
 * `data-tap-feedback="self"` — the Languages chips do, because they choose a
 * pitch per language and use a longer pulse when a tap selects.
 *
 * Mount once per page.
 */

/** Anything a finger can meaningfully press. */
const INTERACTIVE = "a[href], button, [role='button'], input, textarea, select, label";
/** Subtrees that run their own feedback. */
const SELF_MANAGED = "[data-tap-feedback='self']";
/** Controls that commit to something, rather than navigate. */
const PRIMARY = ".primary, .secondary, .hire, .resume, .mobile-resume, .to-top, .contact-form button";

/* Pitch buckets, so a tap reports where it landed: nav hops sound brighter,
   a commitment sounds weightier, everything else sits in the middle. */
const NAV_PITCH = 784;
const PRIMARY_PITCH = 660;
const DEFAULT_PITCH = 720;

/** Resolve the control a raw event belongs to, or null if it has no feedback. */
function controlFrom(target: EventTarget | null): HTMLElement | null {
  if (!(target instanceof Element)) return null;

  const control = target.closest<HTMLElement>(INTERACTIVE);
  if (!control || control.closest(SELF_MANAGED)) return null;
  if (control.matches(":disabled, [aria-disabled='true']")) return null;

  return control;
}

function pitchFor(control: HTMLElement): number {
  // The mobile sheet is a dialog rather than a <nav>, but it is navigation.
  if (control.closest("nav, footer, #endpoint-menu")) return NAV_PITCH;
  if (control.matches(PRIMARY)) return PRIMARY_PITCH;
  return DEFAULT_PITCH;
}

export function useTapFeedback(): void {
  useEffect(() => {
    const onPointerDown = (event: PointerEvent) => {
      if (!event.isPrimary || (event.pointerType === "mouse" && event.button !== 0)) return;
      if (!controlFrom(event.target)) return;

      haptic("tap");
    };

    const onClick = (event: MouseEvent) => {
      // 0 is every real activation: pointer, tap, and keyboard (detail 0).
      if (event.button !== 0) return;

      const control = controlFrom(event.target);
      if (!control) return;

      tick({ pitch: pitchFor(control) });
    };

    // Capture, so a control that stops propagation cannot go silent.
    document.addEventListener("pointerdown", onPointerDown, true);
    document.addEventListener("click", onClick);

    return () => {
      document.removeEventListener("pointerdown", onPointerDown, true);
      document.removeEventListener("click", onClick);
    };
  }, []);
}

import { useEffect, useState } from "react";
import { hapticsEnabled, setHapticsEnabled } from "@/lib/haptics";

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

/** Persisted haptics preference with a toggle that confirms itself. */
export function useHapticPreference() {
  const [enabled, setEnabled] = useState(() => hapticsEnabled());

  const toggle = () => {
    setEnabled((current) => {
      const next = !current;
      setHapticsEnabled(next);
      return next;
    });
  };

  return { enabled, toggle };
}

import { useEffect } from "react";

/**
 * Scroll storytelling with GSAP.
 *
 * Design rules applied here, straight from the design-system checklist:
 * - Only transform and opacity are animated; never width/height.
 * - Entrances are short and ease out; nothing animates for longer than it needs.
 * - `toggleActions: "play none none none"`: once something has been revealed it
 *   stays revealed. Reversing on scroll-back looked nice in isolation but could
 *   strand elements at opacity 0 whenever a trigger's start point shifted after
 *   it had already played (below-the-fold sections lay out lazily, which changes
 *   the document height). Content that can disappear is a bug, not a flourish.
 * - GSAP itself is code-split, so it never blocks first paint.
 * - Reduced-motion visitors get no splitting, no reveals and no pinning.
 */

/** Short headline copy only — splitting long prose is a documented anti-pattern. */
const MAX_SPLIT_WORDS = 12;

/** Set to false to disable the desktop-only pin without touching the rest. */
const ENABLE_GRAPH_PIN = true;

function splitWordsInPlace(root: HTMLElement): string {
  const original = root.innerHTML;
  const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT);
  const textNodes: Text[] = [];

  while (walker.nextNode()) {
    const node = walker.currentNode as Text;
    if (node.nodeValue && node.nodeValue.trim()) textNodes.push(node);
  }

  textNodes.forEach((node) => {
    const fragment = document.createDocumentFragment();
    (node.nodeValue ?? "").split(/(\s+)/).forEach((part) => {
      if (part === "") return;
      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }
      const span = document.createElement("span");
      span.className = "reveal-word";
      span.textContent = part;
      fragment.appendChild(span);
    });
    node.parentNode?.replaceChild(fragment, node);
  });

  return original;
}

export function useScrollStorytelling(): void {
  useEffect(() => {
    if (typeof window === "undefined") return;
    // Reduced motion: render everything in its final state and load nothing.
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    let cancelled = false;
    let teardown: (() => void) | undefined;

    void (async () => {
      // Code-split: GSAP arrives after first paint.
      const [{ gsap }, { ScrollTrigger }] = await Promise.all([
        import("gsap"),
        import("gsap/ScrollTrigger"),
      ]);
      if (cancelled) return;

      gsap.registerPlugin(ScrollTrigger);
      const matchMedia = gsap.matchMedia();

      matchMedia.add("(prefers-reduced-motion: no-preference)", () => {
        const cleanups: Array<() => void> = [];

        // 1. Elements marked for a simple reveal.
        gsap.utils.toArray<HTMLElement>("[data-reveal]").forEach((element) => {
          const tween = gsap.from(element, {
            opacity: 0,
            y: 14,
            duration: 0.36,
            ease: "power1.out",
            // Drop the inline transform once done so CSS hover lifts still work.
            clearProps: "transform",
            scrollTrigger: {
              trigger: element,
              start: "top 90%",
              toggleActions: "play none none none",
            },
          });
          cleanups.push(() => tween.scrollTrigger?.kill());
        });

        // 2. Staggered groups: the container marks its own children.
        gsap.utils.toArray<HTMLElement>("[data-stagger]").forEach((group) => {
          const tween = gsap.from(Array.from(group.children), {
            opacity: 0,
            y: 12,
            duration: 0.3,
            stagger: 0.04,
            ease: "power1.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: group,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });
          cleanups.push(() => tween.scrollTrigger?.kill());
        });

        // 3. Word-level reveal for short headlines.
        gsap.utils.toArray<HTMLElement>("[data-words]").forEach((element) => {
          const wordCount = (element.textContent ?? "").trim().split(/\s+/).length;
          if (wordCount === 0 || wordCount > MAX_SPLIT_WORDS) return;

          const original = splitWordsInPlace(element);
          const words = element.querySelectorAll<HTMLElement>(".reveal-word");

          const tween = gsap.from(words, {
            opacity: 0,
            y: 18,
            rotateX: -35,
            duration: 0.5,
            stagger: 0.02,
            ease: "expo.out",
            clearProps: "transform",
            scrollTrigger: {
              trigger: element,
              start: "top 88%",
              toggleActions: "play none none none",
            },
          });

          cleanups.push(() => {
            tween.scrollTrigger?.kill();
            tween.kill();
            // Restore the original markup so assistive tech sees clean text.
            element.innerHTML = original;
          });
        });

        // 4. Section rules draw themselves as the page connects.
        gsap.utils.toArray<HTMLElement>(".rule").forEach((rule) => {
          const tween = gsap.from(rule, {
            scaleX: 0,
            transformOrigin: "left center",
            duration: 0.55,
            ease: "power2.out",
            scrollTrigger: { trigger: rule, start: "top 95%", toggleActions: "play none none none" },
          });
          cleanups.push(() => tween.scrollTrigger?.kill());
        });

        // 5. Hero parallax — a single scrubbed transform on the art layers.
        const hero = document.querySelector<HTMLElement>(".hero");
        if (hero) {
          const layers = gsap.utils.toArray<HTMLElement>(".packet-field, .art--map");
          if (layers.length > 0) {
            const tween = gsap.to(layers, {
              yPercent: 10,
              ease: "none",
              scrollTrigger: { trigger: hero, start: "top top", end: "bottom top", scrub: true },
            });
            cleanups.push(() => tween.scrollTrigger?.kill());
          }
        }

        return () => cleanups.forEach((fn) => fn());
      });

      // 6. Desktop-only pin: the architecture graph holds while it settles.
      if (ENABLE_GRAPH_PIN) {
        matchMedia.add("(min-width: 1024px) and (prefers-reduced-motion: no-preference)", () => {
          const graph = document.querySelector<HTMLElement>("[data-graph]");
          if (!graph) return;

          // Skip the pin when the graph is taller than the viewport, where a
          // hold would read as a stall rather than a beat.
          if (graph.offsetHeight > window.innerHeight - 120) return;

          const trigger = ScrollTrigger.create({
            trigger: graph,
            start: "center center",
            end: "+=35%",
            pin: true,
            pinSpacing: true,
            anticipatePin: 1,
          });

          const onResize = () => ScrollTrigger.refresh();
          window.addEventListener("resize", onResize);

          return () => {
            window.removeEventListener("resize", onResize);
            trigger.kill();
          };
        });
      }

      // Below-the-fold sections lay out lazily (the content-visibility rule in
      // index.css), so the document height grows as the visitor scrolls and a
      // trigger measured earlier can drift out of step with its element.
      // Re-measure when a section's layout state settles.
      const cvEvent = "contentvisibilityautostatechange";
      const teardownHooks: Array<() => void> = [];

      if (cvEvent in document) {
        let frame = 0;
        const onStateChange = () => {
          window.cancelAnimationFrame(frame);
          frame = window.requestAnimationFrame(() => ScrollTrigger.refresh());
        };

        document.addEventListener(cvEvent, onStateChange, true);
        teardownHooks.push(() => {
          document.removeEventListener(cvEvent, onStateChange, true);
          window.cancelAnimationFrame(frame);
        });
      }

      teardown = () => {
        teardownHooks.forEach((fn) => fn());
        matchMedia.revert();
      };
    })();

    return () => {
      cancelled = true;
      teardown?.();
    };
  }, []);
}

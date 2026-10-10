import { useEffect, useRef } from "react";
import { usePrefersReducedMotion } from "@/hooks/useHaptics";
import "./PacketField.css";

type Packet = { lane: number; x: number; speed: number; dir: 1 | -1 };
type Lane = { y: number; request: boolean };

/**
 * Hero background: data packets travelling along request/response lanes.
 *
 * Performance guardrails for mid-range phones:
 * - lane and packet counts scale with area instead of being fixed,
 * - device pixel ratio is capped at 2,
 * - rendering stops when the tab is hidden or the canvas scrolls out of view,
 * - reduced motion draws a single static frame and never starts the rAF loop,
 * - no blur or shadow effects per frame; one clear + a handful of paths.
 */
export default function PacketField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const reducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d", { alpha: true });
    if (!context) return;

    let width = 0;
    let height = 0;
    let lanes: Lane[] = [];
    let packets: Packet[] = [];
    let frame = 0;
    let running = false;

    const palette = { request: "#ff6b00", response: "#00d4ff", grid: "rgba(102,164,205,0.16)" };

    const readPalette = () => {
      const styles = getComputedStyle(document.documentElement);
      palette.request = styles.getPropertyValue("--orange").trim() || palette.request;
      palette.response = styles.getPropertyValue("--cyan").trim() || palette.response;
    };

    const build = () => {
      const rect = canvas.getBoundingClientRect();
      width = Math.max(rect.width, 1);
      height = Math.max(rect.height, 1);

      const ratio = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(width * ratio);
      canvas.height = Math.floor(height * ratio);
      context.setTransform(ratio, 0, 0, ratio, 0, 0);

      // Fewer lanes on small screens keeps the frame budget predictable.
      const laneCount = Math.max(3, Math.min(8, Math.round(height / 110)));
      const gap = height / (laneCount + 1);

      lanes = Array.from({ length: laneCount }, (_, index) => ({
        y: Math.round(gap * (index + 1)) + 0.5,
        request: index % 2 === 0,
      }));

      const perLane = width > 720 ? 2 : 1;
      packets = lanes.flatMap((lane, laneIndex) =>
        Array.from({ length: perLane }, (_, slot) => ({
          lane: laneIndex,
          // Spread the starting offsets so packets never move as a block.
          x: (width / perLane) * slot + ((laneIndex * 53) % Math.max(width / 2, 60)),
          speed: 0.55 + ((laneIndex * 7) % 5) * 0.12,
          dir: lane.request ? (1 as const) : (-1 as const),
        }))
      );
    };

    const draw = () => {
      context.clearRect(0, 0, width, height);

      // Lane rails.
      context.lineWidth = 1;
      context.strokeStyle = palette.grid;
      context.beginPath();
      lanes.forEach((lane) => {
        context.moveTo(0, lane.y);
        context.lineTo(width, lane.y);
      });
      context.stroke();

      // Lane terminals, so each line reads as a request/response edge.
      lanes.forEach((lane) => {
        context.fillStyle = lane.request ? palette.request : palette.response;
        context.globalAlpha = 0.5;
        context.fillRect(0, lane.y - 3, 3, 6);
        context.fillRect(width - 3, lane.y - 3, 3, 6);
        context.globalAlpha = 1;
      });

      // Packets with a short comet tail.
      packets.forEach((packet) => {
        const lane = lanes[packet.lane];
        if (!lane) return;

        const tone = packet.dir === 1 ? palette.request : palette.response;
        const tail = 34 * packet.speed;

        const gradient = context.createLinearGradient(packet.x - tail * packet.dir, 0, packet.x, 0);
        gradient.addColorStop(0, "rgba(0,0,0,0)");
        gradient.addColorStop(1, tone);

        context.strokeStyle = gradient;
        context.lineWidth = 1.5;
        context.beginPath();
        context.moveTo(packet.x - tail * packet.dir, lane.y);
        context.lineTo(packet.x, lane.y);
        context.stroke();

        context.fillStyle = tone;
        context.fillRect(packet.x - 2, lane.y - 2, 4, 4);
      });
    };

    const advance = () => {
      packets.forEach((packet) => {
        packet.x += packet.speed * packet.dir * 1.6;

        if (packet.dir === 1 && packet.x > width + 40) packet.x = -40;
        if (packet.dir === -1 && packet.x < -40) packet.x = width + 40;
      });
    };

    const loop = () => {
      advance();
      draw();
      frame = window.requestAnimationFrame(loop);
    };

    // Fully stop the loop while offscreen or hidden rather than spinning on no-ops.
    const play = () => {
      if (running || reducedMotion) return;
      running = true;
      frame = window.requestAnimationFrame(loop);
    };
    const pause = () => {
      if (!running) return;
      running = false;
      window.cancelAnimationFrame(frame);
    };

    const start = () => {
      build();
      readPalette();
      draw();
      play();
    };

    start();

    const onResize = () => {
      build();
      draw();
    };

    const resizeObserver = new ResizeObserver(onResize);
    resizeObserver.observe(canvas.parentElement ?? canvas);

    const intersection = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !document.hidden) play();
        else pause();
      },
      { threshold: 0 }
    );
    intersection.observe(canvas);

    const onVisibility = () => {
      if (document.hidden) pause();
      else play();
    };
    document.addEventListener("visibilitychange", onVisibility);

    // Repaint with the new palette when the theme toggles.
    const themeObserver = new MutationObserver(() => {
      readPalette();
      draw();
    });
    themeObserver.observe(document.documentElement, { attributeFilter: ["data-theme"] });

    return () => {
      window.cancelAnimationFrame(frame);
      resizeObserver.disconnect();
      intersection.disconnect();
      themeObserver.disconnect();
      document.removeEventListener("visibilitychange", onVisibility);
    };
  }, [reducedMotion]);

  return <canvas ref={canvasRef} className="packet-field" aria-hidden="true" />;
}

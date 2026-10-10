import { useCallback, useEffect, useRef, useState } from "react";
import { bootLines, bootSummary } from "@/data/portfolio";
import "./BootLog.css";

const SESSION_KEY = "bootLogSeen";

type Props = {
  /** Called once the boot sequence finishes or the visitor skips it. */
  onDone: () => void;
};

/**
 * Intro overlay that boots the portfolio like a Spring Boot application.
 *
 * - Skippable at any point (button, click anywhere, Esc/Enter/Space).
 * - Mounted at most once per browser session (see shouldBoot).
 * - The caller renders it only when reduced motion is not preferred.
 */
export default function BootLog({ onDone }: Props) {
  const [step, setStep] = useState(0);
  const [leaving, setLeaving] = useState(false);
  const doneRef = useRef(false);

  const finish = useCallback(
    (reason: "complete" | "skipped") => {
      if (doneRef.current) return;
      doneRef.current = true;

      try {
        window.sessionStorage.setItem(SESSION_KEY, reason);
      } catch {
        // Session storage is best effort.
      }

      setLeaving(true);
      // Let the fade-out play before handing control back to the hero.
      window.setTimeout(onDone, 320);
    },
    [onDone]
  );

  // Reveal log lines progressively, then stamp the summary and finish.
  useEffect(() => {
    const timers = bootLines.map((_, index) =>
      window.setTimeout(() => setStep(index + 1), 150 * (index + 1))
    );
    timers.push(window.setTimeout(() => finish("complete"), 150 * bootLines.length + 560));

    return () => timers.forEach(window.clearTimeout);
  }, [finish]);

  // Keyboard escape hatch, so the intro is never a trap.
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape" || event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        finish("skipped");
      }
    };

    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [finish]);

  const complete = step >= bootLines.length;

  return (
    <div
      className={`boot ${leaving ? "is-leaving" : ""}`}
      role="status"
      aria-label="Starting PortfolioApplication"
      onClick={() => finish("skipped")}
    >
      <div className="boot-panel">
        <div className="boot-head">
          <span className="boot-dot" aria-hidden="true" />
          <span className="boot-dot" aria-hidden="true" />
          <span className="boot-dot" aria-hidden="true" />
          <b>spring-boot : run</b>
        </div>

        {/* Decorative: screen readers get the concise role="status" label instead. */}
        <pre className="boot-log" aria-hidden="true">
          {bootLines.slice(0, step).map((line) => (
            <span className={`boot-line boot-line--${line.tone}`} key={line.text}>
              {line.text}
            </span>
          ))}
        </pre>

        <div className="boot-bar" aria-hidden="true">
          <i style={{ transform: `scaleX(${step / bootLines.length})` }} />
        </div>

        <p className={`boot-summary ${complete ? "is-on" : ""}`} aria-hidden="true">
          {bootSummary}
        </p>

        <button
          type="button"
          className="boot-skip hit"
          onClick={(event) => {
            event.stopPropagation();
            finish("skipped");
          }}
        >
          Skip intro
        </button>
      </div>
    </div>
  );
}

/** True when the intro has not already been shown in this session. */
export function shouldBoot(): boolean {
  try {
    return window.sessionStorage.getItem(SESSION_KEY) === null;
  } catch {
    // If storage is unavailable, prefer showing the intro.
    return true;
  }
}

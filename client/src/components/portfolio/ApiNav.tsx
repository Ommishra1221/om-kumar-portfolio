import { useCallback, useEffect, useRef } from "react";
import { ArrowRight, Menu, X } from "lucide-react";
import { endpoints } from "@/data/portfolio";
import type { Endpoint } from "@/data/portfolio";
import { haptic } from "@/lib/haptics";
import "./ApiNav.css";

type Props = {
  activeId: string;
  menuOpen: boolean;
  onMenuOpen: () => void;
  onMenuClose: () => void;
};

function Method({ method }: { method: Endpoint["method"] }) {
  return (
    <span className="method" data-method={method}>
      {method}
    </span>
  );
}

/**
 * Navigation modelled as API endpoints. Every destination is a real section on
 * the page, so the HTTP framing stays honest rather than decorative.
 */
export function DesktopNav({ activeId }: { activeId: string }) {
  return (
    <nav className="api-nav" aria-label="Primary">
      <ul>
        {endpoints.map((endpoint) => (
          <li key={endpoint.id}>
            <a
              href={`#${endpoint.id}`}
              className={activeId === endpoint.id ? "is-active" : ""}
              aria-current={activeId === endpoint.id ? "true" : undefined}
              title={`${endpoint.method} ${endpoint.path} — ${endpoint.description}`}
            >
              <Method method={endpoint.method} />
              <span className="api-nav-path">{endpoint.path}</span>
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}

/** Full-screen endpoint menu for small screens, with a real focus trap. */
export function MobileNav({ menuOpen, onMenuOpen, onMenuClose, activeId }: Props) {
  const panelRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const close = useCallback(() => onMenuClose(), [onMenuClose]);

  // Lock background scrolling while the sheet is open.
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [menuOpen]);

  // Move focus in on open, keep Tab inside, and return it on close.
  useEffect(() => {
    if (!menuOpen) return;

    const panel = panelRef.current;
    const items = () =>
      Array.from(panel?.querySelectorAll<HTMLElement>("a[href], button:not([disabled])") ?? []);

    // Land on the first destination rather than the close button. The timer is
    // tracked so a quick close cannot leave a stray focus call pointing at a
    // link inside the now-closed sheet.
    const target = panel?.querySelector<HTMLElement>(".endpoint-list a") ?? items()[0];
    const focusTimer = window.setTimeout(() => target?.focus(), 40);

    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        close();
        return;
      }
      if (event.key !== "Tab") return;

      const focusable = items();
      if (focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKey);

    return () => {
      window.clearTimeout(focusTimer);
      document.removeEventListener("keydown", onKey);
      // Deterministic: focus the control that opened the sheet, even if the
      // click itself never moved focus (programmatic or touch activation).
      triggerRef.current?.focus();
    };
  }, [menuOpen, close]);

  return (
    <>
      <button
        ref={triggerRef}
        type="button"
        className="head-icon hit menu-trigger"
        onClick={() => {
          haptic("tap");
          onMenuOpen();
        }}
        aria-label="Open navigation"
        aria-expanded={menuOpen}
        aria-controls="endpoint-menu"
      >
        <Menu size={18} />
      </button>

      <div
        id="endpoint-menu"
        ref={panelRef}
        className={`endpoint-menu ${menuOpen ? "is-open" : ""}`}
        aria-hidden={!menuOpen}
        // aria-hidden alone leaves the links tabbable; inert takes the closed
        // sheet out of the tab order and makes focus inside it impossible.
        inert={!menuOpen}
        aria-label="Endpoint navigation"
        role="dialog"
        aria-modal="true"
      >
        <div className="endpoint-menu-head">
          <span className="endpoint-menu-title">
            <span className="pulse-dot" aria-hidden="true" />
            router
          </span>
          <button type="button" className="head-icon hit" onClick={close} aria-label="Close navigation">
            <X size={20} />
          </button>
        </div>

        <ul className="endpoint-list">
          {endpoints.map((endpoint) => (
            <li key={endpoint.id}>
              <a
                href={`#${endpoint.id}`}
                onClick={() => {
                  haptic("tap");
                  close();
                }}
                aria-current={activeId === endpoint.id ? "true" : undefined}
              >
                <Method method={endpoint.method} />
                <span className="endpoint-label">
                  <b>{endpoint.label}</b>
                  <small>{endpoint.description}</small>
                </span>
                <ArrowRight size={16} aria-hidden="true" />
              </a>
            </li>
          ))}
        </ul>

        <p className="endpoint-menu-foot">6 endpoints · 2xx on every request</p>
      </div>
    </>
  );
}

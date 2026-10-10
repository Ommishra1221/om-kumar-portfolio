import { Box, Download, Github, Layers3, Send } from "lucide-react";
import { quickActions, profile } from "@/data/portfolio";
import { haptic } from "@/lib/haptics";
import "./BottomBar.css";

const icons = {
  projects: Box,
  skills: Layers3,
  github: Github,
  resume: Download,
  contact: Send,
} as const;

/**
 * Sticky action bar for small screens — five destinations at most, each a
 * minimum 44x44px target, respecting the bottom safe area on notched devices.
 * Hidden from assistive tech on wider screens where the header nav applies.
 */
export default function BottomBar({ activeId }: { activeId: string }) {
  return (
    <nav className="bottom-bar" aria-label="Quick actions">
      {quickActions.map((action) => {
        const Icon = icons[action.id];
        const external = "external" in action && action.external;
        const download = "download" in action && action.download;
        const active = activeId === action.id;

        return (
          <a
            key={action.id}
            className={`bar-action ripple ${active ? "is-active" : ""}`}
            href={action.href}
            {...(external ? { target: "_blank", rel: "noreferrer" } : {})}
            {...(download ? { download: "" } : {})}
            aria-label={download ? `${action.label} — download PDF` : action.label}
            aria-current={active ? "true" : undefined}
            onPointerDown={() => haptic("tap")}
          >
            <Icon size={18} aria-hidden="true" />
            <small>{action.label}</small>
          </a>
        );
      })}
    </nav>
  );
}

/** Accessible description of the resume asset for callers that need it. */
export const resumeHref = profile.resume;

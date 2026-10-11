import { useId, useRef, useState } from "react";
import { ArrowUpRight, Code2, ExternalLink, Github } from "lucide-react";
import type { Project } from "@/data/portfolio";
import { haptic } from "@/lib/haptics";
import { ProjectArt } from "./ProceduralArt";
import "../../pages/project-links.css";
import "./ProjectCard.css";

/**
 * A project presented as an API resource.
 *
 * The card flips between a human summary and a JSON-style response. The flip is
 * a transform-only transition (no width/height animation), and each face is
 * inert while hidden so focus can never land inside the invisible one.
 */
export default function ProjectCard({ project, index }: { project: Project; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const summaryRef = useRef<HTMLButtonElement>(null);
  const responseRef = useRef<HTMLButtonElement>(null);
  const status = project.response.status;

  const toggle = (next: boolean) => {
    haptic("toggle");
    setOpen(next);
    // Follow the focus into the face that is actually visible.
    window.setTimeout(() => (next ? responseRef.current : summaryRef.current)?.focus(), 60);
  };

  const entries = Object.entries(project.response);

  return (
    <article
      className="project project-card"
      data-open={open}
      onKeyDown={(event) => {
        if (event.key === "Escape" && open) toggle(false);
      }}
    >
      <div className="card-stage">
        {/* ---------- Summary face ---------- */}
        <div className="card-face card-face--front" inert={open}>
          <div className="project-art">
            <ProjectArt kind={project.art} />
            <span className="project-tag">{project.tag}</span>
            <b className="project-index">0{index + 1}</b>
          </div>

          <div className="project-body">
            <header>
              <h3>{project.title}</h3>
              <span className="status-pill" title="Resource responds successfully">
                <i aria-hidden="true" />
                {status} OK
              </span>
            </header>

            <p>{project.desc}</p>

            <ul>
              {project.bullets.map((point) => (
                <li key={point}>{point}</li>
              ))}
            </ul>

            <div className="tags">
              {project.tags.map((tag) => (
                <span key={tag}>{tag}</span>
              ))}
            </div>

            <div className="project-links">
              <a href={project.repo} target="_blank" rel="noreferrer">
                <Github size={15} aria-hidden="true" />
                View repository
                <ArrowUpRight size={15} aria-hidden="true" />
              </a>
              {project.live && (
                <a className="live-link" href={project.live} target="_blank" rel="noreferrer">
                  <ExternalLink size={14} aria-hidden="true" />
                  Live demo
                </a>
              )}
            </div>

            <button
              ref={summaryRef}
              type="button"
              className="card-toggle ripple"
              onClick={() => toggle(true)}
              aria-expanded={open}
              aria-controls={panelId}
            >
              <Code2 size={15} aria-hidden="true" />
              View API response
            </button>
          </div>
        </div>

        {/* ---------- Response face ---------- */}
        <div className="card-face card-face--response" id={panelId} inert={!open}>
          <div className="response-head">
            <span className="response-method method" data-method="GET">
              GET
            </span>
            <code>/{project.title.toLowerCase().split(" ")[0]}-service</code>
            <span className="status-pill" data-tone="pending">
              <i aria-hidden="true" />
              {status} OK
            </span>
          </div>

          <pre className="response-body">
            <span className="json-brace">{"{"}</span>
            {entries.map(([key, value], position) => (
              <span className="json-row" key={key}>
                {"  "}
                <span className="json-key">&quot;{key}&quot;</span>
                <span className="json-colon">: </span>
                <span className="json-value">{JSON.stringify(value)}</span>
                {position < entries.length - 1 && <span className="json-colon">,</span>}
              </span>
            ))}
            <span className="json-brace">{"}"}</span>
          </pre>

          <p className="response-note">
            Shapes shown describe the real endpoints and roles implemented in this project.
          </p>

          <button ref={responseRef} type="button" className="card-toggle ripple" onClick={() => toggle(false)}>
            Back to summary
          </button>
        </div>
      </div>
    </article>
  );
}

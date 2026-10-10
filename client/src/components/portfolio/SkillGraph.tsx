import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { graphEdges, graphNodes } from "@/data/portfolio";
import type { GraphNode } from "@/data/portfolio";
import { haptic } from "@/lib/haptics";
import "./SkillGraph.css";

const layerMeta: Array<{ id: GraphNode["layer"]; label: string; hint: string }> = [
  { id: "language", label: "Language", hint: "Where the code starts" },
  { id: "framework", label: "Framework", hint: "Spring's wiring" },
  { id: "security", label: "Security", hint: "Access control" },
  { id: "api", label: "API surface", hint: "What clients call" },
  { id: "store", label: "Data stores", hint: "Where state lives" },
  { id: "quality", label: "Build & test", hint: "Confidence to ship" },
];

type Edge = { id: string; from: string; to: string; x1: number; y1: number; x2: number; y2: number };

/**
 * The stack as a connected architecture graph instead of a flat list.
 *
 * Connector geometry is measured from the real DOM, so the diagram stays
 * truthful at every breakpoint and after font loading. Nodes are real buttons,
 * which keeps the whole graph reachable and operable by keyboard.
 */
export default function SkillGraph() {
  const containerRef = useRef<HTMLDivElement>(null);
  const nodeRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const [edges, setEdges] = useState<Edge[]>([]);
  const [selected, setSelected] = useState<string | null>("boot");
  const [focusId, setFocusId] = useState<string | null>(null);

  const measure = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    const base = container.getBoundingClientRect();
    const next: Edge[] = [];

    graphEdges.forEach(([from, to]) => {
      const a = nodeRefs.current[from]?.getBoundingClientRect();
      const b = nodeRefs.current[to]?.getBoundingClientRect();
      if (!a || !b) return;

      next.push({
        id: `${from}-${to}`,
        from,
        to,
        x1: a.left + a.width / 2 - base.left,
        y1: a.top + a.height / 2 - base.top,
        x2: b.left + b.width / 2 - base.left,
        y2: b.top + b.height / 2 - base.top,
      });
    });

    setEdges(next);
  }, []);

  useLayoutEffect(() => {
    measure();

    const container = containerRef.current;
    const observer = new ResizeObserver(measure);
    if (container) observer.observe(container);
    window.addEventListener("resize", measure);

    // Webfonts change node widths, which moves every connector.
    document.fonts?.ready.then(measure).catch(() => undefined);

    return () => {
      observer.disconnect();
      window.removeEventListener("resize", measure);
    };
  }, [measure]);

  const activeId = focusId ?? selected;
  const active = graphNodes.find((node) => node.id === activeId);
  const connections = activeId
    ? graphEdges.filter(([from, to]) => from === activeId || to === activeId).length
    : 0;

  return (
    <div className="graph" ref={containerRef} data-graph>
      <svg className="graph-edges" aria-hidden="true">
        {edges.map((edge) => {
          const on = activeId === edge.from || activeId === edge.to;
          return (
            <line
              key={edge.id}
              x1={edge.x1}
              y1={edge.y1}
              x2={edge.x2}
              y2={edge.y2}
              className={on ? "is-on" : ""}
            />
          );
        })}
      </svg>

      <div className="graph-layers">
        {layerMeta.map((layer) => {
          const nodes = graphNodes.filter((node) => node.layer === layer.id);
          if (nodes.length === 0) return null;

          return (
            <section className="graph-layer" key={layer.id}>
              <header>
                <small>{layer.label}</small>
                <span>{layer.hint}</span>
              </header>

              <div className="graph-nodes">
                {nodes.map((node) => {
                  const connectedToSelection =
                    selected !== null &&
                    graphEdges.some(
                      ([from, to]) =>
                        (from === node.id && to === selected) || (to === node.id && from === selected)
                    );

                  return (
                    <button
                      key={node.id}
                      type="button"
                      ref={(element) => {
                        nodeRefs.current[node.id] = element;
                      }}
                      className="graph-node"
                      data-selected={selected === node.id}
                      data-connected={connectedToSelection}
                      aria-pressed={selected === node.id}
                      onPointerDown={() => haptic("tap")}
                      onMouseEnter={() => setFocusId(node.id)}
                      onMouseLeave={() => setFocusId(null)}
                      onFocus={() => setFocusId(node.id)}
                      onBlur={() => setFocusId(null)}
                      onClick={() => {
                        setSelected((current) => (current === node.id ? null : node.id));
                        haptic("toggle");
                      }}
                    >
                      {node.label}
                    </button>
                  );
                })}
              </div>
            </section>
          );
        })}
      </div>

      <aside className="graph-detail" aria-live="polite">
        {active ? (
          <>
            <span className="graph-detail-label">{active.label}</span>
            <p>{active.detail}</p>
            <small>
              {connections} connection{connections === 1 ? "" : "s"} in the stack
            </small>
          </>
        ) : (
          <p className="graph-detail-empty">
            Select a node to see how it connects. Every dependency shown is one this stack actually uses.
          </p>
        )}
      </aside>
    </div>
  );
}

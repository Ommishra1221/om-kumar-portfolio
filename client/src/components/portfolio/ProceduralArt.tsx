/**
 * Procedural artwork.
 *
 * The four raster backgrounds this replaces (`/manus-storage/*.jpg`) were never
 * part of the repository and only resolved through a development-only Vite
 * proxy, so they 404'd in every production build. These inline SVGs use theme
 * tokens, need no network request, and scale to any viewport.
 */

type Node = { x: number; y: number; w: number; label: string; tone: string };

function Pipeline({
  id,
  nodes,
  edges,
  height = 320,
}: {
  id: string;
  nodes: Node[];
  edges: Array<[number, number]>;
  height?: number;
}) {
  const byIndex = (index: number) => nodes[index];
  const centre = (node: Node) => ({ x: node.x + node.w / 2, y: node.y + 18 });

  return (
    <svg
      className="art"
      viewBox={`0 0 400 ${height}`}
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern id={`${id}-grid`} width="26" height="26" patternUnits="userSpaceOnUse">
          <path d="M26 0H0V26" fill="none" stroke="var(--line)" strokeWidth="1" opacity=".42" />
        </pattern>
      </defs>

      <rect width="400" height={height} fill={`url(#${id}-grid)`} />

      {edges.map(([from, to]) => {
        const a = centre(byIndex(from));
        const b = centre(byIndex(to));
        const mid = (a.y + b.y) / 2;

        return (
          <path
            key={`${from}-${to}`}
            d={`M${a.x} ${a.y + 18} L${a.x} ${mid} L${b.x} ${mid} L${b.x} ${b.y - 2}`}
            fill="none"
            stroke="var(--line)"
            strokeWidth="1.4"
            strokeDasharray="5 4"
          />
        );
      })}

      {nodes.map((node) => (
        <g key={node.label}>
          <rect
            x={node.x}
            y={node.y}
            width={node.w}
            height={36}
            rx="3"
            fill="var(--surface)"
            stroke={node.tone}
            strokeWidth="1.4"
          />
          <circle cx={node.x + 11} cy={node.y + 12} r="3" fill={node.tone} />
          <text
            x={node.x + node.w / 2}
            y={node.y + 26}
            textAnchor="middle"
            fill="var(--text)"
            style={{ font: "600 11px var(--font-mono)" }}
          >
            {node.label}
          </text>
        </g>
      ))}
    </svg>
  );
}

/** Schematic of the stack as a request pipeline. */
export function SystemMap() {
  return (
    <svg
      className="art art--map"
      viewBox="0 0 1200 800"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern id="map-grid" width="48" height="48" patternUnits="userSpaceOnUse">
          <path d="M48 0H0V48" fill="none" stroke="var(--line)" strokeWidth="1" opacity=".38" />
        </pattern>
      </defs>

      <rect width="1200" height="800" fill="url(#map-grid)" />

      {/* Primary request path */}
      <path
        d="M150 250 H330 M470 250 H650 M790 250 H970"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="1.6"
        opacity=".55"
      />
      <path d="M330 278 V370 H650" fill="none" stroke="var(--orange)" strokeWidth="1.6" opacity=".5" />
      <path d="M650 388 V470 M650 508 V560" fill="none" stroke="var(--green)" strokeWidth="1.6" opacity=".5" />

      {[
        { x: 30, y: 232, w: 120, label: "request", tone: "var(--cyan)" },
        { x: 330, y: 232, w: 140, label: "controller", tone: "var(--cyan)" },
        { x: 650, y: 232, w: 140, label: "service", tone: "var(--cyan)" },
        { x: 970, y: 232, w: 150, label: "response", tone: "var(--green)" },
        { x: 430, y: 370, w: 150, label: "security", tone: "var(--orange)" },
        { x: 570, y: 470, w: 160, label: "jpa / hibernate", tone: "var(--green)" },
        { x: 560, y: 560, w: 180, label: "mysql · postgres", tone: "var(--blue)" },
      ].map((box) => (
        <g key={box.label}>
          <rect
            x={box.x}
            y={box.y}
            width={box.w}
            height="46"
            rx="3"
            fill="var(--surface)"
            stroke={box.tone}
            strokeWidth="1.4"
          />
          <text
            x={box.x + 14}
            y={box.y + 29}
            fill="var(--text)"
            style={{ font: "600 15px var(--font-mono)" }}
          >
            {box.label}
          </text>
        </g>
      ))}

      {[
        [150, 255],
        [470, 255],
        [790, 255],
        [970, 255],
        [580, 393],
        [650, 493],
        [650, 583],
      ].map(([cx, cy]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="3.5" fill="var(--cyan)" />
      ))}
    </svg>
  );
}

/** Wide banner schematic for the engineering-principle strip. */
export function BannerArt() {
  return (
    <svg
      className="art"
      viewBox="0 0 1200 260"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      role="presentation"
    >
      <defs>
        <pattern id="banner-grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M40 0H0V40" fill="none" stroke="var(--line)" strokeWidth="1" opacity=".4" />
        </pattern>
      </defs>
      <rect width="1200" height="260" fill="url(#banner-grid)" />
      <path
        d="M-20 200 C 200 200, 260 60, 480 60 S 760 190, 980 190 S 1160 90, 1230 90"
        fill="none"
        stroke="var(--cyan)"
        strokeWidth="1.6"
        opacity=".5"
      />
      <path
        d="M-20 240 C 240 240, 300 120, 520 120 S 800 230, 1020 230 S 1180 150, 1230 150"
        fill="none"
        stroke="var(--orange)"
        strokeWidth="1.6"
        opacity=".4"
      />
      {[
        [480, 60],
        [980, 190],
        [520, 120],
        [1020, 230],
      ].map(([cx, cy], index) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r="4" fill={index % 2 ? "var(--cyan)" : "var(--orange)"} />
      ))}
    </svg>
  );
}

const commercePipeline: Node[] = [
  { x: 130, y: 40, w: 130, label: "client", tone: "var(--cyan)" },
  { x: 120, y: 130, w: 150, label: "auth · jwt", tone: "var(--orange)" },
  { x: 130, y: 220, w: 130, label: "orders", tone: "var(--green)" },
];

const workflowPipeline: Node[] = [
  { x: 140, y: 40, w: 120, label: "apply", tone: "var(--cyan)" },
  { x: 120, y: 130, w: 160, label: "review", tone: "var(--orange)" },
  { x: 140, y: 220, w: 120, label: "approve", tone: "var(--green)" },
];

/** Project card art: a small request pipeline per project. */
export function ProjectArt({ kind }: { kind: "commerce" | "workflow" }) {
  const nodes = kind === "commerce" ? commercePipeline : workflowPipeline;
  return <Pipeline id={kind} nodes={nodes} edges={[[0, 1], [1, 2]]} />;
}

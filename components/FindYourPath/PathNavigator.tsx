"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { personas, type Goal } from "@/lib/findYourPath/pathData";

// ─── Types ────────────────────────────────────────────────────────────────────

type HBValue = "low" | "medium-low" | "medium-high" | "high";

type ConnectorState = {
  d: string;
  A: { x: number; y: number };
  B: { x: number; y: number };
  C: { x: number; y: number } | null;
} | null;

// ─── Harvey Ball metrics ───────────────────────────────────────────────────────

const HARVEY: Record<string, { depth: HBValue; priority: HBValue }> = {
  "stock-market-from-zero":                        { depth: "low",         priority: "high"        },
  "mutual-funds-etfs-complete-guide":              { depth: "medium-low",  priority: "medium-high" },
  "how-to-read-financial-statements":              { depth: "medium-high", priority: "medium-high" },
  "options-trading-from-zero":                     { depth: "high",        priority: "medium-high" },
  "futures-derivatives-explained":                 { depth: "high",        priority: "medium-low"  },
  "technical-analysis-charts-patterns-indicators": { depth: "medium-low",  priority: "medium-low"  },
};

// ─── HarveyBall ───────────────────────────────────────────────────────────────

function HarveyBall({ value, id, size = 16 }: { value: HBValue; id: string; size?: number }) {
  const clipId = `hb-clip-${id}`;

  let clipRect: React.ReactNode;
  if (value === "low") {
    clipRect = <rect x={0} y={0} width={0} height={0} />;
  } else if (value === "medium-low") {
    clipRect = <rect x={8} y={0} width={8} height={8} />;
  } else if (value === "medium-high") {
    clipRect = <rect x={8} y={0} width={8} height={16} />;
  } else {
    clipRect = <rect x={0} y={0} width={16} height={16} />;
  }

  return (
    <svg width={size} height={size} viewBox="0 0 16 16" aria-hidden="true">
      <defs>
        <clipPath id={clipId}>{clipRect}</clipPath>
      </defs>
      <circle cx={8} cy={8} r={7} stroke="#7C3AED" strokeWidth="1.2" fill="none" />
      <circle cx={8} cy={8} r={7} fill="#7C3AED" clipPath={`url(#${clipId})`} />
    </svg>
  );
}

// ─── Harvey Ball legend ────────────────────────────────────────────────────────

const HB_LEGEND: { value: HBValue; label: string }[] = [
  { value: "low",         label: "Low"         },
  { value: "medium-low",  label: "Medium-Low"  },
  { value: "medium-high", label: "Medium-High" },
  { value: "high",        label: "High"        },
];

// ─── Persona icons ────────────────────────────────────────────────────────────

function PersonaIcon({ personaKey, selected }: { personaKey: string; selected: boolean }) {
  const color = selected ? "#FFFFFF" : "#6D28D9";
  const props = {
    width: 18, height: 18, viewBox: "0 0 24 24", fill: "none" as const,
    stroke: color, strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const,
    "aria-hidden": true as unknown as boolean,
  };

  switch (personaKey) {
    case "fresh_grad":
      return (
        <svg {...props}>
          <path d="M12 14l9-5-9-5-9 5 9 5z" />
          <path d="M12 14l6.16-3.422a12.083 12.083 0 01.665 6.479A11.952 11.952 0 0012 20.055a11.952 11.952 0 00-6.824-2.998 12.078 12.078 0 01.665-6.479L12 14z" />
        </svg>
      );
    case "active_trader":
      return (
        <svg {...props}>
          <path d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      );
    case "salaried_pro":
      return (
        <svg {...props}>
          <path d="M20 7H4a2 2 0 00-2 2v10a2 2 0 002 2h16a2 2 0 002-2V9a2 2 0 00-2-2z" />
          <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2" />
        </svg>
      );
    case "finance_student":
      return (
        <svg {...props}>
          <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
        </svg>
      );
    case "business_owner":
      return (
        <svg {...props}>
          <path d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-2 10v-5a1 1 0 00-1-1h-2a1 1 0 00-1 1v5m4 0H9" />
        </svg>
      );
    case "hni":
      return (
        <svg {...props}>
          <path d="M12 3l9 6.75L12 21 3 9.75 12 3z" />
        </svg>
      );
    case "retiree":
      return (
        <svg {...props}>
          <path d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      );
    default:
      return (
        <svg {...props}>
          <circle cx={12} cy={12} r={9} />
        </svg>
      );
  }
}

// ─── PathNavigator ────────────────────────────────────────────────────────────

export function PathNavigator() {
  const [activePersonaKey, setActivePersonaKey] = useState<string | null>(null);
  const [activeGoalIndex, setActiveGoalIndex]   = useState<number | null>(null);
  const [connector, setConnector]               = useState<ConnectorState>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const personaRefs  = useRef<Record<string, HTMLDivElement | null>>({});
  const goalRefs     = useRef<(HTMLDivElement | null)[]>([]);
  const firstCardRef = useRef<HTMLDivElement | null>(null);

  const activePersona = personas.find((p) => p.key === activePersonaKey) ?? null;
  const activeGoal =
    activePersona && activeGoalIndex !== null
      ? (activePersona.goals[activeGoalIndex] ?? null)
      : null;

  function selectPersona(key: string) {
    setActivePersonaKey(key);
    setActiveGoalIndex(null);
    goalRefs.current = [];
  }

  function selectGoal(i: number) {
    setActiveGoalIndex(i);
  }

  const updateConnector = useCallback(() => {
    if (!containerRef.current || !activePersonaKey || activeGoalIndex === null) {
      setConnector(null);
      return;
    }

    const cRect = containerRef.current.getBoundingClientRect();
    const pEl   = personaRefs.current[activePersonaKey];
    const gEl   = goalRefs.current[activeGoalIndex];

    if (!pEl || !gEl) { setConnector(null); return; }

    const pRect = pEl.getBoundingClientRect();
    const gRect = gEl.getBoundingClientRect();

    const A = {
      x: pRect.right - cRect.left,
      y: pRect.top + pRect.height / 2 - cRect.top,
    };
    const B = {
      x: gRect.left - cRect.left,
      y: gRect.top + gRect.height / 2 - cRect.top,
    };

    let C: { x: number; y: number } | null = null;
    if (firstCardRef.current) {
      const fc = firstCardRef.current.getBoundingClientRect();
      C = {
        x: fc.left - cRect.left,
        y: fc.top + fc.height / 2 - cRect.top,
      };
    }

    const d = C
      ? `M ${A.x} ${A.y} C ${A.x + 80} ${A.y} ${B.x - 80} ${B.y} ${B.x} ${B.y} C ${B.x + 80} ${B.y} ${C.x - 80} ${C.y} ${C.x} ${C.y}`
      : `M ${A.x} ${A.y} C ${A.x + 80} ${A.y} ${B.x - 80} ${B.y} ${B.x} ${B.y}`;

    setConnector({ d, A, B, C });
  }, [activePersonaKey, activeGoalIndex]);

  useEffect(() => {
    const t = setTimeout(updateConnector, 50);
    return () => clearTimeout(t);
  }, [updateConnector]);

  useEffect(() => {
    window.addEventListener("resize", updateConnector);
    return () => window.removeEventListener("resize", updateConnector);
  }, [updateConnector]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section style={{ padding: "80px clamp(1.25rem, 4vw, 4rem)" }}>

      {/* Section heading */}
      <div style={{ maxWidth: 1760, margin: "0 auto 20px" }}>
        <p style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 600, color: "#C4B5FD", marginBottom: 8 }}>
          FIND YOUR PATH
        </p>
        <h2 style={{ fontSize: 28, fontWeight: 700, color: "#FFFFFF", marginBottom: 6 }}>
          Where do you start?
        </h2>
        <p style={{ fontSize: 14, color: "#C7BEE6" }}>
          Select who you are, then your goal. We&apos;ll map your learning path.
        </p>
      </div>

      {/* Harvey Ball legend */}
      <div style={{ maxWidth: 1760, margin: "0 auto 16px", display: "flex", alignItems: "center", gap: 20, flexWrap: "wrap" as const }}>
        <span style={{ fontSize: 13, fontWeight: 700, color: "#DDD6FE", marginRight: 4 }}>
          Harvey Balls —
        </span>
        {HB_LEGEND.map(({ value, label }) => (
          <span key={value} style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <HarveyBall value={value} id={`legend-${value}`} size={14} />
            <span style={{ fontSize: 13, color: "#DDD6FE" }}>{label}</span>
          </span>
        ))}
      </div>

      {/* Grid container */}
      <div style={{ maxWidth: 1760, margin: "0 auto", overflowX: "auto" }}>
        <div
          ref={containerRef}
          style={{
            position: "relative",
            display: "grid",
            gridTemplateColumns: "200px 220px 1fr",
            border: "1.5px solid #DDD6FE",
            borderRadius: 12,
            overflow: "hidden",
            background: "#FFFFFF",
            minWidth: 640,
          }}
          className="!grid-cols-1 md:!grid-cols-[200px_220px_1fr]"
        >

          {/* SVG connector — desktop only */}
          {connector && (
            <svg
              aria-hidden="true"
              style={{
                position: "absolute", top: 0, left: 0,
                width: "100%", height: "100%",
                pointerEvents: "none", zIndex: 20, overflow: "visible",
                display: "none",
              }}
              className="!hidden md:!block"
            >
              <path
                key={connector.d}
                d={connector.d}
                stroke="#0D9488"
                strokeWidth="1.5"
                fill="none"
              />
              <circle cx={connector.A.x} cy={connector.A.y} r={4} fill="#0D9488" />
              <circle cx={connector.B.x} cy={connector.B.y} r={4} fill="#0D9488" />
              {connector.C && (
                <circle cx={connector.C.x} cy={connector.C.y} r={4} fill="#0D9488" />
              )}
            </svg>
          )}

          {/* ─────────────── Column 1: Who are you? ─────────────── */}
          <div style={{ background: "#FFFFFF", borderRight: "1px solid #EDE9FE", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "16px 16px 12px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase" as const, color: "#7C3AED",
              borderBottom: "1px solid #EDE9FE",
              flexShrink: 0,
            }}>
              WHO ARE YOU
            </div>
            <div style={{ padding: 12, display: "flex", flexDirection: "column" as const, gap: 8 }}>
              {personas.map((persona) => {
                const isActive = activePersonaKey === persona.key;
                return (
                  <div
                    key={persona.key}
                    ref={(el) => { personaRefs.current[persona.key] = el; }}
                    onClick={() => selectPersona(persona.key)}
                    style={{
                      display: "flex", alignItems: "center", gap: 10,
                      padding: "10px 14px",
                      borderRadius: 10,
                      background: isActive ? "#7C3AED" : "#EDE9FE",
                      fontSize: 13,
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? "#FFFFFF" : "#1E1B4B",
                      cursor: "pointer",
                      transition: "all 150ms",
                    }}
                  >
                    <span style={{ flexShrink: 0 }}>
                      <PersonaIcon personaKey={persona.key} selected={isActive} />
                    </span>
                    <span style={{ lineHeight: "1.3" }}>{persona.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─────────────── Column 2: Your goal ─────────────── */}
          <div style={{ background: "#FFFFFF", borderRight: "1px solid #EDE9FE", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "16px 16px 12px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase" as const, color: "#0D9488",
              borderBottom: "1px solid #EDE9FE",
              flexShrink: 0,
            }}>
              YOUR GOAL
            </div>

            {!activePersona ? (
              <div style={{ padding: "40px 16px", textAlign: "center" as const, fontSize: 13, color: "#9CA3AF" }}>
                ← Select who you are
              </div>
            ) : (
              <div style={{ padding: 12, display: "flex", flexDirection: "column" as const, gap: 8 }}>
                {activePersona.goals.map((goal, i) => {
                  const isActive = activeGoalIndex === i;
                  return (
                    <GoalItem
                      key={i}
                      label={goal.label}
                      isActive={isActive}
                      onClick={() => selectGoal(i)}
                      refCallback={(el) => { goalRefs.current[i] = el; }}
                    />
                  );
                })}
              </div>
            )}
          </div>

          {/* ─────────────── Column 3: Your learning path ─────────────── */}
          <div style={{ background: "#FFFFFF", display: "flex", flexDirection: "column" }}>
            <div style={{
              padding: "16px 16px 12px",
              fontSize: 11, fontWeight: 700, letterSpacing: "0.1em",
              textTransform: "uppercase" as const, color: "#1E1B4B",
              borderBottom: "1px solid #EDE9FE",
              flexShrink: 0,
            }}>
              YOUR LEARNING PATH
            </div>

            {!activeGoal ? (
              <div style={{ padding: "40px 16px", textAlign: "center" as const, fontSize: 13, color: "#9CA3AF" }}>
                ← Select your goal to see your path
              </div>
            ) : activeGoal.courses.length === 0 ? (
              /* HNI / no-courses case */
              <div style={{ padding: 16, flex: 1 }}>
                <div style={{
                  borderLeft: "3px solid #0D9488",
                  background: "#F0FDFA",
                  borderRadius: 8,
                  padding: 16,
                  fontSize: 13,
                  color: "#0D9488",
                }}>
                  At your level, courses are secondary. Your path starts with research.
                </div>
                <SuggestedPlan goal={activeGoal} />
              </div>
            ) : (
              <div style={{ padding: 16, flex: 1, display: "flex", flexDirection: "column" as const }}>
                {/* Sub-category label */}
                <span style={{
                  fontSize: 11,
                  letterSpacing: "0.12em",
                  textTransform: "uppercase" as const,
                  color: "#0D9488",
                  fontWeight: 600,
                  paddingBottom: 8,
                  borderBottom: "1px solid #0D9488",
                  marginBottom: 16,
                  display: "block",
                }}>
                  {activeGoal.label}
                </span>

                {/* Cards grid */}
                <div style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))",
                  gap: 12,
                  flex: 1,
                }}>
                  {activeGoal.courses.map((course, index) => {
                    const metrics = HARVEY[course.slug];
                    return (
                      <div
                        key={course.slug}
                        ref={index === 0 ? (el) => { firstCardRef.current = el; } : undefined}
                      >
                        <CourseCard
                          course={course}
                          index={index}
                          metrics={metrics}
                        />
                      </div>
                    );
                  })}
                </div>

                <SuggestedPlan goal={activeGoal} />
              </div>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

// ─── Goal item ────────────────────────────────────────────────────────────────

function GoalItem({
  label, isActive, onClick, refCallback,
}: {
  label: string;
  isActive: boolean;
  onClick: () => void;
  refCallback: (el: HTMLDivElement | null) => void;
}) {
  const [hovered, setHovered] = useState(false);

  const bg     = isActive ? "#0D9488" : hovered ? "#F0FDFA" : "#FFFFFF";
  const border = isActive ? "#0D9488" : hovered ? "#99F6E4" : "#E5E7EB";
  const color  = isActive ? "#FFFFFF" : "#374151";
  const iconC  = isActive ? "#FFFFFF" : "#9CA3AF";

  return (
    <div
      ref={refCallback}
      onClick={onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", alignItems: "center", gap: 10,
        padding: "10px 14px",
        borderRadius: 8,
        background: bg,
        border: `1px solid ${border}`,
        fontSize: 13, fontWeight: isActive ? 600 : 500,
        color,
        cursor: "pointer",
        transition: "all 150ms",
      }}
    >
      {/* Chevron right */}
      <svg width={16} height={16} viewBox="0 0 24 24" fill="none"
        stroke={iconC} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round"
        style={{ flexShrink: 0 }} aria-hidden="true"
      >
        <path d="M9 5l7 7-7 7" />
      </svg>
      <span style={{ lineHeight: "1.3" }}>{label}</span>
    </div>
  );
}

// ─── Course card ──────────────────────────────────────────────────────────────

function CourseCard({
  course, index, metrics,
}: {
  course: { title: string; slug: string; reason: string };
  index: number;
  metrics?: { depth: HBValue; priority: HBValue };
}) {
  const [hovered, setHovered] = useState(false);

  return (
    <Link
      href={`/courses/${course.slug}`}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      style={{
        display: "flex", flexDirection: "column",
        background: "#FFFFFF",
        border: `1px solid ${hovered ? "#D1D5DB" : "#E5E7EB"}`,
        borderRadius: 8,
        padding: 16,
        textDecoration: "none",
        transition: "border-color 150ms",
        height: "100%",
      }}
    >
      {/* Index badge + title row */}
      <div style={{ display: "flex", alignItems: "flex-start", gap: 8, marginBottom: 8 }}>
        <span style={{
          width: 20, height: 20, borderRadius: "50%",
          background: index === 0 ? "#0D9488" : "#EDE9FE",
          color: index === 0 ? "#FFFFFF" : "#7C3AED",
          fontSize: 11, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center",
          flexShrink: 0, marginTop: 1,
        }}>
          {index + 1}
        </span>
        <span style={{ fontSize: 14, fontWeight: 600, color: "#111827", lineHeight: 1.4, flex: 1 }}>
          {course.title}
        </span>
      </div>

      {/* Description */}
      <p style={{ fontSize: 13, color: "#6B7280", lineHeight: 1.5, flex: 1, marginBottom: 12 }}>
        {course.reason}
      </p>

      {/* Harvey Ball metrics */}
      {metrics && (
        <div style={{ display: "flex", gap: 12, alignItems: "center", marginTop: "auto" }}>
          {/* Depth */}
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{
              background: "#EDE9FE", color: "#7C3AED",
              fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
            }}>
              DEPTH
            </span>
            <HarveyBall value={metrics.depth} id={`${course.slug}-depth`} size={16} />
          </span>
          {/* Priority */}
          <span style={{ display: "flex", gap: 4, alignItems: "center" }}>
            <span style={{
              background: "#CCFBF1", color: "#0D9488",
              fontSize: 10, fontWeight: 600, padding: "2px 6px", borderRadius: 4,
            }}>
              PRIORITY
            </span>
            <HarveyBall value={metrics.priority} id={`${course.slug}-priority`} size={16} />
          </span>
        </div>
      )}
    </Link>
  );
}

// ─── Suggested plan bar ───────────────────────────────────────────────────────

function SuggestedPlan({ goal }: { goal: Goal }) {
  return (
    <p style={{ marginTop: 12, fontSize: 12, color: "#6B7280" }}>
      Suggested plan based on your selection —{" "}
      <Link href="/pricing" style={{ color: "#0D9488", textDecoration: "none" }}>
        see pricing →
      </Link>
    </p>
  );
}

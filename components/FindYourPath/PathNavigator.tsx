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

function HarveyBall({ value, size = 14 }: { value: HBValue; size?: number }) {
  const R = size / 2 - 0.8;
  const cx = size / 2;
  const cy = size / 2;

  if (value === "low") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={R} stroke="#1E1245" strokeWidth="1.2" fill="none" />
      </svg>
    );
  }
  if (value === "high") {
    return (
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
        <circle cx={cx} cy={cy} r={R} stroke="#1E1245" strokeWidth="1.2" fill="#1E1245" />
      </svg>
    );
  }

  // 25% or 50% pie fill, clockwise from 12-o'clock
  const pct = value === "medium-low" ? 0.25 : 0.5;
  const angle = pct * 2 * Math.PI;
  const endX = cx + R * Math.sin(angle);
  const endY = cy - R * Math.cos(angle);
  const largeArc = pct > 0.5 ? 1 : 0;
  const slice = `M ${cx} ${cy} L ${cx} ${cy - R} A ${R} ${R} 0 ${largeArc} 1 ${endX} ${endY} Z`;

  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`} aria-hidden="true">
      <circle cx={cx} cy={cy} r={R} stroke="#1E1245" strokeWidth="1.2" fill="none" />
      <path d={slice} fill="#1E1245" />
    </svg>
  );
}

// ─── Persona icons ────────────────────────────────────────────────────────────

function PersonaIcon({ personaKey }: { personaKey: string }) {
  const p: React.SVGProps<SVGSVGElement> = {
    width: 18, height: 18, viewBox: "0 0 18 18", fill: "none",
    "aria-hidden": "true" as unknown as boolean,
  };
  switch (personaKey) {
    case "fresh_grad":
      return (
        <svg {...p}>
          <polygon points="9,2 1,6.5 9,11 17,6.5" fill="currentColor" opacity="0.85" />
          <path d="M5 9.5v3c0 .9 1.8 1.5 4 1.5s4-.6 4-1.5V9.5" fill="currentColor" opacity="0.55" />
          <line x1="17" y1="6.5" x2="17" y2="11.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
        </svg>
      );
    case "active_trader":
      return (
        <svg {...p}>
          <polyline points="2,14 6,9 10,11 16,4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
          <polyline points="13,4 16,4 16,7" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      );
    case "salaried_pro":
      return (
        <svg {...p}>
          <rect x="2" y="7" width="14" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.3" />
          <path d="M6 7V5.5A1.5 1.5 0 017.5 4h3A1.5 1.5 0 0112 5.5V7" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2" y1="11" x2="16" y2="11" stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
    case "finance_student":
      return (
        <svg {...p}>
          <path d="M2 4h6c.55 0 1 .45 1 1v10c0-.55-.45-1-1-1H2V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
          <path d="M16 4h-6c-.55 0-1 .45-1 1v10c0-.55.45-1 1-1h6V4z" stroke="currentColor" strokeWidth="1.3" strokeLinejoin="round" />
        </svg>
      );
    case "business_owner":
      return (
        <svg {...p}>
          <rect x="2" y="5" width="14" height="11" rx="1" stroke="currentColor" strokeWidth="1.3" />
          <line x1="2" y1="9" x2="16" y2="9" stroke="currentColor" strokeWidth="1.3" />
          <rect x="5" y="11.5" width="3" height="4.5" stroke="currentColor" strokeWidth="1" />
          <rect x="10" y="11.5" width="3" height="4.5" stroke="currentColor" strokeWidth="1" />
          <path d="M6 5V3.5C6 2.7 7 2 9 2s3 .7 3 1.5V5" stroke="currentColor" strokeWidth="1.2" />
        </svg>
      );
    case "hni":
      return (
        <svg {...p}>
          <path d="M9 2L3.5 7H14.5L9 2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" opacity="0.2" />
          <path d="M3.5 7L6 16h6l2.5-9H3.5z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" fill="currentColor" opacity="0.1" />
          <line x1="3.5" y1="7" x2="14.5" y2="7" stroke="currentColor" strokeWidth="1" />
        </svg>
      );
    case "retiree":
      return (
        <svg {...p}>
          <path d="M3 9C3 5.7 5.7 3 9 3s6 2.7 6 6H3z" stroke="currentColor" strokeWidth="1.3" />
          <line x1="9" y1="9" x2="9" y2="14" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
          <path d="M9 14c0 1.2-1.5 1.5-1.5 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round" />
        </svg>
      );
    default:
      return (
        <svg {...p}>
          <circle cx={9} cy={9} r={6} stroke="currentColor" strokeWidth="1.3" />
        </svg>
      );
  }
}

// ─── Plan bar ─────────────────────────────────────────────────────────────────

function PlanBar({ goal }: { goal: Goal }) {
  return (
    <div className="bg-[#1E1245] px-4 py-3 flex flex-row items-center gap-2 flex-wrap flex-shrink-0">
      <span className="text-[10px] uppercase tracking-[0.1em] text-white/40 mr-2 flex-shrink-0">
        SUGGESTED PLAN
      </span>
      {goal.suggestedLearn && (
        <span className="text-white text-[11px] px-3 py-1 rounded-full bg-[rgba(255,255,255,0.12)]">
          {goal.suggestedLearn}
        </span>
      )}
      <span className="text-white text-[11px] px-3 py-1 rounded-full bg-[#D4860A]">
        {goal.suggestedResearch}
      </span>
      {goal.suggestedSession && (
        <span className="text-[#FAC775] text-[11px] px-3 py-1 rounded-full bg-[rgba(212,134,10,0.2)]">
          {goal.suggestedSession}
        </span>
      )}
      <Link
        href="/pricing"
        className="text-[11px] text-white/50 hover:text-white transition-colors ml-auto"
      >
        See pricing →
      </Link>
    </div>
  );
}

// ─── Harvey Ball legend data ───────────────────────────────────────────────────

const HB_LEGEND: { value: HBValue; label: string }[] = [
  { value: "low",         label: "Low"         },
  { value: "medium-low",  label: "Medium-Low"  },
  { value: "medium-high", label: "Medium-High" },
  { value: "high",        label: "High"        },
];

// ─── PathNavigator ────────────────────────────────────────────────────────────

export function PathNavigator() {
  const [activePersonaKey, setActivePersonaKey] = useState<string | null>(null);
  const [activeGoalIndex, setActiveGoalIndex] = useState<number | null>(null);
  const [connector, setConnector] = useState<ConnectorState>(null);

  const containerRef  = useRef<HTMLDivElement>(null);
  const personaRefs   = useRef<Record<string, HTMLDivElement | null>>({});
  const goalRefs      = useRef<(HTMLDivElement | null)[]>([]);
  const firstCardRef  = useRef<HTMLDivElement | null>(null);

  const activePersona =
    personas.find((p) => p.key === activePersonaKey) ?? null;
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

    const cRect  = containerRef.current.getBoundingClientRect();
    const pEl    = personaRefs.current[activePersonaKey];
    const gEl    = goalRefs.current[activeGoalIndex];

    if (!pEl || !gEl) { setConnector(null); return; }

    const pRect  = pEl.getBoundingClientRect();
    const gRect  = gEl.getBoundingClientRect();

    const A = {
      x: pRect.right  - cRect.left,
      y: pRect.top    + pRect.height / 2 - cRect.top,
    };
    const B = {
      x: gRect.left   - cRect.left,
      y: gRect.top    + gRect.height / 2 - cRect.top,
    };

    let C: { x: number; y: number } | null = null;
    if (firstCardRef.current) {
      const fc = firstCardRef.current.getBoundingClientRect();
      C = {
        x: fc.left - cRect.left,
        y: fc.top  + fc.height / 2 - cRect.top,
      };
    }

    // Single continuous cubic bezier A → B → C
    const AB =
      `C ${A.x + 60} ${A.y}, ${B.x - 60} ${B.y}, ${B.x} ${B.y}`;
    const BC = C
      ? ` C ${B.x + 60} ${B.y}, ${C.x - 60} ${C.y}, ${C.x} ${C.y}`
      : "";

    setConnector({ d: `M ${A.x} ${A.y} ${AB}${BC}`, A, B, C });
  }, [activePersonaKey, activeGoalIndex]);

  useEffect(() => {
    const t = setTimeout(updateConnector, 40);
    return () => clearTimeout(t);
  }, [updateConnector]);

  useEffect(() => {
    window.addEventListener("resize", updateConnector);
    return () => window.removeEventListener("resize", updateConnector);
  }, [updateConnector]);

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <section className="bg-[#FAFAF7] py-20 px-4">

      {/* Section heading */}
      <div className="max-w-5xl mx-auto mb-8">
        <p className="text-[11px] uppercase tracking-[0.12em] font-medium text-[#8B7BAB] mb-2">
          FIND YOUR PATH
        </p>
        <h2 className="text-[28px] font-semibold text-[#1E1245] mb-1.5">
          Where do you start?
        </h2>
        <p className="text-sm text-[#6B7280]">
          Select who you are, then your goal. We&apos;ll map your learning path.
        </p>
      </div>

      {/* Harvey Ball legend */}
      <div className="max-w-5xl mx-auto mb-4 flex items-center gap-4 flex-wrap">
        <span className="text-[11px] font-medium text-[#1E1245] mr-2">HARVEY BALLS —</span>
        {HB_LEGEND.map(({ value, label }) => (
          <span key={value} className="flex items-center gap-1.5">
            <HarveyBall value={value} size={12} />
            <span className="text-[10px] uppercase tracking-wider text-[#8B7BAB]">{label}</span>
          </span>
        ))}
      </div>

      {/* Horizontal scroll on very narrow screens */}
      <div className="max-w-5xl mx-auto overflow-x-auto">
        <div
          ref={containerRef}
          className="relative overflow-hidden rounded-2xl bg-white border border-[rgba(124,58,237,0.15)] grid grid-cols-1 md:grid-cols-[200px_240px_1fr] md:min-h-[480px]"
        >
          {/* ── SVG connector (desktop only) ── */}
          {connector && (
            <>
              <style>{`
                @keyframes tcg-path-draw {
                  from { stroke-dashoffset: 900; opacity: 0; }
                  to   { stroke-dashoffset: 0;   opacity: 0.75; }
                }
                .tcg-path { stroke-dasharray: 900; animation: tcg-path-draw 0.4s ease forwards; }
              `}</style>
              <svg
                aria-hidden="true"
                className="hidden md:block"
                style={{
                  position: "absolute", top: 0, left: 0,
                  width: "100%", height: "100%",
                  pointerEvents: "none", zIndex: 10, overflow: "visible",
                }}
              >
                <path
                  key={connector.d}
                  d={connector.d}
                  stroke="#D4860A"
                  strokeWidth="1.5"
                  fill="none"
                  className="tcg-path"
                />
                <circle cx={connector.A.x} cy={connector.A.y} r={4} fill="#D4860A" />
                <circle cx={connector.B.x} cy={connector.B.y} r={4} fill="#D4860A" />
                {connector.C && (
                  <circle cx={connector.C.x} cy={connector.C.y} r={4} fill="#D4860A" />
                )}
              </svg>
            </>
          )}

          {/* ─────────────── Column 1: Who are you? ─────────────── */}
          <div className="flex flex-col bg-[#FAFAF7] border-b md:border-b-0 md:border-r border-[rgba(124,58,237,0.12)]">
            <div className="py-3.5 px-4 border-b border-[rgba(124,58,237,0.10)] text-[10px] uppercase tracking-[0.1em] font-semibold text-[#7C3AED] flex-shrink-0">
              WHO ARE YOU
            </div>
            <div className="py-2">
              {personas.map((persona) => {
                const isActive = activePersonaKey === persona.key;
                return (
                  <div
                    key={persona.key}
                    ref={(el) => { personaRefs.current[persona.key] = el; }}
                    onClick={() => selectPersona(persona.key)}
                    className={`flex items-center gap-2.5 mx-2 my-1 px-3.5 py-2.5 rounded-lg text-[13px] cursor-pointer transition-all duration-150 ${
                      isActive
                        ? "bg-[#1E1245] text-white font-medium"
                        : "text-[#3C3489] hover:bg-[rgba(124,58,237,0.08)]"
                    }`}
                  >
                    <span className="flex-shrink-0 opacity-80">
                      <PersonaIcon personaKey={persona.key} />
                    </span>
                    <span className="leading-snug">{persona.label}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* ─────────────── Column 2: Your goal ─────────────── */}
          <div
            className={`flex flex-col bg-white border-b md:border-b-0 md:border-r border-[rgba(124,58,237,0.12)] ${
              !activePersona ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="py-3.5 px-4 border-b border-[rgba(30,18,69,0.08)] text-[10px] uppercase tracking-[0.1em] font-semibold text-[#D4860A] flex-shrink-0">
              YOUR GOAL
            </div>
            {!activePersona ? (
              <div className="flex-1 flex items-center justify-center py-12 px-4 text-[13px] text-[#C4B8E0] text-center">
                ← Select who you are
              </div>
            ) : (
              <div className="py-2">
                {activePersona.goals.map((goal, i) => {
                  const isActive = activeGoalIndex === i;
                  return (
                    <div
                      key={i}
                      ref={(el) => { goalRefs.current[i] = el; }}
                      onClick={() => selectGoal(i)}
                      className={`flex items-start gap-2 mx-2 my-1 px-3.5 py-2.5 rounded-lg text-[13px] cursor-pointer border transition-all duration-150 ${
                        isActive
                          ? "bg-[#D4860A] text-white border-[#D4860A] font-medium"
                          : "text-[#1E1245] border-[rgba(30,18,69,0.10)] hover:border-[rgba(30,18,69,0.25)]"
                      }`}
                    >
                      <span
                        className={`flex-shrink-0 mt-0.5 text-[14px] leading-none ${
                          isActive ? "text-white" : "text-[#C4B8E0]"
                        }`}
                      >
                        ›
                      </span>
                      <span className="leading-snug">{goal.label}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ─────────────── Column 3: Learning path ─────────────── */}
          <div
            className={`flex flex-col bg-[#FAFAF7] ${
              !activeGoal ? "hidden md:flex" : "flex"
            }`}
          >
            <div className="py-3.5 px-4 border-b border-[rgba(30,18,69,0.08)] text-[10px] uppercase tracking-[0.1em] font-semibold text-[#1E1245] flex-shrink-0">
              YOUR LEARNING PATH
            </div>

            {!activeGoal ? (
              <div className="flex-1 flex items-center justify-center py-12 px-4 text-[13px] text-[#C4B8E0] text-center">
                ← Select your goal to see your path
              </div>
            ) : activeGoal.courses.length === 0 ? (
              /* HNI / no-courses case */
              <>
                <div className="flex-1 p-4">
                  <div
                    className="bg-[#F3F0FF] rounded-lg px-5 py-4 text-[13px] text-[#1E1245] leading-relaxed"
                    style={{ borderLeft: "3px solid #1E1245" }}
                  >
                    At your level, courses are secondary. Your path starts with research.
                  </div>
                </div>
                <PlanBar goal={activeGoal} />
              </>
            ) : (
              /* Course cards */
              <>
                <div className="flex-1 flex flex-col gap-3 px-4 py-4">
                  {activeGoal.courses.map((course, index) => {
                    const metrics = HARVEY[course.slug];
                    return (
                      <div
                        key={course.slug}
                        id={index === 0 ? "first-course-card" : undefined}
                        ref={index === 0 ? (el) => { firstCardRef.current = el; } : undefined}
                      >
                        <Link
                          href={`/courses/${course.slug}`}
                          className="block bg-white border border-[rgba(30,18,69,0.12)] rounded-[10px] p-[14px] hover:border-[rgba(30,18,69,0.3)] hover:shadow-[0_2px_8px_rgba(30,18,69,0.08)] transition-all duration-150"
                        >
                          {/* Top row: badge + title + START HERE */}
                          <div className="flex items-start gap-2">
                            <div className="w-5 h-5 rounded-full bg-[#1E1245] text-white text-[11px] font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                              {index + 1}
                            </div>
                            <span className="text-[13px] font-semibold text-[#1E1245] leading-snug flex-1">
                              {course.title}
                            </span>
                            {index === 0 && (
                              <span className="ml-auto text-[10px] uppercase tracking-wide bg-[#D4860A] text-white px-2 py-0.5 rounded-full flex-shrink-0">
                                START HERE
                              </span>
                            )}
                          </div>

                          {/* Reason */}
                          <p className="text-[12px] text-[#6B7280] leading-relaxed mt-2 pl-7">
                            {course.reason}
                          </p>

                          {/* Harvey Ball metrics */}
                          {metrics && (
                            <div className="flex items-center gap-4 mt-2 pl-7">
                              <span className="flex items-center gap-1.5">
                                <HarveyBall value={metrics.depth} size={13} />
                                <span className="text-[10px] uppercase tracking-wider text-[#8B7BAB]">
                                  Depth
                                </span>
                              </span>
                              <span className="flex items-center gap-1.5">
                                <HarveyBall value={metrics.priority} size={13} />
                                <span className="text-[10px] uppercase tracking-wider text-[#8B7BAB]">
                                  Priority
                                </span>
                              </span>
                            </div>
                          )}

                          {/* Start → */}
                          <div className="text-right mt-3">
                            <span className="text-[11px] text-[#D4860A] font-medium">
                              Start →
                            </span>
                          </div>
                        </Link>
                      </div>
                    );
                  })}
                </div>

                <PlanBar goal={activeGoal} />
              </>
            )}
          </div>

        </div>
      </div>
    </section>
  );
}

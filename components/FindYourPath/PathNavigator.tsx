"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import { personas, type Goal } from "@/lib/findYourPath/pathData";

// ─── Types ────────────────────────────────────────────────────────────────────

type ConnectorPath = {
  d: string;
  fromX: number;
  fromY: number;
  toX: number;
  toY: number;
};

type PathsState = {
  p1: ConnectorPath | null;
  p2: ConnectorPath | null;
};

// ─── Plan bar ─────────────────────────────────────────────────────────────────

function PlanBar({ goal }: { goal: Goal }) {
  return (
    <div className="bg-[#1E1245] px-5 py-3 flex flex-row items-center gap-2 flex-wrap">
      <span className="text-[10px] uppercase tracking-widest text-white/50 mr-2 flex-shrink-0">
        SUGGESTED
      </span>
      {goal.suggestedLearn && (
        <span className="text-white text-xs px-3 py-1 rounded-full bg-[rgba(255,255,255,0.12)]">
          {goal.suggestedLearn}
        </span>
      )}
      <span className="bg-[#D4860A] text-white text-xs px-3 py-1 rounded-full">
        {goal.suggestedResearch}
      </span>
      {goal.suggestedSession && (
        <span className="text-[#FAC775] text-xs px-3 py-1 rounded-full bg-[rgba(212,134,10,0.25)]">
          {goal.suggestedSession}
        </span>
      )}
      <Link
        href="/pricing"
        className="text-xs text-white/60 hover:text-white transition-colors ml-auto"
      >
        View pricing →
      </Link>
    </div>
  );
}

// ─── Navigator ────────────────────────────────────────────────────────────────

export function PathNavigator() {
  const [activePersonaKey, setActivePersonaKey] = useState<string | null>(null);
  const [activeGoalIndex, setActiveGoalIndex] = useState<number | null>(null);
  const [paths, setPaths] = useState<PathsState>({ p1: null, p2: null });

  const containerRef = useRef<HTMLDivElement>(null);

  const activePersona = personas.find((p) => p.key === activePersonaKey) ?? null;
  const activeGoal =
    activePersona && activeGoalIndex !== null
      ? (activePersona.goals[activeGoalIndex] ?? null)
      : null;

  function handlePersonaSelect(key: string) {
    setActivePersonaKey(key);
    setActiveGoalIndex(null);
  }

  function handleGoalSelect(index: number) {
    setActiveGoalIndex(index);
  }

  const updateConnectors = useCallback(() => {
    if (!containerRef.current || !activePersonaKey) {
      setPaths({ p1: null, p2: null });
      return;
    }

    const container = containerRef.current;
    const cRect = container.getBoundingClientRect();

    const personaEl = document.getElementById(`persona-${activePersonaKey}`);
    if (!personaEl) return;

    const pRect = personaEl.getBoundingClientRect();
    const pFromX = pRect.right - cRect.left;
    const pFromY = pRect.top + pRect.height / 2 - cRect.top;

    if (activeGoalIndex === null) {
      setPaths({ p1: null, p2: null });
      return;
    }

    const goalEl = document.getElementById(`goal-${activePersonaKey}-${activeGoalIndex}`);
    if (!goalEl) {
      setPaths({ p1: null, p2: null });
      return;
    }

    const gRect = goalEl.getBoundingClientRect();
    const gToX = gRect.left - cRect.left;
    const gToY = gRect.top + gRect.height / 2 - cRect.top;
    const midX1 = (pFromX + gToX) / 2;
    const p1d = `M ${pFromX} ${pFromY} C ${midX1} ${pFromY}, ${midX1} ${gToY}, ${gToX} ${gToY}`;

    const gFromX = gRect.right - cRect.left;
    const gFromY = gRect.top + gRect.height / 2 - cRect.top;

    const courseEl = document.getElementById("first-course-card");
    let p2: ConnectorPath | null = null;

    if (courseEl) {
      const crect = courseEl.getBoundingClientRect();
      const cToX = crect.left - cRect.left;
      const cToY = crect.top + crect.height / 2 - cRect.top;
      const midX2 = (gFromX + cToX) / 2;
      const p2d = `M ${gFromX} ${gFromY} C ${midX2} ${gFromY}, ${midX2} ${cToY}, ${cToX} ${cToY}`;
      p2 = { d: p2d, fromX: gFromX, fromY: gFromY, toX: cToX, toY: cToY };
    }

    setPaths({
      p1: { d: p1d, fromX: pFromX, fromY: pFromY, toX: gToX, toY: gToY },
      p2,
    });
  }, [activePersonaKey, activeGoalIndex]);

  // Re-run after DOM settles on selection change
  useEffect(() => {
    const t = setTimeout(updateConnectors, 40);
    return () => clearTimeout(t);
  }, [updateConnectors]);

  // Re-run on resize
  useEffect(() => {
    window.addEventListener("resize", updateConnectors);
    return () => window.removeEventListener("resize", updateConnectors);
  }, [updateConnectors]);

  const hasPaths = paths.p1 !== null || paths.p2 !== null;

  return (
    <section className="bg-[#FAFAF7] py-20 px-4">
      {/* Section heading */}
      <div className="max-w-5xl mx-auto mb-10">
        <p className="text-xs uppercase tracking-widest text-[#8B7BAB] mb-2">
          FIND YOUR PATH
        </p>
        <h2 className="text-3xl font-semibold text-[#1E1245] mb-2">
          Where do you start?
        </h2>
        <p className="text-base text-[#6B7280] max-w-xl">
          Select who you are, then your goal. We&apos;ll show you exactly what to learn
          and in what order.
        </p>
      </div>

      {/* Horizontal scroll wrapper for narrow viewports */}
      <div className="max-w-5xl mx-auto overflow-x-auto">
        <div
          ref={containerRef}
          className="relative rounded-2xl overflow-hidden border border-[rgba(30,18,69,0.12)] bg-white min-w-[680px]"
          style={{ display: "grid", gridTemplateColumns: "220px 240px 1fr" }}
        >
          {/* ── SVG connector overlay ── */}
          {hasPaths && (
            <>
              <style>{`
                @keyframes tcg-draw {
                  from { stroke-dashoffset: 800; opacity: 0; }
                  to   { stroke-dashoffset: 0;   opacity: 0.65; }
                }
                .tcg-connector {
                  stroke-dasharray: 800;
                  animation: tcg-draw 0.35s ease forwards;
                }
              `}</style>
              <svg
                aria-hidden="true"
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  width: "100%",
                  height: "100%",
                  pointerEvents: "none",
                  zIndex: 5,
                  overflow: "visible",
                }}
              >
                {paths.p1 && (
                  <>
                    <path
                      key={paths.p1.d}
                      d={paths.p1.d}
                      stroke="#D4860A"
                      strokeWidth="1.5"
                      fill="none"
                      className="tcg-connector"
                    />
                    <circle cx={paths.p1.fromX} cy={paths.p1.fromY} r={4} fill="#D4860A" opacity={0.65} />
                    <circle cx={paths.p1.toX}   cy={paths.p1.toY}   r={4} fill="#D4860A" opacity={0.65} />
                  </>
                )}
                {paths.p2 && (
                  <>
                    <path
                      key={paths.p2.d}
                      d={paths.p2.d}
                      stroke="#D4860A"
                      strokeWidth="1.5"
                      fill="none"
                      className="tcg-connector"
                    />
                    <circle cx={paths.p2.fromX} cy={paths.p2.fromY} r={4} fill="#D4860A" opacity={0.65} />
                    <circle cx={paths.p2.toX}   cy={paths.p2.toY}   r={4} fill="#D4860A" opacity={0.65} />
                  </>
                )}
              </svg>
            </>
          )}

          {/* ── Column 1: Who are you? ── */}
          <div className="flex flex-col border-r border-[rgba(30,18,69,0.12)]">
            <div className="py-3 px-5 bg-[#F7F5FF] border-b border-[rgba(30,18,69,0.08)] text-xs font-bold text-[#8B7BAB] tracking-widest uppercase flex-shrink-0">
              Who are you?
            </div>
            {personas.map((persona) => {
              const isActive = activePersonaKey === persona.key;
              return (
                <div
                  key={persona.key}
                  id={`persona-${persona.key}`}
                  data-persona-key={persona.key}
                  onClick={() => handlePersonaSelect(persona.key)}
                  className={`relative py-4 px-5 text-sm cursor-pointer border-b border-[rgba(30,18,69,0.06)] last:border-b-0 transition-colors duration-150 leading-snug ${
                    isActive
                      ? "bg-[#1E1245] text-white"
                      : "text-[#1E1245] hover:bg-[#F3F0FF]"
                  }`}
                >
                  {persona.label}
                  {/* Arrow pointing into column 2 */}
                  {isActive && (
                    <div
                      aria-hidden="true"
                      style={{
                        position: "absolute",
                        right: "-12px",
                        top: "50%",
                        transform: "translateY(-50%)",
                        width: "12px",
                        height: "24px",
                        clipPath: "polygon(0 0, 100% 50%, 0 100%)",
                        background: "#1E1245",
                        zIndex: 10,
                      }}
                    />
                  )}
                </div>
              );
            })}
          </div>

          {/* ── Column 2: Your goal ── */}
          <div className="flex flex-col border-r border-[rgba(30,18,69,0.12)]">
            <div className="py-3 px-5 bg-[#F7F5FF] border-b border-[rgba(30,18,69,0.08)] text-xs font-bold text-[#8B7BAB] tracking-widest uppercase flex-shrink-0">
              Your goal
            </div>
            {!activePersona ? (
              <div className="flex-1 flex items-center justify-center py-8 px-5 text-sm text-[#8B7BAB] text-center">
                Select who you are first
              </div>
            ) : (
              activePersona.goals.map((goal, i) => {
                const isActive = activeGoalIndex === i;
                return (
                  <div
                    key={i}
                    id={`goal-${activePersonaKey}-${i}`}
                    onClick={() => handleGoalSelect(i)}
                    style={{
                      borderLeft: isActive
                        ? "3px solid #D4860A"
                        : "3px solid transparent",
                    }}
                    className={`py-4 pr-5 pl-4 text-sm cursor-pointer border-b border-[rgba(30,18,69,0.06)] last:border-b-0 transition-all duration-150 leading-snug ${
                      isActive
                        ? "bg-[#FFF8EE] font-medium text-[#1E1245]"
                        : "text-[#1E1245] hover:bg-[#F3F0FF]"
                    }`}
                  >
                    {goal.label}
                  </div>
                );
              })
            )}
          </div>

          {/* ── Column 3: Learning path ── */}
          <div className="flex flex-col">
            <div className="py-3 px-5 bg-[#F7F5FF] border-b border-[rgba(30,18,69,0.08)] text-xs font-bold text-[#8B7BAB] tracking-widest uppercase flex-shrink-0">
              Your learning path
            </div>

            {!activeGoal ? (
              <div className="flex-1 bg-[#FAFAF7] flex items-center justify-center py-10 px-5 text-sm text-[#8B7BAB] text-center">
                Select your goal to see your path
              </div>
            ) : activeGoal.courses.length === 0 ? (
              <>
                <div className="flex-1 bg-[#FAFAF7] p-4">
                  <div
                    style={{ borderLeft: "3px solid #1E1245" }}
                    className="bg-[#F3F0FF] rounded-lg px-5 py-4 text-sm text-[#1E1245] leading-relaxed"
                  >
                    At your level, courses are optional. Jump straight to research.
                  </div>
                </div>
                <PlanBar goal={activeGoal} />
              </>
            ) : (
              <>
                <div className="flex-1 bg-[#FAFAF7] p-4 flex flex-col gap-3">
                  {activeGoal.courses.map((course, index) => (
                    <Link
                      key={course.slug}
                      href={`/courses/${course.slug}`}
                      id={index === 0 ? "first-course-card" : undefined}
                      className="block bg-white border border-[rgba(30,18,69,0.10)] rounded-xl px-4 py-4 hover:border-[rgba(30,18,69,0.25)] hover:shadow-sm transition-all"
                    >
                      <div className="flex items-start gap-3 mb-2">
                        <div className="w-[22px] h-[22px] rounded-full bg-[#1E1245] text-white text-xs font-medium flex items-center justify-center flex-shrink-0 mt-0.5">
                          {index + 1}
                        </div>
                        <div className="text-sm font-semibold text-[#1E1245] leading-snug flex-1">
                          {course.title}
                        </div>
                        {index === 0 && (
                          <span className="text-[10px] uppercase tracking-wider bg-[#D4860A] text-white px-2 py-0.5 rounded-full flex-shrink-0">
                            START HERE
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-[#6B7280] leading-relaxed ml-[34px]">
                        {course.reason}
                      </p>
                      <div className="text-right mt-2">
                        <span className="text-xs text-[#D4860A] font-medium">
                          Start →
                        </span>
                      </div>
                    </Link>
                  ))}
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

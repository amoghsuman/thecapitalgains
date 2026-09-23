"use client";

export const dynamic = "force-dynamic";

import { useState, useEffect, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { PortableText, type PortableTextComponents } from "@portabletext/react";
import katex from "katex";
import { getFullCourseForReader, getLessonBySlug } from "@/lib/sanity/queries";
import { createClient } from "@/lib/supabase/client";
import { canAccessLesson, lessonLockReason } from "@/lib/access";
import ChartBlock from "@/components/lesson/ChartBlock";
import PayoffDiagramBlock from "@/components/lesson/PayoffDiagramBlock";
import CalculatorBlock from "@/components/lesson/CalculatorBlock";
import GlossaryTerm from "@/components/lesson/GlossaryTerm";
import CollapsibleBlock from "@/components/lesson/CollapsibleBlock";
import CandlestickChartBlock from "@/components/lesson/CandlestickChartBlock";
import DonutChartBlock from "@/components/lesson/DonutChartBlock";
import CodeBlock from "@/components/lesson/CodeBlock";
import TimelineBlock from "@/components/lesson/TimelineBlock";
import AnnotatedImageBlock from "@/components/lesson/AnnotatedImageBlock";
import ComparisonBlock from "@/components/lesson/ComparisonBlock";
import FlashcardSetBlock from "@/components/lesson/FlashcardSetBlock";
import ToolLinkBlock from "@/components/lesson/ToolLinkBlock";
import BigIdeaBlock from "@/components/lesson/BigIdeaBlock";
import KeyTakeawaysBlock from "@/components/lesson/KeyTakeawaysBlock";
import confetti from "canvas-confetti";
import { Printer, Sparkles } from "lucide-react";
import { TUTOR_ENABLED } from "@/lib/ai/flags";

// ─── Types ────────────────────────────────────────────────────────────────────

type LessonMeta = { slug: string; title: string; duration: string; isFree: boolean };
type Chapter = { title: string; lessons: LessonMeta[] };
type CourseData = { title: string; price: number; slug: string; accessLevel?: string; chapters: Chapter[] };
type LessonData = { title: string; slug: string; duration: string; isFree: boolean; body: any[] };

// The `duration` field is inconsistent across existing content: older
// lessons store a bare "X min", newer ones (from create-course-structure.mjs)
// already store the full "X min read". Appending " read" unconditionally —
// what both the header and sidebar used to do in different ways — produces
// "X min read read" for the latter. Normalize once here instead of assuming
// either format, so both the header and sidebar always render the same
// single, correct "X min read" regardless of which pipeline authored it.
function formatDuration(duration: string | null | undefined): string {
  if (!duration) return "";
  return /read\s*$/i.test(duration.trim()) ? duration.trim() : `${duration.trim()} read`;
}

// ─── Exercise Block (own checkbox state) ─────────────────────────────────────

function ExerciseBlock({ title, steps }: { title: string; steps: string[] }) {
  const [checked, setChecked] = useState<Set<number>>(new Set());

  function toggle(i: number) {
    setChecked((prev) => {
      const next = new Set(prev);
      next.has(i) ? next.delete(i) : next.add(i);
      return next;
    });
  }

  const allDone = checked.size === steps.length;

  return (
    <div className="rounded-xl p-6 mt-8 border-l-4 border-forest bg-forest-surface">
      <div className={`flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase mb-4 ${allDone ? "text-forest" : "text-ink"}`}>
        <span className="text-[13px] leading-none">☑</span> Exercise · {title}
      </div>
      <div className="flex flex-col gap-3">
        {steps.map((step, i) => (
          <label key={i} className="flex items-start gap-3 cursor-pointer group">
            <div
              onClick={() => toggle(i)}
              className={`mt-0.5 w-5 h-5 flex-shrink-0 rounded border-2 flex items-center justify-center transition-all ${
                checked.has(i)
                  ? "border-forest bg-forest"
                  : "border-hairline group-hover:border-gold"
              }`}
            >
              {checked.has(i) && (
                <span className="text-white text-[11px] leading-none">✓</span>
              )}
            </div>
            <span
              onClick={() => toggle(i)}
              className={`text-[14px] leading-relaxed select-none ${
                checked.has(i) ? "text-ink-dim/60 line-through" : "text-ink-dim"
              }`}
            >
              {step}
            </span>
          </label>
        ))}
      </div>
      {allDone && (
        <div className="mt-4 font-mono text-[12px] text-forest font-medium">
          ✓ Exercise complete, move on to the next lesson
        </div>
      )}
    </div>
  );
}

// ─── Scenario Exercise (revealable model answer) ─────────────────────────────

function ScenarioExercise({
  title,
  scenario,
  prompt,
  modelAnswer,
}: {
  title: string;
  scenario: string;
  prompt?: string;
  modelAnswer: string;
}) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="rounded-xl p-6 mt-8 border-l-4 border-gold bg-gold-surface">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase mb-4 text-gold-text">
        <span className="text-[13px] leading-none">🎯</span> Scenario · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4">{scenario}</p>
      {prompt && (
        <p className="text-[15px] text-ink-dim italic leading-relaxed mb-5">{prompt}</p>
      )}
      {!revealed ? (
        <button
          onClick={() => setRevealed(true)}
          className="bg-forest hover:bg-forest-dark text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors"
        >
          Show model answer
        </button>
      ) : (
        <div className="mt-2 border-t border-hairline pt-4">
          <div className="font-mono text-[10px] text-forest tracking-widest uppercase mb-2">
            Model Answer
          </div>
          <p className="text-[14px] text-ink-dim leading-relaxed">{modelAnswer}</p>
        </div>
      )}
    </div>
  );
}

// ─── Quiz Exercise (multiple choice) ──────────────────────────────────────────

function QuizExercise({
  title,
  question,
  options,
  correctIndex,
  explanation,
}: {
  title: string;
  question: string;
  options: string[];
  correctIndex: number;
  explanation?: string;
}) {
  const [selected, setSelected] = useState<number | null>(null);
  const answered = selected !== null;
  const isCorrect = selected === correctIndex;

  return (
    <div className="rounded-xl p-6 mt-8 border-l-4 border-forest bg-ivory">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase mb-4 text-forest">
        <span className="text-[13px] leading-none">❓</span> Quick Check · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4 font-medium">{question}</p>
      <div className="flex flex-col gap-2.5">
        {options.map((opt, i) => {
          const isSelected = selected === i;
          const isThisCorrect = i === correctIndex;
          let stateClasses = "border-hairline hover:border-gold";
          if (answered && isSelected && isThisCorrect) stateClasses = "border-forest bg-forest-surface";
          else if (answered && isSelected && !isThisCorrect) stateClasses = "border-[#DC2626] bg-[#FEF2F2]";
          else if (answered && isThisCorrect) stateClasses = "border-forest";

          return (
            <button
              key={i}
              onClick={() => !answered && setSelected(i)}
              disabled={answered}
              className={`text-left px-4 py-3 rounded-lg border-2 text-[14px] text-ink transition-colors ${stateClasses} ${
                answered ? "cursor-default" : "cursor-pointer"
              }`}
            >
              {opt}
              {answered && isSelected && (isThisCorrect ? " ✓" : " ✗")}
              {answered && !isSelected && isThisCorrect && " ✓"}
            </button>
          );
        })}
      </div>
      {answered && explanation && (
        <div className="mt-4 pt-4 border-t border-hairline">
          <div className={`font-mono text-[10px] tracking-widest uppercase mb-2 ${isCorrect ? "text-forest" : "text-[#DC2626]"}`}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          <p className="text-[14px] text-ink-dim leading-relaxed">{explanation}</p>
        </div>
      )}
    </div>
  );
}

// ─── Fill in the Blank Exercise ───────────────────────────────────────────────

function FillInTheBlankExercise({
  title,
  textWithBlank,
  correctAnswers,
  explanation,
}: {
  title: string;
  textWithBlank: string;
  correctAnswers: string[];
  explanation?: string;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  const normalize = (s: string) => s.trim().toLowerCase();
  const isCorrect = correctAnswers.some((a) => normalize(a) === normalize(value));
  const [before, after] = textWithBlank.split("___");

  return (
    <div className="rounded-xl p-6 mt-8 border-l-4 border-gold bg-ivory">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase mb-4 text-gold-text">
        <span className="text-[13px] leading-none">✏️</span> Fill in the Blank · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4">
        {before}
        <input
          type="text"
          value={value}
          disabled={checked}
          onChange={(e) => setValue(e.target.value)}
          className={`inline-block w-32 mx-1 px-2 py-1 rounded border-2 text-[15px] text-center outline-none ${
            checked ? (isCorrect ? "border-forest bg-forest-surface" : "border-[#DC2626] bg-[#FEF2F2]") : "border-hairline focus:border-gold"
          }`}
        />
        {after}
      </p>
      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          disabled={!value.trim()}
          className="bg-forest hover:bg-forest-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className="pt-2 border-t border-hairline mt-2">
          <div className={`font-mono text-[10px] tracking-widest uppercase mb-2 ${isCorrect ? "text-forest" : "text-[#DC2626]"}`}>
            {isCorrect ? "Correct" : "Not quite"}
          </div>
          {explanation && <p className="text-[14px] text-ink-dim leading-relaxed">{explanation}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Numeric Input Exercise ────────────────────────────────────────────────────

function NumericInputExercise({
  title,
  prompt,
  correctValue,
  tolerance,
  unit,
  explanation,
}: {
  title: string;
  prompt: string;
  correctValue: number;
  tolerance: number;
  unit?: string;
  explanation?: string;
}) {
  const [value, setValue] = useState("");
  const [checked, setChecked] = useState(false);

  const numericValue = Number(value);
  const isCorrect = Number.isFinite(numericValue) && Math.abs(numericValue - correctValue) <= tolerance;

  return (
    <div className="rounded-xl p-6 mt-8 border-l-4 border-ink bg-ivory">
      <div className="flex items-center gap-2 font-mono text-[11px] tracking-widest uppercase mb-4 text-ink">
        <span className="text-[13px] leading-none">🔢</span> Quick Check · {title}
      </div>
      <p className="text-[15px] text-ink leading-relaxed mb-4 font-medium">{prompt}</p>
      <div className="flex items-center gap-2 mb-4">
        {unit && <span className="font-mono text-[14px] text-ink-dim">{unit}</span>}
        <input
          type="number"
          value={value}
          disabled={checked}
          onChange={(e) => setValue(e.target.value)}
          className={`w-40 px-3 py-2 rounded-lg border-2 text-[15px] outline-none ${
            checked ? (isCorrect ? "border-forest bg-forest-surface" : "border-[#DC2626] bg-[#FEF2F2]") : "border-hairline focus:border-gold"
          }`}
        />
      </div>
      {!checked ? (
        <button
          onClick={() => setChecked(true)}
          disabled={value.trim() === ""}
          className="bg-forest hover:bg-forest-dark disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg px-5 py-2.5 text-[13px] font-medium transition-colors"
        >
          Check Answer
        </button>
      ) : (
        <div className="pt-2 border-t border-hairline mt-2">
          <div className={`font-mono text-[10px] tracking-widest uppercase mb-2 ${isCorrect ? "text-forest" : "text-[#DC2626]"}`}>
            {isCorrect ? "Correct" : `Not quite — correct answer: ${unit ?? ""}${correctValue}`}
          </div>
          {explanation && <p className="text-[14px] text-ink-dim leading-relaxed">{explanation}</p>}
        </div>
      )}
    </div>
  );
}

// ─── Table Block ──────────────────────────────────────────────────────────────

// Authors can wrap a cell's text in **like this** to flag it as a key figure
// worth calling out (a negative number, a headline stat) — no schema change,
// it's a plain string convention checked here at render time.
function renderCell(cell: string) {
  const isHighlighted = cell.startsWith("**") && cell.endsWith("**") && cell.length > 4;
  if (!isHighlighted) return cell;
  return (
    <span className="font-bold text-gold-text bg-gold-surface px-1.5 py-0.5 rounded">
      {cell.slice(2, -2)}
    </span>
  );
}

function TableBlock({ value }: { value: { caption?: string; headers?: string[]; rows?: { cells?: string[] }[] } }) {
  const headers = value.headers ?? [];
  const rows = value.rows ?? [];

  // `w-full` on the table forces it to shrink-to-fit the container instead
  // of growing to its natural content width, which is what made a 4+ column
  // table with long cell text clip mid-word: the browser squeezed columns
  // down rather than the wrapper's overflow-x-auto ever getting a chance to
  // scroll. `min-w-full` keeps narrow tables filling the width like before,
  // while letting wide ones grow past the container so they scroll instead
  // of clipping.
  const scrollRef = useRef<HTMLDivElement>(null);
  const [isScrollable, setIsScrollable] = useState(false);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    const check = () => setIsScrollable(el.scrollWidth > el.clientWidth + 1);
    check();
    const ro = new ResizeObserver(check);
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  return (
    <div className="mt-8">
      {value.caption && (
        <p className="font-mono text-[11px] text-ink-dim uppercase tracking-wide mb-2">{value.caption}</p>
      )}
      <div className="relative">
        <div ref={scrollRef} className="overflow-x-auto">
          <table className="min-w-full border-collapse text-[14px]">
            <thead>
              <tr>
                {headers.map((h, i) => (
                  <th
                    key={i}
                    className="text-left font-semibold text-forest bg-forest-surface border border-hairline border-b-2 border-b-forest px-4 py-2.5 whitespace-nowrap"
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, ri) => (
                <tr key={ri} className={ri % 2 === 1 ? "bg-ivory/60" : ""}>
                  {(row.cells ?? []).map((cell, ci) => (
                    <td key={ci} className="text-ink border border-hairline px-4 py-2.5 align-top whitespace-nowrap">
                      {renderCell(cell)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Visible scroll affordance — only shown when the table actually
            overflows, rather than relying on a partially-cut-off column at
            the edge as the only hint there's more content. */}
        {isScrollable && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-0 w-10 bg-gradient-to-l from-ivory to-transparent" />
        )}
      </div>
      {isScrollable && (
        <p className="font-mono text-[10px] text-ink-dim mt-1.5">← Scroll to see all columns →</p>
      )}
    </div>
  );
}

// ─── Stat Grid Block ──────────────────────────────────────────────────────────

function StatGridBlock({ value }: { value: { stats?: { label?: string; value?: string; context?: string }[] } }) {
  const stats = value.stats ?? [];
  const colsClass =
    stats.length >= 4 ? "sm:grid-cols-2 lg:grid-cols-4" : stats.length === 3 ? "sm:grid-cols-3" : "sm:grid-cols-2";

  return (
    <div className={`mt-8 grid grid-cols-1 ${colsClass} gap-4`}>
      {stats.map((s, i) => (
        <div key={i} className="border border-hairline border-t-4 border-t-forest rounded-xl bg-ivory/40 px-5 py-4 flex flex-col gap-1">
          <div className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{s.label}</div>
          <div className="text-[20px] font-bold text-forest leading-tight">{s.value}</div>
          {s.context && <div className="text-[12px] text-ink-dim">{s.context}</div>}
        </div>
      ))}
    </div>
  );
}

// ─── Portable Text Components ─────────────────────────────────────────────────

const portableTextComponents: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <p className="text-[17px] text-ink leading-[1.85] mt-4">{children}</p>
    ),
    h2: ({ children }) => (
      <h2 className="text-[22px] font-bold text-ink mt-10 mb-2 leading-snug">{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className="text-[18px] font-bold text-ink mt-8 mb-2">{children}</h3>
    ),
    blockquote: ({ children }) => (
      <p className="text-[17px] text-ink leading-[1.85] italic border-l-[3px] border-gold pl-5 py-1 mt-4">
        {children}
      </p>
    ),
  },
  list: {
    bullet: ({ children }) => (
      <ul className="flex flex-col gap-2 pl-4 list-disc text-[16px] text-ink mt-4">{children}</ul>
    ),
    number: ({ children }) => (
      <ol className="flex flex-col gap-2 pl-4 list-decimal text-[16px] text-ink mt-4">{children}</ol>
    ),
  },
  listItem: {
    bullet: ({ children }) => <li className="text-[16px] text-ink leading-relaxed">{children}</li>,
    number: ({ children }) => <li className="text-[16px] text-ink leading-relaxed">{children}</li>,
  },
  types: {
    callout: ({ value }: { value: { type?: string; text?: string } }) => {
      if (value.type === "warning") {
        // Cautionary — Gold, distinct from insight's Forest treatment.
        return (
          <div className="mt-8 border-l-4 border-gold bg-gold-surface rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] leading-none">⚠</span>
              <span className="font-mono text-[10px] text-gold-text tracking-widest uppercase">Watch Out</span>
            </div>
            <p className="text-[14px] text-ink leading-relaxed">{value.text}</p>
          </div>
        );
      }
      if (value.type === "disclaimer") {
        // Deliberately neutral — not alarming (warning) or celebratory
        // (insight). Meant to read unmistakably as a compliance/scope note.
        return (
          <div className="mt-8 border-l-4 border-hairline bg-[#F4F3EF] rounded-xl px-5 py-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-[13px] leading-none">ⓘ</span>
              <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">Disclaimer</span>
            </div>
            <p className="text-[14px] text-ink-dim leading-relaxed">{value.text}</p>
          </div>
        );
      }
      // Insight — Forest Green, positive/informative.
      return (
        <div className="mt-8 border-l-4 border-forest bg-forest-surface rounded-xl px-5 py-4">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-[13px] leading-none">💡</span>
            <span className="font-mono text-[10px] text-forest tracking-widest uppercase">Key Insight</span>
          </div>
          <p className="text-[14px] text-ink leading-relaxed font-medium">{value.text}</p>
        </div>
      );
    },
    exercise: ({ value }: { value: any }) => {
      const variant = value.variant ?? "checklist"; // missing variant = pre-existing checklist content
      if (variant === "scenario") {
        return (
          <ScenarioExercise
            title={value.title ?? ""}
            scenario={value.scenario ?? ""}
            prompt={value.prompt}
            modelAnswer={value.modelAnswer ?? ""}
          />
        );
      }
      if (variant === "quiz") {
        return (
          <QuizExercise
            title={value.title ?? ""}
            question={value.question ?? ""}
            options={value.options ?? []}
            correctIndex={value.correctIndex ?? 0}
            explanation={value.explanation}
          />
        );
      }
      if (variant === "fillInTheBlank") {
        return (
          <FillInTheBlankExercise
            title={value.title ?? ""}
            textWithBlank={value.textWithBlank ?? ""}
            correctAnswers={value.correctAnswers ?? []}
            explanation={value.explanation}
          />
        );
      }
      if (variant === "numericInput") {
        return (
          <NumericInputExercise
            title={value.title ?? ""}
            prompt={value.prompt ?? ""}
            correctValue={value.correctValue ?? 0}
            tolerance={value.tolerance ?? 0}
            unit={value.unit}
            explanation={value.explanation}
          />
        );
      }
      return <ExerciseBlock title={value.title ?? ""} steps={value.steps ?? []} />;
    },
    table: ({ value }: { value: { caption?: string; headers?: string[]; rows?: { cells?: string[] }[] } }) => (
      <TableBlock value={value} />
    ),
    statGrid: ({ value }: { value: { stats?: { label?: string; value?: string; context?: string }[] } }) => (
      <StatGridBlock value={value} />
    ),
    mathBlock: ({ value }: { value: { latex?: string; caption?: string } }) => {
      let html = "";
      try {
        html = katex.renderToString(value.latex ?? "", { displayMode: true, throwOnError: false });
      } catch {
        html = `<span style="color:#DC2626">${value.latex}</span>`;
      }
      return (
        <div className="mt-8 overflow-x-auto">
          <div className="bg-forest-surface border-l-4 border-forest rounded-xl px-6 py-5 text-center" dangerouslySetInnerHTML={{ __html: html }} />
          {value.caption && (
            <p className="font-mono text-[11px] text-ink-dim text-center mt-2 tracking-wide">{value.caption}</p>
          )}
        </div>
      );
    },
    keyFact: ({ value }: { value: { label?: string; value?: string; context?: string } }) => (
      <div className="mt-8 border-l-4 border-gold bg-gold-surface rounded-xl px-6 py-4 flex flex-col gap-1">
        <div className="font-mono text-[10px] text-gold-text tracking-widest uppercase">{value.label}</div>
        <div className="text-[22px] font-bold text-forest leading-tight">{value.value}</div>
        {value.context && (
          <div className="text-[13px] text-ink-dim">{value.context}</div>
        )}
      </div>
    ),
    chart: ({ value }: { value: any }) => <ChartBlock value={value} />,
    payoffDiagram: ({ value }: { value: any }) => <PayoffDiagramBlock value={value} />,
    calculator: ({ value }: { value: any }) => <CalculatorBlock value={value} />,
    collapsible: ({ value }: { value: { title?: string; content?: unknown[] } }) => (
      <CollapsibleBlock title={value.title} content={value.content} components={portableTextComponents} />
    ),
    candlestickChart: ({ value }: { value: any }) => <CandlestickChartBlock value={value} />,
    donutChart: ({ value }: { value: any }) => <DonutChartBlock value={value} />,
    codeBlock: ({ value }: { value: any }) => <CodeBlock value={value} />,
    timeline: ({ value }: { value: any }) => <TimelineBlock value={value} />,
    annotatedImage: ({ value }: { value: any }) => <AnnotatedImageBlock value={value} />,
    comparison: ({ value }: { value: any }) => <ComparisonBlock value={value} />,
    flashcardSet: ({ value }: { value: any }) => <FlashcardSetBlock value={value} />,
    toolLink: ({ value }: { value: any }) => <ToolLinkBlock value={value} />,
    bigIdea: ({ value }: { value: any }) => <BigIdeaBlock value={value} />,
    keyTakeaways: ({ value }: { value: any }) => <KeyTakeawaysBlock value={value} />,
  },
  marks: {
    link: ({ value, children }: { value?: { href?: string }; children?: React.ReactNode }) => (
      <a
        href={value?.href}
        target="_blank"
        rel="noopener noreferrer"
        className="underline decoration-gold hover:text-gold-text transition-colors"
      >
        {children}
      </a>
    ),
    glossaryTerm: ({ value, children }: { value?: { definition?: string }; children?: React.ReactNode }) => (
      <GlossaryTerm definition={value?.definition}>{children}</GlossaryTerm>
    ),
  },
};

// ─── Locked Lesson State ──────────────────────────────────────────────────────

function LockedLesson({
  isLoggedIn,
  reason,
}: {
  isLoggedIn: boolean;
  reason: "needs-subscription" | "needs-pro";
}) {
  const isPro = reason === "needs-pro";
  return (
    <div className="flex flex-col items-center justify-center py-24 px-8 text-center">
      <div className="w-16 h-16 bg-forest-surface rounded-full flex items-center justify-center text-[28px] mb-5">
        🔒
      </div>
      <h2 className="text-[22px] font-bold text-ink mb-2">
        {isPro ? "Upgrade to Pro to access this course" : "Subscribe to access this lesson"}
      </h2>
      <p className="text-[15px] text-ink-dim mb-8 max-w-sm">
        {isPro
          ? "This is a Pro course. Upgrade from Learner to Pro to unlock it, along with early access to new courses and workbooks."
          : "This lesson is part of the full course. Subscribe for access to all courses."}
      </p>
      <Link
        href="/pricing"
        className="bg-forest hover:bg-forest-dark text-white rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors mb-3"
      >
        View Subscription Plans →
      </Link>
      {!isLoggedIn && (
        <Link
          href="/auth/login"
          className="border border-hairline hover:border-ink text-ink-dim hover:text-ink rounded-lg px-8 py-3.5 text-[15px] font-medium transition-colors"
        >
          Sign in if subscribed →
        </Link>
      )}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function ReaderPage() {
  const params = useParams();
  const router = useRouter();
  const courseSlug = typeof params.course === "string" ? params.course : "";
  const lessonSlug = typeof params.lesson === "string" ? params.lesson : "";

  // Starts closed: on mobile the sidebar renders as a `fixed` z-30 drawer
  // that sits directly on top of this same top bar's hamburger button, so
  // defaulting it open made the toggle unclickable on first load (the drawer
  // itself was intercepting the click). Desktop is unaffected — `lg:transform-none`
  // below keeps the sidebar permanently visible there regardless of this state.
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [completedLessons, setCompletedLessons] = useState<Set<string>>(new Set());
  const [activeLesson, setActiveLesson] = useState(lessonSlug);

  const [course, setCourse] = useState<CourseData | null>(null);
  const [lesson, setLesson] = useState<LessonData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userTier, setUserTier] = useState<string>("free");
  const [authLoading, setAuthLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const supabaseRef = useRef(createClient());

  useEffect(() => {
    if (lessonSlug) setActiveLesson(lessonSlug);
  }, [lessonSlug]);

  // globals.css sets `overflow-x: hidden` on html/body site-wide (a guard against
  // accidental horizontal overflow). Per the CSS overflow spec, that forces
  // overflow-y to compute as "auto" on both, turning them into scroll containers
  // in their own right — which breaks native `position: sticky` for anything
  // sticky-positioned relative to the page (the sticky sidebar and top bar below
  // silently stop sticking, with no console error). Temporarily clearing it only
  // while this page is mounted restores normal document scrolling so sticky
  // works, without touching the global rule other pages rely on.
  useEffect(() => {
    const html = document.documentElement;
    const prevHtmlOverflowX = html.style.overflowX;
    const prevBodyOverflowX = document.body.style.overflowX;
    html.style.overflowX = "visible";
    document.body.style.overflowX = "visible";
    return () => {
      html.style.overflowX = prevHtmlOverflowX;
      document.body.style.overflowX = prevBodyOverflowX;
    };
  }, []);

  // Auth + subscription + existing progress
  useEffect(() => {
    async function loadAuthAndProgress() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        setAuthLoading(false);
        return;
      }
      setIsLoggedIn(true);
      setUserId(user.id);

      const { data: sub } = await supabase
        .from("subscriptions")
        .select("tier, status, current_period_end")
        .eq("user_id", user.id)
        .eq("status", "active")
        .single();
      if (sub) {
        const isValid = !sub.current_period_end || new Date(sub.current_period_end) > new Date();
        if (isValid) setUserTier(sub.tier);
      }

      const { data: progress } = await supabase
        .from("lesson_progress")
        .select("lesson_slug")
        .eq("user_id", user.id)
        .eq("course_slug", courseSlug);
      if (progress) {
        setCompletedLessons(new Set(progress.map((p: { lesson_slug: string }) => p.lesson_slug)));
      }

      setAuthLoading(false);
    }
    loadAuthAndProgress();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseSlug]);

  // Fetch course structure
  useEffect(() => {
    if (!courseSlug) return;
    getFullCourseForReader(courseSlug)
      .then((data: CourseData | null) => {
        if (!data) setError(true);
        else setCourse(data);
      })
      .catch(() => setError(true));
  }, [courseSlug]);

  // Fetch lesson content
  useEffect(() => {
    if (!courseSlug || !activeLesson) return;
    setLesson(null);
    getLessonBySlug(courseSlug, activeLesson)
      .then((data: { lesson: LessonData | null } | null) => {
        if (data?.lesson) setLesson(data.lesson);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [courseSlug, activeLesson]);

  if (!lessonSlug) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-dim font-mono text-[13px]">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center h-64 text-ink-dim">
        Course not found.{" "}
        <Link href="/courses" className="text-gold-text ml-1">
          Browse courses →
        </Link>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="flex-1 flex items-center justify-center text-ink-dim font-mono text-[13px]">
        Loading...
      </div>
    );
  }

  const allLessons = course.chapters.flatMap((ch) => ch.lessons);
  const lessonIndex = allLessons.findIndex((l) => l.slug === activeLesson);
  const nextLesson = lessonIndex < allLessons.length - 1 ? allLessons[lessonIndex + 1] : null;
  const prevLesson = lessonIndex > 0 ? allLessons[lessonIndex - 1] : null;
  const isFinalLesson = !nextLesson && lessonIndex >= 0;
  const isFinalLessonCompleted = isFinalLesson && completedLessons.has(activeLesson);
  const progressPct = allLessons.length > 0 ? Math.round((completedLessons.size / allLessons.length) * 100) : 0;

  const currentMeta = allLessons.find((l) => l.slug === activeLesson) || allLessons.find((l) => l.slug === lessonSlug);
  const lockReason = authLoading
    ? null
    : lessonLockReason(userTier, course.accessLevel, currentMeta?.isFree);
  const isLocked = lockReason !== null;

  async function handleSignOut() {
    await supabaseRef.current.auth.signOut();
    router.push("/");
  }

  async function markCompleteAndNext() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    if (userId) {
      const supabase = supabaseRef.current;
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            lesson_slug: activeLesson,
            last_accessed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_slug,lesson_slug" }
        );
      await supabase
        .from("course_enrollments")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            last_lesson_slug: activeLesson,
            last_accessed_at: new Date().toISOString(),
          },
          { onConflict: "user_id,course_slug" }
        );
    }
    if (nextLesson) setActiveLesson(nextLesson.slug);
  }

  function triggerCelebrationConfetti() {
    try {
      // First burst - vibrant institutional gold & emerald
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.65 },
        colors: ["#9B7728", "#1B3A2B", "#2E7D32", "#BA984A", "#FFFFFF"],
      });

      // Secondary bursts for celebratory flair
      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 60,
          spread: 55,
          origin: { x: 0.2, y: 0.7 },
          colors: ["#9B7728", "#BA984A", "#1B3A2B"],
        });
      }, 200);

      setTimeout(() => {
        confetti({
          particleCount: 50,
          angle: 120,
          spread: 55,
          origin: { x: 0.8, y: 0.7 },
          colors: ["#1B3A2B", "#28523E", "#D8A944"],
        });
      }, 400);
    } catch (err) {
      console.warn("Celebration animation could not trigger:", err);
    }
  }

  async function markFinalComplete() {
    setCompletedLessons((prev) => new Set([...prev, activeLesson]));
    triggerCelebrationConfetti();
    if (userId) {
      const supabase = supabaseRef.current;
      const now = new Date().toISOString();
      await supabase
        .from("lesson_progress")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            lesson_slug: activeLesson,
            last_accessed_at: now,
          },
          { onConflict: "user_id,course_slug,lesson_slug" }
        );
      const allLessonsCount = (course?.chapters?.flatMap((ch) => ch.lessons) ?? []).length;
      const newCompleted = completedLessons.size + 1;
      await supabase
        .from("course_enrollments")
        .upsert(
          {
            user_id: userId,
            course_slug: courseSlug,
            last_lesson_slug: activeLesson,
            last_accessed_at: now,
            completed_at: newCompleted >= allLessonsCount ? now : null,
          },
          { onConflict: "user_id,course_slug" }
        );
    }
  }

  return (
    <div className="flex items-start bg-panel">

      {/* ── SIDEBAR ──
          Sticky (not a forced-height, clipped pane) so it pins in place while the
          user scrolls the main column, and only scrolls internally if its own
          chapter/lesson list is taller than the viewport. This keeps the sidebar
          fully contained without ever forcing the page's overall height to match
          it — the page's natural height follows the taller of the two columns,
          and Footer (rendered by the root layout below this whole component)
          always ends up cleanly below everything, full width, unaffected by
          sidebar length. Pinned to the very top (top-0): the site Navbar hides
          itself on this route (see components/layout/Navbar.tsx) so the
          condensed bar in the main column below is the only persistent header —
          there's nothing above this to clear. */}
      <aside
        className={`${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        } fixed left-0 top-0 lg:sticky lg:top-0 lg:transform-none z-30 flex-shrink-0 flex flex-col bg-panel border-r border-hairline overflow-y-auto transition-transform duration-200`}
        style={{ width: 280, height: "100vh" }}
      >
        {/* Back + course info */}
        <div className="px-4 py-4 border-b border-hairline">
          <Link
            href="/courses"
            className="inline-flex items-center gap-1.5 font-mono text-[11px] text-ink-dim hover:text-gold-text transition-colors mb-3"
          >
            ← All courses
          </Link>
          <div className="text-[14px] text-ink leading-snug mb-1">
            {course.title}
          </div>
          <div className="font-mono text-[11px] text-ink-dim">
            {allLessons.length} lessons
          </div>
        </div>

        {/* Progress bar */}
        <div className="px-4 py-3 border-b border-hairline">
          <div className="flex justify-between items-center mb-1.5">
            <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">Progress</span>
            <span className="font-mono text-[11px] text-ink">{progressPct}%</span>
          </div>
          <div className="h-[3px] bg-hairline rounded-full overflow-hidden">
            <div
              className="h-full bg-gold rounded-full transition-all duration-500"
              style={{ width: `${progressPct}%` }}
            />
          </div>
        </div>

        {/* Chapters + lessons */}
        <div className="flex-1 py-2">
          {course.chapters.map((chapter) => (
            <div key={chapter.title} className="mb-1">
              <div className="px-4 py-2 font-mono text-[9px] text-ink-dim tracking-widest uppercase">
                {chapter.title}
              </div>
              {chapter.lessons.map((l) => {
                const isActive = l.slug === activeLesson;
                const isDone = completedLessons.has(l.slug);
                const isAccessible = canAccessLesson(userTier, course.accessLevel, l.isFree);

                return (
                  <button
                    key={l.slug}
                    onClick={() => setActiveLesson(l.slug)}
                    className={`w-full text-left flex items-start gap-3 px-4 py-2.5 border-l-[3px] transition-all ${
                      isActive
                        ? "border-gold bg-forest-surface"
                        : "border-transparent hover:bg-forest-surface/60"
                    }`}
                  >
                    <div
                      className={`mt-0.5 w-5 h-5 rounded-full flex-shrink-0 flex items-center justify-center text-[10px] ${
                        isDone
                          ? "bg-forest text-white"
                          : isActive
                          ? "bg-gold text-white"
                          : isAccessible
                          ? "border-2 border-hairline text-ink-dim"
                          : "bg-hairline text-ink-dim"
                      }`}
                    >
                      {isDone ? "✓" : isActive ? "▶" : isAccessible ? "" : "🔒"}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div
                        className={`text-[13px] leading-snug ${
                          isActive ? "text-ink font-medium" : isDone ? "text-ink-dim" : "text-ink-dim"
                        }`}
                      >
                        {l.title}
                      </div>
                      {l.duration && <div className="font-mono text-[10px] text-ink-dim mt-0.5">{formatDuration(l.duration)}</div>}
                    </div>
                  </button>
                );
              })}
            </div>
          ))}
        </div>

        {/* Subscribe card */}
        <div className="p-4 border-t border-hairline bg-forest-surface">
          <div className="font-mono text-[10px] text-ink-dim tracking-widest uppercase mb-2">Full Access</div>
          <div className="font-mono text-[13px] text-ink-dim mb-3">
            Subscribe once. Access all courses.
          </div>
          <Link
            href="/pricing"
            className="block w-full text-center bg-forest hover:bg-forest-dark text-white rounded-lg py-2.5 text-[13px] font-medium transition-colors"
          >
            View plans →
          </Link>
        </div>
      </aside>

      {/* Sidebar overlay for mobile */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 z-20 bg-black/30"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* ── MAIN PANEL ── */}
      <div className="flex-1 flex flex-col min-w-0">

        {/* Sticky top bar — the SINGLE persistent header on this route (the site
            Navbar hides itself here, see components/layout/Navbar.tsx, to avoid
            two stacked sticky headers). Stays visible while scrolling through
            lesson content, giving constant access to progress, a way back to
            the course list, and (condensed) account access. */}
        <div className="sticky top-0 z-10 flex items-center justify-between gap-3 px-5 py-3 bg-panel border-b border-hairline">
          <div className="flex items-center gap-4 min-w-0">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="text-ink-dim hover:text-ink transition-colors flex-shrink-0"
              aria-label="Toggle sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                <path d="M2 5h16M2 10h16M2 15h16" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </button>
            <Link
              href="/courses"
              className="flex-shrink-0 font-mono text-[11px] text-ink-dim hover:text-gold-text transition-colors"
            >
              ← Courses
            </Link>
            <div className="hidden sm:flex items-center gap-2 min-w-0">
              <div className="h-1.5 w-20 bg-hairline rounded-full overflow-hidden flex-shrink-0">
                <div
                  className="h-full bg-gold rounded-full transition-all"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
              <span className="font-mono text-[11px] text-ink-dim whitespace-nowrap">{progressPct}% complete</span>
            </div>
          </div>
          <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">
            {/* Ask AI Tutor contextual button */}
            {TUTOR_ENABLED && (
            <button
              id="ask-tutor-toolbar-button"
              type="button"
              onClick={() => {
                const event = new CustomEvent("open-capital-ai", {
                  detail: {
                    prompt: `Can you explain the key concepts and formulas in "${lesson?.title || 'this lesson'}" with a real Indian stock market example?`,
                    context: {
                      courseSlug,
                      courseTitle: course?.title,
                      lessonSlug: activeLesson,
                      lessonTitle: lesson?.title,
                    },
                  },
                });
                window.dispatchEvent(event);
              }}
              aria-label="Ask Capital AI about this lesson"
              title="Ask Capital AI about this lesson"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-forest/30 bg-forest-surface hover:bg-forest hover:text-white text-forest font-mono text-[11px] font-semibold transition-colors cursor-pointer"
            >
              <Sparkles className="w-3.5 h-3.5 text-gold" />
              <span className="hidden sm:inline">Ask AI Tutor</span>
            </button>
            )}

            {/* Print / Export PDF button */}
            <button
              id="export-lesson-pdf-button"
              type="button"
              onClick={() => window.print()}
              aria-label="Export lesson as PDF"
              title="Print / Save Lesson as clean PDF"
              className="inline-flex items-center gap-1.5 px-2.5 py-1 sm:px-3 sm:py-1.5 rounded-lg border border-hairline bg-panel hover:bg-olive-surface/80 text-olive font-mono text-[11px] transition-colors cursor-pointer"
            >
              <Printer className="w-3.5 h-3.5 text-forest" />
              <span className="hidden sm:inline">Export PDF</span>
            </button>

            {!authLoading && (
            isLoggedIn ? (
              <div className="flex items-center gap-3 font-mono text-[11px] text-ink-dim flex-shrink-0">
                <Link href="/dashboard" className="hover:text-ink transition-colors hidden sm:inline">
                  Account
                </Link>
                <button onClick={handleSignOut} className="hover:text-ink transition-colors">
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="flex-shrink-0 font-mono text-[11px] text-ink-dim hover:text-ink transition-colors"
              >
                Sign In
              </Link>
            )
          )}
          </div>
        </div>

        {/* Content area — flows naturally with the page; the outer wrapper has
            no forced height, so the page's overall height is simply whichever
            column (sidebar or content) is taller, and the site Footer renders
            cleanly below it. */}
        <div>
          {isLocked ? (
            <LockedLesson isLoggedIn={isLoggedIn} reason={lockReason ?? "needs-subscription"} />
          ) : loading ? (
            <div className="flex items-center justify-center py-24 font-mono text-[13px] text-ink-dim">
              Loading lesson...
            </div>
          ) : lesson ? (
            <div className="max-w-[720px] mx-auto px-8 pt-12 pb-24">
              {/* Disclaimer */}
              <div className="font-mono text-[11px] text-ink-dim mb-6">
                Educational content only · Not investment advice
              </div>

              {/* Lesson header */}
              <h1 className="text-[30px] font-bold text-ink leading-[1.1] mb-3">
                {lesson.title}
              </h1>
              <div className="flex items-center gap-3 mb-8 pb-6 border-b border-hairline">
                {lesson.duration && <span className="font-mono text-[12px] text-ink-dim">{formatDuration(lesson.duration)}</span>}
                {lesson.isFree && (
                  <span className="font-mono text-[10px] text-forest bg-forest-surface rounded px-2 py-0.5">
                    Free preview
                  </span>
                )}
              </div>

              {/* Content — each block owns its own top margin (see the
                  tiered spacing scale across portableTextComponents below),
                  so this wrapper applies no gap of its own. */}
              <div className="[&>*:first-child]:!mt-0">
                <PortableText value={lesson.body || []} components={portableTextComponents} />
              </div>

              {/* Nav footer — stacks on narrow screens, sits as a row from
                  sm: up; both sides truncate long titles so a long prev/next
                  lesson name can never force an awkward wrap or overlap. */}
              {isFinalLessonCompleted && (
                <div
                  id="course-completion-celebration-banner"
                  className="mt-12 p-5 rounded-2xl bg-forest-surface border border-gold/40 flex items-center justify-between gap-4 flex-wrap"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gold/20 flex items-center justify-center text-gold flex-shrink-0">
                      <Sparkles className="w-5 h-5 text-gold animate-pulse" />
                    </div>
                    <div>
                      <div className="font-bold text-ink text-sm sm:text-base">
                        Course Completed! Congratulations 🎉
                      </div>
                      <div className="text-xs text-ink-dim font-mono mt-0.5">
                        You have mastered all lessons in this curriculum track.
                      </div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={triggerCelebrationConfetti}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gold hover:bg-gold-dark text-white font-mono text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    Celebrate Again
                  </button>
                </div>
              )}

              <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 mt-16 pt-8 border-t border-hairline">
                {prevLesson && (
                  <button
                    onClick={() => setActiveLesson(prevLesson.slug)}
                    className="min-w-0 flex-1 sm:max-w-[50%] font-mono text-[13px] text-ink-dim hover:text-ink transition-colors text-left truncate"
                  >
                    ← {prevLesson.title}
                  </button>
                )}
                {nextLesson ? (
                  <button
                    onClick={markCompleteAndNext}
                    className={`min-w-0 ${prevLesson ? "sm:max-w-[55%]" : "sm:max-w-[85%]"} sm:ml-auto bg-forest hover:bg-forest-dark text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-colors truncate`}
                  >
                    Next: {nextLesson.title} →
                  </button>
                ) : (
                  <button
                    id="mark-course-complete-button"
                    onClick={markFinalComplete}
                    className="sm:ml-auto inline-flex items-center gap-2 bg-forest hover:bg-forest-dark text-white rounded-lg px-6 py-2.5 font-mono text-[13px] font-medium transition-all shadow-xs cursor-pointer"
                  >
                    <Sparkles className="w-4 h-4 text-gold-surface" />
                    <span>{isFinalLessonCompleted ? "Completed ✓" : "Mark complete ✓"}</span>
                  </button>
                )}
              </div>
            </div>
          ) : (
            <div className="max-w-[720px] mx-auto px-8 py-12">
              <div className="font-mono text-[11px] text-ink-dim mb-6">Educational content only · Not investment advice</div>
              <div className="font-mono text-[12px] text-ink-dim">Content coming soon for this lesson.</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

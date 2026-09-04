"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

export default function GlossaryTerm({ definition, children }: { definition?: string; children?: ReactNode }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  // Click-outside closes it — needed for the tap-to-toggle mobile path,
  // where there's no "mouse leave" to close it for you.
  useEffect(() => {
    if (!open) return;
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [open]);

  if (!definition) return <>{children}</>;

  return (
    <span ref={ref} className="relative inline-block" onMouseEnter={() => setOpen(true)} onMouseLeave={() => setOpen(false)}>
      <span
        onClick={() => setOpen((o) => !o)}
        className="underline decoration-dotted decoration-ink-dim underline-offset-2 cursor-help text-ink"
        tabIndex={0}
        role="button"
        aria-expanded={open}
      >
        {children}
      </span>
      {open && (
        <span
          role="tooltip"
          className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 z-20 w-64 max-w-[80vw] px-3 py-2.5 rounded-lg border border-hairline bg-panel shadow-lg text-[13px] text-ink-dim leading-relaxed"
        >
          {definition}
        </span>
      )}
    </span>
  );
}

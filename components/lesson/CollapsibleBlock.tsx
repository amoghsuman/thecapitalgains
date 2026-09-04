"use client";

import { useState } from "react";
import { PortableText, type PortableTextComponents } from "@portabletext/react";

export default function CollapsibleBlock({
  title,
  content,
  components,
}: {
  title?: string;
  content?: unknown[];
  components: PortableTextComponents;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="my-6 border border-hairline rounded-xl bg-panel overflow-hidden">
      <button onClick={() => setOpen((o) => !o)} className="w-full flex items-center justify-between gap-3 px-5 py-4 text-left" aria-expanded={open}>
        <span className="text-[15px] font-medium text-ink">{title}</span>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          className={`flex-shrink-0 text-ink-dim transition-transform duration-200 ${open ? "rotate-180" : ""}`}
        >
          <path d="M4 6l4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </button>
      {open && (
        <div className="px-5 pb-5 pt-1 border-t border-hairline flex flex-col gap-5">
          <PortableText value={(content ?? []) as never} components={components} />
        </div>
      )}
    </div>
  );
}

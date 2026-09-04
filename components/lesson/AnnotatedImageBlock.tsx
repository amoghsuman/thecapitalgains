"use client";

import { useState } from "react";
import { urlFor } from "@/sanity/lib/image";

type Annotation = { x?: number; y?: number; label?: string };

export type AnnotatedImageValue = {
  image?: unknown;
  caption?: string;
  annotations?: Annotation[];
};

function AnnotationMarker({ annotation }: { annotation: Annotation }) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className="absolute -translate-x-1/2 -translate-y-1/2 z-10"
      style={{ left: `${annotation.x ?? 0}%`, top: `${annotation.y ?? 0}%` }}
    >
      <button
        onClick={() => setOpen((o) => !o)}
        onMouseEnter={() => setOpen(true)}
        onMouseLeave={() => setOpen(false)}
        aria-label={annotation.label}
        className="w-5 h-5 rounded-full bg-gold border-2 border-white shadow-md flex items-center justify-center text-white text-[11px] font-bold hover:scale-110 transition-transform"
      >
        !
      </button>
      {open && annotation.label && (
        <div className="absolute left-1/2 -translate-x-1/2 top-full mt-2 z-20 w-max max-w-[220px] px-3 py-2 rounded-lg border border-hairline bg-panel shadow-lg text-[12px] text-ink leading-snug">
          {annotation.label}
        </div>
      )}
    </div>
  );
}

export default function AnnotatedImageBlock({ value }: { value: AnnotatedImageValue }) {
  if (!value.image) return null;
  const src = urlFor(value.image).width(1200).url();

  return (
    <div className="my-6">
      <div className="relative inline-block w-full border border-hairline rounded-xl overflow-hidden bg-panel">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={src} alt={value.caption ?? ""} className="w-full h-auto block" />
        {(value.annotations ?? []).map((a, i) => (
          <AnnotationMarker key={i} annotation={a} />
        ))}
      </div>
      {value.caption && <p className="font-mono text-[11px] text-ink-dim text-center mt-2 tracking-wide">{value.caption}</p>}
    </div>
  );
}

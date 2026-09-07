"use client";

import { useState } from "react";
import Image from "next/image";
import { urlFor } from "@/sanity/lib/image";

type Annotation = { x?: number; y?: number; label?: string };

type SanityImageValue = {
  asset?: { _ref?: string };
};

export type AnnotatedImageValue = {
  image?: SanityImageValue;
  caption?: string;
  annotations?: Annotation[];
};

const FALLBACK_ASPECT_RATIO = 16 / 9;

// Sanity image asset ids encode the source dimensions directly
// (image-<hash>-<width>x<height>-<format>), so the real aspect ratio can be
// read straight off the reference with no extra GROQ dereference or network
// request. Using the real ratio for the container means `object-fit:
// contain` never has to letterbox — the container's box IS the image's box,
// so the percentage-based annotation positions land exactly where they're
// meant to regardless of what aspect ratio a given upload happens to be.
function getAspectRatio(ref?: string): number {
  const match = ref?.match(/-(\d+)x(\d+)-/);
  if (!match) return FALLBACK_ASPECT_RATIO;
  const width = parseInt(match[1], 10);
  const height = parseInt(match[2], 10);
  return width > 0 && height > 0 ? width / height : FALLBACK_ASPECT_RATIO;
}

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
  const aspectRatio = getAspectRatio(value.image.asset?._ref);

  return (
    <div className="mt-8">
      <div
        className="relative w-full border border-hairline rounded-xl overflow-hidden bg-panel"
        style={{ aspectRatio }}
      >
        <Image
          src={src}
          alt={value.caption ?? ""}
          fill
          sizes="(min-width: 768px) 720px, 100vw"
          style={{ objectFit: "contain" }}
        />
        {(value.annotations ?? []).map((a, i) => (
          <AnnotationMarker key={i} annotation={a} />
        ))}
      </div>
      {value.caption && <p className="font-mono text-[11px] text-ink-dim text-center mt-2 tracking-wide">{value.caption}</p>}
    </div>
  );
}

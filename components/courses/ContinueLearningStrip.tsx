"use client";

import { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";

export type ContinueLearningItem = {
  slug: string;
  title: string;
  pct: number;
  href: string;
};

function ArrowIcon({ direction }: { direction: "left" | "right" }) {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
      {direction === "left" ? <path d="M15 18l-6-6 6-6" /> : <path d="M9 18l6-6-6-6" />}
    </svg>
  );
}

export default function ContinueLearningStrip({ items }: { items: ContinueLearningItem[] }) {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 4);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 4);
  }, []);

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState, { passive: true });
    const ro = new ResizeObserver(updateScrollState);
    ro.observe(el);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      ro.disconnect();
    };
  }, [items, updateScrollState]);

  const scrollByCards = (dir: 1 | -1) => {
    const el = scrollRef.current;
    if (!el) return;
    el.scrollBy({ left: dir * 240, behavior: "smooth" });
  };

  if (items.length === 0) return null;

  return (
    <div className="mb-8 rounded-2xl border border-hairline bg-forest-surface/40 p-5">
      <div className="flex items-center gap-2 mb-4">
        <div className="w-6 h-6 rounded-full bg-forest flex items-center justify-center flex-shrink-0">
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round">
            <path d="M5 3l14 9-14 9V3z" />
          </svg>
        </div>
        <div className="text-[12px] font-bold text-ink tracking-widest uppercase">
          Continue learning
        </div>
      </div>

      <div className="relative">
        {canScrollLeft && (
          <button
            type="button"
            onClick={() => scrollByCards(-1)}
            aria-label="Scroll left"
            className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1/2 z-10 w-9 h-9 rounded-full bg-panel border border-hairline shadow-md
              flex items-center justify-center text-ink hover:border-forest hover:text-forest motion-safe:transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <ArrowIcon direction="left" />
          </button>
        )}

        <div
          ref={scrollRef}
          className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1 snap-x snap-mandatory [&::-webkit-scrollbar]:hidden"
          style={{ scrollbarWidth: "none" }}
        >
          {items.map((item) => (
            <Link
              key={item.slug}
              href={item.href}
              className="group flex-shrink-0 snap-start w-[230px] rounded-xl border border-hairline bg-panel p-4
                hover:border-gold hover:shadow-md motion-safe:transition-all
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
            >
              <div className="text-[13px] font-semibold text-ink leading-snug line-clamp-2 mb-3 group-hover:text-forest motion-safe:transition-colors">
                {item.title}
              </div>
              <div className="flex items-center gap-2">
                <div className="flex-1 h-[4px] bg-hairline rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gold rounded-full motion-safe:transition-[width] motion-safe:duration-300"
                    style={{ width: `${item.pct}%` }}
                  />
                </div>
                <span className="text-[10px] font-semibold text-ink-dim whitespace-nowrap">{item.pct}%</span>
              </div>
              <div className="text-[11px] font-bold text-gold-text mt-2.5 opacity-0 group-hover:opacity-100 motion-safe:transition-opacity">
                Resume →
              </div>
            </Link>
          ))}
        </div>

        {canScrollRight && (
          <button
            type="button"
            onClick={() => scrollByCards(1)}
            aria-label="Scroll right"
            className="absolute right-0 top-1/2 -translate-y-1/2 translate-x-1/2 z-10 w-9 h-9 rounded-full bg-panel border border-hairline shadow-md
              flex items-center justify-center text-ink hover:border-forest hover:text-forest motion-safe:transition-colors
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-forest focus-visible:ring-offset-2 focus-visible:ring-offset-ivory"
          >
            <ArrowIcon direction="right" />
          </button>
        )}

        {/* Edge fade — a secondary, always-visible hint that more content
            sits past the edge, complementing the arrows rather than relying
            on a partially-cut-off card as the only signal. */}
        {canScrollRight && (
          <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-12 bg-gradient-to-l from-forest-surface/40 to-transparent" />
        )}
      </div>
    </div>
  );
}

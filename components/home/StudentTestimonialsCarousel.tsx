"use client";

import { useState, useEffect, useCallback } from "react";
import { ChevronLeft, ChevronRight, Quote, Star, ShieldCheck } from "lucide-react";
import type { Testimonial } from "@/lib/sanity/queries";

interface StudentTestimonialsCarouselProps {
  /** From getTestimonials(): only consented testimonials are ever passed in. */
  testimonials: Testimonial[];
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w.charAt(0).toUpperCase())
    .join("");
}

export default function StudentTestimonialsCarousel({ testimonials }: StudentTestimonialsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);
  const count = testimonials.length;

  const prev = useCallback(() => {
    setCurrentIndex((c) => (c === 0 ? count - 1 : c - 1));
  }, [count]);

  const next = useCallback(() => {
    setCurrentIndex((c) => (c === count - 1 ? 0 : c + 1));
  }, [count]);

  // Auto rotate every 7 seconds unless paused on hover
  useEffect(() => {
    if (isPaused || count < 2) return;
    const interval = setInterval(next, 7000);
    return () => clearInterval(interval);
  }, [isPaused, count, next]);

  // The page omits this section while the list is empty; this is a guard.
  if (count === 0) return null;

  const current = testimonials[Math.min(currentIndex, count - 1)];
  const rating = Math.max(1, Math.min(5, Math.round(current.rating)));

  return (
    <section id="student-testimonials-section" className="py-16 md:py-20 bg-ivory border-b border-hairline">
      <div className="site-container space-y-9">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
          <div>
            <div className="font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase mb-2">
              STUDENT STORIES
            </div>
            <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
              Institutional Competency in Practice
            </h2>
            <p className="text-ink-dim text-sm sm:text-base mt-1 max-w-xl leading-relaxed">
              Read how retail investors, traders, and finance professionals use our playbooks to reject market noise and preserve long-term capital.
            </p>
          </div>

          {/* Carousel Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              id="prev-testimonial-btn"
              onClick={prev}
              className="p-2.5 rounded-xl border border-hairline bg-panel hover:bg-ivory text-ink-dim hover:text-forest transition-colors shadow-2xs cursor-pointer"
              title="Previous testimonial"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <span className="font-mono text-xs text-ink-dim px-2">
              {currentIndex + 1} / {count}
            </span>
            <button
              type="button"
              id="next-testimonial-btn"
              onClick={next}
              className="p-2.5 rounded-xl border border-hairline bg-panel hover:bg-ivory text-ink-dim hover:text-forest transition-colors shadow-2xs cursor-pointer"
              title="Next testimonial"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Carousel Active Card */}
        <div
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
          className="bg-panel border border-hairline rounded-2xl p-6 sm:p-10 shadow-xs relative overflow-hidden transition-all"
        >
          <Quote className="w-16 h-16 text-forest/10 absolute right-6 top-6 pointer-events-none" />

          <div className="space-y-6 relative z-10 max-w-3xl">
            {/* Stars & Verified Badge */}
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-1">
                {[...Array(rating)].map((_, i) => (
                  <Star key={i} className="w-4 h-4 fill-gold text-gold" />
                ))}
              </div>

              {current.consentReceived && (
                <div className="inline-flex items-center gap-1.5 font-mono text-[10px] text-forest bg-forest-surface px-2.5 py-1 rounded-md border border-hairline">
                  <ShieldCheck className="w-3.5 h-3.5 text-forest" />
                  <span>Verified student</span>
                </div>
              )}
            </div>

            {/* Quote */}
            <p className="text-sm sm:text-base text-ink-dim leading-relaxed">&ldquo;{current.quote}&rdquo;</p>

            {/* Student Info */}
            <div className="pt-6 border-t border-hairline flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-forest-surface text-forest font-mono font-bold flex items-center justify-center border border-hairline">
                  {initials(current.name)}
                </div>
                <div>
                  <div className="font-bold text-sm text-olive">{current.name}</div>
                  {(current.role || current.city) && (
                    <div className="text-xs text-ink-dim font-medium">
                      {current.role}
                      {current.role && current.city ? " · " : ""}
                      {current.city && <span className="font-mono text-ink-muted">{current.city}</span>}
                    </div>
                  )}
                </div>
              </div>

              {current.course && (
                <div className="text-left sm:text-right font-mono text-xs text-ink-dim">
                  <div className="text-[10px] uppercase text-gold font-bold">Course</div>
                  <div className="text-olive font-semibold">{current.course.title}</div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Carousel Dot Indicators */}
        <div className="flex items-center justify-center gap-2">
          {testimonials.map((t, idx) => (
            <button
              key={t._id}
              type="button"
              onClick={() => setCurrentIndex(idx)}
              className={`h-2 rounded-full transition-all cursor-pointer ${
                idx === currentIndex ? "w-8 bg-forest" : "w-2 bg-hairline hover:bg-ink-muted"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

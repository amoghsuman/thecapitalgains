"use client";

import { useState } from "react";
import { BookOpen, Sparkles } from "lucide-react";
import PlaybookSneakPeekDrawer from "./PlaybookSneakPeekDrawer";

interface SampleChapterTriggerProps {
  buttonText?: string;
  className?: string;
  variant?: "outline" | "ghost" | "badge";
  defaultExcerptId?: string;
}

export default function SampleChapterTrigger({
  buttonText = "Preview Sample Chapter",
  className = "",
  variant = "outline",
  defaultExcerptId = "options-expiry-gamma",
}: SampleChapterTriggerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        id="sample-chapter-preview-trigger"
        className={
          className ||
          (variant === "outline"
            ? "inline-flex items-center justify-center gap-2 px-4 py-3 rounded-xl bg-panel/90 border border-hairline hover:border-forest/50 text-olive hover:text-forest text-xs sm:text-sm font-semibold transition-all shadow-xs backdrop-blur-sm group"
            : variant === "badge"
            ? "inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-forest-surface hover:bg-forest/15 border border-forest/20 text-forest text-[11px] font-bold tracking-wide transition-colors"
            : "inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-forest-dark transition-colors")
        }
      >
        <BookOpen className="w-3.5 h-3.5 text-forest group-hover:scale-110 transition-transform" />
        <span>{buttonText}</span>
        <span className="font-mono text-[10px] text-gold-text tracking-widest font-bold">FREE</span>
      </button>

      <PlaybookSneakPeekDrawer
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        defaultExcerptId={defaultExcerptId}
      />
    </>
  );
}

"use client";

import { motion } from "motion/react";

interface CourseProgressBarProps {
  completed: number;
  total?: number;
  label?: string;
  variant?: "default" | "hero";
}

export default function CourseProgressBar({
  completed,
  total = 12,
  label,
  variant = "default",
}: CourseProgressBarProps) {
  const safeTotal = Math.max(total, 1);
  const percentage = Math.min(Math.round((completed / safeTotal) * 100), 100);

  const isHero = variant === "hero";

  return (
    <div className="w-full mt-2 space-y-1.5">
      <div className="flex items-center justify-between text-[11px] font-mono">
        <span className={isHero ? "text-white/60 text-[10px]" : "text-ink-dim text-[10px]"}>
          {label || `${completed} of ${total} lessons completed`}
        </span>
        <span className={`font-bold ${isHero ? "text-gold" : "text-forest"}`}>
          {percentage}%
        </span>
      </div>

      <div
        className={`w-full overflow-hidden rounded-full h-2 relative ${
          isHero ? "bg-white/15" : "bg-hairline/80"
        }`}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{
            duration: 0.9,
            ease: [0.16, 1, 0.3, 1], // cinematic cubic-bezier
            delay: 0.15,
          }}
          className={`h-full rounded-full relative ${
            isHero
              ? "bg-gradient-to-r from-gold to-gold-text shadow-[0_0_8px_rgba(169,130,47,0.5)]"
              : "bg-gradient-to-r from-forest to-forest-dark"
          }`}
        >
          {/* Subtle moving shimmer highlight */}
          <motion.div
            initial={{ x: "-100%" }}
            animate={{ x: "200%" }}
            transition={{
              repeat: Infinity,
              duration: 2.4,
              ease: "linear",
              repeatDelay: 1,
            }}
            className="absolute inset-0 w-1/2 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12"
          />
        </motion.div>
      </div>
    </div>
  );
}

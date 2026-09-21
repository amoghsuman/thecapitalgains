"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1.6 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 30,
    stiffness: 100,
    duration: duration * 1000,
  });
  const isInView = useInView(ref, { once: true, margin: "-20px" });

  useEffect(() => {
    if (isInView) {
      motionValue.set(value);
    }
  }, [isInView, motionValue, value]);

  useEffect(() => {
    return springValue.on("change", (latest) => {
      if (ref.current) {
        ref.current.textContent = `${prefix}${Math.round(latest).toLocaleString("en-IN")}${suffix}`;
      }
    });
  }, [springValue, prefix, suffix]);

  return (
    <span ref={ref} className="tabular-nums">
      {prefix}0{suffix}
    </span>
  );
}

interface HeroStatsProps {
  courseCount: number;
}

export default function HeroStats({ courseCount }: HeroStatsProps) {
  const stats = [
    {
      value: courseCount || 6,
      prefix: "",
      suffix: "",
      label: "CURATED COURSES",
      subtitle: "Systematic modules",
    },
    {
      value: 1,
      prefix: "₹",
      suffix: "",
      label: "RESEARCH STARTS AT",
      subtitle: "Micro-priced tier",
    },
    {
      value: 3,
      prefix: "",
      suffix: "",
      label: "MODEL PORTFOLIOS",
      subtitle: "Live frameworks",
    },
  ];

  return (
    <div className="grid grid-cols-3 gap-4 sm:gap-8 pt-7 border-t border-hairline">
      {stats.map((s) => (
        <div key={s.label} className="space-y-1 group">
          <div className="text-2xl sm:text-3xl font-bold text-olive tracking-tight font-mono flex items-baseline">
            <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            {s.value > 1 && s.prefix === "" && (
              <span className="text-forest text-base ml-0.5 font-bold">+</span>
            )}
          </div>
          <div className="text-[10px] text-ink-dim tracking-[0.14em] font-semibold uppercase leading-tight group-hover:text-forest transition-colors">
            {s.label}
          </div>
          <div className="text-[11px] text-ink-muted hidden sm:block">
            {s.subtitle}
          </div>
        </div>
      ))}
    </div>
  );
}

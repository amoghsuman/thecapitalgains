"use client";

import { useEffect, useRef } from "react";
import { useInView, useMotionValue, useSpring } from "motion/react";

interface CounterProps {
  value: number;
  prefix?: string;
  suffix?: string;
  duration?: number;
}

function AnimatedCounter({ value, prefix = "", suffix = "", duration = 1.8 }: CounterProps) {
  const ref = useRef<HTMLSpanElement>(null);
  const motionValue = useMotionValue(0);
  const springValue = useSpring(motionValue, {
    damping: 24,
    stiffness: 85,
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
      value: courseCount > 0 ? courseCount : 6,
      prefix: "",
      suffix: "",
      label: "CURATED PLAYBOOKS",
      subtitle: "Systematic modules",
      showPlus: false,
    },
    {
      value: 12450,
      prefix: "",
      suffix: "",
      label: "ACTIVE STUDENTS",
      subtitle: "Across NSE & BSE",
      showPlus: true,
    },
    {
      value: 98,
      prefix: "",
      suffix: "%",
      label: "RIGOR RATING",
      subtitle: "Verified retail reviews",
      showPlus: false,
    },
    {
      value: 1,
      prefix: "₹",
      suffix: "",
      label: "MICRO-TIER ENTRY",
      subtitle: "Research starts at",
      showPlus: false,
    },
  ];

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 pt-7 border-t border-hairline">
      {stats.map((s) => (
        <div key={s.label} className="space-y-1 group">
          <div className="text-2xl sm:text-3xl font-bold text-olive tracking-tight font-mono flex items-baseline">
            <AnimatedCounter value={s.value} prefix={s.prefix} suffix={s.suffix} />
            {s.showPlus && (
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

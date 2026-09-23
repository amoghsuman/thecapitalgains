"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useSpring, useMotionValue } from "motion/react";

interface FeaturedCardTrendGraphProps {
  cursorPos?: { x: number; y: number } | null;
}

export default function FeaturedCardTrendGraph({ cursorPos }: FeaturedCardTrendGraphProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [dimensions, setDimensions] = useState({ width: 520, height: 400 });
  const [isHovered, setIsHovered] = useState(false);

  // Mouse coordinate motion values for spring-smoothed parallax tracking
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  const springX = useSpring(mouseX, { stiffness: 60, damping: 18 });
  const springY = useSpring(mouseY, { stiffness: 60, damping: 18 });

  // Update when local card hover coordinates change
  useEffect(() => {
    if (cursorPos) {
      mouseX.set(cursorPos.x * 24);
      mouseY.set(cursorPos.y * 18);
      setIsHovered(true);
    } else {
      setIsHovered(false);
    }
  }, [cursorPos, mouseX, mouseY]);

  // Fallback to window mouse movement if card isn't hovered directly
  useEffect(() => {
    const handleWindowMouseMove = (e: MouseEvent) => {
      if (isHovered || !containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const relX = (e.clientX - (rect.left + rect.width / 2)) / (rect.width);
      const relY = (e.clientY - (rect.top + rect.height / 2)) / (rect.height);

      // Soft clamp
      const clampedX = Math.max(-1, Math.min(1, relX));
      const clampedY = Math.max(-1, Math.min(1, relY));

      mouseX.set(clampedX * 14);
      mouseY.set(clampedY * 10);
    };

    window.addEventListener("mousemove", handleWindowMouseMove, { passive: true });
    return () => window.removeEventListener("mousemove", handleWindowMouseMove);
  }, [isHovered, mouseX, mouseY]);

  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        if (entry.contentRect.width > 0 && entry.contentRect.height > 0) {
          setDimensions({
            width: Math.round(entry.contentRect.width),
            height: Math.round(entry.contentRect.height),
          });
        }
      }
    });

    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Multi-layered financial trend-line coordinate paths
  const primaryTrend = "M 10 320 Q 90 280, 160 295 T 260 210 T 360 240 T 440 130 T 520 80";
  const secondaryTrend = "M 10 350 C 120 340, 200 310, 280 260 S 400 170, 520 110";
  const alphaSpike = "M 120 310 L 220 230 L 280 270 L 380 180 L 460 110 L 520 70";

  return (
    <div
      ref={containerRef}
      className="absolute -inset-4 sm:-inset-6 pointer-events-none overflow-hidden select-none z-0 rounded-3xl"
      aria-hidden="true"
    >
      <motion.div
        style={{
          x: springX,
          y: springY,
        }}
        className="w-full h-full relative"
      >
        <svg
          viewBox="0 0 520 380"
          preserveAspectRatio="none"
          className="w-full h-full opacity-65 transition-opacity duration-300 group-hover:opacity-95"
        >
          <defs>
            <linearGradient id="cardTrendGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#2c5e43" stopOpacity="0.05" />
              <stop offset="35%" stopColor="#2c5e43" stopOpacity="0.5" />
              <stop offset="70%" stopColor="#b4832c" stopOpacity="0.85" />
              <stop offset="100%" stopColor="#2c5e43" stopOpacity="0.3" />
            </linearGradient>

            <linearGradient id="cardAreaFill" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#2c5e43" stopOpacity="0.14" />
              <stop offset="100%" stopColor="#2c5e43" stopOpacity="0" />
            </linearGradient>

            <filter id="softTrendGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3.5" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Area under primary trend curve */}
          <path
            d={`${primaryTrend} L 520 380 L 10 380 Z`}
            fill="url(#cardAreaFill)"
            opacity="0.45"
          />

          {/* Precision institutional grid */}
          <g stroke="#1e3a2b" strokeWidth="0.75" opacity="0.12" strokeDasharray="3 4">
            <line x1="0" y1="90" x2="520" y2="90" />
            <line x1="0" y1="180" x2="520" y2="180" />
            <line x1="0" y1="270" x2="520" y2="270" />
            <line x1="130" y1="0" x2="130" y2="380" />
            <line x1="260" y1="0" x2="260" y2="380" />
            <line x1="390" y1="0" x2="390" y2="380" />
          </g>

          {/* Baseline Support */}
          <path
            d="M 10 360 L 520 360"
            stroke="#1e3a2b"
            strokeWidth="1"
            strokeDasharray="4 6"
            opacity="0.25"
          />

          {/* Micro High-frequency Trajectory */}
          <motion.path
            d={alphaSpike}
            fill="none"
            stroke="#2c5e43"
            strokeWidth="1"
            strokeDasharray="3 5"
            opacity="0.4"
            animate={{ strokeDashoffset: [-60, 0] }}
            transition={{ duration: 18, repeat: Infinity, ease: "linear" }}
          />

          {/* Secondary Trend Line */}
          <motion.path
            d={secondaryTrend}
            fill="none"
            stroke="#b4832c"
            strokeWidth="1.4"
            strokeDasharray="5 7"
            opacity="0.35"
            animate={{ strokeDashoffset: -120 }}
            transition={{ duration: 22, repeat: Infinity, ease: "linear" }}
          />

          {/* Primary Trend Line with Laser Glow */}
          <motion.path
            d={primaryTrend}
            fill="none"
            stroke="url(#cardTrendGlow)"
            strokeWidth="2.4"
            filter="url(#softTrendGlow)"
            animate={{ strokeDashoffset: -200 }}
            transition={{ duration: 26, repeat: Infinity, ease: "linear" }}
          />

          {/* Dynamic Nodes with Pulsing Concentric Rings */}
          <g>
            <motion.circle
              cx="260"
              cy="210"
              r="3.5"
              fill="#b4832c"
              animate={{ r: [3, 5, 3], opacity: [0.6, 1, 0.6] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
            <motion.circle
              cx="260"
              cy="210"
              r="8"
              fill="none"
              stroke="#b4832c"
              strokeWidth="1"
              animate={{ r: [6, 12, 6], opacity: [0.4, 0, 0.4] }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          <g>
            <motion.circle
              cx="440"
              cy="130"
              r="4"
              fill="#2c5e43"
              animate={{ r: [3.5, 6, 3.5], opacity: [0.7, 1, 0.7] }}
              transition={{ duration: 3.5, repeat: Infinity, ease: "easeInOut", delay: 0.8 }}
            />
          </g>

          <g>
            <motion.circle
              cx="520"
              cy="80"
              r="4.5"
              fill="#1e3a2b"
              stroke="#b4832c"
              strokeWidth="2"
              animate={{ scale: [1, 1.3, 1], opacity: [0.8, 1, 0.8] }}
              transition={{ duration: 2.2, repeat: Infinity, ease: "easeInOut" }}
            />
          </g>

          {/* Institutional Telemetry text label */}
          <text
            x="490"
            y="62"
            textAnchor="end"
            className="font-mono text-[8px] fill-gold font-bold tracking-widest uppercase opacity-85"
          >
            NIFTY_F&amp;O_DYNAMIC_SURFACE // +34.2%
          </text>
        </svg>
      </motion.div>
    </div>
  );
}

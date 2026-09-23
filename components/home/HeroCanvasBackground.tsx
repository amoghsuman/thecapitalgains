"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";
import HeroMarketDataOverlay from "@/components/home/HeroMarketDataOverlay";

export default function HeroCanvasBackground() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const { scrollY } = useScroll();

  const canvasY = useTransform(scrollY, [0, 600], [0, 80]);
  const glowOrbY = useTransform(scrollY, [0, 600], [0, 120]);
  const secondaryOrbY = useTransform(scrollY, [0, 600], [0, 50]);
  const subtleRotate = useTransform(scrollY, [0, 600], [0, 6]);
  const counterRotate = useTransform(scrollY, [0, 600], [0, -5]);
  const opacityFade = useTransform(scrollY, [0, 500], [1, 0.4]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let width = (canvas.width = canvas.parentElement?.clientWidth || window.innerWidth);
    let height = (canvas.height = canvas.parentElement?.clientHeight || 650);

    const handleResize = () => {
      if (!canvas || !canvas.parentElement) return;
      width = canvas.width = canvas.parentElement.clientWidth;
      height = canvas.height = canvas.parentElement.clientHeight;
    };

    window.addEventListener("resize", handleResize);

    const nodeCount = 36;
    const nodes: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      radius: number;
      alpha: number;
      label?: string;
    }> = [];

    const labels = ["NIFTY", "BANKNIFTY", "ROCE", "WACC", "FCF", "IV_P", "THETA", "DELTA", "ALPHA"];

    // Decorative only: a fixed pseudo-random layout (mulberry32, seed 7) so the
    // field is identical on every load and nothing here is a market value.
    let seed = 7;
    const rand = () => {
      seed = (seed + 0x6d2b79f5) | 0;
      let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: rand() * width,
        y: rand() * height,
        vx: (rand() - 0.5) * 0.35,
        vy: (rand() - 0.5) * 0.35,
        radius: rand() * 1.5 + 1,
        alpha: rand() * 0.4 + 0.15,
        label: i < labels.length ? labels[i] : undefined,
      });
    }

    const render = () => {
      ctx.clearRect(0, 0, width, height);

      // Subtle coordinate grid dots
      const gridSize = 48;
      ctx.fillStyle = "rgba(44, 94, 67, 0.04)";
      for (let x = 0; x < width; x += gridSize) {
        for (let y = 0; y < height; y += gridSize) {
          ctx.beginPath();
          ctx.arc(x, y, 0.8, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(44, 94, 67, ${node.alpha})`;
        ctx.fill();

        if (node.label && i % 3 === 0) {
          ctx.font = "9px monospace";
          ctx.fillStyle = "rgba(110, 106, 95, 0.45)";
          ctx.fillText(node.label, node.x + 6, node.y + 3);
        }

        for (let j = i + 1; j < nodes.length; j++) {
          const other = nodes[j];
          const dx = other.x - node.x;
          const dy = other.y - node.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < 110) {
            ctx.beginPath();
            ctx.moveTo(node.x, node.y);
            ctx.lineTo(other.x, other.y);
            ctx.strokeStyle = `rgba(169, 130, 47, ${(1 - dist / 110) * 0.14})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
          }
        }
      }

      animationFrameId = requestAnimationFrame(render);
    };

    render();

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  return (
    <div ref={containerRef} className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden="true">
      {/* Background glowing gradients */}
      <motion.div
        style={{ y: glowOrbY, rotate: subtleRotate, opacity: opacityFade }}
        className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-gold/10 via-forest/5 to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: secondaryOrbY, rotate: counterRotate, opacity: opacityFade }}
        className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-forest/10 via-gold/5 to-transparent blur-3xl"
      />

      {/* Network Particle Canvas */}
      <motion.div
        style={{ y: canvasY, opacity: opacityFade }}
        className="absolute inset-0 w-full h-full"
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full opacity-80"
          aria-hidden="true"
        />
      </motion.div>

      {/* Cinematic Animated SVG Market Data Wave Overlay */}
      <HeroMarketDataOverlay />

      {/* Edge gradient blending */}
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ivory via-ivory/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ivory via-ivory/50 to-transparent" />
    </div>
  );
}

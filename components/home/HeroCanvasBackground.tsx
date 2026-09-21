"use client";

import { useEffect, useRef } from "react";
import { motion, useScroll, useTransform } from "motion/react";

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

    const labels = ["NIFTY", "DELTA", "THETA", "IV", "PE 22.4", "CAGR", "BETA", "ROCE", "WACC", "GAMMA"];

    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.3,
        vy: (Math.random() - 0.5) * 0.3,
        radius: Math.random() * 2 + 1,
        alpha: Math.random() * 0.35 + 0.15,
        label: i < labels.length ? labels[i] : undefined,
      });
    }

    let time = 0;

    const render = () => {
      time += 0.007;
      ctx.clearRect(0, 0, width, height);

      // Isometric grid lines
      ctx.strokeStyle = "rgba(223, 217, 200, 0.35)";
      ctx.lineWidth = 0.5;

      const gridSize = 65;
      for (let x = 0; x < width; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, height);
        ctx.stroke();
      }

      for (let y = 0; y < height; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(width, y);
        ctx.stroke();
      }

      // Smooth flowing sine price wave (Gold glow)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(169, 130, 47, 0.18)";
      ctx.lineWidth = 1.5;
      for (let x = 0; x < width; x += 10) {
        const y =
          height * 0.65 +
          Math.sin(x * 0.004 + time) * 32 +
          Math.cos(x * 0.008 - time * 0.6) * 16;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Second harmonic wave (Forest Green)
      ctx.beginPath();
      ctx.strokeStyle = "rgba(27, 58, 43, 0.14)";
      ctx.lineWidth = 1.2;
      for (let x = 0; x < width; x += 10) {
        const y =
          height * 0.45 +
          Math.sin(x * 0.005 - time * 0.8) * 26 +
          Math.sin(x * 0.002 + time * 0.5) * 18;
        if (x === 0) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }
      ctx.stroke();

      // Draw and link nodes
      for (let i = 0; i < nodes.length; i++) {
        const node = nodes[i];
        node.x += node.vx;
        node.y += node.vy;

        if (node.x < 0 || node.x > width) node.vx *= -1;
        if (node.y < 0 || node.y > height) node.vy *= -1;

        ctx.beginPath();
        ctx.arc(node.x, node.y, node.radius, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(27, 58, 43, ${node.alpha})`;
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
      <motion.div
        style={{ y: glowOrbY, rotate: subtleRotate, opacity: opacityFade }}
        className="absolute -top-32 -left-20 w-96 h-96 rounded-full bg-gradient-to-br from-gold/10 via-forest/5 to-transparent blur-3xl"
      />
      <motion.div
        style={{ y: secondaryOrbY, rotate: counterRotate, opacity: opacityFade }}
        className="absolute top-1/4 -right-24 w-[480px] h-[480px] rounded-full bg-gradient-to-bl from-forest/10 via-gold/5 to-transparent blur-3xl"
      />
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
      <div className="absolute inset-x-0 top-0 h-24 bg-gradient-to-b from-ivory via-ivory/40 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-ivory via-ivory/50 to-transparent" />
    </div>
  );
}

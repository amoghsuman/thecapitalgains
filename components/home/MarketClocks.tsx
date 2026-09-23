"use client";

import { useEffect, useState } from "react";
import { Globe, Clock } from "lucide-react";

interface ClockConfig {
  label: string;
  sub: string;
  timeZone: string;
  openHour: number; // local market open hour
  openMin: number;
  closeHour: number; // local market close hour
  closeMin: number;
}

const MARKETS: ClockConfig[] = [
  {
    label: "NSE / BSE (Mumbai)",
    sub: "IST (UTC+5:30)",
    timeZone: "Asia/Kolkata",
    openHour: 9,
    openMin: 15,
    closeHour: 15,
    closeMin: 30,
  },
  {
    label: "NYSE / NASDAQ (New York)",
    sub: "EST (UTC-4/-5)",
    timeZone: "America/New_York",
    openHour: 9,
    openMin: 30,
    closeHour: 16,
    closeMin: 0,
  },
  {
    label: "LSE (London)",
    sub: "GMT/BST (UTC+0/+1)",
    timeZone: "Europe/London",
    openHour: 8,
    openMin: 0,
    closeHour: 16,
    closeMin: 30,
  },
  {
    label: "TSE (Tokyo)",
    sub: "JST (UTC+9:00)",
    timeZone: "Asia/Tokyo",
    openHour: 9,
    openMin: 0,
    closeHour: 15,
    closeMin: 0,
  },
];

function AnalogClockFace({
  timeZone,
  openHour,
  openMin,
  closeHour,
  closeMin,
}: {
  timeZone: string;
  openHour: number;
  openMin: number;
  closeHour: number;
  closeMin: number;
}) {
  const [angles, setAngles] = useState({ hour: 0, minute: 0, second: 0 });
  const [digitalTime, setDigitalTime] = useState("");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const update = () => {
      const now = new Date();
      // Format to specific timezone
      const formatter = new Intl.DateTimeFormat("en-US", {
        timeZone,
        hour: "numeric",
        minute: "numeric",
        second: "numeric",
        hour12: false,
        weekday: "short",
      });

      const parts = formatter.formatToParts(now);
      const h = parseInt(parts.find((p) => p.type === "hour")?.value || "0", 10);
      const m = parseInt(parts.find((p) => p.type === "minute")?.value || "0", 10);
      const s = parseInt(parts.find((p) => p.type === "second")?.value || "0", 10);
      const weekday = parts.find((p) => p.type === "weekday")?.value || "";

      const secondAngle = s * 6;
      const minuteAngle = m * 6 + s * 0.1;
      const hourAngle = (h % 12) * 30 + m * 0.5;

      setAngles({ hour: hourAngle, minute: minuteAngle, second: secondAngle });
      setDigitalTime(
        `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`
      );

      // Check market open (Mon-Fri)
      const isWeekend = weekday === "Sat" || weekday === "Sun";
      const totalMinutes = h * 60 + m;
      const openTotal = openHour * 60 + openMin;
      const closeTotal = closeHour * 60 + closeMin;
      const openNow = !isWeekend && totalMinutes >= openTotal && totalMinutes < closeTotal;
      setIsOpen(openNow);
    };

    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [timeZone, openHour, openMin, closeHour, closeMin]);

  return (
    <div className="flex flex-col items-center">
      {/* Dial SVG */}
      <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full bg-ivory border border-hairline shadow-inner flex items-center justify-center">
        {/* Hour markers */}
        <div className="absolute inset-1 rounded-full pointer-events-none">
          {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((deg) => (
            <div
              key={deg}
              className="absolute top-0 left-1/2 -translate-x-1/2 w-0.5 h-1.5 origin-bottom"
              style={{
                transform: `rotate(${deg}deg) translateY(1px)`,
                backgroundColor: deg % 90 === 0 ? "#1b3323" : "#cbd5e1",
              }}
            />
          ))}
        </div>

        {/* Hour hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-3.5 bg-olive origin-top rounded-full shadow-xs pointer-events-none"
          style={{
            transform: `translate(-50%, -100%) rotate(${angles.hour}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Minute hand */}
        <div
          className="absolute top-1/2 left-1/2 w-0.5 h-5 bg-ink origin-top rounded-full pointer-events-none"
          style={{
            transform: `translate(-50%, -100%) rotate(${angles.minute}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Second hand */}
        <div
          className="absolute top-1/2 left-1/2 w-[1px] h-5.5 bg-gold origin-top pointer-events-none"
          style={{
            transform: `translate(-50%, -100%) rotate(${angles.second}deg)`,
            transformOrigin: "bottom center",
          }}
        />

        {/* Center pivot pin */}
        <div className="absolute w-1.5 h-1.5 rounded-full bg-forest border border-white z-10" />
      </div>

      {/* Digital clock readout + status */}
      <div className="mt-1 text-center font-mono">
        <div className="text-[11px] font-bold text-olive">{digitalTime || "--:--:--"}</div>
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <span
            className={`w-1.5 h-1.5 rounded-full ${
              isOpen ? "bg-forest animate-pulse" : "bg-ink-muted"
            }`}
          />
          <span
            className={`text-[9px] font-bold uppercase tracking-wider ${
              isOpen ? "text-forest" : "text-ink-dim"
            }`}
          >
            {isOpen ? "LIVE TRADING" : "CLOSED"}
          </span>
        </div>
      </div>
    </div>
  );
}

export default function MarketClocks() {
  return (
    <div
      id="global-market-clocks-bar"
      className="w-full bg-panel/90 backdrop-blur-xs border border-hairline rounded-2xl p-4 sm:p-5 shadow-xs"
    >
      <div className="flex items-center justify-between pb-3 mb-3 border-b border-hairline">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-forest" />
          <span className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase">
            GLOBAL MARKET OBSERVATORY
          </span>
        </div>
        <div className="flex items-center gap-1.5 text-[10px] font-mono text-ink-dim">
          <Clock className="w-3 h-3 text-ink-muted" />
          <span>Real-time Trading Windows &middot; Synchronized</span>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {MARKETS.map((m) => (
          <div
            key={m.label}
            className="flex flex-col items-center text-center p-2 rounded-xl bg-ivory/60 border border-hairline hover:border-forest/30 transition-colors"
          >
            <AnalogClockFace
              timeZone={m.timeZone}
              openHour={m.openHour}
              openMin={m.openMin}
              closeHour={m.closeHour}
              closeMin={m.closeMin}
            />
            <div className="mt-2">
              <div className="text-xs font-bold text-olive leading-tight">{m.label}</div>
              <div className="text-[10px] font-mono text-ink-dim mt-0.5">{m.sub}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

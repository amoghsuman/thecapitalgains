"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Activity, BookOpen, Layers, HelpCircle, Shield } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "labs", label: "Labs", targetId: "terminal-lab" },
  { id: "pillars", label: "Pillars", targetId: "three-pillars-section" },
  { id: "tracks", label: "Tracks", targetId: "curated-tracks-section" },
  { id: "comparison", label: "Rigor", targetId: "institutional-rigor-section" },
  { id: "faq", label: "FAQ", targetId: "faq-section" },
];

export default function FloatingJumpDock() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      // Show dock once user scrolls past 450px
      if (window.scrollY > 450) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Detect which section is currently closest to viewport top
      for (let i = NAV_ITEMS.length - 1; i >= 0; i--) {
        const item = NAV_ITEMS[i];
        const el = document.getElementById(item.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 260) {
            setActiveSection(item.id);
            return;
          }
        }
      }
      setActiveSection("");
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  const scrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      const topOffset = 80;
      const elementPosition = el.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - topOffset;
      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-5 left-1/2 -translate-x-1/2 z-40 max-w-[92vw] sm:max-w-fit"
          id="floating-navigation-dock"
        >
          <div className="bg-panel/95 backdrop-blur-md border border-hairline/90 shadow-xl rounded-full px-2 sm:px-3 py-1.5 flex items-center gap-1 sm:gap-1.5 ring-1 ring-forest/10">
            {NAV_ITEMS.map((item) => {
              const isActive = activeSection === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => scrollToSection(item.targetId)}
                  className={`px-2.5 sm:px-3 py-1 rounded-full text-xs font-semibold transition-all whitespace-nowrap ${
                    isActive
                      ? "bg-forest text-white shadow-xs font-bold"
                      : "text-ink-dim hover:text-ink hover:bg-ivory"
                  }`}
                >
                  {item.label}
                </button>
              );
            })}

            {/* Divider */}
            <div className="w-px h-4 bg-hairline mx-0.5" />

            {/* Scroll To Top Button */}
            <button
              type="button"
              onClick={scrollToTop}
              title="Back to top"
              className="p-1 sm:px-2 sm:py-1 rounded-full text-ink-dim hover:text-forest hover:bg-ivory transition-colors flex items-center gap-1 text-xs font-medium"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-3.5 h-3.5" />
              <span className="hidden sm:inline text-[11px] font-mono">TOP</span>
            </button>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

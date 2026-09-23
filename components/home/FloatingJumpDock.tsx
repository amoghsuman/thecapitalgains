"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { ArrowUp, Activity, BookOpen, Layers, HelpCircle, Shield, Compass, Sparkles } from "lucide-react";

interface NavItem {
  id: string;
  label: string;
  targetId: string;
}

const NAV_ITEMS: NavItem[] = [
  { id: "intel", label: "Sentiment & Lexicon", targetId: "market-intelligence-hub" },
  { id: "playbook", label: "Playbook", targetId: "tactile-playbook-stage" },
  { id: "observatory", label: "Observatory", targetId: "market-observatory-section" },
  { id: "labs", label: "Option Labs", targetId: "terminal-lab" },
  { id: "forensic", label: "Forensic", targetId: "forensic-screener-section" },
  { id: "wealth", label: "Friction", targetId: "wealth-friction-lab-section" },
  { id: "quiz", label: "Quiz", targetId: "concept-logic-quiz-section" },
  { id: "pillars", label: "Pillars", targetId: "three-pillars-section" },
  { id: "tracks", label: "Tracks", targetId: "curated-tracks-section" },
  { id: "faq", label: "FAQ", targetId: "faq-section" },
];

export default function FloatingJumpDock() {
  const [isVisible, setIsVisible] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("");

  useEffect(() => {
    const handleScroll = () => {
      // Show dock after scrolling down 400px
      if (window.scrollY > 400) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }

      // Detect active section
      for (const item of NAV_ITEMS) {
        const el = document.getElementById(item.targetId);
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 200 && rect.bottom >= 200) {
            setActiveSection(item.id);
            break;
          }
        }
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToSection = (targetId: string) => {
    const el = document.getElementById(targetId);
    if (el) {
      el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 30 }}
          transition={{ duration: 0.25 }}
          className="fixed bottom-6 left-1/2 -translate-x-1/2 z-40 hidden sm:flex items-center gap-1.5 p-1.5 rounded-full bg-olive/95 backdrop-blur-md border border-hairline/20 shadow-xl text-white font-mono text-[11px] max-w-[95vw] overflow-x-auto"
        >
          {NAV_ITEMS.map((item) => (
            <button
              key={item.id}
              onClick={() => scrollToSection(item.targetId)}
              className={`px-3 py-1.5 rounded-full transition-all whitespace-nowrap cursor-pointer ${
                activeSection === item.id
                  ? "bg-forest text-white font-bold shadow-xs"
                  : "text-white/70 hover:text-white hover:bg-white/10"
              }`}
            >
              {item.label}
            </button>
          ))}

          <div className="w-[1px] h-4 bg-white/20 mx-1 shrink-0" />

          <button
            onClick={scrollToTop}
            aria-label="Scroll to top"
            className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors shrink-0 cursor-pointer"
          >
            <ArrowUp className="w-3.5 h-3.5" />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

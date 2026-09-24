"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { Terminal, Activity, BarChart2, ShieldAlert, TrendingUp, HelpCircle, Compass } from "lucide-react";
import InteractiveTerminalVisual from "./InteractiveTerminalVisual";
import ForensicRedFlagSimulator from "./ForensicRedFlagSimulator";
import WealthFrictionCompoundingLab from "./WealthFrictionCompoundingLab";
import ConceptLogicQuiz from "./ConceptLogicQuiz";
import InteractiveScenarioCheck from "./InteractiveScenarioCheck";

interface LabTab {
  id: string;
  hash: string;
  label: string;
  icon: typeof Activity;
}

const LAB_TABS: LabTab[] = [
  { id: "options-greeks", hash: "#options-greeks", label: "Options & Greeks", icon: Activity },
  { id: "dcf-valuation", hash: "#dcf-valuation", label: "DCF & Valuation", icon: BarChart2 },
  { id: "forensic-red-flags", hash: "#forensic-red-flags", label: "Forensic Red Flags", icon: ShieldAlert },
  { id: "compounding-friction", hash: "#compounding-friction", label: "Compounding & Friction", icon: TrendingUp },
  { id: "concept-quiz", hash: "#concept-quiz", label: "Concept Quiz", icon: HelpCircle },
  { id: "institutional-instincts", hash: "#institutional-instincts", label: "Institutional Instincts", icon: Compass },
];

export default function HomeLabsSection() {
  const [activeTabId, setActiveTabId] = useState<string>("options-greeks");
  const tabListRef = useRef<HTMLDivElement>(null);

  // Sync with URL hash on mount and hashchange
  useEffect(() => {
    const handleHash = () => {
      const hash = window.location.hash;
      const matched = LAB_TABS.find((t) => t.hash === hash);
      if (matched) {
        setActiveTabId(matched.id);
      }
    };

    handleHash();
    window.addEventListener("hashchange", handleHash);
    return () => window.removeEventListener("hashchange", handleHash);
  }, []);

  const selectTab = useCallback((tab: LabTab) => {
    setActiveTabId(tab.id);
    if (typeof window !== "undefined") {
      window.history.replaceState(null, "", tab.hash);
    }
  }, []);

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    let targetIndex = -1;
    if (e.key === "ArrowRight") {
      targetIndex = (index + 1) % LAB_TABS.length;
    } else if (e.key === "ArrowLeft") {
      targetIndex = (index - 1 + LAB_TABS.length) % LAB_TABS.length;
    } else if (e.key === "Home") {
      targetIndex = 0;
    } else if (e.key === "End") {
      targetIndex = LAB_TABS.length - 1;
    }

    if (targetIndex >= 0) {
      e.preventDefault();
      const targetTab = LAB_TABS[targetIndex];
      selectTab(targetTab);
      const buttons = tabListRef.current?.querySelectorAll<HTMLButtonElement>('[role="tab"]');
      buttons?.[targetIndex]?.focus();
    }
  };

  return (
    <section id="labs-section" className="py-16 md:py-24 bg-panel border-b border-hairline">
      <div className="site-container space-y-8">
        {/* Section Header */}
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-2 font-mono text-[11px] text-gold tracking-[0.16em] font-bold uppercase">
            <Terminal className="w-3.5 h-3.5 text-gold" />
            <span>Applied Financial Labs</span>
          </div>
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold text-olive tracking-tight">
            Interactive Curriculum Simulators
          </h2>
          <p className="text-ink-dim text-sm sm:text-base leading-relaxed">
            We replace abstract lectures with hands-on models. Test option payoffs, run DCF models, audit forensic red flags, measure compounding friction, test concept logic, and calibrate institutional instincts.
          </p>
        </div>

        {/* Tab Navigation Row: Pill style, mobile horizontal scroll with visible edges */}
        <div className="relative">
          <div
            ref={tabListRef}
            role="tablist"
            aria-label="Applied Financial Labs Navigation"
            className="flex items-center gap-2 overflow-x-auto pb-2 sm:pb-0 scrollbar-thin scrollbar-thumb-hairline border-b sm:border-b-0 border-hairline"
          >
            {LAB_TABS.map((tab, idx) => {
              const isActive = tab.id === activeTabId;
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  id={`tab-${tab.id}`}
                  role="tab"
                  aria-selected={isActive}
                  aria-controls={`panel-${tab.id}`}
                  tabIndex={isActive ? 0 : -1}
                  onClick={() => selectTab(tab)}
                  onKeyDown={(e) => handleKeyDown(e, idx)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer shrink-0 ${
                    isActive
                      ? "bg-forest text-white shadow-xs font-bold ring-2 ring-forest/20"
                      : "bg-ivory hover:bg-white text-ink-dim hover:text-ink border border-hairline hover:border-forest/30"
                  }`}
                >
                  <Icon className={`w-3.5 h-3.5 ${isActive ? "text-white" : "text-ink-dim"}`} />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Active Lab Panel */}
        <div className="pt-2">
          {activeTabId === "options-greeks" && (
            <div
              id="panel-options-greeks"
              role="tabpanel"
              aria-labelledby="tab-options-greeks"
              tabIndex={0}
            >
              <InteractiveTerminalVisual
                initialTab="options"
                forcedTab="options"
                hideInternalTabs={true}
              />
            </div>
          )}

          {activeTabId === "dcf-valuation" && (
            <div
              id="panel-dcf-valuation"
              role="tabpanel"
              aria-labelledby="tab-dcf-valuation"
              tabIndex={0}
            >
              <InteractiveTerminalVisual
                initialTab="valuation"
                forcedTab="valuation"
                hideInternalTabs={true}
              />
            </div>
          )}

          {activeTabId === "forensic-red-flags" && (
            <div
              id="panel-forensic-red-flags"
              role="tabpanel"
              aria-labelledby="tab-forensic-red-flags"
              tabIndex={0}
            >
              <ForensicRedFlagSimulator />
            </div>
          )}

          {activeTabId === "compounding-friction" && (
            <div
              id="panel-compounding-friction"
              role="tabpanel"
              aria-labelledby="tab-compounding-friction"
              tabIndex={0}
            >
              <WealthFrictionCompoundingLab />
            </div>
          )}

          {activeTabId === "concept-quiz" && (
            <div
              id="panel-concept-quiz"
              role="tabpanel"
              aria-labelledby="tab-concept-quiz"
              tabIndex={0}
            >
              <ConceptLogicQuiz />
            </div>
          )}

          {activeTabId === "institutional-instincts" && (
            <div
              id="panel-institutional-instincts"
              role="tabpanel"
              aria-labelledby="tab-institutional-instincts"
              tabIndex={0}
            >
              <InteractiveScenarioCheck />
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

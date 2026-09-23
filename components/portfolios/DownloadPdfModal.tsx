"use client";

import { FileText, Printer } from "lucide-react";
import type { Portfolio } from "@/lib/portfolios/types";

interface DownloadPdfModalProps {
  portfolio: Portfolio;
  isOpen: boolean;
  onClose: () => void;
}

// Printing is the browser's own "save as PDF"; nothing is generated server-side.
export default function DownloadPdfModal({ portfolio, isOpen, onClose }: DownloadPdfModalProps) {
  if (!isOpen) return null;

  const handlePrint = () => {
    onClose();
    window.setTimeout(() => window.print(), 150);
  };

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-olive/80 backdrop-blur-sm animate-in fade-in duration-200"
    >
      <div className="bg-panel border border-hairline rounded-2xl max-w-lg w-full p-6 sm:p-7 shadow-2xl space-y-5">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-forest-surface border border-hairline flex items-center justify-center text-forest">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="font-mono text-[10px] text-gold font-bold tracking-widest uppercase">Print</div>
              <h3 className="text-lg font-bold text-olive">Print this page</h3>
            </div>
          </div>
          <button
            onClick={onClose}
            className="text-ink-dim hover:text-ink text-sm p-1 rounded-md hover:bg-forest-surface transition-colors"
          >
            ✕
          </button>
        </div>

        <div className="p-3.5 bg-ivory rounded-xl border border-hairline text-xs space-y-1.5">
          <div className="font-semibold text-olive">Portfolio: {portfolio.name}</div>
          <p className="text-ink-dim leading-relaxed text-[11px]">
            Opens your browser&apos;s print dialog, where you can save the page as a PDF.
          </p>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-mono text-ink-dim hover:text-ink transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-print-btn"
            onClick={handlePrint}
            className="px-5 py-2.5 rounded-xl bg-forest hover:bg-forest-dark text-white font-bold text-xs inline-flex items-center gap-2 shadow-xs transition-all cursor-pointer"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print this page</span>
          </button>
        </div>
      </div>
    </div>
  );
}

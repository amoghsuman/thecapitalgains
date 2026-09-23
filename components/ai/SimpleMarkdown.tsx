"use client";

import React from "react";

// Lightweight, bulletproof Markdown renderer without ESM bundling conflicts
export default function SimpleMarkdown({ content }: { content: string }) {
  if (!content) return null;

  // Split into paragraphs / code blocks
  const parts = content.split(/(```[\s\S]*?```)/g);

  return (
    <div className="space-y-2 text-xs sm:text-[13px] leading-relaxed">
      {parts.map((part, index) => {
        if (part.startsWith("```") && part.endsWith("```")) {
          const lines = part.slice(3, -3).trim().split("\n");
          const firstLine = lines[0].trim();
          const isLanguageTag = /^[a-zA-Z0-9_-]+$/.test(firstLine);
          const language = isLanguageTag ? firstLine : "";
          const code = (isLanguageTag ? lines.slice(1) : lines).join("\n");

          return (
            <div key={index} className="my-2 rounded-lg bg-olive-surface border border-hairline overflow-hidden font-mono text-[11px]">
              {language && (
                <div className="px-3 py-1 bg-hairline/40 text-ink-muted text-[10px] uppercase font-bold tracking-wider">
                  {language}
                </div>
              )}
              <pre className="p-3 overflow-x-auto text-olive leading-normal">
                <code>{code}</code>
              </pre>
            </div>
          );
        }

        // Render normal markdown blocks (paragraphs, bullets, bold)
        const paragraphs = part.split(/\n\n+/);
        return (
          <React.Fragment key={index}>
            {paragraphs.map((para, pIdx) => {
              const lines = para.split("\n");
              const isList = lines.some((l) => /^\s*([•*-]|\d+\.)\s+/.test(l));

              if (isList) {
                return (
                  <ul key={pIdx} className="space-y-1 my-1.5 pl-4 list-disc marker:text-forest">
                    {lines.map((line, lIdx) => {
                      const cleanLine = line.replace(/^\s*([•*-]|\d+\.)\s+/, "");
                      if (!cleanLine.trim()) return null;
                      return (
                        <li key={lIdx} className="leading-relaxed">
                          {renderFormattedText(cleanLine)}
                        </li>
                      );
                    })}
                  </ul>
                );
              }

              if (para.startsWith("### ")) {
                return (
                  <h4 key={pIdx} className="font-bold text-olive text-sm mt-3 mb-1">
                    {renderFormattedText(para.replace("### ", ""))}
                  </h4>
                );
              }

              if (para.startsWith("## ")) {
                return (
                  <h3 key={pIdx} className="font-bold text-olive text-base mt-4 mb-1">
                    {renderFormattedText(para.replace("## ", ""))}
                  </h3>
                );
              }

              if (para.startsWith("# ")) {
                return (
                  <h2 key={pIdx} className="font-bold text-olive text-lg mt-4 mb-2">
                    {renderFormattedText(para.replace("# ", ""))}
                  </h2>
                );
              }

              if (!para.trim()) return null;

              return (
                <p key={pIdx} className="leading-relaxed">
                  {renderFormattedText(para)}
                </p>
              );
            })}
          </React.Fragment>
        );
      })}
    </div>
  );
}

function renderFormattedText(text: string): React.ReactNode {
  // Parse inline `code`, **bold**, *italic*
  const tokens = text.split(/(`[^`]+`|\*\*[^*]+\*\*|\*[^*]+\*)/g);

  return tokens.map((token, i) => {
    if (token.startsWith("`") && token.endsWith("`")) {
      return (
        <code key={i} className="px-1.5 py-0.5 rounded bg-panel font-mono text-[11px] text-olive font-semibold border border-hairline/80">
          {token.slice(1, -1)}
        </code>
      );
    }
    if (token.startsWith("**") && token.endsWith("**")) {
      return (
        <strong key={i} className="font-bold text-ink">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith("*") && token.endsWith("*")) {
      return (
        <em key={i} className="italic text-ink-dim">
          {token.slice(1, -1)}
        </em>
      );
    }
    return token;
  });
}

"use client";

import { PrismLight as SyntaxHighlighter } from "react-syntax-highlighter";
import python from "react-syntax-highlighter/dist/esm/languages/prism/python";
import sql from "react-syntax-highlighter/dist/esm/languages/prism/sql";
import { oneLight } from "react-syntax-highlighter/dist/esm/styles/prism";

// Registering only the languages we actually need (python, sql — the quant
// track's needs) rather than importing the full language bundle, to keep
// this lightweight per the brief.
SyntaxHighlighter.registerLanguage("python", python);
SyntaxHighlighter.registerLanguage("sql", sql);

export type CodeBlockValue = { language?: "python" | "sql"; code?: string; caption?: string };

export default function CodeBlock({ value }: { value: CodeBlockValue }) {
  const language = value.language ?? "python";

  return (
    <div className="mt-8">
      <div className="border border-hairline rounded-xl overflow-hidden">
        <div className="flex items-center justify-between px-4 py-2 bg-forest-surface border-b-2 border-b-forest">
          <span className="font-mono text-[10px] text-ink-dim tracking-widest uppercase">{language}</span>
        </div>
        <SyntaxHighlighter
          language={language}
          style={oneLight}
          customStyle={{ margin: 0, padding: "16px", fontSize: 13, background: "#FFFFFF" }}
          wrapLongLines
        >
          {value.code ?? ""}
        </SyntaxHighlighter>
      </div>
      {value.caption && <p className="font-mono text-[11px] text-ink-dim text-center mt-2 tracking-wide">{value.caption}</p>}
    </div>
  );
}

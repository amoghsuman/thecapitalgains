"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import {
  MessageSquare,
  X,
  Send,
  Sparkles,
  Bot,
  User,
  RotateCcw,
  Loader2,
  Minimize2,
} from "lucide-react";
import SimpleMarkdown from "./SimpleMarkdown";

export interface ChatMessage {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

export interface ChatWindowProps {
  isOpen: boolean;
  onClose: () => void;
  context?: {
    courseSlug?: string;
    courseTitle?: string;
    lessonSlug?: string;
    lessonTitle?: string;
    activeTextSnippet?: string;
  };
}

const STARTER_PROMPTS = [
  "Explain Gamma Squeeze vs Delta neutral hedging",
  "How does ROCE differ from ROE in Indian banks?",
  "Forensic check: What flags suggest revenue inflation?",
  "Calculate Margin of Safety with an example",
];

export default function ChatWindow({ isOpen, onClose, context }: ChatWindowProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: "initial-msg",
      role: "model",
      content: context?.lessonTitle
        ? `Welcome to Capital AI. I am your institutional tutor for **${context.courseTitle || "this course"}**. We're looking at **${context.lessonTitle}**. What concept or formula would you like to unpack?`
        : "Welcome to Capital AI, your institutional equity and derivatives research mentor. Ask any question regarding NSE/BSE valuation, Greeks, financial forensics, or portfolio risk.",
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    },
  ]);
  const [inputValue, setInputValue] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Auto-scroll on new message
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (customPrompt?: string) => {
    const text = (customPrompt || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMessage: ChatMessage = {
      id: String(Date.now()),
      role: "user",
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputValue("");
    setIsLoading(true);

    try {
      const payloadMessages = [...messages, userMessage].map((m) => ({
        role: m.role,
        content: m.content,
      }));

      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: payloadMessages,
          context,
        }),
      });

      const data = await res.json();

      let errorText = "Failed to get response from Capital AI.";
      if (!res.ok) {
        if (typeof data.error === "string") {
          errorText = data.error;
        } else if (data.error?.message) {
          errorText = data.error.message;
        }
        throw new Error(errorText);
      }

      const botMessage: ChatMessage = {
        id: String(Date.now() + 1),
        role: "model",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please check your connection or try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClear = () => {
    setMessages([
      {
        id: "cleared-msg",
        role: "model",
        content: "Conversation history cleared. Ready for your next market inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          id="chat-window-panel"
          initial={{ opacity: 0, y: 30, scale: 0.92, transformOrigin: "bottom right" }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 25, scale: 0.92 }}
          transition={{ type: "spring", damping: 26, stiffness: 320 }}
          className="fixed bottom-24 right-6 z-50 w-[92vw] sm:w-[420px] h-[560px] max-h-[82vh] bg-panel border border-hairline rounded-2xl shadow-2xl flex flex-col overflow-hidden print:hidden"
        >
          {/* Header */}
          <div className="p-3.5 sm:p-4 border-b border-hairline bg-ivory/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Sparkles className="w-4 h-4 text-gold" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h3 className="font-bold text-xs sm:text-sm text-olive">Capital AI Tutor</h3>
                </div>
                <div className="text-[10px] text-ink-dim font-mono truncate max-w-[200px]">
                  {context?.lessonTitle || "Institutional Market Research"}
                </div>
              </div>
            </div>

            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={handleClear}
                title="Reset conversation"
                className="p-1.5 text-ink-dim hover:text-ink hover:bg-olive-surface rounded-lg transition-colors cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                onClick={onClose}
                aria-label="Close chat window"
                className="p-1.5 text-ink-dim hover:text-ink hover:bg-olive-surface rounded-lg transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Conversation History Messages Container */}
          <div className="flex-1 overflow-y-auto p-4 space-y-3.5 font-sans text-xs sm:text-[13px]">
            {messages.map((m) => {
              const isUser = m.role === "user";
              return (
                <div
                  key={m.id}
                  className={`flex gap-2.5 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                >
                  <div
                    className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                      isUser
                        ? "bg-olive text-white"
                        : "bg-forest-surface text-forest border border-forest/30"
                    }`}
                  >
                    {isUser ? <User className="w-3 h-3" /> : <Bot className="w-3 h-3" />}
                  </div>

                  <div
                    className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                      isUser
                        ? "bg-forest text-white rounded-tr-xs"
                        : "bg-ivory border border-hairline text-ink rounded-tl-xs"
                    }`}
                  >
                    {isUser ? (
                      <div className="whitespace-pre-wrap">{m.content}</div>
                    ) : (
                      <SimpleMarkdown content={m.content} />
                    )}

                    <div
                      className={`mt-1 font-mono text-[9px] flex items-center gap-2 ${
                        isUser ? "text-forest-tint justify-end" : "text-ink-muted justify-between"
                      }`}
                    >
                      {!isUser && m.modelUsed && (
                        <span className="opacity-75">{m.modelUsed}</span>
                      )}
                      <span>{m.timestamp}</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {isLoading && (
              <div className="flex gap-2.5 items-center">
                <div className="w-6 h-6 rounded-full bg-forest-surface text-forest flex items-center justify-center">
                  <Bot className="w-3 h-3" />
                </div>
                <div className="bg-ivory border border-hairline rounded-2xl rounded-tl-xs px-3.5 py-2 flex items-center gap-2 text-xs font-mono text-ink-dim">
                  <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
                  <span>Synthesizing research...</span>
                </div>
              </div>
            )}

            {errorMsg && (
              <div className="p-3 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs font-mono space-y-1.5">
                <div>{errorMsg}</div>
                {messages.length > 1 && messages[messages.length - 1].role === "user" && (
                  <button
                    type="button"
                    onClick={() => handleSend(messages[messages.length - 1].content)}
                    className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-red-100 hover:bg-red-200 text-red-800 rounded font-semibold text-[10px] transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>Retry</span>
                  </button>
                )}
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Quick Starter Chips */}
          <div className="px-3 py-1.5 bg-panel border-t border-hairline/60">
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
              {STARTER_PROMPTS.map((prompt, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSend(prompt)}
                  disabled={isLoading}
                  className="whitespace-nowrap px-2 py-0.5 rounded-full bg-ivory hover:bg-forest-surface hover:text-forest border border-hairline text-[10px] text-ink-dim transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          {/* Simple Input Field */}
          <div className="p-3 bg-panel border-t border-hairline">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                type="text"
                value={inputValue}
                onChange={(e) => setInputValue(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about valuations, Greeks, forensics..."
                className="flex-1 bg-ivory border border-hairline rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-forest"
              />
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                aria-label="Send message"
                className="h-8.5 w-8.5 rounded-xl bg-forest hover:bg-forest-dark text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer flex-shrink-0"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

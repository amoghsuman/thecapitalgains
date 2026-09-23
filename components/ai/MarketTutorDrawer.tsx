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
  BookOpen,
  RotateCcw,
  Loader2,
  ChevronDown,
} from "lucide-react";
import SimpleMarkdown from "./SimpleMarkdown";
import ChatWindow from "./ChatWindow";

interface Message {
  id: string;
  role: "user" | "model";
  content: string;
  timestamp: string;
  modelUsed?: string;
}

interface MarketTutorDrawerProps {
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

type TutorContext = NonNullable<MarketTutorDrawerProps["context"]>;

export default function MarketTutorDrawer({ context: initialContext }: MarketTutorDrawerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [context, setContext] = useState<TutorContext | undefined>(initialContext);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "initial",
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
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    const handleOpenEvent = (e: Event) => {
      const detail = (e as CustomEvent<{ prompt?: string; context?: TutorContext }>).detail;
      if (detail?.context) setContext(detail.context);
      if (detail?.prompt) {
        handleSend(detail.prompt);
      }
      setIsOpen(true);
    };

    window.addEventListener("open-capital-ai", handleOpenEvent);
    return () => window.removeEventListener("open-capital-ai", handleOpenEvent);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
        inputRef.current?.focus();
      }, 150);
    }
  }, [isOpen, messages]);

  const handleSend = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    setErrorMsg(null);
    const userMessage: Message = {
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

      const botMessage: Message = {
        id: String(Date.now() + 1),
        role: "model",
        content: data.text,
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
        modelUsed: data.modelUsed,
      };

      setMessages((prev) => [...prev, botMessage]);
    } catch (err: unknown) {
      console.error("Chat error:", err);
      setErrorMsg(err instanceof Error ? err.message : "Something went wrong. Please check your connection.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClearHistory = () => {
    setMessages([
      {
        id: "cleared-reset",
        role: "model",
        content: "Conversation cleared. Ready for your next market inquiry.",
        timestamp: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      },
    ]);
  };

  return (
    <>
      {/* Persistent Floating Chat Trigger (Bottom Right) */}
      <div className="fixed bottom-6 right-6 z-40 print:hidden">
        <button
          id="capital-ai-trigger-button"
          type="button"
          onClick={() => setIsOpen(true)}
          aria-label="Open Capital AI Market Tutor"
          className="group flex items-center gap-2.5 px-4 py-3 rounded-full bg-forest text-white shadow-xl hover:bg-forest-dark border border-forest-tint/30 transition-all hover:scale-105 cursor-pointer active:scale-95"
        >
          <div className="relative">
            <Sparkles className="w-5 h-5 text-gold-surface animate-pulse" />
          </div>
          <span className="font-mono text-xs font-semibold tracking-wide">
            Ask Capital AI
          </span>
          {context?.lessonTitle && (
            <span className="w-2 h-2 rounded-full bg-gold animate-ping" />
          )}
        </button>
      </div>

      {/* Slide-out Drawer */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 overflow-hidden flex justify-end print:hidden">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="absolute inset-0 bg-ink/40 backdrop-blur-xs transition-opacity"
            />

            {/* Sliding Panel */}
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 260 }}
              className="relative w-full max-w-lg bg-panel border-l border-hairline shadow-2xl flex flex-col h-full z-10"
            >
              {/* Header */}
              <div className="p-4 sm:p-5 border-b border-hairline flex items-center justify-between bg-ivory/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-full bg-forest text-white flex items-center justify-center flex-shrink-0">
                    <Sparkles className="w-4 h-4 text-gold" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-bold text-sm text-olive">Capital AI Tutor</h3>
                    </div>
                    <div className="text-[11px] text-ink-dim font-mono truncate max-w-[240px]">
                      {context?.lessonTitle ? `In: ${context.lessonTitle}` : "Curriculum & Market Playbook"}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    type="button"
                    onClick={handleClearHistory}
                    title="Reset conversation"
                    className="p-1.5 text-ink-dim hover:text-ink hover:bg-olive-surface rounded-lg transition-colors cursor-pointer"
                  >
                    <RotateCcw className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setIsOpen(false)}
                    aria-label="Close"
                    className="p-1.5 text-ink-dim hover:text-ink hover:bg-olive-surface rounded-lg transition-colors cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Scrollable Message Thread */}
              <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4 font-sans text-sm">
                {messages.map((m) => {
                  const isUser = m.role === "user";
                  return (
                    <div
                      key={m.id}
                      className={`flex gap-3 ${isUser ? "flex-row-reverse" : "flex-row"}`}
                    >
                      <div
                        className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 text-xs ${
                          isUser
                            ? "bg-olive text-white"
                            : "bg-forest-surface text-forest border border-forest/30"
                        }`}
                      >
                        {isUser ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                      </div>

                      <div
                        className={`max-w-[85%] rounded-2xl p-3.5 sm:p-4 text-xs sm:text-[13px] leading-relaxed ${
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
                          className={`mt-1.5 font-mono text-[9px] flex items-center gap-2 ${
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
                  <div className="flex gap-3 items-center">
                    <div className="w-7 h-7 rounded-full bg-forest-surface text-forest flex items-center justify-center">
                      <Bot className="w-3.5 h-3.5" />
                    </div>
                    <div className="bg-ivory border border-hairline rounded-2xl rounded-tl-xs px-4 py-2.5 flex items-center gap-2 text-xs font-mono text-ink-dim">
                      <Loader2 className="w-3.5 h-3.5 animate-spin text-forest" />
                      <span>Analyzing institutional data...</span>
                    </div>
                  </div>
                )}

                {errorMsg && (
                  <div className="p-3 bg-red-50/90 border border-red-200 text-red-700 rounded-xl text-xs font-mono space-y-2">
                    <div>{errorMsg}</div>
                    {messages.length > 1 && messages[messages.length - 1].role === "user" && (
                      <button
                        type="button"
                        onClick={() => handleSend(messages[messages.length - 1].content)}
                        className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-red-100 hover:bg-red-200 text-red-800 rounded-md font-semibold text-[11px] transition-colors cursor-pointer"
                      >
                        <RotateCcw className="w-3 h-3" />
                        <span>Retry Query</span>
                      </button>
                    )}
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>

              {/* Starter Quick Chips */}
              <div className="px-4 py-2 bg-panel border-t border-hairline/60">
                <div className="text-[10px] font-mono text-ink-dim mb-1.5">Suggested Inquiries:</div>
                <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar">
                  {STARTER_PROMPTS.map((prompt, idx) => (
                    <button
                      key={idx}
                      type="button"
                      onClick={() => handleSend(prompt)}
                      disabled={isLoading}
                      className="whitespace-nowrap px-2.5 py-1 rounded-full bg-ivory hover:bg-forest-surface hover:text-forest border border-hairline text-[11px] text-ink-dim transition-colors cursor-pointer flex-shrink-0 disabled:opacity-50"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </div>

              {/* Input Bar */}
              <div className="p-4 bg-panel border-t border-hairline">
                <form
                  onSubmit={(e) => {
                    e.preventDefault();
                    handleSend();
                  }}
                  className="flex items-end gap-2"
                >
                  <textarea
                    ref={inputRef}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    rows={2}
                    placeholder="Ask about formulas, Greeks, balance sheet forensics..."
                    className="flex-1 bg-ivory border border-hairline rounded-xl px-3 py-2 text-xs text-ink placeholder:text-ink-muted focus:outline-none focus:ring-1 focus:ring-forest resize-none"
                  />
                  <button
                    type="submit"
                    disabled={!inputValue.trim() || isLoading}
                    aria-label="Send message"
                    className="h-10 w-10 rounded-xl bg-forest hover:bg-forest-dark text-white flex items-center justify-center transition-colors disabled:opacity-40 cursor-pointer flex-shrink-0"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
                <div className="mt-2 text-[10px] text-center text-ink-muted font-mono">
                  Educational guidance only. Complying with SEBI research & investor awareness standards.
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

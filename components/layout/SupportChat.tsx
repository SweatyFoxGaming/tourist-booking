"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Bot, Loader2, Send, User } from "lucide-react";
import { useTranslations } from "@/lib/i18n/client";
import { cn } from "@/lib/utils";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

export function SupportChat() {
  const t = useTranslations("support");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [demoMode, setDemoMode] = useState<boolean | null>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  const visibleMessages: ChatMessage[] =
    messages.length === 0
      ? [{ role: "assistant", content: t("aiGreeting") }]
      : messages;

  useEffect(() => {
    fetch("/api/support/chat")
      .then((r) => r.json())
      .then((data) => setDemoMode(Boolean(data.demo)))
      .catch(() => setDemoMode(true));
  }, []);

  useEffect(() => {
    listRef.current?.scrollTo({
      top: listRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [messages, loading]);

  async function sendMessage(e?: React.FormEvent) {
    e?.preventDefault();

    const text = input.trim();
    if (!text || loading) return;

    const nextMessages: ChatMessage[] = [
      ...messages,
      { role: "user", content: text },
    ];

    setInput("");
    setError("");
    setMessages(nextMessages);
    setLoading(true);

    try {
      const res = await fetch("/api/support/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: nextMessages }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error ?? "Request failed");
      }

      setDemoMode(Boolean(data.demo));
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: data.message as string },
      ]);
    } catch {
      setError(t("aiError"));
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      void sendMessage();
    }
  }

  return (
    <div className="flex h-[22rem] flex-col">
      {demoMode && (
        <p className="border-b border-amber-100 bg-amber-50 px-3 py-2 text-[11px] text-amber-800">
          {t("aiDemoNotice")}
        </p>
      )}

      <div
        ref={listRef}
        className="flex-1 space-y-3 overflow-y-auto px-3 py-3"
        aria-live="polite"
      >
        {visibleMessages.map((message, index) => {
          const isUser = message.role === "user";
          return (
            <div
              key={`${message.role}-${index}`}
              className={cn("flex gap-2", isUser ? "flex-row-reverse" : "flex-row")}
            >
              <span
                className={cn(
                  "mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full",
                  isUser
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-[var(--color-primary)]"
                )}
              >
                {isUser ? (
                  <User className="h-3.5 w-3.5" />
                ) : (
                  <Bot className="h-3.5 w-3.5" />
                )}
              </span>
              <div
                className={cn(
                  "max-w-[85%] rounded-[calc(var(--radius)-2px)] px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap",
                  isUser
                    ? "bg-[var(--color-primary)] text-white"
                    : "bg-gray-100 text-[var(--color-text)]"
                )}
              >
                {message.content}
              </div>
            </div>
          );
        })}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-500">
            <Loader2 className="h-4 w-4 animate-spin" />
            {t("aiThinking")}
          </div>
        )}
      </div>

      {error && (
        <p className="px-3 pb-1 text-xs text-red-600">
          {error}{" "}
          <Link href="/contact" className="underline">
            {t("contact")}
          </Link>
        </p>
      )}

      <form onSubmit={sendMessage} className="border-t border-gray-100 p-3">
        <div className="flex items-end gap-2">
          <textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={t("aiPlaceholder")}
            rows={2}
            className="max-h-24 min-h-[2.5rem] flex-1 resize-none rounded-[calc(var(--radius)-2px)] border border-gray-200 px-3 py-2 text-sm text-[var(--color-text)] placeholder:text-gray-400 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]"
            disabled={loading}
            aria-label={t("aiPlaceholder")}
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[var(--color-primary)] text-white transition-opacity disabled:opacity-40"
            aria-label={t("aiSend")}
          >
            <Send className="h-4 w-4" />
          </button>
        </div>
        <p className="mt-2 text-[10px] leading-snug text-gray-400">
          {t("aiDisclaimer")}
        </p>
      </form>
    </div>
  );
}

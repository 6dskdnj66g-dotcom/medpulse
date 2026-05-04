"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { processOSCEQuery, type ChatMessage } from "@/app/actions/osce-query";

export default function OsceChat() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [isPending, startTransition] = useTransition();
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isPending]);

  function handleSend(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!input.trim() || isPending) return;

    const newQuery = input.trim();
    const currentHistory = [...messages];

    setMessages((prev) => [...prev, { role: "user", content: newQuery }]);
    setInput("");

    startTransition(async () => {
      try {
        const response = await processOSCEQuery(currentHistory, newQuery);
        setMessages((prev) => [...prev, { role: "assistant", content: response }]);
      } catch {
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: "[SYSTEM ERROR: Connection to simulator lost.]" },
        ]);
      }
    });
  }

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-6">
      <div className="mb-6 border-b border-slate-200 pb-4">
        <h2 className="text-2xl font-black text-slate-900">OSCE Room 1</h2>
        <p className="mt-1 text-sm text-slate-500">Take a focused history from the patient.</p>
      </div>

      <div className="mb-4 flex h-[calc(100dvh-200px)] md:h-[500px] flex-col overflow-hidden rounded-2xl border border-slate-200 bg-slate-50 shadow-inner">
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && (
            <p className="mt-10 text-center text-sm text-slate-400">
              Patient is waiting. Ask your first question.
            </p>
          )}

          {messages.map((msg, idx) => (
            <div
              key={idx}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm ${
                  msg.role === "user"
                    ? "bg-blue-600 text-white"
                    : "border border-slate-200 bg-white text-slate-800"
                }`}
              >
                {msg.content}
              </div>
            </div>
          ))}

          {isPending && (
            <div className="flex justify-start">
              <div className="h-10 w-24 animate-pulse rounded-2xl bg-slate-200" />
            </div>
          )}

          <div ref={scrollRef} />
        </div>
      </div>

      <form onSubmit={handleSend} className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          disabled={isPending}
          placeholder="Ask the patient…"
          className="flex-1 rounded-xl border border-slate-300 p-4 text-base md:text-sm outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
        />
        <button
          type="submit"
          disabled={isPending || !input.trim()}
          className="rounded-xl bg-slate-900 px-6 py-4 text-sm font-bold text-white disabled:opacity-50"
        >
          Ask
        </button>
      </form>
    </div>
  );
}

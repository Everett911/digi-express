"use client";

import { useEffect, useRef, useState } from "react";
import { MessageCircle, Send, X } from "lucide-react";
import styles from "./ShoppingChat.module.css";

type Message = { role: "user" | "model"; text: string };

const SUGGESTIONS = ["Sneakers under $40", "Gold jewelry", "How fast is shipping?"];

export function ShoppingChat() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  async function ask(text: string) {
    text = text.trim();
    if (!text || loading) return;

    const next = [...messages, { role: "user" as const, text }];
    setMessages(next);
    setInput("");
    setLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: next.slice(-20) }),
      });
      const data = await res.json();
      setMessages([...next, { role: "model", text: data.reply ?? data.error }]);
    } catch {
      setMessages([...next, { role: "model", text: "Connection problem, please try again" }]);
    } finally {
      setLoading(false);
    }
  }

  function send(event: React.SubmitEvent) {
    event.preventDefault();
    void ask(input);
  }

  if (!open) {
    return (
      <button
        className={styles.launcher}
        onClick={() => setOpen(true)}
        aria-label="Open shopping assistant"
      >
        <MessageCircle size={22} />
        <span>Ask our assistant</span>
      </button>
    );
  }

  return (
    <section className={styles.panel} aria-label="Shopping assistant">
      <header className={styles.header}>
        <div>
          <p className={styles.title}>Shopping assistant</p>
          <p className={styles.subtitle}>Ask about products and shipping</p>
        </div>
        <button className={styles.iconButton} onClick={() => setOpen(false)} aria-label="Close">
          <X size={18} />
        </button>
      </header>

      <div className={styles.messages}>
        {messages.length === 0 && (
          <div className={styles.empty}>
            <p>Hi! What are you looking for today?</p>
            <div className={styles.suggestions}>
              {SUGGESTIONS.map((suggestion) => (
                <button
                  key={suggestion}
                  className={styles.suggestion}
                  onClick={() => void ask(suggestion)}
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((m, i) => (
          <p key={i} className={`${styles.bubble} ${m.role === "user" ? styles.user : styles.bot}`}>
            {m.text}
          </p>
        ))}

        {loading && (
          <p className={`${styles.bubble} ${styles.bot} ${styles.typing}`} aria-label="Thinking">
            <span />
            <span />
            <span />
          </p>
        )}
        <div ref={bottomRef} />
      </div>

      <form onSubmit={send} className={styles.form}>
        <input
          className={styles.input}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="e.g. sneakers under $40"
          maxLength={1000}
        />
        <button
          className={styles.sendButton}
          type="submit"
          disabled={loading || !input.trim()}
          aria-label="Send"
        >
          <Send size={18} />
        </button>
      </form>
    </section>
  );
}

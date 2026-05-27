"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { usePathname } from "next/navigation";
import { useAppDispatch, useAppSelector } from "@/store/hooks";
import { sendMessageThunk } from "@/store/slices/customerSupportSlice";

export default function CustomerSupportChat() {
  const [open, setOpen]   = useState(false);
  const [input, setInput] = useState("");

  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const messages = useAppSelector((s) => s.customerSupport.messages);
  const isSending = useAppSelector((s) => s.customerSupport.isSending);
  const error = useAppSelector((s) => s.customerSupport.error);

  const bottomRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const authUser = useAppSelector((s) => s.auth.user);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isSending]);

  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const handleSend = async () => {
    if (!input.trim() || isSending) return;
    const message = input.trim();
    setInput("");
    dispatch(sendMessageThunk({ message, page: pathname ?? "unknown" }));
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[9999] flex flex-col items-end gap-3">

      {/* Chat window */}
      <AnimatePresence>
        {open && (
          <motion.div
            key="chat-window"
            initial={{ opacity: 0, y: 16, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.95 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
            className="w-[340px] flex flex-col rounded-2xl overflow-hidden shadow-2xl border border-brand-primary/20"
            style={{ background: "rgba(var(--bg-card), 1)", maxHeight: "480px" }}
          >
            {/* Header */}
            <div
              className="flex items-center justify-between px-4 py-3 border-b border-brand-primary/15 flex-shrink-0"
              style={{ background: "rgba(var(--bg-mid), 0.8)" }}
            >
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center flex-shrink-0">
                  <span className="material-symbols-rounded text-white" style={{ fontSize: "1.1rem" }}>
                    support_agent
                  </span>
                </div>
                <div className="flex flex-col">
                  <span className="text-brand-text text-sm font-semibold leading-tight">AdaptiveTutor Support</span>
                  <span className="text-brand-muted text-xs leading-tight">We're here to help</span>
                </div>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="w-7 h-7 flex items-center justify-center rounded-lg text-brand-muted hover:text-brand-text hover:bg-brand-primary/10 transition-colors">
                <span className="material-symbols-rounded" style={{ fontSize: "1.1rem" }}>close</span>
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto px-4 py-3 flex flex-col gap-3" style={{ minHeight: 0 }}>
              {messages.length === 0 && !isSending && (
                <div className="flex flex-col items-center justify-center h-full gap-3 py-8 text-center">
                  <div className="w-12 h-12 rounded-full bg-brand-primary/15 flex items-center justify-center">
                    <span className="material-symbols-rounded text-brand-primary" style={{ fontSize: "1.5rem" }}>
                      chat_bubble
                    </span>
                  </div>
                  <div>
                    <p className="text-brand-text text-sm font-medium">Hello, {authUser?.firstName ?? "there"}!</p>
                    <p className="text-brand-muted text-xs mt-1">Ask us anything about the platform.</p>
                  </div>
                </div>
              )}

              {messages.map((msg, idx) => (
                <div
                    key={idx}
                    className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                  {msg.role === "assistant" && (
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                      <span className="material-symbols-rounded text-white" style={{ fontSize: "0.75rem" }}>support_agent</span>
                    </div>
                  )}
                  <div
                    className={`max-w-[75%] rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-brand-primary/80 text-white rounded-br-sm"
                        : "bg-brand-primary/10 text-brand-text rounded-bl-sm border border-brand-primary/15"
                    }`}
                  >
                    {msg.content}
                  </div>
                </div>
              ))}

              {isSending && (
                <div className="flex justify-start">
                  <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#7c6fcd] to-[#22d3ee] flex items-center justify-center flex-shrink-0 mr-2 mt-0.5">
                    <span className="material-symbols-rounded text-white" style={{ fontSize: "0.75rem" }}>support_agent</span>
                  </div>
                  <div className="bg-brand-primary/10 border border-brand-primary/15 rounded-2xl rounded-bl-sm px-4 py-3 flex gap-1.5 items-center">
                    {[0, 1, 2].map((i) => (
                      <motion.div
                        key={i}
                        className="w-1.5 h-1.5 rounded-full bg-brand-primary"
                        animate={{ opacity: [0.3, 1, 0.3] }}
                        transition={{ duration: 1.2, repeat: Infinity, delay: i * 0.2 }}
                      />
                    ))}
                  </div>
                </div>
              )}

              {error && (
                <div className="flex items-center gap-2 px-3 py-2 rounded-xl bg-red-400/10 border border-red-400/20 text-red-400 text-xs">
                  <span className="material-symbols-rounded" style={{ fontSize: "1rem" }}>error</span>
                  {error}
                </div>
              )}

              <div ref={bottomRef} />
            </div>

            {/* Input */}
            <div
              className="flex items-center gap-2 px-3 py-3 border-t border-brand-primary/15 flex-shrink-0"
              style={{ background: "rgba(var(--bg-mid), 0.5)" }}
            >
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Type a message..." 
                disabled={isSending}
                className="flex-1 border border-brand-primary/20 rounded-xl px-3 py-2 text-sm text-brand-text placeholder:text-brand-muted outline-none focus:border-brand-primary/50 transition-colors disabled:opacity-50"
                style={{ background: "rgba(var(--primary), 0.06)" }}
              />
              <button
                onClick={handleSend}
                disabled={!input.trim() || isSending}
                className="w-9 h-9 rounded-xl bg-brand-primary/80 hover:bg-brand-primary flex items-center justify-center transition-colors disabled:opacity-40 disabled:cursor-not-allowed flex-shrink-0"
              >
                <span className="material-symbols-rounded text-white" style={{ fontSize: "1.1rem" }}>send</span>
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* FAB button */}
      <motion.button
        onClick={() => setOpen((prev) => !prev)}
        whileHover={{ scale: 1.08 }}
        whileTap={{ scale: 0.95 }}
        transition={{ duration: 0.15 }}
        className="w-14 h-14 rounded-full shadow-lg flex items-center justify-center relative"
        style={{ background: "linear-gradient(135deg, #7c6fcd, #22d3ee)" }}
        aria-label="Customer support chat"
      >
        <AnimatePresence mode="wait">
          {open ? (
            <motion.span key="close" initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="material-symbols-rounded text-white" style={{ fontSize: "1.5rem" }}>
              close
            </motion.span>
          ) : (
            <motion.span key="chat" initial={{ rotate: 90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="material-symbols-rounded text-white" style={{ fontSize: "1.5rem" }}>
              support_agent
            </motion.span>
          )}
        </AnimatePresence>

        {!open && messages.length > 0 && (
          <span className="absolute top-0 right-0 w-3.5 h-3.5 rounded-full bg-green-400 border-2 border-brand-bg" />
        )}
      </motion.button>
    </div>
  );
}

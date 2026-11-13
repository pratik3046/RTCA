"use client";

import React, { useState, useRef } from "react";
import { Send } from "lucide-react";

interface MessageInputProps {
  onSendMessage: (content: string) => void;
  onTyping: (isTyping: boolean) => void;
  disabled?: boolean;
}

export function MessageInput({
  onSendMessage,
  onTyping,
  disabled = false,
}: MessageInputProps) {
  const [text, setText] = useState("");
  const isTypingRef = useRef(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setText(val);

    if (val.trim().length > 0) {
      if (!isTypingRef.current) {
        isTypingRef.current = true;
        onTyping(true);
      }
    } else {
      if (isTypingRef.current) {
        isTypingRef.current = false;
        onTyping(false);
      }
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim() || disabled) return;

    onSendMessage(text);
    setText("");
    isTypingRef.current = false;
    onTyping(false);
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2"
    >
      <input
        type="text"
        value={text}
        onChange={handleChange}
        disabled={disabled}
        placeholder={disabled ? "Connecting..." : "Type a message..."}
        className="flex-1 bg-slate-800 text-slate-100 placeholder-slate-400 text-sm rounded-xl px-4 py-3 outline-none border border-slate-700/60 focus:border-blue-500 transition-colors"
      />
      <button
        type="submit"
        disabled={disabled || !text.trim()}
        className="bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white p-3 rounded-xl transition-colors shadow-sm flex items-center justify-center"
        aria-label="Send message"
      >
        <Send className="w-5 h-5" />
      </button>
    </form>
  );
}


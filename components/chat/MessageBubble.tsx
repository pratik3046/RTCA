"use client";

import React from "react";
import { MessageType } from "@/hooks/useChat";

interface MessageBubbleProps {
  message: MessageType;
  isSelf: boolean;
}

export function MessageBubble({ message, isSelf }: MessageBubbleProps) {
  const formattedTime = new Date(message.createdAt).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  const senderInitial = message.sender?.name
    ? message.sender.name.charAt(0).toUpperCase()
    : message.sender?.email
    ? message.sender.email.charAt(0).toUpperCase()
    : "?";

  return (
    <div
      className={`flex items-end gap-2 mb-3 ${
        isSelf ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0 w-8 h-8 rounded-full bg-slate-600 text-white flex items-center justify-center text-xs font-semibold select-none shadow-sm">
        {senderInitial}
      </div>

      <div
        className={`max-w-[70%] sm:max-w-[60%] flex flex-col ${
          isSelf ? "items-end" : "items-start"
        }`}
      >
        <div className="flex items-center gap-1.5 mb-1 px-1 text-xs text-slate-400">
          <span className="font-medium text-slate-300">
            {isSelf ? "You" : message.sender?.name || message.sender?.email || "User"}
          </span>
          <span>•</span>
          <span>{formattedTime}</span>
        </div>

        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed shadow-sm break-words ${
            isSelf
              ? "bg-blue-600 text-white rounded-br-none"
              : "bg-slate-800 text-slate-100 rounded-bl-none border border-slate-700/60"
          }`}
        >
          {message.content}
        </div>
      </div>
    </div>
  );
}


"use client";

import React, { useRef, useEffect } from "react";
import { Hash, Wifi, WifiOff } from "lucide-react";
import { useSession } from "next-auth/react";
import { useChat } from "@/hooks/useChat";
import { MessageBubble } from "@/components/chat/MessageBubble";
import { MessageInput } from "@/components/chat/MessageInput";

interface ChatWindowProps {
  roomId: string;
  roomName?: string;
}

export function ChatWindow({ roomId, roomName = "Chat Room" }: ChatWindowProps) {
  const { data: session } = useSession();
  const {
    messages,
    loading,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
  } = useChat(roomId);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, typingUsers]);

  const currentUserId = (session?.user as any)?.id;
  const currentUserEmail = session?.user?.email;

  return (
    <div className="flex-1 flex flex-col h-full bg-slate-950">
      {/* Header */}
      <div className="h-14 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60 backdrop-blur-sm">
        <div className="flex items-center gap-2">
          <Hash className="w-5 h-5 text-slate-400" />
          <h2 className="font-semibold text-slate-100">{roomName}</h2>
        </div>

        <div className="flex items-center gap-2 text-xs">
          {isConnected ? (
            <span className="flex items-center gap-1.5 text-emerald-400 font-medium">
              <Wifi className="w-3.5 h-3.5" />
              Connected
            </span>
          ) : (
            <span className="flex items-center gap-1.5 text-amber-500 font-medium animate-pulse">
              <WifiOff className="w-3.5 h-3.5" />
              Connecting...
            </span>
          )}
        </div>
      </div>

      {/* Messages View */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-2">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-500 text-sm">
            Loading conversation history...
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-500 text-sm space-y-1">
            <p className="font-medium">No messages in this room yet.</p>
            <p className="text-xs text-slate-600">Be the first to say hello!</p>
          </div>
        ) : (
          messages.map((msg) => {
            const isSelf =
              (currentUserId && msg.senderId === currentUserId) ||
              (currentUserEmail && msg.sender?.email === currentUserEmail);
            return <MessageBubble key={msg.id} message={msg} isSelf={!!isSelf} />;
          })
        )}

        {/* Typing indicator */}
        {typingUsers.length > 0 && (
          <div className="text-xs text-slate-400 italic flex items-center gap-1.5 py-1 px-2 animate-pulse">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 inline-block animate-ping" />
            <span>
              {typingUsers.map((u) => u.name).join(", ")}{" "}
              {typingUsers.length === 1 ? "is" : "are"} typing...
            </span>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Message Input */}
      <MessageInput
        onSendMessage={sendMessage}
        onTyping={sendTyping}
        disabled={!isConnected}
      />
    </div>
  );
}


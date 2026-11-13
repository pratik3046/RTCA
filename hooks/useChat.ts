"use client";

import { useEffect, useState, useCallback, useRef } from "react";
import { useSocket } from "@/hooks/useSocket";
import { useSession } from "next-auth/react";

export interface MessageType {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: {
    id: string;
    name: string | null;
    email: string | null;
    image: string | null;
  };
  roomId: string;
}

export interface TypingUser {
  id: string;
  name: string;
}

export function useChat(roomId: string) {
  const { socket, isConnected } = useSocket();
  const { data: session } = useSession();
  const [messages, setMessages] = useState<MessageType[]>([]);
  const [loading, setLoading] = useState(true);
  const [typingUsers, setTypingUsers] = useState<TypingUser[]>([]);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Fetch initial messages
  const fetchMessages = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch(`/api/messages/${roomId}`);
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (error) {
      console.error("Failed to fetch messages:", error);
    } finally {
      setLoading(false);
    }
  }, [roomId]);

  useEffect(() => {
    fetchMessages();
  }, [fetchMessages]);

  // Handle Socket.io events
  useEffect(() => {
    if (!socket || !roomId) return;

    // Join room
    socket.emit("join-room", roomId);

    // Listen for incoming messages
    const handleReceiveMessage = (message: MessageType) => {
      if (message.roomId === roomId) {
        setMessages((prev) => {
          // Avoid duplicate messages if already present
          if (prev.some((m) => m.id === message.id)) return prev;
          return [...prev, message];
        });
      }
    };

    // Listen for typing events
    const handleUserTyping = (data: {
      roomId: string;
      user: TypingUser;
      isTyping: boolean;
    }) => {
      if (data.roomId === roomId) {
        setTypingUsers((prev) => {
          if (data.isTyping) {
            if (!prev.some((u) => u.id === data.user.id)) {
              return [...prev, data.user];
            }
            return prev;
          } else {
            return prev.filter((u) => u.id !== data.user.id);
          }
        });
      }
    };

    socket.on("receive-message", handleReceiveMessage);
    socket.on("user-typing", handleUserTyping);

    return () => {
      socket.off("receive-message", handleReceiveMessage);
      socket.off("user-typing", handleUserTyping);
    };
  }, [socket, roomId]);

  // Send message
  const sendMessage = async (content: string) => {
    if (!content.trim() || !session?.user) return;

    try {
      // Persist to database via API
      const res = await fetch(`/api/messages/${roomId}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content }),
      });

      if (res.ok) {
        const savedMessage = await res.json();

        // Broadcast to room via socket
        if (socket) {
          socket.emit("send-message", {
            roomId,
            message: savedMessage,
          });
        }
      }
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  };

  // Emit typing indicator
  const sendTyping = (isTyping: boolean) => {
    if (!socket || !session?.user) return;

    const user: TypingUser = {
      id: (session.user as any).id || session.user.email || "anonymous",
      name: session.user.name || session.user.email || "Anonymous",
    };

    socket.emit("typing", {
      roomId,
      user,
      isTyping,
    });

    if (isTyping) {
      if (typingTimeoutRef.current) clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        socket.emit("typing", {
          roomId,
          user,
          isTyping: false,
        });
      }, 2000);
    }
  };

  return {
    messages,
    loading,
    typingUsers,
    isConnected,
    sendMessage,
    sendTyping,
  };
}


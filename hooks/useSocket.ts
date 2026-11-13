"use client";

import { useSocketContext } from "@/components/providers/SocketProvider";

export function useSocket() {
  const { socket, isConnected } = useSocketContext();

  return {
    socket,
    isConnected,
  };
}


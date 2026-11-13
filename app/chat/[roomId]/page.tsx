"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { Sidebar } from "@/components/chat/Sidebar";
import { ChatWindow } from "@/components/chat/ChatWindow";
import { UserList } from "@/components/chat/UserList";

export default function ChatRoomPage() {
  const params = useParams();
  const router = useRouter();
  const roomId = params?.roomId as string;
  const { data: session, status } = useSession();
  const [roomName, setRoomName] = useState("Chat Room");

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/");
    }
  }, [status, router]);

  useEffect(() => {
    if (roomId) {
      fetch("/api/rooms")
        .then((res) => res.json())
        .then((rooms) => {
          if (Array.isArray(rooms)) {
            const current = rooms.find((r: any) => r.id === roomId);
            if (current) {
              setRoomName(current.name);
            }
          }
        })
        .catch((err) => console.error("Error fetching room details:", err));
    }
  }, [roomId]);

  if (status === "loading") {
    return (
      <div className="h-screen w-screen flex items-center justify-center bg-slate-950 text-slate-400">
        Authenticating...
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-slate-950">
      <Sidebar />
      <main className="flex-1 flex overflow-hidden">
        <ChatWindow roomId={roomId} roomName={roomName} />
        <UserList roomId={roomId} />
      </main>
    </div>
  );
}


"use client";

import React, { useEffect, useState } from "react";
import { Users, Circle } from "lucide-react";
import { TypingUser } from "@/hooks/useChat";

interface UserListProps {
  roomId: string;
  typingUsers?: TypingUser[];
}

interface Member {
  id: string;
  name: string | null;
  email: string | null;
  image: string | null;
}

export function UserList({ roomId, typingUsers = [] }: UserListProps) {
  const [members, setMembers] = useState<Member[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchMembers() {
      try {
        const res = await fetch(`/api/rooms`);
        if (res.ok) {
          const rooms = await res.json();
          const currentRoom = rooms.find((r: any) => r.id === roomId);
          if (currentRoom?.members) {
            setMembers(currentRoom.members);
          }
        }
      } catch (err) {
        console.error("Failed to fetch room members:", err);
      } finally {
        setLoading(false);
      }
    }

    if (roomId) {
      fetchMembers();
    }
  }, [roomId]);

  return (
    <aside className="w-56 bg-slate-900/90 border-l border-slate-800 hidden lg:flex flex-col h-full text-slate-200">
      <div className="p-4 border-b border-slate-800 flex items-center gap-2">
        <Users className="w-4 h-4 text-slate-400" />
        <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400">
          Members ({members.length})
        </h4>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {loading ? (
          <div className="text-xs text-slate-500 animate-pulse">Loading members...</div>
        ) : members.length === 0 ? (
          <div className="text-xs text-slate-500">No members listed yet.</div>
        ) : (
          members.map((member) => {
            const isTyping = typingUsers.some((u) => u.id === member.id);
            return (
              <div
                key={member.id}
                className="flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-slate-800/60 transition-colors"
              >
                <div className="relative">
                  <div className="w-7 h-7 rounded-full bg-slate-700 text-white font-medium flex items-center justify-center text-xs">
                    {member.name?.charAt(0).toUpperCase() ||
                      member.email?.charAt(0).toUpperCase() ||
                      "U"}
                  </div>
                  <Circle className="w-2.5 h-2.5 fill-emerald-500 text-emerald-500 absolute -bottom-0.5 -right-0.5 stroke-slate-900 stroke-2" />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium text-slate-200 truncate">
                    {member.name || member.email?.split("@")[0] || "User"}
                  </p>
                  {isTyping && (
                    <span className="text-[10px] text-blue-400 italic">
                      typing...
                    </span>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </aside>
  );
}


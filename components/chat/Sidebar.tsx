"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { MessageSquare, Plus, LogOut, Hash, Users } from "lucide-react";
import { useSession, signOut } from "next-auth/react";

interface Room {
  id: string;
  name: string;
  description?: string;
  isGroup: boolean;
  _count?: {
    messages: number;
    members: number;
  };
}

export function Sidebar() {
  const router = useRouter();
  const params = useParams();
  const currentRoomId = params?.roomId as string;
  const { data: session } = useSession();

  const [rooms, setRooms] = useState<Room[]>([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [newRoomName, setNewRoomName] = useState("");
  const [newRoomDesc, setNewRoomDesc] = useState("");

  const fetchRooms = async () => {
    try {
      const res = await fetch("/api/rooms");
      if (res.ok) {
        const data = await res.json();
        setRooms(data);
      }
    } catch (err) {
      console.error("Failed to load rooms:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const handleCreateRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRoomName.trim()) return;

    try {
      const res = await fetch("/api/rooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newRoomName.trim(),
          description: newRoomDesc.trim(),
        }),
      });

      if (res.ok) {
        const createdRoom = await res.json();
        setNewRoomName("");
        setNewRoomDesc("");
        setShowCreateModal(false);
        setRooms((prev) => [createdRoom, ...prev]);
        router.push(`/chat/${createdRoom.id}`);
      }
    } catch (error) {
      console.error("Error creating room:", error);
    }
  };

  return (
    <aside className="w-64 md:w-72 bg-slate-900 border-r border-slate-800 flex flex-col h-full text-slate-200">
      {/* Header */}
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageSquare className="w-6 h-6 text-blue-500" />
          <span className="font-bold text-lg text-white tracking-tight">RTCA Chat</span>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="p-1.5 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors"
          title="Create Room"
        >
          <Plus className="w-5 h-5" />
        </button>
      </div>

      {/* Room List */}
      <div className="flex-1 overflow-y-auto p-3 space-y-1">
        <div className="px-2 py-1 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Chat Rooms
        </div>

        {loading ? (
          <div className="p-4 text-center text-sm text-slate-500 animate-pulse">
            Loading channels...
          </div>
        ) : rooms.length === 0 ? (
          <div className="p-4 text-center text-xs text-slate-500">
            No rooms yet. Create one!
          </div>
        ) : (
          rooms.map((room) => {
            const isActive = room.id === currentRoomId;
            return (
              <Link
                key={room.id}
                href={`/chat/${room.id}`}
                className={`flex items-center justify-between px-3 py-2.5 rounded-xl text-sm transition-all ${
                  isActive
                    ? "bg-blue-600 text-white font-medium shadow-sm"
                    : "text-slate-400 hover:bg-slate-800/80 hover:text-slate-100"
                }`}
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <Hash className="w-4 h-4 flex-shrink-0 opacity-70" />
                  <span className="truncate">{room.name}</span>
                </div>
                {room._count && (
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full ${
                      isActive ? "bg-blue-700 text-blue-100" : "bg-slate-800 text-slate-400"
                    }`}
                  >
                    {room._count.messages}
                  </span>
                )}
              </Link>
            );
          })
        )}
      </div>

      {/* User profile & session footer */}
      {session?.user && (
        <div className="p-3 border-t border-slate-800 flex items-center justify-between bg-slate-950/40">
          <div className="flex items-center gap-2.5 min-w-0">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white font-semibold flex items-center justify-center text-xs">
              {session.user.name?.charAt(0).toUpperCase() ||
                session.user.email?.charAt(0).toUpperCase() ||
                "U"}
            </div>
            <div className="truncate">
              <p className="text-xs font-medium text-slate-200 truncate">
                {session.user.name || "User"}
              </p>
              <p className="text-[10px] text-slate-500 truncate">
                {session.user.email}
              </p>
            </div>
          </div>
          <button
            onClick={() => signOut({ callbackUrl: "/" })}
            className="p-1.5 text-slate-400 hover:text-red-400 rounded-lg hover:bg-slate-800 transition-colors"
            title="Sign out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Create Room Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-sm p-6 shadow-xl">
            <h3 className="text-lg font-semibold text-white mb-4">Create New Room</h3>
            <form onSubmit={handleCreateRoom} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Room Name
                </label>
                <input
                  type="text"
                  required
                  value={newRoomName}
                  onChange={(e) => setNewRoomName(e.target.value)}
                  placeholder="e.g. general, announcements"
                  className="w-full bg-slate-800 text-slate-100 text-sm rounded-xl px-3 py-2 border border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1">
                  Description (Optional)
                </label>
                <input
                  type="text"
                  value={newRoomDesc}
                  onChange={(e) => setNewRoomDesc(e.target.value)}
                  placeholder="What is this channel about?"
                  className="w-full bg-slate-800 text-slate-100 text-sm rounded-xl px-3 py-2 border border-slate-700 outline-none focus:border-blue-500"
                />
              </div>
              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-sm text-slate-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium px-4 py-2 rounded-xl transition-colors"
                >
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </aside>
  );
}


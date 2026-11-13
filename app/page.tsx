"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { signIn, useSession } from "next-auth/react";
import { MessageSquare, ArrowRight, ShieldCheck, Zap } from "lucide-react";

export default function HomePage() {
  const router = useRouter();
  const { data: session, status } = useSession();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // If logged in, fetch rooms and redirect to the first available room or create general
    if (status === "authenticated") {
      fetch("/api/rooms")
        .then((res) => res.json())
        .then((rooms) => {
          if (Array.isArray(rooms) && rooms.length > 0) {
            router.push(`/chat/${rooms[0].id}`);
          } else {
            // Create default 'general' room
            fetch("/api/rooms", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                name: "general",
                description: "General discussion room",
              }),
            })
              .then((res) => res.json())
              .then((newRoom) => {
                router.push(`/chat/${newRoom.id}`);
              });
          }
        })
        .catch(() => {});
    }
  }, [status, router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;

    setLoading(true);
    try {
      const res = await signIn("credentials", {
        email: email.trim(),
        name: name.trim() || email.split("@")[0],
        password: "password123",
        redirect: false,
      });

      if (!res?.error) {
        // Will be redirected by the useEffect
      } else {
        alert("Authentication failed: " + res.error);
        setLoading(false);
      }
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-md bg-slate-900/80 border border-slate-800 backdrop-blur-xl rounded-2xl p-8 shadow-2xl">
        <div className="flex flex-col items-center text-center mb-8">
          <div className="w-14 h-14 rounded-2xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-500 mb-4 shadow-inner">
            <MessageSquare className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">
            Welcome to RTCA
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Realtime Chat with Next.js, Socket.io & PostgreSQL
          </p>
        </div>

        <form onSubmit={handleLogin} className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Display Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="e.g. Alex River"
              className="w-full bg-slate-800/80 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-700/80 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-300 mb-1.5">
              Email Address
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="alex@example.com"
              className="w-full bg-slate-800/80 text-slate-100 text-sm rounded-xl px-4 py-2.5 border border-slate-700/80 focus:border-blue-500 outline-none transition-colors"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full mt-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all shadow-lg shadow-blue-600/20 flex items-center justify-center gap-2 group"
          >
            <span>{loading ? "Joining..." : "Enter Chat"}</span>
            <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
          </button>
        </form>

        <div className="mt-8 pt-6 border-t border-slate-800/80 grid grid-cols-2 gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-amber-400 flex-shrink-0" />
            <span>Instant Socket.io</span>
          </div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400 flex-shrink-0" />
            <span>NextAuth & Prisma</span>
          </div>
        </div>
      </div>
    </main>
  );
}


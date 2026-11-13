import type { Metadata } from "next";
import "./globals.css";
import { SocketProvider } from "@/components/providers/SocketProvider";

export const metadata: Metadata = {
  title: "RTCA - Realtime Chat Application",
  description: "Next.js, Socket.io, PostgreSQL, Prisma, NextAuth Realtime Chat Application",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full">
      <body className="h-full bg-slate-950 text-slate-100 antialiased overflow-hidden">
        <SocketProvider>{children}</SocketProvider>
      </body>
    </html>
  );
}


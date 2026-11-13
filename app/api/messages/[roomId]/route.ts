import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const { roomId } = params;

    const messages = await prisma.message.findMany({
      where: { roomId },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
      orderBy: { createdAt: "asc" },
    });

    return NextResponse.json(messages);
  } catch (error) {
    console.error("GET /api/messages/[roomId] error:", error);
    return NextResponse.json(
      { error: "Failed to fetch messages" },
      { status: 500 }
    );
  }
}

export async function POST(
  req: Request,
  { params }: { params: { roomId: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    const { roomId } = params;
    const body = await req.json();
    const { content } = body;

    if (!content || typeof content !== "string" || !content.trim()) {
      return NextResponse.json(
        { error: "Content is required" },
        { status: 400 }
      );
    }

    let senderId = (session?.user as any)?.id;

    // Fallback if not authenticated: connect or create guest user
    if (!senderId) {
      if (session?.user?.email) {
        const existing = await prisma.user.findUnique({
          where: { email: session.user.email },
        });
        if (existing) senderId = existing.id;
      }

      if (!senderId) {
        const guest = await prisma.user.upsert({
          where: { email: "guest@rtca.local" },
          update: {},
          create: {
            email: "guest@rtca.local",
            name: "Guest User",
          },
        });
        senderId = guest.id;
      }
    }

    // Ensure user is in room members
    await prisma.room.update({
      where: { id: roomId },
      data: {
        members: {
          connect: { id: senderId },
        },
      },
    }).catch(() => {
      // Room might already have member or ignored
    });

    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        roomId,
        senderId,
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            image: true,
          },
        },
      },
    });

    return NextResponse.json(message, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages/[roomId] error:", error);
    return NextResponse.json(
      { error: "Failed to send message" },
      { status: 500 }
    );
  }
}


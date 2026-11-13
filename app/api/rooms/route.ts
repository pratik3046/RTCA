import { NextResponse } from "next/server";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const rooms = await prisma.room.findMany({
      include: {
        members: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json(rooms);
  } catch (error) {
    console.error("GET /api/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to fetch rooms" },
      { status: 500 }
    );
  }
}

export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    const body = await req.json();
    const { name, description, isGroup } = body;

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Room name is required" },
        { status: 400 }
      );
    }

    const currentUserId = (session?.user as any)?.id;

    const room = await prisma.room.create({
      data: {
        name,
        description: description || null,
        isGroup: !!isGroup,
        ...(currentUserId
          ? {
              createdById: currentUserId,
              members: {
                connect: { id: currentUserId },
              },
            }
          : {}),
      },
      include: {
        members: {
          select: { id: true, name: true, email: true, image: true },
        },
        _count: {
          select: { messages: true, members: true },
        },
      },
    });

    return NextResponse.json(room, { status: 201 });
  } catch (error) {
    console.error("POST /api/rooms error:", error);
    return NextResponse.json(
      { error: "Failed to create room" },
      { status: 500 }
    );
  }
}


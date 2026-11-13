# RTCA - Realtime Chat Application

A modern, high-performance realtime chat application built with Next.js 14+ (App Router), Socket.io, PostgreSQL, Prisma ORM, NextAuth.js, and Tailwind CSS.

---

## 🛠 Tech Stack

- **Framework:** [Next.js 14+ (App Router)](https://nextjs.org/)
- **Real-Time Communication:** [Socket.io](https://socket.io/) (HTTP server + WebSockets)
- **Language:** TypeScript
- **Database:** PostgreSQL
- **ORM:** [Prisma ORM](https://www.prisma.io/)
- **Authentication:** [NextAuth.js](https://next-auth.js.org/)
- **Styling:** Tailwind CSS + Lucide React Icons
- **Containerization:** Docker & Docker Compose

---

## 📁 Project Structure

```text
./
├── app/
│   ├── api/
│   │   ├── auth/[...nextauth]/route.ts
│   │   ├── rooms/route.ts
│   │   └── messages/[roomId]/route.ts
│   ├── chat/[roomId]/page.tsx
│   ├── layout.tsx
│   ├── page.tsx
│   └── globals.css
├── components/
│   ├── chat/
│   │   ├── Sidebar.tsx
│   │   ├── ChatWindow.tsx
│   │   ├── MessageBubble.tsx
│   │   ├── MessageInput.tsx
│   │   └── UserList.tsx
│   └── providers/
│       └── SocketProvider.tsx
├── hooks/
│   ├── useSocket.ts
│   └── useChat.ts
├── lib/
│   ├── prisma.ts
│   ├── auth.ts
│   └── socket.ts
├── prisma/
│   └── schema.prisma
├── public/
├── server.ts (Custom HTTP + Next.js + Socket.io Server)
├── .env.example
├── .gitignore
├── docker-compose.yml
├── package.json
└── README.md
```

---

## ⚡ WebSocket Events (`server.ts`)

| Event Name | Direction | Payload | Description |
|---|---|---|---|
| `connection` | Server <- Client | - | Client establishes socket connection |
| `join-room` | Server <- Client | `roomId: string` | Client joins a specific room channel |
| `send-message` | Server <- Client | `{ roomId: string, message: Message }` | Client sends message to room |
| `receive-message`| Server -> Client | `message: Message` | Broadcast message to all room members (`io.to(roomId).emit`) |
| `typing` | Server <- Client | `{ roomId, user, isTyping }` | User triggers typing status |
| `user-typing` | Server -> Client | `{ roomId, user, isTyping }` | Broadcast typing status to other peers |
| `disconnect` | Server <- Client | - | Client disconnects |

---

## 🚀 Quick Start Guide

### 1. Environment Setup

Copy `.env.example` to `.env`:

```bash
cp .env.example .env
```

Ensure `.env` contains your PostgreSQL connection string and NextAuth secret.

### 2. Start PostgreSQL Container

Use Docker Compose to run PostgreSQL locally:

```bash
docker compose up -d
```

### 3. Install Dependencies

```bash
npm install
```

### 4. Run Prisma Migrations

Push the Prisma schema to your PostgreSQL database:

```bash
npx prisma db push
# or
npx prisma migrate dev --name init
```

Generate the Prisma Client:

```bash
npx prisma generate
```

### 5. Run the Application

#### Development Mode:
```bash
npm run dev
```
Starts `tsx server.ts` running both Next.js and the Socket.io WebSocket server on `http://localhost:3000`.

#### Production Build & Run:
```bash
npm run build
npm run start
```

---

## 🔒 Security
- All sensitive environment files (`.env`, `.env.local`, `.env.*.local`) are strictly excluded in `.gitignore`.
- Authentication uses secure session tokens with NextAuth.js and bcrypt password hashing.

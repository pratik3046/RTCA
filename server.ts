import { createServer } from "http";
import { parse } from "url";
import next from "next";
import { Server as SocketIOServer } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const hostname = process.env.HOSTNAME || "localhost";
const port = parseInt(process.env.PORT || "3000", 10);

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url!, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error("Error occurred handling", req.url, err);
      res.statusCode = 500;
      res.end("internal server error");
    }
  });

  const io = new SocketIOServer(server, {
    path: "/socket.io",
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log(`[Socket.io] Client connected: ${socket.id}`);

    // Join room
    socket.on("join-room", (roomId: string) => {
      socket.join(roomId);
      console.log(`[Socket.io] Client ${socket.id} joined room: ${roomId}`);
    });

    // Send message -> broadcast to room
    socket.on("send-message", (data: { roomId: string; message: any }) => {
      const { roomId, message } = data;
      console.log(`[Socket.io] Message sent to room ${roomId}`);
      io.to(roomId).emit("receive-message", message);
    });

    // Typing status
    socket.on(
      "typing",
      (data: {
        roomId: string;
        user: { id: string; name: string };
        isTyping: boolean;
      }) => {
        socket.to(data.roomId).emit("user-typing", data);
      }
    );

    // Disconnect
    socket.on("disconnect", () => {
      console.log(`[Socket.io] Client disconnected: ${socket.id}`);
    });
  });

  server.listen(port, () => {
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> WebSocket server listening on path /socket.io`);
  });
});


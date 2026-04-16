import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    handle(req, res);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  // 🔥 SOCKET LOGIC
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Join user room
    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  global.io = io; // make accessible everywhere

  httpServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
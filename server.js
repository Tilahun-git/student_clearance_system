import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
import fs from "fs";
import path from "path";

const dev = process.env.NODE_ENV !== "production";

const app = next({ dev, turbopack: false });

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    const publicPath = path.join(process.cwd(), "public", pathname);

    if (fs.existsSync(publicPath) && fs.lstatSync(publicPath).isFile()) {
      fs.createReadStream(publicPath).pipe(res);
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    path: "/api/socketio",
    cors: {
      origin: process.env.NEXTAUTH_URL ?? "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      if (userId) socket.join(String(userId));
    });

    socket.on("join_role", (role) => {
      if (role) socket.join(`role:${String(role).toUpperCase()}`);
    });

    socket.on("leave_role", (role) => {
      if (role) socket.leave(`role:${String(role).toUpperCase()}`);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  global.io = io;

  const port = parseInt(process.env.PORT ?? "3000", 10);

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
});
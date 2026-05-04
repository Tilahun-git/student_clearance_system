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

    // ✅ SERVE STATIC FILES FROM /public
    const publicPath = path.join(process.cwd(), "public", pathname);

    if (fs.existsSync(publicPath) && fs.lstatSync(publicPath).isFile()) {
      const stream = fs.createReadStream(publicPath);
      stream.pipe(res);
      return;
    }

    // 👉 fallback to Next.js
    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected");
    });
  });

  global.io = io;

  httpServer.listen(3000, () => {
    console.log("Server running on http://localhost:3000");
  });
});
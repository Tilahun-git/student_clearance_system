import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
import fs from "fs";
import path from "path";

const dev = process.env.NODE_ENV !== "production";

// IMPORTANT: turbopack must be false in custom server
const app = next({ dev, turbopack: false });

const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    // serve static files from /public
    const publicPath = path.join(process.cwd(), "public", pathname);

    if (fs.existsSync(publicPath) && fs.lstatSync(publicPath).isFile()) {
      fs.createReadStream(publicPath).pipe(res);
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: { origin: "*" },
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

  // ✅ FIX: use Render PORT dynamically
  const port = process.env.PORT || 3000;

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
  });
});
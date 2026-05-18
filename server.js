import { createServer } from "http";
import next from "next";
import { Server } from "socket.io";
import { parse } from "url";
import fs from "fs";
import path from "path";

const dev = process.env.NODE_ENV !== "production";
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const httpServer = createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    const { pathname } = parsedUrl;

    const publicPath = path.join(process.cwd(), "public", pathname || "");

    if (pathname && fs.existsSync(publicPath) && fs.lstatSync(publicPath).isFile()) {
      const stream = fs.createReadStream(publicPath);
      stream.pipe(res);
      return;
    }

    handle(req, res, parsedUrl);
  });

  const io = new Server(httpServer, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    socket.on("join", (userId) => {
      socket.join(userId);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });

  global.io = io;

  const port = process.env.PORT || 3000;

  httpServer.listen(port, "0.0.0.0", () => {
    console.log(`Server running on port ${port}`);
    console.log(`Environment: ${process.env.NODE_ENV}`);
  });
});
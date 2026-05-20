import { io } from "socket.io-client";

// Use the current origin in production, fallback to localhost in development
const URL =
  typeof window !== "undefined"
    ? window.location.origin
    : process.env.NEXTAUTH_URL ?? "http://localhost:3000";

export const socket = io(URL, {
  path: "/api/socketio",
  autoConnect: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 2000,
});

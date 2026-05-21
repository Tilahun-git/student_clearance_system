"use client";

import { useEffect } from "react";
import { useSession } from "next-auth/react";
import { socket } from "@/lib/socket";
import { useSocketNotifications } from "@/hooks/useSocketNotifications";
import { ClearanceRealtimeProvider } from "@/contexts/ClearanceRealtimeContext";

/** Keeps user + active-role socket rooms joined app-wide for notifications and clearance updates. */
function useSocketRooms() {
  const { data: session, status } = useSession();

  useEffect(() => {
    if (status !== "authenticated" || !session?.user?.id) return;

    socket.emit("join", session.user.id);

    const activeRole = session.user.activeRole;
    if (activeRole) socket.emit("join_role", activeRole);

    return () => {
      if (activeRole) socket.emit("leave_role", activeRole);
    };
  }, [status, session?.user?.id, session?.user?.activeRole]);
}

export default function SocketProvider({ children }: { children: React.ReactNode }) {
  useSocketNotifications();
  useSocketRooms();

  return <ClearanceRealtimeProvider>{children}</ClearanceRealtimeProvider>;
}
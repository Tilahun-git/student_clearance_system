"use client";

import { useEffect } from "react";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";

export function useSocketNotifications() {
  const { data: session } = useSession();

  useEffect(() => {
    if (!session?.user?.id) return;

    socket.emit("join", session.user.id);

    socket.on("notification", (data) => {
      console.log("New notification:", data);
    });

    return () => {
      socket.off("notification");
    };
  }, [session]);
}
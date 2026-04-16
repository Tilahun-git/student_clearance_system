"use client";

import { useEffect, useState } from "react";
import { Bell } from "lucide-react";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import NotificationModal from "./NotificationModal";

type NotificationType = {
  id?: string;
  message: string;
  read?: boolean;
  createdAt?: string;
};

export default function NotificationBell() {
  const { data: session } = useSession();

  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // ✅ Fetch notifications
  const fetchNotifications = async () => {
    try {
      const res = await fetch("/api/notifications");
      const data = await res.json();

      setNotifications(data.notifications || []);
      setUnread(data.unreadCount || 0);
    } catch (error) {
      console.error(error);
      setNotifications([]);
      setUnread(0);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  useEffect(() => {
    if (!session?.user?.id) return;

    socket.emit("join", session.user.id);

    socket.on("notification", (data) => {
      const newNotification: NotificationType = {
        id: data.id,
        message: data.message,
        read: false,
        createdAt: new Date().toISOString(),
      };

      setNotifications((prev) => [newNotification, ...prev]);
      setUnread((prev) => prev + 1);
    });

    return () => {
      socket.off("notification");
    };
  }, [session]);

  return (
    <div className="relative">
      
      <button
        onClick={() => setOpen(!open)}
        className="relative flex items-center justify-center w-10 h-10 rounded-full bg-gray-100 hover:bg-gray-200 transition"
      >
        <Bell className="w-5 h-5 text-gray-700" />

        {unread > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-600 text-white text-[10px] px-1.5 py-0.5 rounded-full shadow">
            {unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 mt-3 w-96 bg-white text-black border rounded-xl shadow-2xl z-50 overflow-hidden">

          <div className="flex justify-between items-center px-4 py-3 border-b bg-gray-50">
            <h3 className="text-sm font-semibold text-gray-700">
              Notifications
            </h3>

            {unread > 0 && (
              <button
                onClick={async () => {
                  await fetch("/api/notifications/mark-read", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ markAll: true }),
                  });

                  setNotifications((prev) =>
                    prev.map((n) => ({ ...n, read: true }))
                  );
                  setUnread(0);
                }}
                className="text-xs text-blue-600 hover:underline"
              >
                Mark all
              </button>
            )}
          </div>

          <div className="max-h-96 overflow-y-auto">
            {notifications.length === 0 && (
              <p className="p-4 text-sm text-gray-500">
                No notifications
              </p>
            )}

            {notifications.map((n, i) => (
              <div
                key={n.id || i}
                onClick={async () => {
                  if (!n.id) return;

                  await fetch("/api/notifications/mark-read", {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ notificationId: n.id }),
                  });

                  setOpen(false);

                  setSelectedId(n.id);

                  setNotifications((prev) =>
                    prev.map((item) =>
                      item.id === n.id
                        ? { ...item, read: true }
                        : item
                    )
                  );

                  setUnread((prev) => Math.max(prev - 1, 0));
                }}
                className={`px-4 py-3 text-sm cursor-pointer border-b transition ${
                  !n.read
                    ? "bg-blue-50 hover:bg-blue-100 font-medium"
                    : "hover:bg-gray-50"
                }`}
              >
                <p className="text-gray-800">{n.message}</p>

                {n.createdAt && (
                  <span className="text-xs text-gray-400">
                    {new Date(n.createdAt).toLocaleString()}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {selectedId && (
        <NotificationModal
          notificationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}
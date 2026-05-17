"use client";

import { useEffect, useRef, useState } from "react";
import { Bell, BellDot, Check, CheckCheck, X } from "lucide-react";
import { socket } from "@/lib/socket";
import { useSession } from "next-auth/react";
import NotificationModal from "./NotificationModal";
import { fetchNotifications, markNotificationRead, markAllNotificationsRead } from "@/lib/api/notifications";

type NotificationType = {
  id?: string;
  message: string;
  read?: boolean;      // matches Prisma field name
  createdAt?: string;
};

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function NotificationBell() {
  const { data: session, status } = useSession();
  const [notifications, setNotifications] = useState<NotificationType[]>([]);
  const [unread, setUnread] = useState(0);
  const [open, setOpen] = useState(false);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const panelRef = useRef<HTMLDivElement>(null);

  const loadNotifications = async () => {
    try {
      const data = await fetchNotifications();
      setNotifications(data);
      // Use the `read` field from DB — this is the source of truth
      setUnread(data.filter((n) => !n.read).length);
    } catch {
      setNotifications([]);
      setUnread(0);
    }
  };

  // Only fetch once the session is confirmed — avoids 401 on first render
  useEffect(() => {
    if (status !== "authenticated") return;
    loadNotifications();
  }, [status]);

  useEffect(() => {
    if (!session?.user?.id) return;
    const activeRole = session.user.activeRole;
    socket.emit("join", session.user.id);
    socket.on("notification", (data) => {
      // Only show real-time notifications that match the current active role,
      // or notifications with no forRole (e.g. student notifications).
      if (data.forRole && activeRole && data.forRole !== activeRole) return;
      setNotifications((prev) => [
        { id: data.id, message: data.message, read: false, createdAt: new Date().toISOString() },
        ...prev,
      ]);
      setUnread((prev) => prev + 1);
    });
    return () => { socket.off("notification"); };
  }, [session]);

  // Close on outside click
  useEffect(() => {
    function handler(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  // Close on Escape
  useEffect(() => {
    function handler(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, []);

  async function markAll() {
    await markAllNotificationsRead();
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    setUnread(0);
  }

  async function markOne(id: string) {
    await markNotificationRead(id);
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n)),
    );
    setUnread((prev) => Math.max(prev - 1, 0));
  }

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell button */}
      <button
        onClick={() => setOpen((p) => !p)}
        className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-100 hover:bg-slate-200 transition"
        aria-label="Notifications"
      >
        {unread > 0 ? (
          <BellDot className="w-4.5 h-4.5 text-indigo-600" />
        ) : (
          <Bell className="w-4.5 h-4.5 text-slate-600" />
        )}
        {unread > 0 && (
          <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] flex items-center justify-center bg-red-500 text-white text-[10px] font-bold rounded-full px-1 shadow-sm">
            {unread > 99 ? "99+" : unread}
          </span>
        )}
      </button>

      {/* Dropdown panel */}
      {open && (
        <div className="absolute right-0 top-full mt-2 w-[360px] bg-white rounded-2xl shadow-2xl border border-slate-200 z-50 overflow-hidden modal-panel">
          {/* Header */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50">
            <div className="flex items-center gap-2">
              <Bell className="w-4 h-4 text-slate-500" />
              <span className="text-sm font-semibold text-slate-700">Notifications</span>
              {unread > 0 && (
                <span className="px-1.5 py-0.5 text-[10px] font-bold bg-red-100 text-red-600 rounded-full">
                  {unread} new
                </span>
              )}
            </div>
            <div className="flex items-center gap-1">
              {unread > 0 && (
                <button
                  onClick={markAll}
                  className="flex items-center gap-1 px-2 py-1 text-xs text-indigo-600 hover:bg-indigo-50 rounded-lg transition font-medium"
                >
                  <CheckCheck size={12} />
                  Mark all read
                </button>
              )}
              <button
                onClick={() => setOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
              >
                <X size={14} />
              </button>
            </div>
          </div>

          {/* List */}
          <div className="max-h-[380px] overflow-y-auto divide-y divide-slate-50">
            {notifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
                <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                  <Bell className="w-5 h-5 text-slate-400" />
                </div>
                <p className="text-sm font-medium text-slate-600">All caught up!</p>
                <p className="text-xs text-slate-400 mt-1">No notifications yet.</p>
              </div>
            ) : (
              notifications.map((n, i) => (
                <div
                  key={n.id || i}
                  onClick={async () => {
                    if (!n.id) return;
                    if (!n.read) await markOne(n.id);
                    setOpen(false);
                    setSelectedId(n.id);
                  }}
                  className={`
                    group flex items-start gap-3 px-4 py-3 cursor-pointer transition
                    ${!n.read ? "bg-indigo-50/60 hover:bg-indigo-50" : "hover:bg-slate-50"}
                  `}
                >
                  {/* Dot indicator */}
                  <div className="mt-1.5 shrink-0">
                    {!n.read ? (
                      <span className="w-2 h-2 rounded-full bg-indigo-500 block" />
                    ) : (
                      <span className="w-2 h-2 rounded-full bg-slate-200 block" />
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <p className={`text-sm leading-snug ${!n.read ? "font-medium text-slate-800" : "text-slate-600"}`}>
                      {n.message}
                    </p>
                    {n.createdAt && (
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {timeAgo(n.createdAt)}
                      </p>
                    )}
                  </div>

                  {!n.read && (
                    <button
                      onClick={async (e) => {
                        e.stopPropagation();
                        if (n.id) await markOne(n.id);
                      }}
                      className="shrink-0 opacity-0 group-hover:opacity-100 p-1 rounded-lg hover:bg-indigo-100 transition"
                      title="Mark as read"
                    >
                      <Check size={12} className="text-indigo-600" />
                    </button>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="px-4 py-2.5 border-t border-slate-100 bg-slate-50">
              <p className="text-[11px] text-slate-400 text-center">
                Showing last {notifications.length} notifications
              </p>
            </div>
          )}
        </div>
      )}

      {/* Detail modal */}
      {selectedId && (
        <NotificationModal
          notificationId={selectedId}
          onClose={() => setSelectedId(null)}
        />
      )}
    </div>
  );
}

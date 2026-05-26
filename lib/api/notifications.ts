export interface Notification {
  id: string;
  message: string;
  read: boolean;       // matches the Prisma field name
  createdAt: string;
  forRole?: string | null;
}

export async function fetchNotifications(): Promise<Notification[]> {
  const res = await fetch("/api/notifications");
  if (!res.ok) return [];
  const data = await res.json();
  return data.notifications ?? [];
}

export async function markNotificationRead(id: string): Promise<void> {
  await fetch("/api/notifications/mark-read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ notificationId: id }),
  });
}

export async function markAllNotificationsRead(): Promise<void> {
  await fetch("/api/notifications/mark-read", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ markAll: true }),
  });
}

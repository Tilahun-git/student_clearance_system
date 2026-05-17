import { prisma } from "./prisma";
import { getIO } from "./socket-server";
import { NotificationPayload } from "@/types/clearance";

export async function sendNotification({ userId, message, referenceId, forRole }: NotificationPayload) {
  const notification = await prisma.notification.create({
    data: { userId, message, referenceId, forRole },
  });

  try {
    const io = getIO();
    io.to(userId).emit("notification", notification);
  } catch {
    // Socket server not ready — notification is still persisted in DB
  }

  return notification;
}

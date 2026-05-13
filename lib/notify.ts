import { prisma } from "./prisma";
import { getIO } from "./socket-server";
import {Notification} from '@/types/clearance'

export const sendNotification = async ({ userId,message,referenceId,}: Notification) => {
  const notification = await prisma.notification.create({
    data: {
      userId,
      message,
      referenceId,
    },
  });


  try {
    const io = getIO();
    io.to(userId).emit("notification", notification);
  } catch (error) {
    console.log("Socket not ready");
  }
  return notification;
};
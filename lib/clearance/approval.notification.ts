import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";

export async function notifyNextRoleStaff(
  nextRole: string,
  message: string
) {
  const staffs = await prisma.staff.findMany({
    where: {
      user: {
        roles: {
          some: {
            role: {
              name: nextRole,
            },
          },
        },
      },
    },
  });

  for (const staff of staffs) {
    await sendNotification({
      userId: staff.userId,
      message,
    });
  }
}

export async function notifyStudent(
  userId: string,
  message: string
) {
  await sendNotification({
    userId,
    message,
  });
}
import {Notification,Student,} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";


export async function notifyInitialApprovers(student: Student,clearanceId: string) {
  const notifications: Promise<Notification>[] = [];
  if (student.advisorId) {
    const advisor = await prisma.staff.findUnique({
        where: {
          id: student.advisorId,
        },
      });
    if (advisor?.userId) {

      notifications.push(
        sendNotification({
          userId: advisor.userId,
          message: `New clearance request from ${student.studentId}`,
          referenceId: clearanceId,
        })
      );
    }
  }
  if (student.departmentId) {
    const department = await prisma.department.findUnique({
        where: {
          id: student.departmentId,
        },
        include: {
          head: true,
        },
      });

    if (department?.head?.userId) {

      notifications.push(
        sendNotification({
          userId: department.head.userId,
          message: "New clearance request awaiting your review",
          referenceId: clearanceId,
        })
      );
    }
  }
  await Promise.allSettled(
    notifications
  );
}

export async function notifyRole(roleName: string,message: string,clearanceId?: string
) {

  const role = await prisma.role.findUnique({
      where: {
        name: roleName,
      },
      include: {
        users: {
          include: {
            user: true,
          },
        },
      },
    });

  if (!role) {
    return;
  }

  const notifications =
    role.users.map((userRole) =>
      sendNotification({
        userId: userRole.user.id,
        message,
        referenceId: clearanceId,
      })
    );
  await Promise.allSettled(
    notifications
  );
}
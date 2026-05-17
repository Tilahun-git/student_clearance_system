import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";
import { RoleType } from "@prisma/client";

/**
 * Notify all staff members who hold the given role.
 */
export async function notifyNextRoleStaff(nextRole: RoleType, message: string) {
  const staffList = await prisma.staff.findMany({
    where: {
      user: {
        roles: { some: { role: { name: nextRole as RoleType } } },
      },
    },
  });

  await Promise.allSettled(
    staffList.map((staff) =>
      sendNotification({ userId: staff.userId, message, forRole: nextRole }),
    ),
  );
}


 // Notify only the specific dept head / school dean responsible for a student.
 
export async function notifyScopedRoleStaff(nextRole: RoleType,message: string,studentId: string,) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: { include: { head: true } },
      school:     { include: { school_dean: true } },
    },
  });

  if (!student) return;

  let targetUserId: string | null = null;

  if (nextRole === RoleType.DEPARTMENT_HEAD) {
    targetUserId = student.department?.head?.userId ?? null;
  } else if (nextRole === RoleType.SCHOOL_DEAN) {
    targetUserId = student.school?.school_dean?.userId ?? null;
  }

  if (targetUserId) {
    await sendNotification({ userId: targetUserId, message, forRole: nextRole });
  } else {
    await notifyNextRoleStaff(nextRole, message);
  }
}

/** Notify a specific user (student) by their userId. */
export async function notifyStudent(userId: string, message: string) {
  await sendNotification({ userId, message });
}

import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/lib/email";
import {
  pendingApprovalEmailTemplate,
  studentPendingApprovalTemplate,
} from "@/lib/emailTemplates";
import { RoleType } from "@prisma/client";

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

export async function notifyStudent(userId: string, message: string) {
  await sendNotification({ userId, message });
}

export async function notifyNextRoleStaffByEmail(
  nextRole: RoleType,
  studentId: string,
) {
  const staffList = await prisma.staff.findMany({
    where: {
      user: {
        roles: { some: { role: { name: nextRole as RoleType } } },
      },
    },
    include: { user: true },
  });

  await Promise.allSettled(
    staffList
      .filter((staff) => staff.user?.email)
      .map((staff) =>
        sendEmail({
          to: staff.user.email!,
          subject: "Clearance Request Pending Your Review",
          html: pendingApprovalEmailTemplate(studentId),
        }),
      ),
  );
}

export async function sendStudentPendingEmail(
  userId: string,
  studentId: string,
) {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user?.email) return;

  await sendEmail({
    to: user.email,
    subject: "Clearance Request Submitted",
    html: studentPendingApprovalTemplate(studentId),
  });
}

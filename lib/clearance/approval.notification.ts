import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/lib/email";
import {
  pendingApprovalEmailTemplate,
  rejectionEmailTemplate,
  studentPendingApprovalTemplate,
} from "@/lib/emailTemplates";
import { RoleType } from "@prisma/client";

async function getActiveStaffForRole(nextRole: RoleType) {
  return prisma.staff.findMany({
    where: {
      user: {
        isActive: true,
        roles: { some: { role: { name: nextRole as RoleType } } },
      },
    },
    include: {
      user: { select: { email: true, id: true } },
    },
  });
}

async function sendBulkEmails(emails: string[], subject: string, html: string) {
  await Promise.allSettled(
    emails.map((email) =>
      sendEmail({
        to: email,
        subject,
        html,
      }),
    ),
  );
}

async function sendSingleEmailByUserId(userId: string, subject: string, html: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, isActive: true },
  });

  if (!user?.email || !user.isActive) {
    return;
  }

  try {
    await sendEmail({
      to: user.email,
      subject,
      html,
    });
  } catch (error) {
    console.error("EMAIL_SEND_ERROR", error);
  }
}

export async function notifyNextRoleStaff(nextRole: RoleType, message: string) {
  const staffList = await prisma.staff.findMany({
    where: {
      user: {
        isActive: true,
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

export async function notifyNextRoleStaffByEmail(nextRole: RoleType, studentId: string) {
  const staffList = await getActiveStaffForRole(nextRole);
  const emails = staffList
    .map((staff) => staff.user.email)
    .filter((email): email is string => Boolean(email));

  if (emails.length === 0) {
    return;
  }

  await sendBulkEmails(
    emails,
    "New clearance request pending",
    pendingApprovalEmailTemplate(studentId),
  );
}

export async function notifyScopedRoleStaff(
  nextRole: RoleType,
  message: string,
  studentId: string,
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      department: { include: { head: true } },
      school: { include: { school_dean: true } },
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

export async function sendStudentPendingEmail(userId: string, studentId: string) {
  await sendSingleEmailByUserId(
    userId,
    "Clearance request submitted",
    studentPendingApprovalTemplate(studentId),
  );
}

export async function sendStudentRejectionEmail(
  userId: string,
  studentId: string,
  role: string,
  comment?: string,
) {
  await sendSingleEmailByUserId(
    userId,
    "Clearance request rejected",
    rejectionEmailTemplate(studentId, role, comment),
  );
}

export async function sendStaffRejectionEmail(
  staffId: string,
  studentId: string,
  role: string,
  comment?: string,
) {
  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: { user: { select: { email: true, isActive: true } } },
  });

  if (!staff?.user?.email || !staff.user.isActive) {
    return;
  }

  try {
    await sendEmail({
      to: staff.user.email,
      subject: "Clearance request rejected",
      html: rejectionEmailTemplate(studentId, role, comment),
    });
  } catch (error) {
    console.error("EMAIL_SEND_ERROR", error);
  }
}

import { Student } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/lib/email";
import { pendingApprovalEmailTemplate } from "@/lib/emailTemplates";

/** Notify the student's advisor and department head when a new clearance request is created. */
export async function notifyInitialApprovers(student: Student, clearanceId: string) {
  const notifications: Promise<any>[] = [];

  if (student.advisorId) {
    const advisor = await prisma.staff.findUnique({
      where: { id: student.advisorId },
      include: { user: { select: { email: true, isActive: true } } },
    });

    if (advisor?.userId) {
      notifications.push(
        sendNotification({
          userId: advisor.userId,
          message: `New clearance request from ${student.studentId}`,
          referenceId: clearanceId,
          forRole: "ADVISOR",
        }),
      );

      if (advisor.user?.email && advisor.user.isActive) {
        try {
          await sendEmail({
            to: advisor.user.email,
            subject: "New clearance request pending",
            html: pendingApprovalEmailTemplate(student.studentId),
          });
        } catch (error) {
          console.error("ADVISOR_PENDING_EMAIL_ERROR", error);
        }
      }
    }
  }
  await Promise.allSettled(notifications);
}

// Notify all users who hold a specific role.
export async function notifyRole(roleName: string, message: string, clearanceId?: string) {
  const role = await prisma.role.findUnique({
    where: { name: roleName as any },
    include: { users: { include: { user: true } } },
  });

  if (!role) return;

  await Promise.allSettled(
    role.users.map((userRole) =>
      sendNotification({
        userId: userRole.user.id,
        message,
        referenceId: clearanceId,
        forRole: roleName,
      }),
    ),
  );
}

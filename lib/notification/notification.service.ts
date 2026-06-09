import { Student } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { sendNotification } from "@/lib/notify";
import { sendEmail } from "@/lib/email";

import {
  pendingApprovalEmailTemplate,
  approvalEmailTemplate,
  rejectionEmailTemplate,
  finalApprovalTemplate,
} from "@/lib/emailTemplates";

export async function notifyInitialApprovers(
  student: Student,
  clearanceId: string
) {
  const notifications: Promise<any>[] = [];

  if (student.advisorId) {
    const advisor = await prisma.staff.findUnique({
      where: { id: student.advisorId },
      include: {
        user: true,
      },
    });

    if (advisor?.userId && advisor.user?.email) {
      notifications.push(
        sendNotification({
          userId: advisor.userId,
          message: `New clearance request from ${student.studentId}`,
          referenceId: clearanceId,
          forRole: "ADVISOR",
        })
      );

      notifications.push(
        sendEmail({
          to: advisor.user.email,
          subject: "New Clearance Request",
          html: pendingApprovalEmailTemplate(student.studentId),
        })
      );
    }
  }

  await Promise.allSettled(notifications);
}

export async function notifyRole(
  roleName: string,
  message: string,
  clearanceId?: string
) {
  const role = await prisma.role.findUnique({
    where: { name: roleName as any },

    include: {
      users: {
        include: {
          user: true,
        },
      },
    },
  });

  if (!role) return;

  await Promise.allSettled(
    role.users.map(async (userRole) => {
      await sendNotification({
        userId: userRole.user.id,
        message,
        referenceId: clearanceId,
        forRole: roleName,
      });

      if (userRole.user.email) {
        await sendEmail({
          to: userRole.user.email,
          subject: "Clearance Request Pending",
          html: `
            <div style="font-family: Arial; padding: 24px;">
              <h2>Pending Clearance Approval</h2>

              <p>${message}</p>
            </div>
          `,
        });
      }
    })
  );
}

export async function notifyStudentApproved(
  studentEmail: string,
  studentId: string,
  roleName: string
) {
  await sendEmail({
    to: studentEmail,
    subject: "Clearance Approved",
    html: approvalEmailTemplate(studentId, roleName),
  });
}

export async function notifyStudentRejected(
  studentEmail: string,
  studentId: string,
  roleName: string,
  comment?: string
) {
  await sendEmail({
    to: studentEmail,
    subject: "Clearance Rejected",
    html: rejectionEmailTemplate(
      studentId,
      roleName,
      comment
    ),
  });
}

export async function notifyFinalApproval(
  studentEmail: string,
  studentId: string
) {
  await sendEmail({
    to: studentEmail,
    subject: "Clearance Completed",
    html: finalApprovalTemplate(studentId),
  });
}
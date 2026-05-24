import {
  ApprovalStatus,
  ClearanceStatus,
  RoleType,
} from "@prisma/client";

import { prisma } from "@/lib/prisma";
import { getApprovalById } from "./approval.query";
import {
  notifyNextRoleStaff,
  notifyNextRoleStaffByEmail,
  notifyStudent,
  sendStaffRejectionEmail,
  sendStudentRejectionEmail,
} from "./approval.notification";
import { generateCertificate } from "@/lib/certificate/certificate.service";
import { sendEmail } from "@/lib/email";
import { finalApprovalTemplate } from "@/lib/emailTemplates";
import {
  emitClearanceRealtime,
  type ClearanceRealtimeAction,
} from "@/lib/clearance/clearanceSocketIo";

const STAGE_ONE_ROLES = [RoleType.CAFETERIA, RoleType.CAMPUS_POLICE] as const;
const STAGE_TWO_ROLES = [RoleType.LIBRARY, RoleType.DORMITORY] as const;
const FINAL_STAGE_ROLES = [
  RoleType.STUDENT_DEAN,
  ...STAGE_TWO_ROLES,
] as const;

async function getRoleApprovals(requestId: string, roleNames: readonly RoleType[]) {
  return prisma.clearanceApproval.findMany({
    where: {
      clearanceRequestId: requestId,
      role: { name: { in: [...roleNames] } },
    },
    include: { role: true },
  });
}

async function allRoleApprovalsApproved(requestId: string, roleNames: readonly RoleType[]) {
  const approvals = await getRoleApprovals(requestId, roleNames);

  return roleNames.every((roleName) =>
    approvals.some(
      (approval) =>
        approval.role.name === roleName &&
        approval.status === ApprovalStatus.APPROVED,
    ),
  );
}

async function activatePendingRoles(
  requestId: string,
  roleNames: readonly RoleType[],
  studentId: string,
) {
  await prisma.clearanceApproval.updateMany({
    where: {
      clearanceRequestId: requestId,
      role: { name: { in: [...roleNames] } },
      status: ApprovalStatus.WAITING,
    },
    data: {
      status: ApprovalStatus.PENDING,
    },
  });

  for (const roleName of roleNames) {
    await notifyNextRoleStaff(
      roleName,
      `New clearance request from ${studentId}`,
    );
    await notifyNextRoleStaffByEmail(roleName, studentId);
  }
}

async function sendCompletionEmail(studentUserId: string | null, studentId: string) {
  if (!studentUserId) {
    return;
  }

  const studentUser = await prisma.user.findUnique({
    where: { id: studentUserId },
    select: { email: true },
  });

  if (!studentUser?.email) {
    console.warn("Missing student email for clearance completion", {
      studentUserId,
    });
    return;
  }

  try {
    await sendEmail({
      to: studentUser.email,
      subject: "Clearance Completed",
      html: finalApprovalTemplate(studentId),
    });
  } catch (error) {
    console.error("CLEARANCE_COMPLETION_EMAIL_ERROR", error);
  }
}

export async function processApprovalWorkflow(
  approvalId: string,
  staffId: string,
  status: ApprovalStatus,
  comment?: string,
  triggeredByUserId?: string,
) {
  const approval = await getApprovalById(approvalId);

  if (!approval) throw new Error("Approval not found");

  if (approval.status !== ApprovalStatus.PENDING) {
    throw new Error("This step is not active yet");
  }

  const request = approval.clearanceRequest;
  const roleName = approval.role.name as RoleType;

  let realtimeAction: "approved" | "rejected" =
    status === ApprovalStatus.REJECTED ? "rejected" : "approved";

  try {
    await prisma.clearanceApproval.update({
      where: { id: approvalId },
      data: {
        status,
        staffId,
        comment,
        approvedAt: status === ApprovalStatus.APPROVED ? new Date() : null,
      },
    });

    if (status === ApprovalStatus.REJECTED) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          status: ClearanceStatus.REJECTED,
          rejectedByRole: roleName,
        },
      });

      await notifyStudent(
        request.student.userId!,
        `Rejected by ${roleName.replace(/_/g, " ")}`
      );
      await sendStudentRejectionEmail(
        request.student.userId!,
        request.student.studentId,
        roleName.replace(/_/g, " "),
        comment,
      );
      if (staffId) {
        await sendStaffRejectionEmail(
          staffId,
          request.student.studentId,
          roleName.replace(/_/g, " "),
          comment,
        );
      }
      return { message: "Rejected" };
    }
    if (roleName === RoleType.ADVISOR) {
      await activatePendingRoles(
        request.id,
        [RoleType.DEPARTMENT_HEAD],
        request.student.studentId,
      );
    } else if (roleName === RoleType.DEPARTMENT_HEAD) {
      await activatePendingRoles(
        request.id,
        [RoleType.SCHOOL_DEAN],
        request.student.studentId,
      );
    } else if (roleName === RoleType.SCHOOL_DEAN) {
      await activatePendingRoles(
        request.id,
        [...STAGE_ONE_ROLES, ...STAGE_TWO_ROLES],
        request.student.studentId,
      );
    } else if (
      roleName === RoleType.CAFETERIA ||
      roleName === RoleType.CAMPUS_POLICE
    ) {
      const stageOneComplete = await allRoleApprovalsApproved(
        request.id,
        STAGE_ONE_ROLES,
      );

      if (stageOneComplete) {
        await activatePendingRoles(
          request.id,
          [RoleType.STUDENT_DEAN],
          request.student.studentId,
        );
      }
    } else if (
      roleName === RoleType.STUDENT_DEAN ||
      roleName === RoleType.LIBRARY ||
      roleName === RoleType.DORMITORY
    ) {
      const finalStageComplete = await allRoleApprovalsApproved(
        request.id,
        FINAL_STAGE_ROLES,
      );

      if (finalStageComplete) {
        await activatePendingRoles(
          request.id,
          [RoleType.REGISTRAR],
          request.student.studentId,
        );
      }
    }

    if (roleName === RoleType.REGISTRAR) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.APPROVED },
      });

      const cert = await generateCertificate(request.id);
      await sendCompletionEmail(request.student.userId, request.student.studentId);
      await notifyStudent(request.student.userId!, "Clearance completed");

      return {
        message: "Completed",
        certificate: cert,
      };
    }

    await prisma.clearanceRequest.update({
      where: { id: request.id },
      data: {
        status: ClearanceStatus.IN_PROGRESS,
      },
    });

    await notifyStudent(
      request.student.userId!,
      `${roleName.replace(/_/g, " ")} approved`,
    );

    return { message: "Processed" };

  } finally {
    emitClearanceRealtime(
      {
        requestId: request.id,
        action: realtimeAction as ClearanceRealtimeAction,
        actorRole: roleName,
        triggeredByUserId,
      },
      { studentUserId: request.student.userId ?? undefined },
    );
  }
}
import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNextRoles, getOfficeCodeByRole } from "@/lib/workflow";
import { getApprovalById } from "./approval.query";
import { notifyNextRoleStaff, notifyScopedRoleStaff, notifyStudent } from "./approval.notification";
import { generateCertificate } from "@/lib/certificate/certificate.service";
import {
  emitClearanceRealtime,
  type ClearanceRealtimeAction,
} from "@/lib/clearance/clearanceSocketIo";


const BEFORE_STUDENT_DEAN: RoleType[] = [
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
];

const BEFORE_REGISTRAR: RoleType[] = [
  RoleType.LIBRARY,
  RoleType.DORMITORY,
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.STUDENT_DEAN,
];


export async function processApprovalWorkflow(
  approvalId: string,
  staffId: string,
  status: ApprovalStatus,
  comment?: string,
  triggeredByUserId?: string,
) {
  
  const approval = await getApprovalById(approvalId);
  if (!approval) throw new Error("Approval not found");

  const request = approval.clearanceRequest;
  const roleName = approval.role.name as RoleType;
  const studentUserId = request.student.userId ?? undefined;
  let realtimeAction: ClearanceRealtimeAction =
    status === ApprovalStatus.REJECTED ? "rejected" : "approved";

  try {
  // 1. UPDATE CURRENT APPROVAL
  await prisma.clearanceApproval.update({
    where: { id: approvalId },
    data: {
      status,
      comment,
      staffId,
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
      `Your clearance request was rejected by ${roleName.replace(/_/g, " ")}`
    );

    return { message: "Request rejected" };
  }

  if (BEFORE_STUDENT_DEAN.includes(roleName)) {
    await notifyStudent(
      request.student.userId!,
      `${roleName.replace(/_/g, " ")} approved your clearance request`
    );

    const cafe_and_campusPoliceApprovals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: request.id,
        role: { name: { in: BEFORE_STUDENT_DEAN } },
      },
    });

    const cafe_and_campusPoliceApprovalsComplete = cafe_and_campusPoliceApprovals.length === BEFORE_STUDENT_DEAN.length &&
      cafe_and_campusPoliceApprovals.every((a) => a.status === ApprovalStatus.APPROVED);

    if (!cafe_and_campusPoliceApprovalsComplete) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.IN_PROGRESS },
      });

      return { message: "Waiting for cafeteria and campus police completion" };
    }
    await upsertNextApproval(request.id, RoleType.STUDENT_DEAN);
    await notifyNextRoleStaff(
      RoleType.STUDENT_DEAN,
      `Clearance request from ${request.student.studentId} is ready for review`
    );
  }

  if (BEFORE_REGISTRAR.includes(roleName)) {
    if (!BEFORE_STUDENT_DEAN.includes(roleName)) {
      await notifyStudent(
        request.student.userId!,
        `${roleName.replace(/_/g, " ")} approved your clearance request`
      );
    }
    const finalApprovals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: request.id,
        role: { name: { in: BEFORE_REGISTRAR } },
      },
    });
    const finalComplete =
      finalApprovals.length === BEFORE_REGISTRAR.length &&
      finalApprovals.every((a) => a.status === ApprovalStatus.APPROVED);

    if (!finalComplete) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.IN_PROGRESS },
      });

      return { message: "Waiting for final stage completion" };
    }
    await upsertNextApproval(request.id, RoleType.REGISTRAR);
    await notifyNextRoleStaff(
      RoleType.REGISTRAR,
      `Final clearance ready for registrar: ${request.student.studentId}`
    );
  }

  // 5. REGISTRAR APPROVAL STEP
  if (roleName === RoleType.REGISTRAR) {
    console.log("ENTERED REGISTRAR BLOCK:", request.id);

    try {
      const result = await prisma.$transaction(async (tx) => {
        const updatedRequest = await tx.clearanceRequest.update({
          where: { id: request.id },
          data: { status: ClearanceStatus.APPROVED },
        });

        return updatedRequest;
      });

      console.log("Request marked APPROVED:", result.id);
    } catch (err) {
      console.error("REGISTRAR TRANSACTION FAILED:", err);
      throw new Error("Failed to approve clearance request");
    }

    let cert = null;

    try {
      cert = await generateCertificate(request.id);
      console.log("Certificate generated:", cert?.id);
    } catch (certError) {
      console.error("CERT GENERATION FAILED:", certError);

      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.IN_PROGRESS },
      });

      return {
        message: "Approval succeeded but certificate generation failed",
        certificate: null,
      };
    }
    await notifyStudent(
      request.student.userId!,
      "Your clearance is complete! Certificate is ready."
    );
    realtimeAction = "completed";
    return {
      message: "Clearance fully completed",
      certificate: cert,
    };
  }

  const nextRoles = getNextRoles(roleName);

  for (const nextRole of nextRoles) {
    if (nextRole === RoleType.STUDENT_DEAN) continue;
    await upsertNextApproval(request.id, nextRole as RoleType);
    if (nextRole === RoleType.DEPARTMENT_HEAD || nextRole === RoleType.SCHOOL_DEAN) {
      await notifyScopedRoleStaff(
        nextRole,
        `New clearance request from student ${request.student.studentId}`,
        request.student.id,
      );
    } else {
      await notifyNextRoleStaff(
        nextRole,
        `New clearance request from ${request.student.studentId}`,
      );
    }
  }

  const alreadyHandled = BEFORE_STUDENT_DEAN.includes(roleName) || BEFORE_REGISTRAR.includes(roleName);

  await prisma.clearanceRequest.update({
    where: { id: request.id },
    data: { status: ClearanceStatus.IN_PROGRESS },
  });

  if (!alreadyHandled) {
    await notifyStudent(
      request.student.userId!,
      `${roleName.replace(/_/g, " ")} approved your clearance request`
    );
  }

  return { message: "Approval processed successfully" };
  } finally {
    emitClearanceRealtime(
      {
        requestId: request.id,
        action: realtimeAction,
        actorRole: roleName,
        triggeredByUserId,
      },
      { studentUserId },
    );
  }
}

async function upsertNextApproval(requestId: string, nextRole: RoleType) {
  const role = await prisma.role.findUnique({
    where: { name: nextRole },
  });

  if (!role) return;

  const officeCode = getOfficeCodeByRole(nextRole);
  const office = officeCode ? await prisma.clearanceStaffOffice.findUnique({
        where: { code: officeCode },
      })
    : null;

  await prisma.clearanceApproval.upsert({
    where: {
      clearanceRequestId_roleId: {
        clearanceRequestId: requestId,
        roleId: role.id,
      },
    },
    update: {},
    create: {
      clearanceRequestId: requestId,
      roleId: role.id,
      officeId: office?.id ?? null,
      status: ApprovalStatus.PENDING,
    },
  });
}
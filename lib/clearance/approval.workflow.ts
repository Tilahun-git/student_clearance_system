import { ApprovalStatus, ClearanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { getNextRole, getOfficeByRole } from "@/lib/workflow";
import { getApprovalById } from "./approval.query";
import {notifyNextRoleStaff,notifyStudent,} from "./approval.notification";
import { generateCertificate } from "@/lib/certificate/certificate.service";

const CAFETERIA_STAGE = ["CAFETERIA", "CAMPUS_POLICE"];

const FINAL_STAGE = [
  "LIBRARY",
  "DORMITORY",
  "CAFETERIA",
  "CAMPUS_POLICE",
  "STUDENT_DEAN",
];

export async function processApprovalWorkflow(
  approvalId: string,
  staffId: string,
  status: ApprovalStatus,
  comment?: string,
) {
  const approval = await getApprovalById(approvalId);
  if (!approval) throw new Error("Approval not found");

  const request = approval.clearanceRequest;
  const roleName = approval.role.name;

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

    await notifyStudent(request.student.userId!, `Rejected by ${roleName}`);

    return { message: "Request rejected" };
  }
  if (CAFETERIA_STAGE.includes(roleName)) {
    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: request.id,
        role: { name: { in: CAFETERIA_STAGE } },
      },
    });

    const stageComplete =
      approvals.length === CAFETERIA_STAGE.length &&
      approvals.every((a) => a.status === ApprovalStatus.APPROVED);

    if (!stageComplete) {
      return { message: "Waiting for CAFETERIA stage completion" };
    }
    const studentDean = await prisma.role.findUnique({
      where: { name: "STUDENT_DEAN" },
    });

    if (studentDean) {
      const office = await prisma.clearanceStaffOffice.findUnique({
        where: { code: "STUDENT_DEAN" },
      });

      await prisma.clearanceApproval.upsert({
        where: {
          clearanceRequestId_roleId: {
            clearanceRequestId: request.id,
            roleId: studentDean.id,
          },
        },
        update: {},
        create: {
          clearanceRequestId: request.id,
          roleId: studentDean.id,
          officeId: office?.id ?? null,
          status: ApprovalStatus.PENDING,
        },
      });

      await notifyNextRoleStaff(
        "STUDENT_DEAN",
        `New clearance request from ${request.student.studentId}`,
      );
    }
  }

  if (FINAL_STAGE.includes(roleName)) {
    const approvals = await prisma.clearanceApproval.findMany({
      where: {
        clearanceRequestId: request.id,
        role: { name: { in: FINAL_STAGE } },
      },
    });

    const stageComplete =
      approvals.length === FINAL_STAGE.length &&
      approvals.every((a) => a.status === ApprovalStatus.APPROVED);

    if (!stageComplete) {
      return { message: "Waiting for final stage completion" };
    }

    const registrar = await prisma.role.findUnique({
      where: { name: "REGISTRAR" },
    });

    if (registrar) {
      const office = await prisma.clearanceStaffOffice.findUnique({
        where: { code: "REGISTRAR" },
      });

      await prisma.clearanceApproval.upsert({
        where: {
          clearanceRequestId_roleId: {
            clearanceRequestId: request.id,
            roleId: registrar.id,
          },
        },
        update: {},
        create: {
          clearanceRequestId: request.id,
          roleId: registrar.id,
          officeId: office?.id ?? null,
          status: ApprovalStatus.PENDING,
        },
      });

      await notifyNextRoleStaff(
        "REGISTRAR",
        `Final clearance ready for registrar: ${request.student.studentId}`,
      );
    }
  }

  if (roleName === "REGISTRAR") {
    await prisma.clearanceRequest.update({
      where: { id: request.id },
      data: { status: ClearanceStatus.APPROVED },
    });

    const cert = await generateCertificate(request.id);

    await notifyStudent(
      request.student.userId!,
      "Clearance completed. Certificate generated successfully.",
    );

    return {
      message: "Clearance fully completed",
      certificate: cert,
    };
  }

  const nextRoles = getNextRole(roleName);

  for (const nextRole of nextRoles) {
    if (nextRole === "STUDENT_DEAN") continue;

    const role = await prisma.role.findUnique({
      where: { name: nextRole },
    });

    if (!role) continue;

    const officeCode = getOfficeByRole(nextRole);

    const office = officeCode
      ? await prisma.clearanceStaffOffice.findUnique({
          where: { code: officeCode },
        })
      : null;

    await prisma.clearanceApproval.upsert({
      where: {
        clearanceRequestId_roleId: {
          clearanceRequestId: request.id,
          roleId: role.id,
        },
      },
      update: {},
      create: {
        clearanceRequestId: request.id,
        roleId: role.id,
        officeId: office?.id ?? null,
        status: ApprovalStatus.PENDING,
      },
    });

    await notifyNextRoleStaff(
      nextRole,
      `New clearance request from ${request.student.studentId}`,
    );
  }

  await prisma.clearanceRequest.update({
    where: { id: request.id },
    data: {
      status: ClearanceStatus.IN_PROGRESS,
    },
  });

  await notifyStudent(
    request.student.userId!,
    `${roleName} approved your request`,
  );

  return {
    message: "Approval processed successfully",
  };
}
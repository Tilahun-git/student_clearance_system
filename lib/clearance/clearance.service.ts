import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  notifyInitialApprovers,
  notifyRole,
} from "@/lib/notification/notification.service";
import {
  notifyNextRoleStaff,
  notifyNextRoleStaffByEmail,
  sendStudentPendingEmail,
} from "@/lib/clearance/approval.notification";
import { emitClearanceRealtime } from "@/lib/clearance/clearanceSocketIo";
import { getEthiopianAcademicContext } from "@/lib/clearance/academicCalendar";
import { canStudentSubmitClearanceRequest } from "@/lib/clearance/requestEligibility";
import { getNextRoles, getOfficeCodeByRole } from "@/lib/workflow";

const ALL_WORKFLOW_ROLES: RoleType[] = [
  RoleType.ADVISOR,
  RoleType.DEPARTMENT_HEAD,
  RoleType.SCHOOL_DEAN,
  RoleType.LIBRARY,
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.DORMITORY,
  RoleType.STUDENT_DEAN,
  RoleType.REGISTRAR,
];

function getDownstreamRoles(role: RoleType): RoleType[] {
  const downstream = new Set<RoleType>();

  const visit = (currentRole: RoleType) => {
    for (const nextRole of getNextRoles(currentRole)) {
      if (!downstream.has(nextRole)) {
        downstream.add(nextRole);
        visit(nextRole);
      }
    }
  };

  visit(role);
  return [...downstream];
}

async function resumeRejectedRequest(
  requestId: string,
  studentId: string,
  payload: {
    reason?: string;
    academicYear?: string;
    semester?: string;
  },
) {
  const rejectedRequest = await prisma.clearanceRequest.findUnique({
    where: { id: requestId },
    include: {
      approvals: {
        include: {
          role: true,
        },
      },
    },
  });

  if (!rejectedRequest) {
    throw new Error("Rejected request not found");
  }

  const rejectedRoles = rejectedRequest.approvals
    .filter((approval) => approval.status === ApprovalStatus.REJECTED)
    .map((approval) => approval.role.name as RoleType);

  if (rejectedRoles.length === 0) {
    throw new Error("No rejected roles found for resubmission");
  }

  const resetRoles = new Set<RoleType>(rejectedRoles);
  for (const role of rejectedRoles) {
    for (const downstreamRole of getDownstreamRoles(role)) {
      resetRoles.add(downstreamRole);
    }
  }

  const resolvedAcademicContext = payload.academicYear && payload.semester
    ? {
        academicYear: payload.academicYear,
        semester: payload.semester,
      }
    : getEthiopianAcademicContext();

  await prisma.$transaction(async (tx) => {
    await tx.clearanceRequest.update({
      where: { id: requestId },
      data: {
        status: ClearanceStatus.IN_PROGRESS,
        rejectedByRole: null,
        reason: payload.reason ?? rejectedRequest.reason,
        academicYear: resolvedAcademicContext.academicYear,
        semester: resolvedAcademicContext.semester,
        resubmissionCount: {
          increment: 1,
        },
      },
    });

    for (const approval of rejectedRequest.approvals) {
      const roleName = approval.role.name as RoleType;
      const shouldReset = resetRoles.has(roleName);

      if (!shouldReset) {
        continue;
      }

      const nextStatus = rejectedRoles.includes(roleName)
        ? ApprovalStatus.PENDING
        : ApprovalStatus.WAITING;

      await tx.clearanceApproval.update({
        where: { id: approval.id },
        data: {
          status: nextStatus,
          staffId: null,
          comment: null,
          approvedAt: null,
        },
      });
    }
  });

  for (const roleName of rejectedRoles) {
    await notifyNextRoleStaff(roleName, `New clearance request from ${studentId}`);
    await notifyNextRoleStaffByEmail(roleName, studentId);
  }

  emitClearanceRealtime(
    {
      requestId,
      action: "resubmitted",
      triggeredByUserId: studentId,
    },
    { studentUserId: studentId },
  );

  return await prisma.clearanceRequest.findUnique({
    where: { id: requestId },
    include: { approvals: { include: { role: true } } },
  });
}

export async function createClearanceRequest(userId: string, body: any) {
  const student = await prisma.student.findUnique({ where: { userId } });
  if (!student) throw new Error("Student profile missing");

  const activeRequest = await prisma.clearanceRequest.findFirst({
    where: {
      studentId: student.id,
      status: { in: [ClearanceStatus.PENDING, ClearanceStatus.IN_PROGRESS] },
    },
  });

  if (activeRequest) throw new Error("You already have an active request");

  const canSubmit = await canStudentSubmitClearanceRequest(student.id);
  if (!canSubmit) {
    throw new Error("You already completed a clearance request within the last 12 months.");
  }

  const rejectedRequest = await prisma.clearanceRequest.findFirst({
    where: {
      studentId: student.id,
      status: ClearanceStatus.REJECTED,
    },
    orderBy: { createdAt: "desc" },
    include: {
      approvals: {
        include: {
          role: true,
        },
      },
    },
  });

  const resolvedAcademicContext = body.academicYear && body.semester
    ? {
        academicYear: body.academicYear,
        semester: body.semester,
      }
    : getEthiopianAcademicContext();

  if (rejectedRequest) {
    const resumed = await resumeRejectedRequest(rejectedRequest.id, student.studentId, {
      reason: body.reason ?? rejectedRequest.reason,
      academicYear: resolvedAcademicContext.academicYear,
      semester: resolvedAcademicContext.semester,
    });
    await sendStudentPendingEmail(userId, student.studentId);
    return resumed;
  }

  const roleRecords = await prisma.role.findMany({
    where: { name: { in: ALL_WORKFLOW_ROLES } },
  });

  const result = await prisma.$transaction(async (tx) => {
    const clearance = await tx.clearanceRequest.create({
      data: {
        studentId: student.id,
        schoolId: body.schoolId,
        departmentId: body.departmentId,
        reason: body.reason,
        academicYear: resolvedAcademicContext.academicYear,
        semester: resolvedAcademicContext.semester,
        status: ClearanceStatus.PENDING,
      },
    });

    for (const roleName of ALL_WORKFLOW_ROLES) {
      const roleRecord = roleRecords.find((r) => r.name === roleName);
      if (!roleRecord) continue;

      const officeCode = getOfficeCodeByRole(roleName);
      const office = officeCode
        ? await tx.clearanceStaffOffice.findUnique({
            where: { code: officeCode },
          })
        : null;

      await tx.clearanceApproval.create({
        data: {
          clearanceRequestId: clearance.id,
          roleId: roleRecord.id,
          officeId: office?.id ?? null,

          status:
            roleName === RoleType.ADVISOR
              ? ApprovalStatus.PENDING
              : ApprovalStatus.WAITING,
        },
      });
    }

    return clearance;
  });

  await notifyInitialApprovers(student, result.id);
  await sendStudentPendingEmail(userId, student.studentId);

  emitClearanceRealtime(
    { requestId: result.id, action: "created", triggeredByUserId: userId },
    { studentUserId: userId },
  );

  return result;
}
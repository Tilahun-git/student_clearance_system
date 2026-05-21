import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { notifyInitialApprovers, notifyRole } from "@/lib/notification/notification.service";
import { emitClearanceRealtime } from "@/lib/clearance/clearanceSocketIo";
import { getOfficeCodeByRole } from "@/lib/workflow";

// All 9 roles in display order — created upfront so the student sees the full pipeline immediately
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

  const rejectedRequest = await prisma.clearanceRequest.findFirst({
    where: { studentId: student.id, status: ClearanceStatus.REJECTED },
    include: { approvals: { include: { role: true } } },
    orderBy: { createdAt: "desc" },
  });

  if (rejectedRequest) {
    const rejectedApproval = rejectedRequest.approvals.find(
      (a) => a.status === ApprovalStatus.REJECTED,
    );
    if (!rejectedApproval) throw new Error("Rejected workflow step not found");

    await prisma.$transaction(async (tx) => {
      await tx.clearanceApproval.update({
        where: { id: rejectedApproval.id },
        data: { status: ApprovalStatus.PENDING, comment: null, approvedAt: null },
      });
      await tx.clearanceRequest.update({
        where: { id: rejectedRequest.id },
        data: {
          status: ClearanceStatus.IN_PROGRESS,
          rejectedByRole: null,
          resubmissionCount: { increment: 1 },
        },
      });
    });

    await notifyRole(
      rejectedApproval.role.name,
      `Clearance request resubmitted by ${student.studentId}`,
      rejectedRequest.id,
    );

    emitClearanceRealtime(
      {
        requestId: rejectedRequest.id,
        action: "resubmitted",
        actorRole: rejectedApproval.role.name,
        triggeredByUserId: userId,
      },
      { studentUserId: userId },
    );

    return rejectedRequest;
  }

  // Fetch all role records and office records upfront
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
        academicYear: body.academicYear,
        semester: body.semester,
        status: ClearanceStatus.PENDING,
      },
    });

    // Create ALL approval records as PENDING upfront so the student sees the full pipeline
    for (const roleName of ALL_WORKFLOW_ROLES) {
      const roleRecord = roleRecords.find((r) => r.name === roleName);
      if (!roleRecord) continue;

      const officeCode = getOfficeCodeByRole(roleName);
      const office = officeCode
        ? await tx.clearanceStaffOffice.findUnique({ where: { code: officeCode } })
        : null;

      await tx.clearanceApproval.create({
        data: {
          clearanceRequestId: clearance.id,
          roleId: roleRecord.id,
          officeId: office?.id ?? null,
          status: ApprovalStatus.PENDING,
        },
      });
    }

    return clearance;
  });

  await notifyInitialApprovers(student, result.id);

  emitClearanceRealtime(
    { requestId: result.id, action: "created", triggeredByUserId: userId },
    { studentUserId: userId },
  );

  return result;
}

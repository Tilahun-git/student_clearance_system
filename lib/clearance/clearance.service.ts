import { ApprovalStatus, ClearanceStatus,} from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {notifyInitialApprovers, notifyRole,} from "@/lib/notification/notification.service";

export async function createClearanceRequest(userId: string,body: any) {
const student = await prisma.student.findUnique({
      where: {
        userId,
      },
    });

  if (!student) {
    throw new Error(
      "Student profile missing"
    );
  }
  const activeRequest = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status: {
          in: [
            ClearanceStatus.PENDING,
            ClearanceStatus.IN_PROGRESS,
          ],
        },
      },
    });

  if (activeRequest) {
    throw new Error(
      "You already have an active request"
    );
  }

  const rejectedRequest = await prisma.clearanceRequest.findFirst({
      where: {
        studentId: student.id,
        status:
          ClearanceStatus.REJECTED,
      },
      include: {
        approvals: {
          include: {
            role: true,
          },
        },
      },

      orderBy: {
        createdAt: "desc",
      },
    });

  if (rejectedRequest) {
    const rejectedApproval = rejectedRequest.approvals.find((approval) => approval.status ===  ApprovalStatus.REJECTED);
    if (!rejectedApproval) {
      throw new Error(
        "Rejected workflow step not found"
      );
    }
    await prisma.$transaction(async (tx) => {await tx.clearanceApproval.update({
          where: {
            id: rejectedApproval.id,
          },
          data: {
            status: ApprovalStatus.PENDING,
            comment: null,
            approvedAt: null,
          },
        });

        await tx.clearanceRequest.update({
          where: {
            id: rejectedRequest.id,
          },
          data: {
            status:
              ClearanceStatus.IN_PROGRESS,
            rejectedByRole: null,
            resubmissionCount: {
              increment: 1,
            },
          },
        });
      }
    );

    await notifyRole(rejectedApproval.role.name,
      `Clearance request resubmitted by ${student.studentId}`,rejectedRequest.id
    );
    return rejectedRequest;
  }
   const roles = await prisma.role.findMany({
      where: {
        name: {
          in: ["ADVISOR"],
        },
      },
    });

  const rolesMap = new Map(roles.map((role) => [role.name,role,]));
  const advisorRole = rolesMap.get("ADVISOR");
  if (!advisorRole) {
    throw new Error("ADVISOR role not found");
  }
  const result = await prisma.$transaction(
      async (tx) => {
        const clearance =
          await tx.clearanceRequest.create({
            data: {
              studentId: student.id,
              facultyId: body.facultyId,
              schoolId: body.schoolId,
              departmentId:body.departmentId,
              reason:body.reason,
              academicYear: body.academicYear,
              semester: body.semester,
              status: ClearanceStatus.PENDING,
            },
          });
        await tx.clearanceApproval.create({
          data: {
            clearanceRequestId:clearance.id,
            roleId: advisorRole.id,
            status: ApprovalStatus.PENDING,
          },
        });
        return clearance;
      }
    );

  await notifyInitialApprovers(student,result.id);
  return result;
}
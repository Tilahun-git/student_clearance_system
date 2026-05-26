import { ClearanceStatus } from "@prisma/client";
import { prisma } from "@/lib/prisma";

const ONE_YEAR_IN_MS = 1000 * 60 * 60 * 24 * 365;
// const ONE_YEAR_IN_MS= 1000 * 60;
// const ONE_YEAR_IN_MS = 1000 * 60 * 2;

export async function canStudentSubmitClearanceRequest(studentId: string) {
  const latestRequest = await prisma.clearanceRequest.findFirst({
    where: { studentId },
    orderBy: { createdAt: "desc" },
  });
  if (!latestRequest) {
    return true;
  }
  if (latestRequest.status === ClearanceStatus.REJECTED) {
    return true;
  }
  if (
    latestRequest.status === ClearanceStatus.PENDING ||
    latestRequest.status === ClearanceStatus.IN_PROGRESS
  ) {
    return false;
  }
  const recentApproved = await prisma.clearanceRequest.findFirst({
    where: {
      studentId,
      status: ClearanceStatus.APPROVED,
      createdAt: {
        gte: new Date(Date.now() - ONE_YEAR_IN_MS),
      },
    },
    orderBy: { createdAt: "desc" },
  });
  return !recentApproved;
}

import { prisma } from "@/lib/prisma";

export async function getApprovalById(id: string) {
  return prisma.clearanceApproval.findUnique({
    where: { id },
    include: {
      role: true,
      office: true,
      clearanceRequest: {
        include: {
          student: true,
        },
      },
    },
  });
}


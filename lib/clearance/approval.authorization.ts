import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

export async function getAuthorizedStaff(userId: string) {
  return prisma.staff.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  });
}

export function hasRoleAccess(roleNames: string[],approvalRole: RoleType) {
  return roleNames.includes(approvalRole);
}
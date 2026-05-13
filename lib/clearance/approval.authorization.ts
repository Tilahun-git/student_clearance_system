import { prisma } from "@/lib/prisma";

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

export function hasRoleAccess(
  roleNames: string[],
  approvalRole: string
) {
  return roleNames.includes(approvalRole);
}
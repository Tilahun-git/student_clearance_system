import { prisma } from "@/lib/prisma";
import { buildRoleFilters } from "./approval.filter";

export async function fetchApprovalsForStaff(userId: string) {
  const staff = await prisma.staff.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          roles: {
            include: { role: true },
          },
        },
      },
      department: true,
      school: true,
    },
  });

  if (!staff) {
    throw new Error("Staff not found");
  }

  const roleNames = staff.user.roles.map(r => r.role.name);

  const filters = buildRoleFilters(roleNames, staff);

  return prisma.clearanceApproval.findMany({
    where: {
      OR: filters,
    },

    include: {
      role: true,
      office: true,
      clearanceRequest: {
        include: {
          student: true,
        },
      },
    },

    orderBy: {
      approvedAt: "desc",
    },
  });
}
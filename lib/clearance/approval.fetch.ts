import { prisma } from "@/lib/prisma";
import { buildRoleFilters } from "./approval.filter";
import { RoleType } from "@prisma/client";

/**
 * Fetch pending clearance approvals for a staff member.
 */
export async function fetchApprovalsForStaff(userId: string,activeRole?: RoleType,) {
  
  const staff = await prisma.staff.findUnique({
    where: { userId },
    include: {
      user: {
        include: {
          roles: { include: { role: true } },
        },
      },
      department: true,
      school: true,
    },
  });

  if (!staff) throw new Error("Staff not found");

  // If activeRole is set, only build filters for that single role.
  const allRoleNames = staff.user.roles.map((r) => r.role.name as RoleType);
  const roleNames = activeRole && allRoleNames.includes(activeRole)
      ? [activeRole]
      : allRoleNames;

  const filters = buildRoleFilters(roleNames, staff);
  if (filters.length === 0) return [];

  return prisma.clearanceApproval.findMany({
    where: { OR: filters },
    include: {
      role: true,
      office: true,
      clearanceRequest: {
        include: { student: true },
      },
    },
    orderBy: { approvedAt: "desc" },
  });
}

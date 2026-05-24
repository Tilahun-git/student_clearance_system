import { prisma } from "@/lib/prisma";
import { buildRoleFilters } from "./approval.filter";
import { ApprovalStatus, RoleType, Prisma } from "@prisma/client";

// Roles that can work without a Staff record (e.g. DORMITORY proctors)
const ROLE_ONLY_ROLES: RoleType[] = [
  RoleType.DORMITORY,
  RoleType.LIBRARY,
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.STUDENT_DEAN,
  RoleType.REGISTRAR,
];

// Prerequisites for each role-only role (must all be APPROVED in the same request)
const ROLE_PREREQUISITES: Partial<Record<RoleType, RoleType[]>> = {
  [RoleType.CAFETERIA]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.CAMPUS_POLICE]: [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.LIBRARY]:       [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.DORMITORY]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.STUDENT_DEAN]:  [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN, RoleType.CAFETERIA, RoleType.CAMPUS_POLICE],
  [RoleType.REGISTRAR]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN, RoleType.CAFETERIA, RoleType.CAMPUS_POLICE, RoleType.LIBRARY, RoleType.DORMITORY, RoleType.STUDENT_DEAN],
};

function buildPrereqCondition(role: RoleType): Prisma.ClearanceRequestWhereInput {
  const prereqs = ROLE_PREREQUISITES[role];
  if (!prereqs || prereqs.length === 0) return {};
  return {
    approvals: {
      every: {
        OR: [
          { role: { name: { notIn: prereqs } } },
          { role: { name: { in: prereqs } }, status: ApprovalStatus.APPROVED },
        ],
      },
    },
  };
}

/**
 * Fetch pending clearance approvals for a user.
 *
 * Handles two cases:
 *  A) User has a Staff record  → use buildRoleFilters (existing path)
 *  B) User has no Staff record but has a role-only role (e.g. DORMITORY proctor
 *     stored in the Proctor table) → build a direct filter, scoped to their
 *     assigned students when the role is DORMITORY.
 */
export async function fetchApprovalsForStaff(
  userId: string,
  activeRole?: RoleType,
) {
  const staff = await prisma.staff.findUnique({
    where: { userId },
    include: {
      user: { include: { roles: { include: { role: true } } } },
      department: true,
      school: true,
    },
  });

  // ── Path B: no Staff record ───────────────────────────────────────────────
  if (!staff) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: { roles: { include: { role: true } } },
    });

    if (!user) throw new Error("User not found");

    const userRoles    = user.roles.map((r) => r.role.name as RoleType);
    const effectiveRole =
      activeRole && userRoles.includes(activeRole)
        ? activeRole
        : userRoles.find((r) => ROLE_ONLY_ROLES.includes(r));

    if (!effectiveRole || !ROLE_ONLY_ROLES.includes(effectiveRole)) {
      throw new Error(
        "Staff profile not found. Please contact the administrator to set up your staff profile.",
      );
    }

    let filter: Prisma.ClearanceApprovalWhereInput;

    if (effectiveRole === RoleType.DORMITORY) {
      // Scope to students assigned to this specific proctor + enforce prerequisites
      const proctor = await prisma.proctor.findUnique({ where: { userId } });
      const prereqCondition = buildPrereqCondition(RoleType.DORMITORY);

      filter = {
        role:   { name: RoleType.DORMITORY },
        status: "PENDING",
        clearanceRequest: {
          ...(proctor ? { student: { proctorId: proctor.id } } : {}),
          ...prereqCondition,
        },
      };
    } else {
      const prereqCondition = buildPrereqCondition(effectiveRole);
      filter = {
        role:   { name: effectiveRole },
        status: "PENDING",
        OR: [{ officeId: null }, { office: { code: effectiveRole } }],
        clearanceRequest: prereqCondition,
      };
    }

    return prisma.clearanceApproval.findMany({
      where: filter,
      include: {
        role: true,
        office: true,
        clearanceRequest: { include: { student: true } },
      },
      orderBy: { approvedAt: "desc" },
    });
  }

  // ── Path A: Staff record exists ───────────────────────────────────────────
  const allRoleNames = staff.user.roles.map((r) => r.role.name as RoleType);
  const roleNames =
    activeRole && allRoleNames.includes(activeRole)
      ? [activeRole]
      : allRoleNames;

  // If this staff user also has a Proctor record (edge case: DORMITORY staff
  // who was also registered as a proctor), pass the proctorId for scoping.
  let proctorId: string | undefined;
  if (roleNames.includes(RoleType.DORMITORY)) {
    const proctor = await prisma.proctor.findUnique({ where: { userId } });
    proctorId = proctor?.id;
  }

  const filters = buildRoleFilters(roleNames, staff, proctorId);
  if (filters.length === 0) return [];

  return prisma.clearanceApproval.findMany({
    where: { OR: filters },
    include: {
      role: true,
      office: true,
      clearanceRequest: { include: { student: true } },
    },
    orderBy: { approvedAt: "desc" },
  });
}

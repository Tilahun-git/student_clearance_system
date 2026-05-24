import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

// Roles that can approve without a Staff record (e.g. DORMITORY proctors)
const ROLE_ONLY_ROLES: RoleType[] = [
  RoleType.DORMITORY,
  RoleType.LIBRARY,
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.STUDENT_DEAN,
  RoleType.REGISTRAR,
];

export type AuthorizedActor =
  | {
      isProctor: false;
      id: string;           // Staff.id  — safe to write into ClearanceApproval.staffId
      userId: string;
      schoolId: string | null;
      departmentId: string | null;
      user: { roles: { role: { name: RoleType } }[] };
    }
  | {
      isProctor: true;
      id: string;           // Proctor.id — NOT a valid Staff FK, must NOT be written as staffId
      userId: string;
      schoolId: null;
      departmentId: null;
      user: { roles: { role: { name: RoleType } }[] };
    };

/**
 * Returns the actor record for a user.
 *
 * - If the user has a Staff record → returns it with isProctor: false.
 * - If the user has no Staff record but has a role-only role (e.g. DORMITORY
 *   proctor stored in the Proctor table) → returns a synthetic object with
 *   isProctor: true. The caller MUST NOT write .id into ClearanceApproval.staffId.
 */
export async function getAuthorizedStaff(userId: string): Promise<AuthorizedActor | null> {
  const staff = await prisma.staff.findUnique({
    where: { userId },
    include: {
      user: { include: { roles: { include: { role: true } } } },
    },
  });

  if (staff) {
    return {
      isProctor:    false,
      id:           staff.id,
      userId:       staff.userId,
      schoolId:     staff.schoolId,
      departmentId: staff.departmentId,
      user:         staff.user,
    };
  }

  // No Staff record — check if this is a Proctor-based user
  const proctor = await prisma.proctor.findUnique({
    where: { userId },
    include: {
      user: { include: { roles: { include: { role: true } } } },
    },
  });

  if (!proctor || !proctor.user) return null;

  const userRoles = proctor.user.roles.map((r) => r.role.name as RoleType);
  if (!userRoles.some((r) => ROLE_ONLY_ROLES.includes(r))) return null;

  return {
    isProctor:    true,
    id:           proctor.id,   // Proctor.id — only used for role checks, NOT for staffId FK
    userId:       proctor.userId,
    schoolId:     null,
    departmentId: null,
    user:         proctor.user,
  };
}

export function hasRoleAccess(
  roleNames: string[],
  approvalRole: RoleType,
): boolean {
  return roleNames.includes(approvalRole);
}

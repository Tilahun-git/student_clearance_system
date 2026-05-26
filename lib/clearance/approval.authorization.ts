import { prisma } from "@/lib/prisma";
import { RoleType } from "@prisma/client";

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
      id: string;           
      userId: string;
      schoolId: string | null;
      departmentId: string | null;
      user: { roles: { role: { name: RoleType } }[] };
    }
  | {
      isProctor: true;
      id: string;          
      userId: string;
      schoolId: null;
      departmentId: null;
      user: { roles: { role: { name: RoleType } }[] };
    };

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
    id:           proctor.id,   
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

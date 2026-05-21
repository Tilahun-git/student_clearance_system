import {ApprovalStatus,Prisma,RoleType,Staff,} from "@prisma/client";

const OFFICE_ROLES: RoleType[] = [
RoleType.LIBRARY,
RoleType.DORMITORY,
RoleType.CAFETERIA,
RoleType.CAMPUS_POLICE,
RoleType.REGISTRAR,
RoleType.STUDENT_DEAN,
];


export function buildRoleFilters(roleNames: string[],staff: Staff,): Prisma.ClearanceApprovalWhereInput[] {

  const filters: Prisma.ClearanceApprovalWhereInput[] = [];
for (const roleName of roleNames) {
switch (roleName) {
  case RoleType.ADVISOR:
    filters.push({
      role: {
        name: RoleType.ADVISOR,
      },
      status: ApprovalStatus.PENDING,
      clearanceRequest: {
        student: {
          advisorId: staff.id,
        },
      },
    });
    break;
  case RoleType.DEPARTMENT_HEAD:
    if (!staff.departmentId) break;
    filters.push({
      role: {
        name: RoleType.DEPARTMENT_HEAD,
      },
      status: ApprovalStatus.PENDING,
      clearanceRequest: {
        student: {
          departmentId: staff.departmentId,
        },
      },
    });
    break;
  case RoleType.SCHOOL_DEAN:
    if (!staff.schoolId) break;
    filters.push({
      role: {
        name: RoleType.SCHOOL_DEAN,
      },
      status: ApprovalStatus.PENDING,
      clearanceRequest: {
        student: {
          schoolId: staff.schoolId,
        },
      },
    });
    break;
  default:
    if (OFFICE_ROLES.includes(roleName as RoleType)) {
      // Match by role; office link is optional (approvals created without a
      // ClearanceStaffOffice row have officeId null and were previously excluded).
      filters.push({
        role: { name: roleName as RoleType },
        status: ApprovalStatus.PENDING,
        OR: [{ officeId: null }, { office: { code: roleName } }],
      });
    }
    break;
}
}
return filters;
}

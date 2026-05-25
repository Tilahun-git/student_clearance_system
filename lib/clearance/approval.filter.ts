import { ApprovalStatus, Prisma, RoleType, Staff } from "@prisma/client";

const PREREQUISITES: Partial<Record<RoleType, RoleType[]>> = {
  [RoleType.DEPARTMENT_HEAD]: [RoleType.ADVISOR],
  [RoleType.SCHOOL_DEAN]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD],

  [RoleType.CAFETERIA]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.CAMPUS_POLICE]: [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.LIBRARY]:       [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.DORMITORY]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],

  [RoleType.STUDENT_DEAN]: [
    RoleType.ADVISOR,
    RoleType.DEPARTMENT_HEAD,
    RoleType.SCHOOL_DEAN,
    RoleType.CAFETERIA,
    RoleType.CAMPUS_POLICE,
  ],

  [RoleType.REGISTRAR]: [
    RoleType.ADVISOR,
    RoleType.DEPARTMENT_HEAD,
    RoleType.SCHOOL_DEAN,
    RoleType.CAFETERIA,
    RoleType.CAMPUS_POLICE,
    RoleType.LIBRARY,
    RoleType.DORMITORY,
    RoleType.STUDENT_DEAN,
  ],
};

function prerequisiteFilter(
  role: RoleType,
): Prisma.ClearanceRequestWhereInput | undefined {
  const prereqs = PREREQUISITES[role];
  if (!prereqs || prereqs.length === 0) return undefined;

  return {
    approvals: {
      every: {
        OR: [
          { role: { name: { notIn: prereqs } } },
          {
            role:   { name: { in: prereqs } },
            status: ApprovalStatus.APPROVED,
          },
        ],
      },
    },
  };
}

export function buildRoleFilters(
  roleNames: string[],
  staff: Staff,
  proctorId?: string,
): Prisma.ClearanceApprovalWhereInput[] {
  const filters: Prisma.ClearanceApprovalWhereInput[] = [];

  for (const roleName of roleNames) {
    const prereq = prerequisiteFilter(roleName as RoleType);

    switch (roleName) {
      case RoleType.ADVISOR:
        filters.push({
          role:   { name: RoleType.ADVISOR },
          status: ApprovalStatus.PENDING,
          clearanceRequest: {
            student: { advisorId: staff.id },
          },
        });
        break;

      case RoleType.DEPARTMENT_HEAD:
        if (!staff.departmentId) break;
        filters.push({
          role:   { name: RoleType.DEPARTMENT_HEAD },
          status: ApprovalStatus.PENDING,
          clearanceRequest: {
            student:  { departmentId: staff.departmentId },
            ...prereq,
          },
        });
        break;

      case RoleType.SCHOOL_DEAN:
        if (!staff.schoolId) break;
        filters.push({
          role:   { name: RoleType.SCHOOL_DEAN },
          status: ApprovalStatus.PENDING,
          clearanceRequest: {
            student: { schoolId: staff.schoolId },
            ...prereq,
          },
        });
        break;

      case RoleType.DORMITORY:
        filters.push({
          role:   { name: RoleType.DORMITORY },
          status: ApprovalStatus.PENDING,
          clearanceRequest: {
            ...(proctorId
              ? { student: { proctorId } }
              : {}),
            ...prereq,
          },
        });
        break;

      default: {
        const officeRoles: RoleType[] = [
          RoleType.LIBRARY,
          RoleType.CAFETERIA,
          RoleType.CAMPUS_POLICE,
          RoleType.REGISTRAR,
          RoleType.STUDENT_DEAN,
        ];
        if (officeRoles.includes(roleName as RoleType)) {
          filters.push({
            role:   { name: roleName as RoleType },
            status: ApprovalStatus.PENDING,
            OR: [{ officeId: null }, { office: { code: roleName } }],
            clearanceRequest: prereq ?? {},
          });
        }
        break;
      }
    }
  }

  return filters;
}

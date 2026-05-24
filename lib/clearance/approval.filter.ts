import { ApprovalStatus, Prisma, RoleType, Staff } from "@prisma/client";

// ── Prerequisite map ──────────────────────────────────────────────────────────
// For each role, list ALL roles that must be APPROVED before this role's
// approval should be visible to the actor. Derived directly from workflow.ts.
//
// Workflow:
//   ADVISOR → DEPT_HEAD → SCHOOL_DEAN
//                              ↓ (parallel)
//   CAFETERIA  CAMPUS_POLICE  LIBRARY  DORMITORY
//       ↓            ↓
//     STUDENT_DEAN (needs CAFETERIA + CAMPUS_POLICE)
//                              ↓
//   REGISTRAR (needs LIBRARY + DORMITORY + STUDENT_DEAN)

const PREREQUISITES: Partial<Record<RoleType, RoleType[]>> = {
  // Sequential chain
  [RoleType.DEPARTMENT_HEAD]: [RoleType.ADVISOR],
  [RoleType.SCHOOL_DEAN]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD],

  // Parallel batch — all need SCHOOL_DEAN approved first
  [RoleType.CAFETERIA]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.CAMPUS_POLICE]: [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.LIBRARY]:       [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],
  [RoleType.DORMITORY]:     [RoleType.ADVISOR, RoleType.DEPARTMENT_HEAD, RoleType.SCHOOL_DEAN],

  // STUDENT_DEAN needs CAFETERIA + CAMPUS_POLICE (+ the chain before them)
  [RoleType.STUDENT_DEAN]: [
    RoleType.ADVISOR,
    RoleType.DEPARTMENT_HEAD,
    RoleType.SCHOOL_DEAN,
    RoleType.CAFETERIA,
    RoleType.CAMPUS_POLICE,
  ],

  // REGISTRAR needs everything
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

/**
 * Builds a Prisma sub-filter that ensures all prerequisite roles are APPROVED
 * within the same clearance request.
 * Returns undefined when there are no prerequisites (e.g. ADVISOR).
 */
function prerequisiteFilter(
  role: RoleType,
): Prisma.ClearanceRequestWhereInput | undefined {
  const prereqs = PREREQUISITES[role];
  if (!prereqs || prereqs.length === 0) return undefined;

  // Every prerequisite role must have an APPROVED approval in this request
  return {
    approvals: {
      every: {
        OR: [
          // Rows for non-prerequisite roles are ignored
          { role: { name: { notIn: prereqs } } },
          // Prerequisite role rows must be APPROVED
          {
            role:   { name: { in: prereqs } },
            status: ApprovalStatus.APPROVED,
          },
        ],
      },
    },
  };
}

// ── Main filter builder ───────────────────────────────────────────────────────

export function buildRoleFilters(
  roleNames: string[],
  staff: Staff,
  /** Proctor.id — when set, DORMITORY filter is scoped to that proctor's students */
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

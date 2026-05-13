import { ApprovalStatus, Prisma, Staff } from "@prisma/client";

export function buildRoleFilters(
  roleNames: string[],
  staff: Staff
): Prisma.ClearanceApprovalWhereInput[] {
  const filters: Prisma.ClearanceApprovalWhereInput[] = [];

  // Only true office-based roles
  const officeRoles = [
    "LIBRARY",
    "DORMITORY",
    "CAFETERIA",
    "CAMPUS_POLICE",
  ];

  for (const roleName of roleNames) {

    // =========================
    // ADVISOR
    // =========================
    if (roleName === "ADVISOR") {
      filters.push({
        role: {
          name: "ADVISOR",
        },

        status: ApprovalStatus.PENDING,

        clearanceRequest: {
          student: {
            advisorId: staff.id,
          },
        },
      });

      continue;
    }

    // =========================
    // DEPARTMENT HEAD
    // =========================
    if (roleName === "DEPARTMENT_HEAD") {
      if (!staff.departmentId) continue;

      filters.push({
        role: {
          name: "DEPARTMENT_HEAD",
        },

        status: ApprovalStatus.PENDING,

        clearanceRequest: {
          student: {
            departmentId: staff.departmentId,
          },
        },
      });

      continue;
    }

    // =========================
    // SCHOOL DEAN
    // =========================
    if (roleName === "SCHOOL_DEAN") {
      if (!staff.schoolId) continue;

      filters.push({
        role: {
          name: "SCHOOL_DEAN",
        },

        status: ApprovalStatus.PENDING,

        clearanceRequest: {
          student: {
            schoolId: staff.schoolId,
          },
        },
      });

      continue;
    }

    // =========================
    // STUDENT DEAN
    // =========================
    if (roleName === "STUDENT_DEAN") {
      filters.push({
        role: {
          name: "STUDENT_DEAN",
        },

        status: ApprovalStatus.PENDING,
      });

      continue;
    }

    // =========================
    // REGISTRAR
    // =========================
    if (roleName === "REGISTRAR") {
      filters.push({
        role: {
          name: "REGISTRAR",
        },

        status: ApprovalStatus.PENDING,
      });

      continue;
    }

    // =========================
    // OFFICE-BASED ROLES
    // =========================
    if (officeRoles.includes(roleName)) {
      filters.push({
        role: {
          name: roleName,
        },

        status: ApprovalStatus.PENDING,

        office: {
          code: roleName,
        },
      });

      continue;
    }
  }

  return filters;
}
import { RoleType } from "@prisma/client";

export const WORKFLOW: Partial<Record<RoleType, RoleType[]>> = {
  // Sequential chain
  ADVISOR:         [RoleType.DEPARTMENT_HEAD],
  DEPARTMENT_HEAD: [RoleType.SCHOOL_DEAN],
  // After school dean: all four parallel actors activate
  SCHOOL_DEAN: [
    RoleType.CAFETERIA,
    RoleType.CAMPUS_POLICE,
    RoleType.LIBRARY,
    RoleType.DORMITORY,
  ],
  // CAFETERIA + CAMPUS_POLICE both done → STUDENT_DEAN activates
  CAFETERIA:     [RoleType.STUDENT_DEAN],
  CAMPUS_POLICE: [RoleType.STUDENT_DEAN],
  // LIBRARY + DORMITORY + STUDENT_DEAN all done → REGISTRAR activates
  LIBRARY:      [RoleType.REGISTRAR],
  DORMITORY:    [RoleType.REGISTRAR],
  STUDENT_DEAN: [RoleType.REGISTRAR],
  REGISTRAR: [],
};
export function getNextRoles(currentRole: RoleType,): RoleType[] {
  return WORKFLOW[currentRole] ?? [];
}
export const getNextRole = getNextRoles;
export function getFirstRole(): RoleType {
  return RoleType.ADVISOR;
}
export function isWorkflowRole(
  role: RoleType,
): boolean {
  return role in WORKFLOW;
}
export function getRemainingFlow(currentRole: RoleType,): RoleType[] {
  const result: RoleType[] = [];
  function traverse(role: RoleType) {
    const next = WORKFLOW[role] ?? [];
    for (const r of next) {
      if (!result.includes(r)) {
        result.push(r);
        traverse(r);
      }
    }
  }

  traverse(currentRole);
  return result;
}
export function getOfficeCodeByRole(
  role: RoleType,
) {
  switch (role) {
    case RoleType.LIBRARY:
      return "LIBRARY";
    case RoleType.DORMITORY:
      return "DORMITORY";

    case RoleType.CAFETERIA:
      return "CAFETERIA";

    case RoleType.CAMPUS_POLICE:
      return "CAMPUS_POLICE";

    case RoleType.REGISTRAR:
      return "REGISTRAR";

    case RoleType.STUDENT_DEAN:
      return "STUDENT_DEAN";

    default:
      return null;
  }
}

export const getOfficeByRole =
  getOfficeCodeByRole;
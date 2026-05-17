import { RoleType } from "@prisma/client";

export const WORKFLOW: Partial<Record<RoleType, RoleType[]>> = {
  ADVISOR: [RoleType.DEPARTMENT_HEAD],

  DEPARTMENT_HEAD: [RoleType.SCHOOL_DEAN],

  SCHOOL_DEAN: [
    RoleType.LIBRARY,
    RoleType.DORMITORY,
    RoleType.CAFETERIA,
    RoleType.CAMPUS_POLICE,
  ],

  CAFETERIA: [RoleType.STUDENT_DEAN],

  CAMPUS_POLICE: [RoleType.STUDENT_DEAN],

  LIBRARY: [RoleType.REGISTRAR],

  DORMITORY: [RoleType.REGISTRAR],

  STUDENT_DEAN: [RoleType.REGISTRAR],

  REGISTRAR: [],
};

/** Returns the next roles that should be activated after currentRole approves. */
export function getNextRoles(currentRole: RoleType): RoleType[] {
  return WORKFLOW[currentRole] ?? [];
}

export const getNextRole = getNextRoles;

/** Returns the first role in the workflow. */
export function getFirstRole(): RoleType {
  return RoleType.ADVISOR;
}

/** Returns true if the role participates in the clearance workflow. */
export function isWorkflowRole(role: RoleType): boolean {
  return role in WORKFLOW;
}

/** Returns all downstream roles recursively. */
export function getRemainingFlow(currentRole: RoleType): RoleType[] {
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
role: RoleType
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


/** Alias for backward compatibility. */
export const getOfficeByRole = getOfficeCodeByRole;
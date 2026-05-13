export const WORKFLOW: Record<string, string[]> = {
  ADVISOR: ["DEPARTMENT_HEAD"],

  DEPARTMENT_HEAD: ["SCHOOL_DEAN"],

  // school dean starts first office approvals
  SCHOOL_DEAN: [
    "LIBRARY",
    "DORMITORY",
    "CAFETERIA",
    "CAMPUS_POLICE",
  ],

  // after cafeteria + police approved
  CAFETERIA: ["STUDENT_DEAN"],

  CAMPUS_POLICE: ["STUDENT_DEAN"],

  // independent office approvals
  LIBRARY: [],

  DORMITORY: [],

  STUDENT_DEAN: [],

  // final stage
  REGISTRAR: [],
};

export type WorkflowRole =
  keyof typeof WORKFLOW;

export function getNextRole(
  currentRole: string
): string[] {
  return WORKFLOW[currentRole] || [];
}

export function getFirstRole(): string {
  return "ADVISOR";
}

export function getRemainingFlow(
  currentRole: string
): string[] {
  const result: string[] = [];

  function traverse(role: string) {
    const next = WORKFLOW[role] || [];

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

export function getOfficeByRole(
  role: string
) {
  const map: Record<string, string> = {
    LIBRARY: "LIBRARY",
    DORMITORY: "DORMITORY",
    CAFETERIA: "CAFETERIA",
    CAMPUS_POLICE: "CAMPUS_POLICE",
    STUDENT_DEAN: "STUDENT_DEAN",
    REGISTRAR: "REGISTRAR",
  };

  return map[role] ?? null;
}
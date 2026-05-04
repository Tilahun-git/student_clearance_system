

export const WORKFLOW = [
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "FINANCE",
  "LIBRARY",
  "REGISTRAR",
  "DORMITORY",
  "CAFETERIA",
  "STUDENT_DEAN",
  "CAMPUS_POLICE",
] as const;

export type WorkflowRole = (typeof WORKFLOW)[number];

export function getNextRole(currentRole: string): string | null {
  const index = WORKFLOW.indexOf(currentRole as WorkflowRole);

  if (index === -1) return null;

  return WORKFLOW[index + 1] || null;
}


export function getFirstRole(): string {
  return WORKFLOW[0];
}


export function isValidRole(role: string): boolean {
  return WORKFLOW.includes(role as WorkflowRole);
}


export function getRemainingFlow(currentRole: string): string[] {
  const index = WORKFLOW.indexOf(currentRole as WorkflowRole);

  if (index === -1) return [];

  return WORKFLOW.slice(index + 1);
}
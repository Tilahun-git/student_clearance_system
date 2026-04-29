// ==============================
// 🎯 CLEARANCE WORKFLOW CONFIG
// ==============================

export const WORKFLOW = [
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "FINANCE",
  "LIBRARY",
  "REGISTRAR",
] as const;

export type WorkflowRole = (typeof WORKFLOW)[number];


// ==============================
// 🔁 GET NEXT ROLE IN FLOW
// ==============================
export function getNextRole(currentRole: string): string | null {
  const index = WORKFLOW.indexOf(currentRole as WorkflowRole);

  if (index === -1) return null;

  return WORKFLOW[index + 1] || null;
}


// ==============================
// 🧭 GET FIRST STEP (optional helper)
// ==============================
export function getFirstRole(): string {
  return WORKFLOW[0];
}


// ==============================
// 📌 CHECK IF ROLE IS VALID
// ==============================
export function isValidRole(role: string): boolean {
  return WORKFLOW.includes(role as WorkflowRole);
}


// ==============================
// 🔄 GET ALL NEXT POSSIBLE ROLES (optional for UI)
// ==============================
export function getRemainingFlow(currentRole: string): string[] {
  const index = WORKFLOW.indexOf(currentRole as WorkflowRole);

  if (index === -1) return [];

  return WORKFLOW.slice(index + 1);
}

export const Reasons = [
  { id: "r1", name: "Graduation" },
  { id: "r2", name: "Withdrawal" },
  { id: "r3", name: "Transfer" },
  { id: "r4", name: "Temporary Leave" },
  { id: "r5", name: "Academic Dismissal" },
  { id: "r6", name: "End of Academic  Year" },
  { id: "r7", name: "Forced Withdrawal" },
  { id: "r8", name: "Disciplinary Case" },



] as const;

export type Reason = (typeof Reasons)[number];
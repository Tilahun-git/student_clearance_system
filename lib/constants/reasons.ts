
export const Reasons = [
  { id: "r1", name: "Graduation" },
  { id: "r2", name: "Withdrawal" },
  { id: "r3", name: "Transfer" },
  { id: "r4", name: "Temporary Leave" },
  { id: "r5", name: "Academic Dismissal" },
] as const;

export type Reason = (typeof Reasons)[number];
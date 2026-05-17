export interface StudentStatus {
  role: "STUDENT";
  requestStatus: string | null;
  approvedSteps: number;
  totalSteps: number;
  rejections: number;
  clearanceType: string;
}

export interface StaffStatus {
  role: "STAFF";
  pendingCount: number;
  approvedToday: number;
  totalHandled: number;
}

export type StatusData = StudentStatus | StaffStatus | null;

export async function fetchClearanceStatus(): Promise<StatusData> {
  const res = await fetch("/api/clearance/student/status");
  if (!res.ok) return null;
  return res.json();
}

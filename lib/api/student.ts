import { RegisterStudentData } from "@/types/clearance";
import { ApprovalStatus, ClearanceStatus, RoleType } from "@prisma/client";
import { RoleRoute } from "../roles";

export interface ClearanceApprovalRow {
  role: string;
  status: ApprovalStatus;
  comment: string | null;
}

export interface ClearanceProgressData {
  approvals: ClearanceApprovalRow[];
  requestStatus: ClearanceStatus | null;
  canRequest: boolean;
  approvedCount: number;
  totalCount: number;
  rejections: number;
  clearanceType: string;
  previousReason: string | null;
}

export class ApiFetchError extends Error {
  constructor(
    message: string,
    public status: number,
    public details?: unknown,
  ) {
    super(message);
    this.name = "ApiFetchError";
  }
}

async function getErrorResponseMessage(res: Response) {
  try {
    const body = await res.json();
    if (typeof body?.error === "string") return body.error;
    if (typeof body?.message === "string") return body.message;
  } catch {
  }

  return `Request failed with status ${res.status}`;
}

async function ensureOk(res: Response, fallbackMessage: string) {
  if (!res.ok) {
    const message = await getErrorResponseMessage(res);
    throw new ApiFetchError(message || fallbackMessage, res.status);
  }
}

export async function fetchStudentProfile() {
  const res = await fetch("/api/student/me", { cache: "no-store" });
  await ensureOk(res, "Failed to fetch student info");
  return res.json();
}


export async function fetchStudentsBySection(section: string) {
  const res = await fetch(`/api/students/by-section?section=${section}`);
  const data = await res.json();
  if (!res.ok || !data.success) {
    throw new Error(data.error || "Failed to fetch students");
  }
  return data.data;
}

export async function fetchClearanceProgress(): Promise<ClearanceProgressData> {
  const res = await fetch("/api/student/clearance-progress", { cache: "no-store" });
  await ensureOk(res, "Failed to fetch clearance progress");
  return res.json();
}

export async function fetchStudentCertificates() {
  const res = await fetch("/api/student/clearance/certificates", { cache: "no-store" });
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiFetchError(
      typeof data?.error === "string" ? data.error : "Failed to fetch certificates",
      res.status,
      data,
    );
  }
  return res.json();
}

export async function submitClearanceRequest(payload: {
  reason: string;
  academicYear: string;
  semester: string;
}) {
  const res = await fetch("/api/clearance/request", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiFetchError(
      typeof data?.error === "string" ? data.error : "Failed to submit request",
      res.status,
      data,
    );
  }
  return data;
}

export async function registerStudent(form: RegisterStudentData) {
  const res = await fetch("/api/registrar/register-student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json().catch(() => null);
  if (!res.ok) {
    throw new ApiFetchError(
      typeof data?.error === "string" ? data.error : "Failed to register student",
      res.status,
      data,
    );
  }
  return data;
}
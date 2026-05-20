import { RegisterStudentData } from "@/types/clearance";


export async function fetchStudentProfile() {
  const res = await fetch("/api/student/me");
  if (!res.ok) throw new Error("Failed to fetch student info");
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

export async function fetchClearanceProgress() {
  const res = await fetch("/api/student/clearance-progress");
  if (!res.ok) throw new Error("Failed to fetch clearance progress");
  return res.json();
}

export async function fetchStudentCertificates() {
  const res = await fetch("/api/student/clearance/certificates");
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || "Failed to fetch certificates");
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
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to submit request");
  return data;
}

export async function registerStudent(form: RegisterStudentData) {
  const res = await fetch("/api/registrar/register-student", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(form),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to register student");
  return data;
}
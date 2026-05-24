/** Maps office-based roles to their ClearanceStaffOffice code. */
export const ROLE_OFFICE_MAP: Record<string, string> = {
  LIBRARY:      "LIBRARY",
  CAFETERIA:    "CAFETERIA",
  DORMITORY:    "DORMITORY",
  CAMPUS_POLICE:"CAMPUS_POLICE",
  STUDENT_DEAN: "STUDENT_DEAN",
  REGISTRAR:    "REGISTRAR",
};

export async function fetchOffices() {
  const res = await fetch("/api/admin/offices");
  return res.json();
}

export async function createOffice(data: {
  office_name: string;
  code: string;
  managerId?: string;
}) {
  const res = await fetch("/api/admin/offices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const payload = await res.json().catch(() => ({}));

  if (!res.ok) {
    throw new Error(payload?.error || "Failed to create office");
  }

  return payload;
}

export async function updateOffice(
  id: string,
  data: Partial<{ office_name: string; code: string; managerId: string }>,
) {
  const res = await fetch(`/api/admin/offices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  return res.json();
}

export async function deleteOffice(id: string) {
  const res = await fetch(`/api/admin/offices/${id}`, { method: "DELETE" });
  return res.json();
}

export async function loadOffices() {
  const res = await fetch("/api/admin/offices");
  const data = await res.json();
  if (!res.ok) throw new Error(data?.error || "Failed to fetch offices");
  return data;
}

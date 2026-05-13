
export const ROLE_OFFICE_MAP: Record<string, string> = {
  LIBRARY: "LIBRARY",
  CAFETERIA: "CAFETERIA",
  DORMITORY: "DORMITORY",
  CAMPUS_POLICE: "CAMPUS_POLICE",
  FINANCE: "FINANCE",
  STUDENT_DEAN: "STUDENT_DEAN",
  REGISTRAR: "REGISTRAR",
};


export async function fetchOffices() {
  const res = await fetch("/api/admin/offices");
  return res.json();
}

export async function createOffice(data: any) {
  const res = await fetch("/api/admin/offices", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function updateOffice(id: string, data: any) {
  const res = await fetch(`/api/admin/offices/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  return res.json();
}

export async function deleteOffice(id: string) {
  const res = await fetch(`/api/admin/offices/${id}`, {
    method: "DELETE",
  });

  return res.json();
}

export async function loadOffice() {

  const res = await fetch("/api/offices");
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      data?.error ||
        "Failed to fetch offices"
    );
  }
  console.log("fetched offices are ", data)
  return data;
}
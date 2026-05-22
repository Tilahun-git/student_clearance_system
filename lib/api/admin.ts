// fetch Stats for admin stats cards

export async function fetchAdminStats() {
  const res = await fetch("/api/admin/stats");
  if (!res.ok) throw new Error("Failed to fetch stats");
  return res.json();
}

export async function fetchUsers() {
  const res = await fetch("/api/admin/users");
  if (!res.ok) throw new Error("Failed to fetch users");
  const data = await res.json();
  return data.users ?? [];
}

export async function patchUser(
  id: string,
  body: {
    action: "activate" | "deactivate" | "grant_role" | "revoke_role";
    role?: string;
  },
) {
  const res = await fetch(`/api/admin/users/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error("Failed to update user");
  return res.json();
}

export async function deleteUser(id: string) {
  const res = await fetch(`/api/admin/users/${id}`, 
    { method: "DELETE" });
  if (!res.ok) throw new Error("Failed to delet user");
  return res.json();
}

export async function createUser(payload: {
  name: string;
  email: string;
  password: string;
  roles: string[];
  schoolId?: string;
  departmentId?: string;
}) {
  const res = await fetch("/api/admin/create-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create user");
  return data;
}

export async function createStudentUser(payload: {
  studentId: string;
  email: string;
  password: string;
}) {
  const res = await fetch("/api/admin/create-student-user", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(payload),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create student account");
  return data;
}

export async function fetchRoles() {
  const res = await fetch("/api/admin/roles");
  if (!res.ok) throw new Error("Failed to fetch roles");
  return res.json();
}

export async function createRole(name: string) {
  const res = await fetch("/api/admin/roles", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create role");
  return data;
}

export async function fetchSchools() {
  const res = await fetch("/api/school");
  if (!res.ok) throw new Error("Failed to fetch schools");
  return res.json();
}

export async function createSchool(name: string) {
  const res = await fetch("/api/admin/school", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create school");
  return data;
}

export async function assignSchoolDean(schoolId: string, deanId: string) {
  const res = await fetch("/api/admin/school", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ schoolId, deanId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to assign dean");
  return data;
}

export async function deleteSchool(id: string) {
  const res = await fetch("/api/admin/school", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete school");
  return data;
}
export async function deleteOffice(id: string) {
  const res = await fetch(`/api/admin/offices/${id}`, {
    method: "DELETE",
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete office");
  return data;
}

export async function fetchDepartments() {
  const res = await fetch("/api/department");
  if (!res.ok) throw new Error("Failed to fetch departments");
  return res.json();
}

export async function createDepartment(name: string, schoolId: string) {
  const res = await fetch("/api/admin/department", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ name, schoolId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to create department");
  return data;
}

export async function assignDepartmentHead(departmentId: string, headId: string) {
  const res = await fetch("/api/admin/department", {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ departmentId, headId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to assign head");
  return data;
}

export async function deleteDepartment(id: string) {
  const res = await fetch("/api/admin/department", {
    method: "DELETE",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ id }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Failed to delete department");
  return data;
}

export async function fetchStudents() {
  const res = await fetch("/api/students");
  if (!res.ok) throw new Error("Failed to fetch students");
  return res.json();
}

export async function fetchClearanceFormData() {
  const res = await fetch("/api/clearance/data");
  if (!res.ok) throw new Error("Failed to fetch clearance data");
  return res.json();
}

export async function assignOfficeManager(officeId: string, staffId: string) {
  const res = await fetch("/api/admin/offices/assign-manager", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ officeId, staffId }),
  });
  if (!res.ok) throw new Error("Failed to assign manager");
  return res.json();
}

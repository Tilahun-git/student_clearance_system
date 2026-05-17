export interface LibraryBorrow {
  id: string;
  studentId: string;
  student?: { firstName: string; lastName: string; studentId: string };
  returned: boolean;
  borrowedAt: string;
  createdAt: string;
}

export async function fetchBorrows(): Promise<LibraryBorrow[]> {
  const res = await fetch("/api/library/borrows");
  if (!res.ok) return [];
  const data = await res.json();
  return Array.isArray(data) ? data : [];
}

export async function addBorrow(studentId: string): Promise<{ error?: string }> {
  const res = await fetch("/api/library/borrows", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ studentId }),
  });
  return res.json();
}

export async function updateBorrowStatus(
  id: string,
  returned: boolean,
): Promise<{ error?: string }> {
  const res = await fetch(`/api/library/borrows/${id}`, {
    method: "PATCH",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ returned }),
  });
  return res.json();
}

export async function fetchBlockedStudentIds(): Promise<string[]> {
  const res = await fetch("/api/library/borrows/blocked");
  if (!res.ok) return [];
  const data = await res.json();
  return data.blockedIds ?? [];
}

export async function deleteBorrow(id: string): Promise<{ error?: string }> {
  const res = await fetch(`/api/library/borrows/${id}`, { method: "DELETE" });
  return res.json();
}

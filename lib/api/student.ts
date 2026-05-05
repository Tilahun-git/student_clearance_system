export async function fetchStudentProfile() {
  const res = await fetch("/api/student/me");
  console.log("dddddddd is :", res)

  if (!res.ok) throw new Error("Failed to fetch student info");

  return res.json();
}
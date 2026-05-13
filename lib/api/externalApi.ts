export async function fetchStudent(studentId: string) {
  try {
    const res = await fetch(
      `http://localhost:3000/api/students/${studentId}`,
      {
        cache: "no-store", 
      }
    )

    if (!res.ok) throw new Error("API error")

    const data = await res.json()

    return {
      student_id: data.id,
      full_name: data.name,
      email: data.email,
      department: data.department,
      school: data.school,
      faculty: data.faculty,
      advisor: data.advisor,
    }
  } catch (error) {
    return null
  }
}
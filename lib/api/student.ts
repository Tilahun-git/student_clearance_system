import { RegisterStudentData } from "@/types/clearance";


// fetch student PROFILE for each individual

export async function fetchStudentProfile() {
  const res = await fetch("/api/student/me");
  if (!res.ok) {
    throw new Error("Failed to fetch student info" );
  }
  return res.json();
}

//Fetch student by SECTION

export async function fetchStudentsBySection(section: string) {
  const res = await fetch(`/api/students/by-section?section=${section}`);
  const data = await res.json();
  console.log("students by section  are :", data)
  if (!res.ok || !data.success) {
    throw new Error(
      data.error ||
      "Failed to fetch students"
    );
  }
  return data.data;
}

// register student endpoint called here in this function

export async function registerStudent(form:RegisterStudentData){
const response = await fetch("/api/registrar/register-student",{
    method:"POST",
    headers:{"Content-Type":"application/json"},
    body:JSON.stringify(form),
});
const data = await response.json();
if(!response.ok){
  throw new Error(data.error|| "Failed to register student");
}
return data;
}
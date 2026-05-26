// if we had external DB api
// const externalRes = await fetch(
//   "https://external-university.com/api/students"
// );
// const externalStudents = await externalRes.json();

import { studentData } from "../data/studentsData";

const API_URL = process.env.SEED_API_URL ?? "http://localhost:3000/api/students/import";
const studentsData = studentData;
async function run() {
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentsData),
  });
  const data = await res.json();

  for (const r of data.results) {
    const icon  = r.success ? (r.action === "created" ? "[CREATED]" : "[UPDATED]") : "[FAILED] ";
    const email = r.email  ? ` | email: ${r.email}`  : "";
    const err   = r.error  ? ` | error: ${r.error}`  : "";
    console.log(`  ${icon} ${r.studentId}${email}${err}`);
  }
}
run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

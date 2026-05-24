import { studentData } from "../data/studentsData";

const API_URL = process.env.SEED_API_URL ?? "http://localhost:3000/api/students/import";

const studentsData = studentData;

async function run() {
  console.log(`\n Seeding ${studentsData.students.length} students via ${API_URL}\n`);

  const res = await fetch(API_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(studentsData),
  });

  const data = await res.json();

  console.log("Summary:", data.summary);
  console.log("\nResults:");

  for (const r of data.results) {
    const icon  = r.success ? (r.action === "created" ? "[CREATED]" : "[UPDATED]") : "[FAILED] ";
    const email = r.email  ? ` | email: ${r.email}`  : "";
    const err   = r.error  ? ` | error: ${r.error}`  : "";
    console.log(`  ${icon} ${r.studentId}${email}${err}`);
  }

  console.log("\nDone.\n");
}

run().catch((e) => {
  console.error("Seed failed:", e);
  process.exit(1);
});

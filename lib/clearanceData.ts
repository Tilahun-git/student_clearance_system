// /lib/clearanceData.ts

export const faculties = [
  { id: "f1", name: "Faculty of Engineering" },
  { id: "f2", name: "Faculty of Business" },
  { id: "f3", name: "Faculty of Health Sciences" },
  { id: "f4", name: "Faculty of Arts & Humanities" },
];

export const schools = [
  { id: "s1", name: "School of Computing", facultyId: "f1" },
  { id: "s2", name: "School of Engineering", facultyId: "f1" },
  { id: "s3", name: "School of Business", facultyId: "f2" },
  { id: "s4", name: "School of Health Sciences", facultyId: "f3" },
  { id: "s5", name: "School of Arts & Humanities", facultyId: "f4" },
];

export const departments = [
  { id: "d1", name: "Software Engineering", schoolId: "s1" },
  { id: "d2", name: "Computer Science", schoolId: "s1" },
  { id: "d3", name: "Mechanical Engineering", schoolId: "s2" },
  { id: "d4", name: "Civil Engineering", schoolId: "s2" },
  { id: "d5", name: "Accounting", schoolId: "s3" },
  { id: "d6", name: "Finance", schoolId: "s3" },
  { id: "d7", name: "Nursing", schoolId: "s4" },
  { id: "d8", name: "Pharmacy", schoolId: "s4" },
  { id: "d9", name: "History", schoolId: "s5" },
  { id: "d10", name: "Literature", schoolId: "s5" },
];

export const reasons = [
  { id: "r1", name: "Graduation" },
  { id: "r2", name: "Withdrawal" },
  { id: "r3", name: "Transfer" },
  { id: "r4", name: "Temporary Leave" },
  { id: "r5", name: "Academic Dismissal" },
];
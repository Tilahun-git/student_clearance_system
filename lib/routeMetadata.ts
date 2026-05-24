import type { Metadata } from "next";

export const appName = "Student Clearance System";

export const roleMetadataMap: Record<string, Metadata> = {
  admin: {
    title: "Admin",
    description: "Admin dashboard for the Student Clearance System",
  },
  student: {
    title: "Student",
    description: "Student dashboard for the Student Clearance System",
  },
  "student-dean": {
    title: "Student Dean",
    description: "Student Dean dashboard for the Student Clearance System",
  },
  "school-dean": {
    title: "School Dean",
    description: "School Dean dashboard for the Student Clearance System",
  },
  "department-head": {
    title: "Department Head",
    description: "Department Head dashboard for the Student Clearance System",
  },
  registrar: {
    title: "Registrar",
    description: "Registrar dashboard for the Student Clearance System",
  },
  library: {
    title: "Library",
    description: "Library dashboard for the Student Clearance System",
  },
  cafeteria: {
    title: "Cafeteria",
    description: "Cafeteria dashboard for the Student Clearance System",
  },
  dormitory: {
    title: "Dormitory",
    description: "Dormitory dashboard for the Student Clearance System",
  },
  "campus-police": {
    title: "Campus Police",
    description: "Campus Police dashboard for the Student Clearance System",
  },
  advisor: {
    title: "Advisor",
    description: "Advisor dashboard for the Student Clearance System",
  },
};

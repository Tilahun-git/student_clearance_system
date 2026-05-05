export const routes = [
  {
    prefix: "/student-dean",
    role: "STUDENT_DEAN",
    redirect: "/student-dean/dashboard",
  },
  {
    prefix: "/faculty-dean",
    role: "SCHOOL_DEAN",
    redirect: "/faculty-dean/dashboard",
  },
  {
    prefix: "/department-head",
    role: "DEPARTMENT_HEAD",
    redirect: "/department-head/dashboard",
  },
  {
    prefix: "/advisor",
    role: "ADVISOR",
    redirect: "/advisor/dashboard",
  },
  {
    prefix: "/student",
    role: "STUDENT",
    redirect: "/student/dashboard",
  },
  {
    prefix: "/admin",
    role: "ADMIN",
    redirect: "/admin/dashboard",
  },
  {
    prefix: "/registrar",
    role: "REGISTRAR",
    redirect: "/registrar/dashboard",
  },
  {
    prefix: "/library",
    role: "LIBRARY",
    redirect: "/library/dashboard",
  },
] as const;

export const ROLE_TYPES = routes.map((r) => r.role);

export type RoleTypeFrontend = (typeof ROLE_TYPES)[number];

export type RoleType = (typeof routes)[number]["role"];
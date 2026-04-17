/* ================= FACULTY ================= */
export type Faculty = {
  id: string;
  name: string;

  schools?: School[];
};


/* ================= SCHOOL ================= */
export type School = {
  id: string;
  name: string;
  facultyId: string;

  faculty?: Faculty;

  deanId?: string;
  dean?: Staff;

  departments?: Department[];
};


/* ================= DEPARTMENT ================= */
export type Department = {
  id: string;
  name: string;
  schoolId: string;

  school?: School;

  headId?: string;
  head?: Staff;
};


/* ================= STAFF ================= */
export type Staff = {
  id: string;
  userId: string;

  user?: User;

  facultyId?: string;
  schoolId?: string;
  departmentId?: string;
};


/* ================= USER ================= */
export type User = {
  id: string;
  name: string;
  email: string;

  roles?: {
    role: {
      name: string;
    };
  }[];
};


/* ================= STUDENT ================= */
export type Student = {
  id: string;
  studentId: string;

  firstName: string;
  middleName?: string;
  lastName: string;

  program: string;
  year: number;

  userId?: string;
  advisorId?: string;

  user?: User;
  advisor?: Staff;

  departmentId: string;
  schoolId?: string;
  facultyId?: string;

  department?: Department;
  school?: School;
  faculty?: Faculty;
};


/* ================= CLEARANCE REQUEST ================= */
export type ClearanceRequest = {
  id: string;
  studentId: string;

  reason: string;
  academicYear?: string;
  semester?: string;

  status: "PENDING" | "IN_PROGRESS" | "APPROVED" | "REJECTED";
  currentStep:
    | "ADVISOR"
    | "DEPARTMENT_HEAD"
    | "FINANCE"
    | "LIBRARY"
    | "REGISTRAR"
    | "SCHOOL_DEAN"
    | "ADMIN";

  student?: Student;
};


/* ================= RESPONSE TYPE ================= */
export type ClearanceDataResponse = {
  faculties: Faculty[];
  schools: School[];
  departments: Department[];
};
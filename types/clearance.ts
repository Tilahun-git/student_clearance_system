export type Faculty = {
  id: string;
  name: string;

  schools?: School[];
};


export type School = {
  id: string;
  name: string;
  facultyId: string;

  faculty?: Faculty;

  deanId?: string;
  dean?: Staff;

  departments?: Department[];
};


export type Department = {
  id: string;
  name: string;
  schoolId: string;

  school?: School;

  headId?: string;
  head?: Staff;
};


export type Staff = {
  id: string;
  userId: string;

  user?: User;

  facultyId?: string;
  schoolId?: string;
  departmentId?: string;
};


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


export type ClearanceDataResponse = {
  faculties: Faculty[];
  schools: School[];
  departments: Department[];
};
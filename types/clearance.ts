import { Reason } from "@/lib/constants/reasons";
import { ApprovalStatus } from "@prisma/client";


export interface ClearanceApprovalRequest {
  id: string;
  status: string;
  comment?: string;
  role: {
    id: string;
    name: string;
  };
  officeId?: string;
  office?: {
    id: string;
    office_name: string;
    code: string;
  };
  clearanceRequest: {
    id: string;
    status: string;
    createdAt: string;
    student: {
      id: string;
      firstName: string;
      middleName:string;
      lastName: string;
      studentId: string;
    };
  };
}


export interface ApprovalPayload {
  approvalId: string;
  status: ApprovalStatus;
  comment?: string;
}

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


 export type RegisterStudentData = {
  firstName: string;
  middleName: string;
  lastName: string;
  program: string;
  year: number;
  facultyId: string;
  schoolId: string;
  departmentId: string;
};
export type ClearanceDataResponse = {
  faculties: Faculty[];
  schools: School[];
  departments: Department[];
};

export type Notification = {
   userId: string;
  message: string;
  referenceId?: string;
}


export interface Certificate {
  id: string;
  issuedAt: string;

  request?: {
    academicYear?: string;
    semester?: string;
    reason:{
      name:string
    };
    status?: string;

    student?: {
      firstName: string;
      lastName: string;
      studentId: string;
      program?: string;
      year?: number;
      section?: string;

      faculty?: { name: string };
      school?: { name: string };
      department?: { name: string };
    };
  };
}
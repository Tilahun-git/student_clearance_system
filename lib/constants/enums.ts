
import { ApprovalStatus, ClearanceStatus } from "@prisma/client";
export { ApprovalStatus, ClearanceStatus };
export const ApprovalStatusEnum = {
  PENDING: "PENDING" as ApprovalStatus,
  APPROVED: "APPROVED" as ApprovalStatus,
  REJECTED: "REJECTED" as ApprovalStatus,
} as const;
export type ApprovalStatusType = ApprovalStatus;
export const WORKFLOW_ROLES = [
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "LIBRARY",
  "DORMITORY",
  "CAFETERIA",
  "CAMPUS_POLICE",
  "STUDENT_DEAN",
  "REGISTRAR",
] as const;
export const OFFICE_ROLES = [
  "LIBRARY",
  "DORMITORY",
  "CAFETERIA",
  "CAMPUS_POLICE",
] as const;
export const ALL_ROLE_NAMES = [
  "STUDENT",
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "LIBRARY",
  "REGISTRAR",
  "ADMIN",
  "CAFETERIA",
  "DORMITORY",
  "STUDENT_DEAN",
  "CAMPUS_POLICE",
] as const;

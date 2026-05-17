// ─────────────────────────────────────────────────────────────────────────────
// Do NOT use @prisma/client RoleType enum values at module level here.
// Use plain string literals for safety across all Next.js compilation contexts.
// ─────────────────────────────────────────────────────────────────────────────
import { ApprovalStatus, ClearanceStatus } from "@prisma/client";

export { ApprovalStatus, ClearanceStatus };

export const ApprovalStatusEnum = {
  PENDING: "PENDING" as ApprovalStatus,
  APPROVED: "APPROVED" as ApprovalStatus,
  REJECTED: "REJECTED" as ApprovalStatus,
} as const;

export type ApprovalStatusType = ApprovalStatus;

// All workflow roles in order — plain strings, no Prisma enum
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

// Office-based roles
export const OFFICE_ROLES = [
  "LIBRARY",
  "DORMITORY",
  "CAFETERIA",
  "CAMPUS_POLICE",
] as const;

// All valid role name strings
export const ALL_ROLE_NAMES = [
  "STUDENT",
  "ADVISOR",
  "DEPARTMENT_HEAD",
  "SCHOOL_DEAN",
  "FINANCE",
  "LIBRARY",
  "REGISTRAR",
  "ADMIN",
  "CAFETERIA",
  "DORMITORY",
  "STUDENT_DEAN",
  "CAMPUS_POLICE",
] as const;

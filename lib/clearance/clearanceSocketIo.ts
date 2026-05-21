import { RoleType } from "@prisma/client";
import { getIO } from "@/lib/socket-server";

export const CLEARANCE_SOCKET_EVENT = "clearance:updated" as const;
export const CLEARANCE_WORKFLOW_ROLES: RoleType[] = [
  RoleType.ADVISOR,
  RoleType.DEPARTMENT_HEAD,
  RoleType.SCHOOL_DEAN,
  RoleType.LIBRARY,
  RoleType.CAFETERIA,
  RoleType.CAMPUS_POLICE,
  RoleType.DORMITORY,
  RoleType.STUDENT_DEAN,
  RoleType.REGISTRAR,
];

export type ClearanceRealtimeAction =
  | "created"
  | "resubmitted"
  | "approved"
  | "rejected"
  | "completed";

export type ClearanceRealtimePayload = {
  requestId: string;
  action: ClearanceRealtimeAction;
  actorRole?: RoleType;
  triggeredByUserId?: string;
  at: number;
};

export function roleRoom(role: string) {
  return `role:${role}`;
}

export function emitClearanceRealtime(
  payload: Omit<ClearanceRealtimePayload, "at">,
  options: {
    studentUserId?: string | null;
    roles?: RoleType[];
    triggeredByUserId?: string | null;
  } = {},
) {
  try {
    const io = getIO();
    const event: ClearanceRealtimePayload = {
      ...payload,
      triggeredByUserId: payload.triggeredByUserId ?? options.triggeredByUserId ?? undefined,
      at: Date.now(),
    };
    const roles = options.roles ?? CLEARANCE_WORKFLOW_ROLES;

    if (options.studentUserId) {
      io.to(options.studentUserId).emit(CLEARANCE_SOCKET_EVENT, event);
    }

    for (const role of roles) {
      io.to(roleRoom(role)).emit(CLEARANCE_SOCKET_EVENT, event);
    }
  } catch {
  }
}

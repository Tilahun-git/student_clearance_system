// import { authOptions } from "@/app/api/auth/[...nextauth]/route";
// import { prisma } from "@/lib/prisma";
// import { getServerSession } from "next-auth";

// export async function GET() {
//   try {
//     const session = await getServerSession(authOptions);

//     const userId = session?.user?.id;

//     if (!userId) {
//       return Response.json(
//         { error: "Unauthorized denied" },
//         { status: 401 }
//       );
//     }

//     const advisor = await prisma.staff.findUnique({
//       where: { userId },
//     });

//     if (!advisor) {
//       return Response.json(
//         { error: "Denied this is only for advisors!" },
//         { status: 403 }
//       );
//     }

//     const requests = await prisma.clearanceRequest.findMany({
//       where: {
//         currentStep: "ADVISOR",
//         student: {
//           advisorId: advisor.id,
//         },
//       },
//       include: {
//         student: {
//           include: {
//             user: true,
//           },
//         },
//       },
//       orderBy: {
//         createdAt: "desc",
//       },
//     });

//     const flattenRequests = requests.map((req) => ({
//       id: req.id,
//       status: "PENDING", 
//       comment: null,

//       clearanceRequest: {
//         id: req.id,
//         reason: req.reason,
//         academicYear: req.academicYear,
//         semester: req.semester,
//         createdAt: req.createdAt,

//         student: req.student,
//       },
//     }));

//     return Response.json(flattenRequests);
//   } catch (error: any) {
//     console.error("BACKEND ERROR:", error);

//     return Response.json(
//       {
//         error: error.message || "Failed to fetch advisor requests",
//       },
//       { status: 500 }
//     );
//   }
// }

import { authOptions } from "@/app/api/auth/[...nextauth]/route";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { NextResponse } from "next/server";
import {
  RoleType,
  ApprovalStatus,
  ClearanceStatus,
} from "@prisma/client";


export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const advisor = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!advisor) {
      return NextResponse.json(
        { error: "Only advisors allowed" },
        { status: 403 }
      );
    }

   const approvals = await prisma.clearanceApproval.findMany({
  where: {
    role: { name: RoleType.ADVISOR },
    status: ApprovalStatus.PENDING,
    clearanceRequest: {
      currentStep: RoleType.ADVISOR,
      student: {
        advisorId: advisor.id,
      },
    },
  },
  include: {
    clearanceRequest: {
      include: {
        student: {
          include: { user: true },
        },
      },
    },
  },
  orderBy: {
    clearanceRequest: {
      createdAt: "desc", 
    },
  },
});

    const formatted = approvals.map((a) => ({
      id: a.id,
      status: a.status,
      comment: a.comment,

      clearanceRequest: {
        id: a.clearanceRequest.id,
        reason: a.clearanceRequest.reason,
        academicYear: a.clearanceRequest.academicYear,
        semester: a.clearanceRequest.semester,
        createdAt: a.clearanceRequest.createdAt,

        student: a.clearanceRequest.student,
      },
    }));

    return NextResponse.json(formatted);
  } catch (error: any) {
    return NextResponse.json(
      { error: error.message || "Failed to fetch requests" },
      { status: 500 }
    );
  }
}


export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const staff = await prisma.staff.findUnique({
      where: { userId: session.user.id },
    });

    if (!staff) {
      return NextResponse.json({ error: "Staff not found" }, { status: 403 });
    }

    const { approvalId, status, comment } = await req.json();

    const approval = await prisma.clearanceApproval.findUnique({
      where: { id: approvalId },
      include: {
        role: true,
        clearanceRequest: true,
      },
    });

    if (!approval) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    await prisma.clearanceApproval.update({
      where: { id: approvalId },
      data: {
        status,
        comment,
        staffId: staff.id,
        approvedAt: status === "APPROVED" ? new Date() : null,
      },
    });

    const request = approval.clearanceRequest;

    if (status === "REJECTED") {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          status: ClearanceStatus.REJECTED,
        },
      });

      return NextResponse.json({ message: "Rejected" });
    }

    // ================= WORKFLOW =================

    let nextStep: RoleType | null = null;

    if (approval.role.name === RoleType.ADVISOR) {
      nextStep = RoleType.DEPARTMENT_HEAD;
    } else if (approval.role.name === RoleType.DEPARTMENT_HEAD) {
      nextStep = RoleType.SCHOOL_DEAN;
    } else if (approval.role.name === RoleType.SCHOOL_DEAN) {
      nextStep = RoleType.LIBRARY;
    } else if (
      approval.role.name === RoleType.LIBRARY ||
      approval.role.name === RoleType.FINANCE
    ) {
      // parallel handling
      const approvals = await prisma.clearanceApproval.findMany({
        where: {
          clearanceRequestId: request.id,
          role: {
            name: { in: [RoleType.LIBRARY, RoleType.FINANCE] },
          },
        },
      });

      const allApproved = approvals.every(
        (a) => a.status === ApprovalStatus.APPROVED
      );

      if (allApproved) {
        nextStep = RoleType.REGISTRAR;
      }
    } else if (approval.role.name === RoleType.REGISTRAR) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: { status: ClearanceStatus.APPROVED },
      });

      return NextResponse.json({ message: "Completed" });
    }

    if (nextStep) {
      await prisma.clearanceRequest.update({
        where: { id: request.id },
        data: {
          currentStep: nextStep,
          status: ClearanceStatus.IN_PROGRESS,
        },
      });
    }

    return NextResponse.json({ message: "Updated" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Server error" }, { status: 500 });
  }
}
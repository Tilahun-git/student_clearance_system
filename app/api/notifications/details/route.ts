import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { ApprovalStatus } from "@prisma/client";

export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const notificationId = searchParams.get("id");

    if (!notificationId) {
      return NextResponse.json({ error: "Missing ID" }, { status: 400 });
    }

    const notification = await prisma.notification.findFirst({
      where: {
        id: notificationId,
        userId: session.user.id,
      },
    });

    if (!notification) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }

    let extraData = null;

    if (notification.referenceId) {
      const request = await prisma.clearanceRequest.findUnique({
        where: { id: notification.referenceId },
        include: {
          approvals: {
            where: {
              status: ApprovalStatus.REJECTED,
            },
            include: {
              role: true,
              staff: true,
            },
          },
          student: true,
        },
      });

      extraData = request;
    }

    return NextResponse.json({
      notification,
      extraData,
    });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed" }, { status: 500 });
  }
}
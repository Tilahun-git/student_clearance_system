import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";

export async function PATCH(req: Request) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId     = session.user.id;
    const activeRole = session.user.activeRole;

    // Scope all mark-read operations to the current active role only.
    // This prevents marking DEPT_HEAD notifications as read when the user
    // is acting as ADVISOR, and vice versa.
    // Notifications with no forRole (null) are always included.
    const roleFilter = activeRole
      ? { OR: [{ forRole: activeRole }, { forRole: null }] }
      : {};

    const { notificationId, markAll } = await req.json();

    if (markAll) {
      await prisma.notification.updateMany({
        where: {
          userId,
          read: false,
          ...roleFilter,
        },
        data: { read: true },
      });

      return NextResponse.json({ message: "All notifications marked as read" });
    }

    if (!notificationId) {
      return NextResponse.json({ error: "Notification ID required" }, { status: 400 });
    }

    const updated = await prisma.notification.updateMany({
      where: {
        id: notificationId,
        userId,
        ...roleFilter,
      },
      data: { read: true },
    });

    if (updated.count === 0) {
      return NextResponse.json({ error: "Notification not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Notification marked as read" });
  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: "Failed to update notification" }, { status: 500 });
  }
}

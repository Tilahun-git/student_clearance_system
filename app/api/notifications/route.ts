import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";
import { authOptions } from "../auth/[...nextauth]/route";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ notifications: [], unreadCount: 0 }, { status: 401 });
    }

    const userId     = session.user.id;
    const activeRole = session.user.activeRole;

    // Filter notifications by activeRole when set, so a user with multiple
    // roles only sees notifications relevant to their current active role.
    // Notifications with no forRole (legacy or student notifications) are
    // always shown.
    const roleFilter = activeRole
      ? { OR: [{ forRole: activeRole }, { forRole: null }] }
      : {};

    const notifications = await prisma.notification.findMany({
      where: { userId, ...roleFilter },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    const unreadCount = await prisma.notification.count({
      where: { userId, read: false, ...roleFilter },
    });

    return NextResponse.json({ notifications, unreadCount });
  } catch (error) {
    console.error("fetch notification error:", error);
    return NextResponse.json({ error: "Failed to fetch notifications" }, { status: 500 });
  }
}

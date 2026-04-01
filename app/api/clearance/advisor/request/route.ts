import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth";

export async function GET() {
  try {
    // 1. Get logged-in advisor user
    const session = await getServerSession();

    const userId = session?.user?.id;

    if (!userId) {
      return Response.json({ error: "Unauthorized" }, { status: 401 });
    }

    // 2. Get advisor profile
    const advisor = await prisma.staff.findUnique({
      where: { userId },
    });

    if (!advisor) {
      return Response.json({ error: "Not an advisor" }, { status: 403 });
    }

    // 3. Fetch ONLY students assigned to this advisor
    const requests = await prisma.clearanceRequest.findMany({
      where: {
        currentStep: "ADVISOR", // only advisor stage
        student: {
          advisorId: advisor.id, // 🔥 KEY FILTER
        },
      },
      include: {
        student: {
          include: {
            user: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json(requests);
  } catch (error) {
    return Response.json(
      { error: "Failed to fetch advisor requests" },
      { status: 500 }
    );
  }
}
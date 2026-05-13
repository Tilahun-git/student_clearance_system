import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function POST(req: Request) {
  const { officeId, staffId } = await req.json()

  const office = await prisma.clearanceStaffOffice.findUnique({
    where: { id: officeId },
  })

  const staff = await prisma.staff.findUnique({
    where: { id: staffId },
    include: {
      user: {
        include: {
          roles: {
            include: {
              role: true,
            },
          },
        },
      },
    },
  })

  if (!office || !staff) {
    return NextResponse.json({ error: "Not found" }, { status: 404 })
  }

  const userRoles = staff.user.roles.map(r => r.role.name)

  if (!userRoles.includes(office.code.toUpperCase())) {
    return NextResponse.json(
      { error: "User does not have required role for this office" },
      { status: 400 }
    )
  }

  const updated = await prisma.clearanceStaffOffice.update({
    where: { id: officeId },
    data: {
      managerId: staffId,
    },
  })

  return NextResponse.json(updated)
}
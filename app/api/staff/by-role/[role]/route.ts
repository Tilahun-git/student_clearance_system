import { prisma } from "@/lib/prisma"
import { NextResponse } from "next/server"

export async function GET(
  req: Request,
  context: { params: Promise<{ role: string }> }
) {
  const { role } = await context.params

  const staff = await prisma.staff.findMany({
    include: {
      user: {
        include: {
          roles: {
            include: { role: true },
          },
        },
      },
    },
  })

  const filtered = staff.filter(s =>
    s.user.roles.some(r => r.role.name === role.toUpperCase())
  )

  return NextResponse.json(filtered)
}
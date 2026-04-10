import { bootstrapAdmin } from "@/lib/bootstrapAdmin";

export async function GET() {
  await bootstrapAdmin();

  return Response.json({
    status: "ok",
    message: "System initialized",
  });
}
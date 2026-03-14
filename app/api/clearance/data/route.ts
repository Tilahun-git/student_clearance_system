import { NextResponse } from "next/server";
import { schools, departments, reasons } from "@/lib/clearanceData";

export async function GET() {

  return NextResponse.json({
    schools,
    departments,
    reasons,
  });

}
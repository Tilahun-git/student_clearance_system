import { NextResponse } from "next/server";

export const GET = async () => {
  const status = {
    currentStatus: "Pending",
    departmentsApproved: 6,
    totalDepartments: 11,
    rejections: 3,
    clearanceType: "Graduation",
  };

  return NextResponse.json(status);
};
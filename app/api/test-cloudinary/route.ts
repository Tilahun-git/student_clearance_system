// app/api/test-cloudinary/route.ts

import { NextResponse } from "next/server";
import cloudinary from "@/lib/cloudinary";

export async function GET() {
  try {

    const result =
      await cloudinary.api.ping();

    console.log(result);

    return NextResponse.json(result);

  } catch (error) {

    console.error(error);

    return NextResponse.json(
      { error },
      { status: 500 }
    );
  }
}
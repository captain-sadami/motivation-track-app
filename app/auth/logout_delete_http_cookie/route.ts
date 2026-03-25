import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  const cookieStore = await cookies();

  // kill cookies
  cookieStore.set("access_token", "", {maxAge: 0, path: "/"});
  cookieStore.set("id_token", "", {maxAge: 0, path: "/"});

  return NextResponse.json({success: true});
}
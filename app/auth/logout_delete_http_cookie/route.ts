import { NextResponse } from "next/server";


export async function POST() {
  const response = NextResponse.json({success: true});

  // kill cookies
  response.cookies.set("access_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  });

  response.cookies.set("id_token", "", {
    path: "/",
    maxAge: 0,
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
  })

  return response;
}
import { NextResponse } from "next/server";


export async function GET(req: Request) {
  const origin = process.env.NEXT_PUBLIC_APP_BASE_URL;
  const response = NextResponse.redirect(`${origin}/login`);

  

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
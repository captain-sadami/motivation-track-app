import { NextRequest, NextResponse } from "next/server"


// The case where the default function use argument as (req: NextRequest) is when the traffic transiting
// such as middleware, routes..
// NextRequest or Next Response is for server side, when "use client", it is not needed.
export async function middleware(req: NextRequest) {
  const path = req.nextUrl.pathname
  
  const token = req.cookies.get("access_token")?.value
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN
  const client_id = process.env.NEXT_PUBLIC_IDCS_CLIENT_ID
  const client_secret = process.env.IDCS_CLIENT_SECRET

  const resp = await fetch(`${domain}/oauth2/v1/introspect`, {
    method: "POST",
    headers: {
      "Authorization": "Basic " + Buffer.from(`${client_id}:${client_secret}`).toString("base64"),
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      token,
      token_type_hint: "access_token",
    }),
  })

  const data = await resp.json()
  
  if (!data.active) {
    return NextResponse.redirect(new URL("/login", req.url))
  }

  return NextResponse.next()
}


export const config = {
  // white list
  //matcher: [      
  //  "/home/:path*",
  //  "/profile/:path*"
  //],

  // turned it into black list: 3/14/2026
  matcher: [
    "/((?!login|auth/callback|api/ws|_next|favicon.ico|api/dailySummaryBatch).*)",
  ]
};
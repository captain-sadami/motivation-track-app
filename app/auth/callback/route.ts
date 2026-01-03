import { NextRequest, NextResponse } from "next/server"


// NextRequest or Next Response is for server side, when "use client", it is not needed.
// The case where the default function use argument as (req: NextRequest) is when the traffic transiting
// such as middleware, routes..
export async function GET(req: NextRequest) {
  // Identity Domains callback with code in a URL query.
  const code = req.nextUrl.searchParams.get("code")

  if (!code) {
    return NextResponse.json({ error: "No code found" }, { status: 400 })
  }

  // Note: The clientSecret should never never be shown from a browser.
  const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;
  const clientID = process.env.NEXT_PUBLIC_IDCS_CLIENT_ID!;
  const clientSecret = process.env.IDCS_CLIENT_SECRET!;
  
  const tokenUrl = `${domain}/oauth2/v1/token`

  // exchanging token part;
  // this process is between only the server and IdP (Identity Domains).
  // the subject is the server; the server access to the tokenURL (Identity Domains) and get a token.
  // Point: fetch makes the subject "the server"; redirect makes the subject "the browser".
  const resp = await fetch(tokenUrl, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      redirect_uri: process.env.OIDC_REDIRECT_URI!,
      client_id: clientID,
      client_secret: clientSecret,
    }),
  })

  const data = await resp.json()
  //console.log("TOKEN RESPONSE:", data)

  if (!data.access_token) {
    return NextResponse.json({ error: "Failed to fetch token", data }, { status: 500 })
  }

  // make a cookie with a token（HTTP-only）
  // NextResponse object can make browser redirect after return.
  // NexResponse.redirect() returns HTTP 302 response + Location header.
  // Point: fetch makes the subject "the server"; redirect makes the subject "the browser".
  //const res = NextResponse.redirect("http://localhost:3000/home")
  const baseUrl = process.env.APP_BASE_URL!;
  const res = NextResponse.redirect(
    `${baseUrl}/home`
  );

  // NextResponse.redirect makes HTTP response itself
  // after returned in the last row in this script, browser get it and obey the 302 instruction.

  res.cookies.set("access_token", data.access_token, {
    httpOnly: true,
    secure: false, // TODO: true for production
    //sameSite: "strict", // added 12/1
    sameSite: "lax", //added 1/2
    path: "/",
    maxAge: 60 * 60,
  })

  res.cookies.set("id_token", data.id_token, {
    httpOnly: true,
    secure: false,
    path: "/",
    maxAge: 60 * 60,
  })

  console.log("=== CALLBACK DEBUG ===")
  console.log("code:", code)
  console.log("OIDC_REDIRECT_URI:", process.env.OIDC_REDIRECT_URI)
  console.log("IDCS_DOMAIN:", process.env.NEXT_PUBLIC_IDCS_DOMAIN)
  console.log("CLIENT_ID:", process.env.NEXT_PUBLIC_IDCS_CLIENT_ID)
  console.log("CLIENT_SECRET exists:", !!process.env.IDCS_CLIENT_SECRET)
  console.log("tokenUrl:", tokenUrl)



  // the subject is the server: the server returns res (NextResponse object).
  // the object (destination) is the browser: the server get 302 redirect response and obay that instruction.
  return res
}

export const dynamic = "force-dynamic";


import { cookies } from "next/headers"
import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import { createSupabaseServer } from "@/lib/supabaseServer"


export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const impulseType = searchParams.get("type");

  // cookies is exptracted from request from brower..
  const cookie = await cookies()
  const token = cookie.get("access_token")?.value;
  const idToken = cookie.get("id_token")?.value;
  // HTTP API (routes.tx) cannot return JSX like; if (!idToken || !token) { return <div>No token found</div> }
  if (!idToken || !token) {
    return NextResponse.json(
      { error: "No token found" },
      { status: 401 }
    );
  }

  // try to get user info with access token.
  const resp = await fetch(process.env.IDCS_USERINFO_ENDPOINT!, {
      headers: {
          Authorization: `Bearer ${token}`,
      }
  })

  // jwt.decode returns several types. so as any is needed to ignore object type.
  // "as any" overrides object type. i.g. const x = 1 as string
  const decoded = jwt.decode(idToken) as any;
  // GUID is the unique ID for identifying the user in Identity domains.
  const guid = decoded.user_id ?? decoded.idcs_user_id;

  // start to fetch datas
  const supabase = createSupabaseServer();
  const { data: userRow, error: user_fetch_err } = await supabase
    .from("users")
    .select("id")
    .eq("identity_id", guid)
    .single()
  if (user_fetch_err){
    return NextResponse.json(
      { error: "No app user found in DB" },
      { status: 500 }
    )
  }

  const appUserId = userRow?.id;
  const { data: impulses, error: impulse_fetch_err } = await supabase
    .from("impulses")
    //.select("id, image_url, title, is_needed")
    .select("id, file_name, title")
    .eq("user_id", appUserId)
    .eq("impulse_type", impulseType)
    .eq("is_needed", true)

  if (impulse_fetch_err || !impulses) {
    return NextResponse.json({ error: "Not found"},{ status:404 })
  }

  if (impulses.length===0) {
    return NextResponse.json(
      { error: "No impulses available" },
      { status: 404 }
    );
  }

  const randomedImpulse = impulses[Math.floor(Math.random() * impulses.length)];
  const objectUrl = 
    `${process.env.OCI_PAR}`
    + `${appUserId}/${impulseType}/${randomedImpulse.file_name}`
    + `?v=${Date.now()}`;

  // route.ts work as proxy for accessing objectUrl otherwise client can know 
  // credentials such as PAR and appUserId.
  const imageResp = await fetch(objectUrl, {cache: "no-store",});
  if (!imageResp.ok) {
    return NextResponse.json({ error: "Image fetch failed" }, { status: 500 });
  }
  return new Response(imageResp.body, {
    headers: {
      "Content-Type": imageResp.headers.get("Content-Type") ?? "image/jpeg",
      "Cache-Control": "private, max-age=3600",
      "X-Image-Title": encodeURIComponent(`${randomedImpulse.title}`)
    },
  });  
}
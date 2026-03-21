export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer"
import { getAppUser } from "@/lib/getAppUser";


export async function GET(req: Request){
  const { searchParams } = new URL(req.url);
  const impulseType = searchParams.get("type");

  const user = await getAppUser();
  if (!user){
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { guid, appUserId } = user;

  // start to fetch datas
  const supabase = createSupabaseServer();
  const { data: impulses, error: impulse_fetch_err } = await supabase
    .from("impulses")
    //.select("id, image_url, title, is_needed")
    .select("id, file_name, title")
    .eq("user_id", appUserId)
    .eq("impulse_type", impulseType)
    .eq("is_needed", true)

  if (impulse_fetch_err || !impulses || impulses.length===0) {
    return NextResponse.json({ error: "Not found"},{ status:404 })
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
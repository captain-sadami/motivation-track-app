import { cookies } from "next/headers"
import jwt from "jsonwebtoken";
import HomeClient from "./HomeClient";
import { createSupabaseServer } from "@/lib/supabaseServer"


export default async function HomePage() {
  // cookies is exptracted from request from brower..
  const cookie = await cookies()
  const token = cookie.get("access_token")?.value;
  const idToken = cookie.get("id_token")?.value;

  if (!idToken || !token) { return <div>No token found</div> }

  // try to get user info with access token.
  const resp = await fetch("https://idcs-a4da4a7d6f404a72a8da656a8c418d4c.identity.oraclecloud.com/oauth2/v1/userinfo", {
      headers: {
          Authorization: `Bearer ${token}`,
      }
  })

  // resp is Response object, so convert to json format.
  const user = await resp.json()
  const username = user.name ?? "No username found"

  // jwt.decode returns several types. so as any is needed to ignore object type.
  // "as any" overrides object type. i.g. const x = 1 as string
  const decoded = jwt.decode(idToken) as any;
  // ★ GUID
  // GUID is the unique ID for identifying the user in Identity domains.
  const guid = decoded.user_id ?? decoded.idcs_user_id;

  // Download tasks from DB, which should be alloed only to the server never user.
  const supabase = createSupabaseServer();

  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("identity_id", guid)
    .single()
  
  const appUserId = userRow?.id;
  console.log(`appUserId: ${appUserId}`)

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("owner_id", appUserId);
  
  const { data: tasks } = await supabase
    .from("tasks")
    .select("*")
    .eq("user_id", appUserId)
    .order("priority")
  

  // POST request is processed by POST function in @/api/register/route.ts.
  await fetch(`http://localhost:3000/api/registerUser`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    // JSON.stringify makes JavaScript object to string; HTTP(S), WebScoket always process string.
    body: JSON.stringify({ identity_id: guid})
  });
  
  return (
    <HomeClient 
      username={user.name}
      appUserId={appUserId}
      goals={goals ?? []}  
      tasks={tasks ?? []} 
    />
  );
}
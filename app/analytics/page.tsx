import { cookies } from "next/headers"
import jwt from "jsonwebtoken";
import AnalyticsClient  from "./AnalyticsClient"
import { createSupabaseServer } from "@/lib/supabaseServer"


export default async function AnalyticsPage() {
  // cookies is exptracted from request from brower..
  const cookie = await cookies()
  const token = cookie.get("access_token")?.value;
  const idToken = cookie.get("id_token")?.value;

  if (!idToken || !token) { return <div>No token found</div> }

  // try to get user info with access token.
  const resp = await fetch(process.env.IDCS_USERINFO_ENDPOINT!, {
      headers: {
          Authorization: `Bearer ${token}`,
      }
  })

  // resp is Response object, so convert to json format.
  // Indetifying an user on "Identity domains"
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

  // Identifying an user on "Supabase"
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("identity_id", guid)
    .single()
  const appUserId = userRow?.id;
  console.log(`appUserId: ${appUserId}`)

  // goal info
  const { data: goals } = await supabase
    .from("goals")
    .select("id, title, description, is_active")
    .eq("owner_id", appUserId)

  //
  const { data: tasks } = await supabase
    .from("tasks")
    .select("id, goal_id, title, description, completed_at")
    .eq("user_id", appUserId)
    .eq("is_completed", true)

  const { data: dailySummaries } = await supabase
    .from("daily_summaries")
    .select("id, user_id, sentiment, content_md, summary_date")
    .eq("user_id", appUserId)
  
  
  return (
    <AnalyticsClient
      username={username}
      appUserId={appUserId}
      goals={goals ?? []}
      tasks={tasks ?? []}
      dailySummaries={dailySummaries ?? []}
    />
  );
}

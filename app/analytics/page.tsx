import { redirect } from "next/navigation";
import AnalyticsClient  from "./AnalyticsClientReportBase"
import { createSupabaseServer } from "@/lib/supabaseServer"
import { getAppUser } from "@/lib/getAppUser"


export default async function AnalyticsPage() {
  const user = await getAppUser();

  if (!user){
    redirect("/login");
  }
  // GUID is the unique ID for identifying the user in Identity domains.
  const { appUserId:verifiedAppUserId, guid, username } = user;

  // Download tasks from DB, which should be alloed only to the server never user.
  const supabase = createSupabaseServer();

  //const { data: goals } = await supabase
  //  .from("goals")
  //  .select("id, title, description, is_active")
  //  .eq("owner_id", verifiedAppUserId)

  //const { data: tasks } = await supabase
  //  .from("tasks")
  //  .select("id, goal_id, title, description, completed_at")
  //  .eq("user_id", verifiedAppUserId)
  //  .eq("is_completed", true)

  //const { data: dailySummaries } = await supabase
  //  .from("daily_summaries")
  //  .select("id, user_id, sentiment, content_md, summary_date")
  //  .eq("user_id", verifiedAppUserId)
  //
  const [goalsRes, tasksRes, summariesRes] = await Promise.all([
    supabase.from("goals").select("id, title, description, is_active").eq("owner_id", verifiedAppUserId),
    supabase.from("tasks").select("id, goal_id, title, description, completed_at").eq("user_id", verifiedAppUserId).eq("is_completed", true),
    supabase.from("daily_summaries").select("id, user_id, sentiment, content_md, summary_date").eq("user_id", verifiedAppUserId)
  ])
  
  return (
    <AnalyticsClient
      username={username}
      appUserId={verifiedAppUserId}
      goals={goalsRes.data ?? []}
      tasks={tasksRes.data ?? []}
      dailySummaries={summariesRes.data ?? []}
    />
  );
}

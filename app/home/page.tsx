import { redirect } from "next/navigation";
import HomeClient from "./HomeClient";
import { getAppUser } from "@/lib/getAppUser";
import { createSupabaseServer } from "@/lib/supabaseServer";


export default async function HomePage() {
  const user = await getAppUser();
  if (!user) redirect("/login");

  const { appUserId:verifiedAppUserId, username } = user

  // Download tasks from DB, which should be alloed only to the server never user.
  const supabase = createSupabaseServer();
  
  const [goalsRes, tasksRes] = await Promise.all([
    supabase.from("goals").select("*").eq("owner_id", verifiedAppUserId).eq("is_active", true),
    supabase.from("tasks").select("*").eq("user_id", verifiedAppUserId).eq("is_completed", false).order("priority")
  ]);
  
  return (
    <HomeClient 
      username={username}
      goals={goalsRes.data ?? []}  
      tasks={tasksRes.data ?? []} 
    />
  );
}
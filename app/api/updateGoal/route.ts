import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";
import { getAppUser } from "@/lib/getAppUser";


export async function POST(req: Request){
  // confirm authentication status firstly
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { goal_id, title, description } = await req.json();
  const supabase = createSupabaseServer();

  // when editing an existing goal
  if (goal_id) {
    const { error } = await supabase
      .from("goals")
      .update({
        title,
        description,
      })
      .eq("id", goal_id)
      .eq("owner_id", user.appUserId);

      if (error) {
        return NextResponse.json({ error: error.message }, { status:400 });
      }

    // added 3/13/2026; return otherwise inserting follows every time edit a goal.
    return NextResponse.json({ ok: true });
  }

  // when registering a new goal
  const { error } = await supabase
    .from("goals")
    .insert({
      title,
      description,
      owner_id: user.appUserId, // not using a request body but a real user.appUserId
      is_active: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status:400 });
  }

  return NextResponse.json({ok: true})
}
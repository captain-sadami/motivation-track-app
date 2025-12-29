import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";


export async function POST(req: Request){
  const { goal_id, title, description, identity_id } = await req.json();
  const supabase = createSupabaseServer();
  console.log("step1")

  // when editing existing goal
  if (goal_id) {
    const { error } = await supabase
      .from("goals")
      .update({
        title,
        description,
      })
      .eq("id", goal_id);

      if (error) {
        return NextResponse.json({ error: error.message }, { status:400 });
      }
  }

  // when registering new goal
  const { error } = await supabase
    .from("goals")
    .insert({
      title,
      description,
      owner_id: identity_id,
      is_active: true,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status:400 });
  }

  return NextResponse.json({ok: true})
}
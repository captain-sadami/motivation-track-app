import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";


export async function POST(req: Request){
  const { goal_id } = await req.json();
  const supabase = createSupabaseServer();

  await supabase.from("goals")
    .update({
      is_active: false,
      completed_at: new Date().toISOString(),
    })
    .eq("id", goal_id);

  return NextResponse.json({ok: true})
}
import { createSupabaseServer } from "@/lib/supabaseServer";
import { NextResponse } from "next/server";


export async function POST(req: Request){
  const { task_id } = await req.json();
  const supabase = createSupabaseServer();

  await supabase.from("tasks")
    .update({
      is_completed: true,
      completed_at: new Date().toISOString(),
    })
    .eq("id", task_id);

  return NextResponse.json({ok: true})
}
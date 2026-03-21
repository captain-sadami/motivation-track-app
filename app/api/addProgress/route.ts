import {NextResponse} from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getAppUser } from "@/lib/getAppUser";


export async function POST(req: Request) {
  try {
    const user = await getAppUser();
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status:401 });
    }

    const verified_app_user_id = user.appUserId; 
    const body = await req.json();
    const { task_id, comment, mark_as_completed } = body;

    if (!task_id || !comment) {
      return NextResponse.json(
        { error:"task_id, comment are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServer();

    // same as const error = result.error;
    const { error } = await supabase
      .from("progress")
      .insert({
        task_id,
        user_id: verified_app_user_id,
        comment,
      });
      
    if (mark_as_completed) {
      const { error: updateError } = await supabase
        .from("tasks")
        .update({
          is_completed: true,
          completed_at: new Date().toISOString(),
        })
        .eq("id", task_id)
        .eq("user_id", verified_app_user_id);
      
        if (updateError) throw updateError;
    }

    return NextResponse.json({ ok: true });
    
  } catch (err) {
    return NextResponse.json(
      { error: "failed to add progress" },
      { status: 500 }
    );
  }
}
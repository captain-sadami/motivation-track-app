import {NextResponse} from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";


export async function POST(req: Request) {
  try {
    const body = await req.json();
    const task_id = body.task_id;
    const user_id = body.user_id;
    const comment = body.comment;

    if (!task_id || !user_id || !comment) {
      return NextResponse.json(
        { error:"task_id, user_id, comment are required" },
        { status: 400 }
      );
    }

    const supabase = createSupabaseServer();

    // same as const error = result.error;
    const { error } = await supabase
      .from("progress")
      .insert({
        task_id,
        user_id,
        comment,
      });
    
    if (error){
      console.error(error);
      return NextResponse.json(
        { error: "failed to insert progress" },
        { status: 500 }
      );
    }
    return NextResponse.json({ ok: true });
  } catch (err) {
    return NextResponse.json(
      { error: "failed to add progress" },
      { status: 500 }
    );
  }
}
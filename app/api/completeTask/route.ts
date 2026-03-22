import { createSupabaseServer } from "@/lib/supabaseServer";
import { getAppUser } from "@/lib/getAppUser";
import { NextResponse } from "next/server";


export async function POST(req: Request){
  try {
    const user = await getAppUser();
    if (!user){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifiedAppUserId = user.appUserId;
    const { task_id } = await req.json();

    const supabase = createSupabaseServer();
    const {error} = await supabase
      .from("tasks")
      .update({
        is_completed: true,
        completed_at: new Date().toISOString(),
      })
      .eq("id", task_id)
      .eq("user_id", identifiedAppUserId);

    if (error) throw error;

    return NextResponse.json({ok: true})

  } catch (err: any) {
      console.error("complete task Error: ", err);
      return NextResponse.json(
        { error: err.message || "Internal Server Error" },
        { status: 500 }
      );
  }
}
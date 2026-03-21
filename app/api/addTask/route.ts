import { createSupabaseServer } from "@/lib/supabaseServer";
import { getAppUser } from "@/lib/getAppUser";
import { NextResponse } from "next/server";


export async function POST(req:Request){
  try {
    const user = await getAppUser();
    if (!user){
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const identifiedAppUserId = user.appUserId;
    const body = await req.json();
    const { title, description, goal_id } = body;

    if (!title || !goal_id) {
      return NextResponse.json({ error: "Title and goal_id are ignored" }, {status:400});
    }


    const supabase = createSupabaseServer();
    const { error } = await supabase
      .from("tasks")
      .insert({
        title,
        description,
        goal_id,
        is_completed:false,
        user_id: identifiedAppUserId
      });

    if (error) throw error;

    return NextResponse.json({ ok: true });
  
  } catch(err: any) {
      console.error("Add Task Error: ", err);
      return NextResponse.json(
        { error: err.message || "Internal Server Error" },
        { status: 500 }
      );
  }
}
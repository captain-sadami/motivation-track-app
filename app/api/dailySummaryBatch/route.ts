import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { analyzeMotivation, TaskProgress} from "@/lib/analyzeMotivation";


export async function POST() {
  const supabase = createSupabaseServer();
  const targetDate = new Date();
  const yyyyMMdd = targetDate.toISOString().slice(0,10); //YYYY-MM-DD

  const { data: users, error: userErr } = await supabase
    .from("users")
    .select("id");

  if (userErr) {
    console.error("users fetch error", userErr);
    return NextResponse.json({ error:"user fetch failed" },{ status: 500 });
  }

  const { data: tasks_data } = await supabase
    .from("tasks")
    .select("id, title");


  for (const user of users ?? []) {
    const userId = user.id;
    
    // get progress
    const { data: progress } = await supabase
      .from("progress")
      .select("comment, created_at, task_id")
      .eq("user_id", userId)
      .gte("created_at", `${yyyyMMdd}T00:00:00`)
      .lt("created_at", `${yyyyMMdd}T23:59:59`);

    // 
    if (!progress || progress.length===0) {
      continue;
    }

    const { data: existing } = await supabase
      .from("daily_summary")
      .select("id")
      .eq("user_id", userId)
      .eq("date", yyyyMMdd)
      .maybeSingle();

    // for day off
    if (existing) { 
      continue;
    }
    
    //const taskGroupedProgress = new Map<number | null, {title: String, comment: String[]} >();
    const taskGroupedProgress = new Map<number | null, TaskProgress>();
    for (const p of progress) {
      if (!p.comment) continue;

      if (!taskGroupedProgress.has(p.task_id)) {
        taskGroupedProgress.set(p.task_id, 
          {task_title:tasks_data?.find(t=>t.id===p.task_id)?.title, comment:[]}
      )
        taskGroupedProgress.get(p.task_id)!.comment.push(p.comment);
      }
      else {
        taskGroupedProgress.get(p.task_id)!.comment.push(p.comment);
      }
    //const sentimentScore=null;
    const result = await analyzeMotivation(taskGroupedProgress);

    await supabase.from("daily_summaries").insert({
      user_id: userId,
      summary_date: yyyyMMdd,
      content_md: result.summary,
      sentiment: result.sentiment,
    });
  }

  return NextResponse.json({
    ok: true,
    date: yyyyMMdd,
  });
  }
}
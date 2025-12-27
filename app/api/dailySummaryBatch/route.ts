import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { analyzeMotivation, TaskProgress} from "@/lib/analyzeMotivation";


export const runtime = "nodejs";

export async function POST() {
  console.log("dailySummaryBatch POST called");
  try {
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
      .select("id, title, is_completed");


    function jstDayToUtcRange(jstDate: Date) {
      const y = jstDate.getFullYear();
      const m = jstDate.getMonth();
      const d = jstDate.getDate();
    
      const startUtc = new Date(Date.UTC(y, m, d, -9, 0, 0));
      const endUtc   = new Date(Date.UTC(y, m, d, 14, 59, 59, 999));
    
      return {
        startUtc: startUtc.toISOString(),
        endUtc: endUtc.toISOString(),
      };
    }

    const { startUtc, endUtc } = jstDayToUtcRange(new Date());
    for (const user of users ?? []) {
      const userId = user.id;
      // get progress
      const { data: progress, error } = await supabase
        .from("progress")
        .select("comment, created_at, task_id")
        .eq("user_id", userId)
        .gte("created_at", startUtc)
        .lt("created_at", endUtc);
      
      //console.log("range", startUtc, endUtc);
      //console.log("progress", progress)
      if (!progress || progress.length===0) {
        continue;
      }
      
      const { data: existing } = await supabase
        .from("daily_summaries")
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

        const task = tasks_data?.find(t => t.id === p.task_id);
        if (!taskGroupedProgress.has(p.task_id)) {
          taskGroupedProgress.set(p.task_id, 
            { task_title: task?.title,
              is_completed:task?.is_completed,
              comment:[]
            }
          )
          taskGroupedProgress.get(p.task_id)!.comment.push(p.comment);
        }
        else {
          taskGroupedProgress.get(p.task_id)!.comment.push(p.comment);
        }
      }
      
      const result = await analyzeMotivation(taskGroupedProgress);
      const { error: insertErr } = await supabase
        .from("daily_summaries")
        .insert({
          user_id: userId,
          summary_date: yyyyMMdd,
          content_md: result.summary,
          sentiment: result.sentiment,
      });
      if (insertErr) {
        console.error("daily_summary insert failed", insertErr);
        continue;
      }
    }
    
    return NextResponse.json({
        ok: true,
        date: yyyyMMdd,
    });
    
  } catch (e) {
    console.error("dailySummaryBatch fatal error", e);
    return NextResponse.json(
      { error: "daily summary batch failed" },
      { status: 500 }
    );
  }
}
"use client";

import { useState } from "react";

type Goal = {
  id?: number;
  title: string;
  description?: string;
  is_active: boolean;   
};

type Task = {
  id: number;
  goal_id?: number;
  title: string;
  description: string;
  completed_at: string;
};

type DailySummary = {
  id: number;
  user_id: number;
  sentiment: number;
  content_md: string;
  summary_date: string;
}

export default function AnalyticsClient({ username, appUserId, goals, tasks, dailySummaries }:
  { username: string;
    appUserId: number;
    tasks: Task[];
    goals: Goal[];
    dailySummaries: DailySummary[];
  })
  {
    {/* inside <>, stirng literal type is asssined, which indicates string type and simultaneously a value */}
    const [range ,setRange] = useState<"week" | "month" | "all">("week")
    const now = new Date();
    const filteredTasks = tasks.filter(t=>{
      if (!t.completed_at) return false;
      const completed = new Date(t.completed_at);

      if (range==="week") { 
        const start = new Date();
        start.setDate(start.getDate()-7)
        return completed >= start;
      }

      if (range==="month") {
        const start = new Date(
          now.getFullYear(),
          now.getMonth(),
          1
        );
        return completed >= start
      }
      
      return true; //all
    });

    const goalMap = Object.fromEntries(
      goals.map(g=>[g.id, g])
    );

    const tasksByDate = filteredTasks.reduce((acc, t)=> {
      if (!t.completed_at) return acc;

      const date = new Date(t.completed_at + "Z");
      const key = date.toLocaleDateString("sv-SE")
      console.log(key)

      if (!acc[key]) acc[key] = [];
      acc[key].push(t);
      
      return acc;
    }, {} as Record<string, typeof filteredTasks>);


    return(
      <>
        <h1 className="p-4 text-xl font-semibold text-gray-200">
          Keep going, {username.split(" ")[0]}!
        </h1>
        
        {/* div start: showing tasks which have been accomplished */}
        <div className="max-w-5xl mx-auto px-4">
          
          {/* ==== period selector ==== */}
          <div className="flex gap-2 mb-6">
            <button
              className={`px-3 py-1 rounded-md text-sm
                ${range === "week"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }
              `}
                onClick={() => setRange("week")}
            >
              今週
            </button>

            <button
              className={`px-3 py-1 rounded-md text-sm
                ${range === "month"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }
              `}
                onClick={() => setRange("month")}
            >
              今月
            </button>
            
            <button
              className={`px-3 py-1 rounded-md text-sm
                ${range === "all"
                  ? "bg-blue-600 text-white"
                  : "bg-gray-800 text-gray-300 hover:bg-gray-700"
                }
              `}
                onClick={() => setRange("all")}
            >
              全て
            </button>
          </div>
          
          {Object.entries(tasksByDate)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([date, tasks]) => (
              <div key={date} className="bg-gray-900/40 rounded-xl p-4 mb-8">
                {/* the header part per date */}
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                  {date}に達成したタスク
                </h3>
                {/* the accomplished task part per date */}
                <div className="space-y-4">
                {dailySummaries
                  .filter((s)=>
                    s.user_id===appUserId &&
                    s.summary_date===date
                  )
                  .map(s => (
                    <div className="bg-[#e9e5dc] rounded-xl p-5 mb-6">
                      <div className="text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                        🪄 AIサマリー日報
                      </div>
                      <p className="text-[#1f2933] text-sm leading-relaxed whitespace-pre-wrap">
                        {s.content_md}
                      </p>
                    </div>
                  ))
                }

                {tasks.map(t=>{
                  const goal = t.goal_id ? goalMap[t.goal_id] : null;

                  return (
                    <div
                      key={t.id}
                      className="text-gray-200 py-2 px-3 bg-gray-800 rounded-lg mb-1"
                    >
                      <div className="flex justify-between items-center">
                        <span>{t.title}</span>
                        {goal && (
                          <span className="text-xs text-gray-400 ml-2">
                            {goal.title}
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
               </div>
              </div>
            ))
          }
        </div>
        {/* div end: showing tasks which have been accomplished */}
      </>
    )
  }
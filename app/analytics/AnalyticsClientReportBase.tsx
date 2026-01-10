"use client";

import { useState } from "react";
import { LineChart, Line, ResponsiveContainer} from "recharts";


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
    function toDateKey(date:Date){
      return date.toISOString().slice(0,10);
      // "YYYY-MM-DD"
    }
    function getStartForRange(range: "week" | "month" | "all") {
      if (range==="all") return null;
      const d = new Date();
      d.setHours(0,0,0,0);
      if (range==="week") {
        d.setDate(d.getDate()-6);
        return d;
      }
      if (range==="month") {
        d.setDate(1);
        return d;
      }
      return null;
    }

    function toJstDateKey(date: Date) {
      const jst = new Date(date.getTime()+9*60*60*1000);
      return jst.toISOString().slice(0,10);
    }

    // inside <>, stirng literal type is asssined, which indicates string type and simultaneously a value
    const [range, setRange] = useState<"week" | "month" | "all">("week");
    const start = getStartForRange(range);
    //console.log("start: ", start);
    // start:  Sun Jan 04 2026 00:00:00 GMT+0900 (日本標準時)
    // start:  Thu Jan 01 2026 00:00:00 GMT+0900 (日本標準時)
    // start:  null

    const filteredDailySummaries = dailySummaries.filter(s=>{
      if (!s.summary_date) return false;
      if (!start) return true;

      console.log("s.summary_date", s.summary_date);
      return (new Date(s.summary_date) >= start);
      
    })

    const dailySummariesByDate = filteredDailySummaries.reduce((ret, s)=> {
      const key = toJstDateKey(new Date(s.summary_date));
      if (!ret[key]) ret[key] = [];
      ret[key].push(s)

      return ret;
    },{} as Record<string, DailySummary[]>)
    
    
    const filteredTasks = tasks.filter(t=>{
      if (!t.completed_at) return false;
      if (!start) return true; // null is returned when range==="all" see getStartForRang
      const completed = new Date(t.completed_at);
      //console.log("completed: ", completed)
      // completed:  Fri Dec 26 2025 14:13:10 GMT+0900 (日本標準時)
      // ...
      // completed:  Thu Jan 08 2026 14:23:26 GMT+0900 (日本標準時)
      return completed >= start;
    });

    // initilly acc is {} which is initiated by last part
    // when you use reduce, you can avoid defining result variable outside of the for roop!
    // acc is corresponding to the resutl variable, here.
    const tasksByDate = filteredTasks.reduce((acc, t)=> {
      const key = toJstDateKey(new Date(t.completed_at));
      if (!acc[key]) acc[key] = [];
      acc[key].push(t);

      return acc;
    }, {} as Record<string, Task[]>);
    // Record<Key, Value>
    
    
    const goalMap = Object.fromEntries(
      goals.map(g=>[g.id, g])
    );
    // [ [1, {id: 1, title:"go to gym",}], [2, {id:2, title:"study"}] ]


    const sentimentSeries = dailySummaries
      .filter(s => {
        if (!start) return true;
        return new Date(s.summary_date) >= start;
      })
      .sort((a, b) => a.summary_date.localeCompare(b.summary_date))
      .map(s => ({
        date: toJstDateKey(new Date(s.summary_date)),
        sentiment: s.sentiment,
      }));

    function SentimentMiniGraph({
        data,
      }: {
        data: {date: string; sentiment: number }[];
      }) 
      {
        if (data.length===0) {
          return (
            <div className="text-xs text-gray-500">
              データなし
            </div>
          );
        }

        const avg = data.reduce((sum,d)=>sum+d.sentiment,0)/data.length;
        const trendIcon=
          avg >= 0.5 ? "🙂" :
          avg <= -0.5 ? "😵" :
          "😐";

        return (
          <div>
            {/* header */}
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs text-gray-400">
                メンタル推移
              </span>
              <span className="text-sm">
                {trendIcon}
              </span>
            </div>

            {/* graph */}
            <ResponsiveContainer width="100%" height={80}>
              <LineChart data={data}>
                <Line
                  type="monotone"
                  dataKey="sentiment"
                  stroke="#60a5fa"
                  strokeWidth={2}
                  dot={false}
                />
              </LineChart>
            </ResponsiveContainer>

            {/* average */}
            <div className="text-[10px] text-gray-400 text-right mt-1">
              平均 {avg.toFixed(1)}
            </div>
          </div>
        );
      }
    

    return(
      <>
        <h1 className="p-4 text-xl font-semibold text-gray-200">
          Keep going, {username.split(" ")[0]}!
        </h1>
        
        {/* div start: showing tasks which have been accomplished */}
        <div className="max-w-5xl mx-auto px-4">
          {/* separate top space into two sections */}
          <div className="flex items-start justify-between mb-6">
            {/* left: section: period selector */}
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
                直近一週間
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

            {/* right section: mini graph */}
            <div className="w-48">
              <SentimentMiniGraph data={sentimentSeries} />
            </div>
          </div>
          
        
          {Object.entries(dailySummariesByDate)
            .sort(([a], [b]) => b.localeCompare(a))
            .map(([dateKey, dailySummaries]) => (
              <div key={dateKey} className="bg-gray-900/40 rounded-xl p-4 mb-8">
                {/* the header part per date */}
                <h3 className="text-lg font-semibold text-gray-300 mb-3">
                  {dateKey}の要約
                </h3>
                {/* the accomplished task part per date */}
                <div className="space-y-4">
                  {dailySummaries
                    .filter((s)=>toJstDateKey(new Date(s.summary_date))===dateKey)
                    .map(s => {
                      const label = 
                        s.sentiment===2 ? "😀 最高！":
                        s.sentiment===1 ? "🙂 良い感じ":
                        s.sentiment===0 ? "😐 ふつう":
                        s.sentiment===-1 ? "😵 しんどめ":
                        s.sentiment===-2 ? "🤢 最悪":
                        "";

                      return(
                        <div
                          key={s.id}
                          className="bg-[#e9e5dc] rounded-xl p-5 mb-6"
                        >
                          <div className="text-sm font-semibold text-gray-700 mb-2 tracking-wide">
                            🪄 AIサマリー日報
                          </div>
                          <div className="text-[#1f2933] text-sm leading-relaxed whitespace-pre-wrap">
                            メンタル分析：{label}
                          </div>
                          <p className="text-[#1f2933] text-sm leading-relaxed whitespace-pre-wrap">
                            {s.content_md}
                          </p>
                        </div>
                      );
                    })
                  }

                  {(tasksByDate[dateKey] ?? []).map(t => {
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
                        )
                      })
                  }
                </div>
              </div>
            ))
          }
        </div>
        {/* div end: showing tasks which have been accomplished */}
      </>
    )
  }
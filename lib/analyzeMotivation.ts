import OpenAI from "openai";
import { NextResponse } from "next/server";


export const runtime = "nodejs";
const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
export type TaskProgress = {
  task_title: string;
  is_completed: boolean;
  comment: string[];
}

function comments_2_comment(comments: string[]): string{
  // more than one comment concatinated with "そして"
  return comments.join("\nそして、")
}

function buildDailyInput(tasks: TaskProgress[]) {
  let text = `【タスク別進捗】\n\n`;

  for (const t of tasks) {
    const comment_per_task = comments_2_comment(t.comment)
    text +=
      `タスク名: ${t.task_title}\n` +
      `進捗:\n${comment_per_task}\n`;
    if (t.is_completed) {
      text += "本日タスク完了\n"
    }
    text += "\n"
  }
  return text;
}


//export async function analyzeMotivation(progresses: Map<number | null, {title: String, comments: String[]}>) 
export async function analyzeMotivation(progresses: Map<number | null, TaskProgress>) 
{
    const arrayedProgresses = Array.from(progresses.values())
    const dailyInputText = buildDailyInput(arrayedProgresses);
    const response = await client.responses.create({
      model: "gpt-5-nano",
      reasoning: { effort: "low" },
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text:
                "あなたはユーザーの進捗コメントを分析して、感情（センチメント）と要点を返す、日報作成を支援するアシスタントです。" +
                "以下にはタスクごとの進捗が記載されています。"+
                "各タスクの内容を踏まえて、以下を作成してください。"+
                "1. その日の全体的なセンチメント"+
                "2. タスクの流れがわかる日報用サマリー"+
                "センチメントは -2(とてもネガ) -1(ネガ) 0(ニュートラル) 1(ポジ) 2(とてもポジ)。" +
                "サマリーは300文字以内"+
                "特定のタスクでつまりがあった場合は、それも反映してください。日報は仕事へのモチベーションの管理に使います。"+
                "日報サマリーでは、タスクID（数値）は出力せず、人が読んで分かるタスク名のみを使用してください。"
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: dailyInputText,
            }
          ],
        },
      ],
      text: {
        format: {
          type: "json_schema",
          name: "progress_sentiment",
          schema: {
            type: "object",
            additionalProperties: false,
            properties: {
              sentiment: { type:"integer", minimum: -2, maximum: 2 },
              confidence: { type:"number", minimum: 0, maximum: 1 },
              summary: { type: "string" },
            },
            required: ["sentiment", "confidence", "summary"],
          },
        },
      },
  });
  
  // parsing responses
  const jsonText = response.output_text;
  const result = JSON.parse(jsonText) as {
    sentiment: number;
    confidence: number;
    summary: string;
  };
  
  return result;
}
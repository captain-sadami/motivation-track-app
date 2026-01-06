import { createSupabaseServer } from "@/lib/supabaseServer";

export async function POST(req:Request){
  const body = await req.json();
  const { title, description, goal_id, identity_id  } = body;

  const supabase = createSupabaseServer();

  const { error } = await supabase
    .from("tasks")
    .insert({
      title,
      description,
      goal_id,
      is_completed:false,
      user_id: identity_id
    });

    if (error) {
      console.error(error);
      return new Response("Error", { status: 500 });
    }

    return new Response("OK", {status: 200 });
}
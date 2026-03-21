import { NextResponse } from "next/server";
import { createSupabaseServer } from "@/lib/supabaseServer";
import { getAppUser } from "@/lib/getAppUser";


// POST is a endpoint for fetch with POST method request from page.tsx
export async function POST(req: Request) {
  const user = await getAppUser();
  if (!user) {
    return NextResponse.json({ error: "Unauthorized" }, { status:401 });
  }

  //const { identity_id } = await req.json();
  const identity_id = user.guid;

  if (!identity_id) {
    return NextResponse.json(
      { error: "identity_id is requered" },
      { status: 400 }
    );
  }

  const supabase = createSupabaseServer();
  const { data, error } = await supabase
    .from("users")
    .select("*")
    .eq("identity_id", identity_id)
    .maybeSingle();
  if (error && error.code !== "PGSRT116") {
    console.error(error);
    return NextResponse.json({ error: error.message }, {status: 500}); 
  }

  // data insert part when an user is not registered
  if (!data) {
    const { error: insertErr } = await supabase
      .from("users")
      .insert({ identity_id });

    if (insertErr) {
      console.error(insertErr);
      return NextResponse.json(
        { error: insertErr.message }, 
        {status: 500}
      );
    }
  }

  return Response.json({ ok: true });
}

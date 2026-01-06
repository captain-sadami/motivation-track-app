import { cookies } from "next/headers";
import jwt from "jsonwebtoken";
import { createSupabaseServer } from "@/lib/supabaseServer";


export async function getAppUser() {
  const cookie = await cookies();
  const token = cookie.get("access_token")?.value;
  const idToken = cookie.get("id_token")?.value;

  if (!token || !idToken){
    return null;
  }

  const resp = await fetch(process.env.IDCS_USERINFO_ENDPOINT!, {
    headers: { Authorization: `Bearer ${token}` },
  });

  if (!resp.ok) {
    return null;
  }

  const user = await resp.json();
  const username = user.name ?? "unknown";
  const decoded = jwt.decode(idToken) as any;
  const guid = decoded.user_id ?? decoded.idcs_user_id;

  const supabase = createSupabaseServer();
  const { data: userRow } = await supabase
    .from("users")
    .select("id")
    .eq("identity_id", guid)
    .single();

  if (!userRow){
    return null;
  }

  return {
    appUserId: userRow.id,
    guid,
    username
  };
}
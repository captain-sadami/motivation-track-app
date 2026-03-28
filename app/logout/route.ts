import { cookies } from "next/headers";
import { NextResponse } from "next/server";


export async function GET() {
  const cookieStore = await cookies();
  const idToken = cookieStore.get("id_token")?.value;

  // disable authentication satate at Identity Domains.
  const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;
  const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL!;
  const redirectUri = encodeURIComponent(`${baseUrl}/auth/logout_callback`);

  // added id_token_hint for query otherwise identity domains return 400
  const url = 
    `${domain}/oauth2/v1/userlogout?` +
    `post_logout_redirect_uri=${redirectUri}` +
    `&id_token_hint=${idToken}`;
  
  
  return NextResponse.redirect(url)
}
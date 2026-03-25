"use client"
import { useEffect } from "react";


//next.js calls default function automatically.
export default function LogoutPage() {
  // When using window, process must run in the browser.
  // and if you gurantee it runs in browser, you use useEffect function.
  useEffect(() => {
    async function performLogout(){
      // disable cookies on user side.
      await fetch("/auth/logout_delete_http_cookie", {method: "POST"})
      
      // disable authentication satate at Identity Domains.
      const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;
      const baseUrl = process.env.NEXT_PUBLIC_APP_BASE_URL!;
      const redirectUri = encodeURIComponent(`${baseUrl}/login`);
      // The document shows query parameters and id_token_hint is not needed for real though it doesn't have "optional" notion...
      // https://docs.oracle.com/en/cloud/paas/iam-domains-rest-api/op-oauth2-v1-userlogout-get.html
      const url = 
        `${domain}/oauth2/v1/userlogout?post_logout_redirect_uri=${redirectUri}`
      
      // redirect() method cannot be used for external URL like https://idcs....
      // redirect() can use for the same origin ig. from https://google.com：443/login to https://google.com:443/logout
      window.location.href = url;
      console.log("here")
    }

    performLogout();
  },[]);
}
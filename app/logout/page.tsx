"use client"
import { useEffect } from "react";


//next.js calls default function automatically.
export default async function LogoutPage() {

  // When using window, process must run in the browser.
  // and if you gurantee it runs in browser, you use useEffect function.
  useEffect(() => {
    const redirectUri = encodeURIComponent("http://localhost:3000/login");
    const domain = process.env.NEXT_PUBLIC_IDCS_DOMAIN!;
    
    // The document shows query parameters and id_token_hint is not needed for real though it doesn't have "optional" notion...
    // https://docs.oracle.com/en/cloud/paas/iam-domains-rest-api/op-oauth2-v1-userlogout-get.html
    const url = 
      `${domain}/oauth2/v1/userlogout?post_logout_redirect_uri?post_logout_redirect_uri=${redirectUri}`
    
    // redirect() method cannot be used for external URL like https://idcs....
    // redirect() can use for the same origin ig. from https://google.com：443/login to https://google.com:443/logout
    window.location.href = url;
    },[]);
}
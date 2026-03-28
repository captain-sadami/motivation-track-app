"use client"
import { useEffect } from "react";


//next.js calls default function automatically.
export default function LogoutPage() {
  // When using window, process must run in the browser.
  // and if you gurantee it runs in browser, you use useEffect function.
  useEffect(() => {
    async function performLogout(){
      window.location.href = "/logout"; // offload the logout process to the server...
    }
  },[]);
}
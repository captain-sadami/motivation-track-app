"use client";

import { useEffect, useState, ReactNode } from "react";
import WebSocketClient from "../home/WebSocketClient";
import Link from "next/link";


// {children} will use when returns.
export default function HomeLayout({ children, username 
  }: { 
    children:ReactNode, username:string
  })
  {
  // two variables can be assined by the way below.
  // same as const [x, y] = [1, 2];
  // useState(false) = [false, function to make shouldConnect]
  // Initially shouldConnect is false, but setShouldConnect(true) makes shouldConnect is True.
  const [shouldConnect, setShouldConnect] = useState(false);

  // layout.tsx are pared by server (SSR) Initially, but websocket process cannot be done by the server but the client.
  // useEffect is always processed by the browser, so this section is necessarily.
  useEffect(() => {
    // when client-side rendering starts, ShouldConnect becomes true
    setShouldConnect(true);
  }, []);


  // layout.tsx and page.tsx are combined as returns
  // right after combined UI has shown (mounted), useEffect runs and makes ShouldConnect is true.
  // "shouldConnec &&" means that after useEffect runs.
  // WebSocket is not up until shouldConnect turns true. 
  return (
    <div className="flex h-screen">
      {/* left area */}
      {/* <aside className="w-64 bg-gray-900 text-white flex flex-col justify-between"> */}
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col justify-between">
        <div>
          <div className="p-4 text-xl font-bold">The Motivation Tracker</div>
          
          <nav className="mt-4 space-y-2">
            <Link href="/home" className="block px-4 py-2 hover:bg-gray-800">🏠 ホーム</Link>
            <Link href="/analytics" className="block px-4 py-2 hover:bg-gray-800">📈 Analytics</Link>
            <Link href="/control" className="block px-4 py-2 hover:bg-gray-800">🧠 Control</Link>
          </nav>

          {/* Mobile Bottom Navigation */}
          <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-700 flex justify-around py-2 text-white">
            <Link href="/home" className="flex flex-col items-center text-xs">
              <span className="text-lg">🏠</span>
              ホーム
            </Link>
            <Link href="/analytics" className="flex flex-col items-center text-xs">
              <span className="text-lg">📈</span>
              分析
            </Link>
            <Link href="/control" className="flex flex-col items-center text-xs">
              <span className="text-lg">🧠</span>
              管理
            </Link>
          </nav>
        </div>
        {/* profile */}
        <div>
          {/* No file can provide props to layout.tsx, so after rendering, change it by javascript in HomeClient.tsx */}
          <div id="sidebar-username" className="max-w-3xl mx-auto w-full px-4">🧍 {username.split(" ")[0]}</div>
            <button onClick={() => (window.location.href="/logout")}
              className="w-full text-left px-4 py-2 rounded hover:bg-gray-800">🏃‍♀️ サインアウト</button>
        </div>
      </aside>

      {/* <main className="flex-1 overflow-y-auto bg-gray-800 text-white p-6"> */}
      <main className="flex-1 overflow-y-auto bg-gray-800 text-white p-4 md:p-6 pb-20 md:pb-6">
        {shouldConnect && <WebSocketClient />}
        {children}
      </main>
    </div>
  );
}

// {children} gets pages.tsx's contents
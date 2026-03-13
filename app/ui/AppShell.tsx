"use client";

import { useEffect, useState, ReactNode } from "react";
import WebSocketClient from "../home/WebSocketClient";
import Link from "next/link";

function HomeIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 11L12 4l8 7" />
      <path d="M6 10v10h12V10" />
    </svg>
  );
}

function AnalyticsIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M4 18V6" />
      <path d="M4 18H20" />
      <path d="M7 15L11 11L14 13L19 8" />
    </svg>
  );
}

function ControlIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <line x1="4" y1="6" x2="20" y2="6" />
      <circle cx="9" cy="6" r="2" />
      <line x1="4" y1="12" x2="20" y2="12" />
      <circle cx="15" cy="12" r="2" />
      <line x1="4" y1="18" x2="20" y2="18" />
      <circle cx="11" cy="18" r="2" />
    </svg>
  );
}

function UserIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 4-6 8-6s8 2 8 6" />
    </svg>
  );
}

function LogoutIcon() {
  return (
    <svg
      className="w-5 h-5"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M16 17l5-5-5-5" />
      <path d="M21 12H9" />
      <path d="M12 19H5a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h7" />
    </svg>
  );
}



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
      <aside className="hidden md:flex w-64 bg-gray-900 text-white flex-col justify-between">
        <div>
          <div className="p-4 text-xl font-bold">The Motivation Tracker</div>
          
          <nav className="mt-4 space-y-2">
            <Link href="/home" className="flex items-center gap-1 px-4 py-2 hover:bg-gray-800">
              <HomeIcon />
              <span className="text-lg">Home</span>
            </Link>
            <Link href="/analytics" className="flex items-center gap-1 px-4 py-2 hover:bg-gray-800">
              <AnalyticsIcon />
              <span className="text-lg">Analytics</span>
            </Link>
            <Link href="/control" className="flex items-center gap-1 px-4 py-2 hover:bg-gray-800">
              <ControlIcon />
              <span className="text-lg">Control</span>
            </Link>
          </nav>
        </div>


        {/* profile */}
        <div>
          {/* No file can provide props to layout.tsx, so after rendering, change it by javascript in HomeClient.tsx */}
          <div id="sidebar-username" className="flex items-center gap-1 px-4 py-2 hover:bg-gray-800">
            <UserIcon />
            <span className="text-lg">{username.split(" ")[0]}</span>
          </div>
          <button onClick={() => (window.location.href="/logout")}
            className="inline-flex items-center gap-1 px-4 py-2 hover:bg-gray-800"
          >
            <LogoutIcon /> 
            <span className="text-lg">Logout</span>
          </button>
        </div>
      </aside>

      {/* <main className="flex-1 overflow-y-auto bg-gray-800 text-white p-6"> */}
      <main className="flex-1 overflow-y-auto bg-gray-800 text-white p-4 md:p-6 pb-20 md:pb-6">
        {shouldConnect && <WebSocketClient />}
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 md:hidden bg-gray-900 border-t border-gray-700 flex justify-around py-2 text-white">
        <Link href="/home" className="flex flex-col items-center text-xs">
          <HomeIcon />
          <span className="text-lg">🏠️</span>
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
  );
}

// {children} gets pages.tsx's contents
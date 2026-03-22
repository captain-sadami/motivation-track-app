// layout.tsx designs "layout".
// layout.tsx is read firstly, after that, the content of page.tsx assigned to { chidlen }.
// layout.tsx and pages.tsx are composed, it starts to render.
// Even if layout.tsx is used in client, children part runs as SSR.

// RootLayout must do SSR!!!!!

import "./globals.css";
import { Geist, Geist_Mono } from "next/font/google";
import AppShell from "./ui/AppShell";
import { cookies } from "next/headers"
import { getAppUser } from "@/lib/getAppUser";


const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata ={
  title: "Motivation Tracker",
  description: "Personal productivity tool"
}

export default async function RootLayout({children}: {children: React.ReactNode;}) {
  const user = await getAppUser();
  const username = user?.username ?? "未ログイン"
  
  return(
    <html lang="ja">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-900`}>
        <AppShell username={username}>{children}</AppShell>
      </body>
    </html>
  );
}

// <AppShell>{childre}</AppShell>
// AppShell's {children} is replaced by page.tsx's contents


// Once layout.tsx is mounted, never unmounted (only after reload, not by page moving).
// useEffect(()=>{},[]) runs only when initial mount occurs, so it never runs twice.
// useState's shouldConnect variable is held until the component is unmounted.

// 1. layout.tsx is mounted
// 2. shouldConnect is assined as false
// 3. A browser got {children} only (because this is SSR yet and proceed CSR subsequently)
// 4. useEffect([]) runs on the browser, and setShouldConnect makes shouldConnect true.
// 5. the function made by useState makes REACT rerendering JSX and emerges {shouldConnect&& ...} parts.
// 6. Websocket connection starts

// NOTE: In phase 5, const [shouldConnect, setShouldConnect] = useState(false); 
// are rerun but state never override shouldConnect as false.
// Once shouldConnect has true, useState never override it.


"use client";

// layout.tsx designs "layout".
// layout.tsx is read firstly, after that, the content of page.tsx assigned to { chidlen }.
// layout.tsx and pages.tsx are composed, it starts to render.
// Even if layout.tsx is used in client, children part runs as SSR.
import WebSocketClient from "./WebSocketClient";
import { useEffect, useState, ReactNode } from "react";


// {children} will use when returns.
export default function HomeLayout({ children }: { children:ReactNode }) {
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
    <>
      {shouldConnect && <WebSocketClient />}
      {children}
    </>
  );
}

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


// めっちゃ難しいからここだけ日本語で理解を残しておくと、
// ユースケースとしては、一回きり処理したいパターンっていうのはこうやるしかない。
// layout.tsxはマウントされ続けるという点でuseEffectとの相性が非常に良く、
// useStateで変数を制御しないと描画のし直しができないことと、
// 描画したときに単なる代入だと上からコードをなぞって実行するのでまたfalseが入ってしまう
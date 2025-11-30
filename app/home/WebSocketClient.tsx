"use client";

import { useEffect } from "react";

export default function WebSocketClient() {
  useEffect(() => {
    console.log("WebSocketClient LOADED");

    // 必要なら JWT を WebSocket サーバに渡す（後述）
    const token = localStorage.getItem("access_token");

    const ws = new WebSocket("ws://localhost:3001");

    ws.onopen = () => {
      console.log("WS connected!");
      ws.send(JSON.stringify({ type: "auth", token }));
      // stringify makes { a: 1, b:2 } which is object to "{\"a\":1,\"b\":2}"
      // The websocket cannot send object itself, so the websocket can send string.
      // JSON is default object for JavaScript so no need to define like "new JSON(xxxx)"
    };

    ws.onmessage = (e) => {
      console.log("WS message:", e.data);
    };

    ws.onclose = () => {
      console.log("WS closed");
    };

    // You can return a function as "cleanup function" of useEffect which runs when unmounted
    // Note: function must be wrapped by function.
    // If you return ws.close(); simply, ws.close runs right on time and websocket closes.
    return () => ws.close();
  }, []);

  return null;
}

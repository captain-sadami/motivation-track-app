// ws-server.js
import { WebSocketServer } from "ws";

const wss = new WebSocketServer({ port: 3001 });

wss.on("connection", (ws) => {
  console.log("WS: client connected");
  ws.send("hello from ws server");

  ws.on("message", (msg) => {
    console.log("client says:", msg.toString());
  });
});

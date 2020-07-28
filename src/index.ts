import http from "http";
import WebSocket from "./websocket";

const { PORT = 39980 } = process.env;

const server = http.createServer();

const ws = new WebSocket();

server.on("upgrade", ws.onUpgrade);

server.listen(PORT, () => {
  console.log("Server listening on http://localhost:%s", PORT);
});

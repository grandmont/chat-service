import IORedis from "ioredis";
import WebSocket, { Server } from "ws";

// Services
import ActionService from "./services/ActionService";

// Interfaces and types
import { IncomingMessage } from "http";
import { Socket } from "net";
import { ClientInterface, ResponseInterface } from "./types";

// WebSocketServer class
export default class WebSocketServer {
  wss: Server;

  constructor() {
    this.wss = new Server({ noServer: true });
    this.init();
  }

  private init() {
    this.wss.on("connection", (client: ClientInterface) => {
      const subscriber = new IORedis();
      const publisher = subscriber.duplicate();
      const { id: clientId } = client;

      console.log("%s connected", clientId);

      const actions = new ActionService(client, subscriber, publisher);

      // Handle message
      client.on("message", async (message: string) => {
        console.log("%s sent message: %s", clientId, message);

        const { action, data } = JSON.parse(message);

        try {
          await actions.handle(action, data);
        } catch (error) {
          this.broadcast([client], {
            status: false,
            action: "error",
            data: null,
            error: error.message,
          });
        }
      });

      // Send message back
      subscriber.on("message", (channel, message) => {
        console.log("Receive message %s from channel %s", message, channel);

        this.broadcast([client], message);
      });

      client.on("close", () => {
        console.log("%s disconnected", clientId);
        subscriber.disconnect();
        publisher.disconnect();
      });

      client.on("ping", () => client.pong());
    });
  }

  onUpgrade = (request: IncomingMessage, socket: Socket, head: Buffer) =>
    this.wss.handleUpgrade(request, socket, head, (client) =>
      this.wss.emit(
        "connection",
        Object.assign(client, {
          id: Date.now(),
        }),
        request
      )
    );

  private broadcast(
    clients: Array<ClientInterface>,
    response: ResponseInterface
  ) {
    // Broadcast to open connections only
    clients.forEach(
      (ws) =>
        ws.readyState === WebSocket.OPEN && ws.send(JSON.stringify(response))
    );
  }
}

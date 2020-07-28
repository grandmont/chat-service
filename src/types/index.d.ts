import WebSocket from "ws";

export interface ClientInterface extends WebSocket {
  id: number;
}

export interface ResponseInterface {
  status: boolean;
  action: Action;
  data?: any;
  error?: any;
}

export type Action = "join" | "message" | "leave" | "error";

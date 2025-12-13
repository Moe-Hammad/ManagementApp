import { Client, IMessage, StompSubscription } from "@stomp/stompjs";
import SockJS from "sockjs-client";

const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

type SubscriptionCallback = (payload: any) => void;

export type Subscription = {
  id: string;
  unsubscribe: () => void;
};

/**
 * Globaler STOMP-Client (eine Verbindung fuer alles).
 * Verwendet @stomp/stompjs mit nativen WebSockets.
 */
class WebSocketManager {
  private static instance: WebSocketManager;

  private client: Client | null = null;
  private token: string | null = null;
  private connected = false;
  private connecting = false;

  private subscriptions: Map<
    string,
    {
      cb: SubscriptionCallback;
      destination: string;
      stompSub?: StompSubscription;
    }
  > = new Map();

  public static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  public isConnected() {
    return this.connected;
  }

  connect(token: string) {
    // Vermeide parallele Connect-Versuche
    if (this.connecting || this.connected || this.client?.active) return;

    this.token = token;
    this.connecting = true;
    // SockJS erwartet die HTTP/HTTPS-URL, nicht ws://
    const sockUrl = API_BASE_URL + "/ws";

    this.client = new Client({
      // SockJS-Factory nutzen; brokerURL wird dabei ignoriert
      webSocketFactory: () => new SockJS(sockUrl),
      connectHeaders: {
        Authorization: `Bearer ${token}`,
      },
      debug: (msg) => console.log("[STOMP]", msg),
      reconnectDelay: 5000, // 5s Backoff
      heartbeatIncoming: 15000,
      heartbeatOutgoing: 15000,
      onConnect: () => {
        console.log("[STOMP] connected");
        this.connected = true;
        this.connecting = false;
        this.resubscribeAll();
      },
      onDisconnect: () => {
        console.log("[STOMP] disconnected");
        this.connected = false;
        this.connecting = false;
      },
      onStompError: (frame) => {
        console.warn("[STOMP] error", frame.headers["message"], frame.body);
        this.connected = false;
        this.connecting = false;
      },
      onWebSocketClose: () => {
        console.warn("[STOMP] websocket closed");
        this.connected = false;
        this.connecting = false;
      },
      onWebSocketError: (evt) => {
        console.warn("[STOMP] websocket error", evt);
      },
    });

    this.client.activate();
  }

  private resubscribeAll() {
    if (!this.client || !this.client.connected) return;

    for (const [id, meta] of this.subscriptions.entries()) {
      const stompSub = this.client.subscribe(
        meta.destination,
        (msg: IMessage) => this.handleMessage(id, msg)
      );
      meta.stompSub = stompSub;
    }
  }

  subscribe(destination: string, cb: SubscriptionCallback): Subscription {
    const id = "sub-" + Math.random().toString(36).slice(2);
    this.subscriptions.set(id, { cb, destination });

    if (this.client?.connected) {
      const stompSub = this.client.subscribe(destination, (msg: IMessage) =>
        this.handleMessage(id, msg)
      );
      const meta = this.subscriptions.get(id);
      if (meta) meta.stompSub = stompSub;
    } else if (this.token) {
      this.connect(this.token);
    }

    return {
      id,
      unsubscribe: () => {
        const meta = this.subscriptions.get(id);
        meta?.stompSub?.unsubscribe();
        this.subscriptions.delete(id);
      },
    };
  }

  send(destination: string, body: any) {
    if (!this.client?.connected) return;
    this.client.publish({ destination, body: JSON.stringify(body) });
  }

  private handleMessage(id: string, msg: IMessage) {
    const meta = this.subscriptions.get(id);
    if (!meta) return;
    try {
      const json = msg.body ? JSON.parse(msg.body) : null;
      meta.cb(json);
    } catch (err) {
      console.error("[STOMP] JSON parse error", err);
    }
  }

  disconnect() {
    this.subscriptions.forEach((meta) => meta.stompSub?.unsubscribe());
    this.subscriptions.clear();
    this.connected = false;
    this.connecting = false;
    this.token = null;
    this.client?.deactivate();
    this.client = null;
  }
}

const wsInstance = WebSocketManager.getInstance();

const ensureConnected = (token: string) => {
  if (!wsInstance.isConnected()) {
    wsInstance.connect(token);
  }
};

export function subscribeUserMessages(
  token: string,
  onMessage: (payload: any) => void,
  onError?: () => void
) {
  try {
    ensureConnected(token);
    const sub = wsInstance.subscribe(`/user/queue/messages`, onMessage);
    return {
      disconnect: () => sub.unsubscribe(),
    };
  } catch (err) {
    onError?.();
    return { disconnect: () => {} };
  }
}

export function subscribeUserRequests(
  token: string,
  onMessage: (payload: any) => void,
  onError?: () => void
) {
  try {
    ensureConnected(token);
    const sub = wsInstance.subscribe(`/user/queue/requests`, onMessage);
    return {
      disconnect: () => sub.unsubscribe(),
    };
  } catch (err) {
    onError?.();
    return { disconnect: () => {} };
  }
}

export function subscribeUserAssignments(
  token: string,
  onMessage: (payload: any) => void,
  onError?: () => void
) {
  try {
    ensureConnected(token);
    const sub = wsInstance.subscribe(`/user/queue/assignments`, onMessage);
    return {
      disconnect: () => sub.unsubscribe(),
    };
  } catch (err) {
    onError?.();
    return { disconnect: () => {} };
  }
}

export const wsClient = WebSocketManager.getInstance();
export const disconnectWebSocket = () => {
  wsInstance.disconnect();
};

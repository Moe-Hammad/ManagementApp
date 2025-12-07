const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

type SubscriptionCallback = (payload: any) => void;

export type Subscription = {
  id: string;
  unsubscribe: () => void;
};

/**
 * 🔥 Globaler WebSocket STOMP-Client (1 Connection für alles!)
 */
class WebSocketManager {
  private static instance: WebSocketManager;

  private ws: WebSocket | null = null;
  private token: string | null = null;

  private subscriptions: Map<
    string,
    { cb: SubscriptionCallback; destination: string }
  > = new Map();
  private heartbeatInterval?: ReturnType<typeof setInterval>;
  private reconnectTimeout?: ReturnType<typeof setTimeout>;

  private connected = false;
  private reconnectAttempts = 0;

  public isConnected() {
    return this.connected;
  }

  public static getInstance() {
    if (!WebSocketManager.instance) {
      WebSocketManager.instance = new WebSocketManager();
    }
    return WebSocketManager.instance;
  }

  /**
   * Verbinden
   */
  connect(token: string) {
    this.token = token;

    const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws";
    this.ws = new WebSocket(wsUrl);

    this.ws.onopen = () => {
      this.connected = true;
      this.reconnectAttempts = 0;

      // CONNECT Frame senden
      this.sendFrame("CONNECT", {
        "accept-version": "1.2",
        host: wsUrl,
        Authorization: `Bearer ${token}`,
        // Client/Server Heartbeat: alle 15 Sekunden
        "heart-beat": "15000,15000",
      });

      // Heartbeat starten
      this.startHeartbeat();

      // Alle Subscriptions erneut anmelden
      this.resubscribeAll();
    };

    this.ws.onclose = () => {
      this.connected = false;
      this.scheduleReconnect();
    };

    this.ws.onerror = () => {
      this.connected = false;
      this.scheduleReconnect();
    };

    this.ws.onmessage = (event) => {
      const frame = this.parseFrame(event.data);

      if (!frame) return;

      if (frame.command === "MESSAGE") {
        const subId = frame.headers.subscription;
        const meta = this.subscriptions.get(subId);

        if (meta && frame.body) {
          try {
            const json = JSON.parse(frame.body);
            meta.cb(json);
          } catch (err) {
            console.error("WS JSON Parse Error", err);
          }
        }
      }
    };
  }

  /**
   * Abonnieren eines Themas
   */
  subscribe(destination: string, cb: SubscriptionCallback): Subscription {
    const id = "sub-" + Math.random().toString(36).slice(2);
    this.subscriptions.set(id, { cb, destination });

    if (this.connected) {
      this.sendFrame("SUBSCRIBE", { id, destination });
    }

    return {
      id,
      unsubscribe: () => {
        this.subscriptions.delete(id);
        if (this.connected) {
          this.sendFrame("UNSUBSCRIBE", { id });
        }
      },
    };
  }

  /**
   * Nachrichten senden
   */
  send(destination: string, body: any) {
    if (!this.connected) return;
    this.sendFrame("SEND", { destination }, JSON.stringify(body));
  }

  /**
   * STOMP Frame senden
   */
  private sendFrame(
    command: string,
    headers: Record<string, string>,
    body: string = ""
  ) {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) return;

    const headerString = Object.entries(headers)
      .map(([k, v]) => `${k}:${v}`)
      .join("\n");

    const frame = `${command}\n${headerString}\n\n${body}\0`;

    this.ws.send(frame);
  }

  /**
   * Heartbeat (Ping alle 15 Sekunden)
   */
  private startHeartbeat() {
    if (this.heartbeatInterval) clearInterval(this.heartbeatInterval);

    this.heartbeatInterval = setInterval(() => {
      if (this.ws && this.ws.readyState === WebSocket.OPEN) {
        // STOMP Heartbeat: einfaches LF senden (kein eigenes PING-Kommando!)
        this.ws.send("\n");
      }
    }, 15000);
  }

  /**
   * Reconnect Strategie (exponential backoff)
   */
  private scheduleReconnect() {
    if (this.reconnectTimeout) return;

    const delay = Math.min(1000 * 2 ** this.reconnectAttempts, 30000);
    this.reconnectAttempts++;

    this.reconnectTimeout = setTimeout(() => {
      this.connect(this.token!);
      this.reconnectTimeout = undefined;
    }, delay);
  }

  /**
   * Subscriptions nach Reconnect neu anmelden
   */
  private resubscribeAll() {
    for (const [id, meta] of this.subscriptions.entries()) {
      this.sendFrame("SUBSCRIBE", {
        id,
        destination: meta.destination,
      });
    }
  }

  /**
   * STOMP Frame parser
   */
  private parseFrame(raw: string) {
    if (!raw) return null;

    const [head, bodyWithNull] = raw.split("\n\n");
    const body = bodyWithNull?.replace(/\0+$/, "") ?? "";

    const lines = head.split("\n").filter(Boolean);
    const command = lines.shift() ?? "";

    const headers: Record<string, string> = {};
    lines.forEach((line) => {
      const i = line.indexOf(":");
      if (i !== -1) {
        headers[line.slice(0, i)] = line.slice(i + 1);
      }
    });

    return { command, headers, body };
  }
}

const manager = WebSocketManager.getInstance();

const ensureConnected = (token: string) => {
  if (!manager.isConnected()) {
    manager.connect(token);
  }
};

export function subscribeUserMessages(
  token: string,
  userId: string,
  onMessage: (payload: any) => void,
  onError?: () => void
) {
  try {
    ensureConnected(token);
    const sub = manager.subscribe(`/user/queue/messages`, onMessage);
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
    const sub = manager.subscribe(`/user/queue/requests`, onMessage);
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
    const sub = manager.subscribe(`/user/queue/assignments`, onMessage);
    return {
      disconnect: () => sub.unsubscribe(),
    };
  } catch (err) {
    onError?.();
    return { disconnect: () => {} };
  }
}

export const wsClient = WebSocketManager.getInstance();

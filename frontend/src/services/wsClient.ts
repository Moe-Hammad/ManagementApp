const API_BASE_URL = process.env.EXPO_PUBLIC_BACKEND_URL || "";

type StompSubscription = {
  disconnect: () => void;
};

type StompMessageHandler = (payload: any) => void;

// Minimal STOMP 1.2 client for one subscription (/topic/requests)
export function subscribeRequestsTopic(
  token: string,
  onMessage: StompMessageHandler,
  onError?: (err: Error) => void
): StompSubscription {
  const wsUrl = API_BASE_URL.replace(/^http/, "ws") + "/ws";
  const ws = new WebSocket(wsUrl);

  const sendFrame = (
    command: string,
    headers: Record<string, string> = {},
    body = ""
  ) => {
    const headerString = Object.entries(headers)
      .map(([k, v]) => `${k}:${v}`)
      .join("\n");
    const frame = `${command}\n${headerString}\n\n${body}\0`;
    ws.send(frame);
  };

  ws.onopen = () => {
    sendFrame("CONNECT", {
      "accept-version": "1.2",
      host: wsUrl,
      Authorization: `Bearer ${token}`,
    });
    sendFrame("SUBSCRIBE", {
      id: "requests-sub",
      destination: "/topic/requests",
    });
  };

  ws.onerror = () => {
    onError?.(new Error("WebSocket error"));
  };

  ws.onclose = () => {
    onError?.(new Error("WebSocket closed"));
  };

  ws.onmessage = (event) => {
    const frame = parseStompFrame(typeof event.data === "string" ? event.data : "");
    if (frame?.command === "MESSAGE" && frame.body) {
      try {
        const payload = JSON.parse(frame.body);
        onMessage(payload);
      } catch (err) {
        onError?.(new Error("Failed to parse WS payload"));
      }
    }
  };

  return {
    disconnect: () => {
      try {
        sendFrame("DISCONNECT");
        ws.close();
      } catch {
        // ignore
      }
    },
  };
}

function parseStompFrame(raw: string): { command: string; headers: Record<string, string>; body: string } | null {
  if (!raw) return null;
  const [head, bodyWithNull] = raw.split("\n\n");
  const body = bodyWithNull?.replace(/\0+$/, "") ?? "";
  const lines = head.split("\n").filter(Boolean);
  const command = lines.shift() || "";
  const headers: Record<string, string> = {};
  lines.forEach((line) => {
    const idx = line.indexOf(":");
    if (idx > -1) {
      const key = line.slice(0, idx);
      const value = line.slice(idx + 1);
      headers[key] = value;
    }
  });
  return { command, headers, body };
}

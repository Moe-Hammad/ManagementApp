import { useWebSockets } from "@/src/screens/Inbox/hooks/useWebSockets";

/**
 * Bootstraps global WebSocket subscriptions for chats/requests.
 * Render once inside the authenticated tree.
 */
export default function WebSocketBridge() {
  useWebSockets();
  return null;
}

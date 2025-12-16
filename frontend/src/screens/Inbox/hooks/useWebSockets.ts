import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { upsertAssignment } from "@/src/redux/assignmentSlice";
import { addMessage, fetchChatRooms } from "@/src/redux/chatSlice";
import { upsertRequest } from "@/src/redux/requestSlice";
import {
  disconnectWebSocket,
  subscribeUserAssignments,
  subscribeUserMessages,
  subscribeUserRequests,
} from "@/src/services/wsClient";
import { ChatMessage } from "@/src/types/resources";
import { useEffect, useRef, useState } from "react";

/**
 * useWebSockets
 * ---------------------------------------------------------
 * Dieser Hook bündelt die gesamte WebSocket-Logik für:
 * - Live-Nachrichten (Chats)
 * - Live-Request-Updates (Manager/Employee-Requests)
 *
 * Warum existiert dieser Hook?
 * - WebSocket-Verbindungen sollen überall gleich verwaltet werden
 * - Statt doppelte useEffect-Blöcke in verschiedenen Hooks zu haben,
 *   gibt es eine zentrale Stelle, die beide Streams managed.
 * - Sehr hilfreich für: WS-Indikatoren, Reconnect, Logs, Debugging
 *
 * Verantwortlichkeiten:
 * - Verbindung zu beiden WebSocket-Streams aufbauen
 * - Nachrichten & Requests an Redux weiterleiten
 * - Verbindungsstatus verwalten (idle / connected / error)
 * - Beim Unmount sauber disconnecten
 *
 * @returns Ein Objekt mit:
 *  - wsMessagesStatus: Status des Chat-Message WebSockets
 *  - wsRequestsStatus: Status des Request WebSockets
 */
export function useWebSockets() {
  const dispatch = useAppDispatch();

  // ==== Auth-Daten ===========================================================
  const token = useAppSelector((s) => s.auth.token?.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const chatRooms = useAppSelector((s) => s.chat.rooms);
  const roomsRef = useRef(chatRooms);
  useEffect(() => {
    roomsRef.current = chatRooms;
  }, [chatRooms]);

  useEffect(() => {
    if (!token || !userId) {
      // aktive Subscriptions/Manager disconnecten
      disconnectWebSocket(); // o.ä. aus wsClient
      setWsMessagesStatus("idle");
      setWsRequestsStatus("idle");
      setWsAssignmentsStatus("idle");
    }
  }, [token, userId]);

  // ==== Verbindungstatus für beide WebSockets ================================
  const [wsMessagesStatus, setWsMessagesStatus] = useState<
    "idle" | "connected" | "error"
  >("idle");

  const [wsRequestsStatus, setWsRequestsStatus] = useState<
    "idle" | "connected" | "error"
  >("idle");
  const [wsAssignmentsStatus, setWsAssignmentsStatus] = useState<
    "idle" | "connected" | "error"
  >("idle");

  // ==== Messages WebSocket ===================================================
  useEffect(() => {
    if (!token || !userId) return;

    console.log("[WS][MESSAGES] subscribing", { userId });
    const ws = subscribeUserMessages(
      token,
      (payload) => {
        const msg = payload as ChatMessage;
        if (msg?.chatId) {
          dispatch(addMessage(msg));
          const exists = roomsRef.current.some((r) => r.id === msg.chatId);
          if (!exists) {
            dispatch(fetchChatRooms({ token }));
          }
        }
        setWsMessagesStatus("connected");
      },
      () => setWsMessagesStatus("error")
    );
    // Als verbunden markieren, sobald subscribed (nicht erst auf erste Nachricht warten)
    setWsMessagesStatus("connected");

    return () => {
      console.log("[WS][MESSAGES] disconnect");
      ws.disconnect();
      setWsMessagesStatus("idle");
    };
  }, [token, userId, dispatch]);

  // ==== Requests WebSocket ===================================================
  useEffect(() => {
    if (!token) return;

    console.log("[WS][REQUESTS] subscribing");
    const ws = subscribeUserRequests(
      token,
      (payload) => {
        if (payload?.payload) {
          console.log("[WS][REQUESTS] payload", payload);
          dispatch(upsertRequest(payload.payload));
        }
        setWsRequestsStatus("connected");
      },
      () => setWsRequestsStatus("error")
    );
    setWsRequestsStatus("connected");

    return () => {
      console.log("[WS][REQUESTS] disconnect");
      ws.disconnect();
      setWsRequestsStatus("idle");
    };
  }, [token, dispatch]);

  // ==== Assignments WebSocket ===============================================
  useEffect(() => {
    if (!token) return;

    console.log("[WS][ASSIGNMENTS] subscribing");
    const ws = subscribeUserAssignments(
      token,
      (payload) => {
        const dto = payload?.payload ?? payload;
        if (dto) {
          dispatch(upsertAssignment(dto));
        }
        setWsAssignmentsStatus("connected");
      },
      () => setWsAssignmentsStatus("error")
    );
    setWsAssignmentsStatus("connected");

    return () => {
      console.log("[WS][ASSIGNMENTS] disconnect");
      ws.disconnect();
      setWsAssignmentsStatus("idle");
    };
  }, [token, dispatch]);

  return {
    wsMessagesStatus,
    wsRequestsStatus,
    wsAssignmentsStatus,
  };
}

import { useChatPartner } from "@/src/hooks/useChatPartner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  addMessage,
  fetchMessagesForChat,
  sendChatMessage,
} from "@/src/redux/chatSlice";
import { subscribeUserMessages } from "@/src/services/wsClient";
import { ChatMessage, ChatRoom } from "@/src/types/resources";
import { useCallback, useEffect, useMemo } from "react";

/**
 * useChatView
 * --------------------------------------
 * B�ndelt die Chat-spezifische Logik f�r den Detail-Screen:
 * - Raum + Partner ermitteln
 * - Nachrichten laden / Polling
 * - WebSocket-Subscribe f�r neue Messages
 * - Nachricht senden
 */
export function useChatView(chatId?: string) {
  const dispatch = useAppDispatch();

  const token = useAppSelector((s) => s.auth.token?.token);
  const user = useAppSelector((s) => s.auth.user);
  const rooms = useAppSelector((s) => s.chat.rooms);
  const sending = useAppSelector((s) => s.chat.sending);
  const messages = useAppSelector(
    (s) => (chatId ? s.chat.messages[chatId] : undefined) ?? []
  );

  // Raum + Partner
  const room: ChatRoom | undefined = useMemo(
    () => rooms.find((r) => r.id === chatId),
    [rooms, chatId]
  );
  const { partner } = useChatPartner(room);

  // Erstladen
  useEffect(() => {
    if (token && chatId) {
      dispatch(fetchMessagesForChat({ chatId, token }));
    }
  }, [token, chatId, dispatch]);

  // Polling (Fallback f�r verpasste WS-Events)
  useEffect(() => {
    if (!token || !chatId) return;
    const interval = setInterval(() => {
      dispatch(fetchMessagesForChat({ chatId, token }));
    }, 2000);
    return () => clearInterval(interval);
  }, [token, chatId, dispatch]);

  // WS Subscribe f�r Nachrichten
  useEffect(() => {
    if (!token || !user?.id) return;

    const sub = subscribeUserMessages(
      token,
      user.id,
      (payload) => {
        const msg = payload as ChatMessage;
        if (msg?.chatId === chatId) {
          dispatch(addMessage(msg));
        }
      },
      () => {}
    );

    return () => sub.disconnect();
  }, [token, user?.id, chatId, dispatch]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!chatId || !text.trim() || !token) return;
      await dispatch(
        sendChatMessage({ chatId, text: text.trim(), token })
      ).unwrap();
    },
    [chatId, token, dispatch]
  );

  return {
    room,
    partner,
    user,
    messages,
    sending,
    handleSend,
  };
}

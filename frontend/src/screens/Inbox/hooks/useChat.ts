import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  addMessage,
  createDirectChat,
  fetchChatRooms,
  fetchMessagesForChat,
  sendChatMessage,
  setMessagesForChat,
  setRooms,
} from "@/src/redux/chatSlice";
import {
  loadChatMessages,
  loadChatRooms,
  saveChatMessages,
  saveChatRooms,
} from "@/src/services/chatCache";
import { subscribeUserMessages } from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { ChatMessage, ChatRoom, UserRole } from "@/src/types/resources";
import { useEffect, useMemo, useState } from "react";

/**
 * useChat
 * ---------------------------------------------------------
 * Dieser Hook kapselt alle Chat-bezogenen Funktionen und
 * Daten, die vorher im RequestsScreen verstreut lagen.
 *
 * Verantwortlichkeiten:
 * - Laden & Filtern von Chat-Räumen
 * - Nachrichten laden + WebSocket-Listener für neue Messages
 * - Nachricht senden
 * - Direkt-Chat starten
 * - Auswahl eines Chats / Entfernen der Auswahl
 * - Theme, Styles & UI-bezogene Zustände
 *
 * Warum existiert dieser Hook?
 * - Reduziert die Größe von RequestsScreen massiv
 * - Trennung zwischen UI (Komponenten) und Logik (Hooks)
 * - Wiederverwendbar & testbarer
 *
 * @returns Objekt mit:
 *  - chatState: alle berechneten Werte & UI-Daten für Chats
 *  - actions: Methoden zum Interagieren (selectChat, sendMessage usw.)
 */

export function useChat() {
  const dispatch = useAppDispatch();

  // ==== Theme / Styles ======================================================
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;

  // ==== Auth / User Info =====================================================
  const token = useAppSelector((s) => s.auth.token?.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const role = useAppSelector((s) => s.auth.user?.role);
  const isManager = role === UserRole.MANAGER;
  const isEmployee = role === UserRole.EMPLOYEE;

  // ==== Redux-Daten ==========================================================
  const chatRooms = useAppSelector((s) => s.chat.rooms);
  const messagesByChat = useAppSelector((s) => s.chat.messages);
  const loadingMessages = useAppSelector((s) => s.chat.loadingMessages);
  const sendingMessage = useAppSelector((s) => s.chat.sending);

  // ==== Lokale UI-Zustände ===================================================
  const [chatSearch, setChatSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

  /**
   * Filtert Chatrooms nach Suchwort.
   */
  const filteredRooms = useMemo(() => {
    if (!chatSearch.trim()) return chatRooms;

    return chatRooms.filter((r) =>
      (r.name || "").toLowerCase().includes(chatSearch.trim().toLowerCase())
    );
  }, [chatRooms, chatSearch]);

  /**
   * Liefert den aktuell ausgewählten Chatroom.
   */
  const selectedChat: ChatRoom | null = selectedChatId
    ? chatRooms.find((r) => r.id === selectedChatId) || null
    : null;

  /**
   * Nachrichten des ausgewählten Chats.
   */
  const selectedMessages: ChatMessage[] = selectedChatId
    ? messagesByChat[selectedChatId] || []
    : [];

  const isLoadingMessages = selectedChatId
    ? loadingMessages[selectedChatId]
    : false;

  // ==== WebSocket: Eingehende Nachrichten ====================================
  useEffect(() => {
    if (!token || !userId) return;

    const sub = subscribeUserMessages(
      token,
      (payload) => {
        const msg = payload as ChatMessage;
        if (msg?.chatId) {
          dispatch(addMessage(msg));
          const current = messagesByChat[msg.chatId] || [];
          const exists = current.some((m) => m.id === msg.id);
          const merged = exists ? current : [...current, msg];
          saveChatMessages(msg.chatId, merged);
        }
      },
      () => console.log("WS Error (messages)")
    );

    return () => sub.disconnect();
  }, [token, userId, dispatch]);

  // ==== Chat-Räume laden =====================================================
  useEffect(() => {
    if (!token) return;
    (async () => {
      const cached = await loadChatRooms();
      if (cached.length) {
        dispatch(setRooms(cached));
      }
      dispatch(fetchChatRooms({ token }))
        .unwrap()
        .then((rooms) => saveChatRooms(rooms))
        .catch(() => {});
    })();
  }, [token, dispatch]);

  // ==== Nachrichten laden bei Chat-Auswahl ===================================
  useEffect(() => {
    if (!token || !selectedChatId) return;
    (async () => {
      const cached = await loadChatMessages(selectedChatId);
      if (cached.length) {
        dispatch(
          setMessagesForChat({ chatId: selectedChatId, messages: cached })
        );
      }
      dispatch(fetchMessagesForChat({ chatId: selectedChatId, token }))
        .unwrap()
        .then((res) => saveChatMessages(res.chatId, res.messages))
        .catch(() => {});
    })();
  }, [selectedChatId, token, dispatch]);

  // ==== Actions ===============================================================
  const selectChat = (chatId: string) => {
    setSelectedChatId(chatId);
  };

  const clearSelection = () => {
    setSelectedChatId(null);
  };

  const sendMessage = async (text: string) => {
    if (!selectedChatId || !text.trim() || !token) return;

    try {
      await dispatch(
        sendChatMessage({
          chatId: selectedChatId,
          text: text.trim(),
          token,
        })
      ).unwrap();

    } catch (err: any) {
      console.warn(err.message || "Nachricht konnte nicht gesendet werden.");
    }
  };

  const startDirectChat = async (managerId: string, employeeId: string) => {
    if (!token) return;

    try {
      const chat = await dispatch(
        createDirectChat({ managerId, employeeId, token })
      ).unwrap();

      setSelectedChatId(chat.id);
    } catch (err: any) {
      console.warn(err.message || "Chat konnte nicht erstellt werden.");
    }
  };

  // ==== Rückgabe ==============================================================
  return {
    chatState: {
      chatRooms,
      filteredRooms,
      selectedChat,
      selectedMessages,
      isLoadingMessages,
      sendingMessage,
      palette,
      styles,
      role,
      isManager,
      isEmployee,
      chatSearch,
      selectedChatId,
    },
    actions: {
      setChatSearch,
      selectChat,
      clearSelection,
      sendMessage,
      startDirectChat,
    },
  };
}

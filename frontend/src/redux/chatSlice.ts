import {
  createDirectChatApi,
  listChats,
  listMessages,
  sendChatMessageApi,
} from "@/src/services/api";
import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ChatRoom } from "../types/resources";
import { RootState } from "./store";
import { clearToken } from "./authSlice";

type ChatState = {
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>;
  loadingRooms: boolean;
  loadingMessages: Record<string, boolean>;
  sending: boolean;
  error: string | null;
  unreadCounts: Record<string, number>;
};

const initialState: ChatState = {
  rooms: [],
  messages: {},
  loadingRooms: false,
  loadingMessages: {},
  sending: false,
  error: null,
  unreadCounts: {},
};

export const fetchChatRooms = createAsyncThunk<ChatRoom[], { token: string }>(
  "chat/fetchRooms",
  async ({ token }) => listChats(token)
);

export const fetchMessagesForChat = createAsyncThunk<
  { chatId: string; messages: ChatMessage[] },
  { chatId: string; token: string }
>("chat/fetchMessages", async ({ chatId, token }) => {
  const messages = await listMessages(chatId, token);
  return { chatId, messages };
});

export const createDirectChat = createAsyncThunk<
  ChatRoom,
  { managerId: string; employeeId: string; token: string }
>("chat/createDirect", async ({ managerId, employeeId, token }) =>
  createDirectChatApi(managerId, employeeId, token)
);

export const sendChatMessage = createAsyncThunk<
  { chatId: string; message: ChatMessage },
  { chatId: string; text: string; token: string }
>("chat/sendMessage", async ({ chatId, text, token }) => {
  const message = await sendChatMessageApi(chatId, text, token);
  return { chatId, message };
});

export const selectExistingDirectChat = (
  state: RootState,
  userId: string,
  partnerId: string
) => {
  return state.chat.rooms.find(
    (room) =>
      room.type === "DIRECT" &&
      room.memberIds.includes(userId) &&
      room.memberIds.includes(partnerId)
  );
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    clearChatState: () => initialState,
    upsertRoom(state, action: PayloadAction<ChatRoom>) {
      const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
      if (idx >= 0) {
        state.rooms[idx] = action.payload;
      } else {
        state.rooms.unshift(action.payload);
      }
    },
    addMessage(state, action: PayloadAction<ChatMessage>) {
      const { chatId } = action.payload;
      const current = state.messages[chatId] || [];
      const exists = current.some((m) => m.id === action.payload.id);
      state.messages[chatId] = exists
        ? current
        : [...current, action.payload];
    },
    bumpUnread(state, action: PayloadAction<string>) {
      const chatId = action.payload;
      state.unreadCounts[chatId] = (state.unreadCounts[chatId] || 0) + 1;
    },
    resetUnread(state, action: PayloadAction<string>) {
      const chatId = action.payload;
      state.unreadCounts[chatId] = 0;
    },
    moveRoomToTop(state, action: PayloadAction<string>) {
      const chatId = action.payload;
      const idx = state.rooms.findIndex((r) => r.id === chatId);
      if (idx > 0) {
        const [room] = state.rooms.splice(idx, 1);
        state.rooms.unshift(room);
      }
    },
    setMessagesForChat(
      state,
      action: PayloadAction<{ chatId: string; messages: ChatMessage[] }>
    ) {
      state.messages[action.payload.chatId] = action.payload.messages;
    },
    setRooms(state, action: PayloadAction<ChatRoom[]>) {
      state.rooms = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loadingRooms = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loadingRooms = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loadingRooms = false;
        state.error =
          action.error.message || "Chat-Räume konnten nicht geladen werden.";
      })
      .addCase(fetchMessagesForChat.pending, (state, action) => {
        state.loadingMessages[action.meta.arg.chatId] = true;
      })
      .addCase(fetchMessagesForChat.fulfilled, (state, action) => {
        state.loadingMessages[action.payload.chatId] = false;
        state.messages[action.payload.chatId] = action.payload.messages;
      })
      .addCase(fetchMessagesForChat.rejected, (state, action) => {
        const chatId = action.meta.arg.chatId;
        state.loadingMessages[chatId] = false;
        state.error =
          action.error.message || "Nachrichten konnten nicht geladen werden.";
      })
      .addCase(createDirectChat.fulfilled, (state, action) => {
        const idx = state.rooms.findIndex((r) => r.id === action.payload.id);
        if (idx >= 0) {
          state.rooms[idx] = action.payload;
        } else {
          state.rooms.unshift(action.payload);
        }
      })
      .addCase(sendChatMessage.pending, (state) => {
        state.sending = true;
      })
      .addCase(sendChatMessage.fulfilled, (state, action) => {
        state.sending = false;
        const { chatId, message } = action.payload;
        const current = state.messages[chatId] || [];
        const exists = current.some((m) => m.id === message.id);
        state.messages[chatId] = exists ? current : [...current, message];
      })
      .addCase(sendChatMessage.rejected, (state, action) => {
        state.sending = false;
        state.error =
          action.error.message || "Nachricht konnte nicht gesendet werden.";
      })
      .addCase(clearToken, () => initialState);
  },
});

export const {
  clearChatState,
  upsertRoom,
  addMessage,
  setRooms,
  setMessagesForChat,
} = chatSlice.actions;
export default chatSlice.reducer;

import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { ChatMessage, ChatRoom } from "../types/resources";

type ChatState = {
  rooms: ChatRoom[];
  messages: Record<string, ChatMessage[]>; // key: chatId
  loading: boolean;
  error: string | null;
};

const initialState: ChatState = {
  rooms: [],
  messages: {},
  loading: false,
  error: null,
};

// Platzhalter-Thunk (Backend noch offen)
export const fetchChatRooms = createAsyncThunk<ChatRoom[]>(
  "chat/fetchRooms",
  async () => {
    return [];
  }
);

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
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
      if (!state.messages[chatId]) {
        state.messages[chatId] = [];
      }
      state.messages[chatId].push(action.payload);
    },
    setRooms(state, action: PayloadAction<ChatRoom[]>) {
      state.rooms = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchChatRooms.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchChatRooms.fulfilled, (state, action) => {
        state.loading = false;
        state.rooms = action.payload;
      })
      .addCase(fetchChatRooms.rejected, (state, action) => {
        state.loading = false;
        state.error =
          action.error.message || "Chat-Räume konnten nicht geladen werden.";
      });
  },
});

export const { upsertRoom, addMessage, setRooms } = chatSlice.actions;
export default chatSlice.reducer;

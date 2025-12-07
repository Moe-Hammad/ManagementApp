import { ChatMessage, ChatRoom } from "@/src/types/resources";
import AsyncStorage from "@react-native-async-storage/async-storage";

const KEY_ROOMS = "chat_cache_rooms";
const KEY_MESSAGES_PREFIX = "chat_cache_messages_";

export async function saveChatRooms(rooms: ChatRoom[]) {
  try {
    await AsyncStorage.setItem(KEY_ROOMS, JSON.stringify(rooms));
  } catch (_) {
    // ignore cache errors
  }
}

export async function loadChatRooms(): Promise<ChatRoom[]> {
  try {
    const raw = await AsyncStorage.getItem(KEY_ROOMS);
    return raw ? (JSON.parse(raw) as ChatRoom[]) : [];
  } catch (_) {
    return [];
  }
}

export async function saveChatMessages(
  chatId: string,
  messages: ChatMessage[]
) {
  try {
    await AsyncStorage.setItem(
      `${KEY_MESSAGES_PREFIX}${chatId}`,
      JSON.stringify(messages)
    );
  } catch (_) {
    // ignore cache errors
  }
}

export async function loadChatMessages(chatId: string): Promise<ChatMessage[]> {
  try {
    const raw = await AsyncStorage.getItem(`${KEY_MESSAGES_PREFIX}${chatId}`);
    return raw ? (JSON.parse(raw) as ChatMessage[]) : [];
  } catch (_) {
    return [];
  }
}

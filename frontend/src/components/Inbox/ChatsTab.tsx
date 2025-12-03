import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { ChatMessage, ChatRoom } from "@/src/types/resources";
import { Dispatch, SetStateAction } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

type Props = {
  styles: ReturnType<typeof makeStyles>;
  palette: typeof DarkColors | typeof LightColors;
  filteredRooms: ChatRoom[];
  chatSearch: string;
  setChatSearch: Dispatch<SetStateAction<string>>;
  isManager: boolean;
  isEmployee: boolean;
  onStartChat: () => void;
  onSelectChat: (chatId: string) => void;
  selectedChatId: string | null;
  messagesByChat: Record<string, ChatMessage[] | undefined>;
};

export function ChatsTab({
  styles,
  palette,
  filteredRooms,
  chatSearch,
  setChatSearch,
  isManager,
  isEmployee,
  onStartChat,
  onSelectChat,
  selectedChatId,
  messagesByChat,
}: Props) {
  return (
    <View style={[styles.widget, styles.requestsBodyCard, { gap: 12 }]}>
      <View style={styles.requestsHeaderRow}>
        <Text style={styles.widgetTitle}>Chats</Text>
        {(isManager || isEmployee) && (
          <Pressable style={styles.requestsActionButton} onPress={onStartChat}>
            <Text style={styles.requestsActionText}>Chat starten</Text>
          </Pressable>
        )}
      </View>
      <TextInput
        style={styles.input}
        placeholder="Chats durchsuchen"
        value={chatSearch}
        onChangeText={setChatSearch}
        placeholderTextColor={palette.secondary}
        autoCapitalize="none"
      />
      {filteredRooms.length === 0 ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Keine Chats gefunden.
        </Text>
      ) : (
        filteredRooms.map((room) => {
          const msgs = messagesByChat[room.id] || [];
          const lastMsg = msgs.length > 0 ? msgs[msgs.length - 1] : null;
          const isActive = selectedChatId === room.id;
          return (
            <Pressable
              key={room.id}
              style={[
                styles.requestsRoomItem,
                { backgroundColor: palette.card },
                isActive && { borderColor: palette.primary, borderWidth: 1 },
              ]}
              onPress={() => onSelectChat(room.id)}
            >
              <Text style={[styles.text, { fontWeight: "600" }]}>
                {room.name || "Chat"}
              </Text>
              <Text
                style={[styles.text, styles.requestsNote]}
                numberOfLines={1}
              >
                {lastMsg?.text ||
                  room.lastMessagePreview ||
                  "Keine Nachrichten"}
              </Text>
            </Pressable>
          );
        })
      )}
    </View>
  );
}

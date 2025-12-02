import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { ChatRoom } from "@/src/types/resources";
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
        filteredRooms.map((room) => (
          <View key={room.id} style={styles.requestsRoomItem}>
            <Text style={styles.text}>{room.title}</Text>
            <Text style={[styles.text, styles.requestsNote]}>
              {room.lastMessagePreview || "Keine Nachrichten"}
            </Text>
          </View>
        ))
      )}
    </View>
  );
}

import { useChatPartner } from "@/src/hooks/useChatPartner";
import { ChatRoom } from "@/src/types/resources";
import { FlatList, Pressable, Text, View } from "react-native";

function ChatListItem({
  room,
  onOpenChat,
  styles,
  palette,
}: {
  room: ChatRoom;
  onOpenChat: (room: ChatRoom) => void;
  styles: any;
  palette: any;
}) {
  const { partner } = useChatPartner(room);

  const title =
    room.type === "DIRECT" && partner
      ? `${partner.firstName} ${partner.lastName}`
      : room.name || "Chat";

  return (
    <Pressable onPress={() => onOpenChat(room)} style={styles.chatListItem}>
      <View style={styles.chatListTextContainer}>
        <Text
          style={[
            styles.chatListTitle,
            { color: palette.text, fontWeight: "600" },
          ]}
        >
          {title}
        </Text>

        {room.lastMessagePreview && (
          <Text
            style={[styles.text, { color: palette.secondary }]}
            numberOfLines={1}
          >
            {room.lastMessagePreview}
          </Text>
        )}
      </View>
    </Pressable>
  );
}

/**
 * ChatListSimple
 * -----------------------------------------------------
 * Zeigt eine einfache, WhatsApp-ähnliche Chatliste an.
 * Nutzt useChatPartner(), um bei DIRECT-Chats automatisch
 * den Gesprächspartner zu ermitteln.
 */

export default function ChatList({
  chats,
  currentUserId,
  onOpenChat,
  styles,
  palette,
}: {
  chats: ChatRoom[];
  currentUserId: string;
  onOpenChat: (room: ChatRoom) => void;
  styles: any;
  palette: any;
}) {
  return (
    <FlatList
      data={chats}
      keyExtractor={(room) => room.id}
      renderItem={({ item }) => (
        <View style={styles.chatListItemWrapper}>
          <ChatListItem
            room={item}
            onOpenChat={onOpenChat}
            styles={styles}
            palette={palette}
          />
        </View>
      )}
      showsVerticalScrollIndicator={false}
      contentContainerStyle={styles.chatListContent}
      ListEmptyComponent={
        <Text style={[styles.text, styles.requestsNote]}>
          Keine Chats vorhanden.
        </Text>
      }
    />
  );
}

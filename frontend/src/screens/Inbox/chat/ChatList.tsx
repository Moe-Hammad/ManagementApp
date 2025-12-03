import { useChatPartner } from "@/src/hooks/useChatPartner";
import { ChatRoom } from "@/src/types/resources";
import { Pressable, Text, View } from "react-native";

/**
 * ChatListSimple
 * -----------------------------------------------------
 * Zeigt eine einfache, WhatsApp-ähnliche Chatliste an.
 * Nutzt useChatPartner(), um bei DIRECT-Chats automatisch
 * den Gesprächspartner zu ermitteln.
 *
 * Props:
 * - chats        → alle ChatRooms aus Redux
 * - currentUserId → aktuelle User-ID aus authSlice
 * - onOpenChat   → Handler zum Öffnen eines Chats
 * - styles       → globales Style-Objekt
 * - palette      → Theme-Farben
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
    <View style={{ marginTop: 10 }}>
      {chats.length === 0 ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Keine Chats vorhanden.
        </Text>
      ) : (
        chats.map((room) => {
          const { partner } = useChatPartner(room);

          /** Chat-Titel bestimmen */
          const title =
            room.type === "DIRECT" && partner
              ? `${partner.firstName} ${partner.lastName}`
              : room.name || "Chat";

          return (
            <Pressable
              key={room.id}
              onPress={() => onOpenChat(room)}
              style={styles.chatListItem}
            >
              <View style={{ flexDirection: "column", flex: 1 }}>
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
        })
      )}
    </View>
  );
}

import { useChatPartner } from "@/src/hooks/useChatPartner";
import { ChatRoom } from "@/src/types/resources";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";

export default function ChatHeader({
  room,
  styles,
}: {
  room: ChatRoom;
  styles: any;
}) {
  const router = useRouter();

  // Partner automatisch laden
  const { partner } = useChatPartner(room);

  return (
    <View style={styles.chatHeaderContainer}>
      {/* Back Button */}
      <Pressable
        style={styles.chatHeaderBackButton}
        onPress={() => router.replace("/(tabs)/Inbox")}
      >
        <Text style={styles.chatHeaderBackIcon}>←</Text>
      </Pressable>

      {/* Title (Partner Name) */}
      <View style={styles.chatHeaderCenter}>
        <Text style={styles.chatHeaderTitle}>
          {partner ? `${partner.firstName} ${partner.lastName}` : "Lade..."}
        </Text>

        {partner && (
          <Text style={styles.chatHeaderSubtitle}>
            {partner.role === "MANAGER" ? "Manager" : "Employee"}
          </Text>
        )}
      </View>

      {/* Right side optional */}
      <View style={styles.chatHeaderRight} />
    </View>
  );
}

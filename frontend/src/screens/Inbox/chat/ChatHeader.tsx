import { useChatPartner } from "@/src/hooks/useChatPartner";
import { useAppSelector } from "@/src/hooks/useRedux";
import { ChatRoom } from "@/src/types/resources";
import { useRouter } from "expo-router";
import { Pressable, Text, View } from "react-native";
import { useMemo } from "react";

export default function ChatHeader({
  room,
  styles,
  onShowMembers,
}: {
  room: ChatRoom;
  styles: any;
  onShowMembers?: () => void;
}) {
  const router = useRouter();
  const userMap = useAppSelector((s) => s.users.userMap);

  // Partner automatisch laden
  const { partner } = useChatPartner(room);

  const memberNames = useMemo(() => {
    return (room.memberIds || [])
      .map((id) => userMap[id])
      .filter(Boolean)
      .map((u: any) => `${u.firstName} ${u.lastName}`);
  }, [room.memberIds, userMap]);

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
      <Pressable
        style={styles.chatHeaderCenter}
        onPress={onShowMembers}
        disabled={!onShowMembers}
      >
        <Text style={styles.chatHeaderTitle} numberOfLines={1} ellipsizeMode="tail">
          {partner
            ? `${partner.firstName} ${partner.lastName}`
            : room.name || "Chat"}
        </Text>

        {memberNames.length > 0 ? (
          <Text style={styles.chatHeaderSubtitle} numberOfLines={1} ellipsizeMode="tail">
            {memberNames.join(", ")}
          </Text>
        ) : partner ? (
          <Text style={styles.chatHeaderSubtitle}>
            {partner.role === "MANAGER" ? "Manager" : "Employee"}
          </Text>
        ) : null}
      </Pressable>

      {/* Right side optional */}
      <View style={styles.chatHeaderRight} />
    </View>
  );
}

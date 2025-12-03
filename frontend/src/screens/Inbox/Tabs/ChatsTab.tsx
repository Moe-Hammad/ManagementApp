import { useOpenDirectChat } from "@/src/hooks/useOpenDirectChat";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchChatRooms } from "@/src/redux/chatSlice";
import { useRouter } from "expo-router";
import { useEffect } from "react";
import { Text, View } from "react-native";
import ChatList from "../chat/ChatList";

export default function ChatsTab({
  styles,
  palette,
}: {
  styles: any;
  palette: any;
}) {
  const dispatch = useAppDispatch();
  const router = useRouter();

  const token = useAppSelector((s) => s.auth.token?.token);
  const user = useAppSelector((s) => s.auth.user);
  const rooms = useAppSelector((s) => s.chat.rooms);
  const loading = useAppSelector((s) => s.chat.loadingRooms);

  const openDirectChat = useOpenDirectChat();

  useEffect(() => {
    if (token) dispatch(fetchChatRooms({ token }));
  }, [token]);

  const handleOpenChat = (roomId: string) => {
    router.push(`/Inbox/chat/${roomId}`);
  };

  const handleOpenDirectChat = async (targetId: string) => {
    const room = await openDirectChat(targetId);
    if (!room) return;

    router.push({
      pathname: "/Inbox/chat/[id]",
      params: { id: room.id },
    });
  };

  return (
    <View style={[styles.widget, { flex: 1 }]}>
      <Text style={styles.widgetTitle}>Chats</Text>

      {loading ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Chats werden geladen...
        </Text>
      ) : (
        <ChatList
          chats={rooms}
          currentUserId={user?.id ?? "User"}
          styles={styles}
          palette={palette}
          onOpenChat={(room) => handleOpenChat(room.id)}
        />
      )}
    </View>
  );
}

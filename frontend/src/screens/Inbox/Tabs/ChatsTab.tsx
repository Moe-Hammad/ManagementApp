import { useOpenDirectChat } from "@/src/hooks/useOpenDirectChat";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchChatRooms, setRooms } from "@/src/redux/chatSlice";
import EmployeePicker from "@/src/screens/Inbox/components/EmployeePicker";
import { Manager, UserRole } from "@/src/types/resources";
import { loadChatRooms } from "@/src/services/chatCache";
import { useRouter } from "expo-router";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";
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
  const [pickerVisible, setPickerVisible] = useState(false);
  const [hasTimedOut, setHasTimedOut] = useState(false);

  const isManager = user?.role === UserRole.MANAGER;
  const employees = useMemo(
    () => (isManager ? (user as Manager | undefined)?.employees ?? [] : []),
    [isManager, user]
  );

  // Load cached rooms immediately so the UI works offline.
  useEffect(() => {
    (async () => {
      const cached = await loadChatRooms();
      if (cached.length) {
        dispatch(setRooms(cached));
      }
    })();
  }, [dispatch]);

  useEffect(() => {
    if (token) dispatch(fetchChatRooms({ token }));
  }, [token, dispatch]);

  // Stop showing the loader if it spins too long (e.g. offline/timeout).
  useEffect(() => {
    if (!loading || rooms.length > 0) {
      setHasTimedOut(false);
      return;
    }
    const timer = setTimeout(() => setHasTimedOut(true), 8000);
    return () => clearTimeout(timer);
  }, [loading, rooms.length]);

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

  const handleNewChat = () => {
    if (isManager) {
      setPickerVisible(true);
    }
  };

  return (
    <View style={[styles.widget, styles.chatsContainer]}>
      <View style={styles.chatsHeaderRow}>
        <Text style={styles.widgetTitle}>Chats</Text>
        {isManager && (
          <Pressable style={styles.chatsNewButton} onPress={handleNewChat}>
            <Text style={styles.chatsNewButtonText}>Neuer Chat</Text>
          </Pressable>
        )}
      </View>

      {loading && rooms.length === 0 && !hasTimedOut ? (
        <Text style={[styles.text, styles.requestsNote]}>
          Chats werden geladen...
        </Text>
      ) : hasTimedOut && rooms.length === 0 ? (
        <View>
          <Text style={[styles.text, styles.requestsNote]}>
            Keine Chats geladen. Prüfe die Verbindung und versuche es erneut.
          </Text>
          <Pressable
            style={styles.chatsNewButton}
            onPress={() => token && dispatch(fetchChatRooms({ token }))}
          >
            <Text style={styles.chatsNewButtonText}>Erneut laden</Text>
          </Pressable>
        </View>
      ) : (
        <ChatList
          chats={rooms}
          currentUserId={user?.id ?? "User"}
          styles={styles}
          palette={palette}
          onOpenChat={(room) => handleOpenChat(room.id)}
        />
      )}

      <EmployeePicker
        visible={pickerVisible}
        onClose={() => setPickerVisible(false)}
        employees={employees}
        styles={styles}
      />
    </View>
  );
}

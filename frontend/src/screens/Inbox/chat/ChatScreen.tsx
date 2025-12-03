import { useChatPartner } from "@/src/hooks/useChatPartner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { fetchMessagesForChat, sendChatMessage } from "@/src/redux/chatSlice";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { ScrollView, Text, View } from "react-native";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

export default function ChatScreen({
  styles,
  palette,
}: {
  styles: any;
  palette: any;
}) {
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const token = useAppSelector((s) => s.auth.token?.token);
  const user = useAppSelector((s) => s.auth.user);
  const rooms = useAppSelector((s) => s.chat.rooms);
  const messages = useAppSelector((s) => s.chat.messages[id] || []);
  const sending = useAppSelector((s) => s.chat.sending);

  const scrollViewRef = useRef<ScrollView>(null);

  // ChatRoom finden
  const room = rooms.find((r) => r.id === id);

  // Partner (falls DIRECT-Chat)
  const { partner } = useChatPartner(room);

  useEffect(() => {
    if (token && id) {
      dispatch(fetchMessagesForChat({ chatId: id, token }));
    }
  }, [token, id]);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  const handleSend = (text: string) => {
    if (!text.trim()) return;
    dispatch(sendChatMessage({ chatId: id, text, token: token! }));
  };

  if (!room) {
    return (
      <View
        style={{
          flex: 1,
          justifyContent: "center",
          alignItems: "center",
        }}
      >
        <Text style={{ color: palette.text }}>Chat nicht gefunden.</Text>
      </View>
    );
  }

  return (
    <View style={{ flex: 1 }}>
      {/* HEADER */}
      <ChatHeader room={room} styles={styles} />

      {/* MESSAGES */}
      <ScrollView
        ref={scrollViewRef}
        style={{ flex: 1, padding: 12 }}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollViewRef.current?.scrollToEnd({ animated: true })
        }
      >
        {messages.length === 0 ? (
          <Text style={{ color: palette.secondary, opacity: 0.8 }}>
            Keine Nachrichten.
          </Text>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={user!.id}
              styles={styles}
            />
          ))
        )}
      </ScrollView>

      {/* INPUT */}
      <MessageInput
        onSend={handleSend}
        sending={sending}
        styles={styles}
        palette={palette}
      />
    </View>
  );
}

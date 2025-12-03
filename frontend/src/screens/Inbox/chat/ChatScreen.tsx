import { useChatPartner } from "@/src/hooks/useChatPartner";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  addMessage,
  fetchMessagesForChat,
  sendChatMessage,
} from "@/src/redux/chatSlice";
import { subscribeUserMessages } from "@/src/services/wsClient";
import { ChatMessage } from "@/src/types/resources";
import { useFocusEffect } from "@react-navigation/native";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useCallback, useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import ChatHeader from "./ChatHeader";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

const EMPTY_MESSAGES: ChatMessage[] = [];

export default function ChatScreen({
  styles,
  palette,
}: {
  styles: any;
  palette: any;
}) {
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const dispatch = useAppDispatch();
  const router = useRouter();

  const token = useAppSelector((s) => s.auth.token?.token);
  const user = useAppSelector((s) => s.auth.user);
  const rooms = useAppSelector((s) => s.chat.rooms);
  const messages = useAppSelector(
    (s) => (id ? s.chat.messages[id] : undefined) ?? EMPTY_MESSAGES
  );
  const sending = useAppSelector((s) => s.chat.sending);

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset =
    Platform.OS === "ios" ? insets.top + 56 : insets.top + 24;
  const bottomInset = insets.bottom || 0;

  // ChatRoom finden
  const room = rooms.find((r) => r.id === id);

  // Partner (falls DIRECT-Chat)
  const { partner } = useChatPartner(room);

  useEffect(() => {
    if (token && id) {
      dispatch(fetchMessagesForChat({ chatId: id, token }));
    }
  }, [token, id, dispatch]);

  useFocusEffect(
    useCallback(() => {
      if (token && id) {
        dispatch(fetchMessagesForChat({ chatId: id, token }));
      }
    }, [token, id, dispatch])
  );

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

  useEffect(() => {
    if (!token || !user?.id) return;

    const sub = subscribeUserMessages(
      token,
      user.id,
      (payload) => {
        const msg = payload as ChatMessage;
        if (msg?.chatId === id) {
          dispatch(addMessage(msg));
        }
      },
      () => {}
    );

    return () => sub.disconnect();
  }, [token, user?.id, id, dispatch]);

  useEffect(() => {
    if (!token || !id) return;
    const interval = setInterval(() => {
      dispatch(fetchMessagesForChat({ chatId: id, token }));
    }, 2000);
    return () => clearInterval(interval);
  }, [token, id, dispatch]);

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
    <KeyboardAvoidingView
      style={styles.chatFullScreenContainer}
      behavior={Platform.select({ ios: "padding", android: "height" })}
      keyboardVerticalOffset={keyboardOffset}
    >
      <ChatHeader room={room} styles={styles} />

      <View style={styles.chatBody}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatMessagesContainer}
          contentContainerStyle={[
            styles.chatMessagesContent,
            {
              paddingBottom: bottomInset + 8,
              flexGrow: 1,
              justifyContent: "flex-end",
            },
          ]}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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

        <MessageInput
          onSend={handleSend}
          sending={sending}
          styles={styles}
          palette={palette}
          bottomInset={bottomInset}
        />
      </View>
    </KeyboardAvoidingView>
  );
}

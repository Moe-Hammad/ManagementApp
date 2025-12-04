import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatView } from "../hooks/useChatView";
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
  const insets = useSafeAreaInsets();
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();

  const { room, user, messages, sending, handleSend } = useChatView(
    id as string
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset =
    Platform.OS === "ios" ? insets.top + 12 : insets.top + 24;
  const bottomInset = insets.bottom || 0;

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, [messages]);

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
              paddingBottom: bottomInset + 4,
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

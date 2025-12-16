import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  Text,
  View,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { useChatView } from "../hooks/useChatView";
import ChatHeader from "./ChatHeader";
import ChatMembersModal from "./ChatMembersModal";
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

  const { room, user, members, messages, sending, handleSend } = useChatView(
    id as string
  );

  const scrollViewRef = useRef<ScrollView>(null);
  const keyboardOffset = Platform.OS === "ios" ? 0 : 0;
  const bottomInset = insets.bottom || 0;
  const [keyboardHeight, setKeyboardHeight] = useState(0);
  const [showMembers, setShowMembers] = useState(false);

  useEffect(() => {
    scrollViewRef.current?.scrollToEnd({ animated: true });
  }, []);

  useEffect(() => {
    const showSub = Keyboard.addListener("keyboardDidShow", (e) => {
      setKeyboardHeight(e.endCoordinates.height || 0);
    });
    const hideSub = Keyboard.addListener("keyboardDidHide", () => {
      setKeyboardHeight(0);
    });
    return () => {
      showSub.remove();
      hideSub.remove();
    };
  }, []);

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
      behavior={Platform.select({
        ios: "height",
        android: "height",
      })}
      keyboardVerticalOffset={keyboardOffset}
    >
      <View style={styles.chatHeaderSticky}>
        <ChatHeader
          room={room}
          styles={styles}
          onShowMembers={() => setShowMembers(true)}
        />
      </View>

      <View style={styles.chatBody}>
        <ScrollView
          ref={scrollViewRef}
          style={styles.chatMessagesContainer}
          contentContainerStyle={[
            styles.chatMessagesContent,
            { paddingBottom: bottomInset + 8 },
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
          bottomPadding={bottomInset + 8}
        />
      </View>

      <ChatMembersModal
        visible={showMembers}
        onClose={() => setShowMembers(false)}
        title={room.name || "Chat"}
        members={members || []}
        styles={styles}
        palette={palette}
      />
    </KeyboardAvoidingView>
  );
}

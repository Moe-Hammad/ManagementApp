import { useChatPartner } from "@/src/hooks/useChatPartner";
import { ChatMessage, ChatRoom } from "@/src/types/resources";
import { useEffect, useRef } from "react";
import { Pressable, ScrollView, Text, View } from "react-native";
import MessageBubble from "./MessageBubble";
import MessageInput from "./MessageInput";

/**
 * ChatView — Vollbild Chat wie Instagram
 */
export default function ChatView({
  chat,
  messages,
  onBack,
  onSend,
  loading,
  sending,
  palette,
  styles,
  userId,
}: {
  chat: ChatRoom;
  messages: ChatMessage[];
  onBack: () => void;
  onSend: (text: string) => void;
  loading: boolean;
  sending: boolean;
  palette: any;
  styles: any;
  userId: string;
}) {
  // 🔥 Partner automatisch laden
  const { partner } = useChatPartner(chat);

  // 🔽 Scroll automatisch ans Ende
  const scrollRef = useRef<ScrollView>(null);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollToEnd({ animated: true });
    }
  }, [messages]);

  return (
    <View style={styles.chatFullScreenContainer}>
      {/* HEADER */}
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack} style={styles.chatHeaderBackButton}>
          <Text style={[styles.chatHeaderBackIcon, { color: palette.primary }]}>
            ←
          </Text>
        </Pressable>

        <View style={styles.chatHeaderCenter}>
          <Text style={styles.chatHeaderTitle}>
            {partner
              ? `${partner.firstName} ${partner.lastName}`
              : chat.name || "Chat"}
          </Text>

          {partner && (
            <Text style={styles.chatHeaderSubtitle}>
              {partner.role === "MANAGER" ? "Manager" : "Employee"}
            </Text>
          )}
        </View>

        <View style={{ width: 36 }} />
      </View>

      {/* MESSAGES */}
      <ScrollView
        ref={scrollRef}
        style={styles.chatMessagesContainer}
        showsVerticalScrollIndicator={false}
        onContentSizeChange={() =>
          scrollRef.current?.scrollToEnd({ animated: true })
        }
      >
        {loading ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Nachrichten werden geladen...
          </Text>
        ) : messages.length === 0 ? (
          <Text style={[styles.text, styles.requestsNote]}>
            Noch keine Nachrichten.
          </Text>
        ) : (
          messages.map((msg) => (
            <MessageBubble
              key={msg.id}
              message={msg}
              currentUserId={userId}
              styles={styles}
            />
          ))
        )}
      </ScrollView>

      {/* INPUT */}
      <MessageInput
        onSend={onSend}
        sending={sending}
        styles={styles}
        palette={palette}
      />
    </View>
  );
}

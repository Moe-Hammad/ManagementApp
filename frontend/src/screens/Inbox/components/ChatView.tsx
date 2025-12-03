import { Pressable, ScrollView, Text, View } from "react-native";
import MessageInput from "./MessageInput";

/**
 * ChatView — Vollbildmodus wie Instagram DMs
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
  chat: any;
  messages: any[];
  onBack: () => void;
  onSend: (text: string) => void;
  loading: boolean;
  sending: boolean;
  palette: any;
  styles: any;
  userId: string;
}) {
  return (
    <View style={styles.chatFullScreenContainer}>
      {/* HEADER */}
      <View style={styles.chatHeader}>
        <Pressable onPress={onBack}>
          <Text style={[styles.text, { color: palette.primary }]}>←</Text>
        </Pressable>

        <Text style={[styles.widgetTitle, { flex: 1, textAlign: "center" }]}>
          {chat.name || "Chat"}
        </Text>

        <View style={{ width: 24 }} />
      </View>

      {/* MESSAGES */}
      <ScrollView
        style={styles.chatMessagesContainer}
        showsVerticalScrollIndicator={false}
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
          messages.map((msg) => {
            const mine = msg.senderId === userId;

            return (
              <View
                key={msg.id}
                style={[
                  styles.chatMessageBubble,
                  mine ? styles.chatMessageMine : styles.chatMessageTheirs,
                ]}
              >
                <Text
                  style={{
                    color: mine ? "white" : palette.text,
                  }}
                >
                  {msg.text}
                </Text>

                <Text
                  style={[
                    styles.chatTimestamp,
                    { color: mine ? "#eee" : palette.secondary },
                  ]}
                >
                  {new Date(msg.createdAt).toLocaleTimeString()}
                </Text>
              </View>
            );
          })
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

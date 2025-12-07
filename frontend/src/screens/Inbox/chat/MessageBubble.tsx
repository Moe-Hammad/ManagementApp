import { useUser } from "@/src/hooks/useUser";
import { ChatMessage } from "@/src/types/resources";
import { Text, View } from "react-native";

export default function MessageBubble({
  message,
  currentUserId,
  styles,
}: {
  message: ChatMessage;
  currentUserId: string;
  styles: any;
}) {
  // Sender automatisch laden
  const sender = useUser(message.senderId);

  const isOwn = message.senderId === currentUserId;

  return (
    <View
      style={[
        styles.messageRow,
        isOwn ? styles.messageRowRight : styles.messageRowLeft,
      ]}
    >
      <View
        style={[
          styles.messageBubble,
          isOwn ? styles.messageBubbleOwn : styles.messageBubbleOther,
        ]}
      >
        {/* Sender Name (nur wenn nicht eigene Message) */}
        {!isOwn && sender && (
          <Text style={styles.messageSender}>
            {sender.firstName} {sender.lastName}
          </Text>
        )}

        {/* Message Text */}
        <Text style={styles.messageText}>{message.text}</Text>

        {/* Timestamp (optional später schöner formatieren) */}
        <Text style={styles.messageTime}>
          {new Date(message.createdAt).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </Text>
      </View>
    </View>
  );
}

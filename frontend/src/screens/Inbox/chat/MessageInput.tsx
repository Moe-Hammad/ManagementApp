import { useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

/**
 * MessageInput
 * ---------------------------------------------------------
 * Eingabefeld + Senden-Button für den Chat.
 *
 * Verantwortlichkeiten:
 * - Nutzer kann eine Nachricht tippen
 * - Nachricht wird über onSend() an die Chat-Logik übergeben
 * - Optisches Verhalten wie Instagram/WhatsApp
 *
 * Warum existiert diese Komponente?
 * - Trennt UI vom Chat-Logic-Hook
 * - Hält ChatView schlank & readable
 *
 * @param onSend      Callback zum Senden (string)
 * @param sending     Bool: ob gerade eine Nachricht gesendet wird
 * @param styles      StyleSheet aus makeStyles()
 * @param palette     Farben aus ThemeProvider
 */
export default function MessageInput({
  onSend,
  sending,
  styles,
  palette,
  bottomInset = 0,
}: {
  onSend: (text: string) => void;
  sending: boolean;
  styles: any;
  palette: any;
  bottomInset?: number;
}) {
  const [text, setText] = useState("");

  const handleSend = () => {
    if (!text.trim() || sending) return;
    onSend(text);
    setText("");
  };

  return (
    <View
      style={[
        styles.chatInputContainer,
        bottomInset ? { paddingBottom: bottomInset } : null,
      ]}
    >
      {/* Eingabefeld */}
      <TextInput
        style={styles.chatInputField}
        placeholder="Nachricht schreiben..."
        placeholderTextColor={palette.secondary}
        value={text}
        onChangeText={setText}
      />

      {/* Senden Button */}
      <Pressable
        onPress={handleSend}
        disabled={sending}
        style={[styles.chatSendButton, sending && { opacity: 0.5 }]}
      >
        <Text style={styles.chatSendText}>Senden</Text>
      </Pressable>
    </View>
  );
}

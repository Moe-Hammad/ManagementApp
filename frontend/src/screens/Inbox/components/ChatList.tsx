import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

/**
 * ChatList
 * ---------------------------------------------------------
 * Zeigt die Liste aller Chat-Räume an, inkl. Suchfeld.
 *
 * Verantwortlichkeiten:
 * - Suchfeld für Chats
 * - Anzeige aller Chatrooms
 * - Hervorheben des aktuell aktiven/ausgewählten Rooms
 * - Starten eines neuen Chats (nur für Manager/Employee je nach Logik)
 *
 * Warum existiert diese Komponente?
 * - Trennt UI klar von der Chatlogik in useChat()
 * - Macht RequestsScreen deutlich übersichtlicher
 * - Wiederverwendbar für andere Screens
 *
 * @param filteredRooms       Liste der Chatrooms nach Filterung
 * @param chatSearch          Such-Text
 * @param setChatSearch       Funktion zum Setzen des Suchtexts
 * @param onSelect            Callback, wenn ein Chat ausgewählt wird
 * @param onStartChat         Callback für den "Neuer Chat" Button
 * @param selectedChatId      ID des aktuell ausgewählten Chats
 * @param styles              Style-Objekt aus makeStyles()
 * @param palette             Farbpalette (Light/Dark)
 */
export default function ChatList({
  filteredRooms,
  chatSearch,
  setChatSearch,
  onSelect,
  onStartChat,
  selectedChatId,
  styles,
  palette,
}: {
  filteredRooms: any[];
  chatSearch: string;
  setChatSearch: (v: string) => void;
  onSelect: (id: string) => void;
  onStartChat: () => void;
  selectedChatId: string | null;
  styles: any;
  palette: any;
}) {
  return (
    <View style={[styles.widget, styles.requestsBodyCard]}>
      {/* === Header ======================================================= */}
      <View
        style={{
          flexDirection: "row",
          justifyContent: "space-between",
          marginBottom: 8,
          alignItems: "center",
        }}
      >
        <Text style={styles.widgetTitle}>Chats</Text>

        <Pressable style={styles.requestsActionButton} onPress={onStartChat}>
          <Text style={styles.requestsActionText}>Neu</Text>
        </Pressable>
      </View>

      {/* === Search Field ================================================= */}
      <TextInput
        style={[styles.input, { marginBottom: 12 }]}
        placeholder="Chat suchen..."
        placeholderTextColor={palette.secondary}
        value={chatSearch}
        onChangeText={setChatSearch}
      />

      {/* === Chat Room List =============================================== */}
      <ScrollView
        style={{ maxHeight: 350 }}
        showsVerticalScrollIndicator={false}
      >
        {filteredRooms.length === 0 ? (
          <Text style={[styles.text, { textAlign: "center", marginTop: 20 }]}>
            Keine Chats gefunden.
          </Text>
        ) : (
          filteredRooms.map((room) => {
            const isActive = room.id === selectedChatId;

            return (
              <Pressable
                key={room.id}
                onPress={() => onSelect(room.id)}
                style={[
                  styles.requestsRoomItem,
                  {
                    backgroundColor: isActive
                      ? palette.primary
                      : palette.surface,
                  },
                ]}
              >
                <Text
                  style={{
                    color: isActive ? "white" : palette.text,
                    fontWeight: isActive ? "bold" : "500",
                  }}
                >
                  {room.name || "Chat"}
                </Text>

                <Text
                  style={[
                    styles.requestsNote,
                    {
                      color: isActive ? "white" : palette.secondary,
                    },
                  ]}
                >
                  {room.lastMessage
                    ? String(room.lastMessage.text).slice(0, 30) + "..."
                    : "Keine Nachrichten"}
                </Text>
              </Pressable>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

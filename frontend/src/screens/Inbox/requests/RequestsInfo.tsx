import { Text, View } from "react-native";

/**
 * RequestsInfo
 * ---------------------------------------------------------
 * Anzeige der Kopfzeile für den Inbox-Bereich:
 * - Titel "Inbox"
 * - Untertitel "Live Requests und Chats (WebSocket)"
 * - WebSocket-Statuspunkt (rot / gelb / grün)
 *
 * Verantwortlichkeiten:
 * - Visuelles Feedback für WebSocket-Verbindung
 * - Kleiner, wiederverwendbarer Header-Baustein
 *
 * Warum existiert diese Komponente?
 * - Entlastet den Screen vom Layout
 * - Einheitliche Darstellung des WS-Status
 * - Kombiniert Text + Status-Indicator sauber
 *
 * @param wsRequestsStatus WebSocket-Status für Requests
 * @param wsMessagesStatus WebSocket-Status für Messages (optional)
 * @param styles           Globales StyleSheet aus makeStyles()
 */
export default function RequestsInfo({
  wsRequestsStatus,
  wsMessagesStatus,
  styles,
}: {
  wsRequestsStatus: "idle" | "connected" | "error";
  wsMessagesStatus?: "idle" | "connected" | "error";
  styles: any;
}) {
  // WS-Status wird kombiniert (wenn einer connected ist → connected)
  const combined =
    wsRequestsStatus === "connected" || wsMessagesStatus === "connected"
      ? "connected"
      : wsRequestsStatus === "error" || wsMessagesStatus === "error"
      ? "error"
      : "idle";

  // Farbe des Statuspunkts
  const dotColor =
    combined === "connected"
      ? "green"
      : combined === "error"
      ? "yellow"
      : "red";

  return (
    <View>
      <Text style={[styles.titles, styles.requestsTitle]}>Inbox</Text>

      <View style={styles.requestsBadgeRow}>
        <Text style={[styles.text, styles.requestsSubtitle]}>
          Live Requests und Chats (WebSocket)
        </Text>

        {/* Statuspunkt */}
        <View
          style={[
            styles.requestsBadge,
            {
              backgroundColor: dotColor,
            },
          ]}
        />
      </View>
    </View>
  );
}

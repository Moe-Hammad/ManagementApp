import { makeStyles } from "@/src/theme/styles";
import { Text, View } from "react-native";

type Props = {
  styles: ReturnType<typeof makeStyles>;
  wsStatus: "idle" | "connected" | "error";
};

export function RequestsTab({ styles, wsStatus }: Props) {
  return (
    <View style={[styles.widget, styles.requestsBodyCard]}>
      <Text style={styles.widgetTitle}>Requests (live)</Text>
      <View>
        <Text style={[styles.text, styles.requestsNote]}>
          Hier erscheinen eingehende Anfragen. Wir binden gleich den WebSocket
          an und nutzen dein Request-Slice.
        </Text>
        <Text style={[styles.text, styles.requestsNote]}>
          Status: {wsStatus === "connected" ? "verbunden" : wsStatus}
        </Text>
      </View>
    </View>
  );
}

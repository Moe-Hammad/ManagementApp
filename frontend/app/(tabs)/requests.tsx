import ScreenController from "@/src/components/util/ScreenController";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { upsertRequest } from "@/src/redux/requestSlice";
import { subscribeRequestsTopic } from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { useEffect, useState } from "react";
import { Pressable, Text, View } from "react-native";

const TABS = [
  { key: "chats", label: "Chats" },
  { key: "requests", label: "Requests" },
];

export default function RequestsScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token?.token);
  const [activeTab, setActiveTab] = useState<string>("chats");
  const [wsStatus, setWsStatus] = useState<"idle" | "connected" | "error">(
    "idle"
  );

  const isRequests = activeTab === "requests";

  useEffect(() => {
    if (!token) return;

    const subscription = subscribeRequestsTopic(
      token,
      (payload) => {
        if (payload?.payload) {
          dispatch(upsertRequest(payload.payload));
        }
        setWsStatus("connected");
      },
      () => setWsStatus("error")
    );

    return () => {
      subscription.disconnect();
      setWsStatus("idle");
    };
  }, [token, dispatch]);

  return (
    <ScreenController scroll>
      <View style={[styles.screen, styles.requestsContainer]}>
        <Text style={[styles.titles, styles.requestsTitle]}>Inbox</Text>
        <View style={styles.requestsBadgeRow}>
          <Text style={[styles.text, styles.requestsSubtitle]}>
            Live Requests und Chats (WebSocket)
          </Text>
          {token && <View style={styles.requestsBadge} />}
        </View>

        <View style={styles.requestsSegmentRow}>
          {TABS.map((tab) => {
            const isActive = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.requestsSegmentTab,
                  isActive
                    ? styles.requestsSegmentTabActive
                    : styles.requestsSegmentTabInactive,
                ]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Text
                  style={[
                    styles.requestsSegmentText,
                    isActive && styles.requestsSegmentTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        <View style={[styles.widget, styles.requestsBodyCard]}>
          {isRequests ? (
            <>
              <Text style={styles.widgetTitle}>Requests (live)</Text>
              <View>
                <Text style={[styles.text, styles.requestsNote]}>
                  Hier erscheinen eingehende Anfragen. Wir binden gleich den
                  WebSocket an und nutzen dein Request-Slice.
                </Text>
                <Text style={[styles.text, styles.requestsNote]}>
                  Status: {wsStatus === "connected" ? "verbunden" : wsStatus}
                </Text>
              </View>
            </>
          ) : (
            <>
              <Text style={styles.widgetTitle}>Chats (live)</Text>
              <Text style={[styles.text, styles.requestsNote]}>
                Chat-Nachrichten werden hier gestreamt, sobald der WS-Client
                steht.
              </Text>
            </>
          )}
        </View>
      </View>
    </ScreenController>
  );
}

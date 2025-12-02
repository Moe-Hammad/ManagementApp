import ScreenController from "@/src/components/util/ScreenController";
import { ChatsTab } from "@/src/components/Inbox/ChatsTab";
import { RequestsTab } from "@/src/components/Inbox/RequestsTab";
import { SearchTab } from "@/src/components/Inbox/SearchTab";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { addMessage, upsertRoom } from "@/src/redux/chatSlice";
import {
  fetchUnassigned,
  selectUnassigned,
  upsertRequest,
} from "@/src/redux/requestSlice";
import {
  subscribeRequestsTopic,
  subscribeUserMessages,
} from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { ChatRoom, UserRole } from "@/src/types/resources";
import { useEffect, useMemo, useState } from "react";
import { Pressable, Text, View } from "react-native";

export default function RequestsScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token?.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const role = useAppSelector((s) => s.auth.user?.role);
  const isManager = role === UserRole.MANAGER;
  const isEmployee = role === UserRole.EMPLOYEE;
  const [activeTab, setActiveTab] = useState<string>("chats");
  const [wsStatus, setWsStatus] = useState<"idle" | "connected" | "error">(
    "idle"
  );
  const [chatSearch, setChatSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");

  const tabs = useMemo(() => {
    const base = [
      { key: "chats", label: "Chats" },
      { key: "requests", label: "Requests" },
    ];
    if (isManager) {
      base.push({ key: "search", label: "Search" });
    }
    return base;
  }, [isManager]);

  const isSearch = activeTab === "search";
  const isRequests = activeTab === "requests";
  const isChats = activeTab === "chats";
  const chatRooms = useAppSelector((s) => s.chat.rooms);
  const unassigned = useAppSelector(selectUnassigned);
  const filteredRooms = useMemo(() => {
    if (!chatSearch.trim()) return chatRooms;
    return chatRooms.filter((r) =>
      r.title.toLowerCase().includes(chatSearch.trim().toLowerCase())
    );
  }, [chatRooms, chatSearch]);

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

  useEffect(() => {
    if (!token || !userId) return;
    const sub = subscribeUserMessages(
      token,
      userId,
      (payload) => {
        if (payload?.room) {
          dispatch(upsertRoom(payload.room as ChatRoom));
        }
        if (payload?.message) {
          dispatch(addMessage(payload.message));
        }
        setWsStatus("connected");
      },
      () => setWsStatus("error")
    );
    return () => sub.disconnect();
  }, [token, userId, dispatch]);

  // Manager: Suche nach unassigned Employees
  useEffect(() => {
    if (!isManager || !token) return;
    const handler = setTimeout(() => {
      dispatch(fetchUnassigned({ query: employeeSearch.trim(), token }));
    }, 300);
    return () => clearTimeout(handler);
  }, [employeeSearch, isManager, token, dispatch]);

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
          {tabs.map((tab) => {
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

        {isRequests ? (
          <RequestsTab styles={styles} wsStatus={wsStatus} />
        ) : isChats ? (
          <ChatsTab
            styles={styles}
            palette={palette}
            filteredRooms={filteredRooms}
            chatSearch={chatSearch}
            setChatSearch={setChatSearch}
            isManager={isManager}
            isEmployee={isEmployee}
            onStartChat={() => {}}
          />
        ) : (
          <SearchTab
            styles={styles}
            palette={palette}
            isManager={isManager}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            unassigned={unassigned}
          />
        )}
      </View>
    </ScreenController>
  );
}

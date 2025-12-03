import { ChatsTab } from "@/src/components/Inbox/ChatsTab";
import { RequestsTab } from "@/src/components/Inbox/RequestsTab";
import { SearchTab } from "@/src/components/Inbox/SearchTab";
import ScreenController from "@/src/components/util/ScreenController";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import {
  addMessage,
  createDirectChat,
  fetchChatRooms,
  fetchMessagesForChat,
  sendChatMessage,
} from "@/src/redux/chatSlice";
import {
  fetchRequests,
  fetchUnassigned,
  selectRequests,
  upsertRequest,
  createRequest,
} from "@/src/redux/requestSlice";
import {
  subscribeUserRequests,
  subscribeUserMessages,
} from "@/src/services/wsClient";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import {
  ChatMessage,
  ChatRoom,
  Employee,
  Manager,
  RequestStatus,
  UserRole,
} from "@/src/types/resources";
import { useEffect, useMemo, useState } from "react";
import { Pressable, ScrollView, Text, TextInput, View } from "react-native";

export default function RequestsScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;
  const dispatch = useAppDispatch();
  const token = useAppSelector((s) => s.auth.token?.token);
  const userId = useAppSelector((s) => s.auth.user?.id);
  const user = useAppSelector((s) => s.auth.user);
  const role = useAppSelector((s) => s.auth.user?.role);
  const isManager = role === UserRole.MANAGER;
  const isEmployee = role === UserRole.EMPLOYEE;
  const [activeTab, setActiveTab] = useState<string>("chats");
  const [wsStatus, setWsStatus] = useState<"idle" | "connected" | "error">(
    "idle"
  );
  const [chatSearch, setChatSearch] = useState("");
  const [employeeSearch, setEmployeeSearch] = useState("");
  const [selectedChatId, setSelectedChatId] = useState<string | null>(null);
  const [messageText, setMessageText] = useState("");
  const [showEmployeePicker, setShowEmployeePicker] = useState(false);
  const [hasAutoSelected, setHasAutoSelected] = useState(false);

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
  const messagesByChat = useAppSelector((s) => s.chat.messages);
  const loadingMessages = useAppSelector((s) => s.chat.loadingMessages);
  const sendingMessage = useAppSelector((s) => s.chat.sending);
  const requests = useAppSelector(selectRequests);
  const unassigned = useAppSelector((s) => s.requests.unassigned);
  const managedEmployees: Employee[] = useMemo(() => {
    if (!isManager || !user) return [];
    const managerUser = user as Manager;
    return Array.isArray(managerUser.employees) ? managerUser.employees : [];
  }, [isManager, user]);

  const filteredRooms = useMemo(() => {
    if (!chatSearch.trim()) return chatRooms;
    return chatRooms.filter((r) =>
      (r.name || "").toLowerCase().includes(chatSearch.trim().toLowerCase())
    );
  }, [chatRooms, chatSearch]);

  const selectedChat: ChatRoom | null = selectedChatId
    ? chatRooms.find((r) => r.id === selectedChatId) || null
    : null;
  const selectedMessages: ChatMessage[] = selectedChatId
    ? messagesByChat[selectedChatId] || []
    : [];
  const isLoadingMessages = selectedChatId
    ? loadingMessages[selectedChatId]
    : false;

  useEffect(() => {
    if (!token) return;

    const subscription = subscribeUserRequests(
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
        const msg = payload as ChatMessage;
        if (msg?.chatId) {
          dispatch(addMessage(msg));
        }
        setWsStatus("connected");
      },
      () => setWsStatus("error")
    );
    return () => sub.disconnect();
  }, [token, userId, dispatch]);

  useEffect(() => {
    if (!token || !userId || !role) return;
    dispatch(fetchRequests({ userId, role, token }));
  }, [token, userId, role, dispatch]);

  useEffect(() => {
    if (!token) return;
    dispatch(fetchChatRooms({ token }));
  }, [token, dispatch]);

  useEffect(() => {
    if (!token || !selectedChatId) return;
    dispatch(fetchMessagesForChat({ chatId: selectedChatId, token }));
  }, [selectedChatId, token, dispatch]);

  useEffect(() => {
    if (!hasAutoSelected && !selectedChatId && chatRooms.length > 0) {
      setSelectedChatId(chatRooms[0].id);
      setHasAutoSelected(true);
    }
  }, [chatRooms, selectedChatId, hasAutoSelected]);

  // Manager: Suche nach unassigned Employees
  useEffect(() => {
    if (!isManager || !token) return;
    const handler = setTimeout(() => {
      dispatch(fetchUnassigned({ query: employeeSearch.trim(), token }));
    }, 300);
    return () => clearTimeout(handler);
  }, [employeeSearch, isManager, token, dispatch]);

  const approvedEmployeeIds = useMemo(() => {
    if (!userId) return [];
    return requests
      .filter(
        (r) =>
          r.status === RequestStatus.APPROVED &&
          r.managerId === userId &&
          !!r.employeeId
      )
      .map((r) => r.employeeId);
  }, [requests, userId]);

  const handleStartChat = () => {
    if (!token || !userId) return;
    if (isManager) {
      if (managedEmployees.length === 0 && approvedEmployeeIds.length === 0) {
        alert("Kein akzeptierter Mitarbeiter für einen Chat gefunden.");
        return;
      }
      setShowEmployeePicker(true);
      return;
    }
    if (isEmployee) {
      const managerId = (user as Employee | null | undefined)?.managerId;
      if (!managerId) {
        alert("Kein Manager zugeordnet, Chat kann nicht gestartet werden.");
        return;
      }
      dispatch(
        createDirectChat({ managerId, employeeId: userId, token: token! })
      )
        .unwrap()
        .then((chat) => setSelectedChatId(chat.id))
        .catch((err: any) =>
          alert(err.message || "Chat konnte nicht erstellt werden.")
        );
    }
  };

  const handlePickEmployee = (empId: string) => {
    if (!token || !userId) return;
    dispatch(
      createDirectChat({ managerId: userId, employeeId: empId, token })
    )
      .unwrap()
      .then((chat) => {
        setSelectedChatId(chat.id);
        setShowEmployeePicker(false);
      })
      .catch((err: any) =>
        alert(err.message || "Chat konnte nicht erstellt werden.")
      );
  };

  const handleSendMessage = async () => {
    if (!selectedChatId || !messageText.trim() || !token) return;
    try {
      await dispatch(
        sendChatMessage({
          chatId: selectedChatId,
          text: messageText.trim(),
          token,
        })
      ).unwrap();
      setMessageText("");
    } catch (err: any) {
      alert(err.message || "Nachricht konnte nicht gesendet werden.");
    }
  };

  const handleSendRequest = async (employeeId: string) => {
    if (!isManager || !token || !userId) {
      alert("Nur Manager mit Login können Anfragen senden.");
      return;
    }
    try {
      await dispatch(
        createRequest({ employeeId, managerId: userId, token })
      ).unwrap();
      alert("Anfrage gesendet.");
    } catch (err: any) {
      alert(err.message || "Anfrage konnte nicht gesendet werden.");
    }
  };

  const employeeOptions = useMemo(() => {
    if (!isManager) return [];
    const direct = managedEmployees;
    const fromRequests = approvedEmployeeIds
      .map((id) => direct.find((e) => e.id === id))
      .filter(Boolean) as Employee[];
    return Array.from(new Map([...direct, ...fromRequests].map((e) => [e.id, e]))).map(
      ([_id, val]) => val
    );
  }, [isManager, managedEmployees, approvedEmployeeIds]);

  return (
    <ScreenController scroll={false}>
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
          <>
            {!selectedChat ? (
              <ChatsTab
                styles={styles}
                palette={palette}
                filteredRooms={filteredRooms}
                chatSearch={chatSearch}
                setChatSearch={setChatSearch}
                isManager={isManager}
                isEmployee={isEmployee}
                onStartChat={handleStartChat}
                onSelectChat={setSelectedChatId}
                selectedChatId={selectedChatId}
                messagesByChat={messagesByChat}
              />
            ) : (
              <View style={[styles.widget, styles.requestsBodyCard, { gap: 12 }]}>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    justifyContent: "space-between",
                  }}
                >
                  <Pressable onPress={() => setSelectedChatId(null)}>
                    <Text style={[styles.text, { color: palette.primary }]}>← Chats</Text>
                  </Pressable>
                  <Text style={[styles.widgetTitle, { flex: 1, textAlign: "center" }]}>
                    {selectedChat.name || "Chat"}
                  </Text>
                  {(isManager || isEmployee) && (
                    <Pressable
                      style={styles.requestsActionButton}
                      onPress={handleStartChat}
                    >
                      <Text style={styles.requestsActionText}>Neu</Text>
                    </Pressable>
                  )}
                </View>
                <ScrollView
                  style={{ maxHeight: 320 }}
                  nestedScrollEnabled
                  showsVerticalScrollIndicator={false}
                >
                  {isLoadingMessages ? (
                    <Text style={[styles.text, styles.requestsNote]}>
                      Nachrichten werden geladen...
                    </Text>
                  ) : selectedMessages.length === 0 ? (
                    <Text style={[styles.text, styles.requestsNote]}>
                      Noch keine Nachrichten.
                    </Text>
                  ) : (
                    selectedMessages.map((m) => (
                      <View
                        key={m.id}
                        style={[
                          styles.requestsRoomItem,
                          {
                            alignItems: "flex-start",
                            backgroundColor:
                              m.senderId === userId ? palette.card : palette.surface,
                          },
                        ]}
                      >
                        <Text style={styles.text}>
                          {m.senderRole || "User"}: {m.text}
                        </Text>
                        <Text style={[styles.text, styles.requestsNote]}>
                          {new Date(m.createdAt).toLocaleString()}
                        </Text>
                      </View>
                    ))
                  )}
                </ScrollView>
                <View
                  style={{
                    flexDirection: "row",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  <TextInput
                    style={[styles.input, { flex: 1 }]}
                    placeholder="Nachricht schreiben..."
                    value={messageText}
                    onChangeText={setMessageText}
                    placeholderTextColor={palette.secondary}
                  />
                  <Pressable
                    style={[
                      styles.requestsActionButton,
                      sendingMessage && { opacity: 0.5 },
                    ]}
                    onPress={handleSendMessage}
                    disabled={sendingMessage}
                  >
                    <Text style={styles.requestsActionText}>Senden</Text>
                  </Pressable>
                </View>
              </View>
            )}

            {showEmployeePicker && (
              <View
                style={{
                  position: "absolute",
                  top: 0,
                  left: 0,
                  right: 0,
                  bottom: 0,
                  backgroundColor: "rgba(0,0,0,0.6)",
                  justifyContent: "center",
                  alignItems: "center",
                  padding: 16,
                }}
              >
                <View
                  style={[
                    styles.widget,
                    {
                      width: "100%",
                      maxHeight: "70%",
                      backgroundColor: palette.surface,
                    },
                  ]}
                >
                  <Text style={[styles.widgetTitle, { marginBottom: 8 }]}>
                    Wähle Employee
                  </Text>
                  <ScrollView>
                    {employeeOptions.map((emp) => (
                      <Pressable
                        key={emp.id}
                        onPress={() => handlePickEmployee(emp.id)}
                        style={{
                          paddingVertical: 12,
                          paddingHorizontal: 16,
                          borderBottomWidth: 1,
                          borderBottomColor: palette.secondary,
                        }}
                      >
                        <Text style={styles.text}>
                          {emp.firstName} {emp.lastName}
                        </Text>
                        <Text style={[styles.text, styles.requestsNote]}>
                          {emp.email}
                        </Text>
                      </Pressable>
                    ))}
                  </ScrollView>
                  <Pressable
                    onPress={() => setShowEmployeePicker(false)}
                    style={[
                      styles.requestsActionButton,
                      { marginTop: 12, alignSelf: "flex-end" },
                    ]}
                  >
                    <Text style={styles.requestsActionText}>Abbrechen</Text>
                  </Pressable>
                </View>
              </View>
            )}
          </>
        ) : (
          <SearchTab
            styles={styles}
            palette={palette}
            isManager={isManager}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            unassigned={unassigned}
            pendingRequests={requests}
            onRequest={handleSendRequest}
          />
        )}
      </View>
    </ScreenController>
  );
}

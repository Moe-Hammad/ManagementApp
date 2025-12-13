import ScreenController from "@/src/components/core/ScreenController";
import { useInboxTabs } from "@/src/screens/Inbox/hooks/useInboxTabs";
import { useRequests } from "@/src/screens/Inbox/hooks/useRequest";
import { useAssignments } from "@/src/screens/Inbox/hooks/useAssignments";
import ChatsTab from "@/src/screens/Inbox/Tabs/ChatsTab";
import RequestsTab from "@/src/screens/Inbox/Tabs/RequestsTab";
import SearchTab from "@/src/screens/Inbox/Tabs/SearchTab";
import { Employee, Manager } from "@/src/types/resources";
import { Modal, Pressable, Text, TextInput, View } from "react-native";
import { useState } from "react";

export default function InboxScreen() {
  const { requestsState, actions } = useRequests();
  const { assignments, acceptAssignment, declineAssignment } = useAssignments();
  const { activeTab, setActiveTab, tabs } = useInboxTabs();

  const {
    styles,
    palette,
    isManager,
    requests,
    pendingRequests,
    unassigned,
    employeeSearch,
    user,
    wsStatus,
  } = requestsState;

  const { setEmployeeSearch, sendRequest, acceptRequest, rejectRequest } =
    actions;
  const [requestModalVisible, setRequestModalVisible] = useState(false);
  const [requestMessage, setRequestMessage] = useState("");
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string | null>(
    null
  );

  const isChats = activeTab === "chats";
  const isRequests = activeTab === "requests";
  const isSearch = activeTab === "search";
  const wsUrlLabel = `${(process.env.EXPO_PUBLIC_BACKEND_URL || "").replace(
    /^http/,
    "ws"
  )}/ws`;
  const wsStateColor =
    wsStatus === "connected"
      ? "#27ae60"
      : wsStatus === "error"
      ? "#f1c40f"
      : "#e74c3c";

  return (
    <ScreenController scroll={false}>
      <View style={[styles.screen, styles.requestsContainer]}>
        {/* HEADER */}
        <Text style={[styles.titles, styles.requestsTitle]}>Inbox</Text>
        <View style={styles.wsStatusPill}>
          <View
            style={[styles.wsStatusDot, { backgroundColor: wsStateColor }]}
          />
          <Text style={styles.wsStatusText} numberOfLines={1}>
            {`WS: ${wsUrlLabel || "n/a"}`}
          </Text>
        </View>

        {/* INFO TEXT */}
        <Text style={[styles.text, styles.requestsSubtitle]}>
          Live Updates mit WebSockets
        </Text>

        {/* TABS */}
        <View style={styles.requestsSegmentRow}>
          {tabs.map((tab) => {
            const active = activeTab === tab.key;
            return (
              <Pressable
                key={tab.key}
                style={[
                  styles.requestsSegmentTab,
                  active
                    ? styles.requestsSegmentTabActive
                    : styles.requestsSegmentTabInactive,
                ]}
                onPress={() => setActiveTab(tab.key as any)}
              >
                <Text
                  style={[
                    styles.requestsSegmentText,
                    active && styles.requestsSegmentTextActive,
                  ]}
                >
                  {tab.label}
                </Text>
              </Pressable>
            );
          })}
        </View>

        {/* CONTENT */}
        {isRequests ? (
          <RequestsTab
            styles={styles}
            palette={palette}
            requests={requests}
          user={user as Manager | Employee}
          assignments={assignments}
          onAccept={acceptRequest}
          onReject={rejectRequest}
          onAcceptAssignment={acceptAssignment}
          onRejectAssignment={declineAssignment}
        />
        ) : isChats ? (
          <ChatsTab styles={styles} palette={palette} />
        ) : (
          <SearchTab
            styles={styles}
            palette={palette}
            isManager={isManager}
            employeeSearch={employeeSearch}
            setEmployeeSearch={setEmployeeSearch}
            unassigned={unassigned}
            pendingRequests={pendingRequests}
            onRequest={(employeeId) => {
              setSelectedEmployeeId(employeeId);
              setRequestMessage("");
              setRequestModalVisible(true);
            }}
          />
        )}
      </View>

      <Modal
        transparent
        visible={requestModalVisible}
        animationType="fade"
        onRequestClose={() => setRequestModalVisible(false)}
      >
        <View style={styles.modalBackdrop}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Nachricht an Mitarbeiter</Text>
            <Text style={[styles.text, { marginBottom: 8 }]}>
              Optional: Füge eine Nachricht hinzu, die mit der Anfrage gesendet wird.
            </Text>
            <TextInput
              style={[styles.input, styles.modalInput]}
              value={requestMessage}
              onChangeText={setRequestMessage}
              placeholder="Deine Nachricht..."
              placeholderTextColor={palette.secondary}
              multiline
            />
            <View style={styles.modalActionsRow}>
              <Pressable
                style={[styles.searchActionButton, styles.modalCancelButton]}
                onPress={() => setRequestModalVisible(false)}
              >
                <Text style={styles.requestsActionText}>Abbrechen</Text>
              </Pressable>
              <Pressable
                style={[styles.searchActionButton, styles.modalConfirmButton]}
                onPress={async () => {
                  if (!selectedEmployeeId) return;
                  await sendRequest(selectedEmployeeId, requestMessage.trim());
                  setRequestModalVisible(false);
                }}
              >
                <Text style={[styles.requestsActionText, { color: "#fff" }]}>
                  Senden
                </Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </ScreenController>
  );
}

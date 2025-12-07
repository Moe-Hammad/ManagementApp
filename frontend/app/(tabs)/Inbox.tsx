import ScreenController from "@/src/components/core/ScreenController";
import { useInboxTabs } from "@/src/screens/Inbox/hooks/useInboxTabs";
import { useRequests } from "@/src/screens/Inbox/hooks/useRequest";
import { useAssignments } from "@/src/screens/Inbox/hooks/useAssignments";
import ChatsTab from "@/src/screens/Inbox/Tabs/ChatsTab";
import RequestsTab from "@/src/screens/Inbox/Tabs/RequestsTab";
import SearchTab from "@/src/screens/Inbox/Tabs/SearchTab";
import { Employee, Manager } from "@/src/types/resources";
import { Pressable, Text, View } from "react-native";

export default function InboxScreen() {
  const { requestsState, actions } = useRequests();
  const { assignments } = useAssignments();
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
  } = requestsState;

  const { setEmployeeSearch, sendRequest, acceptRequest, rejectRequest } =
    actions;

  const isChats = activeTab === "chats";
  const isRequests = activeTab === "requests";
  const isSearch = activeTab === "search";

  return (
    <ScreenController scroll={false}>
      <View style={[styles.screen, styles.requestsContainer]}>
        {/* HEADER */}
        <Text style={[styles.titles, styles.requestsTitle]}>Inbox</Text>

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
            onRequest={sendRequest}
          />
        )}
      </View>
    </ScreenController>
  );
}

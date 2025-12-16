import ScreenController from "@/src/components/core/ScreenController";
import { View } from "react-native";
import ChatList from "../chat/ChatList";
import ChatView from "../chat/ChatView";
import EmployeePicker from "../components/EmployeePicker";
import { useChat } from "../hooks/useChat";
import { useEmployeePicker } from "../hooks/useEmployeePicker";
import { useInboxTabs } from "../hooks/useInboxTabs";
import { useRequests } from "../hooks/useRequest";
import RequestsTab from "../Tabs/RequestsTab";
import SearchTab from "../Tabs/SearchTab";
import Tabs from "../Tabs/Tabs";
import RequestsInfo from "./RequestsInfo";

export default function RequestsScreen() {
  const { activeTab, setActiveTab, tabs } = useInboxTabs();
  const { chatState, actions: chatActions } = useChat();
  const { requestsState, actions: requestActions } = useRequests();
  const picker = useEmployeePicker(chatActions);
  const { styles, palette } = requestsState;
  const userId = requestsState.user?.id || "";

  return (
    <ScreenController scroll={false}>
      <View style={styles.requestsContainer}>
        <RequestsInfo
          wsRequestsStatus={requestsState.wsStatus}
          styles={styles}
        />

        <Tabs
          activeTab={activeTab}
          tabs={tabs}
          onChange={(key) => setActiveTab(key as any)}
        />

        {activeTab === "requests" && (
          <RequestsTab
            styles={styles}
            palette={palette}
            assignments={requestsState.assignments}
            requests={requestsState.requests}
            user={requestsState.user as any}
            onAccept={(id) => requestActions.acceptRequest(id)}
            onReject={(id) => requestActions.rejectRequest(id)}
          />
        )}

        {activeTab === "chats" &&
          (chatState.selectedChat ? (
            <ChatView
              chat={chatState.selectedChat}
              messages={chatState.selectedMessages}
              palette={chatState.palette}
              styles={chatState.styles}
              userId={userId}
              onBack={chatActions.clearSelection}
              onSend={chatActions.sendMessage}
              loading={chatState.isLoadingMessages}
              sending={chatState.sendingMessage}
            />
          ) : (
            <ChatList
              chats={chatState.filteredRooms}
              currentUserId={userId}
              onOpenChat={(room) => chatActions.selectChat(room.id)}
              styles={chatState.styles}
              palette={chatState.palette}
            />
          ))}

        {activeTab === "search" && (
          <SearchTab
            styles={requestsState.styles}
            palette={requestsState.palette}
            isManager={requestsState.isManager}
            employeeSearch={requestsState.employeeSearch}
            setEmployeeSearch={requestActions.setEmployeeSearch}
            unassigned={requestsState.unassigned}
            pendingRequests={requestsState.requests}
            onRequest={requestActions.sendRequest}
          />
        )}

        {picker.visible && (
          <EmployeePicker
            visible={picker.visible}
            employees={picker.options}
            onClose={picker.close}
            styles={styles}
          />
        )}
      </View>
    </ScreenController>
  );
}

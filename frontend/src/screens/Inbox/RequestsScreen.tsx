import { View } from "react-native";

export default function RequestsScreen() {
  const { activeTab, setActiveTab, tabs } = useInboxTabs();
  const { chatState, actions: chatActions } = useChat();
  const { requestsState, actions: requestActions } = useRequests();
  const picker = useEmployeePicker(chatActions);

  return (
    <ScreenController scroll={false}>
      <View style={{ padding: 12 }}>
        <RequestsInfo wsStatus={requestsState.wsStatus} />

        <Tabs activeTab={activeTab} tabs={tabs} onChange={setActiveTab} />

        {activeTab === "requests" && (
          <RequestsTab
            styles={requestsState.styles}
            wsStatus={requestsState.wsStatus}
          />
        )}

        {activeTab === "chats" &&
          (chatState.selectedChat ? (
            <ChatView
              chat={chatState.selectedChat}
              messages={chatState.selectedMessages}
              palette={chatState.palette}
              onBack={chatActions.clearSelection}
              onSend={chatActions.sendMessage}
              loading={chatState.isLoadingMessages}
              sending={chatState.sendingMessage}
            />
          ) : (
            <ChatList
              rooms={chatState.filteredRooms}
              onSelect={chatActions.selectChat}
              onStartChat={picker.open}
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
            employees={picker.options}
            onPick={picker.pick}
            onClose={picker.close}
          />
        )}
      </View>
    </ScreenController>
  );
}

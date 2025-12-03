import { Platform, StyleSheet } from "react-native";
import { DarkColors, LightColors } from "./colors";

export const makeStyles = (isDark: boolean) => {
  const C = isDark ? DarkColors : LightColors;
  const shadow = (
    color: string,
    offsetY: number,
    radius: number,
    opacity: number
  ) =>
    Platform.select({
      web: { boxShadow: `0 ${offsetY}px ${radius}px ${color}` },
      default: {
        shadowColor: color,
        shadowOpacity: opacity,
        shadowRadius: radius,
        shadowOffset: { width: 0, height: offsetY },
      },
    });

  return StyleSheet.create({
    screen: {
      flex: 1,
      padding: 20,
      backgroundColor: C.screenbackground,
    },
    roleButton: {
      flex: 1,
      paddingVertical: 12,
      borderRadius: 10,
      borderWidth: 1,
      marginRight: 8,
      alignItems: "center",
    },

    roleButtonActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },

    roleButtonInactive: {
      backgroundColor: "transparent",
      borderColor: C.text,
    },

    viewButtonRow: {
      flexDirection: "row",
      marginBottom: 16,
    },

    roleButtonTextActive: {
      color: "#fff",
      fontWeight: 700,
      borderBlockColor: "#000",
    },

    roleButtonTextInactive: {
      color: C.text,
    },

    title: {
      fontSize: 28,
      fontWeight: "700",
      color: C.text,
      marginBottom: 20,
    },

    label: {
      color: C.text,
      marginBottom: 6,
      fontSize: 20,
    },

    link: {
      color: C.primary,
      fontSize: 15,
      fontWeight: "600",
      letterSpacing: 0.3,
      textDecorationLine: "underline",
      textDecorationColor: C.primary,
      textDecorationStyle: "solid",
      paddingVertical: 4,
    },

    text: {
      color: C.text,
    },

    titles: {
      color: C.text,
      fontWeight: "700",
      fontSize: 28,
    },

    card: {
      elevation: isDark ? 8 : 4,
      borderRadius: 20,
      padding: 24,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      ...shadow(C.shadow, 6, 12, 0.3),
      backdropFilter: "blur(20px)", // iOS
    },

    button: {
      backgroundColor: C.primary,
      paddingVertical: 16,
      borderRadius: 12,
      ...shadow(C.primary, 4, 10, 0.5),
    },

    cardWrapper: {
      width: "100%",
      maxWidth: "auto",
      backgroundColor: C.card,
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      ...shadow(C.shadow, 8, 16, 0.3),
    },

    input: {
      backgroundColor: C.surface,
      paddingVertical: 14,
      paddingHorizontal: 16,
      borderRadius: 12,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ccc",
      color: C.text,
      marginBottom: 16,
    },

    buttonText: {
      color: "#FFF",
      textAlign: "center",
      fontWeight: "bold",
      fontSize: 16,
    },

    error: {
      color: "red",
      marginBottom: 12,
      marginTop: 10,
    },

    errorInput: {
      borderColor: "red",
    },
    errorUnderText: {
      color: "red",
      marginBottom: 10,
    },
    section: {
      width: "100%",
      marginBottom: 24,
    },

    row: {
      flexDirection: "row",
      justifyContent: "space-between",
      gap: 16,
    },

    col: {
      flex: 1,
    },

    widget: {
      backgroundColor: C.glass,
      borderRadius: 18,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
      ...shadow(C.shadow, 4, 10, 0.2),
      width: "100%",
    },

    widgetTitle: {
      color: C.text,
      fontSize: 18,
      fontWeight: "700",
      marginBottom: 12,
    },

    widgetValue: {
      color: C.primary,
      fontSize: 32,
      fontWeight: "800",
    },

    centerWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: C.screenbackground,
    },

    // Requests/Chats screen
    requestsContainer: {
      paddingTop: 12,
    },
    requestsTitle: {
      marginBottom: 4,
    },
    requestsSubtitle: {
      color: C.secondary,
      marginBottom: 20,
    },
    requestsSegmentRow: {
      flexDirection: "row",
      gap: 8,
    },
    requestsSegmentTab: {
      flex: 1,
      paddingVertical: 10,
      alignItems: "center",
      borderRadius: 12,
      borderWidth: 1,
    },
    requestsSegmentTabActive: {
      backgroundColor: C.primary,
      borderColor: C.primary,
    },
    requestsSegmentTabInactive: {
      backgroundColor: C.surface,
      borderColor: C.border,
    },
    requestsSegmentText: {
      color: C.text,
      fontWeight: "500",
    },
    requestsSegmentTextActive: {
      color: "#fff",
      fontWeight: "700",
    },
    requestsBodyCard: {
      marginTop: 16,
      gap: 8,
    },
    requestsNote: {
      opacity: 0.7,
    },
    requestsBadgeRow: {
      flexDirection: "row",
      alignItems: "center",
      gap: 8,
    },
    requestsBadge: {
      width: 10,
      height: 10,
      borderRadius: 5,
      backgroundColor: "red",
    },
    requestsHeaderRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    requestsActionButton: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    requestsActionText: {
      color: C.text,
      fontWeight: "600",
      letterSpacing: 0.3,
    },
    requestsRoomItem: {
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    searchResultRow: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      paddingVertical: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },
    searchResultsContainer: {
      maxHeight: 320,
      width: "100%",
    },
    searchActionButton: {
      paddingHorizontal: 10,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    chatFullScreenContainer: {
      flex: 1,
      width: "100%",
      padding: 0,
      backgroundColor: C.screenbackground, // oder C.background
    },

    chatHeader: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      paddingHorizontal: 12,
      paddingVertical: 16,
      borderBottomWidth: 1,
      borderColor: C.border,
    },

    chatMessagesContainer: {
      flex: 1,
      paddingHorizontal: 16,
    },

    chatMessageBubble: {
      padding: 12,
      borderRadius: 12,
      marginBottom: 10,
      maxWidth: "80%",
    },

    chatMessageMine: {
      alignSelf: "flex-end",
      backgroundColor: C.primary,
    },

    chatMessageTheirs: {
      alignSelf: "flex-start",
      backgroundColor: C.surface,
    },

    chatTimestamp: {
      fontSize: 11,
      opacity: 0.6,
      marginTop: 4,
    },
    chatInputContainer: {
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      paddingVertical: 10,
      borderTopWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },

    chatInputField: {
      flex: 1,
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderRadius: 25,
      backgroundColor: C.card,
      borderWidth: 1,
      borderColor: C.border,
      color: C.text,
      marginRight: 10,
    },

    chatSendButton: {
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: C.primary,
      borderRadius: 25,
    },

    chatSendText: {
      color: "#fff",
      fontWeight: "700",
    },
    // ==== Employee Picker ======================================================
    employeePickerOverlay: {
      position: "absolute",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: "rgba(0,0,0,0.6)",
      justifyContent: "center",
      alignItems: "center",
      padding: 16,
      zIndex: 999,
    },

    employeePickerCard: {
      width: "100%",
      maxHeight: "70%",
      backgroundColor: C.surface,
      borderRadius: 16,
      padding: 20,
      borderWidth: 1,
      borderColor: C.border,
    },

    employeePickerList: {
      marginTop: 10,
      maxHeight: 300,
    },

    employeePickerItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },

    employeePickerCancel: {
      marginTop: 16,
      alignSelf: "flex-end",
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      borderWidth: 1,
      borderColor: C.border,
      backgroundColor: C.surface,
    },
    requestItem: {
      paddingVertical: 12,
      paddingHorizontal: 16,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },

    requestInfo: {
      flexDirection: "column",
      flex: 1,
    },

    requestActions: {
      flexDirection: "row",
      gap: 10,
    },

    requestActionApprove: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: C.success,
    },

    requestActionReject: {
      paddingHorizontal: 12,
      paddingVertical: 8,
      borderRadius: 10,
      backgroundColor: C.danger,
    },

    requestActionText: {
      color: "#fff",
      fontWeight: "700",
    },
    chatHeaderContainer: {
      height: 60,
      flexDirection: "row",
      alignItems: "center",
      paddingHorizontal: 12,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
      backgroundColor: C.background,
    },

    chatHeaderBackButton: {
      padding: 8,
      marginRight: 8,
    },

    chatHeaderBackIcon: {
      fontSize: 22,
      color: C.primary,
    },

    chatHeaderCenter: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
    },

    chatHeaderTitle: {
      fontSize: 17,
      fontWeight: "700",
      color: C.text,
    },

    chatHeaderSubtitle: {
      fontSize: 13,
      color: C.secondary,
    },

    chatHeaderRight: {
      width: 32,
      height: 32,
    },
    messageRow: {
      paddingHorizontal: 10,
      marginVertical: 6,
      flexDirection: "row",
    },

    messageRowLeft: {
      justifyContent: "flex-start",
    },

    messageRowRight: {
      justifyContent: "flex-end",
    },

    messageBubble: {
      maxWidth: "80%",
      borderRadius: 12,
      padding: 10,
    },

    messageBubbleOwn: {
      backgroundColor: C.primary,
      borderTopRightRadius: 0,
    },

    messageBubbleOther: {
      backgroundColor: C.card,
      borderTopLeftRadius: 0,
    },

    messageSender: {
      color: C.secondary,
      fontSize: 12,
      marginBottom: 3,
      fontWeight: "600",
    },

    messageText: {
      color: C.text,
      fontSize: 15,
    },

    messageTime: {
      color: C.secondary,
      fontSize: 10,
      marginTop: 5,
      alignSelf: "flex-end",
    },
    chatListItem: {
      paddingVertical: 12,
      paddingHorizontal: 10,
      borderBottomWidth: 1,
      borderBottomColor: C.border,
    },

    chatListTextContainer: {
      flexDirection: "column",
    },

    chatListTitle: {
      fontSize: 16,
      fontWeight: "700",
      color: C.text,
    },

    chatListSubtitle: {
      fontSize: 13,
      color: C.secondary,
      marginTop: 2,
    },
  });
};

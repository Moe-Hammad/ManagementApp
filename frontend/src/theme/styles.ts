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
  });
};

import { StyleSheet } from "react-native";
import { DarkColors, LightColors } from "./colors";

export const makeStyles = (isDark: boolean) => {
  const C = isDark ? DarkColors : LightColors;

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

    card: {
      elevation: isDark ? 8 : 4,
      borderRadius: 20,
      padding: 24,
      backgroundColor: C.glass,
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 12,
      shadowOffset: { width: 0, height: 6 },
      backdropFilter: "blur(20px)", // iOS
    },

    button: {
      backgroundColor: C.primary,
      paddingVertical: 16,
      borderRadius: 12,
      shadowColor: C.primary,
      shadowOpacity: 0.5,
      shadowRadius: 10,
      shadowOffset: { width: 0, height: 4 },
    },

    cardWrapper: {
      width: "100%",
      maxWidth: "auto",
      backgroundColor: C.card,
      padding: 24,
      borderRadius: 20,
      borderWidth: 1,
      borderColor: C.border,
      shadowColor: C.shadow,
      shadowOpacity: 0.3,
      shadowRadius: 16,
      shadowOffset: { width: 0, height: 8 },
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

    centerWrapper: {
      flex: 1,
      justifyContent: "center",
      alignItems: "center",
      paddingHorizontal: 24,
      backgroundColor: C.screenbackground,
    },
  });
};

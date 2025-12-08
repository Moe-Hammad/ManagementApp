import ScreenController from "@/src/components/core/ScreenController";
import { useAppDispatch } from "@/src/hooks/useRedux";
import { clearAssignments } from "@/src/redux/assignmentSlice";
import { clearToken } from "@/src/redux/authSlice";
import { clearChatState } from "@/src/redux/chatSlice";
import { clearRequests } from "@/src/redux/requestSlice";
import { clearUsers } from "@/src/redux/userSlice";
import Dashboard from "@/src/screens/Inbox/components/dashboard";
import { disconnectWebSocket } from "@/src/services/wsClient";
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { Pressable, Text, View } from "react-native";

export default function LandingPage() {
  const { isDark, toggleTheme } = useThemeMode();
  const styles = makeStyles(isDark);
  const dispatch = useAppDispatch();

  async function handleLogout() {
    disconnectWebSocket();
    dispatch(clearAssignments());
    dispatch(clearChatState());
    dispatch(clearRequests());
    dispatch(clearUsers());
    dispatch(clearToken());
  }

  return (
    <ScreenController>
      <View style={{ flex: 1 }}>
        <View style={styles.themeToggleContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Theme wechseln"
            style={styles.themeToggleButton}
            onPress={toggleTheme}
          >
            <Text style={styles.themeToggleIcon}>
              {isDark ? "☀️" : "🌙"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.screen}>
          <Dashboard />
          <Pressable style={styles.button} onPress={handleLogout}>
            <Text style={styles.buttonText}>Logout</Text>
          </Pressable>
        </View>
      </View>
    </ScreenController>
  );
}

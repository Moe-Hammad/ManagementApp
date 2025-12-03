import ScreenController from "@/src/components/core/ScreenController";
import ChatScreen from "@/src/screens/Inbox/chat/ChatScreen";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";

export default function ChatWrapper() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const palette = isDark ? DarkColors : LightColors;

  return (
    <ScreenController>
      <ChatScreen styles={styles} palette={palette} />
    </ScreenController>
  );
}

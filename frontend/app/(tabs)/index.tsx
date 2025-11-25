import Dashboard from "@/src/components/Pages/dashboard";
import ScreenController from "@/src/components/util/ScreenController";
import { useAppDispatch } from "@/src/hooks/useRedux";
import { clearToken } from "@/src/redux/authSlice";
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { Pressable, Text, View } from "react-native";

export default function LandingPage() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const dispatch = useAppDispatch();

  async function handleLogout() {
    dispatch(clearToken());
  }

  return (
    <ScreenController>
      <View style={styles.screen}>
        {/* <WelcomeBox /> */}
        <Dashboard />
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </ScreenController>
  );
}

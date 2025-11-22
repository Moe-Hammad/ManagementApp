import { useAppDispatch } from "@/src/hooks/useRedux";
import { clearToken } from "@/src/redux/authSlice";
import { makeStyles } from "@/src/theme/styles";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { Pressable, Text, View } from "react-native";

export default function Dashboard() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);
  const dispatch = useAppDispatch();

  async function handleLogout() {
    dispatch(clearToken());
  }

  return (
    <View style={styles.centerWrapper}>
      <View style={styles.cardWrapper}>
        <Pressable style={styles.button} onPress={handleLogout}>
          <Text style={styles.buttonText}>Logout</Text>
        </Pressable>
      </View>
    </View>
  );
}

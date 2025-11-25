import { useAppSelector } from "@/src/hooks/useRedux";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { Text, View } from "react-native";
import { makeStyles } from "../../theme/styles";

export default function WelcomeBox() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  const user = useAppSelector((state) => state.auth.user);

  return (
    <View style={{ width: "100%", gap: 20, marginTop: 20 }}>
      <View style={styles.cardWrapper}>
        <Text style={styles.text}>Hallo {user?.firstName || "User"} 👋</Text>
        <Text style={[styles.text, { marginTop: 8, opacity: 0.7 }]}>
          Schön dich wiederzusehen!
        </Text>
      </View>

      <View style={[styles.cardWrapper, { height: 240 }]}>
        <Text style={styles.text}>Hier kannst du später Widgets anzeigen.</Text>
      </View>
    </View>
  );
}

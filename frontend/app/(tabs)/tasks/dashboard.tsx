import { SafeAreaView } from "react-native-safe-area-context";
import { Text, View } from "react-native";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";

export default function TasksDashboardScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <SafeAreaView style={styles.taskHubSafeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>Tasks Dashboard</Text>
        <Text style={[styles.text, { opacity: 0.7, marginTop: 8 }]}>
          Übersichtsseite für Tasks (Inhalt folgt).
        </Text>
      </View>
    </SafeAreaView>
  );
}

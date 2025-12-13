import { useLocalSearchParams } from "expo-router";
import { Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";

export default function TaskDetailsScreen() {
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

  return (
    <SafeAreaView style={styles.taskHubSafeArea}>
      <View style={styles.screen}>
        <Text style={styles.title}>Task {id}</Text>
        <Text style={[styles.text, { opacity: 0.7, marginTop: 8 }]}>
          Detailansicht folgt.
        </Text>
      </View>
    </SafeAreaView>
  );
}

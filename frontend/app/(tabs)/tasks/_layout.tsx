import { Stack } from "expo-router";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";

export default function TasksLayout() {
  const { isDark } = useThemeMode();
  const palette = isDark ? DarkColors : LightColors;

  return (
    <Stack
      screenOptions={{
        headerStyle: { backgroundColor: palette.surface },
        headerTintColor: palette.text,
        headerTitleStyle: { color: palette.text },
        headerShadowVisible: false,
        contentStyle: { backgroundColor: palette.screenbackground },
      }}
    >
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen name="[id]" options={{ title: "Task" }} />
      <Stack.Screen name="create" options={{ title: "Task erstellen" }} />
      <Stack.Screen name="dashboard" options={{ title: "Dashboard" }} />
    </Stack>
  );
}

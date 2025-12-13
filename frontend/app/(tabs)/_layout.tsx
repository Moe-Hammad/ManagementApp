import { useAppSelector } from "@/src/hooks/useRedux";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { UserRole } from "@/src/types/resources";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Href, Tabs, useRouter } from "expo-router";

export default function TabsLayout() {
  const router = useRouter();
  const { isDark } = useThemeMode();
  const colors = isDark ? DarkColors : LightColors;
  const role =
    useAppSelector((s) => s.auth.user?.role) ||
    useAppSelector((s) => s.auth.token?.userType);
  const showManagerTab = role === UserRole.MANAGER;

  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarStyle: { backgroundColor: colors.surface },
        tabBarActiveTintColor: colors.primary,
        tabBarInactiveTintColor: colors.secondary,
      }}
    >
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="tasks"
        options={{
          title: "Tasks",
          tabBarIcon: ({ color }) =>
            showManagerTab ? (
              <MaterialCommunityIcons name="clipboard-text" size={26} color={color} />
            ) : null,
          tabBarItemStyle: showManagerTab ? undefined : { display: "none" },
          tabBarLabelStyle: showManagerTab ? undefined : { display: "none" },
        }}
      />

      <Tabs.Screen
        name="index"
        options={{
          title: "Dashboard",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="home" size={26} color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="Inbox"
        options={{
          title: "Inbox",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="message-text"
              size={26}
              color={color}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons
              name="account-cog-outline"
              size={26}
              color={color}
            />
          ),
        }}
        listeners={{
          tabPress: (e) => {
            e.preventDefault();
            router.navigate("/settings" as Href);
          },
        }}
      />
    </Tabs>
  );
}

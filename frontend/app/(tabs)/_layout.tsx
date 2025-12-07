import { useAppSelector } from "@/src/hooks/useRedux";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { UserRole } from "@/src/types/resources";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { Tabs } from "expo-router";
import React from "react";

export default function TabsLayout() {
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
          title: "Kalender",
          tabBarIcon: ({ color }) => (
            <MaterialCommunityIcons name="calendar" size={26} color={color} />
          ),
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
        name="taskhub"
        options={{
          title: "Task",
          tabBarIcon: ({ color }) =>
            showManagerTab ? (
              <MaterialCommunityIcons name="plus-box" size={26} color={color} />
            ) : null,
          tabBarItemStyle: showManagerTab ? undefined : { display: "none" },
          tabBarLabelStyle: showManagerTab ? undefined : { display: "none" },
        }}
      />
    </Tabs>
  );
}

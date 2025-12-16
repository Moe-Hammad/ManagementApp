import ScreenController from "@/src/components/core/ScreenController";
import { useAppDispatch, useAppSelector } from "@/src/hooks/useRedux";
import { clearToken } from "@/src/redux/authSlice";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { useRouter } from "expo-router";
import { Switch, Text, TouchableOpacity, View } from "react-native";

export default function SettingsIndex() {
  const { isDark, toggleTheme } = useThemeMode();
  const styles = makeStyles(isDark);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);

  const handleLogout = () => {
    dispatch(clearToken());
  };

  return (
    <ScreenController>
      <View style={styles.screen}>
        <View style={styles.section}>
          <Text style={styles.titles}>Settings</Text>
          <Text style={[styles.text, styles.settingsMeta]}>
            Eingeloggt als {user ? `${user.firstName} ${user.lastName}` : "-"}
          </Text>
        </View>

        <TouchableOpacity
          style={[styles.widget, styles.widgetSpacingXs]}
          onPress={() => router.push("/(tabs)/settings/account")}
        >
          <Text style={styles.widgetTitle}>Konto</Text>
          <Text style={[styles.text, styles.settingsMeta]}>Profildaten ansehen</Text>
        </TouchableOpacity>

        <View style={[styles.widget, styles.widgetSpacingSm]}>
          <Text style={styles.widgetTitle}>Darstellung</Text>
          <View style={styles.rowBetween}>
            <Text style={styles.text}>
              {isDark ? "Dark Mode" : "Light Mode"}
            </Text>
            <Switch value={isDark} onValueChange={toggleTheme} />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleLogout}
          style={[styles.widget, styles.widgetSpacingMd, styles.dangerWidget]}
        >
          <Text style={[styles.widgetTitle, styles.dangerWidgetTitle]}>
            Logout
          </Text>
          <Text style={[styles.text, styles.dangerWidgetText]}>
            Session beenden und zum Login
          </Text>
        </TouchableOpacity>
      </View>
    </ScreenController>
  );
}

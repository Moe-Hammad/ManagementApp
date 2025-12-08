import ScreenController from "@/src/components/core/ScreenController";
import Spinner from "@/src/components/core/Spinner";
import { useAppDispatch } from "@/src/hooks/useRedux";
import { setCredentials } from "@/src/redux/authSlice";
import { fetchCurrentUser } from "@/src/redux/fetchCurrentUser";
import { login } from "@/src/services/api";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { DarkColors, LightColors } from "@/src/theme/colors";
import { makeStyles } from "@/src/theme/styles";
import { LoginResponse } from "@/src/types/resources";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const { isDark, toggleTheme } = useThemeMode();
  const styles = makeStyles(isDark);
  // Palette for placeholder visibility on Android dark mode
  const palette = isDark ? DarkColors : LightColors;

  const dispatch = useAppDispatch();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loginResponse, setLoginResponse] = useState<LoginResponse | null>(
    null
  );
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (loginResponse) {
      setLoading(false);
    }
  }, [loginResponse]);

  async function handleLogin() {
    setError(null);
    setLoading(true);

    try {
      const loginRes = await login(email, password);
      dispatch(setCredentials(loginRes));
      const action = await dispatch(fetchCurrentUser(loginRes.token));
      if (action.meta.requestStatus === "rejected") {
        setError("Konnte User nicht laden");
        return;
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleRegister() {
    return router.push("/(auth)/register");
  }

  return (
    <ScreenController scroll={true}>
      <View style={{ flex: 1 }}>
        <View style={styles.themeToggleContainer}>
          <Pressable
            accessibilityRole="button"
            accessibilityLabel="Theme wechseln"
            style={styles.themeToggleButton}
            onPress={toggleTheme}
          >
            <Text style={styles.themeToggleIcon}>
              {isDark ? "☀️" : "🌙"}
            </Text>
          </Pressable>
        </View>
        <View style={styles.centerWrapper}>
          <View style={styles.cardWrapper}>
            <Text style={styles.title}> Willkommen </Text>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              placeholder="myemail@mail.com"
              placeholderTextColor={palette.secondary}
            />
            <Text style={styles.label}>Passwort</Text>
            <TextInput
              style={styles.input}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
              placeholder="Password"
              placeholderTextColor={palette.secondary}
            />

            {error && <Text style={styles.error}>{error}</Text>}
            {loading ? (
              <Spinner />
            ) : (
              <Pressable style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText}>Login</Text>
              </Pressable>
            )}
            <Pressable
              onPress={handleRegister}
              style={{ alignSelf: "center", marginTop: 14 }}
            >
              <Text style={styles.link}>
                Noch kein Konto? Jetzt registrieren.
              </Text>
            </Pressable>
          </View>
        </View>
      </View>
    </ScreenController>
  );
}

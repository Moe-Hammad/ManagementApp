import ScreenController from "@/src/components/util/ScreenController";
import Spinner from "@/src/components/util/Spinner";
import { useAppDispatch } from "@/src/hooks/useRedux";
import { setCredentials } from "@/src/redux/authSlice";
import { login } from "@/src/services/api";
import { fetchCurrentUser } from "@/src/services/thunks/fetchCurrentUser";
import { useThemeMode } from "@/src/theme/ThemeProvider";
import { makeStyles } from "@/src/theme/styles";
import { LoginResponse } from "@/src/types/resources";
import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, Text, TextInput, View } from "react-native";

export default function LoginScreen() {
  const { isDark } = useThemeMode();
  const styles = makeStyles(isDark);

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
      await dispatch(fetchCurrentUser(loginRes.token));
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
          />
          <Text style={styles.label}>Passwort</Text>
          <TextInput
            style={styles.input}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
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
    </ScreenController>
  );
}
